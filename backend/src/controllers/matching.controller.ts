import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MatchPartnerInput, RegisterPartnerInput, VerifyPartnerInput } from '../schemas/matching.schema';
import { recommendPartners, registerPartner, verifyPartner, getRegisteredPartners } from '../services/matchingEngine';

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

export async function registerPartnerHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input: RegisterPartnerInput = req.body;
    const uid = req.user?.uid || `partner_${Date.now()}`;

    const newPartner = registerPartner(uid, input);

    return res.status(201).json({
      success: true,
      partner: newPartner,
      message: 'Partner registration submitted successfully. Pending administrator verification.',
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPartnerHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const partnerIdParam = req.params.partnerId;
    const partnerId = Array.isArray(partnerIdParam) ? partnerIdParam[0] : partnerIdParam;
    const input: VerifyPartnerInput = req.body;

    const updatedPartner = verifyPartner(partnerId, input.status);

    if (!updatedPartner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Partner '${partnerId}' not found.` },
        requestId: req.requestId
      });
    }

    return res.json({
      success: true,
      partner: updatedPartner,
      message: `Partner status updated to ${input.status}.`,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function listPartnersHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const isUserAdmin = req.user?.role === 'ADMIN';
    const partners = getRegisteredPartners(!isUserAdmin);

    return res.json({
      success: true,
      count: partners.length,
      partners,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
