# Especificación técnica backend MVP — Agenda Médica (v3 corregida, definitiva)

## 1) Resumen del MVP backend

Este documento define la versión **definitiva para contexto del sistema** en la etapa actual del proyecto.

### Enfoque real del MVP (actual)
- El sistema es **centrado en paciente/usuario final**.
- El **paciente se registra por sí mismo**.
- También pueden registrar pacientes:
  - usuarios **ADMIN**,
  - usuarios con pacientes a cargo (**CAREGIVER**).
- La información de citas y seguimiento clínico básico se carga por:
  - el propio paciente,
  - o su usuario a cargo.

### Alcance actual (no integración institucional todavía)
La integración con ministerio, hospitales y clínicas externas queda como fase futura. En este MVP:
- el usuario registra manualmente datos de médico/centro,
- no hay sincronización con sistemas externos.

### Stack y estilo
- NestJS + TypeScript
- Prisma 6 + PostgreSQL
- Monolito modular
- Clean Architecture / Hexagonal
- API REST versionada en `/v1`

---

## 2) Módulos del MVP

### 2.1 Auth
- **Qué hace:** registro, login, refresh, logout, perfil actual.
- **Qué resuelve:** identidad y sesión segura.

### 2.2 Users
- **Qué hace:** usuarios del sistema (PATIENT, CAREGIVER, ADMIN).
- **Qué resuelve:** control de acceso y trazabilidad.

### 2.3 Patients
- **Qué hace:** perfil de paciente y relación con usuario titular.
- **Qué resuelve:** datos personales del paciente y gestión de pacientes a cargo.

### 2.4 Appointments
- **Qué hace:** registro y seguimiento de citas médicas por paciente.
- **Qué resuelve:** agenda personal del paciente (sin agenda institucional integrada).

### 2.5 Medical Notes (dentro de Appointments en MVP)
- **Qué hace:** diagnóstico, conclusión y observaciones posteriores a la cita.
- **Qué resuelve:** historial clínico básico autogestionado.

### 2.6 Files (adjuntos de cita)
- **Qué hace:** anexar exámenes/archivos a una cita.
- **Qué resuelve:** respaldo documental clínico básico.

### Fuera del MVP actual (fase posterior)
- Integración con ministerio / hospitales / clínicas
- Catálogo institucional completo (Facilities/Professionals sincronizados)
- Notificaciones automáticas avanzadas
- Reportes avanzados
- Pagos

---

## 3) Modelo de datos completo del MVP

> Convenciones:
> - PK UUID en todas las tablas.
> - Fechas en `timestamptz`.
> - `deleted_at` en tablas que requieren baja lógica.
> - Todo acceso se controla por permisos + ownership (dueño o encargado).

### 3.1 `users`

**Descripción:** cuentas autenticables del sistema.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| email | varchar(160) | Sí | lowercase, unique activo |
| password_hash | varchar(255) | Sí | hash seguro |
| first_name | varchar(80) | Sí | not null |
| last_name | varchar(80) | Sí | not null |
| status | varchar(20) | Sí | `ACTIVE`/`INACTIVE`/`BLOCKED` |
| last_login_at | timestamptz | No |  |
| created_at | timestamptz | Sí | default now() |
| updated_at | timestamptz | Sí | auto update |
| deleted_at | timestamptz | No | soft delete |

**Índices:**
- `uq_users_email_active (email) UNIQUE WHERE deleted_at IS NULL`
- `idx_users_status (status)`

**Soft delete:** Sí.

---

### 3.2 `roles`

**Descripción:** catálogo de roles del MVP.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| code | varchar(40) | Sí | UNIQUE |
| name | varchar(80) | Sí |  |
| description | varchar(255) | No |  |
| created_at | timestamptz | Sí | default now() |

**Roles cerrados del MVP:**
- `PATIENT`
- `CAREGIVER`
- `ADMIN`

**Soft delete:** No.

---

### 3.3 `user_roles`

**Descripción:** asignación N:M users-roles.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| user_id | uuid | Sí | FK users(id) |
| role_id | uuid | Sí | FK roles(id) |
| created_at | timestamptz | Sí | default now() |

**PK compuesta:** `(user_id, role_id)`  
**Soft delete:** No.

---

### 3.4 `patients`

**Descripción:** perfil clínico/administrativo de paciente.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| user_id | uuid | No | FK users(id), UNIQUE opcional |
| document_type | varchar(20) | Sí | `RUT`/`DNI`/`PASSPORT`/`OTHER` |
| document_number | varchar(40) | Sí | normalizado |
| first_name | varchar(80) | Sí | not null |
| last_name | varchar(80) | Sí | not null |
| birth_date | date | No | no futura |
| phone | varchar(30) | No | E.164 sugerido |
| address_line | varchar(255) | No | dirección actual del paciente |
| emergency_contact_name | varchar(120) | No |  |
| emergency_contact_phone | varchar(30) | No |  |
| notes | text | No | observaciones generales |
| is_active | boolean | Sí | default true |
| created_by_user_id | uuid | Sí | FK users(id) |
| updated_by_user_id | uuid | No | FK users(id) |
| created_at | timestamptz | Sí | default now() |
| updated_at | timestamptz | Sí | auto update |
| deleted_at | timestamptz | No | soft delete |

**Índices:**
- `uq_patients_document_active (document_type, document_number) UNIQUE WHERE deleted_at IS NULL`
- `uq_patients_user_id_active (user_id) UNIQUE WHERE user_id IS NOT NULL AND deleted_at IS NULL`
- `idx_patients_name (last_name, first_name)`

**Soft delete:** Sí.

**Regla clave:**
- Si el paciente se registró por sí mismo, `patients.user_id = users.id`.
- Si fue registrado por tercero (admin/cuidador), `user_id` puede ser null inicialmente.

---

### 3.5 `patient_guardians`

**Descripción:** relación entre usuario encargado y paciente a cargo.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| patient_id | uuid | Sí | FK patients(id) |
| guardian_user_id | uuid | Sí | FK users(id) |
| relationship | varchar(40) | No | ej. `MOTHER`, `FATHER`, `TUTOR`, `SPOUSE`, `OTHER` |
| can_edit_profile | boolean | Sí | default true |
| can_manage_appointments | boolean | Sí | default true |
| is_active | boolean | Sí | default true |
| created_by_user_id | uuid | Sí | FK users(id) |
| created_at | timestamptz | Sí | default now() |
| updated_at | timestamptz | Sí | auto update |

**Índices:**
- `uq_patient_guardian_active (patient_id, guardian_user_id) UNIQUE WHERE is_active = true`
- `idx_guardian_user (guardian_user_id)`

**Soft delete:** No (se usa `is_active`).

---

### 3.6 `appointments`

**Descripción:** citas registradas por paciente o encargado.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| patient_id | uuid | Sí | FK patients(id) |
| recorded_by_user_id | uuid | Sí | FK users(id) |
| starts_at | timestamptz | Sí | fecha/hora de la cita |
| ends_at | timestamptz | No | si se conoce |
| status | varchar(30) | Sí | ver sección 8 |
| reason | varchar(255) | No | motivo de consulta |
| facility_name | varchar(160) | No | clínica/hospital/centro (texto libre) |
| facility_address | varchar(255) | No | dirección del centro |
| doctor_name | varchar(120) | No | nombre profesional (texto libre) |
| specialty | varchar(120) | No | especialidad |
| was_attended | boolean | No | null hasta cierre |
| diagnosis | text | No | cargado por paciente/encargado |
| conclusion | text | No | cargado por paciente/encargado |
| follow_up_notes | text | No | observaciones de seguimiento |
| cancelled_reason | varchar(255) | No | requerido si status=CANCELLED |
| created_at | timestamptz | Sí | default now() |
| updated_at | timestamptz | Sí | auto update |

**Índices:**
- `idx_appointments_patient_start (patient_id, starts_at DESC)`
- `idx_appointments_status_start (status, starts_at)`
- `idx_appointments_recorded_by (recorded_by_user_id)`

**Soft delete:** No (historial completo por estado).

---

### 3.7 `appointment_attachments`

**Descripción:** archivos/exámenes adjuntos a una cita.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| appointment_id | uuid | Sí | FK appointments(id) |
| uploaded_by_user_id | uuid | Sí | FK users(id) |
| file_name | varchar(255) | Sí |  |
| file_url | text | Sí | referencia storage |
| mime_type | varchar(100) | Sí | ej. `application/pdf`, `image/jpeg` |
| file_size_bytes | bigint | No |  |
| created_at | timestamptz | Sí | default now() |

**Índices:**
- `idx_attachments_appointment (appointment_id, created_at DESC)`

**Soft delete:** No (opcional futuro con `deleted_at`).

---

### 3.8 `refresh_tokens`

**Descripción:** sesiones de refresh token.

| Campo | Tipo | Req | Restricciones |
|---|---|---:|---|
| id | uuid | Sí | PK |
| user_id | uuid | Sí | FK users(id) |
| token_hash | varchar(255) | Sí | no guardar token plano |
| expires_at | timestamptz | Sí |  |
| revoked_at | timestamptz | No | null = activo |
| user_agent | varchar(255) | No |  |
| ip_address | varchar(64) | No |  |
| created_at | timestamptz | Sí | default now() |

**Soft delete:** No.

---

## 4) Relaciones entre módulos y entidades

1. **User ↔ Patient**
   - 1:1 opcional vía `patients.user_id`.
   - Un paciente puede existir sin cuenta de usuario propia inicialmente.

2. **User (guardian) ↔ Patient**
   - N:M controlada por `patient_guardians`.
   - El encargado puede gestionar perfil y citas según flags de permiso.

3. **Patient ↔ Appointment**
   - `patients (1) -> (N) appointments`.
   - La cita pertenece siempre a un paciente.

4. **Appointment ↔ Attachments**
   - `appointments (1) -> (N) appointment_attachments`.

5. **User ↔ Roles**
   - N:M vía `user_roles`.
   - Roles de acceso del MVP: `PATIENT`, `CAREGIVER`, `ADMIN`.

---

## 5) Endpoints del MVP (consistentes y cerrados)

### 5.1 Auth

#### POST `/v1/auth/register`
- Auth: No
- Descripción: registro de usuario paciente (self-service)
- Body: `email`, `password`, `firstName`, `lastName`, `documentType`, `documentNumber`, `birthDate?`, `phone?`
- Resultado: crea `users` + rol `PATIENT` + `patients` vinculado por `user_id`
- 201 / 400 / 409

#### POST `/v1/auth/login`
- Auth: No
- Body: `email`, `password`
- 200 / 400 / 401 / 423

#### POST `/v1/auth/refresh`
- Auth: No (refresh token)
- Body: `refreshToken`
- 200 / 400 / 401

#### POST `/v1/auth/logout`
- Auth: Sí
- Body: `refreshToken`
- 200 / 400 / 401

#### GET `/v1/auth/me`
- Auth: Sí
- 200 / 401

---

### 5.2 Patients

#### GET `/v1/patients/me`
- Auth: Sí
- Roles: `PATIENT`
- 200 / 401 / 404

#### PATCH `/v1/patients/me`
- Auth: Sí
- Roles: `PATIENT`
- Body parcial editable: `phone?`, `addressLine?`, `emergencyContactName?`, `emergencyContactPhone?`, `notes?`
- 200 / 400 / 401 / 404

#### POST `/v1/patients`
- Auth: Sí
- Roles: `ADMIN`, `CAREGIVER`
- Descripción: registrar paciente por tercero
- Body: `documentType`, `documentNumber`, `firstName`, `lastName`, `birthDate?`, `phone?`, `addressLine?`, `notes?`
- 201 / 400 / 401 / 403 / 409

#### GET `/v1/patients/:id`
- Auth: Sí
- Roles: `ADMIN` o `CAREGIVER` con vínculo activo o `PATIENT` dueño
- 200 / 401 / 403 / 404

#### PATCH `/v1/patients/:id`
- Auth: Sí
- Roles: `ADMIN` o `CAREGIVER` con permiso `can_edit_profile=true`
- Body parcial editable
- 200 / 400 / 401 / 403 / 404 / 409

#### GET `/v1/patients`
- Auth: Sí
- Roles: `ADMIN`, `CAREGIVER`
- Query: `page`, `limit`, `search`, `isActive`
- 200 / 400 / 401 / 403

---

### 5.3 Patient guardians

#### POST `/v1/patients/:id/guardians`
- Auth: Sí
- Roles: `ADMIN`
- Body: `guardianUserId`, `relationship?`, `canEditProfile?`, `canManageAppointments?`
- 201 / 400 / 401 / 403 / 404 / 409

#### GET `/v1/patients/:id/guardians`
- Auth: Sí
- Roles: `ADMIN`, `CAREGIVER` vinculado, `PATIENT` dueño
- 200 / 401 / 403 / 404

#### PATCH `/v1/patient-guardians/:id`
- Auth: Sí
- Roles: `ADMIN`
- Body: `isActive?`, `canEditProfile?`, `canManageAppointments?`, `relationship?`
- 200 / 400 / 401 / 403 / 404

---

### 5.4 Appointments

#### POST `/v1/appointments`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN`
- Body:
  - `patientId`
  - `startsAt`
  - `reason?`
  - `facilityName?`, `facilityAddress?`, `doctorName?`, `specialty?`
- Reglas:
  - `PATIENT` solo puede crear para sí mismo.
  - `CAREGIVER` solo para pacientes a cargo con permiso.
- 201 / 400 / 401 / 403 / 404

#### GET `/v1/appointments/:id`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- 200 / 401 / 403 / 404

#### GET `/v1/appointments`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN`
- Query: `patientId?`, `from?`, `to?`, `status?`, `page`, `limit`
- 200 / 400 / 401 / 403

#### PATCH `/v1/appointments/:id`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- Body parcial editable: `startsAt?`, `reason?`, `facilityName?`, `facilityAddress?`, `doctorName?`, `specialty?`
- 200 / 400 / 401 / 403 / 404

#### PATCH `/v1/appointments/:id/complete`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- Body: `wasAttended`, `diagnosis?`, `conclusion?`, `followUpNotes?`, `endsAt?`
- 200 / 400 / 401 / 403 / 404 / 409

#### PATCH `/v1/appointments/:id/cancel`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- Body: `{ "cancelledReason": "..." }`
- 200 / 400 / 401 / 403 / 404 / 409

---

### 5.5 Appointment attachments

#### POST `/v1/appointments/:id/attachments`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- Body: `fileName`, `fileUrl`, `mimeType`, `fileSizeBytes?`
- 201 / 400 / 401 / 403 / 404

#### GET `/v1/appointments/:id/attachments`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- 200 / 401 / 403 / 404

#### DELETE `/v1/appointments/:id/attachments/:attachmentId`
- Auth: Sí
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN` con control de ownership
- 204 / 401 / 403 / 404

---

### 5.6 Users (administración)

#### POST `/v1/users`
- Auth: Sí
- Roles: `ADMIN`
- Descripción: crear usuario interno (admin o caregiver)
- Body: `email`, `password`, `firstName`, `lastName`, `roles[]`
- 201 / 400 / 401 / 403 / 409

#### GET `/v1/users/:id`
- Auth: Sí
- Roles: `ADMIN`
- 200 / 401 / 403 / 404

#### GET `/v1/users`
- Auth: Sí
- Roles: `ADMIN`
- Query: `page`, `limit`, `status?`, `role?`
- 200 / 400 / 401 / 403

#### PATCH `/v1/users/:id`
- Auth: Sí
- Roles: `ADMIN`
- Body parcial editable
- 200 / 400 / 401 / 403 / 404 / 409

---

## 6) Payloads exactos (alineados al modelo)

### 6.1 Registro paciente (self-register)

**Request**
```json
{
  "email": "maria.gonzalez@example.com",
  "password": "StrongPass!2026",
  "firstName": "María",
  "lastName": "González",
  "documentType": "RUT",
  "documentNumber": "18.765.432-1",
  "birthDate": "1992-04-10",
  "phone": "+56998765432"
}
```

**Response 201**
```json
{
  "data": {
    "user": {
      "id": "usr-001",
      "email": "maria.gonzalez@example.com",
      "firstName": "María",
      "lastName": "González",
      "status": "ACTIVE",
      "roles": ["PATIENT"]
    },
    "patient": {
      "id": "pat-001",
      "userId": "usr-001",
      "documentType": "RUT",
      "documentNumber": "18765432-1",
      "firstName": "María",
      "lastName": "González",
      "birthDate": "1992-04-10",
      "phone": "+56998765432",
      "isActive": true
    }
  }
}
```

### 6.2 Crear cita por paciente/encargado

**Request**
```json
{
  "patientId": "pat-001",
  "startsAt": "2026-04-22T14:00:00.000Z",
  "reason": "Control anual",
  "facilityName": "Clínica Los Alerces",
  "facilityAddress": "Av. Central 1234, Santiago",
  "doctorName": "Dra. Paula Rojas",
  "specialty": "Medicina general"
}
```

**Response 201**
```json
{
  "data": {
    "id": "appt-001",
    "patientId": "pat-001",
    "recordedByUserId": "usr-001",
    "startsAt": "2026-04-22T14:00:00.000Z",
    "endsAt": null,
    "status": "PLANNED",
    "reason": "Control anual",
    "facilityName": "Clínica Los Alerces",
    "facilityAddress": "Av. Central 1234, Santiago",
    "doctorName": "Dra. Paula Rojas",
    "specialty": "Medicina general",
    "wasAttended": null,
    "diagnosis": null,
    "conclusion": null,
    "followUpNotes": null,
    "createdAt": "2026-04-14T12:00:00.000Z",
    "updatedAt": "2026-04-14T12:00:00.000Z"
  }
}
```

### 6.3 Cierre de cita

**Request**
```json
{
  "wasAttended": true,
  "diagnosis": "Rinitis alérgica estacional",
  "conclusion": "Continuar antihistamínico por 30 días",
  "followUpNotes": "Control en 2 meses",
  "endsAt": "2026-04-22T14:35:00.000Z"
}
```

**Response 200**
```json
{
  "data": {
    "id": "appt-001",
    "status": "COMPLETED",
    "wasAttended": true,
    "diagnosis": "Rinitis alérgica estacional",
    "conclusion": "Continuar antihistamínico por 30 días",
    "followUpNotes": "Control en 2 meses",
    "endsAt": "2026-04-22T14:35:00.000Z",
    "updatedAt": "2026-04-22T15:00:00.000Z"
  }
}
```

### 6.4 Error de autorización por ownership

```json
{
  "statusCode": 403,
  "code": "PATIENT_ACCESS_FORBIDDEN",
  "message": "You do not have permissions for this patient.",
  "details": {
    "patientId": "pat-999"
  },
  "timestamp": "2026-04-14T12:30:00.000Z",
  "path": "/v1/appointments"
}
```

---

## 7) Validaciones y reglas funcionales

1. Registro público crea usuario con rol `PATIENT` + perfil `patients` vinculado.
2. Documento de paciente único global (`document_type + document_number`) entre pacientes activos.
3. `PATIENT` solo puede leer/editar su perfil y sus citas.
4. `CAREGIVER` solo puede operar pacientes vinculados activos en `patient_guardians`.
5. `ADMIN` puede crear usuarios internos y gestionar cualquier paciente/cita.
6. `appointments.patient_id` es obligatorio y debe existir activo.
7. `cancelledReason` obligatorio si `status = CANCELLED`.
8. `wasAttended`, `diagnosis`, `conclusion` se cargan en cierre de cita.
9. Adjuntos de cita solo permitidos para usuarios con acceso al paciente de la cita.
10. Soft delete:
    - `users`, `patients`: excluidos por defecto en búsquedas/listados y validaciones.
    - `roles`, `user_roles`, `appointments`, `refresh_tokens`, `appointment_attachments`: sin soft delete en MVP.

---

## 8) Estados del sistema (simplificados para MVP)

### 8.1 AppointmentStatus
- `PLANNED`
- `COMPLETED`
- `CANCELLED`

### 8.2 Transiciones válidas
- `PLANNED -> COMPLETED`
- `PLANNED -> CANCELLED`
- `COMPLETED` y `CANCELLED` son terminales.

### 8.3 UserStatus
- `ACTIVE`
- `INACTIVE`
- `BLOCKED`

---

## 9) Supuestos y simplificaciones del MVP

- Sin integración externa con ministerio, hospitales o clínicas.
- Sin sincronización automática de médicos/centros.
- Datos de médico y centro se registran como texto libre en cada cita.
- Sin reglas de disponibilidad profesional institucional (`schedules` institucional queda fase futura).
- Sin pagos.
- Sin reportes avanzados.
- Sin notificaciones automáticas avanzadas (puede iniciar en fase posterior).

---

## 10) Recomendaciones para frontend

1. Tratar como enums:
   - `roles`: `PATIENT`, `CAREGIVER`, `ADMIN`
   - `appointmentStatus`: `PLANNED`, `COMPLETED`, `CANCELLED`
   - `userStatus`
   - `documentType`
2. Cachear:
   - `/v1/auth/me`
   - `/v1/patients/me`
   - listados paginados de citas por paciente
3. Flujos sugeridos de desarrollo:
   1) Auth (register/login/refresh/me)
   2) Perfil paciente propio
   3) Registro de citas
   4) Cierre de cita + diagnóstico/conclusión
   5) Adjuntos de exámenes
   6) Gestión de pacientes a cargo (caregiver/admin)
4. Todas las pantallas deben contemplar autorización por ownership (paciente dueño o encargado vinculado).

---

## Estado del documento

Este archivo queda como **documento definitivo de contexto funcional y técnico** para esta etapa del sistema.
