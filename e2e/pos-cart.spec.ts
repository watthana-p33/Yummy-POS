import { test, expect } from '@playwright/test';

test.describe('Fixed Cart Panel & Ordering Flow (TC-E2E-03)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submitBtn.click();
    }
    await expect(page.locator('text=Yummy POS').first()).toBeVisible();
  });

  test('should verify Cart panel remains strictly fixed during scrolling and allows checkout', async ({ page }) => {
    // 1. Locate the Right Cart panel
    const cartPanel = page.locator('aside').nth(1);
    await expect(cartPanel).toBeVisible();

    const initialCartBox = await cartPanel.boundingBox();
    expect(initialCartBox).not.toBeNull();

    // 2. Add product items to cart by clicking product cards
    const firstProductCard = page.locator('div.group').first();
    await expect(firstProductCard).toBeVisible();
    await firstProductCard.click();

    // Verify cart updates
    await expect(page.locator('button:has-text("ล้างตะกร้า")')).toBeVisible();

    // 3. Test Scroll Immobility: Scroll the center product catalog
    const productGrid = page.locator('.overflow-y-auto').first();
    await productGrid.evaluate((el) => {
      el.scrollTop = 500;
    });

    // Check that cart panel bounding box did NOT change
    const scrolledCartBox = await cartPanel.boundingBox();
    expect(scrolledCartBox?.x).toBe(initialCartBox?.x);
    expect(scrolledCartBox?.y).toBe(initialCartBox?.y);

    // 4. Test Checkout Modal trigger from Cart panel
    const checkoutBtn = cartPanel.locator('button:has-text("ชำระเงิน")');
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();

    // 5. Verify Checkout Dialog Modal opens
    await expect(page.locator('h3:has-text("ชำระเงินคำสั่งซื้อ")')).toBeVisible();
    await expect(page.locator('button:has-text("สแกน QR Code")')).toBeVisible();

    // Close checkout modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });
});
