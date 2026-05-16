import { test, expect, request as apiRequest } from '@playwright/test';

const BACKEND = 'http://localhost:3000/api/v1';
const FRONTEND = 'http://localhost:5173';

const stamp = Date.now();
const TEST_USER = {
  email: `e2e.${stamp}@agenda.local`,
  password: 'Test12345',
  firstName: 'E2E',
  lastName: 'Tester',
  documentType: 'RUT',
  documentNumber: `99999${stamp % 1000}-K`,
};

let userPatientId = '';

test.beforeAll(async () => {
  const ctx = await apiRequest.newContext();
  const res = await ctx.post(`${BACKEND}/auth/register`, { data: TEST_USER });
  expect(res.ok(), `register: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  userPatientId = body.data?.user?.patientId ?? '';
  expect(userPatientId).toBeTruthy();
});

test('login → empty dashboard → create cita → see it on /appointments', async ({ page }) => {
  // 1) Login via UI
  await page.goto(`${FRONTEND}/login`);
  await expect(page).toHaveURL(/\/login/);

  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_USER.email);
  await page
    .locator('input[type="password"], input[name="password"]')
    .first()
    .fill(TEST_USER.password);
  await page.getByRole('button', { name: /ingres|iniciar|entrar|login/i }).first().click();

  await page.waitForURL(/\/dashboard/, { timeout: 10000 });

  // 2) Visita /professionals (lista vacía esperada porque no hay citas aún)
  await page.goto(`${FRONTEND}/professionals`);
  await expect(page.locator('h1', { hasText: /profesionales/i }).first()).toBeVisible();
  // Empty state since no appointments yet
  await expect(page.getByText(/Sin profesionales registrados/i)).toBeVisible({ timeout: 5000 });

  // 3) Crear una cita via backend (porque solo se crea desde /professionals con un doctor previo)
  //    En la app real, el form aparece al "Preparar próxima cita" con un profesional existente.
  //    Para testear E2E con un profesional ya existente, creamos primero una cita base via API.
  const ctx = await apiRequest.newContext();
  const loginRes = await ctx.post(`${BACKEND}/auth/login`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });
  const loginBody = await loginRes.json();
  const token = loginBody.data.accessToken;

  // Programá la cita para HOY a una hora futura del día (para que entre en el tab "today")
  const todayAt = new Date();
  todayAt.setHours(23, 30, 0, 0);
  const aptRes = await ctx.post(`${BACKEND}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      patientId: userPatientId,
      startsAt: todayAt.toISOString(),
      doctorName: 'Dr. E2E Pérez',
      specialty: 'Cardiología',
      facilityName: 'Clínica E2E',
      reason: 'Control creado en test E2E',
    },
  });
  expect(aptRes.ok(), `create appt: ${aptRes.status()}`).toBeTruthy();

  // 4) Recarga /professionals — ahora debería aparecer Dr. E2E Pérez
  await page.goto(`${FRONTEND}/professionals`);
  await expect(page.getByText('Dr. E2E Pérez', { exact: false })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Cardiología').first()).toBeVisible();

  // 5) Visita /appointments y valida que la cita aparezca (tab today por default)
  await page.goto(`${FRONTEND}/appointments`);
  await expect(page.getByText('Control creado en test E2E').first()).toBeVisible({
    timeout: 5000,
  });

  // 6) Abrir el detalle de la cita (botón "Ver detalle" del row)
  await page.getByRole('button', { name: /Ver detalle/i }).first().click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: /Detalle de cita/i })).toBeVisible();
  await expect(dialog.getByText('Dr. E2E Pérez')).toBeVisible({ timeout: 7000 });

  // 7) Click "Editar" en el modal y cambiar el motivo
  await dialog.getByRole('button', { name: /^Editar$/ }).click();
  await expect(dialog.getByRole('heading', { name: /Editar cita/i })).toBeVisible();
  await dialog.locator('label:has-text("Motivo") input').fill('Motivo editado por E2E');
  await dialog.getByRole('button', { name: /Guardar cambios/i }).click();

  // Volvemos al view mode con el motivo nuevo
  await expect(dialog.getByRole('heading', { name: /Detalle de cita/i })).toBeVisible({
    timeout: 10000,
  });
  await expect(dialog.getByText('Motivo editado por E2E')).toBeVisible();

  // 8) Click "Marcar completada"
  await dialog.getByRole('button', { name: /Marcar completada/i }).click();
  await expect(dialog.getByRole('heading', { name: /Completar cita/i })).toBeVisible();
  await dialog.locator('label:has-text("Diagnóstico") input').fill('Diagnóstico de prueba E2E');
  await dialog.getByRole('button', { name: /Marcar como completada/i }).click();

  // Volvemos al detalle, ahora status COMPLETED y diagnóstico visible
  await expect(dialog.getByText('Completada')).toBeVisible({ timeout: 10000 });
  await expect(dialog.getByText('Diagnóstico de prueba E2E')).toBeVisible();

  // Cerrar modal
  await dialog.locator('button[aria-label="Cerrar"]').click();
});

test('crear y editar recordatorio, marcar log desde /schedules', async ({ page }) => {
  // Login
  await page.goto(`${FRONTEND}/login`);
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_USER.email);
  await page
    .locator('input[type="password"], input[name="password"]')
    .first()
    .fill(TEST_USER.password);
  await page.getByRole('button', { name: /ingres|iniciar|entrar|login/i }).first().click();
  await page.waitForURL(/\/dashboard/);

  // 1) Ir a /reminders
  await page.goto(`${FRONTEND}/reminders`);
  await expect(page.getByRole('heading', { name: /recordatorios/i }).first()).toBeVisible();

  // 2) Empty state
  await expect(page.getByText(/Sin recordatorios todav/i)).toBeVisible({ timeout: 5000 });

  // 3) Crear nuevo recordatorio
  await page.getByRole('button', { name: /Nuevo recordatorio/i }).click();
  await expect(page.getByRole('heading', { name: /Nuevo recordatorio/i })).toBeVisible();

  // Tipo MEDICATION
  await page.locator('label:has-text("Tipo") select').selectOption('MEDICATION');
  await page.locator('label:has-text("Nombre") input').fill('Aspirina E2E');
  await page.locator('label:has-text("Dosis") input').first().fill('100mg');
  await page.locator('label:has-text("Repetir cada") input').fill('1');
  await page.locator('label:has-text("Unidad") select').selectOption('DAYS');

  await page.getByRole('button', { name: /Crear recordatorio/i }).click();

  // 4) Aparece en la lista
  await expect(page.getByText('Aspirina E2E')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Medicamento', { exact: true }).first()).toBeVisible();

  // 5) Editar
  await page.getByRole('button', { name: /^Editar$/ }).first().click();
  await expect(page.getByRole('heading', { name: /Editar recordatorio/i })).toBeVisible();
  await page.locator('label:has-text("Nombre") input').fill('Aspirina E2E (editado)');
  await page.getByRole('button', { name: /Guardar cambios/i }).click();
  await expect(page.getByText('Aspirina E2E (editado)')).toBeVisible({ timeout: 5000 });

  // 6) Desactivar
  await page.getByRole('button', { name: /Desactivar/i }).first().click();
  await expect(page.getByText('Inactivo')).toBeVisible({ timeout: 5000 });

  // 7) Activar de nuevo (cambia filtro a 'Inactivos' primero)
  await page.getByRole('button', { name: /Inactivos/i }).click();
  await expect(page.getByText('Aspirina E2E (editado)')).toBeVisible();
  await page.getByRole('button', { name: /Activar/i }).first().click();

  // 8) Visita /schedules — debería estar listada con botón "Marcar como hecho"
  await page.goto(`${FRONTEND}/schedules`);
  await expect(page.getByText('Aspirina E2E (editado)').first()).toBeVisible({ timeout: 10000 });
  // El botón "Marcar como hecho" debería estar (status pendiente)
  await expect(page.getByRole('button', { name: /Marcar como hecho/i }).first()).toBeVisible();
});

test('todo se renderiza desde backend, no de mocks', async ({ page, context }) => {
  // Login con la cuenta E2E (que es completamente nueva, sin mocks)
  await page.goto(`${FRONTEND}/login`);
  await page.locator('input[type="email"]').first().fill(TEST_USER.email);
  await page.locator('input[type="password"]').first().fill(TEST_USER.password);
  await page.getByRole('button', { name: /ingres|iniciar|entrar|login/i }).first().click();
  await page.waitForURL(/\/dashboard/);

  // Verificá que NO aparece data de Beatriz Molina (mock que estaba antes)
  await page.goto(`${FRONTEND}/dashboard`);
  expect(await page.getByText('Beatriz Molina').count()).toBe(0);

  await page.goto(`${FRONTEND}/professionals`);
  // El nuestro es Dr. E2E Pérez si el test anterior corrió, o ninguno si no.
  expect(await page.getByText('Dra. Paula Rojas').count()).toBe(0); // mock típico

  await page.goto(`${FRONTEND}/appointments`);
  expect(await page.getByText('Tomar medicacion').count()).toBe(0); // mock de schedules
});
