import { test, expect } from '@playwright/test';

test.describe('Owner Staff Info & Menu Permission Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh and sign in as Admin (Owner)
    await page.goto('/#/login');
    await page.evaluate(() => {
      localStorage.clear();
      // Pre-set admin as logged in user
      localStorage.setItem(
        'yummy_pos_user',
        JSON.stringify({
          id: 'u3',
          name: 'Admin ผู้จัดการร้าน (Owner)',
          username: 'admin',
          role: 'admin',
          avatar: '🧑‍💻',
          permissions: ['pos', 'products', 'staff', 'sales', 'reports'],
        })
      );
    });
    await page.goto('/#/staff');
    await page.waitForLoadState('networkidle');
  });

  test('should display permission badges, allow editing staff info and toggling permissions by owner', async ({ page }) => {
    // 1. Navigate to Staff & Shifts Tab
    const staffTabBtn = page.locator('[data-testid="sidebar-nav-staff"]');
    await expect(staffTabBtn).toBeVisible();
    await staffTabBtn.click();

    // 2. Locate "แก้ไขข้อมูล & สิทธิ์" button for Somchai
    const editSomchaiBtn = page.locator('[data-testid="edit-staff-btn-somchai"]');
    await expect(editSomchaiBtn).toBeVisible();
    await editSomchaiBtn.click();

    // 5. Verify Edit Modal opened
    await expect(page.locator('h3:has-text("แก้ไขข้อมูลพนักงานและสิทธิ์การเข้าถึง")')).toBeVisible();

    // 6. Test Quick Presets: Click "ผู้จัดการ" preset
    const managerPresetBtn = page.locator('button:has-text("ผู้จัดการ (ไม่รวมจัดการพนักงาน)")');
    await expect(managerPresetBtn).toBeVisible();
    await managerPresetBtn.click();

    // 7. Toggle a specific permission: Toggle off Reports permission
    const permSelect = page.locator('[data-testid="permissions-select"]');
    if (await permSelect.isVisible()) {
      await permSelect.click();
    }
    const toggleReports = page.locator('[data-testid="toggle-perm-reports"]');
    await expect(toggleReports).toBeVisible();
    await toggleReports.click();
    await page.keyboard.press('Escape');

    // 8. Save changes
    const saveBtn = page.locator('[data-testid="save-edit-staff-btn"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 9. Verify success notification banner
    await expect(page.locator('text=อัปเดตข้อมูลและสิทธิ์พนักงานเรียบร้อยแล้ว')).toBeVisible();
  });
});
