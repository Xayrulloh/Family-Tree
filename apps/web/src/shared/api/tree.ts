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
    const params = new URLSearchParams({
      page: String(query.page),
      perPage: String(query.perPage),
    });
    if (query.name) params.set('name', query.name);
    if (query.isPublic !== undefined)
      params.set('isPublic', String(query.isPublic));

    return base.get<FamilyTreePaginationResponseType>(
      `/family-trees?${params.toString()}`,
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
