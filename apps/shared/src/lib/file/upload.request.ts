import { z } from 'zod';

enum FileUploadFolderEnum {
  AVATAR = 'avatar',
  TREE = 'tree',
}

const FileUploadParamSchema = z.object({
  folder: z.nativeEnum(FileUploadFolderEnum),
});

const FileDeleteParamSchema = FileUploadParamSchema.extend({
  key: z.string().min(1),
});

type FileUploadParamType = z.infer<typeof FileUploadParamSchema>;
type FileDeleteParamType = z.infer<typeof FileDeleteParamSchema>;

export {
  FileUploadFolderEnum,
  FileUploadParamSchema,
  FileUploadParamType,
  FileDeleteParamSchema,
  FileDeleteParamType,
};
