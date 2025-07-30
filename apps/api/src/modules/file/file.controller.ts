import {
  FileDeleteResponseSchema,
  FileUploadResponseSchema,
} from '@family-tree/shared';
import {
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import type { EnvType } from '~/config/env/env-validation';
import generateRandomString from '~/helpers/random-string.helper';
import type {
  FileDeleteParamDto,
  FileDeleteResponseDto,
  FileUploadParamDto,
  FileUploadResponseDto,
} from './dto/file.dto';
import type { FileService } from './file.service';

@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post(':folder')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiParam({ name: 'folder', required: true, enum: ['avatar', 'tree'] })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiResponse({ status: 422, description: 'File type or size not valid.' })
  @ZodSerializerDto(FileUploadResponseSchema)
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /\/(jpe?g|png)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 5000 * 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Param() param: FileUploadParamDto,
  ): Promise<FileUploadResponseDto> {
    const key = generateRandomString(15);

    await this.fileService.uploadFile(
      param.folder,
      key,
      file.buffer,
      file.mimetype,
    );

    const path = this.configService.get<EnvType['CLOUDFLARE_URL']>(
      'CLOUDFLARE_URL',
    ) as string;

    return {
      message: 'File uploaded successfully',
      path: `${path}/${param.folder}/${key}`,
    };
  }

  @Delete(':folder/:key')
  @ApiParam({ name: 'folder', required: true, enum: ['avatar', 'tree'] })
  @ApiParam({ name: 'key', required: true, type: String })
  @ApiOperation({ summary: 'Delete a file from Cloudflare R2' })
  @ApiResponse({ status: 200, description: 'File deleted successfully.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ZodSerializerDto(FileDeleteResponseSchema)
  async deleteFile(
    @Param() param: FileDeleteParamDto,
  ): Promise<FileDeleteResponseDto> {
    await this.fileService.deleteFile(param.path);

    return { message: 'File deleted successfully' };
  }
}
