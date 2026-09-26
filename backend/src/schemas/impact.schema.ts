import { z } from 'zod';

export const calculateImpactSchema = z.object({
  totalWasteDivertedKg: z.number().min(0, 'totalWasteDivertedKg must be non-negative'),
  foodWasteDivertedKg: z.number().min(0).optional(),
  plasticDivertedKg: z.number().min(0).optional(),
  paperDivertedKg: z.number().min(0).optional(),
  metalDivertedKg: z.number().min(0).optional(),
  glassDivertedKg: z.number().min(0).optional(),
});

export type CalculateImpactInput = z.infer<typeof calculateImpactSchema>;
