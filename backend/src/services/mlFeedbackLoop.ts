export interface FeedbackOutcome {
  id: string;
  eventId: string;
  predictedWasteKg: number;
  actualWasteKg: number;
  absoluteErrorKg: number;
  percentageErrorPct: number;
  recordedAt: string;
}

const feedbackStore: FeedbackOutcome[] = [];

export function recordOutcomeFeedback(eventId: string, predictedTotalKg: number, actualTotalKg: number): FeedbackOutcome {
  const absoluteError = Math.abs(predictedTotalKg - actualTotalKg);
  const percentageError = actualTotalKg > 0 ? (absoluteError / actualTotalKg) * 100 : 0;

  const outcome: FeedbackOutcome = {
    id: `fb_${Date.now()}`,
    eventId,
    predictedWasteKg: Math.round(predictedTotalKg * 100) / 100,
    actualWasteKg: Math.round(actualTotalKg * 100) / 100,
    absoluteErrorKg: Math.round(absoluteError * 100) / 100,
    percentageErrorPct: Math.round(percentageError * 100) / 100,
    recordedAt: new Date().toISOString()
  };

  feedbackStore.push(outcome);
  return outcome;
}

export function getFeedbackMetricsSummary() {
  const count = feedbackStore.length;
  if (count === 0) {
    return {
      totalOutcomesRecorded: 0,
      maeKg: 1.67, // Baseline ML report MAE
      mapePct: 8.5,
      sampleSize: 0,
      retrainingReady: false,
      recentOutcomes: []
    };
  }

  const totalAbsError = feedbackStore.reduce((sum, o) => sum + o.absoluteErrorKg, 0);
  const totalPctError = feedbackStore.reduce((sum, o) => sum + o.percentageErrorPct, 0);

  const mae = Math.round((totalAbsError / count) * 100) / 100;
  const mape = Math.round((totalPctError / count) * 100) / 100;

  return {
    totalOutcomesRecorded: count,
    maeKg: mae,
    mapePct: mape,
    sampleSize: count,
    retrainingReady: count >= 10,
    recentOutcomes: feedbackStore.slice(-10).reverse()
  };
}
