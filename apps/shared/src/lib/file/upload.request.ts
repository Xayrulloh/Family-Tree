import { z } from 'zod';

enum FileUploadFolderEnum {
  AVATAR = 'avatar',
  TREE = 'tree',
}

const FileUploadParamSchema = z.object({
  folder: z.nativeEnum(FileUploadFolderEnum),
});

type FileUploadParamType = z.infer<typeof FileUploadParamSchema>;

export { FileUploadFolderEnum, FileUploadParamSchema, FileUploadParamType };
