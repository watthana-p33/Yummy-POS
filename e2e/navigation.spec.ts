import { test, expect } from '@playwright/test';

test.describe('Fixed Left Sidebar Navigation (TC-E2E-02)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submitBtn.click();
    }
    await expect(page.locator('text=Yummy POS').first()).toBeVisible();
  });

  test('should render fixed left sidebar and navigate across tabs seamlessly', async ({ page }) => {
    // 1. Verify Left Sidebar existence and dimensions
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Sidebar should be pinned to left: 0
      expect(box.x).toBe(0);
      expect(box.width).toBeGreaterThanOrEqual(250);
    }

    // 2. Navigate to "จัดการสินค้า" (Products)
    const productsBtn = page.locator('button:has-text("จัดการสินค้า")');
    await productsBtn.click();
    await expect(page.locator('h1:has-text("จัดการรายการสินค้า & สต็อก")')).toBeVisible();

    // 3. Navigate to "รายงาน & ประวัติขาย" (Sales History)
    const salesBtn = page.locator('button:has-text("รายงาน & ประวัติขาย")');
    await salesBtn.click();
    await expect(page.locator('text=ยอดขายรวมสุทธิ')).toBeVisible();

    // 4. Return to "หน้าขายสินค้า" (POS)
    const posBtn = page.locator('button:has-text("หน้าขายสินค้า")');
    await posBtn.click();
    await expect(page.locator('input[placeholder*="ค้นหาชื่ออาหาร"]').first()).toBeVisible();

    // 5. Verify Sidebar position remains unchanged
    const finalBox = await sidebar.boundingBox();
    expect(finalBox?.x).toBe(0);
  });

  test('should toggle sidebar between expanded and collapsed states smoothly', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const toggleBtn = page.locator('[data-testid="toggle-sidebar-collapse-btn"]');

    // 1. Initial state: expanded (width >= 250px)
    await expect(toggleBtn).toBeVisible();
    let box = await sidebar.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(250);

    // 2. Click collapse button -> width shrinks to <= 100px (w-20 is 80px)
    await toggleBtn.click();
    await page.waitForTimeout(350); // wait for 300ms transition
    box = await sidebar.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(100);

    // 3. Click expand button -> width returns to >= 250px
    await toggleBtn.click();
    await page.waitForTimeout(350); // wait for 300ms transition
    box = await sidebar.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(250);
  });
});
