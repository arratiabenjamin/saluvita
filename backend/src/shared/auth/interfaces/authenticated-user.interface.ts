export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
  patientId?: string;
}
