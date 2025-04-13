import { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const file = {
  upload: (
    category: 'tree',
    body: FormData,
    config?: AxiosRequestConfig
  ) => {
    return base.post<{ path: string; message: string }>(
      `/files/${category}`,
      body,
      config
    );
  },
  delete: (
    category: 'tree',
    key: string,
    config?: AxiosRequestConfig
  ) => {
    return base.delete<{ message: string }>(`/files/${category}/${key}`, config);
  },
};

