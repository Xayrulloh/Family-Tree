import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
} from '@family-tree/shared';

// Dynamic positioning algorithm for family tree
type Position = { x: number; y: number };

const GENERATION_SPACING = 140; // Y spacing between generations
const SIBLING_SPACING = 120; // X spacing between siblings

export const calculatePositions = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): Map<string, Position> => {
  // Step 1: Assign generations
  const generations = new Map<string, number>();

  // Find root members (no parents)
  const hasParent = new Set<string>();

  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      hasParent.add(conn.toMemberId);
    }
  });

  const roots = members.filter((m) => !hasParent.has(m.id));

  // BFS to assign generations
  const queue: Array<{ id: string; gen: number }> = roots.map((r) => ({
    id: r.id,
    gen: 0,
  }));

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;

    if (generations.has(id)) continue;

    generations.set(id, gen);

    // Find children
    const children = connections
      .filter(
        (c) =>
          c.fromMemberId === id &&
          c.type === FamilyTreeMemberConnectionEnum.PARENT,
      )
      .map((c) => c.toMemberId);

    children.forEach((childId) => {
      queue.push({ id: childId, gen: gen + 1 });
    });
  }

  // Step 2: Group members by generation
  const membersByGen = new Map<number, string[]>();

  generations.forEach((gen, memberId) => {
    const memberGen = membersByGen.get(gen) || [];

    memberGen.push(memberId);
    membersByGen.set(gen, memberGen);

    // if (!membersByGen.has(gen)) membersByGen.set(gen, []);

    // membersByGen.get(gen)!.push(memberId);
  });

  // Step 3: Calculate positions
  const positions = new Map<string, Position>();
  const maxGeneration = Math.max(...generations.values());

  const startY = 60;

  for (let gen = 0; gen <= maxGeneration; gen++) {
    const membersInGen = membersByGen.get(gen) || [];
    const totalWidth = membersInGen.length * SIBLING_SPACING;
    const startX = (850 - totalWidth) / 2;

    membersInGen.forEach((memberId, index) => {
      const x = startX + index * SIBLING_SPACING;
      const y = startY + gen * GENERATION_SPACING;

      positions.set(memberId, { x, y });
    });
  }

  return positions;
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
