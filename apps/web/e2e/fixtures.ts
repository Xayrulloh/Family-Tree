import type { Page } from '@playwright/test';

export const API_URL = 'http://localhost:9999/api';

export const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  image: null,
  gender: 'MALE',
  dob: null,
  dod: null,
  description: null,
  deletedAt: null,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

export function makeTree(overrides: { id?: string; name?: string } = {}) {
  return {
    id: overrides.id ?? '00000000-0000-0000-0000-000000000002',
    name: overrides.name ?? 'Test Tree',
    image: null,
    isPublic: false,
    createdBy: mockUser.id,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    deletedAt: null,
  };
}

export function makePaginated(key: string, items: object[]) {
  return {
    page: 1,
    perPage: 15,
    totalCount: items.length,
    totalPages: items.length > 0 ? 1 : 0,
    [key]: items,
  };
}

export async function mockUnauthenticated(page: Page): Promise<void> {
  await page.route(`${API_URL}/users/me`, (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 401, message: 'Unauthorized' }),
    }),
  );
}

export async function mockAuthenticated(page: Page): Promise<void> {
  await page.route(`${API_URL}/users/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    }),
  );
}
