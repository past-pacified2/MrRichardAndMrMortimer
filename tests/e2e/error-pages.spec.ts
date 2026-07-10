import { expect, test } from '@playwright/test';

test.describe('error pages', () => {
  test('shows the 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-dimension-does-not-exist');

    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/this-dimension-does-not-exist$/);
    await expect(page.getByRole('heading', { name: 'Dimension not found', level: 1 })).toBeVisible();
    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Back to characters' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
  });

  test('shows the 404 page for invalid character ids', async ({ page }) => {
    await page.goto('/character/not-a-character');

    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/character\/not-a-character$/);
    await expect(page.getByRole('heading', { name: 'Dimension not found', level: 1 })).toBeVisible();
  });

  test('shows the 404 page for unknown character ids from the api', async ({ page }) => {
    await page.goto('/character/99999');

    await expect(page.getByLabel('Loading character')).toBeHidden({ timeout: 15_000 });
    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/character\/99999$/);
    await expect(page.getByRole('heading', { name: 'Dimension not found', level: 1 })).toBeVisible();
  });

  test('shows the 500 page with the default message', async ({ page }) => {
    await page.goto('/500');

    await expect(page).toHaveTitle(/Something went wrong/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/500$/);
    await expect(page.getByRole('heading', { name: 'Portal malfunction', level: 1 })).toBeVisible();
    await expect(page.getByText('500', { exact: true })).toBeVisible();
    await expect(page.getByText('An unknown error occurred in this dimension.')).toBeVisible();
    await page.getByRole('link', { name: 'Back to characters' }).click();

    await expect(page).toHaveURL('/');
  });
});
