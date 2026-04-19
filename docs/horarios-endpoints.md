# Módulo Horarios (Schedules + Reminders) — Endpoints, contratos y guía de pruebas

## 1) Reglas de negocio implementadas

- La pantalla de horarios **no usa citas**, solo recordatorios.
- Vistas soportadas en overview:
  - `today`
  - `week`
  - `upcoming`
- El endpoint de schedules devuelve:
  - `nextEvent`
  - `events`
  - `daySummary`
  - `miniCalendarWeek`
- Tipos de recordatorio:
  - `GENERAL`
  - `MEDICATION`
  - `EXAM`
- Estado visible en eventos de horarios:
  - `pendiente`
  - `completada`
  - `cancelada` (cuando log queda en `SKIPPED`)
- Seguridad por rol/ownership:
  - `ADMIN`: acceso total.
  - `PATIENT`: solo su `patientId`.
  - `CAREGIVER`: solo pacientes vinculados en `patient_guardians` con `isActive = true` y `canManageAppointments = true`.

---

## 2) Endpoints

### GET `/api/v1/schedules/overview`

Obtiene el resumen de horarios para la vista seleccionada.

### Query params

- `view` (**obligatorio**): `today` | `week` | `upcoming`
- `patientId` (opcional, normalmente para ADMIN/CAREGIVER)

### Ejemplo

`GET /api/v1/schedules/overview?view=today`

### Response

```json
{
  "data": {
    "view": "today",
    "timezone": "America/Santiago",
    "range": {
      "from": "2026-04-19T04:00:00.000Z",
      "to": "2026-04-20T03:59:59.999Z"
    },
    "nextEvent": {
      "eventId": "96f019b1-46ee-4b91-b2ae-81da9ff97beb-2026-04-19T21:10:00.000Z",
      "reminderId": "96f019b1-46ee-4b91-b2ae-81da9ff97beb",
      "patientId": "c942e282-ae88-40e7-8cca-dd831c331125",
      "scheduledFor": "2026-04-19T21:10:00.000Z",
      "dayLabel": "dom, 19 abr",
      "time": "17:10",
      "title": "[DEMO] Caminar 30 minutos",
      "location": "Rutina personal",
      "type": "recordatorio",
      "status": "pendiente",
      "actionLabel": "Marcar completado",
      "notes": "Actividad física diaria"
    },
    "events": [
      {
        "eventId": "f285e97d-1cde-4904-a62d-0dec4a0b15fa-2026-04-19T18:40:00.000Z",
        "reminderId": "f285e97d-1cde-4904-a62d-0dec4a0b15fa",
        "patientId": "c942e282-ae88-40e7-8cca-dd831c331125",
        "scheduledFor": "2026-04-19T18:40:00.000Z",
        "dayLabel": "dom, 19 abr",
        "time": "14:40",
        "title": "[DEMO] Losartán",
        "location": "Rutina personal",
        "type": "medicamento",
        "status": "completada",
        "actionLabel": "Ver detalle",
        "dosageAmount": "1 comprimido",
        "notes": "Tomar después del desayuno"
      }
    ],
    "daySummary": {
      "total": 3,
      "pending": 2,
      "completed": 1,
      "cancelled": 0
    },
    "miniCalendarWeek": [
      {
        "dayLabel": "dom",
        "date": "2026-04-19",
        "eventsCount": 2,
        "isToday": true
      }
    ]
  }
}
```

---

### POST `/api/v1/reminders`

Crea recordatorio para horarios.

### Request body

```json
{
  "patientId": "c942e282-ae88-40e7-8cca-dd831c331125",
  "type": "MEDICATION",
  "name": "Losartán",
  "timeOfDay": "08:00",
  "dosageAmount": "1 comprimido",
  "frequencyEvery": 8,
  "frequencyUnit": "HOURS",
  "startsOn": "2026-04-20",
  "untilOn": "2026-05-20",
  "notes": "Tomar con comida"
}
```

### Response

```json
{
  "data": {
    "id": "0fee3e6a-ed6b-411a-b4f1-6e9551f4986d"
  }
}
```

---

### GET `/api/v1/reminders/:id`

Obtiene detalle de recordatorio.

### Response

```json
{
  "data": {
    "id": "8dc9a74a-708e-473b-bff8-43b3d996d90e",
    "patientId": "c942e282-ae88-40e7-8cca-dd831c331125",
    "type": "EXAM",
    "name": "[DEMO] Examen de sangre",
    "timeOfDay": "09:00",
    "frequencyEvery": 1,
    "frequencyUnit": "WEEKS",
    "startsOn": "2026-04-20T04:00:00.000Z",
    "notes": "Ayuno de 8 horas",
    "isActive": true,
    "createdAt": "2026-04-19T19:40:14.797Z",
    "updatedAt": "2026-04-19T19:40:14.797Z"
  }
}
```

---

### GET `/api/v1/reminders`

Lista recordatorios paginados.

### Query params

- `page` (default 1)
- `limit` (default 20, max 100)
- `patientId` (opcional)
- `type` (`GENERAL` | `MEDICATION` | `EXAM`)
- `isActive` (`true` | `false`)
- `search` (texto libre)

### Response

```json
{
  "data": [
    {
      "id": "8dc9a74a-708e-473b-bff8-43b3d996d90e",
      "patientId": "c942e282-ae88-40e7-8cca-dd831c331125",
      "type": "EXAM",
      "name": "[DEMO] Examen de sangre",
      "timeOfDay": "09:00",
      "dosageAmount": null,
      "frequencyEvery": 1,
      "frequencyUnit": "WEEKS",
      "startsOn": "2026-04-20T04:00:00.000Z",
      "untilOn": null,
      "notes": "Ayuno de 8 horas",
      "isActive": true,
      "createdAt": "2026-04-19T19:40:14.797Z",
      "updatedAt": "2026-04-19T19:40:14.797Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### PATCH `/api/v1/reminders/:id`

Actualiza recordatorio (parcial).

### Request body

```json
{
  "notes": "Beber agua - actualizado",
  "isActive": true
}
```

### Response

```json
{
  "data": {
    "id": "0fee3e6a-ed6b-411a-b4f1-6e9551f4986d"
  }
}
```

---

### PATCH `/api/v1/reminders/:id/activate`

Activa recordatorio.

### Response

```json
{
  "data": {
    "id": "0fee3e6a-ed6b-411a-b4f1-6e9551f4986d"
  }
}
```

---

### PATCH `/api/v1/reminders/:id/deactivate`

Desactiva recordatorio.

### Response

```json
{
  "data": {
    "id": "0fee3e6a-ed6b-411a-b4f1-6e9551f4986d"
  }
}
```

---

### PUT `/api/v1/reminders/:id/logs`

Marca cumplimiento de una ocurrencia.

### Request body

```json
{
  "scheduledFor": "2026-04-20T21:15:00.000Z",
  "status": "COMPLETED"
}
```

O para omitir:

```json
{
  "scheduledFor": "2026-04-20T21:15:00.000Z",
  "status": "SKIPPED",
  "skipReason": "Paciente en ayuno"
}
```

### Response

```json
{
  "data": {
    "id": "a9776651-1e81-4adf-9b5c-27953bc532ce"
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

### Paso 2 — Listar overview de horarios

- `GET /api/v1/schedules/overview?view=today`
- `GET /api/v1/schedules/overview?view=week`
- `GET /api/v1/schedules/overview?view=upcoming`

### Paso 3 — Crear recordatorio

- `POST /api/v1/reminders`
- Guardar `id`.

### Paso 4 — Verificar que aparezca en horarios

- Repetir `GET /api/v1/schedules/overview?view=today`
- Confirmar que exista en `events`.

### Paso 5 — Marcar cumplimiento

- `PUT /api/v1/reminders/:id/logs` con `COMPLETED`.
- Reconsultar overview y validar estado del evento.

### Paso 6 — Desactivar / activar

- `PATCH /api/v1/reminders/:id/deactivate`
- `PATCH /api/v1/reminders/:id/activate`

---

## 4) Errores esperables

- `401`: token faltante/inválido.
- `403`: rol sin permisos u ownership inválido.
- `404`: reminder inexistente.
- `400`: validación DTO (ej. `timeOfDay` inválido, `view` inválido, fechas inválidas).
- `500`: error interno no mapeado por filter global.
