import { z } from 'zod';

const FileUploadResponseSchema = z.object({
  message: z.string().min(1),
  path: z.string().min(1),
});

type FileUploadResponseType = z.infer<typeof FileUploadResponseSchema>;

export { FileUploadResponseSchema, type FileUploadResponseType };
