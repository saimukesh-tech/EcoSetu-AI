import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth';
import { getDashboardAnalyticsHandler } from '../../controllers/analytics.controller';

const router = Router();

router.get(
  '/dashboard',
  authenticateUser,
  getDashboardAnalyticsHandler
);

export default router;
