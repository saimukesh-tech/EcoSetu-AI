import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import {
  getDashboardAnalyticsHandler,
  getModelRegistryHandler,
  getModelMonitoringHandler,
  getMlFeedbackHandler
} from '../../controllers/analytics.controller';

const router = Router();

router.get(
  '/dashboard',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  getDashboardAnalyticsHandler
);

router.get(
  '/models',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  getModelRegistryHandler
);

router.get(
  '/monitoring',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  getModelMonitoringHandler
);

router.get(
  '/feedback',
  authenticateUser,
  requireRole(['ORGANIZER', 'RECOVERY_PARTNER', 'ADMIN']),
  getMlFeedbackHandler
);

export default router;
