import type { z } from 'zod';
import { PaginationSchema } from '../schema';

const PaginationQuerySchema = PaginationSchema.pick({
  page: true,
  perPage: true,
});

type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;

export { PaginationQuerySchema, type PaginationQueryType };
