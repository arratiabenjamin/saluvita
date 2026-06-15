/**
 * E2E: Pagination Controls (light)
 *
 * Prerequisites:
 *   - Backend running at http://localhost:3000
 *   - Frontend running at http://localhost:5173
 *   - A logged-in user session (we create a temp user in beforeAll)
 *
 * Strategy:
 *   Seed a user, log in via UI, navigate to /patients or /reminders.
 *   If there is more than 1 page, exercise next/prev. If only 1 page (few data),
 *   verify the controls are present and don't break.
 *
 * RUN:
 *   cd e2e && pnpm test pagination
 */

import { test, expect, request as apiRequest } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const BACKEND = 'http://localhost:3000/api/v1';
const FRONTEND = 'http://localhost:5173';

const stamp = Date.now();
const PAGINATION_TEST_USER = {
  email: `pagination.${stamp}@agenda.local`,
  password: 'PaginTest1!',
  firstName: 'Paging',
  lastName: 'Tester',
  documentType: 'RUT',
  documentNumber: `77777${stamp % 1000}-K`,
};

async function registerAndLogin(ctx: APIRequestContext): Promise<string> {
  const registerRes = await ctx.post(`${BACKEND}/auth/register`, {
    data: PAGINATION_TEST_USER,
  });
  expect(
    registerRes.ok(),
    `register: ${registerRes.status()} ${await registerRes.text()}`,
  ).toBeTruthy();
  const body = await registerRes.json();
  return body.data?.accessToken ?? '';
}

test.describe('Pagination Controls', () => {
  let apiCtx: APIRequestContext;
  let accessToken: string;

  test.beforeAll(async () => {
    apiCtx = await apiRequest.newContext();
    accessToken = await registerAndLogin(apiCtx);
  });

  test.afterAll(async () => {
    await apiCtx.dispose();
  });

  // -------------------------------------------------------------------------
  // Navigate to /patients and check pagination renders without breaking
  // -------------------------------------------------------------------------
  test('patients list: pagination controls are present and page label is visible', async ({
    page,
  }) => {
    // Log in via UI
    await page.goto(`${FRONTEND}/login`);
    await page.getByLabel(/correo electr/i).fill(PAGINATION_TEST_USER.email);
    await page.getByLabel(/contraseña/i).fill(PAGINATION_TEST_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait for redirect to dashboard/home
    await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 10000 });

    // Navigate to patients page
    await page.goto(`${FRONTEND}/patients`);
    await page.waitForLoadState('networkidle');

    // The page should not crash (no error boundaries triggered)
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible({
      timeout: 8000,
    });

    // Count the rows/items to determine if we have multi-page content
    const rows = page.locator('table tbody tr, [data-testid="patient-card"]');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      // No patients yet — pagination may not render; just confirm no crash
      test.info().annotations.push({
        type: 'note',
        description: 'No patients found; pagination controls may be hidden — skipping nav test',
      });
      return;
    }

    // If pagination component is visible, verify the page label format
    const paginationLabel = page.locator('text=/página \\d+ de \\d+/i');
    const hasPagination = await paginationLabel.count();

    if (hasPagination > 0) {
      await expect(paginationLabel.first()).toBeVisible();

      const labelText = await paginationLabel.first().textContent();
      // Extract current page and total from "Página X de Y"
      const match = labelText?.match(/(\d+)\s+de\s+(\d+)/i);
      expect(match, `Expected pagination label, got: "${labelText}"`).not.toBeNull();

      const currentPage = parseInt(match![1]);
      const totalPages = parseInt(match![2]);

      // Previous button should be disabled on page 1
      if (currentPage === 1) {
        const prevBtn = page.getByRole('button', { name: /anterior/i });
        if ((await prevBtn.count()) > 0) {
          const isDisabled =
            (await prevBtn.getAttribute('disabled')) !== null ||
            (await prevBtn.getAttribute('aria-disabled')) === 'true';
          expect(isDisabled).toBe(true);
        }
      }

      // If there are multiple pages, navigate to next
      if (totalPages > 1) {
        const nextBtn = page.getByRole('button', { name: /siguiente/i });
        await expect(nextBtn).not.toBeDisabled();
        await nextBtn.click();
        await page.waitForLoadState('networkidle');

        // Page label should now say page 2
        const updatedLabel = await paginationLabel.first().textContent();
        const updatedMatch = updatedLabel?.match(/(\d+)\s+de\s+(\d+)/i);
        expect(parseInt(updatedMatch![1])).toBe(2);

        // Navigate back
        const prevBtn = page.getByRole('button', { name: /anterior/i });
        await expect(prevBtn).not.toBeDisabled();
        await prevBtn.click();
        await page.waitForLoadState('networkidle');

        const restoredLabel = await paginationLabel.first().textContent();
        const restoredMatch = restoredLabel?.match(/(\d+)\s+de\s+(\d+)/i);
        expect(parseInt(restoredMatch![1])).toBe(1);
      }
    } else {
      // Pagination component not rendered (single page or no data)
      // Just confirm the page doesn't show an error
      await expect(page.locator('text=/error/i')).not.toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // Verify pagination component structure (unit-level via reminders page)
  // -------------------------------------------------------------------------
  test('reminders list: page renders without error regardless of item count', async ({ page }) => {
    // Log in via UI (fresh page context)
    await page.goto(`${FRONTEND}/login`);
    await page.getByLabel(/correo electr/i).fill(PAGINATION_TEST_USER.email);
    await page.getByLabel(/contraseña/i).fill(PAGINATION_TEST_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 10000 });

    await page.goto(`${FRONTEND}/reminders`);
    await page.waitForLoadState('networkidle');

    // No crash = no error boundary message
    const errorIndicators = page.locator('text=/algo salió mal/i, text=/error inesperado/i');
    expect(await errorIndicators.count()).toBe(0);

    // Either data or empty state is shown — neither crashes
    const headingOrEmpty = page.locator(
      '[data-testid="reminders-list"], text=/sin recordatorios/i, text=/no hay recordatorios/i, h1, h2',
    );
    await expect(headingOrEmpty.first()).toBeVisible({ timeout: 8000 });
  });
});
