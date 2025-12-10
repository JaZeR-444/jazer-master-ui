const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
});

test('homepage loads and has title', async ({ page }) => {
  await expect(page).toHaveTitle(/JaZeR Component Library/);
});

test('homepage is accessible', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.length).toBe(0);
});
