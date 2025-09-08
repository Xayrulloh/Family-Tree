import {
  FamilyTreeNodeBindRequestSchema,
  FamilyTreeNodeCreateRequestSchema,
  FamilyTreeNodeGetAllParamSchema,
  FamilyTreeNodeGetAllResponseSchema,
  FamilyTreeNodeGetParamSchema,
  FamilyTreeNodeGetResponseSchema,
  FamilyTreeNodeUpdateRequestSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FamilyTreeNodeCreateRequestDto extends createZodDto(
  FamilyTreeNodeCreateRequestSchema,
) {}

class FamilyTreeNodeBindRequestDto extends createZodDto(
  FamilyTreeNodeBindRequestSchema,
) {}

class FamilyTreeNodeUpdateRequestDto extends createZodDto(
  FamilyTreeNodeUpdateRequestSchema,
) {}

// response
class FamilyTreeNodeGetResponseDto extends createZodDto(
  FamilyTreeNodeGetResponseSchema,
) {}

class FamilyTreeNodeGetAllResponseDto extends createZodDto(
  FamilyTreeNodeGetAllResponseSchema,
) {}

// param
class FamilyTreeNodeGetParamDto extends createZodDto(
  FamilyTreeNodeGetParamSchema,
) {}

class FamilyTreeNodeGetAllParamDto extends createZodDto(
  FamilyTreeNodeGetAllParamSchema,
) {}

export {
  FamilyTreeNodeCreateRequestDto,
  FamilyTreeNodeBindRequestDto,
  FamilyTreeNodeUpdateRequestDto,
  FamilyTreeNodeGetResponseDto,
  FamilyTreeNodeGetAllResponseDto,
  FamilyTreeNodeGetParamDto,
  FamilyTreeNodeGetAllParamDto,
};
