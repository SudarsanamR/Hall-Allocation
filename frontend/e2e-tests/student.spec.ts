import { test, expect } from '@playwright/test';

test.describe('Student Dashboard', () => {

    test('should display student search page', async ({ page }) => {
        await page.goto('/');

        // Check for search elements
        await expect(page.getByText('Check Your Seat')).toBeVisible();
        await expect(page.getByPlaceholder('Register Number (12 digits)')).toBeVisible();
    });

    test('should have search button disabled for invalid input', async ({ page }) => {
        await page.goto('/');

        // Enter invalid register number (less than 12 digits)
        await page.getByPlaceholder('Register Number (12 digits)').fill('12345');

        // Search button should be disabled
        const searchButton = page.getByRole('button', { name: /search/i });
        await expect(searchButton).toBeDisabled();
    });

    test('should enable search button for valid input', async ({ page }) => {
        await page.goto('/');

        // Enter valid 12-digit register number
        await page.getByPlaceholder('Register Number (12 digits)').fill('123456789012');

        // Search button should be enabled
        const searchButton = page.getByRole('button', { name: /search/i });
        await expect(searchButton).toBeEnabled();
    });

    test('should only accept numeric input', async ({ page }) => {
        await page.goto('/');

        // Try entering letters
        const input = page.getByPlaceholder('Register Number (12 digits)');
        await input.fill('abc123def456');

        // Should only contain digits
        await expect(input).toHaveValue('123456');
    });

});
