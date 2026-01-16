import {
  SharedFamilyTreeArrayResponseSchema,
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
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
