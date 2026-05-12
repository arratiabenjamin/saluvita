import { createContext } from 'react';
import { PatientProfile, PatientRelation } from '@/modules/patient-profiles/data';

export type CreatePatientProfileInput = {
  name: string;
  relation: PatientRelation;
  age?: number | null;
};

export type PatientProfileContextValue = {
  profiles: PatientProfile[];
  activeProfile: PatientProfile;
  activeProfileId: string;
  setActiveProfileId: (profileId: string) => void;
  addProfile: (profile: CreatePatientProfileInput) => void;
};

export const PatientProfileContext = createContext<PatientProfileContextValue | undefined>(
  undefined,
);
