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

export const registerPartnerSchema = z.object({
  orgName: z.string().min(2, 'Organization name is required'),
  partnerType: z.enum(['NGO', 'RecycleFacility', 'CompostingCenter', 'IndustrialProcessor', 'BiogasPlant']),
  address: z.string().min(5, 'Address is required'),
  location: z.string().min(2, 'Location is required'),
  latitude: z.number().optional().default(16.5062),
  longitude: z.number().optional().default(80.6480),
  acceptedWasteTypes: z.array(z.string()).min(1, 'Select at least one accepted waste type'),
  processingCapacityKg: z.number().positive('Capacity must be positive'),
  vehicleCapacityKg: z.number().optional().default(1000),
  serviceRadiusKm: z.number().optional().default(50),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(8),
  operatingHours: z.string().optional().default('09:00 - 18:00'),
  verificationDocs: z.array(z.string()).optional().default([])
});

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;

export const verifyPartnerSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING_VERIFICATION']),
  reviewNotes: z.string().optional()
});

export type VerifyPartnerInput = z.infer<typeof verifyPartnerSchema>;
