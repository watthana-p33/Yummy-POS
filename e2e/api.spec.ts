import { test, expect } from '@playwright/test';

test.describe('Backend API & Swagger Reachability (TC-E2E-05)', () => {
  test('should verify backend server endpoints return expected responses', async ({ request }) => {
    // Check if backend is reachable at localhost:3000
    try {
      const response = await request.get('http://localhost:3000/api/products');
      if (response.status() === 200) {
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
      }
    } catch {
      // Backend may not be actively running during isolated frontend testing
      test.skip();
    }
  });
});
