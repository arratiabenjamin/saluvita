import { getMedicationSummaryItems } from '@/modules/appointments/data';
import { usePatientProfile } from '@/modules/patient-profiles/hooks/use-patient-profile';
import { Card } from '@/shared/ui/card';

export function MedicationsPage() {
  const { activeProfile } = usePatientProfile();
  const medications = getMedicationSummaryItems(activeProfile.id);

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-600">Medicacion actual</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Medicamentos indicados
          </h1>
          <p className="mt-3 text-base leading-8 text-text-muted">
            Revisa de forma simple los medicamentos registrados para {activeProfile.name}.
          </p>
        </div>
      </section>

      <Card className="border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Listado actual</p>
            <h2 className="mt-2 text-2xl font-bold text-text-main">Tu medicacion registrada</h2>
          </div>
          <p className="text-sm text-text-muted">
            Esta informacion se mantiene sincronizada con las indicaciones medicas guardadas.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {medications.length > 0 ? (
            medications.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-text-main">{item.name}</h3>
                    <p className="text-sm text-text-muted">
                      <span className="font-semibold text-text-main">Dosis:</span> {item.dose}
                    </p>
                    <p className="text-sm text-text-muted">
                      <span className="font-semibold text-text-main">Frecuencia:</span>{' '}
                      {item.frequencyHours}
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-white px-4 py-4">
                    <p className="text-sm text-text-muted">
                      <span className="font-semibold text-text-main">Doctor o profesional:</span>{' '}
                      {item.doctor}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">
                      <span className="font-semibold text-text-main">Fecha de indicacion:</span>{' '}
                      {item.date}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">
                      <span className="font-semibold text-text-main">Cita o examen asociado:</span>{' '}
                      {item.relatedEvent || 'Sin referencia asociada'}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-text-muted">
              Aun no tienes medicamentos registrados.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
