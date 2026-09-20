import { z } from 'zod';

export const predictWasteSchema = z.object({
  event_type: z.string().min(1, 'Event type is required').max(100),
  guest_count: z.number().int().min(1, 'Guest count must be at least 1').max(1000000),
  duration: z.number().min(0.5, 'Duration must be at least 0.5 hours').max(168),
  food_type: z.string().optional().default('Buffet'),
  catering_type: z.string().optional().default('Standard'),
  location: z.string().optional().default('Urban'),
  organizationId: z.string().optional()
});

export type PredictWasteInput = z.infer<typeof predictWasteSchema>;
