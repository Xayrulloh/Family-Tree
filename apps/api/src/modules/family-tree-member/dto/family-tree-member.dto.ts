import {
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberCreateRequestSchema,
  FamilyTreeMemberGetAllParamSchema,
  FamilyTreeMemberGetAllResponseSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetResponseSchema,
  FamilyTreeMemberUpdateRequestSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FamilyTreeMemberCreateRequestDto extends createZodDto(
  FamilyTreeMemberCreateRequestSchema,
) {}

class FamilyTreeMemberCreateChildRequestDto extends createZodDto(
  FamilyTreeMemberCreateChildRequestSchema,
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
  FamilyTreeMemberCreateRequestDto,
  FamilyTreeMemberCreateChildRequestDto,
  FamilyTreeMemberUpdateRequestDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetAllParamDto,
};
