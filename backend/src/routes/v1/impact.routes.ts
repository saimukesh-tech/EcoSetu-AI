import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth';
import { calculateImpactHandler } from '../../controllers/impact.controller';

const router = Router();

router.post(
  '/calculate',
  authenticateUser,
  calculateImpactHandler
);

export default router;
