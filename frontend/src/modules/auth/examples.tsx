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
  const { login, isInitializing } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login falló:', error);
    }
  };

  return (
    <button
      onClick={() => handleLogin('test@example.com', 'password123')}
      disabled={isInitializing}
    >
      {isInitializing ? 'Iniciando...' : 'Iniciar sesión'}
    </button>
  );
}

/**
 * Ejemplo 2: Mostrar información del usuario autenticado
 */
export function UserProfileExample() {
  const { session, isAuthenticated } = useAuth();
  const user = session?.user;

  if (!isAuthenticated || !user) {
    return <p>No autenticado</p>;
  }

  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
    </div>
  );
}

/**
 * Ejemplo 3: Botón de Logout
 */
export function LogoutExample() {
  const { logout, isInitializing } = useAuth();

  return (
    <button
      onClick={() => logout()}
      disabled={isInitializing}
    >
      {isInitializing ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  );
}

/**
 * Ejemplo 4: Proteger rutas basado en rol
 */
export function RoleBasedExample() {
  const { session } = useAuth();
  const user = session?.user;

  const isAdmin = user?.role === 'ADMIN';
  const isPatient = user?.role === 'PATIENT';

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
  const { isInitializing, isAuthenticated } = useAuth();

  if (isInitializing) {
    return <div>Restaurando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <div>Inicia sesión para continuar</div>;
  }

  return <div>Contenido protegido</div>;
}
