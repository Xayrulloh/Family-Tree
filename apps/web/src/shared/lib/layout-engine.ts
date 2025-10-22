import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
} from '@family-tree/shared';

export type Position = { x: number; y: number };

// Configuration
const VERTICAL_SPACING = 100;
const HORIZONTAL_SPACING = 40;
const COUPLE_SPACING = 100;
const MIN_SINGLE_WIDTH = 120;
const MIN_COUPLE_WIDTH = 200;
const MARGIN = 50;
const START_Y = 80;

interface FamilyUnit {
  id: string; // Unique identifier for this unit
  memberIds: string[]; // [husband, wife] or [single parent]
  generation: number;
  subtreeWidth: number; // Total width needed by all descendants
  children: FamilyUnit[]; // Direct children units
  x: number; // Center position
  y: number;
}

export const calculatePositions = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): Map<string, Position> => {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const positions = new Map<string, Position>();

  // Build relationship maps
  const spouseMap = new Map<string, string>();
  const parentToChildren = new Map<string, Set<string>>();
  const childToParents = new Map<string, Set<string>>();

  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.SPOUSE) {
      spouseMap.set(conn.fromMemberId, conn.toMemberId);
      spouseMap.set(conn.toMemberId, conn.fromMemberId);
    } else if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      if (!parentToChildren.has(conn.fromMemberId)) {
        parentToChildren.set(conn.fromMemberId, new Set());
      }

      parentToChildren.get(conn.fromMemberId)!.add(conn.toMemberId);

      if (!childToParents.has(conn.toMemberId)) {
        childToParents.set(conn.toMemberId, new Set());
      }

      childToParents.get(conn.toMemberId)!.add(conn.fromMemberId);
    }
  });

  // Step 1: Build family units for all members
  const allUnits = buildAllFamilyUnits(
    memberMap,
    spouseMap,
    parentToChildren,
    childToParents,
  );

  if (allUnits.size === 0) {
    // Handle case with no connections - just position all members
    positionAllMembersAlone(members, positions);
    return positions;
  }

  // Step 2: Build hierarchical tree structure
  const rootUnits = findRootUnits(allUnits);

  // Step 3: Calculate subtree widths (bottom-up)
  rootUnits.forEach((unit) => calculateSubtreeWidth(unit));

  // Step 4: Assign positions (top-down)
  let currentX = MARGIN;
  rootUnits.forEach((unit) => {
    positionUnit(unit, currentX, START_Y);
    currentX += unit.subtreeWidth + HORIZONTAL_SPACING;
  });

  // Step 5: Extract positions to the result map
  extractPositions(rootUnits, positions);

  return positions;
};

// Step 1: Build all family units
const buildAllFamilyUnits = (
  memberMap: Map<string, MemberSchemaType>,
  spouseMap: Map<string, string>,
  parentToChildren: Map<string, Set<string>>,
  childToParents: Map<string, Set<string>>,
): Map<string, FamilyUnit> => {
  const allUnits = new Map<string, FamilyUnit>();
  const processedMembers = new Set<string>();

  // First pass: Create units for all members
  Array.from(memberMap.keys()).forEach((memberId) => {
    if (processedMembers.has(memberId)) return;

    const spouseId = spouseMap.get(memberId);
    const unit: FamilyUnit = {
      id: `unit-${memberId}`,
      memberIds: [],
      generation: 0, // Will be calculated later
      subtreeWidth: 0,
      children: [],
      x: 0,
      y: 0,
    };

    // Add primary member
    unit.memberIds.push(memberId);
    processedMembers.add(memberId);

    // Add spouse if exists and not processed
    if (spouseId && !processedMembers.has(spouseId)) {
      unit.memberIds.push(spouseId);
      processedMembers.add(spouseId);
    }

    allUnits.set(memberId, unit);
    if (spouseId) {
      allUnits.set(spouseId, unit);
    }
  });

  // Second pass: Calculate generations and build hierarchy
  const calculateGeneration = (memberId: string): number => {
    const parents = childToParents.get(memberId);
    if (!parents || parents.size === 0) return 0;

    const parentGen = Math.min(
      ...Array.from(parents).map((parentId) => {
        const parentUnit = allUnits.get(parentId);
        if (parentUnit && parentUnit.generation > 0) {
          return parentUnit.generation;
        }
        return calculateGeneration(parentId) + 1;
      }),
    );

    return parentGen;
  };

  // Assign generations
  allUnits.forEach((unit) => {
    if (unit.generation === 0) {
      const minGen = Math.min(...unit.memberIds.map(calculateGeneration));
      unit.generation = minGen;
    }
  });

  // Build children relationships
  allUnits.forEach((unit) => {
    const allChildren = new Set<string>();

    unit.memberIds.forEach((memberId) => {
      const children = parentToChildren.get(memberId);
      if (children) {
        children.forEach((childId) => allChildren.add(childId));
      }
    });

    // Group children by their family units
    const childUnits = new Set<FamilyUnit>();
    allChildren.forEach((childId) => {
      const childUnit = allUnits.get(childId);
      if (childUnit && !childUnits.has(childUnit)) {
        childUnits.add(childUnit);
        unit.children.push(childUnit);
      }
    });
  });

  return allUnits;
};

// Step 2: Find root units (units with no parents in the tree)
const findRootUnits = (allUnits: Map<string, FamilyUnit>): FamilyUnit[] => {
  const hasParent = new Set<FamilyUnit>();

  allUnits.forEach((unit) => {
    unit.children.forEach((child) => {
      hasParent.add(child);
    });
  });

  return Array.from(new Set(Array.from(allUnits.values())))
    .filter((unit) => !hasParent.has(unit))
    .sort((a, b) => a.generation - b.generation);
};

// Step 3: Calculate subtree widths (bottom-up)
const calculateSubtreeWidth = (unit: FamilyUnit): number => {
  if (unit.children.length === 0) {
    // Set minimum width based on whether it's a couple or single
    unit.subtreeWidth =
      unit.memberIds.length > 1 ? MIN_COUPLE_WIDTH : MIN_SINGLE_WIDTH;
    return unit.subtreeWidth;
  }

  // Calculate total width needed by children
  let totalChildrenWidth = 0;
  unit.children.forEach((child) => {
    totalChildrenWidth += calculateSubtreeWidth(child);
  });

  // Add spacing between children
  if (unit.children.length > 1) {
    totalChildrenWidth += (unit.children.length - 1) * HORIZONTAL_SPACING;
  }

  // Unit width is the maximum of its own minimum width and children's total width
  const minWidth =
    unit.memberIds.length > 1 ? MIN_COUPLE_WIDTH : MIN_SINGLE_WIDTH;
  unit.subtreeWidth = Math.max(minWidth, totalChildrenWidth);
  return unit.subtreeWidth;
};

// Step 4: Assign positions (top-down)
const positionUnit = (unit: FamilyUnit, startX: number, y: number): void => {
  // Position this unit
  unit.x = startX + unit.subtreeWidth / 2;
  unit.y = y;

  // Position children below this unit - CENTERED under parent
  if (unit.children.length > 0) {
    // Calculate total width needed for children (including spacing)
    const totalChildrenWidth =
      unit.children.reduce((sum, child) => sum + child.subtreeWidth, 0) +
      (unit.children.length - 1) * HORIZONTAL_SPACING;

    // Center children under parent
    const childrenStartX = unit.x - totalChildrenWidth / 2;
    let childX = childrenStartX;

    unit.children.forEach((child) => {
      positionUnit(child, childX, y + VERTICAL_SPACING);
      childX += child.subtreeWidth + HORIZONTAL_SPACING;
    });
  }
};

// Step 5: Extract positions to the result map
const extractPositions = (
  units: FamilyUnit[],
  positions: Map<string, Position>,
): void => {
  const processedUnits = new Set<string>();

  const processUnit = (unit: FamilyUnit) => {
    if (processedUnits.has(unit.id)) return;
    processedUnits.add(unit.id);

    // Position members within the unit with proper couple spacing
    if (unit.memberIds.length === 1) {
      // Single person - center in the unit
      positions.set(unit.memberIds[0], { x: unit.x, y: unit.y });
    } else {
      // Couple - position with spacing
      const totalMemberWidth = (unit.memberIds.length - 1) * COUPLE_SPACING;
      const startX = unit.x - totalMemberWidth / 2;

      unit.memberIds.forEach((memberId, index) => {
        const x = startX + index * COUPLE_SPACING;
        positions.set(memberId, { x, y: unit.y });
      });
    }

    // Process children recursively
    unit.children.forEach(processUnit);
  };

  units.forEach(processUnit);
};

// Fallback for members with no connections
const positionAllMembersAlone = (
  members: MemberSchemaType[],
  positions: Map<string, Position>,
): void => {
  const itemWidth = 120;
  const totalWidth = members.length * itemWidth;
  const startX = (1000 - totalWidth) / 2 + 50;

  members.forEach((member, index) => {
    positions.set(member.id, {
      x: startX + index * itemWidth,
      y: START_Y,
    });
  });
};

// Keep your existing helper functions
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
