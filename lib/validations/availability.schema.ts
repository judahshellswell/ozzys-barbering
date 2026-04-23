import { z } from 'zod';

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time'),
  isActive: z.boolean(),
});

export const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  reason: z.string().max(200).optional(),
});

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;
export type BlockedDateFormData = z.infer<typeof blockedDateSchema>;
