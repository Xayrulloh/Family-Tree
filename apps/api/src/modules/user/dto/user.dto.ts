import {
  UserEmailParamSchema,
  UserIdParamSchema,
  UserResponseSchema,
  UserUpdateRequestSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class UserUpdateRequestDto extends createZodDto(UserUpdateRequestSchema) {}

// param

class UserEmailParamDto extends createZodDto(UserEmailParamSchema) {}

class UserIdParamDto extends createZodDto(UserIdParamSchema) {}

// response
class UserResponseDto extends createZodDto(UserResponseSchema) {}

export {
  UserUpdateRequestDto,
  UserEmailParamDto,
  UserIdParamDto,
  UserResponseDto,
};
