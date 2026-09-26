import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { matchPartnerSchema, registerPartnerSchema, verifyPartnerSchema } from '../../schemas/matching.schema';
import {
  recommendPartnersHandler,
  registerPartnerHandler,
  verifyPartnerHandler,
  listPartnersHandler
} from '../../controllers/matching.controller';

const router = Router();

router.post(
  '/recommend',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  validateBody(matchPartnerSchema),
  recommendPartnersHandler
);

router.post(
  '/partners/register',
  authenticateUser,
  requireRole(['RECOVERY_PARTNER', 'ADMIN']),
  validateBody(registerPartnerSchema),
  registerPartnerHandler
);

router.get(
  '/partners',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  listPartnersHandler
);

router.put(
  '/partners/:partnerId/verify',
  authenticateUser,
  requireRole(['ADMIN']),
  validateBody(verifyPartnerSchema),
  verifyPartnerHandler
);

export default router;
