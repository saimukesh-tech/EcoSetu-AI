import { z } from 'zod';

export const PickupStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'SCHEDULED',
  'PICKUP_IN_PROGRESS',
  'COLLECTED',
  'RECOVERED',
  'COMPLETED',
  'CANCELLED'
]);

export const createPickupSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  partnerId: z.string().min(1, 'Partner ID is required'),
  wasteTypes: z.array(z.string()).min(1, 'At least one waste type is required'),
  estimatedQuantityKg: z.number().positive(),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  notes: z.string().optional()
});

export const updatePickupStatusSchema = z.object({
  pickupId: z.string().min(1, 'Pickup ID is required'),
  currentStatus: PickupStatusEnum,
  targetStatus: PickupStatusEnum,
  reason: z.string().optional(),
  collectedWeightKg: z.number().positive().optional()
});

export type CreatePickupInput = z.infer<typeof createPickupSchema>;
export type UpdatePickupStatusInput = z.infer<typeof updatePickupStatusSchema>;
