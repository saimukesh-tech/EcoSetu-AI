import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { aiChatRateLimiter } from '../../middleware/rateLimiter';
import { chatSchema } from '../../schemas/chat.schema';
import { chatHandler } from '../../controllers/chat.controller';

const router = Router();

router.post(
  '/',
  authenticateUser,
  aiChatRateLimiter,
  validateBody(chatSchema),
  chatHandler
);

export default router;
