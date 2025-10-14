import {
  FamilyTreeMemberConnectionCreateRequestSchema,
  FamilyTreeMemberConnectionGetAllParamSchema,
  FamilyTreeMemberConnectionGetAllResponseSchema,
  FamilyTreeMemberConnectionGetByMemberParamSchema,
  FamilyTreeMemberConnectionGetParamSchema,
  FamilyTreeMemberConnectionGetResponseSchema,
  FamilyTreeMemberConnectionUpdateRequestSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FamilyTreeMemberConnectionCreateRequestDto extends createZodDto(
  FamilyTreeMemberConnectionCreateRequestSchema,
) {}

class FamilyTreeMemberConnectionUpdateRequestDto extends createZodDto(
  FamilyTreeMemberConnectionUpdateRequestSchema,
) {}

// response
class FamilyTreeMemberConnectionGetResponseDto extends createZodDto(
  FamilyTreeMemberConnectionGetResponseSchema,
) {}

class FamilyTreeMemberConnectionGetAllResponseDto extends createZodDto(
  FamilyTreeMemberConnectionGetAllResponseSchema,
) {}

// param
class FamilyTreeMemberConnectionGetParamDto extends createZodDto(
  FamilyTreeMemberConnectionGetParamSchema,
) {}

class FamilyTreeMemberConnectionGetAllParamDto extends createZodDto(
  FamilyTreeMemberConnectionGetAllParamSchema,
) {}

class FamilyTreeMemberConnectionGetByMemberParamDto extends createZodDto(
  FamilyTreeMemberConnectionGetByMemberParamSchema,
) {}

export {
  FamilyTreeMemberConnectionCreateRequestDto,
  FamilyTreeMemberConnectionUpdateRequestDto,
  FamilyTreeMemberConnectionGetResponseDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetParamDto,
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
};
