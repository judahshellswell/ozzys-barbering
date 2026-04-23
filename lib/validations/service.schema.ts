import { z } from 'zod';

// Price can be a fixed number or a range string like "15-20"
const priceField = z.union([
  z.number().min(0).max(9999),
  z.string().regex(/^\d+(\.\d{1,2})?-\d+(\.\d{1,2})?$/, 'Range must be like 15-20'),
]);

export const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  description: z.string().max(300).optional().default(''),
  duration: z.number().int().min(10).max(480),
  price: priceField,
  priceFrom: z.number().min(0).optional(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
