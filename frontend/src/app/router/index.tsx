import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/app/router/protected-route';
import { LoginPage } from '@/modules/auth/pages/login-page';
import { AppointmentsPage } from '@/modules/appointments/pages/appointments-page';
import { FacilitiesPage } from '@/modules/facilities/pages/facilities-page';
import { ModulePlaceholderPage } from '@/modules/common/pages/module-placeholder-page';
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page';
import { PatientsPage } from '@/modules/patients/pages/patients-page';
import { NewPatientPage } from '@/modules/patients/pages/new-patient-page';
import { ProfessionalsPage } from '@/modules/professionals/pages/professionals-page';
import { SchedulesPage } from '@/modules/schedules/pages/schedules-page';
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
        path: routes.facilities,
        element: <FacilitiesPage />,
      },
      {
        path: routes.schedules,
        element: <SchedulesPage />,
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
