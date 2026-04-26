export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type Meeting = {
  id: string;
  title: string;
  joinCode: string;
  type: "instant" | "scheduled";
  hostId: string;
  max_participants: number;
  waiting_room_on: boolean;
  allow_screenshare: boolean;
  screenshare_needs_approval: boolean;
  is_recorded: boolean;
  scheduled_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateMeetingRequest = {
  title: string;
  type: "instant" | "scheduled";
  max_participants: number;
  waiting_room_on: boolean;
  allow_screenshare: boolean;
  screenshare_needs_approval: boolean;
  is_recorded: boolean;
  scheduled_at?: string;
};

export type JoinMeetingRequest = {
  joinCode: string;
};
