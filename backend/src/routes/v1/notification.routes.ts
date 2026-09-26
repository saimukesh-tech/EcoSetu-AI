import { Router } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import {
  getUserNotificationsHandler,
  markNotificationReadHandler,
  getAuditLogsHandler
} from '../../controllers/notification.controller';

const router = Router();

router.get(
  '/',
  authenticateUser,
  getUserNotificationsHandler
);

router.put(
  '/:notifId/read',
  authenticateUser,
  markNotificationReadHandler
);

router.get(
  '/audit-logs',
  authenticateUser,
  requireRole(['ADMIN']),
  getAuditLogsHandler
);

export default router;
