import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PredictWasteInput } from '../schemas/waste.schema';

export async function predictWasteHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input: PredictWasteInput = req.body;
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

    // Call Python FastAPI ML Microservice with 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const mlResponse = await fetch(`${mlServiceUrl}/api/ml/event-waste/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: input.event_type,
          guestCount: input.guest_count,
          durationHours: input.duration,
          foodType: input.food_type,
          cateringType: input.catering_type,
          location: input.location
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (mlResponse.ok) {
        const mlData: any = await mlResponse.json();
        return res.json({
          success: true,
          ...mlData,
          requestId: req.requestId
        });
      }

      console.warn(JSON.stringify({
        type: 'ML_SERVICE_HTTP_FAIL',
        statusCode: mlResponse.status,
        requestId: req.requestId
      }));
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn(JSON.stringify({
        type: 'ML_SERVICE_UNAVAILABLE',
        error: error.name === 'AbortError' ? 'ML_TIMEOUT' : error.message,
        requestId: req.requestId
      }));
    }

    // Controlled Heuristic Fallback (Accurate Metadata & Unmisleading ML Metrics)
    const baseMultiplier = input.guest_count * (input.duration / 4);
    const totalWasteKg = Math.round(baseMultiplier * 0.85 * 100) / 100;
    const foodWasteKg = Math.round(totalWasteKg * 0.45 * 100) / 100;
    const recoverableWasteKg = Math.round(totalWasteKg * 0.75 * 100) / 100;

    return res.json({
      success: true,
      total_waste_kg: totalWasteKg,
      food_waste_kg: foodWasteKg,
      recoverable_waste_kg: recoverableWasteKg,
      prediction: {
        valueKg: totalWasteKg,
        lowerBoundKg: Math.round(totalWasteKg * 0.85),
        upperBoundKg: Math.round(totalWasteKg * 1.15),
        rangeType: 'heuristic_planning_range',
        confidence: null,
        uncertainty: 'HIGH'
      },
      model: {
        name: 'event-waste-heuristic-fallback',
        version: 'v1.0.0',
        algorithm: 'DomainHeuristicRules',
        r2Score: null,
        metrics: null,
        fallback: true
      },
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
