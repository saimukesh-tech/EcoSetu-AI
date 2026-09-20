import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateEnvironmentalImpact } from '../services/impactCalculator';

export async function calculateImpactHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { totalWasteDivertedKg, foodWasteDivertedKg, plasticDivertedKg, paperDivertedKg, status } = req.body;

    const report = calculateEnvironmentalImpact({
      totalWasteDivertedKg: Number(totalWasteDivertedKg) || 0,
      foodWasteDivertedKg: foodWasteDivertedKg ? Number(foodWasteDivertedKg) : undefined,
      plasticDivertedKg: plasticDivertedKg ? Number(plasticDivertedKg) : undefined,
      paperDivertedKg: paperDivertedKg ? Number(paperDivertedKg) : undefined,
      status: status || 'ESTIMATED'
    });

    return res.json({
      success: true,
      impact: report,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
