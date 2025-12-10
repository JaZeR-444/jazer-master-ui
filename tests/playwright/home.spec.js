const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
});

test('homepage has main hero and navigation', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText(/Component Library/);
  await expect(page.locator('.category-card')).toHaveCountGreaterThan(0);
});

test('homepage a11y', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.length).toBe(0);
});
