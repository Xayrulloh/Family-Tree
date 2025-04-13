import {
  FamilyTreeRelationshipCreateRequestType,
  FamilyTreeRelationshipCreateSonOrDaughterRequestType,
  FamilyTreeRelationshipResponseType,
  FamilyTreeRelationshipUpdateRequestType,
} from '@family-tree/shared';
import { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const treeRelationship = {
  findById: (id: string, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeRelationshipResponseType[]>(`/family-trees${id}/relationships`, config);
  },
  findMemberByIds: (treeId: string, userId: string, config?: AxiosRequestConfig) => {
    return base.get<FamilyTreeRelationshipResponseType[]>(`/family-trees/${treeId}/relationships/${userId}`, config);
  },
  updateRelationship: (treeId: string, userId: string, body: FamilyTreeRelationshipUpdateRequestType, config?: AxiosRequestConfig) => {
    return base.put(`/family-trees/${treeId}/relationships/${userId}`, body, config);
  },
  deleteRelationship: (treeId: string, userId: string, config?: AxiosRequestConfig) => {
    return base.delete(`/family-trees/${treeId}/relationships/${userId}`, config);
  },
  addParent: (treeId: string, body: FamilyTreeRelationshipCreateRequestType, config?: AxiosRequestConfig) => {
    return base.post(`/family-trees/${treeId}/relationships/parent`, body, config);
  },
  addSpouse: (treeId: string, body: FamilyTreeRelationshipCreateRequestType, config?: AxiosRequestConfig) => {
    return base.post(`/family-trees/${treeId}/relationships/spouse`, body, config);
  },
  addDaughter: (treeId: string, body: FamilyTreeRelationshipCreateSonOrDaughterRequestType, config?: AxiosRequestConfig) => {
    return base.post(`/family-trees/${treeId}/relationships/daughter`, body, config);
  },
  addSon: (treeId: string, body: FamilyTreeRelationshipCreateSonOrDaughterRequestType, config?: AxiosRequestConfig) => {
    return base.post(`/family-trees/${treeId}/relationships/son`, body, config);
  },
};
