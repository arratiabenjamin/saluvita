# Sistema de Autenticación - Documentación Técnica

## Resumen de Cambios

Se implementó un **AuthContext** completo con React 18 + TypeScript para manejar autenticación global con JWT.

### Archivos Modificados/Creados:

```
frontend/src/
├── shared/types/auth.ts                    ✅ Tipos actualizados
├── shared/lib/storage.ts                   ✅ (sin cambios, ya correcto)
├── modules/auth/
│   ├── auth-context.ts                     ✅ (sin cambios, ya correcto)
│   ├── hooks/use-auth.ts                   ✅ (sin cambios, ya correcto)
│   ├── examples.tsx                        ✅ Ejemplos de uso
│   └── api/auth-api.ts                     ✅ (sin cambios, ya consumido por AuthProvider)
└── app/providers/auth-provider.tsx         ✅ Implementación completa
```

---

## Estructura de Tipos

### User
```typescript
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];           // ✅ ARRAY (PACIENTE, CAREGIVER, ADMIN)
  patientId?: string | null;   // ✅ Nuevo
  status?: string;             // ✅ Nuevo (ACTIVE, INACTIVE, BLOCKED)
};
```

### AuthContextValue
```typescript
type AuthContextValue = {
  // Estado
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;    // true si user && accessToken
  isLoading: boolean;          // Durante login, logout, restoreSession
  
  // Funciones
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;  // ✅ Nuevo
};
```

---

## Implementación: AuthProvider

### Características:

#### 1. **Inicialización Automática (restoreSession)**
```typescript
useEffect(() => {
  void restoreSession();
}, [restoreSession]);
```
- Lee tokens de localStorage
- Valida sesión con `GET /api/v1/auth/me`
- Restaura usuario si es válido
- Limpia sesión si falla

#### 2. **Login con Persistencia**
```typescript
const login = useCallback(async (payload: LoginPayload) => {
  const response = await authApi.login(payload);
  setAuthSession(response);  // localStorage
  setAccessToken(response.accessToken);
  setUser(response.user);
}, []);
```
- Guarda tokens en localStorage
- Actualiza estado global
- axios interceptor añade `Authorization: Bearer <token>`

#### 3. **Logout Seguro**
```typescript
const logout = useCallback(async () => {
  await authApi.logout();  // Revoca refresh token en backend
  clearAuthSession();      // Limpia localStorage
  setAccessToken(null);
  setUser(null);
}, []);
```
- Revoca token en backend (opcional, continúa si falla)
- Siempre limpia estado local

---

## Integración en main.tsx

### Paso 1: Envolver App con AuthProvider

**frontend/src/main.tsx:**
```typescript
import { AuthProvider } from '@/app/providers/auth-provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

### Paso 2: Usar useAuth en componentes

**Ejemplo: LoginPage**
```typescript
import { useAuth } from '@/modules/auth/hooks/use-auth';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // AuthProvider actualiza estado, ProtectedRoute redirige
    } catch (error) {
      // Mostrar error
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* form fields */}
    </form>
  );
}
```

### Paso 3: Proteger rutas

**frontend/src/app/router/protected-route.tsx:**
```typescript
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
```

---

## Flujo de Autenticación Completo

```
┌─────────────────────────────────────────┐
│  1. App se monta                        │
│     AuthProvider ejecuta               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  restoreSession()                       │
│  - Lee: accessToken, user               │
│  - GET /api/v1/auth/me                  │
│  - isLoading = true                     │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴─────┐
        ▼            ▼
    ✅ Válido    ❌ Inválido
        │            │
        ▼            ▼
   setUser()    clearAuthSession()
   setAccessToken() setUser(null)
   isLoading=false   isLoading=false
        │            │
        └──────┬─────┘
               ▼
      ┌────────────────────┐
      │  App renderizado   │
      │  usuario listo     │
      └────────────────────┘
               │
               ├─► LoginPage (si !isAuthenticated)
               │
               └─► Dashboard (si isAuthenticated)

┌─────────────────────────────────────────┐
│  2. Usuario hace login                  │
│     login({ email, password })          │
└──────────────┬──────────────────────────┘
               │
               ▼
       POST /api/v1/auth/login
       { email, password }
               │
               ▼
      response: {
        accessToken: "eyJhbGc...",
        refreshToken: "abc123...",
        user: { id, email, roles, ... }
      }
               │
               ▼
      setAuthSession(response)
      localStorage actualizado
               │
               ▼
      setState(user, accessToken)
      isAuthenticated = true
               │
               ▼
      ProtectedRoute redirige
      a Dashboard
```

---

## localStorage Keys

```typescript
'bmb_access_token'   // JWT para autorización
'bmb_refresh_token'  // Token para refrescar sesión
'bmb_user'           // Datos del usuario JSON
```

---

## Manejo de Errores

### Login falla:
```typescript
try {
  await login({ email, password });
} catch (error) {
  // Error mostrado:
  // - "Invalid credentials" (usuario no existe o pwd incorrecta)
  // - Error de red
  // Estado no cambia, usuario sigue en LoginPage
}
```

### Logout falla:
```typescript
const logout = useCallback(async () => {
  try {
    await authApi.logout();  // Puede fallar
  } catch (error) {
    console.warn('Backend logout falló (continuando)');
  } finally {
    // SIEMPRE limpia sesión local
    clearAuthSession();
    setAccessToken(null);
    setUser(null);
  }
}, []);
```

---

## axios Interceptor

**frontend/src/shared/lib/axios.ts**

```typescript
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

✅ **Ya integrado** - No requiere cambios

---

## Casos de Uso Típicos

### 1. Verificar si usuario está autenticado
```typescript
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### 2. Acceder a datos del usuario
```typescript
const { user } = useAuth();
return <h1>{user?.firstName} {user?.lastName}</h1>;
```

### 3. Validar rol
```typescript
const { user } = useAuth();
const isAdmin = user?.roles.includes('ADMIN');
```

### 4. Mostrar estado de carga
```typescript
const { isLoading, isAuthenticated } = useAuth();

if (isLoading) return <Spinner />;
if (!isAuthenticated) return <LoginForm />;
return <Dashboard />;
```

---

## Testing

### Mock de AuthProvider:
```typescript
import { vi } from 'vitest';
import { AuthContext } from '@/modules/auth/auth-context';

const mockAuthValue = {
  user: { 
    id: '1', 
    email: 'test@example.com', 
    firstName: 'Test',
    lastName: 'User',
    roles: ['PATIENT'],
  },
  accessToken: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  restoreSession: vi.fn(),
};

render(
  <AuthContext.Provider value={mockAuthValue}>
    <YourComponent />
  </AuthContext.Provider>
);
```

---

## Checklist de Implementación

- [x] Actualizar tipos en `shared/types/auth.ts`
- [x] Implementar `AuthProvider` con lógica completa
- [x] Mantener `useAuth` hook
- [x] localStorage con keys prefijadas
- [x] axios interceptor con Bearer token
- [ ] Envolver `App` con `AuthProvider` en `main.tsx`
- [ ] Actualizar `ProtectedRoute` si es necesario
- [ ] Probar flujo: login → restaurar sesión → logout
- [ ] Conectar componentes con `useAuth()`

---

## Depuración

**Habilitare logs en desarrollo:**
```typescript
// En AuthProvider:
console.log('[AUTH] Restaurando sesión...');
console.log('[AUTH] Usuario:', user);
console.log('[AUTH] Token válido:', Boolean(accessToken));
```

**Verificar localStorage:**
```javascript
// En console del navegador
localStorage.getItem('bmb_access_token')
localStorage.getItem('bmb_user')
```

**Verificar tokens JWT:**
- Usa https://jwt.io para decodificar
- Verifica expiración: `exp` claim

---

## Notas Importantes

1. **Roles es array**: Cambio importante - ahora `roles: string[]` (backend retorna esto)
2. **patientId opcional**: Solo presente si el usuario tiene un perfil de paciente
3. **useCallback en AuthProvider**: Evita renders innecesarios con `useMemo`
4. **Logout es seguro**: Siempre limpia estado aunque backend falle
5. **Sesión persistente**: Se restaura automáticamente al recargar página
