export type SafeUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type AuthResponse = {
  user: SafeUser;
};
