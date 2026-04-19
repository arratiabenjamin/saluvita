export type UserRole = 'PATIENT' | 'CAREGIVER' | 'ADMIN';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};
