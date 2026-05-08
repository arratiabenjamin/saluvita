export type PatientRelation = 'Yo' | 'Hijo/a' | 'Madre' | 'Padre' | 'Otro';

export type PatientProfile = {
  id: string;
  name: string;
  relation: PatientRelation;
  age?: number | null;
  avatarInitial: string;
};

export const primaryProfileId = 'profile-beatriz';

export const defaultPatientProfiles: PatientProfile[] = [
  {
    id: primaryProfileId,
    name: 'Beatriz Molina',
    relation: 'Yo',
    age: 58,
    avatarInitial: 'B',
  },
  {
    id: 'profile-hijo',
    name: 'Tomás Molina',
    relation: 'Hijo/a',
    age: 17,
    avatarInitial: 'T',
  },
  {
    id: 'profile-mama',
    name: 'Elena Rojas',
    relation: 'Madre',
    age: 79,
    avatarInitial: 'E',
  },
  {
    id: 'profile-adulto-mayor',
    name: 'Raúl Soto',
    relation: 'Otro',
    age: 83,
    avatarInitial: 'R',
  },
];
