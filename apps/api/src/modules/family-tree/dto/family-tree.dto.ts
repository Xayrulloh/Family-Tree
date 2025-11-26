import {
  FamilyTreeArrayResponseSchema,
  FamilyTreeCreateRequestSchema,
  FamilyTreeResponseSchema,
  FamilyTreeUpdateRequestSchema,
  IdQuerySchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FamilyTreeCreateRequestDto extends createZodDto(
  FamilyTreeCreateRequestSchema,
) {}

class FamilyTreeUpdateRequestDto extends createZodDto(
  FamilyTreeUpdateRequestSchema,
) {}

// param
class FamilyTreeIdParamDto extends createZodDto(IdQuerySchema) {}

// response
class FamilyTreeResponseDto extends createZodDto(FamilyTreeResponseSchema) {}

class FamilyTreeArrayResponseDto extends createZodDto(
  FamilyTreeArrayResponseSchema,
) {}

export {
  FamilyTreeCreateRequestDto,
  FamilyTreeUpdateRequestDto,
  FamilyTreeIdParamDto,
  FamilyTreeResponseDto,
  FamilyTreeArrayResponseDto,
};
