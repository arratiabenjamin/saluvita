/**
 * EJEMPLOS DE USO DEL AUTH CONTEXT
 * 
 * Este archivo muestra cómo usar el sistema de autenticación
 * implementado con React Context + TypeScript
 */

import { useAuth } from '@/modules/auth/hooks/use-auth';

/**
 * Ejemplo 1: Componente de Login
 */
export function LoginExample() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // El usuario será redirigido automáticamente por ProtectedRoute
      // AuthContext actualiza user, accessToken e isAuthenticated
    } catch (error) {
      console.error('Login falló:', error);
      // Mostrar error al usuario
    }
  };

  return (
    <button 
      onClick={() => handleLogin('test@example.com', 'password123')}
      disabled={isLoading}
    >
      {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
    </button>
  );
}

/**
 * Ejemplo 2: Mostrar información del usuario autenticado
 */
export function UserProfileExample() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>No autenticado</p>;
  }

  return (
    <div>
      <h2>{user?.firstName} {user?.lastName}</h2>
      <p>Email: {user?.email}</p>
      <p>Roles: {user?.roles.join(', ')}</p>
      {user?.patientId && <p>Paciente ID: {user.patientId}</p>}
    </div>
  );
}

/**
 * Ejemplo 3: Botón de Logout
 */
export function LogoutExample() {
  const { logout, isLoading } = useAuth();

  return (
    <button 
      onClick={() => logout()}
      disabled={isLoading}
    >
      {isLoading ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  );
}

/**
 * Ejemplo 4: Proteger rutas basado en rol
 */
export function RoleBasedExample() {
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('ADMIN');
  const isPatient = user?.roles.includes('PATIENT');

  return (
    <div>
      {isAdmin && <p>Panel de administrador visible</p>}
      {isPatient && <p>Portal del paciente visible</p>}
    </div>
  );
}

/**
 * Ejemplo 5: Manejando estado de carga
 */
export function LoadingExample() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Restaurando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <div>Inicia sesión para continuar</div>;
  }

  return <div>Contenido protegido</div>;
}

/**
 * FLUJO COMPLETO DE AUTENTICACIÓN:
 * 
 * 1. App se monta → AuthProvider ejecuta restoreSession()
 *    - Lee accessToken y user desde localStorage
 *    - Valida con GET /api/v1/auth/me
 *    - Si es válido, restaura sesión
 *    - Si falla, limpia localStorage
 * 
 * 2. Usuario hace login → login({ email, password })
 *    - POST /api/v1/auth/login
 *    - Guarda accessToken, refreshToken, user en localStorage
 *    - Actualiza estado: user, accessToken, isAuthenticated
 *    - axios interceptor automáticamente añade Bearer token
 * 
 * 3. Usuario hace logout → logout()
 *    - POST /api/v1/auth/logout (opcional, puede fallar)
 *    - Limpia localStorage
 *    - Limpia estado: user = null, accessToken = null
 * 
 * 4. Componentes usan useAuth() para acceder:
 *    - user (User | null)
 *    - accessToken (string | null)
 *    - isAuthenticated (boolean)
 *    - isLoading (boolean)
 *    - login(payload) Promise<void>
 *    - logout() Promise<void>
 */
