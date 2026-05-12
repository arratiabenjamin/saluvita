import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { usePatientProfile } from '@/modules/patient-profiles/hooks/use-patient-profile';
import { PatientRelation } from '@/modules/patient-profiles/data';
import { Button } from '@/shared/ui/button';

type TopbarProps = {
  onMenuClick: () => void;
};

const titles: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Resumen general',
    description: 'Una vista simple para empezar el dia con claridad.',
  },
  '/patients': {
    title: 'Pacientes',
    description: 'Consulta y organiza perfiles clinicos personales y familiares.',
  },
  '/patients/new': {
    title: 'Nuevo paciente',
    description: 'Carga datos basicos de forma simple y guiada.',
  },
  '/appointments': {
    title: 'Citas',
    description: 'Preparamos el espacio base para gestionar agenda y estados.',
  },
  '/professionals': {
    title: 'Profesionales',
    description: 'Consulta doctores, especialidades y centros de atencion en un mismo lugar.',
  },
  '/schedules': {
    title: 'Mi agenda de salud',
    description: 'Organiza tus citas, recordatorios y actividades del dia.',
  },
};

type ProfileFormState = {
  name: string;
  relation: PatientRelation;
  age: string;
};

const defaultProfileForm: ProfileFormState = {
  name: '',
  relation: 'Otro',
  age: '',
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { session, logout } = useAuth();
  const { activeProfile, profiles, setActiveProfileId, addProfile } = usePatientProfile();
  const header = titles[location.pathname] ?? titles['/dashboard'];
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(defaultProfileForm);

  function handleAddProfile() {
    if (!profileForm.name.trim()) {
      return;
    }

    addProfile({
      name: profileForm.name,
      relation: profileForm.relation,
      age: profileForm.age ? Number(profileForm.age) : null,
    });
    setProfileForm(defaultProfileForm);
    setIsAddingProfile(false);
    setIsProfileMenuOpen(false);
  }

  return (
    <header className="relative z-40 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm lg:hidden"
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="rounded-[26px] bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80">
            <p className="text-sm font-semibold text-blue-600">{header.title}</p>
            <p className="mt-1 text-sm text-text-muted">{header.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative z-50">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 rounded-[26px] bg-white px-4 py-3 text-left shadow-[0_12px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition hover:ring-blue-200 lg:min-w-[280px]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">
                  {activeProfile.avatarInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-main">
                    {activeProfile.name}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {activeProfile.relation}
                    {typeof activeProfile.age === 'number' ? ` · ${activeProfile.age} años` : ''}
                  </p>
                </div>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5 text-text-muted"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isProfileMenuOpen ? (
              <div className="absolute right-0 z-[999] mt-3 w-full min-w-[320px] rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_24px_40px_rgba(15,23,42,0.12)]">
                <div>
                  <p className="text-sm font-semibold text-blue-600">Perfil activo</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Cambia rapidamente entre pacientes asociados a esta cuenta.
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setActiveProfileId(profile.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-left transition ${
                        profile.id === activeProfile.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">
                          {profile.avatarInitial}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main">{profile.name}</p>
                          <p className="text-xs text-text-muted">
                            {profile.relation}
                            {typeof profile.age === 'number' ? ` · ${profile.age} años` : ''}
                          </p>
                        </div>
                      </div>
                      {profile.id === activeProfile.id ? (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Activo
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {isAddingProfile ? (
                  <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-text-main">Agregar perfil mock</p>
                    <div className="mt-3 space-y-3">
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                          Nombre
                        </span>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(event) =>
                            setProfileForm((current) => ({ ...current, name: event.target.value }))
                          }
                          className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
                          placeholder="Ej. Camila Molina"
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                            Relacion
                          </span>
                          <select
                            value={profileForm.relation}
                            onChange={(event) =>
                              setProfileForm((current) => ({
                                ...current,
                                relation: event.target.value as PatientRelation,
                              }))
                            }
                            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
                          >
                            <option value="Yo">Yo</option>
                            <option value="Hijo/a">Hijo/a</option>
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </label>

                        <label className="block space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                            Edad
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={profileForm.age}
                            onChange={(event) =>
                              setProfileForm((current) => ({ ...current, age: event.target.value }))
                            }
                            className="min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-text-main outline-none transition focus:border-blue-400"
                            placeholder="Opcional"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-11 px-4"
                        onClick={() => {
                          setIsAddingProfile(false);
                          setProfileForm(defaultProfileForm);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="button" className="min-h-11 px-4" onClick={handleAddProfile}>
                        Guardar perfil
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4 min-h-11 w-full px-4"
                    onClick={() => setIsAddingProfile(true)}
                  >
                    Agregar perfil
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[26px] bg-white px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 sm:justify-start">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">
              {session?.user?.firstName?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-main">
                {session?.user
                  ? `${session.user.firstName} ${session.user.lastName}`
                  : 'Usuario'}
              </p>
              <p className="truncate text-xs text-text-muted">
                {session?.user?.email ?? 'Sin correo'}
              </p>
            </div>
            <Button variant="ghost" className="border-white bg-background px-4" onClick={() => void logout()}>
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
