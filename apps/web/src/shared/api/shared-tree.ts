import type { SharedFamilyTreeArrayResponseType } from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const sharedTree = {
  findAll: (config?: AxiosRequestConfig) => {
    return base.get<SharedFamilyTreeArrayResponseType>(`/shared-family-trees`, config);
  }
};
