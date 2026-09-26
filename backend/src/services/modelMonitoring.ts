export interface TelemetryMetric {
  timestamp: string;
  modelId: string;
  latencyMs: number;
  confidenceScore: number | null;
  fallbackUsed: boolean;
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
}

const telemetryLog: TelemetryMetric[] = [];

export function recordInferenceTelemetry(metric: Omit<TelemetryMetric, 'timestamp'>) {
  telemetryLog.push({
    ...metric,
    timestamp: new Date().toISOString()
  });

  // Keep last 1000 telemetry entries in memory
  if (telemetryLog.length > 1000) {
    telemetryLog.shift();
  }
}

export function getModelMonitoringSummary() {
  const totalInferences = telemetryLog.length;
  if (totalInferences === 0) {
    return {
      totalInferences: 0,
      avgLatencyMs: 0,
      fallbackRatePct: 0,
      avgConfidence: 0.92,
      healthStatus: 'HEALTHY',
      recentTelemetry: []
    };
  }

  const fallbacks = telemetryLog.filter(m => m.fallbackUsed).length;
  const totalLatency = telemetryLog.reduce((acc, m) => acc + m.latencyMs, 0);
  const confidences = telemetryLog.map(m => m.confidenceScore).filter((c): c is number => c !== null);
  const avgConfidence = confidences.length > 0
    ? confidences.reduce((acc, c) => acc + c, 0) / confidences.length
    : 0.92;

  const fallbackRate = Math.round((fallbacks / totalInferences) * 10000) / 100;
  const avgLatency = Math.round((totalLatency / totalInferences) * 10) / 10;

  return {
    totalInferences,
    avgLatencyMs: avgLatency,
    fallbackRatePct: fallbackRate,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    healthStatus: fallbackRate > 20 ? 'DEGRADED' : 'HEALTHY',
    recentTelemetry: telemetryLog.slice(-20).reverse()
  };
}
