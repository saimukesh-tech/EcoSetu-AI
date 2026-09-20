import { z } from 'zod';

export const matchPartnerSchema = z.object({
  eventId: z.string().optional(),
  location: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  wasteTypes: z.array(z.string()).min(1, 'At least one waste type is required'),
  requestedQuantityKg: z.number().positive('Quantity must be greater than 0'),
  pickupWindow: z.string().optional(),
  vehicleRequired: z.string().optional(),
  serviceRadiusKm: z.number().positive().optional().default(50)
});

export type MatchPartnerInput = z.infer<typeof matchPartnerSchema>;
