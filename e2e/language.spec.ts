import { test, expect } from '@playwright/test';

test.describe('Multi-Language Switching Flow (TH / EN)', () => {
  test('should toggle between Thai and English smoothly on Login and Dashboard', async ({ page }) => {
    // 1. Visit Login screen with cleared session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('yummy_pos_user', 'null');
      localStorage.setItem('yummy_pos_lang', 'th');
    });
    await page.reload();

    // Verify initial Thai locale
    await expect(page.locator('h2:has-text("เข้าสู่ระบบแคชเชียร์")')).toBeVisible();

    // 2. Toggle to English on Login Screen
    const loginLangBtn = page.locator('[data-testid="toggle-lang-btn"]').first();
    await expect(loginLangBtn).toBeVisible();
    await loginLangBtn.click();

    // Assert English translations rendered
    await expect(page.locator('h2:has-text("Cashier Sign In")')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Sign In to POS")')).toBeVisible();

    // 3. Login to Dashboard
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Yummy POS').first()).toBeVisible();

    // Assert Dashboard English items
    await expect(page.locator('aside button:has-text("Point of Sale")')).toBeVisible();
    await expect(page.locator('aside button:has-text("Inventory & Menu")')).toBeVisible();

    // 4. Toggle back to Thai on Sidebar
    const sidebarLangBtn = page.locator('aside [data-testid="toggle-lang-btn"]');
    await expect(sidebarLangBtn).toBeVisible();
    await sidebarLangBtn.click();

    // Assert Thai menu returned
    await expect(page.locator('aside button:has-text("หน้าขายสินค้า")')).toBeVisible();
    await expect(page.locator('aside button:has-text("จัดการสินค้า")')).toBeVisible();
  });
});
