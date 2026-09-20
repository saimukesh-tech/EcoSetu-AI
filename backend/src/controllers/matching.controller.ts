import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MatchPartnerInput } from '../schemas/matching.schema';
import { recommendPartners } from '../services/matchingEngine';

export async function recommendPartnersHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input: MatchPartnerInput = req.body;

    const matches = recommendPartners({
      eventId: input.eventId,
      locationName: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
      wasteTypes: input.wasteTypes,
      requestedQuantityKg: input.requestedQuantityKg,
      serviceRadiusKm: input.serviceRadiusKm
    });

    return res.json({
      success: true,
      count: matches.length,
      recommendations: matches,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
