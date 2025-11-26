import {
  FamilyTreeMemberConnectionGetAllParamSchema,
  FamilyTreeMemberConnectionGetAllResponseSchema,
  FamilyTreeMemberConnectionGetByMemberParamSchema,
  FamilyTreeMemberConnectionGetParamSchema,
  FamilyTreeMemberConnectionGetResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

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
  FamilyTreeMemberConnectionGetResponseDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetParamDto,
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
};
