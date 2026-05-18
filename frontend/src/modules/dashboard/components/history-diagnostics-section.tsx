import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

type DiagnosticItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  doctorName: string | null;
  specialty: string | null;
};

type HistoryDiagnosticsSectionProps = {
  items?: DiagnosticItem[];
  isLoading?: boolean;
};

function formatDiagnosticDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function HistoryDiagnosticsSection({
  items = [],
  isLoading,
}: HistoryDiagnosticsSectionProps) {
  return (
    <Card className="border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Historial y diagnosticos
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-main">
            Registros recientes
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-text-muted">
          {isLoading ? 'Cargando' : items.length === 0 ? 'Sin registros' : `Ultimos ${items.length}`}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-text-muted">Cargando historial...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-muted">Sin registros clinicos recientes.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M8 3h8l1 4H7z" />
                    <path d="M8 8h8v13H8z" />
                    <path d="M10 12h4M10 16h4" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-text-main">
                        {item.title}
                      </p>
                      {item.doctorName && (
                        <p className="mt-0.5 text-xs font-medium text-text-muted">
                          {item.doctorName}
                          {item.specialty ? ` · ${item.specialty}` : ''}
                        </p>
                      )}
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                      {formatDiagnosticDate(item.date)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Button variant="secondary" className="min-h-11 px-5">
                      Ver diagnostico
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
