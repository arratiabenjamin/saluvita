import { routes } from '@/shared/constants/routes';

export type NavigationIconName =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'professionals'
  | 'schedules';

export const appNavigation = [
  { to: routes.dashboard, label: 'Dashboard', icon: 'dashboard' },
  { to: routes.patients, label: 'Pacientes', icon: 'patients' },
  { to: routes.appointments, label: 'Citas', icon: 'appointments' },
  { to: routes.professionals, label: 'Profesionales', icon: 'professionals' },
  { to: routes.schedules, label: 'Horarios', icon: 'schedules' },
] as const;
