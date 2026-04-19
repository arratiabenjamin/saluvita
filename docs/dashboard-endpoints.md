# Módulo Dashboard — Endpoints, contratos y guía de pruebas

## 1) Reglas de negocio implementadas

- Dashboard es un **resumen agregado** (no CRUD).
- La data sale de:
  - `appointments` (próximas y diagnósticos recientes desde COMPLETED)
  - `reminders` + `reminder_logs` (pendientes/completados/alertas)
- `quickSummary` calcula:
  - `upcomingAppointmentsCount`
  - `todayPendingRemindersCount`
  - `completedThisWeekCount`
  - `alertsCount`
  - `overallStatus` (`OK` | `ATTENTION`)
- `recentDiagnostics` se arma desde citas `COMPLETED` con `diagnosis` o `conclusion`.
- Seguridad por rol/ownership:
  - `ADMIN`: acceso total; puede consultar cualquier `patientId`.
  - `PATIENT`: solo su dashboard.
  - `CAREGIVER`: solo pacientes vinculados activos.

---

## 2) Endpoint

### GET `/api/v1/dashboard/overview`

Obtiene resumen del dashboard.

### Query params

- `patientId` (opcional, útil para ADMIN/CAREGIVER)

### Ejemplo

`GET /api/v1/dashboard/overview`

o

`GET /api/v1/dashboard/overview?patientId=c942e282-ae88-40e7-8cca-dd831c331125`

### Response

```json
{
  "data": {
    "quickSummary": {
      "upcomingAppointmentsCount": 1,
      "todayPendingRemindersCount": 2,
      "completedThisWeekCount": 2,
      "alertsCount": 0,
      "overallStatus": "OK"
    },
    "upcomingAppointments": [
      {
        "id": "eefbe3be-ddfb-4cf2-9f71-dfc2c37c6cde",
        "patientId": "c942e282-ae88-40e7-8cca-dd831c331125",
        "startsAt": "2026-04-19T21:40:14.779Z",
        "status": "PLANNED",
        "doctorName": "Dr. Juan Pérez",
        "specialty": "Medicina General",
        "facilityName": "Clínica Demo"
      }
    ],
    "recentDiagnostics": [
      {
        "id": "41ffe5c1-1f67-463d-a4b4-738064a4616c",
        "title": "Hipertensión controlada",
        "description": "Mantener tratamiento y control en 3 meses",
        "date": "2026-04-19T19:40:14.788Z",
        "doctorName": "Dra. María Soto",
        "specialty": "Medicina Interna"
      }
    ],
    "healthSummary": {
      "nextControlText": "2026-04-19T21:40:14.779Z · Medicina General",
      "observation": "Mantener tratamiento y control en 3 meses",
      "stable": true
    }
  }
}
```

---

## 3) Guía de pruebas manuales (Thunder Client / Postman)

### Paso 1 — Login

- Endpoint: `POST /api/v1/auth/login`
- Guardar `accessToken`.
- Header en siguientes requests:
  - `Authorization: Bearer <accessToken>`

### Paso 2 — Consultar dashboard base

- `GET /api/v1/dashboard/overview`
- Validar que existan `quickSummary`, `upcomingAppointments`, `recentDiagnostics`, `healthSummary`.

### Paso 3 — Cambiar datos que impactan dashboard

- Crear/editar reminder o marcar logs.
- Crear/completar/cancelar appointment.

### Paso 4 — Reconsultar dashboard

- `GET /api/v1/dashboard/overview`
- Verificar cambios en:
  - `todayPendingRemindersCount`
  - `alertsCount`
  - `upcomingAppointmentsCount`
  - `recentDiagnostics`

### Paso 5 — (ADMIN/CAREGIVER) dashboard por paciente

- `GET /api/v1/dashboard/overview?patientId=<uuid>`
- Validar que cambia el agregado al paciente consultado.

---

## 4) Errores esperables

- `401`: token faltante/inválido.
- `403`: rol sin permisos o `patientId` fuera de ownership.
- `400`: query inválida (`patientId` no UUID, etc.).
- `500`: error interno no mapeado por filter global.

> Nota: cuando no hay datos para el paciente, el endpoint responde `200` con estructuras vacías y contadores en `0`.
