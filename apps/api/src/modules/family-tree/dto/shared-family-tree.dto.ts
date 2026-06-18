import {
  FamilyTreeSharedCreateRequestSchema,
  FamilyTreeSharedIdParamSchema,
  FamilyTreeSharedPaginationAndSearchQuerySchema,
  FamilyTreeSharedPaginationResponseSchema,
  FamilyTreeSharedResponseSchema,
  FamilyTreeSharedUpdateParamSchema,
  FamilyTreeSharedUpdateRequestSchema,
  FamilyTreeSharedUsersPaginationResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FamilyTreeSharedCreateRequestDto extends createZodDto(
  FamilyTreeSharedCreateRequestSchema,
) {}

class FamilyTreeSharedUpdateRequestDto extends createZodDto(
  FamilyTreeSharedUpdateRequestSchema,
) {}

// param
class FamilyTreeSharedIdParamDto extends createZodDto(
  FamilyTreeSharedIdParamSchema,
) {}

class FamilyTreeSharedUpdateParamDto extends createZodDto(
  FamilyTreeSharedUpdateParamSchema,
) {}

// query
class FamilyTreeSharedPaginationAndSearchQueryDto extends createZodDto(
  FamilyTreeSharedPaginationAndSearchQuerySchema,
) {}

// response
class FamilyTreeSharedResponseDto extends createZodDto(
  FamilyTreeSharedResponseSchema,
) {}

class FamilyTreeSharedPaginationResponseDto extends createZodDto(
  FamilyTreeSharedPaginationResponseSchema,
) {}

class FamilyTreeSharedUsersPaginationResponseDto extends createZodDto(
  FamilyTreeSharedUsersPaginationResponseSchema,
) {}

export {
  FamilyTreeSharedCreateRequestDto,
  FamilyTreeSharedIdParamDto,
  FamilyTreeSharedPaginationAndSearchQueryDto,
  FamilyTreeSharedPaginationResponseDto,
  FamilyTreeSharedResponseDto,
  FamilyTreeSharedUpdateParamDto,
  FamilyTreeSharedUpdateRequestDto,
  FamilyTreeSharedUsersPaginationResponseDto,
};
