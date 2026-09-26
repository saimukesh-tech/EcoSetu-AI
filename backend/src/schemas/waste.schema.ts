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

export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  eventType: z.string().min(1, 'Event type is required'),
  venue: z.string().optional().default(''),
  eventDate: z.string().optional().default(''),
  guestCount: z.number().int().min(1),
  durationHours: z.number().min(0.5),
  foodType: z.string().optional().default('Buffet'),
  cateringType: z.string().optional().default('Standard'),
  decorationType: z.string().optional().default('Flowers + Fabric'),
  location: z.string().optional().default('Urban'),
  predictedWaste: z.object({
    foodWasteKg: z.number().optional(),
    flowerWasteKg: z.number().optional(),
    plasticWasteKg: z.number().optional(),
    paperWasteKg: z.number().optional(),
    fabricWasteKg: z.number().optional(),
    totalWasteKg: z.number()
  }).optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const recordActualWasteSchema = z.object({
  foodWasteKg: z.number().min(0),
  plasticWasteKg: z.number().min(0).optional().default(0),
  paperWasteKg: z.number().min(0).optional().default(0),
  flowerWasteKg: z.number().min(0).optional().default(0),
  totalWasteKg: z.number().min(0)
});

export type RecordActualWasteInput = z.infer<typeof recordActualWasteSchema>;
