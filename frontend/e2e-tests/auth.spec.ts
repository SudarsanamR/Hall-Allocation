import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should display login page', async ({ page }) => {
        await page.goto('/login');

        // Check login form elements exist
        await expect(page.getByText('Admin Access')).toBeVisible();
        await expect(page.getByPlaceholder('Enter Username')).toBeVisible();
        await expect(page.getByRole('button', { name: /login|verifying/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        // Fill in invalid credentials
        await page.getByPlaceholder('Enter Username').fill('wronguser');
        await page.locator('input[type="password"]').fill('wrongpassword');

        // Submit form
        await page.getByRole('button', { name: /login/i }).click();

        // Expect error message
        await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to register page', async ({ page }) => {
        await page.goto('/login');

        // Click "New User?" link
        await page.getByText('New User?').click();

        // Should be on register page
        await expect(page).toHaveURL(/register/);
    });

    test('should show register form elements', async ({ page }) => {
        await page.goto('/register');

        // Check register form elements
        await expect(page.getByPlaceholder(/username/i)).toBeVisible();
        await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
        await page.goto('/login');

        // Check forgot password link
        await expect(page.getByText('Forgot Password?')).toBeVisible();
    });

});
