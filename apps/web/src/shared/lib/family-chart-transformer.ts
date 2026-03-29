import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type FamilyTreeMemberGetAllResponseType,
  UserGenderEnum,
} from '@family-tree/shared';

export type F3Datum = {
  id: string;
  data: {
    gender: 'M' | 'F';
    name: string;
    image: string | null;
    dob: string | null;
    dod: string | null;
    familyTreeId: string;
  };
  rels: {
    spouses: string[];
    children: string[];
    parents: string[];
  };
};

// ── family-chart internal types (library has no TS types) ────────────────────

export interface F3NodeDatum {
  data: F3Datum;
}

export interface F3UpdateTreeOptions {
  initial?: boolean;
  tree_position?: 'main_to_middle' | 'inherit';
  transition_time?: number;
}

export interface F3CardHtml {
  setCardDim: (dim: { w: number; h: number; img_w: number; img_h: number; img_x: number; img_y: number }) => F3CardHtml;
  setCardDisplay: (fns: Array<(d: F3Datum) => string>) => F3CardHtml;
  setCardImageField: (field: string) => F3CardHtml;
  setOnCardUpdate: (fn: (this: HTMLElement, d: F3NodeDatum) => void) => F3CardHtml;
}

export interface F3Chart {
  setSingleParentEmptyCard: (value: boolean) => void;
  setCardHtml: () => F3CardHtml;
  updateData: (data: F3Datum[]) => void;
  updateTree: (options: F3UpdateTreeOptions) => void;
}

export const toF3Data = (
  members: FamilyTreeMemberGetAllResponseType,
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  mainMemberId?: string | null,
): F3Datum[] => {
  const spousesMap = new Map<string, string[]>();
  const childrenMap = new Map<string, string[]>();
  const parentsMap = new Map<string, string[]>();

  for (const c of connections) {
    if (c.type === FamilyTreeMemberConnectionEnum.SPOUSE) {
      spousesMap.set(c.fromMemberId, [
        ...(spousesMap.get(c.fromMemberId) ?? []),
        c.toMemberId,
      ]);

      spousesMap.set(c.toMemberId, [
        ...(spousesMap.get(c.toMemberId) ?? []),
        c.fromMemberId,
      ]);
    } else if (c.type === FamilyTreeMemberConnectionEnum.PARENT) {
      // fromMember is parent of toMember
      childrenMap.set(c.fromMemberId, [
        ...(childrenMap.get(c.fromMemberId) ?? []),
        c.toMemberId,
      ]);

      parentsMap.set(c.toMemberId, [
        ...(parentsMap.get(c.toMemberId) ?? []),
        c.fromMemberId,
      ]);
    }
  }

  const result = members.map((m) => ({
    id: m.id,
    data: {
      gender: (m.gender === UserGenderEnum.MALE
        ? 'M'
        : 'F') as F3Datum['data']['gender'],
      name: m.name,
      image: m.image,
      dob: m.dob,
      dod: m.dod,
      familyTreeId: m.familyTreeId,
    },
    rels: {
      spouses: spousesMap.get(m.id) ?? [],
      children: childrenMap.get(m.id) ?? [],
      parents: parentsMap.get(m.id) ?? [],
    },
  }));

  if (mainMemberId) {
    const idx = result.findIndex((d) => d.id === mainMemberId);

    if (idx > 0) result.unshift(...result.splice(idx, 1));
  }

  return result;
};
