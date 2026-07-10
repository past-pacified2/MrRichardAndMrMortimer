import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

async function expectNoViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();

  expect(results.violations).toEqual([]);
}

test.describe('accessibility', () => {
  test('homepage meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });

    await expectNoViolations(page);
  });

  test('character detail page meets WCAG AA', async ({ page }) => {
    await page.goto('/character/1');
    await expect(page.locator('[aria-label="Loading character"]')).toBeHidden({ timeout: 15_000 });

    await expectNoViolations(page);
  });

  test('404 page meets WCAG AA', async ({ page }) => {
    await page.goto('/this-dimension-does-not-exist');

    await expect(page.getByRole('heading', { name: 'Dimension not found', level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });

  test('500 page meets WCAG AA', async ({ page }) => {
    await page.goto('/500');

    await expect(page.getByRole('heading', { name: 'Portal malfunction', level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });

  test('character not-found page meets WCAG AA', async ({ page }) => {
    await page.goto('/character/99999');
    await expect(page.locator('[aria-label="Loading character"]')).toBeHidden({ timeout: 15_000 });

    await expect(page.getByRole('heading', { name: 'Dimension not found', level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });
});
