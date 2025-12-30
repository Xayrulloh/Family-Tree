import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type FamilyTreeMemberGetResponseType,
} from '@family-tree/shared';
import { hierarchy, tree } from 'd3-hierarchy';

export type Position = { x: number; y: number };

export type MemberMetadata = {
  id: string;
  position: Position;
  spouseId: string | null;
  isParent: boolean;
  children: string[];
  parents: string[];
  familyKey: string;
  coupleCenterPosition: Position | null;
};

export type LayoutResult = {
  positions: Map<string, Position>;
  metadata: Map<string, MemberMetadata>;
  couples: FamilyTreeMemberConnectionGetAllResponseType;
};

type FamilyNode = {
  id: string;
  partners: FamilyTreeMemberGetResponseType[];
  children: FamilyNode[];
};

const buildFamilyHierarchy = (
  members: FamilyTreeMemberGetResponseType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): {
  trees: FamilyNode[];
  spouseMap: Map<string, Set<string>>;
  familyKeyOf: Map<string, string>;
  familyChildren: Map<string, Set<string>>;
  parentMap: Map<string, Set<string>>;
} => {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  /* -------------------------------------------
   * Build spouse pairs (bidirectional)
   * ------------------------------------------- */
  const spouseMap = new Map<string, Set<string>>();

  connections.forEach((c) => {
    if (c.type === FamilyTreeMemberConnectionEnum.SPOUSE) {
      if (!spouseMap.has(c.fromMemberId)) {
        spouseMap.set(c.fromMemberId, new Set());
      }
      if (!spouseMap.has(c.toMemberId)) {
        spouseMap.set(c.toMemberId, new Set());
      }
      spouseMap.get(c.fromMemberId)?.add(c.toMemberId);
      spouseMap.get(c.toMemberId)?.add(c.fromMemberId);
    }
  });

  /* -------------------------------------------
   * Create family keys (couple-id or single)
   * ------------------------------------------- */
  const familyKeyOf = new Map<string, string>();

  members.forEach((m) => {
    const spouses = spouseMap.get(m.id);

    if (spouses && spouses.size === 1) {
      const [s] = Array.from(spouses);
      const key = [m.id, s].sort().join('-');

      familyKeyOf.set(m.id, key);
      familyKeyOf.set(s, key);
    } else {
      // single or multi-spouse (rare)
      familyKeyOf.set(m.id, m.id);
    }
  });

  /* -------------------------------------------
   * Build children mapping per familyKey
   * ------------------------------------------- */
  const familyChildren = new Map<string, Set<string>>();

  connections.forEach((c) => {
    if (c.type === FamilyTreeMemberConnectionEnum.PARENT) {
      const parentFamily = familyKeyOf.get(c.fromMemberId);

      if (!parentFamily) return;

      if (!familyChildren.has(parentFamily)) {
        familyChildren.set(parentFamily, new Set());
      }

      familyChildren.get(parentFamily)?.add(c.toMemberId);
    }
  });

  /* -------------------------------------------
   * Build FamilyNode tree recursively
   * ------------------------------------------- */

  const visitedFamilies = new Set<string>();

  const buildUnit = (familyKey: string): FamilyNode => {
    if (visitedFamilies.has(familyKey)) {
      // Prevent loops
      return { id: familyKey, partners: [], children: [] };
    }

    visitedFamilies.add(familyKey);

    const partnerIds = members
      .filter((m) => familyKeyOf.get(m.id) === familyKey)
      .map((m) => m.id);

    const partners = partnerIds
      .map((id) => memberMap.get(id))
      .filter(Boolean) as FamilyTreeMemberGetResponseType[];

    // sort children by dob
    const childIds = Array.from(familyChildren.get(familyKey) ?? []).sort(
      (a, b) => {
        const mA = memberMap.get(a);
        const mB = memberMap.get(b);

        if (!mA?.dob && !mB?.dob) return 0;
        if (!mA?.dob) return 1;
        if (!mB?.dob) return -1;

        return mA.dob.localeCompare(mB.dob);
      },
    );

    const childNodes = childIds
      .map((cid) => familyKeyOf.get(cid))
      .map((childFamily) => {
        if (!childFamily) throw new Error('Family key not found');

        return buildUnit(childFamily);
      });

    return {
      id: familyKey,
      partners,
      children: childNodes,
    };
  };

  /* -------------------------------------------
   * Find root families for tree construction
   * ------------------------------------------- */
  function findUltimateRootFamily(
    familyKey: string,
    parentMapLocal: Map<string, Set<string>>,
  ): string {
    let current = familyKey;
    const visited = new Set<string>();

    while (parentMapLocal.has(current)) {
      const parents = Array.from(parentMapLocal.get(current) ?? []);

      if (parents.length === 0) break;
      if (visited.has(current)) break;

      visited.add(current);
      current = parents[0];
    }

    return current;
  }

  // Build temporary parent map for finding roots
  const tempParentMap = new Map<string, Set<string>>();

  for (const c of connections) {
    if (c.type !== FamilyTreeMemberConnectionEnum.PARENT) continue;

    const parentFamily = familyKeyOf.get(c.fromMemberId);
    const childFamily = familyKeyOf.get(c.toMemberId);

    if (!parentFamily || !childFamily) continue;

    if (!tempParentMap.has(childFamily)) {
      tempParentMap.set(childFamily, new Set());
    }

    tempParentMap.get(childFamily)?.add(parentFamily);
  }

  const rootFamilies = new Set(
    members.map((m) =>
      findUltimateRootFamily(familyKeyOf.get(m.id) ?? '', tempParentMap),
    ),
  );

  const result: FamilyNode[] = [];

  // Build parent map using family keys
  const parentMapByFamily = new Map<string, Set<string>>();

  for (const c of connections) {
    if (c.type !== FamilyTreeMemberConnectionEnum.PARENT) continue;

    const parentFamily = familyKeyOf.get(c.fromMemberId);
    const childFamily = familyKeyOf.get(c.toMemberId);

    if (!parentFamily || !childFamily) continue;

    if (!parentMapByFamily.has(childFamily)) {
      parentMapByFamily.set(childFamily, new Set());
    }

    parentMapByFamily.get(childFamily)?.add(parentFamily);
  }

  rootFamilies.forEach((familyKey) => {
    if (!familyKey) throw new Error('Family key not found');

    result.push(buildUnit(familyKey));
  });

  return {
    trees: result,
    spouseMap,
    familyKeyOf,
    familyChildren,
    parentMap: parentMapByFamily,
  };
};

export const calculatePositions = (
  members: FamilyTreeMemberGetResponseType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  containerWidth: number,
  verticalGap = 90, // shorter parent-child vertical distance
  horizontalGap = 180, // spacing between subtrees
): LayoutResult => {
  const positions = new Map<string, Position>();
  const metadata = new Map<string, MemberMetadata>();
  const couples = connections.filter(
    (c) => c.type === FamilyTreeMemberConnectionEnum.SPOUSE,
  );

  if (members.length === 0) {
    return { positions, metadata, couples };
  }

  try {
    /* --------------------------------------------
     * 1. Build hierarchy (FamilyUnits instead of persons)
     * -------------------------------------------- */
    const { trees, spouseMap, familyKeyOf, familyChildren, parentMap } =
      buildFamilyHierarchy(members, connections);

    /* --------------------------------------------
     * 2. D3 tree generator with NEW vertical spacing
     * -------------------------------------------- */
    const treeLayout = tree<FamilyNode>()
      .nodeSize([horizontalGap, verticalGap]) // ← reduced gaps for parent-child
      .separation((a, b) => (a.parent === b.parent ? 1.3 : 2));

    let offsetX = 0;

    /* --------------------------------------------
     * 3. Place each root tree side-by-side
     * -------------------------------------------- */
    for (const t of trees) {
      const root = hierarchy(t);
      const layout = treeLayout(root);

      const xs = layout.descendants().map((n) => n.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const treeWidth = maxX - minX;

      /* --------------------------------------------
       * 4. Place partners horizontally inside each FamilyUnit
       * -------------------------------------------- */
      layout.descendants().forEach((node) => {
        const cx = offsetX + (node.x - minX);
        const cy = node.y;

        const partners = node.data.partners;
        const partnerCount = partners.length;

        const totalWidth = (partnerCount - 1) * 100;
        const partnerPositions: Position[] = [];

        partners.forEach((p, i) => {
          const dx = partnerCount > 1 ? i * 100 - totalWidth / 2 : 0;
          const pos = { x: cx + dx, y: cy };

          positions.set(p.id, pos);
          partnerPositions.push(pos);
        });

        /* --------------------------------------------
         * 5. Save couple center (for child line origins)
         * -------------------------------------------- */
        if (partnerPositions.length > 0) {
          const avgX =
            partnerPositions.reduce((acc, p) => acc + p.x, 0) /
            partnerPositions.length;

          positions.set(`family-${node.data.id}`, {
            x: avgX,
            y: cy,
          });
        }
      });

      offsetX += treeWidth + horizontalGap * 1.5;
    }

    /* --------------------------------------------
     * 6. Center EVERYTHING inside containerWidth
     * -------------------------------------------- */
    let minX = Infinity;
    let maxX = -Infinity;

    positions.forEach((pos) => {
      if (pos.x < minX) minX = pos.x;
      if (pos.x > maxX) maxX = pos.x;
    });

    const usedWidth = maxX - minX;
    const offsetToCenter = (containerWidth - usedWidth) / 2 - minX;

    /* --------------------------------------------
     * 7. Apply centering + top padding
     * -------------------------------------------- */
    const shifted = new Map<string, Position>();

    positions.forEach((p, id) =>
      shifted.set(id, { x: p.x + offsetToCenter, y: p.y + 40 }),
    );

    /* --------------------------------------------
     * 8. Build comprehensive metadata HashMap
     * -------------------------------------------- */
    members.forEach((member) => {
      const position = shifted.get(member.id);
      if (!position) return;

      const familyKey = familyKeyOf.get(member.id) ?? member.id;
      const spouses = spouseMap.get(member.id);
      const spouseId =
        spouses && spouses.size === 1 ? Array.from(spouses)[0] : null;

      // Check if this member is a parent
      const memberFamilyKey = familyKeyOf.get(member.id);
      const hasChildren = !!(
        memberFamilyKey && familyChildren.has(memberFamilyKey)
      );

      // Get children IDs
      const childrenSet = memberFamilyKey
        ? familyChildren.get(memberFamilyKey)
        : undefined;
      const children = childrenSet ? Array.from(childrenSet) : [];

      // Get parents IDs
      const parentsSet = memberFamilyKey
        ? parentMap.get(memberFamilyKey)
        : undefined;
      const parentFamilies = parentsSet ? Array.from(parentsSet) : [];
      const parents: string[] = [];
      parentFamilies.forEach((pf) => {
        members.forEach((m) => {
          if (familyKeyOf.get(m.id) === pf) {
            parents.push(m.id);
          }
        });
      });

      // Get couple center position if married
      let coupleCenterPosition: Position | null = null;
      if (spouseId) {
        const spousePosition = shifted.get(spouseId);
        if (spousePosition) {
          coupleCenterPosition = {
            x: (position.x + spousePosition.x) / 2,
            y: (position.y + spousePosition.y) / 2,
          };
        }
      }

      metadata.set(member.id, {
        id: member.id,
        position,
        spouseId,
        isParent: hasChildren,
        children,
        parents,
        familyKey,
        coupleCenterPosition,
      });
    });

    return { positions: shifted, metadata, couples };
  } catch (err) {
    console.error('D3 layout error:', err);

    members.forEach((m, i) => {
      const position = { x: i * 200, y: 100 };
      positions.set(m.id, position);
      metadata.set(m.id, {
        id: m.id,
        position,
        spouseId: null,
        isParent: false,
        children: [],
        parents: [],
        familyKey: m.id,
        coupleCenterPosition: null,
      });
    });

    return { positions, metadata, couples };
  }
};

// Helpers
export const getCouples = (
  connections: FamilyTreeMemberConnectionGetAllResponseType,
) =>
  connections.filter((c) => c.type === FamilyTreeMemberConnectionEnum.SPOUSE);
