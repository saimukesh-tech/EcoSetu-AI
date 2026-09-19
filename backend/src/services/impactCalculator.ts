import impactFactors from '../config/impactFactors.json';

export interface WasteBreakdown {
  foodKg?: number;
  plasticKg?: number;
  paperKg?: number;
  glassKg?: number;
  metalKg?: number;
  textileKg?: number;
  flowerKg?: number;
  fabricKg?: number;
  generalKg?: number;
}

export interface ImpactCalculationResult {
  totalWasteDivertedKg: number;
  co2eAvoidedKg: number;
  mealsRescued: number;
  treesEquivalent: number;
  breakdown: Record<string, { kg: number; co2eKg: number }>;
  sources: Record<string, string>;
}

export function calculateEnvironmentalImpact(waste: WasteBreakdown): ImpactCalculationResult {
  const factors = impactFactors.co2eAvoidedKgPerKg;
  const breakdown: Record<string, { kg: number; co2eKg: number }> = {};

  let totalKg = 0;
  let totalCo2e = 0;

  const categoryMap: Array<{ key: keyof WasteBreakdown; factorKey: keyof typeof factors; label: string }> = [
    { key: 'foodKg', factorKey: 'food_waste', label: 'Food Waste' },
    { key: 'plasticKg', factorKey: 'plastic', label: 'Plastic' },
    { key: 'paperKg', factorKey: 'paper', label: 'Paper' },
    { key: 'glassKg', factorKey: 'glass', label: 'Glass' },
    { key: 'metalKg', factorKey: 'metal', label: 'Metal' },
    { key: 'textileKg', factorKey: 'textiles', label: 'Textiles' },
    { key: 'flowerKg', factorKey: 'flower_waste', label: 'Flower Waste' },
    { key: 'fabricKg', factorKey: 'fabric_waste', label: 'Fabric Waste' },
    { key: 'generalKg', factorKey: 'general', label: 'General Recyclables' }
  ];

  for (const item of categoryMap) {
    const val = waste[item.key] || 0;
    if (val > 0) {
      const co2e = val * factors[item.factorKey];
      totalKg += val;
      totalCo2e += co2e;
      breakdown[item.label] = {
        kg: Math.round(val * 100) / 100,
        co2eKg: Math.round(co2e * 100) / 100
      };
    }
  }

  const foodKg = waste.foodKg || 0;
  const mealsRescued = Math.round(foodKg * impactFactors.mealsRescuedPerKgFoodWaste);
  const treesEquivalent = Math.round((totalCo2e / 100) * impactFactors.treesEquivalentPer100KgCO2 * 10) / 10;

  return {
    totalWasteDivertedKg: Math.round(totalKg * 100) / 100,
    co2eAvoidedKg: Math.round(totalCo2e * 100) / 100,
    mealsRescued,
    treesEquivalent,
    breakdown,
    sources: impactFactors.sources
  };
}
