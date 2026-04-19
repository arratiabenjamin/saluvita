import { createContext } from 'react';
import { AuthContextValue } from '@/shared/types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
