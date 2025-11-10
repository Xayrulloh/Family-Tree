import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
} from '@family-tree/shared';
import { hierarchy, tree } from 'd3-hierarchy';

export type Position = { x: number; y: number };

type FamilyNode = {
  id: string;
  partners: MemberSchemaType[];
  children: FamilyNode[];
};

const buildFamilyHierarchy = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): FamilyNode[] => {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const spouseMap = new Map<string, Set<string>>();
  const childMap = new Map<string, Set<string>>();

  // Build relationship maps
  for (const c of connections) {
    if (c.type === FamilyTreeMemberConnectionEnum.SPOUSE) {
      if (!spouseMap.has(c.fromMemberId)) {
        spouseMap.set(c.fromMemberId, new Set());
      }
      if (!spouseMap.has(c.toMemberId)) {
        spouseMap.set(c.toMemberId, new Set());
      }

      spouseMap.get(c.fromMemberId)?.add(c.toMemberId);
      spouseMap.get(c.toMemberId)?.add(c.fromMemberId);
    } else if (c.type === FamilyTreeMemberConnectionEnum.PARENT) {
      if (!childMap.has(c.fromMemberId)) {
        childMap.set(c.fromMemberId, new Set());
      }

      childMap.get(c.fromMemberId)?.add(c.toMemberId);
    }
  }

  const visited = new Set<string>();

  const buildNode = (memberId: string): FamilyNode | null => {
    if (visited.has(memberId)) {
      return null;
    }

    const member = memberMap.get(memberId);

    if (!member) {
      return null;
    }

    const spouses = spouseMap.get(memberId) ?? new Set();
    const partners = [
      member,
      ...(Array.from(spouses)
        .map((id) => memberMap.get(id))
        .filter(Boolean) as MemberSchemaType[]),
    ];

    partners.forEach((p) => visited.add(p.id));

    const allChildren = new Set<string>();

    for (const p of partners) {
      const kids = childMap.get(p.id);

      if (kids) {
        kids.forEach((k) => allChildren.add(k));
      }
    }

    const childrenNodes = Array.from(allChildren)
      .map((id) => buildNode(id))
      .filter(Boolean) as FamilyNode[];

    return { id: member.id, partners, children: childrenNodes };
  };

  // Find roots (no parents)
  const hasParent = new Set<string>();

  for (const c of connections) {
    if (c.type === FamilyTreeMemberConnectionEnum.PARENT) {
      hasParent.add(c.toMemberId);
    }
  }

  const roots = members.filter((m) => !hasParent.has(m.id));

  const result: FamilyNode[] = [];

  for (const root of roots) {
    const node = buildNode(root.id);

    if (node) {
      result.push(node);
    }
  }

  // Unconnected members
  for (const m of members) {
    if (!visited.has(m.id)) {
      result.push({ id: m.id, partners: [m], children: [] });
    }
  }

  return result;
};

export const calculatePositions = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  containerWidth = 1200,
): Map<string, Position> => {
  const positions = new Map<string, Position>();

  if (members.length === 0) {
    return positions;
  }

  try {
    const trees = buildFamilyHierarchy(members, connections);
    const treeLayout = tree<FamilyNode>()
      .nodeSize([220, 180])
      .separation((a, b) => (a.parent === b.parent ? 1.4 : 2));

    let offsetX = 0;

    for (const t of trees) {
      const root = hierarchy(t);
      const layout = treeLayout(root);

      const xs = layout.descendants().map((n) => n.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const treeWidth = maxX - minX;

      layout.descendants().forEach((node) => {
        const cx = offsetX + (node.x - minX);
        const cy = node.y;
        const partners = node.data.partners;

        const totalWidth = (partners.length - 1) * 100;
        const partnerPositions: Position[] = [];

        partners.forEach((p, i) => {
          const dx = partners.length > 1 ? i * 100 - totalWidth / 2 : 0;
          const pos = { x: cx + dx, y: cy };

          positions.set(p.id, pos);
          partnerPositions.push(pos);
        });

        // Also save couple center for unified child links
        if (partnerPositions.length > 0) {
          const avgX =
            partnerPositions.reduce((acc, p) => acc + p.x, 0) /
            partnerPositions.length;
          positions.set(`couple-${node.data.id}`, { x: avgX, y: cy });
        }
      });

      offsetX += treeWidth + 250;
    }

    // Shift to center horizontally
    let minX = Infinity;
    let maxX = -Infinity;

    positions.forEach((pos) => {
      if (pos.x < minX) minX = pos.x;
      if (pos.x > maxX) maxX = pos.x;
    });

    const totalWidth = maxX - minX;
    const offsetToCenter = (containerWidth - totalWidth) / 2 - minX;

    // Apply shift
    const shifted = new Map<string, Position>();

    positions.forEach((p, id) =>
      shifted.set(id, { x: p.x + offsetToCenter, y: p.y + 80 }),
    );

    return shifted;
  } catch (err) {
    console.error('D3 layout error:', err);

    members.forEach((m, i) => positions.set(m.id, { x: i * 200, y: 100 }));

    return positions;
  }
};

// Helpers
export const transformConnectionsData = (
  connections: FamilyTreeMemberConnectionGetAllResponseType,
) =>
  connections.map((c) => ({
    fromMemberId: c.fromMemberId,
    toMemberId: c.toMemberId,
    type: c.type,
  }));

export const getCouples = (
  connections: Array<{
    fromMemberId: string;
    toMemberId: string;
    type: string;
  }>,
) =>
  connections
    .filter((c) => c.type === FamilyTreeMemberConnectionEnum.SPOUSE)
    .map((c) => ({ partner1Id: c.fromMemberId, partner2Id: c.toMemberId }));
