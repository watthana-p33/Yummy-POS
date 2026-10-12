import { test, expect } from '@playwright/test';

test.describe('Owner Staff Info & Menu Permission Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh and sign in as Admin (Owner)
    await page.goto('/');
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
    await page.reload();
    await expect(page.locator('text=Yummy POS').first()).toBeVisible();
  });

  test('should display permission badges, allow editing staff info and toggling permissions by owner', async ({ page }) => {
    // 1. Navigate to Staff & Shifts Tab
    const staffTabBtn = page.locator('aside button:has-text("พนักงาน & กะ")');
    await expect(staffTabBtn).toBeVisible();
    await staffTabBtn.click();

    // 2. Switch to "รายชื่อพนักงานในระบบ" subtab
    const usersSubTab = page.locator('button:has-text("รายชื่อพนักงานในระบบ")');
    await expect(usersSubTab).toBeVisible();
    await usersSubTab.click();

    // 3. Verify staff cards and permission section are rendered
    await expect(page.locator('text=รายชื่อพนักงานสำหรับร้านค้านี้')).toBeVisible();
    await expect(page.locator('text=สิทธิ์การเข้าถึงเมนู').first()).toBeVisible();

    // 4. Locate "แก้ไขข้อมูล & สิทธิ์" button for Somchai
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
    const toggleReports = page.locator('[data-testid="toggle-perm-reports"]');
    await expect(toggleReports).toBeVisible();
    await toggleReports.click();

    // 8. Save changes
    const saveBtn = page.locator('[data-testid="save-edit-staff-btn"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 9. Verify success notification banner
    await expect(page.locator('text=อัปเดตข้อมูลและสิทธิ์พนักงานเรียบร้อยแล้ว')).toBeVisible();
  });
});
