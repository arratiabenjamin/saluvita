export type PatientRelation = 'Yo' | 'Hijo/a' | 'Madre' | 'Padre' | 'Otro';

export type PatientProfile = {
  id: string;
  name: string;
  relation: PatientRelation;
  age?: number | null;
  avatarInitial: string;
};

