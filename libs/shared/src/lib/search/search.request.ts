import type { z } from 'zod';
import { SearchSchema } from '../schema/search.schema';

const SearchByNameQuerySchema = SearchSchema.pick({
  name: true,
});

const SearchByEmailQuerySchema = SearchSchema.pick({
  email: true,
});

const SearchByPublicQuerySchema = SearchSchema.pick({
  isPublic: true,
});

type SearchByNameQueryType = z.infer<typeof SearchByNameQuerySchema>;

type SearchByEmailQueryType = z.infer<typeof SearchByEmailQuerySchema>;

type SearchByPublicQueryType = z.infer<typeof SearchByPublicQuerySchema>;

export {
  SearchByNameQuerySchema,
  SearchByEmailQuerySchema,
  SearchByPublicQuerySchema,
  type SearchByNameQueryType,
  type SearchByEmailQueryType,
  type SearchByPublicQueryType,
};
