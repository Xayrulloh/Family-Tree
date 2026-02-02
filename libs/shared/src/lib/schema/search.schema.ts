import { z } from 'zod';

const SearchSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().min(3).optional(),
});

type SearchSchemaType = z.infer<typeof SearchSchema>;

export { SearchSchema, type SearchSchemaType };
