import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { calculateImpactSchema } from '../../schemas/impact.schema';
import { calculateImpactHandler } from '../../controllers/impact.controller';

const router = Router();

router.post(
  '/calculate',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  validateBody(calculateImpactSchema),
  calculateImpactHandler
);

export default router;
