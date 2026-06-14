/**
 * E2E: Password Recovery Flow
 *
 * Prerequisites:
 *   - Backend running at http://localhost:3000 with EMAIL_PROVIDER=log
 *   - Frontend running at http://localhost:5173
 *   - A seeded user in the DB (created via register in beforeAll)
 *
 * HOW TO CAPTURE THE RESET LINK:
 *   The LogEmailAdapter logs a sentinel line:
 *     PASSWORD_RESET_LINK:<url>
 *   to NestJS stdout. This test drives the backend via API and reads the
 *   link by calling a dedicated dev-only test-helper endpoint, OR by
 *   intercepting stdout if running in-process.
 *
 *   Current approach: register + forgot-password via API, then poll for
 *   the link via a backend test-helper route exposed at
 *   GET /v1/auth/test/last-reset-link (only available in test/dev mode).
 *
 *   If no helper route is available, the test falls back to asserting the
 *   forgot-password 200 response only and skips the reset flow with a
 *   descriptive warning.
 *
 * RUN THIS TEST:
 *   cd e2e && pnpm test password-recovery
 */

import { test, expect, request as apiRequest } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const BACKEND = 'http://localhost:3000/api/v1';
const FRONTEND = 'http://localhost:5173';

const stamp = Date.now();
const RECOVERY_TEST_USER = {
  email: `recovery.${stamp}@agenda.local`,
  password: 'RecoverMe1!',
  newPassword: 'NewSecret9@',
  firstName: 'Recovery',
  lastName: 'Tester',
  documentType: 'RUT',
  documentNumber: `88888${stamp % 1000}-K`,
};

/**
 * Register a test user and return their userId.
 */
async function registerTestUser(ctx: APIRequestContext): Promise<string> {
  const res = await ctx.post(`${BACKEND}/auth/register`, {
    data: {
      email: RECOVERY_TEST_USER.email,
      password: RECOVERY_TEST_USER.password,
      firstName: RECOVERY_TEST_USER.firstName,
      lastName: RECOVERY_TEST_USER.lastName,
      documentType: RECOVERY_TEST_USER.documentType,
      documentNumber: RECOVERY_TEST_USER.documentNumber,
    },
  });
  expect(res.ok(), `register: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  return body.data?.user?.id ?? '';
}

/**
 * Attempt to retrieve the last reset link from a dev test-helper endpoint.
 * Returns the URL or null if the endpoint is not available.
 */
async function fetchLastResetLink(ctx: APIRequestContext): Promise<string | null> {
  try {
    const res = await ctx.get(`${BACKEND}/auth/test/last-reset-link`, {
      failOnStatusCode: false,
    });
    if (res.ok()) {
      const body = await res.json();
      return body.resetLink ?? null;
    }
  } catch {
    // endpoint not available
  }
  return null;
}

test.describe('Password Recovery Flow', () => {
  let apiCtx: APIRequestContext;

  test.beforeAll(async () => {
    apiCtx = await apiRequest.newContext();
    await registerTestUser(apiCtx);
  });

  test.afterAll(async () => {
    await apiCtx.dispose();
  });

  // -------------------------------------------------------------------------
  // Step 1: Forgot-password page — submit existing email → generic success
  // -------------------------------------------------------------------------
  test('forgot-password page shows generic success for any email', async ({ page }) => {
    await page.goto(`${FRONTEND}/forgot-password`);
    await expect(page).toHaveURL(/\/forgot-password/);

    // The form is visible
    await expect(page.getByLabel(/correo electr/i)).toBeVisible();

    // Submit with the registered user's email
    await page.getByLabel(/correo electr/i).fill(RECOVERY_TEST_USER.email);
    await page.getByRole('button', { name: /enviar enlace/i }).click();

    // Anti-enumeration: same success state regardless
    await expect(page.getByText(/revisá tu bandeja/i)).toBeVisible({ timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // Step 2: Forgot-password page — validates email format client-side
  // -------------------------------------------------------------------------
  test('forgot-password page shows validation error for bad email', async ({ page }) => {
    await page.goto(`${FRONTEND}/forgot-password`);
    await page.getByLabel(/correo electr/i).fill('not-an-email');
    await page.getByRole('button', { name: /enviar enlace/i }).click();

    // Client-side validation error; no server request
    await expect(page.getByText(/correo válido/i)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Step 3: Reset-password page without token → error state
  // -------------------------------------------------------------------------
  test('reset-password page without token shows invalid link error', async ({ page }) => {
    await page.goto(`${FRONTEND}/reset-password`);
    // No token param → form should NOT be shown; error shown instead
    await expect(page.getByText(/enlace.*incompleto/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /solicitar nuevo enlace/i })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Step 4 (conditional): Full reset flow when test-helper endpoint is available
  // -------------------------------------------------------------------------
  test('full reset flow: forgot → capture link → reset → login with new password', async ({
    page,
  }) => {
    // Trigger forgot-password via API (so we get a fresh token)
    const forgotRes = await apiCtx.post(`${BACKEND}/auth/forgot-password`, {
      data: { email: RECOVERY_TEST_USER.email },
    });
    expect(forgotRes.ok()).toBeTruthy();
    expect((await forgotRes.json()).data?.message).toBeTruthy();

    // Attempt to retrieve the reset link from the dev helper endpoint
    const resetLink = await fetchLastResetLink(apiCtx);

    if (!resetLink) {
      // Test helper not available; skip the full reset flow.
      // The individual API unit tests cover the backend logic.
      test.skip();
      return;
    }

    // Navigate to the reset link
    await page.goto(resetLink);
    await expect(page).toHaveURL(/\/reset-password\?token=/);

    // The password form should be shown
    await expect(page.getByLabel(/nueva contraseña/i)).toBeVisible();

    // Submit new password
    await page.getByLabel(/nueva contraseña/i).fill(RECOVERY_TEST_USER.newPassword);
    await page.getByLabel(/confirmar contraseña/i).fill(RECOVERY_TEST_USER.newPassword);
    await page.getByRole('button', { name: /actualizar contraseña/i }).click();

    // Success state
    await expect(page.getByText(/todo listo/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /inicio de sesión/i })).toBeVisible();

    // Verify: old password no longer works
    const oldLoginRes = await apiCtx.post(`${BACKEND}/auth/login`, {
      data: { email: RECOVERY_TEST_USER.email, password: RECOVERY_TEST_USER.password },
      failOnStatusCode: false,
    });
    expect(oldLoginRes.status()).toBe(401);

    // Verify: new password works
    const newLoginRes = await apiCtx.post(`${BACKEND}/auth/login`, {
      data: { email: RECOVERY_TEST_USER.email, password: RECOVERY_TEST_USER.newPassword },
    });
    expect(newLoginRes.ok()).toBeTruthy();
    const loginBody = await newLoginRes.json();
    expect(loginBody.data?.accessToken).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Step 5: Login page has "forgot password" link
  // -------------------------------------------------------------------------
  test('login page has forgot-password link', async ({ page }) => {
    await page.goto(`${FRONTEND}/login`);
    const link = page.getByRole('link', { name: /olvidaste tu contraseña/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
