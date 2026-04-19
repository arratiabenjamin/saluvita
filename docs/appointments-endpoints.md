# Módulo Appointments — Endpoints, contratos y guía de pruebas

> Base URL: `/api/v1/appointments`
> Auth: Bearer token obligatorio en todos los endpoints.
> Swagger: `/api/docs` (tag `Appointments`).

## 1) Reglas de negocio implementadas

- Estados del MVP:
  - `PLANNED`
  - `COMPLETED`
  - `CANCELLED`
- Transiciones válidas:
  - `PLANNED -> COMPLETED`
  - `PLANNED -> CANCELLED`
- Estados terminales:
  - `COMPLETED`, `CANCELLED` (no se pueden editar luego).
- `cancelledReason` es obligatorio para cancelar.
- Seguridad por rol/ownership:
  - `ADMIN`: acceso total.
  - `PATIENT`: solo citas de su `patientId`.
  - `CAREGIVER`: solo pacientes vinculados en `patient_guardians` con `canManageAppointments = true` e `isActive = true`.

---

## 2) Endpoints

### POST `/api/v1/appointments`
Crea una cita.

#### Request body
```json
{
  "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
  "startsAt": "2026-05-20T14:30:00.000Z",
  "endsAt": "2026-05-20T15:00:00.000Z",
  "reason": "Control general",
  "facilityName": "Clínica Santa María",
  "facilityAddress": "Av. Santa María 0500, Santiago",
  "doctorName": "Dra. Paula Rojas",
  "specialty": "Medicina General"
}
```

#### Response
```json
{
  "data": {
    "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a"
  }
}
```

---

### GET `/api/v1/appointments/:id`
Obtiene el detalle de una cita.

#### Response
```json
{
  "data": {
    "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a",
    "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
    "recordedByUserId": "36bb7863-545a-4024-abdb-b9bb812932db",
    "startsAt": "2026-05-20T14:30:00.000Z",
    "endsAt": "2026-05-20T15:00:00.000Z",
    "status": "PLANNED",
    "reason": "Control general",
    "facilityName": "Clínica Santa María",
    "facilityAddress": "Av. Santa María 0500, Santiago",
    "doctorName": "Dra. Paula Rojas",
    "specialty": "Medicina General",
    "wasAttended": null,
    "diagnosis": null,
    "conclusion": null,
    "followUpNotes": null,
    "cancelledReason": null,
    "createdAt": "2026-04-18T13:00:00.000Z",
    "updatedAt": "2026-04-18T13:00:00.000Z"
  }
}
```

---

### GET `/api/v1/appointments`
Lista citas paginadas.

#### Query params
- `page` (default 1)
- `limit` (default 20, max 100)
- `patientId` (opcional)
- `status` (`PLANNED` | `COMPLETED` | `CANCELLED`)
- `from` (ISO date)
- `to` (ISO date)
- `search` (texto libre en reason/facility/doctor/specialty)

#### Response
```json
{
  "data": [
    {
      "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a",
      "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
      "startsAt": "2026-05-20T14:30:00.000Z",
      "endsAt": "2026-05-20T15:00:00.000Z",
      "status": "PLANNED",
      "reason": "Control general",
      "facilityName": "Clínica Santa María",
      "facilityAddress": "Av. Santa María 0500, Santiago",
      "doctorName": "Dra. Paula Rojas",
      "specialty": "Medicina General",
      "wasAttended": null,
      "diagnosis": null,
      "conclusion": null,
      "followUpNotes": null,
      "cancelledReason": null,
      "createdAt": "2026-04-18T13:00:00.000Z",
      "updatedAt": "2026-04-18T13:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### PATCH `/api/v1/appointments/:id`
Actualiza una cita en estado `PLANNED`.

#### Request body
```json
{
  "startsAt": "2026-05-21T11:00:00.000Z",
  "reason": "Reagendada por disponibilidad",
  "doctorName": "Dr. Juan Pérez"
}
```

#### Response
```json
{
  "data": {
    "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a"
  }
}
```

---

### PATCH `/api/v1/appointments/:id/complete`
Marca una cita como completada.

#### Request body
```json
{
  "wasAttended": true,
  "diagnosis": "Migraña",
  "conclusion": "Tratamiento farmacológico por 7 días",
  "followUpNotes": "Control en 2 semanas"
}
```

#### Response
```json
{
  "data": {
    "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a"
  }
}
```

---

### PATCH `/api/v1/appointments/:id/cancel`
Cancela una cita.

#### Request body
```json
{
  "cancelledReason": "No pude asistir por urgencia familiar"
}
```

#### Response
```json
{
  "data": {
    "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a"
  }
}
```

---

## 3) Guía de pruebas manuales (Thunder Client / Postman)

## Paso 1 — Login
- Endpoint: `POST /api/v1/auth/login`
- Guardar `accessToken`.
- Header en siguientes requests:
  - `Authorization: Bearer <accessToken>`

## Paso 2 — Crear cita
- `POST /api/v1/appointments`
- Guardar `id` de cita creada.

## Paso 3 — Obtener por id
- `GET /api/v1/appointments/:id`
- Verificar `status = PLANNED`.

## Paso 4 — Listar
- `GET /api/v1/appointments?page=1&limit=20`
- Verificar que aparezca la cita.

## Paso 5 — Actualizar cita
- `PATCH /api/v1/appointments/:id`
- Cambiar `reason` o `startsAt`.

## Paso 6 — Completar cita
- `PATCH /api/v1/appointments/:id/complete`
- Verificar luego que `status = COMPLETED`.

## Paso 7 — Validar regla de estado terminal
- Intentar `PATCH /api/v1/appointments/:id` después de completar.
- Debe fallar por transición inválida.

## Paso 8 — Flujo de cancelación
- Crear nueva cita.
- `PATCH /api/v1/appointments/:id/cancel` con motivo.
- Verificar `status = CANCELLED` y `cancelledReason`.

---

## 4) Errores esperables

- `401`: token faltante/inválido.
- `403`: rol sin permisos o ownership inválido.
- `404`: cita inexistente.
- `400`: validación DTO (ej. formato fecha inválido).
- `500`: errores de dominio no mapeados por exception filter global.

> Recomendación siguiente: agregar un `DomainExceptionFilter` para mapear invariantes a 409/422.
