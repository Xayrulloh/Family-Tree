import type {
  FamilyTreeMemberConnectionCreateRequestType,
  FamilyTreeMemberConnectionGetAllParamType,
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberConnectionGetByMemberParamType,
  FamilyTreeMemberConnectionGetParamType,
  FamilyTreeMemberConnectionUpdateRequestType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const treeMemberConnection = {
  findAll: (
    param: FamilyTreeMemberConnectionGetAllParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeMemberConnectionGetAllResponseType>(
      `/family-trees/${param.familyTreeId}/members/connections`,
      config,
    );
  },
  create: (
    param: FamilyTreeMemberConnectionGetAllParamType,
    body: FamilyTreeMemberConnectionCreateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberConnectionGetAllResponseType>(
      `/family-trees/${param.familyTreeId}/members/connections`,
      body,
      config,
    );
  },
  update: (
    param: FamilyTreeMemberConnectionGetParamType,
    body: FamilyTreeMemberConnectionUpdateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.put(
      `/family-trees/${param.familyTreeId}/members/connections/${param.id}`,
      body,
      config,
    );
  },
  delete: (
    param: FamilyTreeMemberConnectionGetParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.delete(
      `/family-trees/${param.familyTreeId}/members/connections/${param.id}`,
      config,
    );
  },
  findById: (
    param: FamilyTreeMemberConnectionGetByMemberParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeMemberConnectionGetAllResponseType>(
      `/family-trees/${param.familyTreeId}/members/${param.memberUserId}/connections`,
      config,
    );
  },
};
