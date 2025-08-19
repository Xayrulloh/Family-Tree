import type { FileUploadFolderEnum } from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const file = {
  upload: (
    category: FileUploadFolderEnum,
    body: FormData,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<{ path: string; message: string }>(
      `/files/${category}`,
      body,
      config,
    );
  },
  delete: (
    category: FileUploadFolderEnum,
    key: string,
    config?: AxiosRequestConfig,
  ) => {
    return base.delete<{ message: string }>(
      `/files/${category}/${key}`,
      config,
    );
  },
};
