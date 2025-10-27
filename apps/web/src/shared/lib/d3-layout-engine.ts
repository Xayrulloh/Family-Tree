import {
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
  FamilyTreeMemberConnectionEnum,
} from '@family-tree/shared';
import { hierarchy, tree } from 'd3-hierarchy';

export type Position = { x: number; y: number };

// Configuration
const CONFIG = {
  NODE_SIZE: [120, 60] as [number, number], // Reduced height from 100 to 60
  COUPLE_SPACING: 100,
  MARGIN: { top: 50, right: 50, bottom: 50, left: 50 },
  MEMBER_CARD: { width: 160, height: 80 },
};

// Treat COUPLES as single nodes in the hierarchy
interface CoupleNode {
  id: string;
  partner1: MemberSchemaType;
  partner2?: MemberSchemaType;
  children: CoupleNode[]; // Children are also couples
}

const buildCoupleHierarchy = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): CoupleNode[] => {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const childrenMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string>();
  const visited = new Set<string>();

  // Build relationships
  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      if (!childrenMap.has(conn.fromMemberId)) {
        childrenMap.set(conn.fromMemberId, []);
      }
      childrenMap.get(conn.fromMemberId)!.push(conn.toMemberId);
    } else if (conn.type === FamilyTreeMemberConnectionEnum.SPOUSE) {
      spouseMap.set(conn.fromMemberId, conn.toMemberId);
      spouseMap.set(conn.toMemberId, conn.fromMemberId);
    }
  });

  const buildCouple = (memberId: string): CoupleNode | null => {
    if (visited.has(memberId)) return null;

    const member = memberMap.get(memberId);
    if (!member) return null;

    visited.add(memberId);

    // Create couple node
    const couple: CoupleNode = {
      id: `couple-${memberId}`,
      partner1: member,
      children: [],
    };

    // Add spouse
    const spouseId = spouseMap.get(memberId);
    if (spouseId && memberMap.has(spouseId) && !visited.has(spouseId)) {
      couple.partner2 = memberMap.get(spouseId);
      visited.add(spouseId);
    }

    // Find ALL children (from both partners)
    const allChildIds = new Set<string>();

    // Children from partner1
    const children1 = childrenMap.get(memberId);
    if (children1) {
      children1.forEach((id) => allChildIds.add(id));
    }

    // Children from partner2
    if (couple.partner2) {
      const children2 = childrenMap.get(couple.partner2.id);
      if (children2) {
        children2.forEach((id) => allChildIds.add(id));
      }
    }

    // Build child couples recursively
    allChildIds.forEach((childId) => {
      const childCouple = buildCouple(childId);
      if (childCouple) {
        couple.children.push(childCouple);
      }
    });

    return couple;
  };

  // Find root members (no parents)
  const parentMap = new Map<string, string[]>();
  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      if (!parentMap.has(conn.toMemberId)) {
        parentMap.set(conn.toMemberId, []);
      }
      parentMap.get(conn.toMemberId)!.push(conn.fromMemberId);
    }
  });

  const roots = members.filter(
    (m) => !parentMap.has(m.id) || parentMap.get(m.id)!.length === 0,
  );

  const trees: CoupleNode[] = [];
  roots.forEach((root) => {
    if (!visited.has(root.id)) {
      const rootCouple = buildCouple(root.id);
      if (rootCouple) {
        trees.push(rootCouple);
      }
    }
  });

  // Handle unconnected members as single-person couples
  members.forEach((member) => {
    if (!visited.has(member.id)) {
      trees.push({
        id: `couple-${member.id}`,
        partner1: member,
        children: [],
      });
    }
  });

  return trees;
};

export const calculatePositions = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  containerWidth: number = 1200,
  containerHeight: number = 800,
): Map<string, Position> => {
  const positions = new Map<string, Position>();

  if (members.length === 0) return positions;

  try {
    const coupleTrees = buildCoupleHierarchy(members, connections);

    // D3 Tree layout
    const treeLayout = tree<CoupleNode>()
      .size([containerWidth - 200, containerHeight - 500]) // Reduced vertical space
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

    let currentXOffset = CONFIG.MARGIN.left;

    coupleTrees.forEach((treeData) => {
      const root = hierarchy(treeData);
      const layoutRoot = treeLayout(root);

      // Calculate bounds
      let minX = Infinity;
      let maxX = -Infinity;

      layoutRoot.descendants().forEach((node) => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
      });

      const treeWidth = maxX - minX;

      // Position all nodes
      layoutRoot.descendants().forEach((node) => {
        const couple = node.data;
        const centerX = currentXOffset + (node.x - minX);
        const y = CONFIG.MARGIN.top + node.y;

        // Position partner1 (left of center)
        positions.set(couple.partner1.id, {
          x: centerX - CONFIG.COUPLE_SPACING / 2,
          y,
        });

        // Position partner2 (right of center)
        if (couple.partner2) {
          positions.set(couple.partner2.id, {
            x: centerX + CONFIG.COUPLE_SPACING / 2,
            y,
          });
        }
      });

      currentXOffset += treeWidth + CONFIG.NODE_SIZE[0];
    });

    // Center if needed
    const totalWidth = currentXOffset - CONFIG.NODE_SIZE[0];
    if (totalWidth < containerWidth) {
      const offsetX = (containerWidth - totalWidth) / 2;
      const centeredPositions = new Map<string, Position>();
      positions.forEach((pos, id) => {
        centeredPositions.set(id, {
          x: pos.x + offsetX,
          y: pos.y,
        });
      });
      return centeredPositions;
    }
  } catch (error) {
    console.error('D3 layout error:', error);

    // Fallback
    const startX = CONFIG.MARGIN.left;
    const startY = CONFIG.MARGIN.top;
    const spacing = CONFIG.NODE_SIZE[0];

    members.forEach((member, index) => {
      positions.set(member.id, {
        x: startX + index * spacing,
        y: startY,
      });
    });
  }

  return positions;
};

// FIXED: Get connections from couple centers to child centers
// ULTRA SHORT lines version
// FIXED: Shorter parent-child connections
export const getParentChildConnections = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  positions: Map<string, Position>,
): Array<{ from: Position; to: Position }> => {
  const result: Array<{ from: Position; to: Position }> = [];

  // Group children by their parent couples
  const childrenByCouple = new Map<string, Set<string>>();

  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      const parentPos = positions.get(conn.fromMemberId);
      if (!parentPos) return;

      // Find spouse to calculate couple center
      let spousePos: Position | undefined;
      const spouseConn = connections.find(
        (c) =>
          c.type === FamilyTreeMemberConnectionEnum.SPOUSE &&
          (c.fromMemberId === conn.fromMemberId ||
            c.toMemberId === conn.fromMemberId),
      );

      if (spouseConn) {
        const spouseId =
          spouseConn.fromMemberId === conn.fromMemberId
            ? spouseConn.toMemberId
            : spouseConn.fromMemberId;
        spousePos = positions.get(spouseId);
      }

      // Calculate couple center point
      const coupleCenter = spousePos
        ? {
            x: (parentPos.x + spousePos.x) / 2,
            y: Math.max(parentPos.y, spousePos.y),
          }
        : {
            x: parentPos.x,
            y: parentPos.y,
          };

      const coupleKey = `${coupleCenter.x},${coupleCenter.y}`;
      if (!childrenByCouple.has(coupleKey)) {
        childrenByCouple.set(coupleKey, new Set());
      }
      childrenByCouple.get(coupleKey)!.add(conn.toMemberId);
    }
  });

  // Create connections from couple to children
  childrenByCouple.forEach((childIds, coupleKey) => {
    const [centerX, centerY] = coupleKey.split(',').map(Number);

    childIds.forEach((childId) => {
      const childPos = positions.get(childId);
      if (childPos) {
        // SHORTER LINES: Start from bottom of parents, end at top of children
        // Reduced the vertical gap significantly
        result.push({
          from: {
            x: centerX + CONFIG.MEMBER_CARD.width / 2,
            y: centerY + CONFIG.MEMBER_CARD.height - 10, // Start closer to bottom
          },
          to: {
            x: childPos.x + CONFIG.MEMBER_CARD.width / 2,
            y: childPos.y + 10, // End closer to top
          },
        });
      }
    });
  });

  return result;
};
// Keep other helper functions the same...
export const transformConnectionsData = (
  connections: FamilyTreeMemberConnectionGetAllResponseType,
) => {
  return connections.map((c) => ({
    fromMemberId: c.fromMemberId,
    toMemberId: c.toMemberId,
    type: c.type,
  }));
};

type CoupleInfo = {
  partner1Id: string;
  partner2Id: string;
};

export const getCouples = (
  connections: Array<{
    fromMemberId: string;
    toMemberId: string;
    type: string;
  }>,
): CoupleInfo[] => {
  return connections
    .filter((c) => c.type === FamilyTreeMemberConnectionEnum.SPOUSE)
    .map((c) => ({
      partner1Id: c.fromMemberId,
      partner2Id: c.toMemberId,
    }));
};

export const getChildrenOfCouple = (
  couple: CoupleInfo,
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): string[] => {
  const childConnections = connections.filter(
    (c) =>
      c.type === FamilyTreeMemberConnectionEnum.PARENT &&
      (c.fromMemberId === couple.partner1Id ||
        c.fromMemberId === couple.partner2Id),
  );

  const childIds = new Set(childConnections.map((c) => c.toMemberId));
  return Array.from(childIds);
};

export const getMemberCardDimensions = () => {
  return { ...CONFIG.MEMBER_CARD };
};
