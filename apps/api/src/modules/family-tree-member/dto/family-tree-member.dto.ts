import {
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberCreateParentsRequestSchema,
  FamilyTreeMemberCreateSpouseRequestSchema,
  FamilyTreeMemberDeletePreviewSchema,
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

class FamilyTreeMemberDeletePreviewResponseDto extends createZodDto(
  FamilyTreeMemberDeletePreviewSchema,
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
  FamilyTreeMemberCreateParentsRequestDto,
  FamilyTreeMemberCreateSpouseRequestDto,
  FamilyTreeMemberDeletePreviewResponseDto,
  FamilyTreeMemberGetAllParamDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberUpdateRequestDto,
};
