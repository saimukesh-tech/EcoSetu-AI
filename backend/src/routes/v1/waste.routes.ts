import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { predictWasteSchema, createEventSchema, recordActualWasteSchema } from '../../schemas/waste.schema';
import {
  predictWasteHandler,
  createEventHandler,
  recordActualWasteHandler
} from '../../controllers/waste.controller';

const router = Router();

router.post(
  '/predict',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  validateBody(predictWasteSchema),
  predictWasteHandler
);

router.post(
  '/events',
  authenticateUser,
  requireRole(['ORGANIZER', 'ADMIN']),
  validateBody(createEventSchema),
  createEventHandler
);

router.post(
  '/events/:eventId/actual',
  authenticateUser,
  requireRole(['ORGANIZER', 'ADMIN']),
  validateBody(recordActualWasteSchema),
  recordActualWasteHandler
);

export default router;
