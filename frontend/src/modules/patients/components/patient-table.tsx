import { Patient } from '@/shared/types/patient';
import { Card } from '@/shared/ui/card';

type PatientTableProps = {
  patients: Patient[];
};

export function PatientTable({ patients }: PatientTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[rgba(191,231,225,0.4)] text-left">
              <th className="px-5 py-4 text-sm font-semibold text-text-main">
                Paciente
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-text-main">
                Documento
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-text-main">
                Contacto
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-text-main">
                Relacion
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="border-t border-[rgba(94,123,128,0.12)] bg-white"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-text-main">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {patient.birthDate ?? 'Sin fecha de nacimiento'}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-text-muted">
                  {patient.document}
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-text-main">{patient.email}</p>
                  <p className="mt-1 text-sm text-text-muted">{patient.phone}</p>
                </td>
                <td className="px-5 py-4 text-sm text-text-muted">
                  {patient.relationshipLabel ?? 'Sin relacion'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
