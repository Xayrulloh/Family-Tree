import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type FamilyTreeMemberGetResponseType,
} from '@family-tree/shared';
import { hierarchy, tree } from 'd3-hierarchy';

export type Position = { x: number; y: number };

type FamilyNode = {
  id: string;
  partners: FamilyTreeMemberGetResponseType[];
  children: FamilyNode[];
};

const buildFamilyHierarchy = (
  members: FamilyTreeMemberGetResponseType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): FamilyNode[] => {
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

    const childIds = Array.from(familyChildren.get(familyKey) ?? []);

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
   * Identify root families (no parents)
   * ------------------------------------------- */
  const parentMap = new Map<string, Set<string>>();

  for (const c of connections) {
    if (c.type === FamilyTreeMemberConnectionEnum.PARENT) {
      if (!parentMap.has(c.toMemberId)) {
        parentMap.set(c.toMemberId, new Set());
      }
      parentMap.get(c.toMemberId)?.add(c.fromMemberId);
    }
  }

  function findUltimateRoot(id: string): string {
    let current = id;
    const visited = new Set<string>();

    while (parentMap.has(current)) {
      const parents = Array.from(parentMap.get(current) ?? []);

      if (parents.length === 0) break;
      if (visited.has(current)) break;

      visited.add(current);
      current = parents[0];
    }

    return current;
  }

  const rootIds = new Set(members.map((m) => findUltimateRoot(m.id)));

  const roots = Array.from(rootIds)
    .map((id) => memberMap.get(id))
    .filter(Boolean);

  const rootFamilies = new Set(
    roots.map((m) => {
      if (!m) throw new Error('Member not found');

      return familyKeyOf.get(m.id);
    }),
  );

  const result: FamilyNode[] = [];

  rootFamilies.forEach((familyKey) => {
    if (!familyKey) throw new Error('Family key not found');

    result.push(buildUnit(familyKey));
  });

  return result;
};

export const calculatePositions = (
  members: FamilyTreeMemberGetResponseType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  containerWidth: number,
  verticalGap = 90, // shorter parent-child vertical distance
  horizontalGap = 180, // spacing between subtrees
): Map<string, Position> => {
  const positions = new Map<string, Position>();
  if (members.length === 0) return positions;

  try {
    /* --------------------------------------------
     * 1. Build hierarchy (FamilyUnits instead of persons)
     * -------------------------------------------- */
    const trees = buildFamilyHierarchy(members, connections);

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

    return shifted;
  } catch (err) {
    console.error('D3 layout error:', err);

    members.forEach((m, i) => positions.set(m.id, { x: i * 200, y: 100 }));

    return positions;
  }
};

// Helpers
export const getCouples = (
  connections: FamilyTreeMemberConnectionGetAllResponseType,
) =>
  connections.filter((c) => c.type === FamilyTreeMemberConnectionEnum.SPOUSE);
