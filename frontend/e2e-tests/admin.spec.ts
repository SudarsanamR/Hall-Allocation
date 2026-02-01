import { test, expect } from '@playwright/test';

/**
 * Admin E2E tests - These require backend to be running
 * To run: Start backend (python run.py) before running these tests
 */

test.describe('Admin Login Page', () => {

    test('should display login page', async ({ page }) => {
        await page.goto('/login');

        // Check login form elements exist
        await expect(page.getByText('Admin Access')).toBeVisible();
        await expect(page.getByPlaceholder('Enter Username')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    });

    test('should have links to register and forgot password', async ({ page }) => {
        await page.goto('/login');

        await expect(page.getByText('New User?')).toBeVisible();
        await expect(page.getByText('Forgot Password?')).toBeVisible();
    });

});

// Admin dashboard tests are skipped by default as they require backend
// Uncomment and run with: npx playwright test --grep "Admin Dashboard"
test.describe.skip('Admin Dashboard (requires backend)', () => {

    test('should login and access dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.getByPlaceholder('Enter Username').fill('SuperAdmin');
        await page.locator('input[type="password"]').fill('GCEEAdmin@2026!');
        await page.getByRole('button', { name: /login/i }).click();

        // Wait for navigation
        await page.waitForURL(/super-admin|admin/, { timeout: 15000 });
        await expect(page.url()).toMatch(/super-admin|admin/);
    });

});
