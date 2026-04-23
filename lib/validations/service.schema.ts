import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  description: z.string().max(300).optional().default(''),
  duration: z.number().int().min(10).max(480),
  price: z.number().min(0).max(9999),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
