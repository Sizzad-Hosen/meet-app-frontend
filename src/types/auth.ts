export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  name: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
