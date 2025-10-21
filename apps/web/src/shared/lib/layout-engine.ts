import {
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionGetAllResponseType,
  type MemberSchemaType,
} from '@family-tree/shared';

// Dynamic positioning algorithm for family tree
type Position = { x: number; y: number };

export const calculatePositions = (
  members: MemberSchemaType[],
  connections: FamilyTreeMemberConnectionGetAllResponseType,
): Map<string, Position> => {
  const memberMap = new Map(members.map((member) => [member.id, member]));

  const generations = new Map<string, number>();
  const hasParent = new Set<string>();

  // Find parents
  connections.forEach((conn) => {
    if (conn.type === FamilyTreeMemberConnectionEnum.PARENT) {
      hasParent.add(conn.toMemberId);
    }
  });

  // Find roots
  const roots = Array.from(memberMap.keys()).filter((id) => !hasParent.has(id));

  // BFS for generations
  const queue: Array<{ id: string; gen: number }> = roots.map((r) => ({
    id: r,
    gen: 0,
  }));

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;

    if (generations.has(id)) continue;

    generations.set(id, gen);

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

  // If no generations found (no parent-child relations), put all at generation 0
  if (generations.size === 0) {
    Array.from(memberMap.keys()).forEach((id) => {
      generations.set(id, 0);
    });
  }

  // Group by generation
  const membersByGen = new Map<number, string[]>();

  generations.forEach((gen, memberId) => {
    if (!membersByGen.has(gen)) membersByGen.set(gen, []);
    membersByGen.get(gen)!.push(memberId);
  });

  // Calculate positions
  const positions = new Map<string, Position>();
  const maxGeneration = Math.max(...generations.values());
  const startY = 60;

  // For single generation, center them horizontally
  if (maxGeneration === 0) {
    const membersInGen = membersByGen.get(0) || [];
    const itemWidth = 120;
    const totalWidth = membersInGen.length * itemWidth;
    const containerWidth = 1000;
    const startX = (containerWidth - totalWidth) / 2 + 50;

    membersInGen.forEach((memberId, index) => {
      const x = startX + index * itemWidth;
      const y = startY;

      positions.set(memberId, { x, y });
    });
  } else {
    // Multiple generations
    for (let gen = 0; gen <= maxGeneration; gen++) {
      const membersInGen = membersByGen.get(gen) || [];
      const itemWidth = 120;
      const totalWidth = membersInGen.length * itemWidth;
      const containerWidth = 1000;
      const startX = (containerWidth - totalWidth) / 2 + 50;

      membersInGen.forEach((memberId, index) => {
        const x = startX + index * itemWidth;
        const y = startY + gen * 80;
        positions.set(memberId, { x, y });
      });
    }
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
