import { expect, test } from '@playwright/test';
import { getRequestedPage, isCharactersListRequest, mockCharactersPageTwo, mockPageTwoCharacter } from './helpers/api';

test.describe('character navigation', () => {
  test('loads the homepage and navigates to a character detail page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });

    const rickCard = page.getByRole('link', { name: /Rick Sanchez/i });
    await expect(rickCard).toBeVisible();
    await rickCard.click();

    await expect(page).toHaveURL(/\/character\/1$/);
    await expect(page.locator('[aria-label="Loading character"]')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Rick Sanchez', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to characters' })).toBeVisible();
  });

  test('returns to the homepage from the character detail page', async ({ page }) => {
    await page.goto('/character/1');

    await expect(page.locator('[aria-label="Loading character"]')).toBeHidden({ timeout: 15_000 });
    await page.getByRole('link', { name: 'Back to characters' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
  });

  test('loads a specific page from the url query param', async ({ page }) => {
    await page.goto('/?page=2');

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Page 2', disabled: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rick Sanchez/i })).toHaveCount(0);
  });

  test('returns to the paginated grid page from character detail', async ({ page }) => {
    await page.route('**/api/character**', async (route) => {
      const url = route.request().url();

      if (isCharactersListRequest(url) && getRequestedPage(url) === 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCharactersPageTwo),
        });
        return;
      }

      await route.continue();
    });

    await page.route(`**/api/character/${mockPageTwoCharacter.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPageTwoCharacter),
      });
    });

    await page.goto('/?page=2');

    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Page 2', disabled: true })).toBeVisible();

    const firstCard = page.getByRole('link', { name: /Test Character Page Two/i });
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    await expect(page).toHaveURL(/\/character\/21$/);
    await expect(page.locator('[aria-label="Loading character"]')).toBeHidden({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Back to characters' }).click();

    await expect(page).toHaveURL('/?page=2');
    await expect(page.getByRole('button', { name: 'Page 2', disabled: true })).toBeVisible();
  });
});
