import { test, expect } from '@playwright/test';

test.describe('Cashier Authentication Flow (TC-E2E-01)', () => {
  test('should display login screen with quick cashiers and successfully sign in', async ({ page }) => {
    await page.goto('/');

    // 0. Ensure user is logged out for login screen testing
    await page.evaluate(() => {
      localStorage.removeItem('yummy_pos_user');
      localStorage.setItem('yummy_pos_user', 'null');
    });
    await page.reload();

    // 1. Verify Login Title & Elements
    await expect(page.locator('h2:has-text("เข้าสู่ระบบแคชเชียร์")')).toBeVisible();

    // 2. Select Quick Cashier (e.g. สมชาย ตั้งใจขาย)
    const cashierButton = page.locator('button:has-text("สมชาย ตั้งใจขาย")');
    if (await cashierButton.isVisible()) {
      await cashierButton.click();
    }

    // 3. Submit form
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 4. Assert Successful Login and App Shell visibility
    await expect(page.locator('text=Yummy POS').first()).toBeVisible();
    await expect(page.locator('aside').first()).toBeVisible();
  });
});
