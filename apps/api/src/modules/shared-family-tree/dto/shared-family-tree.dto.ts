import {
  SharedFamilyTreeArrayResponseSchema,
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
  SharedFamilyTreeResponseSchema,
  SharedFamilyTreeUsersArrayResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class SharedFamilyTreeCreateRequestDto extends createZodDto(
  SharedFamilyTreeCreateRequestSchema,
) {}

// param
class SharedFamilyTreeIdParamDto extends createZodDto(
  SharedFamilyTreeIdParamSchema,
) {}

// response
class SharedFamilyTreeResponseDto extends createZodDto(
  SharedFamilyTreeResponseSchema,
) {}

class SharedFamilyTreeArrayResponseDto extends createZodDto(
  SharedFamilyTreeArrayResponseSchema,
) {}

class SharedFamilyTreeUsersArrayResponseDto extends createZodDto(
  SharedFamilyTreeUsersArrayResponseSchema,
) {}

export {
  SharedFamilyTreeCreateRequestDto,
  SharedFamilyTreeIdParamDto,
  SharedFamilyTreeResponseDto,
  SharedFamilyTreeArrayResponseDto,
  SharedFamilyTreeUsersArrayResponseDto,
};
