import { Card } from '@/shared/ui/card';

export function HealthSummarySection() {
  return (
    <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Resumen de salud</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-main">
            Estado general
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          Estable
        </span>
      </div>

      <div className="mt-6 rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fffb_0%,#ffffff_100%)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M12 21c-4.97-3.44-8-6.77-8-10.5A4.5 4.5 0 0 1 8.5 6c1.61 0 2.74.77 3.5 1.9C12.76 6.77 13.89 6 15.5 6A4.5 4.5 0 0 1 20 10.5C20 14.23 16.97 17.56 12 21Z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-text-main">Sin alertas inmediatas</p>
            <p className="mt-1 text-sm text-text-muted">
              Tus ultimos controles se ven estables y con buen seguimiento.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Proximo control
            </p>
            <p className="mt-2 text-base font-semibold text-text-main">
              24 Jun · Medicina Interna
            </p>
          </div>
          <div className="rounded-[22px] bg-rose-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
              Observacion
            </p>
            <p className="mt-2 text-base font-semibold text-text-main">
              Mantener seguimiento cardiologico
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
