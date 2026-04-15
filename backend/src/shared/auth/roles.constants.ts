export const ROLE_PATIENT = 'PATIENT';
export const ROLE_CAREGIVER = 'CAREGIVER';
export const ROLE_ADMIN = 'ADMIN';

export const ALLOWED_ROLES = [ROLE_PATIENT, ROLE_CAREGIVER, ROLE_ADMIN] as const;
export type AllowedRole = (typeof ALLOWED_ROLES)[number];
