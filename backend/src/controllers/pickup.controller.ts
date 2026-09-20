import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreatePickupInput, UpdatePickupStatusInput } from '../schemas/pickup.schema';
import { transitionPickupStatus, getPickupState, getPickupAuditTrail } from '../services/pickupStateMachine';
import { recordAuditLog } from '../services/auditLogger';

export async function createPickupHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input: CreatePickupInput = req.body;
    const pickupId = `pkp_${Date.now()}`;

    const initialRecord = transitionPickupStatus(
      pickupId,
      'PENDING',
      req.user?.uid || 'user_123',
      'Pickup request created'
    );

    recordAuditLog({
      actorId: req.user?.uid || 'user_123',
      actorRole: req.user?.role || 'ORGANIZER',
      action: 'CREATE_PICKUP',
      resourceType: 'PICKUP',
      resourceId: pickupId,
      metadata: { eventId: input.eventId, partnerId: input.partnerId }
    });

    return res.status(201).json({
      success: true,
      pickup: {
        id: pickupId,
        ...input,
        status: initialRecord.currentStatus,
        createdAt: initialRecord.updatedAt
      },
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePickupStatusHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input: UpdatePickupStatusInput = req.body;

    const updatedRecord = transitionPickupStatus(
      input.pickupId,
      input.targetStatus,
      req.user?.uid || 'user_123',
      input.reason
    );

    return res.json({
      success: true,
      pickup: updatedRecord,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function getPickupAuditTrailHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const pickupId = (req.params.pickupId as string) || '';
    const currentState = getPickupState(pickupId);
    const auditTrail = getPickupAuditTrail(pickupId);

    return res.json({
      success: true,
      pickupId,
      currentState,
      auditTrail,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
