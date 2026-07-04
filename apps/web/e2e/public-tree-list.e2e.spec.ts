import { expect, test } from '@playwright/test';
import { makePaginated, makeTree, mockUnauthenticated } from './fixtures';

test.describe('Public tree list page (/family-trees/public)', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticated(page);
  });

  test('renders tree cards from API data', async ({ page }) => {
    // Regex includes port 9999 so it only matches the API call, not SPA navigation (port 4300).
    await page.route(/localhost:9999.*\/family-trees\/public/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          makePaginated('familyTrees', [makeTree({ name: 'Smith Family' })]),
        ),
      }),
    );

    await page.goto('/family-trees/public');

    await expect(page.getByText('Smith Family')).toBeVisible();
  });

  test('renders without crashing when the list is empty', async ({ page }) => {
    await page.route(/localhost:9999.*\/family-trees\/public/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePaginated('familyTrees', [])),
      }),
    );

    await page.goto('/family-trees/public');

    await expect(page).toHaveURL('/family-trees/public');
    await expect(
      page.getByRole('tab', { name: /public family trees/i }),
    ).toBeVisible();
  });
});
