import type {
  FamilyTreeMemberConnectionGetAllParamType,
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberConnectionGetByMemberParamType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { scopeSegment, type TreeScope } from '~/shared/config/tree-scope';
import { base } from './base';

// `scope` selects the access prefix (owner/shared/public). Defaults to owner.
type AllParam = FamilyTreeMemberConnectionGetAllParamType & {
  scope?: TreeScope;
};
type ByMemberParam = FamilyTreeMemberConnectionGetByMemberParamType & {
  scope?: TreeScope;
};

export const treeMemberConnection = {
  findAll: (param: AllParam, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeMemberConnectionGetAllResponseType>(
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/connections`,
      config,
    );
  },
  findById: (param: ByMemberParam, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeMemberConnectionGetAllResponseType>(
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/${param.memberUserId}/connections`,
      config,
    );
  },
};
