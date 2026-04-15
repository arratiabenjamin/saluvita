# Modelo Entidad-Relación (MVP actual)

```mermaid
erDiagram
  USERS ||--o{ USER_ROLES : has
  ROLES ||--o{ USER_ROLES : grants

  USERS ||--o| PATIENTS : owns_profile
  USERS ||--o{ PATIENTS : created_by
  USERS ||--o{ PATIENTS : updated_by

  PATIENTS ||--o{ PATIENT_GUARDIANS : has
  USERS ||--o{ PATIENT_GUARDIANS : guardian_user
  USERS ||--o{ PATIENT_GUARDIANS : created_by

  PATIENTS ||--o{ APPOINTMENTS : has
  USERS ||--o{ APPOINTMENTS : recorded_by

  APPOINTMENTS ||--o{ APPOINTMENT_ATTACHMENTS : has
  USERS ||--o{ APPOINTMENT_ATTACHMENTS : uploaded_by

  USERS ||--o{ REFRESH_TOKENS : has

  USERS {
    uuid id PK
    string email
    string password_hash
    string first_name
    string last_name
    enum status
    datetime deleted_at
  }

  ROLES {
    uuid id PK
    enum code UK
    string name
  }

  USER_ROLES {
    uuid user_id PK,FK
    uuid role_id PK,FK
  }

  PATIENTS {
    uuid id PK
    uuid user_id FK
    enum document_type
    string document_number
    string first_name
    string last_name
    datetime deleted_at
  }

  PATIENT_GUARDIANS {
    uuid id PK
    uuid patient_id FK
    uuid guardian_user_id FK
    boolean can_edit_profile
    boolean can_manage_appointments
    boolean is_active
  }

  APPOINTMENTS {
    uuid id PK
    uuid patient_id FK
    uuid recorded_by_user_id FK
    datetime starts_at
    datetime ends_at
    enum status
    boolean was_attended
  }

  APPOINTMENT_ATTACHMENTS {
    uuid id PK
    uuid appointment_id FK
    uuid uploaded_by_user_id FK
    string file_name
    string file_url
  }

  REFRESH_TOKENS {
    uuid id PK
    uuid user_id FK
    string token_hash
    datetime expires_at
    datetime revoked_at
  }
```

## Normalización aplicada
- `roles` separado de `users` (N:M con `user_roles`).
- Relación de usuarios encargados desacoplada en `patient_guardians`.
- Adjuntos desacoplados de citas en `appointment_attachments`.
- Sesiones desacopladas en `refresh_tokens`.

## Decisiones prácticas para MVP
- Datos de doctor/centro se guardan como texto en `appointments`.
- No hay integración externa de centros/hospitales en esta etapa.
