# Módulo Caregiving — Endpoints, contratos y guía de pruebas

> Base URL: `/api/v1`
> Auth: Bearer token obligatorio en todos los endpoints.
> Swagger tags: `Caregiving - Dependents`, `Caregiving - Guardians`, `Caregiving - Invitations`.

## 1) Reglas de negocio implementadas

- Un usuario puede ser **guardian** de otros pacientes vía el modelo `PatientGuardian` (ya existente).
- Dos flujos de vinculación:
  1. **Crear dependiente con cuenta propia**: el usuario responsable crea un nuevo `User` (email + password) y su `Patient` asociado; el vínculo `PatientGuardian` nace **activo** con `acceptedAt = createdAt`.
  2. **Invitar a un usuario existente**: se crea `PatientGuardian` con `isActive = false`, `invitationToken` único y `invitationExpiresAt = now + GUARDIAN_INVITATION_TTL_DAYS`. El paciente target acepta o rechaza.
- Permisos granulares por vínculo:
  - `canEditProfile`: controla gestión del perfil del paciente y también permisos de **historial clínico** (ver módulo Medical History).
  - `canManageAppointments`: controla gestión de citas (ya usado por el ACL de Appointments).
  - `isActive`: vínculo habilitado o revocado.
- Estados del vínculo (derivados):
  - `PENDING`: `isActive=false` + `invitationToken` no nulo y no rechazado/revocado.
  - `ACTIVE`: `isActive=true` con `acceptedAt` establecido.
  - `REJECTED`: `isActive=false`, `rejectedAt` establecido.
  - `REVOKED`: `isActive=false`, `revokedAt` establecido.
- Al crear dependiente o aceptar invitación, el guardian recibe rol `CAREGIVER` automáticamente si no lo tiene.

---

## 2) Endpoints

### 2.1 Dependientes

#### POST `/api/v1/me/dependents`
Crea un paciente dependiente con cuenta propia (`User` + `Patient` + `PatientGuardian`) en una transacción.

Roles: `ADMIN`, `CAREGIVER`, `PATIENT`.

Request body:
```json
{
  "email": "hijo1@demo.com",
  "password": "Secret123",
  "firstName": "Tomas",
  "lastName": "Arratia",
  "documentType": "RUT",
  "documentNumber": "22222222-2",
  "birthDate": "2015-07-12",
  "phone": "+56911111111",
  "relationship": "son",
  "canEditProfile": true,
  "canManageAppointments": true
}
```

Response:
```json
{
  "data": {
    "userId": "5d5e3b0e-...",
    "patientId": "64f3ac20-...",
    "guardianLinkId": "aa11bb22-..."
  }
}
```

Errores:
- `409 Conflict` — email en uso o documento existente.
- `400 Bad Request` — validación de DTO.

#### GET `/api/v1/me/dependents`
Lista pacientes dependientes activos (yo soy guardian).

Response:
```json
{
  "data": [
    {
      "guardianLinkId": "...",
      "patientId": "...",
      "patientFirstName": "Tomas",
      "patientLastName": "Arratia",
      "patientDocumentType": "RUT",
      "patientDocumentNumber": "22222222-2",
      "patientEmail": "hijo1@demo.com",
      "relationship": "son",
      "canEditProfile": true,
      "canManageAppointments": true,
      "acceptedAt": "2026-04-24T14:00:00.000Z",
      "createdAt": "2026-04-24T14:00:00.000Z"
    }
  ]
}
```

### 2.2 Invitaciones

#### POST `/api/v1/me/guardian-invitations`
Invita a un paciente existente para cuidarlo. El target debe tener `patientProfile`.

Roles: `ADMIN`, `CAREGIVER`, `PATIENT`.

Request body:
```json
{
  "targetPatientEmail": "mama@demo.com",
  "relationship": "daughter",
  "canEditProfile": true,
  "canManageAppointments": true
}
```

Response:
```json
{
  "data": {
    "guardianLinkId": "...",
    "invitationToken": "abc123...",
    "invitationExpiresAt": "2026-05-01T14:00:00.000Z",
    "targetPatientId": "..."
  }
}
```

Errores:
- `404 Not Found` — email de target no existe.
- `409 Conflict` — ya existe vínculo activo entre mismo guardian/paciente, o el target no tiene patient profile.
- `403 Forbidden` — intentás invitarte a vos mismo.

#### GET `/api/v1/me/guardian-invitations/incoming`
Invitaciones pendientes dirigidas a mi perfil (yo como paciente target). Roles: `ADMIN`, `PATIENT`.

#### GET `/api/v1/me/guardian-invitations/outgoing`
Invitaciones pendientes que YO envié. Roles: `ADMIN`, `CAREGIVER`, `PATIENT`.

Cada elemento devuelve:
```json
{
  "guardianLinkId": "...",
  "invitationToken": "...",
  "invitationExpiresAt": "...",
  "invitedAt": "...",
  "relationship": "...",
  "canEditProfile": true,
  "canManageAppointments": true,
  "patientId": "...",
  "patientFirstName": "...",
  "patientLastName": "...",
  "guardianUserId": "...",
  "guardianFirstName": "...",
  "guardianLastName": "...",
  "guardianEmail": "...",
  "createdAt": "..."
}
```

#### POST `/api/v1/guardian-invitations/:token/accept`
El paciente target acepta la invitación. Setea `isActive=true`, `acceptedAt=now`, limpia `invitationToken`. Asigna rol `CAREGIVER` al guardian si falta. Roles: `ADMIN`, `PATIENT`.

Errores:
- `404` — token no existe o ya procesada.
- `410 Gone` — invitación expirada.
- `403` — actor no coincide con el paciente target.

#### POST `/api/v1/guardian-invitations/:token/reject`
Rechaza la invitación (`rejectedAt = now`). Roles: `ADMIN`, `PATIENT`.

### 2.3 Guardians

#### GET `/api/v1/me/guardians`
Lista quienes son mis guardians activos. Roles: `ADMIN`, `PATIENT`.

#### PATCH `/api/v1/guardians/:id`
Actualiza permisos del vínculo (`canEditProfile`, `canManageAppointments`). Solo el dueño del paciente o `ADMIN`. Roles: `ADMIN`, `PATIENT`.

Request body:
```json
{ "canEditProfile": true, "canManageAppointments": false }
```

#### DELETE `/api/v1/guardians/:id`
Revoca (soft delete: `isActive=false`, `revokedAt=now`). Lo puede hacer el paciente dueño o el propio guardian. Roles: `ADMIN`, `CAREGIVER`, `PATIENT`.

---

## 3) Variables de entorno

```
GUARDIAN_INVITATION_TTL_DAYS=7   # por defecto 7 días
```

---

## 4) Guía de pruebas rápidas

1. Login como user A → `POST /api/v1/me/dependents` creando hijo → Login con email del hijo → puede ver sus propias citas.
2. User A `POST /api/v1/me/guardian-invitations { targetPatientEmail: "mama@demo.com", ... }` → copia `invitationToken`.
3. Login como mama → `POST /api/v1/guardian-invitations/:token/accept` → responde 200.
4. User A `GET /api/v1/me/dependents` → ahora incluye a mama.
5. User A crea cita para `patientId` de mama → ACL lo permite porque tiene vínculo activo + `canManageAppointments=true`.
6. User C (sin vínculo) intenta crear cita del paciente de mama → `403`.
