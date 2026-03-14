export interface User {
  id: string;
  name: string;
  email: string;
  type?: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
