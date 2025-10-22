import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
} from '@family-tree/shared';

export type Position = { x: number; y: number };

const GENERATION_HEIGHT = 70;
const COUPLE_SPACING = 100;
const FAMILY_UNIT_SPACING = 150;

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

  // Find root members (those with no parents)
  const roots = Array.from(memberMap.keys()).filter(
    (id) => !childToParents.has(id) || childToParents.get(id)!.size === 0,
  );

  // CRITICAL FIX: Assign generations in two passes
  // Pass 1: Assign generation based on parent-child only
  const generations = new Map<string, number>();
  const queue: string[] = [...roots];

  roots.forEach((rootId) => generations.set(rootId, 0));

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentGen = generations.get(currentId)!;

    // Get all children from this person
    const children = parentToChildren.get(currentId);

    if (children) {
      children.forEach((childId) => {
        // Only assign if not already assigned OR if this would put them in a higher generation
        const existingGen = generations.get(childId);

        if (existingGen === undefined || existingGen < currentGen + 1) {
          generations.set(childId, currentGen + 1);
          queue.push(childId);
        }
      });
    }
  }

  // Pass 2: Assign spouses to the SAME generation as their partner
  Array.from(spouseMap.entries()).forEach(([personId, spouseId]) => {
    const personGen = generations.get(personId);
    const spouseGen = generations.get(spouseId);

    if (personGen !== undefined && spouseGen === undefined) {
      generations.set(spouseId, personGen);
    } else if (spouseGen !== undefined && personGen === undefined) {
      generations.set(personId, spouseGen);
    }
  });

  // Handle disconnected members
  Array.from(memberMap.keys()).forEach((id) => {
    if (!generations.has(id)) {
      generations.set(id, 0);
    }
  });

  // Group members by generation
  const membersByGen = new Map<number, string[]>();

  generations.forEach((gen, memberId) => {
    if (!membersByGen.has(gen)) {
      membersByGen.set(gen, []);
    }

    membersByGen.get(gen)!.push(memberId);
  });

  // Position each generation
  const maxGen = Math.max(...Array.from(generations.values()), 0);
  const containerWidth = 1200;
  const startY = 50;

  for (let gen = 0; gen <= maxGen; gen++) {
    const membersInGen = membersByGen.get(gen) || [];
    const processed = new Set<string>();
    const familyUnits: string[][] = [];

    // Group into family units (couples or singles)
    membersInGen.forEach((memberId) => {
      if (processed.has(memberId)) return;

      const spouseId = spouseMap.get(memberId);

      if (
        spouseId &&
        membersInGen.includes(spouseId) &&
        !processed.has(spouseId)
      ) {
        familyUnits.push([memberId, spouseId]);
        processed.add(memberId);
        processed.add(spouseId);
      } else if (!processed.has(memberId)) {
        familyUnits.push([memberId]);
        processed.add(memberId);
      }
    });

    // Calculate positions for this generation
    const totalUnits = familyUnits.length;
    const totalWidth = totalUnits * FAMILY_UNIT_SPACING;
    const startX = (containerWidth - totalWidth) / 2 + FAMILY_UNIT_SPACING / 2;

    familyUnits.forEach((unit, unitIndex) => {
      const unitCenterX = startX + unitIndex * FAMILY_UNIT_SPACING;
      const y = startY + gen * GENERATION_HEIGHT;

      if (unit.length === 2) {
        positions.set(unit[0], {
          x: unitCenterX - COUPLE_SPACING / 2,
          y,
        });
        positions.set(unit[1], {
          x: unitCenterX + COUPLE_SPACING / 2,
          y,
        });
      } else {
        positions.set(unit[0], { x: unitCenterX, y });
      }
    });
  }

  return positions;
};

type CoupleInfo = {
  partner1Id: string;
  partner2Id: string;
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
