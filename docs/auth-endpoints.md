# Módulo Auth — Endpoints y contratos (estado actual)

> Fuente verificada contra `backend/src/modules/auth`.
> Base URL real: **`/api`** (por `app.setGlobalPrefix('api')`).

## 1) Resumen

- Recurso: `auth`
- Ruta base: `/api/v1/auth`
- Registro MVP: alta de usuario tipo paciente (`PATIENT`) con perfil `patient` asociado.

## 2) Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Registro de paciente |
| POST | `/api/v1/auth/login` | No | Login por email/password |
| POST | `/api/v1/auth/refresh` | No | Rotación de refresh token |
| POST | `/api/v1/auth/logout` | No | Revoca refresh token |
| GET | `/api/v1/auth/me` | Sí (Bearer) | Perfil del usuario autenticado |

---

## POST `/api/v1/auth/register`

### Request body
```json
{
  "email": "paciente1@test.com",
  "password": "Secret123",
  "firstName": "Maria",
  "lastName": "Lopez",
  "documentType": "RUT",
  "documentNumber": "12345678-9",
  "birthDate": "1992-04-10",
  "phone": "+56911111111"
}
```

### Validaciones
- `email`: requerido, formato email.
- `password`: requerido, mínimo 8.
- `firstName`, `lastName`: requeridos.
- `documentType`: requerido enum (`RUT`, `PASSPORT`, `DNI`, `OTHER`).
- `documentNumber`: requerido.
- `birthDate`: opcional, date string.
- `phone`: opcional.

### Response (201)
```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaque-token>",
    "tokenType": "Bearer",
    "user": {
      "id": "36bb7863-545a-4024-abdb-b9bb812932db",
      "email": "paciente1@test.com",
      "firstName": "Maria",
      "lastName": "Lopez",
      "status": "ACTIVE",
      "roles": ["PATIENT"],
      "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
    }
  }
}
```

### Errores esperables
- `400` body inválido.
- `409` email ya en uso.
- `409` documento de paciente ya existe.

---

## POST `/api/v1/auth/login`

### Request body
```json
{
  "email": "paciente1@test.com",
  "password": "Secret123"
}
```

### Response (200)
```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaque-token>",
    "tokenType": "Bearer",
    "user": {
      "id": "36bb7863-545a-4024-abdb-b9bb812932db",
      "email": "paciente1@test.com",
      "firstName": "Maria",
      "lastName": "Lopez",
      "status": "ACTIVE",
      "roles": ["PATIENT"],
      "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
    }
  }
}
```

### Errores esperables
- `400` body inválido.
- `401` credenciales inválidas.
- `403` usuario no activo (`INACTIVE` o `BLOCKED`).

---

## POST `/api/v1/auth/refresh`

### Request body
```json
{
  "refreshToken": "<opaque-token>"
}
```

### Response (200)
```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<new-opaque-token>",
    "tokenType": "Bearer",
    "user": {
      "id": "36bb7863-545a-4024-abdb-b9bb812932db",
      "email": "paciente1@test.com",
      "firstName": "Maria",
      "lastName": "Lopez",
      "status": "ACTIVE",
      "roles": ["PATIENT"],
      "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
    }
  }
}
```

### Notas
- El refresh token usado se revoca y se entrega uno nuevo.

### Errores esperables
- `400` body inválido.
- `401` refresh token inválido/expirado/revocado.

---

## POST `/api/v1/auth/logout`

### Request body
```json
{
  "refreshToken": "<opaque-token>"
}
```

### Response (200)
```json
{
  "data": {
    "ok": true
  }
}
```

### Notas
- Si el token ya estaba revocado o no existe, igualmente responde `ok: true`.

---

## GET `/api/v1/auth/me`

### Auth
- Requiere `Authorization: Bearer <accessToken>`.

### Response (200)
```json
{
  "data": {
    "id": "36bb7863-545a-4024-abdb-b9bb812932db",
    "email": "paciente1@test.com",
    "firstName": "Maria",
    "lastName": "Lopez",
    "status": "ACTIVE",
    "roles": ["PATIENT"],
    "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
  }
}
```

### Errores esperables
- `401` token faltante/inválido/expirado.
- `401` usuario no encontrado (borrado lógico o inconsistencia de sesión).

---

## 3) Estructura del access token (payload)

```json
{
  "sub": "<userId>",
  "email": "paciente1@test.com",
  "roles": ["PATIENT"],
  "patientId": "01b2e879-9938-4a29-b01b-aab96eb2ede6"
}
```

## 4) Variables de entorno usadas por Auth

- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- `JWT_REFRESH_TTL_DAYS` (default `30`)

## 5) Reglas clave actuales

- `register` crea:
  - `users`
  - relación `user_roles` con `PATIENT`
  - `patients` vinculado por `userId`.
- Email se normaliza a lower-case.
- `documentNumber` se normaliza a upper-case.
- `login` actualiza `lastLoginAt`.
- `refresh` rota sesión (revoca token viejo y emite nuevo).
