import { apiClient } from '@/shared/lib/axios';
import { getStoredRefreshToken } from '@/shared/lib/storage';
import { AuthSession, LoginPayload, RegisterPayload, User, UserRole } from '@/shared/types/auth';

type BackendUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status?: string;
  roles?: string[];
  role?: string;
  patientId?: string | null;
};

type BackendAuthData = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  user: BackendUser;
};

type ApiEnvelope<T> = { data: T } | T;

const demoUser: User = {
  id: 'demo-user',
  firstName: 'Beatriz',
  lastName: 'Molina',
  email: 'demo@bmbsalud.cl',
  role: 'CAREGIVER',
  patientId: null,
};

const DEMO_CREDENTIALS = {
  email: 'demo@bmbsalud.cl',
  password: '123456',
};

const mockEnabled = import.meta.env.VITE_ENABLE_AUTH_MOCK !== 'false';

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function pickRole(backendUser: BackendUser): UserRole {
  const candidate =
    backendUser.role ??
    (Array.isArray(backendUser.roles) && backendUser.roles.length > 0
      ? backendUser.roles[0]
      : undefined);

  if (candidate === 'ADMIN' || candidate === 'CAREGIVER' || candidate === 'PATIENT') {
    return candidate;
  }
  return 'PATIENT';
}

function mapUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    role: pickRole(backendUser),
    patientId: backendUser.patientId ?? null,
  };
}

function mapAuthSession(body: BackendAuthData): AuthSession {
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken ?? null,
    user: mapUser(body.user),
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    try {
      const response = await apiClient.post<ApiEnvelope<BackendAuthData>>(
        '/auth/login',
        payload,
      );
      const body = unwrap(response.data);

      if (!body?.accessToken || !body?.user) {
        throw new Error('LOGIN_INVALID_RESPONSE');
      }

      return mapAuthSession(body);
    } catch (error) {
      if (
        mockEnabled &&
        payload.email === DEMO_CREDENTIALS.email &&
        payload.password === DEMO_CREDENTIALS.password
      ) {
        return {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          user: demoUser,
        };
      }

      throw error instanceof Error ? error : new Error('LOGIN_FAILED');
    }
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const response = await apiClient.post<ApiEnvelope<BackendAuthData>>(
      '/auth/refresh',
      { refreshToken },
      { skipAuthRefresh: true } as never,
    );
    const body = unwrap(response.data);

    if (!body?.accessToken || !body?.user) {
      throw new Error('REFRESH_INVALID_RESPONSE');
    }

    return mapAuthSession(body);
  },

  async me(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiEnvelope<BackendUser>>('/auth/me');
      const body = unwrap(response.data);

      if (!body?.id) {
        throw new Error('ME_INVALID_RESPONSE');
      }

      return mapUser(body);
    } catch {
      if (mockEnabled) {
        return demoUser;
      }

      return null;
    }
  },

  async register(payload: RegisterPayload): Promise<void> {
    await apiClient.post('/auth/register', payload);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  async logout() {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken || refreshToken === 'demo-refresh-token') {
      return null;
    }

    try {
      await apiClient.post(
        '/auth/logout',
        { refreshToken },
        { skipAuthRefresh: true } as never,
      );
    } catch {
      return null;
    }

    return null;
  },
};
