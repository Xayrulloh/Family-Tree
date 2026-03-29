import { z } from 'zod';

const SearchSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().min(3).optional(),
  isPublic: z
    .preprocess((value) => {
      if (typeof value === 'string') return value === 'true';
      if (typeof value === 'boolean') return value;
      return false;
    }, z.boolean())
    .default(false)
    .optional(),
});

type SearchSchemaType = z.infer<typeof SearchSchema>;

export { SearchSchema, type SearchSchemaType };
