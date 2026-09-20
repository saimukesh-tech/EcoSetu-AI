import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestWithId extends Request {
  requestId?: string;
  startTime?: number;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'] as string;
  const requestId = incomingId || `req_${randomUUID().replace(/-/g, '').substring(0, 12)}`;

  req.requestId = requestId;
  req.startTime = Date.now();

  res.setHeader('X-Request-ID', requestId);
  next();
}
