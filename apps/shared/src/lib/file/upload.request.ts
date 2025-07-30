import { z } from 'zod';

const enum FileUploadFolderEnum {
  AVATAR = 'avatar',
  TREE = 'tree',
}

const FileUploadParamSchema = z.object({
  folder: z.enum([FileUploadFolderEnum.AVATAR, FileUploadFolderEnum.TREE]),
});

type FileUploadParamType = z.infer<typeof FileUploadParamSchema>;

export { FileUploadFolderEnum, FileUploadParamSchema, FileUploadParamType };
