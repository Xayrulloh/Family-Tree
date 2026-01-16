import type {
  SharedFamilyTreeArrayResponseType,
  SharedFamilyTreeIdParamType,
  SharedFamilyTreeUsersArrayResponseType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const sharedTree = {
  findAll: (config?: AxiosRequestConfig) => {
    return base.get<SharedFamilyTreeArrayResponseType>(
      `/family-trees/shared`,
      config,
    );
  },
  findUsers: (
    param: SharedFamilyTreeIdParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<SharedFamilyTreeUsersArrayResponseType>(
      `/family-trees/${param.familyTreeId}/shared-users`,
      config,
    );
  },
};
