import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ChatInput } from '../schemas/chat.schema';
import { processAIChatRequest } from '../services/aiGateway';

export async function chatHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input: ChatInput = req.body;

    const result = await processAIChatRequest({
      message: input.message,
      context: input.context,
      userId: req.user?.uid,
      requestId: req.requestId
    });

    return res.json({
      success: true,
      reply: result.reply,
      telemetry: result.telemetry,
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
}
