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
  setCardDim: (dim: {
    w: number;
    h: number;
    img_w: number;
    img_h: number;
    img_x: number;
    img_y: number;
  }) => F3CardHtml;
  setCardDisplay: (fns: Array<(d: F3Datum) => string>) => F3CardHtml;
  setCardImageField: (field: string) => F3CardHtml;
  setOnCardUpdate: (
    fn: (this: HTMLElement, d: F3NodeDatum) => void,
  ) => F3CardHtml;
}

export interface F3Chart {
  setSingleParentEmptyCard: (value: boolean) => void;
  setCardHtml: () => F3CardHtml;
  updateData: (data: F3Datum[]) => void;
  updateTree: (options: F3UpdateTreeOptions) => void;
}

const pushTo = (map: Map<string, string[]>, key: string, value: string) => {
  const arr = map.get(key);

  if (arr) arr.push(value);
  else map.set(key, [value]);
};

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
      pushTo(spousesMap, c.fromMemberId, c.toMemberId);
      pushTo(spousesMap, c.toMemberId, c.fromMemberId);
    } else if (c.type === FamilyTreeMemberConnectionEnum.PARENT) {
      // fromMember is parent of toMember
      pushTo(childrenMap, c.fromMemberId, c.toMemberId);
      pushTo(parentsMap, c.toMemberId, c.fromMemberId);
    }
  }

  const sortKeyMap = new Map<string, number>();
  const result: F3Datum[] = [];

  let mainIdx = -1;

  for (let i = 0; i < members.length; i++) {
    const m = members[i];

    sortKeyMap.set(
      m.id,
      (m.dob ? new Date(m.dob) : new Date(m.createdAt)).getTime(),
    );

    result.push({
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
    });

    if (mainMemberId && m.id === mainMemberId) mainIdx = i;
  }

  // Sort children oldest-first (dob preferred, createdAt as fallback)
  for (const node of result) {
    if (node.rels.children.length > 1) {
      node.rels.children.sort(
        (a, b) => (sortKeyMap.get(a) ?? 0) - (sortKeyMap.get(b) ?? 0),
      );
    }
  }

  if (mainIdx > 0) result.unshift(...result.splice(mainIdx, 1));

  return result;
};
