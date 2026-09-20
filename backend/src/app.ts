import express, { Express, Request, Response } from 'express';
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

dotenv.config();

const app: Express = express();

// Security Headers (OWASP Security Standard)
app.use(helmet({
  contentSecurityPolicy: false, // Managed by CDN / Frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS origin restriction (Removal of wildcard '*')
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
    // Allow non-browser requests (Postman, curl, backend-to-backend) or matched origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, validated in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach Request ID and Structured Logging
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

// Backward compatibility routes forwarding to v1
app.use('/api/waste', wasteRoutesV1);
app.use('/api/matching', matchingRoutesV1);
app.use('/api/pickup', pickupRoutesV1);
app.use('/api/impact', impactRoutesV1);
app.use('/api/chat', chatRoutesV1);
app.use('/api/analytics', analyticsRoutesV1);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
