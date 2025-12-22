import type {
  FamilyTreeMemberConnectionGetAllParamType,
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberConnectionGetByMemberParamType,
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
