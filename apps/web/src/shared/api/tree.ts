import type {
  FamilyTreeCreateRequestType,
  FamilyTreePaginationAndSearchQueryType,
  FamilyTreePaginationResponseType,
  FamilyTreeResponseType,
  FamilyTreeUpdateRequestType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const tree = {
  findAll: (
    query: FamilyTreePaginationAndSearchQueryType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreePaginationResponseType>(
      `/family-trees?page=${query.page}&perPage=${query.perPage}${query.name ? `&name=${query.name}` : ''}`,
      config,
    );
  },
  create: (body: FamilyTreeCreateRequestType, config?: AxiosRequestConfig) => {
    return base.post('/family-trees', body, config);
  },
  update: (
    id: string,
    body: FamilyTreeUpdateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.put(`/family-trees/${id}`, body, config);
  },
  delete: (id: string, config?: AxiosRequestConfig) => {
    return base.delete(`/family-trees/${id}`, config);
  },
  findById: (id: string, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeResponseType>(`/family-trees/${id}`, config);
  },
};
