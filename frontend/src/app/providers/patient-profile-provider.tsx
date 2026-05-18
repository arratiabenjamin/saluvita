import { ReactNode, useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { PatientProfile } from '@/modules/patient-profiles/data';
import {
  CreatePatientProfileInput,
  PatientProfileContext,
} from '@/modules/patient-profiles/patient-profile-context';

type PatientProfileProviderProps = {
  children: ReactNode;
};

const fallbackProfile: PatientProfile = {
  id: 'pending-user',
  name: 'Mi perfil',
  relation: 'Yo',
  age: null,
  avatarInitial: 'M',
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'P';
}

function buildProfileFromAuth(user: ReturnType<typeof useAuth>['session'] extends infer S
  ? S extends { user: infer U } ? U : null
  : null): PatientProfile {
  if (!user || !user.patientId) {
    return fallbackProfile;
  }
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return {
    id: user.patientId,
    name: fullName || 'Mi perfil',
    relation: 'Yo',
    age: null,
    avatarInitial: getInitial(user.firstName || fullName),
  };
}

export function PatientProfileProvider({ children }: PatientProfileProviderProps) {
  const { session } = useAuth();
  const activeProfile = useMemo(
    () => buildProfileFromAuth(session?.user ?? null),
    [session?.user],
  );
  const profiles = useMemo(() => [activeProfile], [activeProfile]);

  const value = useMemo(
    () => ({
      profiles,
      activeProfile,
      activeProfileId: activeProfile.id,
      setActiveProfileId: () => {
        // multi-patient not implemented yet — single user = single patient profile
      },
      addProfile: (_: CreatePatientProfileInput) => {
        // requires backend create dependent flow — not wired in this slice
      },
    }),
    [profiles, activeProfile],
  );

  return <PatientProfileContext.Provider value={value}>{children}</PatientProfileContext.Provider>;
}
