import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message exceeds 4000 characters limit'),
  context: z.object({
    eventId: z.string().optional(),
    eventType: z.string().optional(),
    guestCount: z.number().optional(),
    location: z.string().optional()
  }).optional()
});

export type ChatInput = z.infer<typeof chatSchema>;
