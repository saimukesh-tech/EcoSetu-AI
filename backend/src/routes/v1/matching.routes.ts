import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { matchPartnerSchema } from '../../schemas/matching.schema';
import { recommendPartnersHandler } from '../../controllers/matching.controller';

const router = Router();

router.post(
  '/recommend',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  validateBody(matchPartnerSchema),
  recommendPartnersHandler
);

export default router;
