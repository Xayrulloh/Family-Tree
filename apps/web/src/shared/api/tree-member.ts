import type {
  FamilyTreeMemberCreateChildRequestType,
  FamilyTreeMemberCreateParentsRequestType,
  FamilyTreeMemberCreateRequestType,
  FamilyTreeMemberCreateSpouseRequestType,
  FamilyTreeMemberGetAllParamType,
  FamilyTreeMemberGetAllResponseType,
  FamilyTreeMemberGetParamType,
  FamilyTreeMemberGetResponseType,
  FamilyTreeMemberUpdateRequestType,
} from '@family-tree/shared';
import type { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const treeMember = {
  findAll: (
    param: FamilyTreeMemberGetAllParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeMemberGetAllResponseType>(
      `/family-trees/${param.familyTreeId}/members`,
      config,
    );
  },
  create: (
    param: FamilyTreeMemberGetAllParamType,
    body: FamilyTreeMemberCreateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}/members`,
      body,
      config,
    );
  },
  createChild: (
    param: FamilyTreeMemberGetAllParamType,
    body: FamilyTreeMemberCreateChildRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}/members/child`,
      body,
      config,
    );
  },
  createSpouse: (
    param: FamilyTreeMemberGetAllParamType,
    body: FamilyTreeMemberCreateSpouseRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}/members/spouse`,
      body,
      config,
    );
  },
  createParents: (
    param: FamilyTreeMemberGetAllParamType,
    body: FamilyTreeMemberCreateParentsRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.post<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}/members/parents`,
      body,
      config,
    );
  },
  update: (
    param: FamilyTreeMemberGetParamType,
    body: FamilyTreeMemberUpdateRequestType,
    config?: AxiosRequestConfig,
  ) => {
    return base.put(
      `/family-trees/${param.familyTreeId}/members/${param.id}`,
      body,
      config,
    );
  },
  delete: (
    param: FamilyTreeMemberGetParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.delete(
      `/family-trees/${param.familyTreeId}/members/${param.id}`,
      config,
    );
  },
  findById: (
    param: FamilyTreeMemberGetParamType,
    config?: AxiosRequestConfig,
  ) => {
    return base.get<FamilyTreeMemberGetResponseType>(
      `/family-trees/${param.familyTreeId}/members/${param.id}`,
      config,
    );
  },
};
