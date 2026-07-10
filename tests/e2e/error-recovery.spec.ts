import { expect, test } from '@playwright/test';
import { isCharactersListRequest, mockCharactersPageOne } from './helpers/api';

test.describe('error recovery', () => {
  test('shows an error state and recovers after retry', async ({ page }) => {
    let requestCount = 0;
    let shouldFail = true;

    await page.route('**/api/character**', async (route) => {
      const url = route.request().url();

      if (!isCharactersListRequest(url)) {
        await route.continue();
        return;
      }

      requestCount += 1;

      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCharactersPageOne),
      });
    });

    await page.goto('/');

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toContainText('Server error');

    shouldFail = false;
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Rick Sanchez/i })).toBeVisible({ timeout: 15_000 });
    expect(requestCount).toBeGreaterThanOrEqual(2);
  });
});
