import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/app/router/protected-route';
import { LoginPage } from '@/modules/auth/pages/login-page';
import { ModulePlaceholderPage } from '@/modules/common/pages/module-placeholder-page';
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page';
import { PatientsPage } from '@/modules/patients/pages/patients-page';
import { NewPatientPage } from '@/modules/patients/pages/new-patient-page';
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
        element: (
          <ModulePlaceholderPage
            title="Citas"
            description="Dejamos este espacio listo dentro del layout principal para incorporar la gestion de agenda medica en la siguiente etapa."
          />
        ),
      },
      {
        path: routes.professionals,
        element: (
          <ModulePlaceholderPage
            title="Profesionales"
            description="Aqui creceremos con el modulo de profesionales manteniendo la misma experiencia simple y ordenada."
          />
        ),
      },
      {
        path: routes.facilities,
        element: (
          <ModulePlaceholderPage
            title="Centros"
            description="Esta vista sirve como punto de entrada para futuras sedes, clinicas y lugares de atencion."
          />
        ),
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
