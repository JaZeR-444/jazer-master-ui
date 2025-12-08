const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('@axe-core/playwright');

test.beforeEach(async ({ page }) => {
  await page.goto('/HOME.html');
  await injectAxe(page);
});

test('homepage has main hero and navigation', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText(/Component Library/);
  await expect(page.locator('.category-card')).toHaveCountGreaterThan(0);
});

test('homepage a11y', async ({ page }) => {
  const results = await checkA11y(page);
  expect(results.violations.length).toBe(0);
});
