import { base } from './base';

export const file = {
  upload: (category: 'tree', body: FormData) => {
    return base.post<{ path: string; message: string }>(
      `/files/${category}`,
      body
    );
  },
  delete: (category: 'tree', key: string) => {
    return base.delete<{ message: string }>(`/files/${category}/${key}`);
  },
};
