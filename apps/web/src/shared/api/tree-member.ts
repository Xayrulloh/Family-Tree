import type {
  FamilyTreeMemberCreateChildRequestType,
  FamilyTreeMemberCreateParentsRequestType,
  FamilyTreeMemberCreateSpouseRequestType,
  FamilyTreeMemberGetAllParamType,
  FamilyTreeMemberGetAllResponseType,
  FamilyTreeMemberGetParamType,
  FamilyTreeMemberGetResponseType,
  FamilyTreeMemberUpdateRequestType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { scopeSegment, type TreeScope } from '~/shared/config/tree-scope';
import { base } from './base';

// `scope` selects the access prefix (owner/shared/public). Defaults to owner.
type AllParam = FamilyTreeMemberGetAllParamType & { scope?: TreeScope };
type IdParam = FamilyTreeMemberGetParamType & { scope?: TreeScope };

export const treeMember = {
  findAll: (param: AllParam, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeMemberGetAllResponseType>(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members`,
      config,
    );
  },
  createChild: (
    param: AllParam,
    body: FamilyTreeMemberCreateChildRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members/child`,
      body,
      config,
    );
  },
  createSpouse: (
    param: AllParam,
    body: FamilyTreeMemberCreateSpouseRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members/spouse`,
      body,
      config,
    );
  },
  createParents: (
    param: AllParam,
    body: FamilyTreeMemberCreateParentsRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members/parents`,
      body,
      config,
    );
  },
  update: (
    param: IdParam,
    body: FamilyTreeMemberUpdateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.put(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members/${param.id}`,
      body,
      config,
    );
  },
  delete: (param: IdParam, config?: AxiosRequestConfig) => {
    return base.delete(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members/${param.id}`,
      config,
    );
  },
  findById: (param: IdParam, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}${scopeSegment(param.scope)}/members/${param.id}`,
      config,
    );
  },
};
