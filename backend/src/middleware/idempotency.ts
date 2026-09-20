import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId';

const idempotencyCache = new Map<string, { status: number; body: any; expiresAt: number }>();

// Clean expired keys every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (value.expiresAt <= now) {
      idempotencyCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function enforceIdempotency(req: RequestWithId, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    return next();
  }

  const cached = idempotencyCache.get(idempotencyKey);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader('X-Cache-Lookup', 'IDEMPOTENT_HIT');
    return res.status(cached.status).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any): Response => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(idempotencyKey, {
        status: res.statusCode,
        body,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24h expiration
      });
    }
    return originalJson(body);
  };

  next();
}
