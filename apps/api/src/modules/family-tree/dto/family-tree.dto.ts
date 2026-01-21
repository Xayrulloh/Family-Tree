import {
  FamilyTreeCreateRequestSchema,
  FamilyTreePaginationAndSearchQuerySchema,
  FamilyTreePaginationResponseSchema,
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

// query
class FamilyTreePaginationAndSearchQueryDto extends createZodDto(
  FamilyTreePaginationAndSearchQuerySchema,
) {}

// response
class FamilyTreeResponseDto extends createZodDto(FamilyTreeResponseSchema) {}

class FamilyTreePaginationResponseDto extends createZodDto(
  FamilyTreePaginationResponseSchema,
) {}

export {
  FamilyTreeCreateRequestDto,
  FamilyTreeUpdateRequestDto,
  FamilyTreeIdParamDto,
  FamilyTreeResponseDto,
  FamilyTreePaginationResponseDto,
  FamilyTreePaginationAndSearchQueryDto,
};
