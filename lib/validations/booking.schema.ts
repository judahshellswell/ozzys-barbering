import { z } from 'zod';

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time slot'),
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
