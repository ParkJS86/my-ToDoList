export type Role = 'Member' | 'Admin';

export interface User {
  userId: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
}
