import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

test.describe('accessibility', () => {
  test('homepage meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Loading characters')).toBeHidden({ timeout: 15_000 });

    const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();

    expect(results.violations).toEqual([]);
  });

  test('character detail page meets WCAG AA', async ({ page }) => {
    await page.goto('/character/1');
    await expect(page.getByLabel('Loading character')).toBeHidden({ timeout: 15_000 });

    const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();

    expect(results.violations).toEqual([]);
  });
});
