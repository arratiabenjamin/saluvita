import { ReactNode, useMemo, useState } from 'react';
import {
  defaultPatientProfiles,
  PatientProfile,
  primaryProfileId,
} from '@/modules/patient-profiles/data';
import {
  CreatePatientProfileInput,
  PatientProfileContext,
} from '@/modules/patient-profiles/patient-profile-context';

type PatientProfileProviderProps = {
  children: ReactNode;
};

const patientProfilesStorageKey = 'agenda_medica_patient_profiles';
const activePatientProfileStorageKey = 'agenda_medica_active_profile_id';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredProfiles() {
  if (!canUseStorage()) {
    return defaultPatientProfiles;
  }

  try {
    const storedProfiles = window.localStorage.getItem(patientProfilesStorageKey);

    if (!storedProfiles) {
      return defaultPatientProfiles;
    }

    const parsedProfiles = JSON.parse(storedProfiles);

    if (!Array.isArray(parsedProfiles) || parsedProfiles.length === 0) {
      return defaultPatientProfiles;
    }

    return parsedProfiles as PatientProfile[];
  } catch {
    return defaultPatientProfiles;
  }
}

function readStoredActiveProfileId() {
  if (!canUseStorage()) {
    return primaryProfileId;
  }

  return window.localStorage.getItem(activePatientProfileStorageKey) ?? primaryProfileId;
}

function getAvatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'P';
}

export function PatientProfileProvider({ children }: PatientProfileProviderProps) {
  const [profiles, setProfiles] = useState<PatientProfile[]>(() => readStoredProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState(() => readStoredActiveProfileId());

  function persistProfiles(nextProfiles: PatientProfile[]) {
    if (canUseStorage()) {
      window.localStorage.setItem(patientProfilesStorageKey, JSON.stringify(nextProfiles));
    }
  }

  function setActiveProfileId(profileId: string) {
    setActiveProfileIdState(profileId);

    if (canUseStorage()) {
      window.localStorage.setItem(activePatientProfileStorageKey, profileId);
    }
  }

  function addProfile(profile: CreatePatientProfileInput) {
    const nextProfile: PatientProfile = {
      id: `profile-${Date.now()}`,
      name: profile.name.trim(),
      relation: profile.relation,
      age: profile.age ?? null,
      avatarInitial: getAvatarInitial(profile.name),
    };

    setProfiles((current) => {
      const nextProfiles = [...current, nextProfile];
      persistProfiles(nextProfiles);
      return nextProfiles;
    });

    setActiveProfileId(nextProfile.id);
  }

  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ??
    profiles[0] ??
    defaultPatientProfiles[0];

  const value = useMemo(
    () => ({
      profiles,
      activeProfile,
      activeProfileId: activeProfile.id,
      setActiveProfileId,
      addProfile,
    }),
    [activeProfile, profiles],
  );

  return <PatientProfileContext.Provider value={value}>{children}</PatientProfileContext.Provider>;
}
