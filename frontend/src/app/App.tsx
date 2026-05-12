import { QueryProvider } from '@/app/providers/query-provider';
import { AuthProvider } from '@/app/providers/auth-provider';
import { PatientProfileProvider } from '@/app/providers/patient-profile-provider';
import { AppRouter } from '@/app/router';

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <PatientProfileProvider>
          <AppRouter />
        </PatientProfileProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
