import * as z from 'zod';
import { BaseSchema } from './base.schema';

enum UserGenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
} // FIXME: maybe as const

const RealUserSchema = z
  .object({
    email: z.string().email().describe('Registered google email account'),
    name: z.string().min(3).describe('Default google account name'),
    username: z.string().describe('Unique username from google'),
    image: z
      .string()
      .nullable()
      .describe(
        'Image url which comes only from client side but may delete from back on updates',
      ),
    gender: z
      .enum([
        UserGenderEnum.MALE,
        UserGenderEnum.FEMALE,
        UserGenderEnum.UNKNOWN,
      ])
      .describe(
        "Only male or female and for the beginning as we don't know we put unknown",
      ),
    dod: z.string().date().nullable().describe('Date of death'),
    dob: z.string().date().nullable().describe('Date of birth'),
    description: z.string().nullable().describe('Description of user'),
  })
  .merge(BaseSchema);

type RealUserSchemaType = z.infer<typeof RealUserSchema>;

export { RealUserSchema, type RealUserSchemaType, UserGenderEnum };
