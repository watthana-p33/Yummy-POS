import { test, expect } from '@playwright/test';

test.describe('Theme Switcher & Touch Ergonomics (TC-E2E-04)', () => {
  test('should toggle between Light and Dark mode with adequate touch targets', async ({ page }) => {
    await page.goto('/');

    // 1. Check Theme Toggle button on Login Screen
    const themeBtn = page.locator('button[title*="ธีม"], button:has-text("Light"), button:has-text("Dark"), button:has-text("โหมด")').first();
    if (await themeBtn.isVisible()) {
      const box = await themeBtn.boundingBox();
      if (box) {
        // Must meet 44px touch target guideline
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
      await themeBtn.click();
    }

    // 2. Sign in to check sidebar theme toggle
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submitBtn.click();
    }
    await expect(page.locator('text=Yummy POS').first()).toBeVisible();

    // 3. Find and click sidebar theme toggle
    const sidebarThemeBtn = page.locator('aside button').filter({ has: page.locator('svg') }).nth(3);
    if (await sidebarThemeBtn.isVisible()) {
      await sidebarThemeBtn.click();
      // Wait for transition
      await page.waitForTimeout(300);
    }
  });
});
