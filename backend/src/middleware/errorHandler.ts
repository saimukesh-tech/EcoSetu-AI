import { Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { RequestWithId } from './requestId';

export function errorHandler(err: any, req: RequestWithId, res: Response, next: NextFunction) {
  const requestId = req.requestId || 'unknown';

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId
      }
    });
  }

  // Handle generic uncaught exceptions
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    service: 'ecosetu-backend',
    requestId,
    error: err.message || err,
    stack: err.stack
  }));

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
      requestId
    }
  });
}
