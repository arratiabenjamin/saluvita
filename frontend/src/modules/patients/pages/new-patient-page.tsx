import { PatientForm } from '@/modules/patients/components/patient-form';
import { PageHeader } from '@/shared/components/page-header';

export function NewPatientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo paciente"
        description="Formulario inicial preparado para una carga simple, clara y con validaciones basicas."
      />
      <PatientForm />
    </div>
  );
}
