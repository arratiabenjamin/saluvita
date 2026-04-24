# Módulo Medical History — Endpoints, contratos y guía de pruebas

> Base URL: `/api/v1/patients/:patientId/medical-history`
> Auth: Bearer token obligatorio en todos los endpoints.
> Swagger tags: `Medical History`, `Medical History - Attachments`.

## 1) Reglas de negocio implementadas

- Modelo `MedicalHistoryEntry` con enums:
  - `source`: `APPOINTMENT` | `MANUAL`.
  - `type`: `DIAGNOSIS` | `CONCLUSION` | `FOLLOW_UP` | `PATIENT_NOTE` | `EXAM` | `PRESCRIPTION` | `OTHER`.
- Auto-población desde citas completadas:
  - Al ejecutar `PATCH /appointments/:id/complete`, después de persistir la cita se llama internamente a `CreateEntriesFromAppointmentUseCase` que inserta 0..3 entradas según qué campos trae la cita: `diagnosis` (type=DIAGNOSIS), `conclusion` (type=CONCLUSION), `followUpNotes` (type=FOLLOW_UP). Todas con `source=APPOINTMENT` y `appointmentId` referenciado.
  - `occurredAt` = `endsAt ?? startsAt` de la cita.
  - Si la inserción de historial falla, la cita queda completada igual y el error se loguea (decisión pragmática MVP, no hay outbox).
- Entradas manuales:
  - `source=MANUAL`, cualquier `type`, `occurredAt` indicado por el cliente.
  - Son editables por el actor autorizado (queda auditado en `updatedByUserId`).
- Eliminación de entradas:
  - Cascadea los adjuntos en DB y borra los objetos en S3 (best-effort: si S3 falla se loguea warning pero la metadata ya no está en DB).
- ACL:
  - `ADMIN`: acceso total.
  - `PATIENT`: lee/escribe solo su propio `patientId`.
  - `CAREGIVER`: lee siempre que tenga vínculo activo. Para escribir (POST/PATCH/DELETE) requiere además `canEditProfile=true` en el vínculo.
- Adjuntos (AWS S3 real vía presigned URLs):
  - Flujo en dos pasos: `POST .../attachments/presign` devuelve URL firmada PUT → el cliente sube el archivo directo a S3 → `POST .../attachments` registra metadata.
  - TTLs configurables en env vars.
  - Validación: MIME type en lista permitida (jpeg/png/webp/pdf) y tamaño entre 1 byte y `AWS_S3_MAX_FILE_SIZE_BYTES`.
  - Los objetos se guardan con key `medical-history/{patientId}/{entryId}/{uuid}-{safeFileName}`.

---

## 2) Endpoints

### 2.1 Entradas

#### GET `/api/v1/patients/:patientId/medical-history`
Lista entradas paginadas. Orden por `occurredAt DESC`.

Roles: `ADMIN`, `CAREGIVER`, `PATIENT`.

Query params:
- `page` (default 1)
- `limit` (default 20, max 100)
- `source`: `APPOINTMENT` | `MANUAL`
- `type`: valor del enum
- `from`, `to`: ISO date

Response:
```json
{
  "data": [
    {
      "id": "...",
      "patientId": "...",
      "source": "APPOINTMENT",
      "type": "DIAGNOSIS",
      "title": "Diagnóstico de cita",
      "description": "Migraña con aura",
      "occurredAt": "2026-04-20T10:00:00.000Z",
      "appointmentId": "...",
      "createdByUserId": "...",
      "updatedByUserId": null,
      "createdAt": "2026-04-24T14:00:00.000Z",
      "updatedAt": "2026-04-24T14:00:00.000Z",
      "attachments": [
        {
          "id": "...",
          "fileName": "hemograma.pdf",
          "fileMimeType": "application/pdf",
          "fileSizeBytes": 245678,
          "uploadedByUserId": "...",
          "createdAt": "..."
        }
      ]
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

#### GET `/api/v1/patients/:patientId/medical-history/:id`
Obtiene una entrada con sus adjuntos.

#### POST `/api/v1/patients/:patientId/medical-history`
Crea entrada manual (`source=MANUAL`).

Request body:
```json
{
  "type": "EXAM",
  "title": "Hemograma completo",
  "description": "Solicitado por control general",
  "occurredAt": "2026-04-20T10:00:00.000Z"
}
```

Response:
```json
{ "data": { "id": "..." } }
```

#### PATCH `/api/v1/patients/:patientId/medical-history/:id`
Actualiza una entrada (audit en `updatedByUserId`). Cualquier campo es opcional.

Request body:
```json
{ "title": "Hemograma + perfil lipídico", "description": "..." }
```

#### DELETE `/api/v1/patients/:patientId/medical-history/:id`
Elimina entrada y sus adjuntos (DB + S3 best-effort).

### 2.2 Adjuntos

#### POST `/api/v1/patients/:patientId/medical-history/:entryId/attachments/presign`
Genera URL firmada PUT para subir archivo a S3.

Request body:
```json
{
  "fileName": "hemograma.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 245678
}
```

Response:
```json
{
  "data": {
    "uploadUrl": "https://agendamedica-uploads.s3.us-east-1.amazonaws.com/...",
    "method": "PUT",
    "headers": { "Content-Type": "application/pdf" },
    "bucket": "agendamedica-uploads",
    "key": "medical-history/{patientId}/{entryId}/{uuid}-hemograma.pdf",
    "expiresAt": "2026-04-24T14:15:00.000Z"
  }
}
```

El cliente debe hacer `PUT` al `uploadUrl` con el archivo como body y los `headers` indicados.

Validaciones:
- MIME permitido: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Tamaño: `1 <= sizeBytes <= AWS_S3_MAX_FILE_SIZE_BYTES` (default 10 MB).

#### POST `/api/v1/patients/:patientId/medical-history/:entryId/attachments`
Registra metadata tras el upload exitoso.

Request body:
```json
{
  "key": "medical-history/.../hemograma.pdf",
  "fileName": "hemograma.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 245678
}
```

#### GET `/api/v1/patients/:patientId/medical-history/:entryId/attachments/:attachmentId/download-url`
Devuelve URL firmada GET para descarga temporal.

Response:
```json
{
  "data": {
    "url": "https://.../signed-get",
    "expiresAt": "...",
    "fileName": "...",
    "fileMimeType": "...",
    "fileSizeBytes": 245678
  }
}
```

#### DELETE `/api/v1/patients/:patientId/medical-history/:entryId/attachments/:attachmentId`
Elimina adjunto en DB + S3.

---

## 3) Variables de entorno

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=agendamedica-uploads
AWS_S3_UPLOAD_URL_TTL_SECONDS=900
AWS_S3_DOWNLOAD_URL_TTL_SECONDS=900
AWS_S3_MAX_FILE_SIZE_BYTES=10485760
```

---

## 4) Guía de pruebas rápidas

1. Completar una cita con `diagnosis` + `conclusion` → `GET /medical-history` devuelve 2 entradas con `source=APPOINTMENT` y `appointmentId` del original.
2. `POST /medical-history { type: "EXAM", ... }` → crea entrada manual.
3. `POST .../attachments/presign` → devuelve URL firmada.
4. `curl -X PUT -H "Content-Type: application/pdf" --upload-file hemograma.pdf "<uploadUrl>"` → sube archivo.
5. `POST .../attachments { key, fileName, mimeType, sizeBytes }` → registra metadata.
6. `GET .../attachments/:id/download-url` → URL firmada para descarga.
7. Caregiver con `canEditProfile=false`: `GET` funciona, `POST` → 403.
8. User sin vínculo: cualquier operación → 403.
