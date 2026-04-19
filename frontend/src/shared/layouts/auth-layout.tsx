import { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,197,187,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(79,169,157,0.08),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-dark shadow-sm ring-1 ring-slate-200">
              BMB Plataforma de Gestion Clinica
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl">
              Una entrada simple y tranquila para tu agenda medica
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-text-muted">
              Pensada para pacientes, cuidadores y familias que necesitan una
              experiencia clara, cercana y facil de usar.
            </p>
          </div>
          <div className="flex items-center justify-center">{children}</div>
        </section>
      </div>
    </main>
  );
}
