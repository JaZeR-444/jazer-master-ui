const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('@axe-core/playwright');

test.beforeEach(async ({ page }) => {
  await page.goto('/HOME.html');
  await injectAxe(page);
});

test('homepage loads and has title', async ({ page }) => {
  await expect(page).toHaveTitle(/JaZeR Component Library/);
});

test('homepage is accessible', async ({ page }) => {
  const results = await checkA11y(page);
  expect(results.violations.length).toBe(0);
});
