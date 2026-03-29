import type { z } from 'zod';
import { SearchSchema } from '../schema/search.schema';

const SearchByNameQuerySchema = SearchSchema.pick({
  name: true,
});

const SearchByPublicQuerySchema = SearchSchema.pick({
  isPublic: true,
});

type SearchByNameQueryType = z.infer<typeof SearchByNameQuerySchema>;

type SearchByPublicQueryType = z.infer<typeof SearchByPublicQuerySchema>;

export {
  SearchByNameQuerySchema,
  SearchByPublicQuerySchema,
  type SearchByNameQueryType,
  type SearchByPublicQueryType,
};