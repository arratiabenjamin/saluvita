export type Professional = {
  id: string;
  name: string;
  specialty: string;
  center: string;
  address: string;
  city: string;
  contact: string;
  nextAppointment?: string;
  lastAttention?: string;
};

export const professionals: Professional[] = [
  {
    id: 'pro-1',
    name: 'Dra. Javiera Molina',
    specialty: 'Cardiologia',
    center: 'Clinica Central',
    address: 'Av. Providencia 2450, Piso 2',
    city: 'Providencia',
    contact: '+56 2 2456 8890',
    nextAppointment: 'Martes 30 Abr · 10:30',
    lastAttention: 'Control de seguimiento · 12 Abr',
  },
  {
    id: 'pro-2',
    name: 'Dr. Tomas Herrera',
    specialty: 'Medicina interna',
    center: 'Centro Medico Norte',
    address: 'Los Alerces 1880, Box 14',
    city: 'Las Condes',
    contact: '+56 2 2678 1104',
    nextAppointment: 'Jueves 02 May · 15:00',
    lastAttention: 'Revision de resultados · 24 Abr',
  },
  {
    id: 'pro-3',
    name: 'Equipo Laboratorio Vida',
    specialty: 'Laboratorio clinico',
    center: 'Laboratorio Vida',
    address: 'Av. Apoquindo 3120, Nivel 1',
    city: 'Las Condes',
    contact: '+56 2 2987 4410',
    nextAppointment: 'Miercoles 01 May · 09:00',
    lastAttention: 'Toma de muestras · 18 Abr',
  },
  {
    id: 'pro-4',
    name: 'Unidad de Imagenes Clinica Central',
    specialty: 'Diagnostico por imagen',
    center: 'Clinica Central',
    address: 'Av. Providencia 2450, Subsuelo 1',
    city: 'Providencia',
    contact: '+56 2 2456 8820',
    nextAppointment: 'Viernes 10 May · 17:00',
    lastAttention: 'Ecografia abdominal · pendiente',
  },
];
