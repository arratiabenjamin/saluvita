import { apiClient } from '@/shared/lib/axios';
import { AuthSession, LoginPayload, User } from '@/shared/types/auth';

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: User;
};

const demoUser: User = {
  id: 'demo-user',
  firstName: 'Beatriz',
  lastName: 'Molina',
  email: 'demo@bmbsalud.cl',
  role: 'CAREGIVER',
};

const DEMO_CREDENTIALS = {
  email: 'demo@bmbsalud.cl',
  password: '123456',
};

const mockEnabled = import.meta.env.VITE_ENABLE_AUTH_MOCK !== 'false';

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
        user: data.user,
      };
    } catch {
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

      throw new Error('LOGIN_FAILED');
    }
  },
  async me(): Promise<User | null> {
    try {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    } catch {
      if (mockEnabled) {
        return demoUser;
      }

      return null;
    }
  },
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      return null;
    }
  },
};
