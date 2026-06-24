import { describe, expect, it } from 'vitest';
import { FamilyTreeMemberConnectionEnum, FamilyTreeMemberConnectionSchema } from './family-tree-member-connection.schema';

const VALID_BASE = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
};

const VALID = {
  ...VALID_BASE,
  fromMemberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  toMemberId: 'b5f0c987-1e2a-4b3c-8d4e-5f6a7b8c9d0e',
  type: FamilyTreeMemberConnectionEnum.SPOUSE,
};

describe('FamilyTreeMemberConnectionSchema', () => {
  it('accepts a valid SPOUSE connection', () => {
    expect(FamilyTreeMemberConnectionSchema.safeParse(VALID).success).toBe(true);
  });

  it('accepts a valid PARENT connection', () => {
    expect(
      FamilyTreeMemberConnectionSchema.safeParse({
        ...VALID,
        type: FamilyTreeMemberConnectionEnum.PARENT,
      }).success,
    ).toBe(true);
  });

  describe('type', () => {
    it('rejects an unrecognized connection type', () => {
      expect(
        FamilyTreeMemberConnectionSchema.safeParse({ ...VALID, type: 'SIBLING' }).success,
      ).toBe(false);
    });
  });

  describe('fromMemberId / toMemberId', () => {
    it('rejects a non-UUID fromMemberId', () => {
      expect(
        FamilyTreeMemberConnectionSchema.safeParse({ ...VALID, fromMemberId: 'not-a-uuid' }).success,
      ).toBe(false);
    });

    it('rejects a non-UUID toMemberId', () => {
      expect(
        FamilyTreeMemberConnectionSchema.safeParse({ ...VALID, toMemberId: 'not-a-uuid' }).success,
      ).toBe(false);
    });
  });
});
