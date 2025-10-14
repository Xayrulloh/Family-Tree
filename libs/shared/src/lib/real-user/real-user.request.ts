import { z } from 'zod';
import { RealUserSchema } from '../schema/real-user.schema';

const RealUserUpdateRequestSchema = RealUserSchema.pick({
  gender: true,
  image: true,
  name: true,
  dob: true,
  dod: true,
}).partial();

const RealUserEmailParamSchema = z.object({
  email: z.string().email(),
});

const RealUserIdParamSchema = RealUserSchema.pick({
  id: true,
});

type RealUserUpdateRequestType = z.infer<typeof RealUserUpdateRequestSchema>;

type RealUserUsernameParamType = z.infer<typeof RealUserEmailParamSchema>;

export {
  RealUserUpdateRequestSchema,
  type RealUserUpdateRequestType,
  RealUserEmailParamSchema,
  type RealUserUsernameParamType,
  RealUserIdParamSchema,
};
