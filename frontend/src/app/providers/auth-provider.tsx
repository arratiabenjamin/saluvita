import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setAuthSession,
} from '@/shared/lib/storage';
import { authApi } from '@/modules/auth/api/auth-api';
import { AuthContext } from '@/modules/auth/auth-context';
import { AuthContextValue, AuthSession, LoginPayload } from '@/shared/types/auth';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => ({
    accessToken: getStoredAccessToken(),
    refreshToken: getStoredRefreshToken(),
    user: getStoredUser(),
  }));
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const initialAccessToken = getStoredAccessToken();
      const initialRefreshToken = getStoredRefreshToken();

      if (!initialAccessToken && !initialRefreshToken) {
        setSession(null);
        setIsInitializing(false);
        return;
      }

      try {
        const user = await authApi.me();

        if (!user) {
          clearAuthSession();
          setSession(null);
          return;
        }

        const accessToken = getStoredAccessToken();
        const refreshToken = getStoredRefreshToken();

        if (!accessToken) {
          clearAuthSession();
          setSession(null);
          return;
        }

        const nextSession: AuthSession = { accessToken, refreshToken, user };
        setSession(nextSession);
        setAuthSession(nextSession);
      } catch {
        clearAuthSession();
        setSession(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isInitializing,
      login: async (payload: LoginPayload) => {
        const nextSession = await authApi.login(payload);
        setAuthSession(nextSession);
        setSession(nextSession);
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          clearAuthSession();
          setSession(null);
        }
      },
    }),
    [isInitializing, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
