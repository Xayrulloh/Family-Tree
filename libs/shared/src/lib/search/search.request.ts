import type { z } from 'zod';
import { SearchSchema } from '../schema/search.schema';

const SearchByNameQuerySchema = SearchSchema.pick({
  name: true,
});

type SearchByNameQueryType = z.infer<typeof SearchByNameQuerySchema>;

export { SearchByNameQuerySchema, type SearchByNameQueryType };
