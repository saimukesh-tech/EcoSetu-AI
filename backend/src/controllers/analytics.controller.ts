import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getDashboardAnalyticsForOrganization } from '../services/analyticsService';
import { getModelRegistry } from '../services/modelRegistry';
import { getModelMonitoringSummary } from '../services/modelMonitoring';
import { getFeedbackMetricsSummary } from '../services/mlFeedbackLoop';

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

export async function getModelRegistryHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const models = getModelRegistry();
    return res.json({
      success: true,
      count: models.length,
      models,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function getModelMonitoringHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const summary = getModelMonitoringSummary();
    return res.json({
      success: true,
      monitoring: summary,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}

export async function getMlFeedbackHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const summary = getFeedbackMetricsSummary();
    return res.json({
      success: true,
      feedbackMetrics: summary,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
