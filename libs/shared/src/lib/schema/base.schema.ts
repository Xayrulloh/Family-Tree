import { z } from 'zod';

const dateToString = z.preprocess((val) => {
  if (val == null) return val;
  // Drizzle returns ISO strings (mode:'string') or Date objects from $onUpdate;
  // normalize both to a Z-suffixed ISO string required by z.string().datetime()
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return new Date(val).toISOString();
  return val;
}, z.string().datetime());

const BaseSchema = z.object({
  id: z.string().uuid().describe('Primary key'),
  createdAt: dateToString.describe('When it was created'),
  updatedAt: dateToString.describe('When it was last updated'),
  deletedAt: dateToString
    .nullable()
    .describe(
      'When it was soft deleted, but most of the time it is hard deleted',
    ),
});

type BaseSchemaType = z.infer<typeof BaseSchema>;

export { BaseSchema, type BaseSchemaType };
