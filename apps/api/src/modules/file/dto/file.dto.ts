import {
  FileUploadParamSchema,
  FileUploadResponseSchema,
} from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// request
class FileUploadParamDto extends createZodDto(FileUploadParamSchema) {}

// response
class FileUploadResponseDto extends createZodDto(FileUploadResponseSchema) {}

export { FileUploadParamDto, FileUploadResponseDto };
