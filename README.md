# Agenda Médica — Monorepo

Sistema de agenda médica (MVP) orientado a **paciente autogestionado**.

- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: carpeta preparada (`frontend/`) para inicializar app web
- Deploy: Render (`render.yaml` en raíz)

---

## Estado del proyecto

### MVP actual (backend)
- Auth (`register`, `login`, `refresh`, `logout`, `me`)
- Users (gestión admin)
- Patients (con ownership y endpoints `me`)
- Esquema DB alineado a modelo paciente/encargado

### Enfoque funcional
- Paciente se puede registrar por sí mismo.
- Roles: `PATIENT`, `CAREGIVER`, `ADMIN`.
- Control de acceso por rol + ownership.

---

## Estructura del repo

```bash
AgendaMedica/
├─ backend/                 # API NestJS + Prisma
├─ frontend/                # Placeholder para frontend
├─ docs/                    # Documentación técnica (incluye ER)
├─ render.yaml              # Blueprint Render
└─ README.md
```

---

## Requisitos

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose
- PostgreSQL (si no usás Docker)

---

## Levantar el proyecto local (backend)

### 1) Ir al backend
```bash
cd backend
```

### 2) Instalar dependencias
```bash
pnpm install
```

### 3) Levantar PostgreSQL con Docker
```bash
docker compose up -d
```

> Usa `backend/docker-compose.yml`.

### 4) Aplicar migraciones
```bash
pnpm prisma migrate dev
```

Si venís de cambios grandes de esquema en desarrollo:
```bash
pnpm prisma migrate reset --force
```

### 5) Generar cliente Prisma
```bash
pnpm prisma generate
```

### 6) Ejecutar backend
```bash
pnpm start:dev
```

Backend disponible en:
- `http://localhost:3000`

Health endpoint:
- `GET /`

---

## Scripts útiles (backend)

```bash
pnpm start:dev      # desarrollo
pnpm build          # build producción
pnpm start:prod     # correr build
pnpm test           # tests
pnpm prisma studio  # ver DB
```

---

## Variables de entorno (backend)

Archivo: `backend/.env`

Mínimas:
- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_TTL_DAYS`

> Si faltan JWT vars, hay defaults de desarrollo, pero para ambientes reales definilas explícitamente.

---

## Deploy en Render

Este repo ya incluye `render.yaml` listo para:
- 1 servicio web `agendamedica-backend`
- 1 PostgreSQL `agendamedica-db`

Flujo recomendado:
1. Conectar repo en Render
2. Crear Blueprint desde `render.yaml`
3. Deploy automático

---

## Endpoints principales (MVP)

### Auth
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/auth/me`

### Patients
- `GET /v1/patients/me`
- `PATCH /v1/patients/me`
- `POST /v1/patients` (admin/caregiver)
- `GET /v1/patients/:id`
- `PATCH /v1/patients/:id`
- `GET /v1/patients`

### Users (admin)
- `POST /v1/users`
- `GET /v1/users/:id`
- `GET /v1/users`
- `PATCH /v1/users/:id`

---

## Documentación técnica

- Especificación funcional/técnica: `especificacion-backend-mvp-v3-corregida.md`
- Modelo entidad-relación: `docs/db-er-model.md`

---

## Notas

- Este repositorio está en formato **monorepo** para simplificar coordinación backend/frontend.
- La integración con ministerio/hospitales/clínicas queda para fases posteriores.
