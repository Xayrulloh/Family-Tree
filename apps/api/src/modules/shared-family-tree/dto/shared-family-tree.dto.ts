import {
  IdQuerySchema,
  SharedFamilyTreeArrayResponseSchema,
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeUsersArrayResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class SharedFamilyTreeCreateRequestDto extends createZodDto(
  SharedFamilyTreeCreateRequestSchema,
) {}

// param
class SharedFamilyTreeIdParamDto extends createZodDto(IdQuerySchema) {}

// response
class SharedFamilyTreeArrayResponseDto extends createZodDto(
  SharedFamilyTreeArrayResponseSchema,
) {}

class SharedFamilyTreeUsersArrayResponseDto extends createZodDto(
  SharedFamilyTreeUsersArrayResponseSchema,
) {}

export {
  SharedFamilyTreeCreateRequestDto,
  SharedFamilyTreeIdParamDto,
  SharedFamilyTreeArrayResponseDto,
  SharedFamilyTreeUsersArrayResponseDto,
};
