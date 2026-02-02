import { z } from 'zod';

const PaginationSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(15),
  totalCount: z.number().default(0),
  totalPages: z.number().default(0),
});

type PaginationSchemaType = z.infer<typeof PaginationSchema>;

export { PaginationSchema, type PaginationSchemaType };
