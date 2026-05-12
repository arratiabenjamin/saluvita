# 🔧 DEBUGGING - FIX DEL PROBLEMA DE "LOGOUT INMEDIATO"

## 🔴 PROBLEMAS ENCONTRADOS Y SOLUCIONADOS

### **Problema 1: Tipo `User` incompatible**
**Ubicación**: `modules/auth/api/auth-api.ts` línea 13

**El Problema:**
```typescript
// ❌ ANTES (tipo antiguo):
const demoUser: User = {
  role: 'CAREGIVER',  // ❌ string singular
};

// ✅ DESPUÉS (tipo nuevo):
const demoUser: User = {
  roles: ['CAREGIVER'],  // ✅ array
  patientId: 'demo-patient-id',
  status: 'ACTIVE',
};
```

**Impacto**: 
- El tipo `User` esperaba `roles: UserRole[]` (array)
- Pero `demoUser` tenía `role: string` (singular)
- Causaba type error silencioso + datos incorrectos

---

### **Problema 2: `restoreSession` se ejecutaba múltiples veces**
**Ubicación**: `app/providers/auth-provider.tsx`

**El Problema:**
```typescript
// ❌ ANTES (ejecución multiple):
const restoreSession = useCallback(async () => { ... }, []);

useEffect(() => {
  void restoreSession();
}, [restoreSession]);  // ❌ Dependencies infinito: restoreSession cambia → useEffect se ejecuta → nuevo restoreSession...
```

**Flujo problemático:**
```
1. AuthProvider monta
2. useEffect ejecuta restoreSession()
3. Componente re-renderiza
4. restoreSession tiene diferentes referencias
5. useEffect ejecuta de nuevo
6. GET /auth/me falla por alguna razón
7. localStorage se limpia
8. Usuario vuelve a login ❌
```

**La Solución:**
```typescript
// ✅ DESPUÉS (solo UNA ejecución):
const hasRestoredRef = useRef(false);

useEffect(() => {
  if (hasRestoredRef.current) {
    return;  // ✅ Solo ejecuta una vez
  }
  hasRestoredRef.current = true;

  const restoreSession = async () => { ... };
  restoreSession();
}, []);  // ✅ Dependencias vacías, ejecuta solo en mount
```

---

### **Problema 3: Falta de logging para debuggear**
**Ubicación**: Múltiples archivos

**La Solución:**
- Agregué logs en `auth-api.ts`: `[AUTH API]`
- Agregué logs en `auth-provider.tsx`: `[AUTH]`
- Agregué logs en `axios.ts`: `[AXIOS]`

Ahora puedes rastrear todo en la consola del navegador.

---

## 🟢 CÓMO VERIFICAR QUE ESTÁ ARREGLADO

### **Test 1: Login y redirige correctamente**

1. Abre `http://localhost:5173/login`
2. Abre Console (F12)
3. Ingresa: `demo@bmbsalud.cl` / `123456`
4. Click "Ingresar a la plataforma"

**Verifica en Console:**
```
[AUTH] Iniciando login para: demo@bmbsalud.cl
[AXIOS] POST /api/v1/auth/login
[AUTH] Login exitoso. Token recibido: demo-access-token
[AUTH] Guardado en localStorage
[AUTH] Estado actualizado. Usuario: demo@bmbsalud.cl
```

**Resultado esperado:**
✅ Redirige a `/dashboard` sin volver al login

---

### **Test 2: localStorage tiene el token**

En Console del navegador:
```javascript
localStorage.getItem('bmb_access_token')
// Debe retornar: "demo-access-token" (o JWT real del backend)

localStorage.getItem('bmb_user')
// Debe retornar algo como:
// {"id":"demo-user","firstName":"Beatriz",...,"roles":["CAREGIVER"]}
```

---

### **Test 3: Sesión persistente (F5)**

1. En `/dashboard`
2. Abre Console
3. Presiona F5

**Verifica en Console:**
```
[AUTH] Iniciando restoreSession...
[AUTH] Token en localStorage: SÍ
[AUTH] User en localStorage: SÍ
[AUTH] Validando sesión con GET /auth/me...
[AXIOS] GET /api/v1/auth/me
[AUTH API] me() response: {id: "demo-user", ...}
[AUTH] Sesión válida. Usuario: demo@bmbsalud.cl
```

**Resultado esperado:**
✅ Dashboard sigue cargado sin redirigir a login

---

### **Test 4: Axios interceptor envía token**

1. En `/dashboard`
2. Abre Console
3. Navega a `/patients` (o cualquier ruta protegida que haga API calls)

**Verifica en Console:**
```
[AXIOS] GET /api/v1/patients
[AXIOS] Adding Authorization header. Token: demo-access-token
[AXIOS] Response 200: /api/v1/patients
```

**Resultado esperado:**
✅ Token se envía con cada request

---

## 🐛 SI AÚN TIENES PROBLEMAS

### **Escenario: Aún vuelve a login después de login exitoso**

1. **Verifica que VITE_API_URL esté correcto:**
   ```bash
   # En .env.local (frontend)
   VITE_API_URL=http://localhost:3000/api
   ```

2. **Verifica que el backend está corriendo:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/auth/me \
     -H "Authorization: Bearer demo-access-token"
   # Debe retornar: {"id":"demo-user",...}
   ```

3. **Revisa los logs en consola:**
   - ¿Dice `[AUTH] Error al restaurar sesión`?
   - ¿Dice `[AXIOS] Error 401: /api/v1/auth/me`?
   - ¿Dice `[AUTH] me() retornó null/undefined`?

---

### **Si dice "Error 401: /api/v1/auth/me"**

Problema: El token no se está validando correctamente en el backend

**Soluciones:**
1. Verifica que el backend está corriendo: `pnpm start:dev`
2. Verifica que el token es válido en el backend
3. Revisa que `GET /api/v1/auth/me` está implementado correctamente

**Test rápido:**
```bash
# En terminal, reemplaza XXX con el token real
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer XXX" \
  -H "Content-Type: application/json"
```

---

### **Si dice "No hay sesión guardada"**

Problema: localStorage está vacío después del login

**Causas posibles:**
1. localStorage está deshabilitado
2. Token no se está guardando correctamente
3. setAuthSession() no se está ejecutando

**Debug:**
```javascript
// En console, después de login
localStorage.getItem('bmb_access_token')
localStorage.getItem('bmb_user')
// Si ambos son null → problema en setAuthSession()
```

---

### **Si dice "me() retornó null/undefined"**

Problema: Backend retorna null en GET /auth/me

**Causas posibles:**
1. Backend no tiene GET /auth/me implementado
2. Backend retorna vacío
3. Token expiró

**Debug:**
```bash
# Test directo al backend
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer demo-access-token"
# Debe retornar: {"id":"demo-user","email":"..."}
```

---

## 📊 FLUJO CORRECTO (CON LOGS)

```
USUARIO HACE LOGIN
│
├─ [AUTH] Iniciando login para: demo@bmbsalud.cl
├─ [AXIOS] POST /api/v1/auth/login
├─ [AUTH API] Login error (fallback): si backend falla
│                 ó
├─ [AUTH] Login exitoso
├─ [AUTH] Guardado en localStorage
├─ setAccessToken(token)
├─ setUser(usuario)
│
├─ Navigate a /dashboard
│
USUARIO EN DASHBOARD
│
├─ [ProtectedRoute] valida: isAuthenticated = true
├─ [ProtectedRoute] renderiza AppShell + Outlet
│
├─ F5 (RECARGA)
│
├─ [AUTH] Iniciando restoreSession...
├─ [AUTH] Token en localStorage: SÍ
├─ [AXIOS] GET /api/v1/auth/me
├─ [AXIOS] Adding Authorization header
├─ [AUTH] Sesión válida
├─ setAccessToken(token)
├─ setUser(usuario)
│
✅ Dashboard cargado (sesión persistida)
```

---

## 🎯 CAMBIOS ESPECÍFICOS REALIZADOS

### **auth-api.ts**
```diff
- role: 'CAREGIVER'
+ roles: ['CAREGIVER']
+ patientId: 'demo-patient-id'
+ status: 'ACTIVE'
+ Agregados: console.log para debugging
```

### **auth-provider.tsx**
```diff
- useCallback(async () => { restoreSession() }, [])
+ useRef(false) para rastrear si ya se restauró
+ useEffect(() => { ... }, []) solo ejecuta UNA VEZ
+ Agregados: console.log detallados
+ Removido: useCallback que causaba re-renders
```

### **axios.ts**
```diff
+ Interceptor de respuesta exitosa
+ Logging de todos los requests y responses
+ Logging de errors con status
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Console log muestra `[AUTH] Login exitoso`
- [ ] localStorage tiene `bmb_access_token`
- [ ] localStorage tiene `bmb_user` con `roles` (array)
- [ ] Console log muestra `[AXIOS] Adding Authorization header`
- [ ] Dashboard carga después del login
- [ ] F5 mantiene la sesión sin redirigir a login
- [ ] Console log muestra `[AUTH] Sesión válida` después de F5

---

## 🚀 PARA PROBAR AHORA

```bash
# Terminal 1: Backend
cd backend
pnpm start:dev

# Terminal 2: Frontend
cd frontend
pnpm dev

# Navegador
http://localhost:5173/login
```

1. Abre Console (F12)
2. Login con `demo@bmbsalud.cl` / `123456`
3. Verifica los logs
4. Recarga página (F5)
5. Verifica logs de `restoreSession`

---

## 📞 SI PERSISTEN PROBLEMAS

**Toma un screenshot de los logs en Console y manda:**
1. Logs que salen después del login
2. Error específico que ves
3. URL donde está el error

Ej:
```
[AUTH] Iniciando login para: demo@bmbsalud.cl
[AXIOS] POST /api/v1/auth/login
[AXIOS] Error 401: /api/v1/auth/login
← Aquí está el problema
```

---

Generated: April 23, 2026  
Status: ✅ Problemas identificados y arreglados
