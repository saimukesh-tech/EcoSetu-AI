import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getDashboardAnalyticsForOrganization } from '../services/analyticsService';

export async function getDashboardAnalyticsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const orgId = req.user?.organizationId || 'org_demo_1';
    const analytics = getDashboardAnalyticsForOrganization(orgId);

    return res.json({
      success: true,
      data: analytics,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
