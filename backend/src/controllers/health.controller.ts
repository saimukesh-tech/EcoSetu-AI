import { Request, Response, NextFunction } from 'express';

export function getLivenessHandler(req: Request, res: Response) {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

export async function getReadinessHandler(req: Request, res: Response) {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
  let mlReady = false;

  try {
    const mlRes = await fetch(`${mlServiceUrl}/ready`, { signal: AbortSignal.timeout(3000) });
    mlReady = mlRes.ok;
  } catch {
    mlReady = false;
  }

  const isReady = mlReady;

  return res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'degraded',
    checks: {
      expressServer: true,
      mlService: mlReady
    },
    timestamp: new Date().toISOString()
  });
}

export async function getHealthDiagnosticsHandler(req: Request, res: Response) {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
  let mlHealthy = false;

  try {
    const mlRes = await fetch(`${mlServiceUrl}/health`, { signal: AbortSignal.timeout(3000) });
    mlHealthy = mlRes.ok;
  } catch {
    mlHealthy = false;
  }

  return res.json({
    status: 'ok',
    service: 'EcoSetu AI Enterprise API Backend',
    version: 'v1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    checks: {
      mlServiceHealthy: mlHealthy
    }
  });
}
