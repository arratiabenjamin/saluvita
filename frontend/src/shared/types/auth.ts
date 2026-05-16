export type UserRole = 'PATIENT' | 'CAREGIVER' | 'ADMIN';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  patientId: string | null;
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

export type DocumentType = 'RUT' | 'DNI' | 'PASSPORT' | 'CEDULA';

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate?: string;
  phone?: string;
};

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};
