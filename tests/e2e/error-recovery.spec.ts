import { expect, test } from '@playwright/test';

const CHARACTERS_API = '**/api/character';

test.describe('error recovery', () => {
  test('shows an error state and recovers after retry', async ({ page }) => {
    let requestCount = 0;
    let shouldFail = true;

    await page.route(CHARACTERS_API, async (route) => {
      const url = route.request().url();

      if (!/\/character\/?$/.test(url)) {
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

      await route.continue();
    });

    await page.goto('/');

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toContainText('Server error');

    shouldFail = false;
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Rick Sanchez', level: 2 })).toBeVisible({ timeout: 15_000 });
    expect(requestCount).toBeGreaterThanOrEqual(2);
  });
});
