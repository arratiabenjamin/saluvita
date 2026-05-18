import { HealthSummarySection } from '@/modules/dashboard/components/health-summary-section';
import { HistoryDiagnosticsSection } from '@/modules/dashboard/components/history-diagnostics-section';
import { NewAppointmentSection } from '@/modules/dashboard/components/new-appointment-section';
import { UpcomingAppointmentsSection } from '@/modules/dashboard/components/upcoming-appointments-section';
import { useDashboardOverview } from '@/modules/dashboard/hooks/use-dashboard-overview';
import { Card } from '@/shared/ui/card';

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardOverview();
  const payload = data?.data;
  const quickSummary = payload?.quickSummary;
  const upcomingAppointments = payload?.upcomingAppointments ?? [];
  const recentDiagnostics = payload?.recentDiagnostics ?? [];
  const healthSummary = payload?.healthSummary;

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="relative overflow-hidden rounded-[38px] bg-[linear-gradient(135deg,#3b82f6_0%,#2563eb_58%,#4f46e5_100%)] p-6 text-white shadow-[0_28px_70px_rgba(37,99,235,0.25)] sm:p-8 lg:p-10">
        <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-20 h-28 w-28 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute left-1/3 top-6 h-16 w-16 rounded-full bg-rose-200/20 blur-2xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
                Dashboard clinico
              </span>
              <span className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-blue-100 ring-1 ring-white/15">
                Uso diario
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-5xl">
              Tu espacio medico personal, claro y listo para usar
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-blue-50/95 sm:text-lg">
              Revisa proximas citas, historial clinico, agenda una nueva atencion y
              consulta tu estado general desde una sola vista.
            </p>
          </div>

          <Card className="border-white/20 bg-white/12 p-4 text-white shadow-[0_24px_55px_rgba(15,23,42,0.2)] backdrop-blur-md">
            <div className="rounded-[28px] bg-white p-5 text-text-main shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  Resumen rapido
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M8 2v4M16 2v4M3 10h18" />
                    <rect x="3" y="4" width="18" height="17" rx="3" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </span>
              </div>

              {isLoading ? (
                <p className="mt-5 text-sm text-text-muted">Cargando dashboard...</p>
              ) : isError ? (
                <p className="mt-5 text-sm text-text-muted">Error al cargar dashboard</p>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                      Citas
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text-main">
                      {quickSummary?.upcomingAppointmentsCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                      Estado
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text-main">
                      {quickSummary?.overallStatus ?? 'OK'}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-rose-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                      Avisos
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text-main">
                      {quickSummary?.alertsCount ?? 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          {isError ? (
            <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
              <p className="text-sm text-text-muted">Error al cargar dashboard</p>
            </Card>
          ) : (
            <UpcomingAppointmentsSection
              isLoading={isLoading}
              isEmpty={!isLoading && (quickSummary?.upcomingAppointmentsCount ?? 0) === 0}
              appointments={upcomingAppointments}
            />
          )}

          <HistoryDiagnosticsSection items={recentDiagnostics} isLoading={isLoading} />
        </div>

        <div className="space-y-6">
          <NewAppointmentSection />
          <HealthSummarySection summary={healthSummary} />
        </div>
      </section>
    </div>
  );
}
