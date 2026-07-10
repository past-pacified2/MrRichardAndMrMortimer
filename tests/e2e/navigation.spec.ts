import { expect, test } from '@playwright/test';

test.describe('character navigation', () => {
  test('loads the homepage and navigates to a character detail page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });

    const rickCard = page.getByRole('link', { name: "View Rick Sanchez's details" });
    await expect(rickCard).toBeVisible();
    await rickCard.click();

    await expect(page).toHaveURL(/\/character\/1$/);
    await expect(page.getByLabel('Loading character')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Rick Sanchez', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to characters' })).toBeVisible();
  });

  test('returns to the homepage from the character detail page', async ({ page }) => {
    await page.goto('/character/1');

    await expect(page.getByLabel('Loading character')).toBeHidden({ timeout: 15_000 });
    await page.getByRole('link', { name: 'Back to characters' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
  });
});
