export type UserRole = 'PARENT' | 'STUDENT';

export interface AppUser {
  uid: string;
  phone: string;
  role: UserRole;
  createdAt: unknown;
}
