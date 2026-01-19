import {
  SharedFamilyTreeArrayResponseSchema,
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
  SharedFamilyTreeResponseSchema,
  SharedFamilyTreeUpdateParamSchema,
  SharedFamilyTreeUpdateRequestSchema,
  SharedFamilyTreeUsersArrayResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class SharedFamilyTreeCreateRequestDto extends createZodDto(
  SharedFamilyTreeCreateRequestSchema,
) {}

class SharedFamilyTreeUpdateRequestDto extends createZodDto(
  SharedFamilyTreeUpdateRequestSchema,
) {}

// param
class SharedFamilyTreeIdParamDto extends createZodDto(
  SharedFamilyTreeIdParamSchema,
) {}

class SharedFamilyTreeUpdateParamDto extends createZodDto(
  SharedFamilyTreeUpdateParamSchema,
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
  SharedFamilyTreeUpdateParamDto,
  SharedFamilyTreeUpdateRequestDto,
  SharedFamilyTreeResponseDto,
  SharedFamilyTreeArrayResponseDto,
  SharedFamilyTreeUsersArrayResponseDto,
};
