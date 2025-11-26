import {
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberCreateParentsRequestSchema,
  FamilyTreeMemberCreateSpouseRequestSchema,
  FamilyTreeMemberGetAllParamSchema,
  FamilyTreeMemberGetAllResponseSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetResponseSchema,
  FamilyTreeMemberUpdateRequestSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FamilyTreeMemberCreateChildRequestDto extends createZodDto(
  FamilyTreeMemberCreateChildRequestSchema,
) {}

class FamilyTreeMemberCreateSpouseRequestDto extends createZodDto(
  FamilyTreeMemberCreateSpouseRequestSchema,
) {}

class FamilyTreeMemberCreateParentsRequestDto extends createZodDto(
  FamilyTreeMemberCreateParentsRequestSchema,
) {}

class FamilyTreeMemberUpdateRequestDto extends createZodDto(
  FamilyTreeMemberUpdateRequestSchema,
) {}

// response
class FamilyTreeMemberGetResponseDto extends createZodDto(
  FamilyTreeMemberGetResponseSchema,
) {}

class FamilyTreeMemberGetAllResponseDto extends createZodDto(
  FamilyTreeMemberGetAllResponseSchema,
) {}

// param
class FamilyTreeMemberGetParamDto extends createZodDto(
  FamilyTreeMemberGetParamSchema,
) {}

class FamilyTreeMemberGetAllParamDto extends createZodDto(
  FamilyTreeMemberGetAllParamSchema,
) {}

export {
  FamilyTreeMemberCreateChildRequestDto,
  FamilyTreeMemberCreateSpouseRequestDto,
  FamilyTreeMemberCreateParentsRequestDto,
  FamilyTreeMemberUpdateRequestDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetAllParamDto,
};
