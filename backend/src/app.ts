import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { requestIdMiddleware } from './middleware/requestId';
import { structuredLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalApiRateLimiter } from './middleware/rateLimiter';

import wasteRoutesV1 from './routes/v1/waste.routes';
import matchingRoutesV1 from './routes/v1/matching.routes';
import pickupRoutesV1 from './routes/v1/pickup.routes';
import impactRoutesV1 from './routes/v1/impact.routes';
import chatRoutesV1 from './routes/v1/chat.routes';
import analyticsRoutesV1 from './routes/v1/analytics.routes';
import healthRoutesV1 from './routes/v1/health.routes';
import notificationRoutesV1 from './routes/v1/notification.routes';

dotenv.config();

const app: Express = express();

// Security Headers (OWASP Security Standard)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Strict CORS Origin Enforcement
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://ecosetu-ai.vercel.app',
  'https://frontend-olive-mu-zals2li3b6.vercel.app'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' is not allowed by CORS security policy.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(requestIdMiddleware);
app.use(structuredLogger);
app.use(generalApiRateLimiter);

// Top-level Health Checks
app.use('/', healthRoutesV1);

// Versioned API v1 Router
app.use('/api/v1/waste', wasteRoutesV1);
app.use('/api/v1/matching', matchingRoutesV1);
app.use('/api/v1/pickup', pickupRoutesV1);
app.use('/api/v1/impact', impactRoutesV1);
app.use('/api/v1/chat', chatRoutesV1);
app.use('/api/v1/analytics', analyticsRoutesV1);
app.use('/api/v1/notifications', notificationRoutesV1);

// Backward compatibility router with Deprecation Notice Header
const deprecationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Warning', '299 EcoSetu - "Deprecated API endpoint. Please migrate to /api/v1/*"');
  next();
};

app.use('/api/waste', deprecationMiddleware, wasteRoutesV1);
app.use('/api/matching', deprecationMiddleware, matchingRoutesV1);
app.use('/api/pickup', deprecationMiddleware, pickupRoutesV1);
app.use('/api/impact', deprecationMiddleware, impactRoutesV1);
app.use('/api/chat', deprecationMiddleware, chatRoutesV1);
app.use('/api/analytics', deprecationMiddleware, analyticsRoutesV1);
app.use('/api/notifications', deprecationMiddleware, notificationRoutesV1);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  });
});

app.use(errorHandler);

export default app;
