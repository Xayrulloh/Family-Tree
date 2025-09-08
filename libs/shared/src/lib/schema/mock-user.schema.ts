import * as z from 'zod';
import { BaseSchema } from './base.schema';
import { UserGenderEnum } from './real-user.schema';

const MockUserSchema = z
  .object({
    name: z.string().min(3).describe('Mock user name'),
    image: z
      .string()
      .nullable()
      .describe(
        'Image url which comes only from client side but may delete from back on updates',
      ),
    gender: z
      .enum([UserGenderEnum.MALE, UserGenderEnum.FEMALE])
      .describe(
        "Only male or female and for the beginning as we don't know we put unknown",
      ),
    dod: z.string().date().nullable().describe('Date of death'),
    dob: z.string().date().nullable().describe('Date of birth'),
    description: z.string().nullable().describe('Description of user'),
  })
  .merge(BaseSchema);

type MockUserSchemaType = z.infer<typeof MockUserSchema>;

export { MockUserSchema, type MockUserSchemaType };
