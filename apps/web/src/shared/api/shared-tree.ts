import type {
  FamilyTreeSharedIdParamType,
  FamilyTreeSharedPaginationAndSearchQueryType,
  FamilyTreeSharedPaginationResponseType,
  FamilyTreeSharedResponseType,
  FamilyTreeSharedUpdateParamType,
  FamilyTreeSharedUpdateRequestType,
  FamilyTreeSharedUsersPaginationResponseType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const sharedTree = {
  findAll: (
    query: FamilyTreeSharedPaginationAndSearchQueryType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeSharedPaginationResponseType>(
      `/family-trees/shared?page=${query.page}&perPage=${query.perPage}${query.name ? `&name=${encodeURIComponent(query.name)}` : ''}`,
      config,
    );
  },
  findById: (
    param: FamilyTreeSharedIdParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeSharedResponseType>(
      `/family-trees/shared/${param.familyTreeId}`,
      config,
    );
  },
  findUsers: (
    param: FamilyTreeSharedIdParamType,
    query: FamilyTreeSharedPaginationAndSearchQueryType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeSharedUsersPaginationResponseType>(
      `/family-trees/shared/${param.familyTreeId}/users?page=${query.page}&perPage=${query.perPage}${query.name ? `&name=${encodeURIComponent(query.name)}` : ''}`,
      config,
    );
  },
  update: (
    param: FamilyTreeSharedUpdateParamType,
    body: FamilyTreeSharedUpdateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.put<void>(
      `/family-trees/shared/${param.familyTreeId}/users/${param.userId}`,
      body,
      config,
    );
  },
};
