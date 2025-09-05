import {
  FamilyTreeArrayResponseSchema,
  FamilyTreeCreateRequestSchema,
  FamilyTreeNameParamSchema,
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

class FamilyTreeNameParamDto extends createZodDto(FamilyTreeNameParamSchema) {}

class FamilyTreeIdParamDto extends createZodDto(IdQuerySchema) {}

// response
class FamilyTreeResponseDto extends createZodDto(FamilyTreeResponseSchema) {}

class FamilyTreeArrayResponseDto extends createZodDto(
  FamilyTreeArrayResponseSchema,
) {}

export {
  FamilyTreeCreateRequestDto,
  FamilyTreeUpdateRequestDto,
  FamilyTreeNameParamDto,
  FamilyTreeIdParamDto,
  FamilyTreeResponseDto,
  FamilyTreeArrayResponseDto,
};
