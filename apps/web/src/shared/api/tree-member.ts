import type {
  FamilyTreeMemberCreateChildRequestType,
  FamilyTreeMemberCreateParentsRequestType,
  FamilyTreeMemberCreateSpouseRequestType,
  FamilyTreeMemberDeletePreviewType,
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
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members`,
      config,
    );
  },
  createChild: (
    param: AllParam,
    body: FamilyTreeMemberCreateChildRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/child`,
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
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/spouse`,
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
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/parents`,
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
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/${param.id}`,
      body,
      config,
    );
  },
  deletePreview: (param: IdParam, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeMemberDeletePreviewType>(
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/${param.id}/delete-preview`,
      config,
    );
  },
  delete: (param: IdParam, config?: AxiosRequestConfig) => {
    return base.delete(
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/${param.id}`,
      config,
    );
  },
  findById: (param: IdParam, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeMemberGetResponseType>(
      `/family-trees${scopeSegment(param.scope)}/${param.familyTreeId}/members/${param.id}`,
      config,
    );
  },
};
