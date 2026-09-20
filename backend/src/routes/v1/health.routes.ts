import { Router } from 'express';
import {
  getLivenessHandler,
  getReadinessHandler,
  getHealthDiagnosticsHandler
} from '../../controllers/health.controller';

const router = Router();

router.get('/live', getLivenessHandler);
router.get('/ready', getReadinessHandler);
router.get('/health', getHealthDiagnosticsHandler);

export default router;
