import { z } from "zod";

export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "name_asc", "newest"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
