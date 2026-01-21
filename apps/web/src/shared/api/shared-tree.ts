import type {
  SharedFamilyTreeIdParamType,
  SharedFamilyTreePaginationAndSearchQueryType,
  SharedFamilyTreePaginationResponseType,
  SharedFamilyTreeResponseType,
  SharedFamilyTreeUpdateParamType,
  SharedFamilyTreeUpdateRequestType,
  SharedFamilyTreeUsersPaginationResponseType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const sharedTree = {
  findAll: (
    query: SharedFamilyTreePaginationAndSearchQueryType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<SharedFamilyTreePaginationResponseType>(
      `/family-trees/shared?page=${query.page}&perPage=${query.perPage}${query.name ? `&name=${query.name}` : ''}`,
      config,
    );
  },
  findById: (
    param: SharedFamilyTreeIdParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<SharedFamilyTreeResponseType>(
      `/family-trees/${param.familyTreeId}/shared`,
      config,
    );
  },
  findUsers: (
    param: SharedFamilyTreeIdParamType,
    query: SharedFamilyTreePaginationAndSearchQueryType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<SharedFamilyTreeUsersPaginationResponseType>(
      `/family-trees/${param.familyTreeId}/shared-users?page=${query.page}&perPage=${query.perPage}${query.name ? `&name=${query.name}` : ''}`,
      config,
    );
  },
  update: (
    param: SharedFamilyTreeUpdateParamType,
    body: SharedFamilyTreeUpdateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.put<void>(
      `/family-trees/${param.familyTreeId}/shared-users/${param.userId}`,
      body,
      config,
    );
  },
};
