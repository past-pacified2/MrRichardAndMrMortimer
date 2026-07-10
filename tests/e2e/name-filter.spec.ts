import { expect, test } from '@playwright/test';
import {
  getRequestedName,
  getRequestedPage,
  isCharactersListRequest,
  mockCharactersPageOne,
  mockCharactersPageTwo,
  mockRickCharacter,
} from './helpers/api';

test.describe('character name filter', () => {
  test('loads a shared name filter from the url', async ({ page }) => {
    await page.route('**/api/character**', async (route) => {
      const url = route.request().url();

      if (isCharactersListRequest(url) && getRequestedName(url) === 'Rick') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockCharactersPageOne,
            info: { ...mockCharactersPageOne.info, pages: 1, next: null },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/?name=Rick');

    await expect(page.getByLabel('Filter by character name')).toHaveValue('Rick');
    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Rick Sanchez/i })).toBeVisible();
  });

  test('updates the url after debouncing filter input', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });

    await page.getByLabel('Filter by character name').fill('Rick');

    await expect(page).toHaveURL('/?name=Rick', { timeout: 5_000 });
  });

  test('does not update the url until at least 3 characters are entered', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });

    await page.getByLabel('Filter by character name').fill('Ri');

    await expect(page).toHaveURL('/', { timeout: 1_000 });
  });

  test('preserves the name filter when paginating', async ({ page }) => {
    await page.route('**/api/character**', async (route) => {
      const url = route.request().url();

      if (!isCharactersListRequest(url) || getRequestedName(url) !== 'Rick') {
        await route.continue();
        return;
      }

      if (getRequestedPage(url) === 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCharactersPageTwo),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCharactersPageOne),
      });
    });

    await page.goto('/?name=Rick');

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Next page' }).click();

    await expect(page).toHaveURL('/?page=2&name=Rick');
    await expect(page.getByRole('button', { name: 'Page 2', disabled: true })).toBeVisible();
  });

  test('returns to the filtered grid from character detail', async ({ page }) => {
    await page.route('**/api/character**', async (route) => {
      const url = route.request().url();

      if (isCharactersListRequest(url) && getRequestedName(url) === 'Rick') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockCharactersPageOne,
            info: { ...mockCharactersPageOne.info, pages: 1, next: null },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.route(`**/api/character/${mockRickCharacter.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRickCharacter),
      });
    });

    await page.goto('/?name=Rick');

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await page.getByRole('link', { name: /Rick Sanchez/i }).click();

    await expect(page).toHaveURL(/\/character\/1$/);
    await expect(page.locator('[aria-label="Loading character"]')).toBeHidden({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Back to characters' }).click();

    await expect(page).toHaveURL('/?name=Rick');
    await expect(page.getByLabel('Filter by character name')).toHaveValue('Rick');
  });
});
