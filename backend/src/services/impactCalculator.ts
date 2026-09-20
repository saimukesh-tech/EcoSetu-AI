export interface ImpactInput {
  totalWasteDivertedKg: number;
  foodWasteDivertedKg?: number;
  plasticDivertedKg?: number;
  paperDivertedKg?: number;
  status?: 'ESTIMATED' | 'COLLECTED' | 'WEIGHED' | 'MEASURED' | 'VERIFIED';
}

export interface ImpactReport {
  methodology: string;
  version: string;
  factorVersion: string;
  calculatedAt: string;
  source: string;
  totalWasteDivertedKg: number;
  co2eAvoidedKg: {
    value: number;
    status: 'ESTIMATED' | 'COLLECTED' | 'WEIGHED' | 'MEASURED' | 'VERIFIED';
  };
  mealsRescued: {
    value: number;
    status: 'ESTIMATED' | 'COLLECTED' | 'WEIGHED' | 'MEASURED' | 'VERIFIED';
  };
  treesEquivalent: {
    value: number;
    status: 'ESTIMATED' | 'COLLECTED' | 'WEIGHED' | 'MEASURED' | 'VERIFIED';
  };
  landfillVolumeSavedM3: number;
}

export function calculateEnvironmentalImpact(input: ImpactInput): ImpactReport {
  const status = input.status || 'ESTIMATED';
  const total = Math.max(0, input.totalWasteDivertedKg);
  const foodKg = Math.max(0, input.foodWasteDivertedKg ?? total * 0.45);
  const plasticKg = Math.max(0, input.plasticDivertedKg ?? total * 0.25);
  const paperKg = Math.max(0, input.paperDivertedKg ?? total * 0.20);

  // EPA WARM v15 lifecycle conversion factors
  // 1 kg organic/food waste diverted = 2.1 kg CO2e avoided (landfill methane offset)
  // 1 kg plastic recycled = 1.5 kg CO2e avoided
  // 1 kg paper recycled = 0.9 kg CO2e avoided
  const co2eSaved = (foodKg * 2.1) + (plasticKg * 1.5) + (paperKg * 0.9);
  
  // 1 kg food waste diverted = ~0.3 meals rescued (EPA Feeding America conversion)
  const meals = Math.round(foodKg * 0.3);
  
  // 1 mature tree absorbs ~21.77 kg CO2 annually
  const trees = Math.round((co2eSaved / 21.77) * 10) / 10;

  // Landfill volume saved (average density 0.5 tonnes per m3)
  const landfillVolumeM3 = Math.round((total / 500) * 100) / 100;

  return {
    methodology: 'EPA_WARM',
    version: '15',
    factorVersion: '2026-01',
    calculatedAt: new Date().toISOString(),
    source: 'EPA Waste Reduction Model (WARM) v15 & IPCC Guidelines',
    totalWasteDivertedKg: Math.round(total * 10) / 10,
    co2eAvoidedKg: {
      value: Math.round(co2eSaved * 10) / 10,
      status
    },
    mealsRescued: {
      value: meals,
      status
    },
    treesEquivalent: {
      value: trees,
      status
    },
    landfillVolumeSavedM3: landfillVolumeM3
  };
}
