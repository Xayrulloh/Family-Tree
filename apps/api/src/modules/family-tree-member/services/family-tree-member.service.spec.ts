import { FamilyTreeMemberService } from './family-tree-member.service';

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  or: jest.fn(),
  asc: jest.fn(),
  inArray: jest.fn(),
}));
jest.mock('~/database/schema', () => ({
  familyTreeMembersSchema: {},
  familyTreeMemberConnectionsSchema: {},
}));
jest.mock('~/database/drizzle.provider', () => ({
  DrizzleAsyncProvider: 'DrizzleAsyncProvider',
}));
jest.mock('~/config/cloudflare/cloudflare.config', () => ({
  CloudflareConfig: jest.fn(),
}));
jest.mock('@family-tree/shared', () => ({
  FamilyTreeMemberConnectionEnum: { PARENT: 'PARENT', SPOUSE: 'SPOUSE' },
  UserGenderEnum: { MALE: 'MALE', FEMALE: 'FEMALE', UNKNOWN: 'UNKNOWN' },
  generateRandomAvatar: jest.fn(),
}));

// --- mock DB -----------------------------------------------------------

const mockConnectionsFindFirst = jest.fn();
const mockConnectionsFindMany = jest.fn();
const mockMembersFindMany = jest.fn();

const mockDb = {
  query: {
    familyTreeMemberConnectionsSchema: {
      findFirst: mockConnectionsFindFirst,
      findMany: mockConnectionsFindMany,
    },
    familyTreeMembersSchema: {
      findMany: mockMembersFindMany,
    },
  },
};

// --- fixtures ----------------------------------------------------------

const MEMBER = { id: 'member-1', name: 'Alice' };
const SPOUSE = { id: 'spouse-1', name: 'Bob' };

// spouseConn where the target is the `from` side
const SPOUSE_CONN_FROM = {
  fromMemberId: 'member-1',
  toMemberId: 'spouse-1',
  fromMember: MEMBER,
  toMember: SPOUSE,
};

// spouseConn where the target is the `to` side
const SPOUSE_CONN_TO = {
  fromMemberId: 'spouse-1',
  toMemberId: 'member-1',
  fromMember: SPOUSE,
  toMember: MEMBER,
};

// --- helpers -----------------------------------------------------------

/**
 * Queue mock responses in the order computeDeletePreview calls them:
 *  1. findMany  → children (PARENT connections FROM member)
 *  2. findFirst → hasParents (PARENT connection TO member)
 *  3. findFirst → spouseConn (SPOUSE connection involving member)
 *  4. findFirst → spouseHasParents (only when spouseConn exists)
 *  5. findMany  → member count sample
 */
function setupMocks({
  children = [] as object[],
  hasParents = undefined as object | undefined,
  spouseConn = undefined as object | undefined,
  spouseHasParents = undefined as object | undefined,
  memberCount = 3,
} = {}) {
  mockConnectionsFindMany.mockResolvedValue(children);
  mockConnectionsFindFirst
    .mockResolvedValueOnce(hasParents)
    .mockResolvedValueOnce(spouseConn);
  if (spouseConn !== undefined) {
    mockConnectionsFindFirst.mockResolvedValueOnce(spouseHasParents);
  }
  mockMembersFindMany.mockResolvedValue(Array(memberCount).fill({}));
}

// --- tests -------------------------------------------------------------

describe('FamilyTreeMemberService.computeDeletePreview', () => {
  let service: FamilyTreeMemberService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FamilyTreeMemberService(
      mockDb as any,
      {} as any,
      { getOrThrow: () => 'https://r2.example.com' } as any,
    );
  });

  // helper to invoke the private method under test
  const preview = (member = MEMBER, treeId = 'tree-1') =>
    (service as any).computeDeletePreview(member, treeId);

  // 1. happy path — no connections -----------------------------------------
  it('allows deletion of a leaf member with no connections', async () => {
    setupMocks({ memberCount: 3 });
    await expect(preview()).resolves.toEqual({
      canDelete: true,
      blockReason: null,
      spouseToDelete: null,
    });
  });

  // 2. leaf member with 1 child (no parents, no spouse) --------------------
  it('allows deletion of a top-of-chain member with exactly 1 child', async () => {
    setupMocks({ children: [{}], memberCount: 2 });
    await expect(preview()).resolves.toEqual({
      canDelete: true,
      blockReason: null,
      spouseToDelete: null,
    });
  });

  // 3. blocked — 2+ children -----------------------------------------------
  it('blocks deletion when the member has 2 or more children', async () => {
    setupMocks({ children: [{}, {}] });
    const result = await preview();
    expect(result.canDelete).toBe(false);
    expect(result.blockReason).toMatch(/multiple children/);
    expect(result.spouseToDelete).toBeNull();
  });

  // 4. blocked — middle member (parents above AND child below) --------------
  it('blocks deletion of a middle member who has both parents and a child', async () => {
    setupMocks({ children: [{}], hasParents: {} });
    const result = await preview();
    expect(result.canDelete).toBe(false);
    expect(result.blockReason).toMatch(/parents above and children below/);
    expect(result.spouseToDelete).toBeNull();
  });

  // 5. blocked — last member in the tree -----------------------------------
  it('blocks deletion when the member is the last one in the tree', async () => {
    setupMocks({ memberCount: 1 });
    const result = await preview();
    expect(result.canDelete).toBe(false);
    expect(result.blockReason).toMatch(/last member/);
  });

  // 6. couple with 3+ total members, no parents ----------------------------
  it('co-deletes the spouse when the couple has a shared child and 3+ total members', async () => {
    setupMocks({
      children: [{}],
      spouseConn: SPOUSE_CONN_FROM,
      spouseHasParents: undefined,
      memberCount: 3,
    });
    await expect(preview()).resolves.toEqual({
      canDelete: true,
      blockReason: null,
      spouseToDelete: SPOUSE,
    });
  });

  // 7. leaf couple — only 2 members total → fallback, keep spouse ----------
  it('falls back to deleting only the target when co-deletion would empty the tree (leaf couple)', async () => {
    setupMocks({
      children: [],
      spouseConn: SPOUSE_CONN_FROM,
      spouseHasParents: undefined,
      memberCount: 2,
    });
    await expect(preview()).resolves.toEqual({
      canDelete: true,
      blockReason: null,
      spouseToDelete: null,
    });
  });

  // 8. spouse with parents, no shared children, no target parents → keep spouse
  it('does not co-delete the spouse when spouse has own parents and there are no shared children', async () => {
    setupMocks({
      children: [],
      hasParents: undefined,
      spouseConn: SPOUSE_CONN_FROM,
      spouseHasParents: {},
      memberCount: 3,
    });
    await expect(preview()).resolves.toEqual({
      canDelete: true,
      blockReason: null,
      spouseToDelete: null,
    });
  });

  // 9. blocked — spouse has parents AND target has parents ------------------
  it('blocks when both the target and the spouse have their own parents', async () => {
    setupMocks({
      children: [],
      hasParents: {},
      spouseConn: SPOUSE_CONN_FROM,
      spouseHasParents: {},
    });
    const result = await preview();
    expect(result.canDelete).toBe(false);
    expect(result.blockReason).toMatch(/spouse has parents/);
    expect(result.spouseToDelete).toBeNull();
  });

  // 10. blocked — spouse has parents AND couple has a shared child ----------
  it('blocks when the spouse has parents and the couple has a shared child', async () => {
    setupMocks({
      children: [{}],
      hasParents: undefined,
      spouseConn: SPOUSE_CONN_FROM,
      spouseHasParents: {},
    });
    const result = await preview();
    expect(result.canDelete).toBe(false);
    expect(result.blockReason).toMatch(/spouse has parents/);
    expect(result.spouseToDelete).toBeNull();
  });

  // 11. spouse identified correctly when member is the `toMember` side -----
  it('resolves potentialSpouse as fromMember when the target is the toMember in the SPOUSE connection', async () => {
    setupMocks({
      spouseConn: SPOUSE_CONN_TO,
      spouseHasParents: undefined,
      memberCount: 3,
    });
    const result = await preview();
    expect(result.canDelete).toBe(true);
    expect(result.spouseToDelete).toEqual(SPOUSE);
  });

  // 12. exactly 2 total members, no spouse — boundary: not blocked ---------
  it('allows deletion when exactly 2 members exist and there is no spouse to co-delete', async () => {
    setupMocks({ memberCount: 2 });
    await expect(preview()).resolves.toEqual({
      canDelete: true,
      blockReason: null,
      spouseToDelete: null,
    });
  });
});
