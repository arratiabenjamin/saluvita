import { z } from 'zod';

export const patientFormSchema = z.object({
  firstName: z.string().min(2, 'Ingresa el nombre'),
  lastName: z.string().min(2, 'Ingresa el apellido'),
  document: z.string().min(5, 'Ingresa un documento valido'),
  email: z.string().email('Ingresa un correo valido'),
  phone: z.string().min(7, 'Ingresa un telefono valido'),
  relationshipLabel: z.string().optional(),
  birthDate: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
