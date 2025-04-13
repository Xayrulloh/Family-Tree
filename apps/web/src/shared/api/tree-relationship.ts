import {
  FamilyTreeRelationshipCreateRequestType,
  FamilyTreeRelationshipCreateSonOrDaughterRequestType,
  FamilyTreeRelationshipResponseType,
  FamilyTreeRelationshipUpdateRequestType,
} from '@family-tree/shared';
import { base } from './base';

export const treeRelationship = {
  findById: (id: string) => {
    return base.get<FamilyTreeRelationshipResponseType[]>(`/family-trees${id}/relationships`);
  },
  findMemberByIds: (treeId: string, userId: string) => {
    return base.get<FamilyTreeRelationshipResponseType[]>(`/family-trees/${treeId}/relationships/${userId}`);
  },
  updateRelationship: (treeId: string, userId: string, body: FamilyTreeRelationshipUpdateRequestType) => {
    return base.put(`/family-trees/${treeId}/relationships/${userId}`, body);
  },
  deleteRelationship: (treeId: string, userId: string) => {
    return base.delete(`/family-trees/${treeId}/relationships/${userId}`);
  },
  addParent: (treeId: string, body: FamilyTreeRelationshipCreateRequestType) => {
    return base.post(`/family-trees/${treeId}/relationships/parent`, body);
  },
  addSpouse: (treeId: string, body: FamilyTreeRelationshipCreateRequestType) => {
    return base.post(`/family-trees/${treeId}/relationships/spouse`, body);
  },
  addDaughter: (treeId: string, body: FamilyTreeRelationshipCreateSonOrDaughterRequestType) => {
    return base.post(`/family-trees/${treeId}/relationships/daughter`, body);
  },
  addSon: (treeId: string, body: FamilyTreeRelationshipCreateSonOrDaughterRequestType) => {
    return base.post(`/family-trees/${treeId}/relationships/son`, body);
  },
};
