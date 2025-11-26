import { z } from 'zod';

enum FileUploadFolderEnum {
  AVATAR = 'avatar',
  TREE = 'tree',
  TREE_MEMBER = 'tree-member',
}

const FileUploadParamSchema = z.object({
  folder: z.enum([FileUploadFolderEnum.AVATAR, FileUploadFolderEnum.TREE]),
});

type FileUploadParamType = z.infer<typeof FileUploadParamSchema>;

export {
  FileUploadFolderEnum,
  FileUploadParamSchema,
  type FileUploadParamType,
};
