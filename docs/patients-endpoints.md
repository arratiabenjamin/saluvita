# Módulo Patients — Endpoints y contratos (estado actual)

> Fuente verificada contra el código en `backend/src/modules/patients`.
> Base URL real: **`/api`** (por `app.setGlobalPrefix('api')`).

## 1) Resumen rápido

- Recurso: `patients`
- Ruta base: `/api/v1/patients`
- Auth: Bearer JWT obligatorio en todos los endpoints del módulo.
- Roles:
  - `ADMIN`, `CAREGIVER`: acceso total a rutas principales.
  - `PATIENT`: acceso restringido a su propio perfil (`patientId` del token).

## 2) Enum de documento

```json
["RUT", "PASSPORT", "DNI", "OTHER"]
```

## 3) Matriz de endpoints

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/v1/patients` | `ADMIN`, `CAREGIVER` | Crea paciente |
| GET | `/api/v1/patients` | `ADMIN`, `CAREGIVER`, `PATIENT` | Lista pacientes (PATIENT ve solo el suyo) |
| GET | `/api/v1/patients/me` | `ADMIN`, `CAREGIVER`, `PATIENT` | Obtiene el perfil del paciente autenticado |
| GET | `/api/v1/patients/:id` | `ADMIN`, `CAREGIVER`, `PATIENT` | Obtiene un paciente por id (PATIENT solo su id) |
| PATCH | `/api/v1/patients/me` | `ADMIN`, `CAREGIVER`, `PATIENT` | Actualiza perfil propio (resuelve a `:id` interno) |
| PATCH | `/api/v1/patients/:id` | `ADMIN`, `CAREGIVER`, `PATIENT` | Actualiza paciente por id (PATIENT solo su id) |

---

## 4) Detalle por endpoint

## POST `/api/v1/patients`

### Auth / roles
- Requiere JWT.
- Roles permitidos: `ADMIN`, `CAREGIVER`.

### Request body
```json
{
  "firstName": "Maria",
  "lastName": "Lopez",
  "email": "maria@test.com",
  "documentType": "RUT",
  "documentNumber": "12345678-9",
  "phone": "+56911111111",
  "birthDate": "1992-04-10"
}
```

### Response (201)
```json
{
  "data": {
    "id": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
  }
}
```

### Validaciones principales
- `firstName`: string requerido.
- `lastName`: string requerido.
- `documentType`: enum requerido.
- `documentNumber`: string requerido.
- `email`: opcional, formato email.
- `phone`, `birthDate`: opcionales.

### Errores esperables
- `401` token faltante/inválido.
- `403` rol insuficiente.
- `400` errores de validación DTO.
- `500` documento duplicado (hoy se lanza error de dominio sin mapping HTTP explícito).

---

## GET `/api/v1/patients`

### Auth / roles
- Requiere JWT.
- Roles permitidos: `ADMIN`, `CAREGIVER`, `PATIENT`.
- Si el rol es `PATIENT`, la lista se filtra automáticamente a su propio `patientId`.

### Query params
- `page` (opcional, default `1`, min `1`)
- `limit` (opcional, default `20`, min `1`, max `100`)
- `search` (opcional)

### Response (200)
```json
{
  "data": [
    {
      "id": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
      "firstName": "Maria",
      "lastName": "Lopez",
      "email": "maria@test.com",
      "documentType": "RUT",
      "documentNumber": "12345678-9",
      "phone": "+56911111111",
      "createdAt": "2026-04-15T13:50:42.664Z"
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

### Errores esperables
- `401`, `403`, `400`.
- `403` si usuario `PATIENT` no trae `patientId` en token.

---

## GET `/api/v1/patients/me`

### Auth / roles
- Requiere JWT.
- Roles permitidos: `ADMIN`, `CAREGIVER`, `PATIENT`.
- Necesita `patientId` en el usuario autenticado.

### Response (200)
```json
{
  "data": {
    "id": "01b2e879-9938-4a29-b01b-aab96eb2ede6",
    "firstName": "Maria",
    "lastName": "Lopez",
    "email": "maria@test.com",
    "documentType": "RUT",
    "documentNumber": "12345678-9",
    "phone": "+56911111111",
    "birthDate": "1992-04-10T00:00:00.000Z",
    "createdAt": "2026-04-15T13:50:42.664Z"
  }
}
```

### Errores esperables
- `401`, `403`.
- `500` si el paciente no existe en DB (hoy `PatientNotFoundError` no tiene mapping explícito a 404).

---

## GET `/api/v1/patients/:id`

### Auth / roles
- Requiere JWT.
- Roles permitidos: `ADMIN`, `CAREGIVER`, `PATIENT`.
- Si rol `PATIENT`, solo puede consultar su propio `:id`.

### Path params
- `id` (uuid del paciente)

### Response (200)
Mismo contrato que `GET /me`.

### Errores esperables
- `401`, `403`.
- `500` si no existe el paciente (pendiente mapear a `404`).

---

## PATCH `/api/v1/patients/me`

### Auth / roles
- Requiere JWT.
- Roles permitidos: `ADMIN`, `CAREGIVER`, `PATIENT`.
- Necesita `patientId` en usuario autenticado.

### Request body (parcial)
```json
{
  "firstName": "María",
  "lastName": "López",
  "email": "nuevo.mail@test.com",
  "documentType": "RUT",
  "documentNumber": "12345678-9",
  "phone": "+56999999999",
  "birthDate": "1992-04-10"
}
```

### Response (200)
```json
{
  "data": {
    "id": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
  }
}
```

### Validaciones
- Todos los campos son opcionales.
- `email`, si viene, debe ser válido.
- `documentType`, si viene, debe ser enum válido.

### Errores esperables
- `401`, `403`, `400`.
- `500` si paciente no existe.

---

## PATCH `/api/v1/patients/:id`

### Auth / roles
- Requiere JWT.
- Roles permitidos: `ADMIN`, `CAREGIVER`, `PATIENT`.
- Si rol `PATIENT`, solo puede actualizar su propio `:id`.

### Path params
- `id` (uuid del paciente)

### Request/Response
- Mismo contrato que `PATCH /me`.

### Errores esperables
- `401`, `403`, `400`.
- `500` si paciente no existe.

---

## 5) Reglas funcionales importantes (actuales)

- `PATIENT` nunca puede leer/editar el perfil de otro paciente.
- Listado para `PATIENT` se restringe automáticamente a su propio registro.
- La tabla usa soft delete (`deletedAt`), por lo que búsquedas/listados filtran `deletedAt = null`.
- El módulo no usa `organizationId` en patients en esta versión.

## 6) Observación técnica recomendada

Hoy hay errores de dominio (`PatientNotFoundError`, `DuplicatePatientDocumentError`) sin un Exception Filter global para mapear a HTTP (`404`/`409`).

Recomendación para cerrar contrato frontend:
- mapear `PatientNotFoundError -> 404`
- mapear `DuplicatePatientDocumentError -> 409`
