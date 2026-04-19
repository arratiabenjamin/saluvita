# Appointment Module — Árbol de archivos propuesto (MVP)

```text
backend/src/modules/appointments/
├── appointments.module.ts
├── domain/
│   ├── entities/
│   │   └── appointment.entity.ts
│   ├── enums/
│   │   └── appointment-status.enum.ts
│   └── errors/
│       └── appointment-domain.errors.ts
├── application/
│   ├── commands/
│   │   ├── create-appointment.command.ts
│   │   └── update-appointment.command.ts
│   ├── queries/
│   │   └── list-appointments.query.ts
│   ├── ports/
│   │   ├── appointment.repository.ts
│   │   └── appointment-query.service.ts
│   └── use-cases/
│       ├── create-appointment.use-case.ts
│       ├── get-appointment-by-id.use-case.ts
│       ├── list-appointments.use-case.ts
│       ├── update-appointment.use-case.ts
│       ├── complete-appointment.use-case.ts
│       └── cancel-appointment.use-case.ts
├── infrastructure/
│   ├── mappers/
│   │   └── appointment-prisma.mapper.ts
│   ├── repositories/
│   │   └── prisma-appointment.repository.ts
│   └── queries/
│       └── prisma-appointment.query-service.ts
└── presentation/
    ├── controllers/
    │   ├── create-appointment.controller.ts
    │   ├── get-appointment-by-id.controller.ts
    │   ├── list-appointments.controller.ts
    │   ├── update-appointment.controller.ts
    │   ├── complete-appointment.controller.ts
    │   └── cancel-appointment.controller.ts
    └── dto/
        ├── create-appointment.dto.ts
        ├── update-appointment.dto.ts
        ├── list-appointments.dto.ts
        └── appointment-response.dto.ts
```

```text
Orden recomendado para implementar Appointments (sin professionals):

  1. Domain
      - appointment.entity.ts *
      - appointment-status.enum.ts (PLANNED, COMPLETED, CANCELLED) *
      - errores de dominio (transiciones inválidas, fechas inválidas) *
  2. Application
      - ports/appointment.repository.ts *
      - ports/appointment-query.service.ts *
      - commands/queries:
          - create-appointment.command.ts
          - update-appointment.command.ts
          - list-appointments.query.ts
      - use-cases:
          - create
          - get-by-id
          - list
          - update
          - complete
          - cancel
  3. Presentation (API)
      - DTOs:
          - create-appointment.dto.ts
          - appointment-response.dto.ts
      - Controllers separados por acción (como venís haciendo):
          - create-appointment.controller.ts
          - get-appointment-by-id.controller.ts
          - list-appointments.controller.ts
          - update-appointment.controller.ts
          - complete-appointment.controller.ts
          - cancel-appointment.controller.ts
  4. Infrastructure
      - appointment-prisma.mapper.ts
      - prisma-appointment.repository.ts
      - prisma-appointment.query-service.ts
  5. Module wiring
      - appointments.module.ts con providers/tokens/controllers
  6. Reglas primero, código después
      - patientId obligatorio y activo
      - doctorName/specialty opcionales (texto libre)
      - COMPLETED y CANCELLED no vuelven a PLANNED
      - CANCELLED requiere motivo
  7. Pruebas manuales (Thunder Client)
      - crear cita
      - validar errores de transición
```

## Datos del Appointment (MVP)

### Campos persistidos en DB

| Campo | Tipo | Requerido | Notas |
|---|---|---:|---|
| `id` | `uuid` | Sí (auto) | PK |
| `patientId` | `uuid` | Sí | FK a `patients.id` |
| `recordedByUserId` | `uuid` | Sí (auto) | usuario autenticado que crea/edita |
| `startsAt` | `timestamptz` | Sí | fecha/hora inicio cita |
| `endsAt` | `timestamptz` | No | opcional en MVP |
| `status` | `AppointmentStatus` | Sí (auto) | `PLANNED` por defecto |
| `reason` | `text` | No | motivo de consulta |
| `facilityName` | `varchar(160)` | No | texto libre |
| `facilityAddress` | `varchar(255)` | No | texto libre |
| `doctorName` | `varchar(120)` | No | texto libre |
| `specialty` | `varchar(120)` | No | texto libre |
| `wasAttended` | `boolean` | No | típico al completar |
| `diagnosis` | `text` | No | posterior a cita |
| `conclusion` | `text` | No | posterior a cita |
| `followUpNotes` | `text` | No | seguimiento |
| `cancelledReason` | `text` | No | obligatorio al cancelar |
| `createdAt` | `timestamptz` | Sí (auto) | auditoría |
| `updatedAt` | `timestamptz` | Sí (auto) | auditoría |

### Request body esperado

#### `POST /v1/appointments`

```json
{
  "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
  "startsAt": "2026-05-20T14:30:00.000Z",
  "reason": "Control general",
  "facilityName": "Clínica Santa María",
  "facilityAddress": "Av. Santa María 0500, Santiago",
  "doctorName": "Dra. Paula Rojas",
  "specialty": "Medicina General"
}
```

#### `PATCH /v1/appointments/:id`

```json
{
  "startsAt": "2026-05-21T11:00:00.000Z",
  "reason": "Reagendada por disponibilidad",
  "doctorName": "Dr. Juan Pérez"
}
```

#### `PATCH /v1/appointments/:id/complete`

```json
{
  "wasAttended": true,
  "diagnosis": "Migraña",
  "conclusion": "Tratamiento farmacológico por 7 días",
  "followUpNotes": "Control en 2 semanas"
}
```

#### `PATCH /v1/appointments/:id/cancel`

```json
{
  "cancelledReason": "No pude asistir por urgencia familiar"
}
```

### Response body sugerido

```json
{
  "data": {
    "id": "8f32d2d2-7e9b-4f3b-b31a-8c9e2bb2fd5a",
    "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
    "startsAt": "2026-05-20T14:30:00.000Z",
    "endsAt": null,
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
    "createdAt": "2026-04-15T19:00:00.000Z",
    "updatedAt": "2026-04-15T19:00:00.000Z"
  }
}
```

## Reglas funcionales mínimas

- `patientId` debe existir y estar activo.
- `startsAt` es obligatorio al crear.
- `doctorName` y `specialty` son opcionales (texto libre).
- Transiciones válidas:
  - `PLANNED -> COMPLETED`
  - `PLANNED -> CANCELLED`
  - `COMPLETED` y `CANCELLED` son terminales.
- Para cancelar, `cancelledReason` obligatorio.

## Notas MVP

- Sin módulo `professionals` por ahora.
- `doctorName` y `specialty` quedan como texto libre opcional en `appointments`.
- Estados: `PLANNED`, `COMPLETED`, `CANCELLED`.
- Endpoints objetivo:
  - `POST /v1/appointments`
  - `GET /v1/appointments/:id`
  - `GET /v1/appointments`
  - `PATCH /v1/appointments/:id`
  - `PATCH /v1/appointments/:id/complete`
  - `PATCH /v1/appointments/:id/cancel`
