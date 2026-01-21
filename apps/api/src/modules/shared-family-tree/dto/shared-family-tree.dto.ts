import {
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
  SharedFamilyTreePaginationResponseSchema,
  SharedFamilyTreeQuerySchema,
  SharedFamilyTreeResponseSchema,
  SharedFamilyTreeUpdateParamSchema,
  SharedFamilyTreeUpdateRequestSchema,
  SharedFamilyTreeUsersPaginationResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class SharedFamilyTreeCreateRequestDto extends createZodDto(
  SharedFamilyTreeCreateRequestSchema,
) {}

class SharedFamilyTreeUpdateRequestDto extends createZodDto(
  SharedFamilyTreeUpdateRequestSchema,
) {}

// param
class SharedFamilyTreeIdParamDto extends createZodDto(
  SharedFamilyTreeIdParamSchema,
) {}

class SharedFamilyTreeUpdateParamDto extends createZodDto(
  SharedFamilyTreeUpdateParamSchema,
) {}

// query

class SharedFamilyTreePaginationQueryDto extends createZodDto(
  SharedFamilyTreeQuerySchema,
) {}

// response
class SharedFamilyTreeResponseDto extends createZodDto(
  SharedFamilyTreeResponseSchema,
) {}

class SharedFamilyTreePaginationResponseDto extends createZodDto(
  SharedFamilyTreePaginationResponseSchema,
) {}

class SharedFamilyTreeUsersPaginationResponseDto extends createZodDto(
  SharedFamilyTreeUsersPaginationResponseSchema,
) {}

export {
  SharedFamilyTreeCreateRequestDto,
  SharedFamilyTreeIdParamDto,
  SharedFamilyTreeUpdateParamDto,
  SharedFamilyTreePaginationQueryDto,
  SharedFamilyTreeUpdateRequestDto,
  SharedFamilyTreeResponseDto,
  SharedFamilyTreePaginationResponseDto,
  SharedFamilyTreeUsersPaginationResponseDto,
};
