import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { predictWasteSchema } from '../../schemas/waste.schema';
import { predictWasteHandler } from '../../controllers/waste.controller';

const router = Router();

router.post(
  '/predict',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  validateBody(predictWasteSchema),
  predictWasteHandler
);

export default router;
