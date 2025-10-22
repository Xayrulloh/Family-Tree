import {
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
  FamilyTreeMemberConnectionEnum,
} from '@family-tree/shared';

export type Position = { x: number; y: number };

// Configuration constants - easily adjustable
const CONFIG = {
  LEVEL_HEIGHT: 80, // Vertical space between generations
  HORIZONTAL_SPACING: 100, // Space between members on same level
  MARGIN: {
    // Margins around the entire tree
    top: 50,
    right: 50,
    bottom: 80,
    left: 50,
  },
  MEMBER_CARD: {
    // Member card dimensions for accurate line calculations
    width: 160,
    height: 80,
  },
};

interface MemberNode {
  member: MemberSchemaType;
  level: number;
  children: MemberNode[];
  spouse?: MemberSchemaType;
}

const buildFamilyHierarchy = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): MemberNode[] => {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  // Build relationships
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string>();

  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      if (!childrenMap.has(conn.fromMemberId)) {
        childrenMap.set(conn.fromMemberId, []);
      }
      childrenMap.get(conn.fromMemberId)!.push(conn.toMemberId);

      if (!parentMap.has(conn.toMemberId)) {
        parentMap.set(conn.toMemberId, []);
      }
      parentMap.get(conn.toMemberId)!.push(conn.fromMemberId);
    } else if (conn.type === FamilyTreeMemberConnectionEnum.SPOUSE) {
      spouseMap.set(conn.fromMemberId, conn.toMemberId);
      spouseMap.set(conn.toMemberId, conn.fromMemberId);
    }
  });

  // Find roots (members with no parents)
  const roots = members.filter(
    (member) =>
      !parentMap.has(member.id) || parentMap.get(member.id)!.length === 0,
  );

  // Assign levels recursively with spouse handling
  const assignLevels = (
    memberId: string,
    level: number = 0,
    visited: Set<string> = new Set(),
  ): MemberNode | null => {
    if (visited.has(memberId)) return null;
    visited.add(memberId);

    const member = memberMap.get(memberId);
    if (!member) return null;

    const node: MemberNode = {
      member,
      level,
      children: [],
    };

    // Check if this member has a spouse
    const spouseId = spouseMap.get(memberId);
    if (spouseId && memberMap.has(spouseId)) {
      const spouse = memberMap.get(spouseId)!;
      node.spouse = spouse;
      visited.add(spouseId);
    }

    // Process children
    const childrenIds = childrenMap.get(memberId) || [];
    childrenIds.forEach((childId) => {
      const childNode = assignLevels(childId, level + 1, visited);
      if (childNode) {
        node.children.push(childNode);
      }
    });

    return node;
  };

  // Build hierarchy starting from roots
  const hierarchy: MemberNode[] = [];
  const allVisited = new Set<string>();

  roots.forEach((root) => {
    if (!allVisited.has(root.id)) {
      const rootNode = assignLevels(root.id, 0, allVisited);
      if (rootNode) {
        hierarchy.push(rootNode);
      }
    }
  });

  // Include any unconnected members
  members.forEach((member) => {
    if (!allVisited.has(member.id)) {
      hierarchy.push({
        member,
        level: 0,
        children: [],
      });
    }
  });

  return hierarchy;
};

const flattenHierarchy = (
  nodes: MemberNode[],
): { member: MemberSchemaType; level: number; spouse?: MemberSchemaType }[] => {
  const result: {
    member: MemberSchemaType;
    level: number;
    spouse?: MemberSchemaType;
  }[] = [];

  const traverse = (node: MemberNode) => {
    result.push({
      member: node.member,
      level: node.level,
      spouse: node.spouse,
    });
    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);
  return result;
};

export const calculatePositions = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
  containerWidth: number = 1200,
): Map<string, Position> => {
  if (members.length === 0) {
    return new Map();
  }

  const positions = new Map<string, Position>();

  try {
    // Build hierarchy and get members with their levels
    const hierarchy = buildFamilyHierarchy(members, connections);
    const membersWithLevels = flattenHierarchy(hierarchy);

    // Group members by level and handle spouses
    const levelGroups = new Map<
      number,
      Array<{ member: MemberSchemaType; spouse?: MemberSchemaType }>
    >();
    const placedMembers = new Set<string>();
    let maxLevel = 0;

    // First pass: place members from hierarchy
    membersWithLevels.forEach(({ member, level, spouse }) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }

      if (!placedMembers.has(member.id)) {
        levelGroups.get(level)!.push({ member, spouse });
        placedMembers.add(member.id);
        maxLevel = Math.max(maxLevel, level);
      }

      if (spouse && !placedMembers.has(spouse.id)) {
        levelGroups.get(level)!.push({ member: spouse });
        placedMembers.add(spouse.id);
      }
    });

    // Handle any remaining members
    members.forEach((member) => {
      if (!placedMembers.has(member.id)) {
        if (!levelGroups.has(0)) {
          levelGroups.set(0, []);
        }
        levelGroups.get(0)!.push({ member });
        placedMembers.add(member.id);
      }
    });

    // Calculate available width for horizontal centering
    const availableWidth =
      containerWidth - CONFIG.MARGIN.left - CONFIG.MARGIN.right;

    // Calculate positions for each level - TOP ALIGNED (no vertical centering)
    levelGroups.forEach((membersInLevel, level) => {
      const y = CONFIG.MARGIN.top + level * CONFIG.LEVEL_HEIGHT; // Simple top alignment

      // Calculate total width needed for this level
      const totalNeededWidth =
        membersInLevel.length * CONFIG.HORIZONTAL_SPACING;

      // Center the level horizontally only
      const startX =
        CONFIG.MARGIN.left +
        Math.max(0, (availableWidth - totalNeededWidth) / 2);

      membersInLevel.forEach(({ member }, index) => {
        const x = startX + index * CONFIG.HORIZONTAL_SPACING;
        positions.set(member.id, { x, y });
      });
    });

    console.log('🚀 ~ calculatePositions ~ levels:', levelGroups.size);
    console.log('🚀 ~ calculatePositions ~ members:', positions.size);
  } catch (error) {
    console.error('Hierarchy layout error:', error);

    // Fallback: top-aligned horizontal layout
    const totalWidth = members.length * CONFIG.HORIZONTAL_SPACING;
    const startX = Math.max(
      CONFIG.MARGIN.left,
      (containerWidth - totalWidth) / 2,
    );
    const startY = CONFIG.MARGIN.top; // Top aligned

    members.forEach((member, index) => {
      positions.set(member.id, {
        x: startX + index * CONFIG.HORIZONTAL_SPACING,
        y: startY,
      });
    });
  }

  return positions;
};

// Helper function to calculate connection line points
export const calculateConnectionPoints = (
  fromPosition: Position,
  toPosition: Position,
): { from: Position; to: Position } => {
  // Calculate points that connect from bottom of parent to top of child
  const from = {
    x: fromPosition.x + CONFIG.MEMBER_CARD.width / 2, // Center of parent card
    y: fromPosition.y + CONFIG.MEMBER_CARD.height, // Bottom of parent card
  };

  const to = {
    x: toPosition.x + CONFIG.MEMBER_CARD.width / 2, // Center of child card
    y: toPosition.y, // Top of child card
  };

  return { from, to };
};

// Get member card dimensions for rendering
export const getMemberCardDimensions = () => {
  return { ...CONFIG.MEMBER_CARD };
};

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
  connections: Array<{
    fromMemberId: string;
    toMemberId: string;
    type: string;
  }>,
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
