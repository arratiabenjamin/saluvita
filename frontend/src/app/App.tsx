import { QueryProvider } from '@/app/providers/query-provider';
import { AuthProvider } from '@/app/providers/auth-provider';
import { AppRouter } from '@/app/router';

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  );
}
