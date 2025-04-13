import {
  FamilyTreeCreateRequestType,
  FamilyTreeResponseType,
  FamilyTreeUpdateRequestType,
} from '@family-tree/shared';
import { base } from './base';

export const tree = {
  findAll: () => {
    return base.get<FamilyTreeResponseType[]>('/family-trees');
  },
  create: (body: FamilyTreeCreateRequestType) => {
    return base.post('/family-trees', body);
  },
  update: (id: string, body: FamilyTreeUpdateRequestType) => {
    return base.put(`/family-trees/${id}`, body);
  },
  delete: (id: string) => {
    return base.delete(`/family-trees/${id}`);
  },
  findPublics: (name: string) => {
    return base.get<FamilyTreeResponseType[]>(
      `/family-trees/publics?name=${name}`
    );
  },
  findById: (id: string) => {
    return base.get<FamilyTreeResponseType>(`/family-trees/${id}`);
  },
};
