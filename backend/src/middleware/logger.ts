import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId';

export function structuredLogger(req: RequestWithId, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? (res.statusCode >= 500 ? 'ERROR' : 'WARN') : 'INFO',
      service: 'ecosetu-backend',
      requestId: req.requestId || 'unknown',
      method: req.method,
      route: req.originalUrl || req.url,
      statusCode: res.statusCode,
      latencyMs,
      userId: (req as any).user?.uid || 'anonymous',
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    };

    console.log(JSON.stringify(logData));
  });

  next();
}
