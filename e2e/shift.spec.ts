import { test, expect } from '@playwright/test';

test.describe('Shift Management Flow directly on POS Screen', () => {
  test('should allow opening and closing shifts directly from the POS sales screen without lingering open status', async ({ page }) => {
    await page.goto('/');

    // Ensure logged in
    await page.evaluate(() => {
      localStorage.setItem(
        'yummy_pos_user',
        JSON.stringify({
          id: 'u-admin-01',
          name: 'สมศักดิ์ มั่งมี (Admin)',
          username: 'somsak',
          role: 'admin',
          avatar: '👑',
        })
      );
    });
    await page.reload();

    // 1. Verify POS screen is visible
    await expect(page.locator('aside').first()).toBeVisible();

    // 2. Locate Close Shift button on POS screen if shift is open
    const closeShiftBtn = page.locator('[data-testid="pos-close-shift-btn"]');
    const openShiftBtn = page.locator('[data-testid="pos-open-shift-btn"]');

    if (await closeShiftBtn.isVisible()) {
      // Shift is open -> click to close
      await closeShiftBtn.click();

      // Modal should appear
      await expect(page.locator('button:has-text("ยืนยันปิดกะ")')).toBeVisible();
      await page.locator('button:has-text("ยืนยันปิดกะ")').click();

      // After closing, open shift button should now be visible and close button should NOT be visible
      await expect(openShiftBtn).toBeVisible();
      await expect(closeShiftBtn).not.toBeVisible();

      // Sidebar should display closed status
      await expect(page.locator('aside').first().locator('text=กะปิดแล้ว')).toBeVisible();
    }

    // 3. Open a new shift directly from POS screen
    await expect(openShiftBtn).toBeVisible();
    await openShiftBtn.click();

    // Modal should appear
    await expect(page.locator('button:has-text("ยืนยันเปิดกะ")')).toBeVisible();
    await page.locator('button:has-text("ยืนยันเปิดกะ")').click();

    // After opening, close shift button should be visible again
    await expect(closeShiftBtn).toBeVisible();
    await expect(openShiftBtn).not.toBeVisible();

    // Sidebar should display active shift status
    await expect(page.locator('aside').first().locator('text=กะเปิดอยู่')).toBeVisible();
  });
});
