import {
  SharedFamilyTreeArrayResponseSchema,
  SharedFamilyTreeCreateRequestSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class SharedFamilyTreeCreateRequestDto extends createZodDto(
  SharedFamilyTreeCreateRequestSchema,
) {}

// response
class SharedFamilyTreeArrayResponseDto extends createZodDto(
  SharedFamilyTreeArrayResponseSchema,
) {}

export { SharedFamilyTreeCreateRequestDto, SharedFamilyTreeArrayResponseDto };
