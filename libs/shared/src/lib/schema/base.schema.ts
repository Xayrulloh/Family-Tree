import { z } from 'zod';

const dateToString = z.preprocess(
  (val) => (val != null ? new Date(val as string | Date).toISOString() : val),
  z.string().datetime(),
);

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
