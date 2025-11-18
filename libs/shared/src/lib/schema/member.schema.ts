import * as z from 'zod';
import { BaseSchema } from './base.schema';
import { UserGenderEnum } from './user.schema';

const MemberSchema = z
  .object({
    name: z.string().min(3).describe('Member name'),
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
    familyTreeId: z.string().uuid().describe('The family tree'),
  })
  .merge(BaseSchema)
  .describe('Member of family tree');

type MemberSchemaType = z.infer<typeof MemberSchema>;

export { MemberSchema, type MemberSchemaType };
