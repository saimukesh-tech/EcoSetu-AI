import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { enforceIdempotency } from '../../middleware/idempotency';
import { createPickupSchema, updatePickupStatusSchema } from '../../schemas/pickup.schema';
import {
  createPickupHandler,
  updatePickupStatusHandler,
  getPickupAuditTrailHandler
} from '../../controllers/pickup.controller';

const router = Router();

router.post(
  '/',
  authenticateUser,
  requireRole(['ORGANIZER', 'ADMIN']),
  enforceIdempotency,
  validateBody(createPickupSchema),
  createPickupHandler
);

router.post(
  '/status/validate',
  authenticateUser,
  requireRole(['RECOVERY_PARTNER', 'ADMIN']),
  validateBody(updatePickupStatusSchema),
  updatePickupStatusHandler
);

router.get(
  '/:pickupId/audit',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  getPickupAuditTrailHandler
);

export default router;
