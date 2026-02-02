import type { z } from 'zod';
import { PaginationSchema } from '../schema';

const PaginationResponseSchema = PaginationSchema;

type PaginationResponseType = z.infer<typeof PaginationResponseSchema>;

export { PaginationResponseSchema, type PaginationResponseType };
