import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/app/router/protected-route';
import { LoginPage } from '@/modules/auth/pages/login-page';
import { RegisterPage } from '@/modules/auth/pages/register-page';
import { ForgotPasswordPage } from '@/modules/auth/pages/forgot-password-page';
import { ResetPasswordPage } from '@/modules/auth/pages/reset-password-page';
import { AppointmentsPage } from '@/modules/appointments/pages/appointments-page';
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page';
import { PatientsPage } from '@/modules/patients/pages/patients-page';
import { NewPatientPage } from '@/modules/patients/pages/new-patient-page';
import { ProfessionalsPage } from '@/modules/professionals/pages/professionals-page';
import { SchedulesPage } from '@/modules/schedules/pages/schedules-page';
import { RemindersPage } from '@/modules/reminders/pages/reminders-page';
import { routes } from '@/shared/constants/routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={routes.dashboard} replace />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.register,
    element: <RegisterPage />,
  },
  {
    path: routes.forgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: routes.resetPassword,
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: routes.dashboard,
        element: <DashboardPage />,
      },
      {
        path: routes.patients,
        element: <PatientsPage />,
      },
      {
        path: routes.newPatient,
        element: <NewPatientPage />,
      },
      {
        path: routes.appointments,
        element: <AppointmentsPage />,
      },
      {
        path: routes.professionals,
        element: <ProfessionalsPage />,
      },
      {
        path: routes.schedules,
        element: <SchedulesPage />,
      },
      {
        path: routes.reminders,
        element: <RemindersPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={routes.dashboard} replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
