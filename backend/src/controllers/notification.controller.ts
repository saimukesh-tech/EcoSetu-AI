import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';
import { getAuditLogs } from '../services/auditLogger';

export async function getUserNotificationsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const uid = req.user?.uid || 'demo_organizer_123';
    const notifications = getUserNotifications(uid);
    return res.json({
      success: true,
      count: notifications.length,
      notifications,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationReadHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const notifIdParam = req.params.notifId;
    const notifId = Array.isArray(notifIdParam) ? notifIdParam[0] : notifIdParam;
    const success = markNotificationAsRead(notifId);

    return res.json({
      success,
      message: success ? 'Notification marked as read.' : 'Notification not found.',
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const logs = getAuditLogs();
    return res.json({
      success: true,
      count: logs.length,
      auditLogs: logs,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
