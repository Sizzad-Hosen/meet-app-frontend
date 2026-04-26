export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  createdAt?: string;
};

export type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
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

export type ForgotPasswordRequest = {
  email: string;
};

export type SendVerificationEmailRequest = {
  email: string;
};

export type VerifyEmailRequest = {
  token: string;
};

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
};

export type Meeting = {
  id: string;
  title: string;
  joinCode?: string;
  code?: string;
  join_code?: string;
  type: "instant" | "scheduled";
  hostId?: string;
  host_id?: string;
  livekit_room_name?: string;
  max_participants?: number;
  waiting_room_on?: boolean;
  allow_screenshare?: boolean;
  screenshare_needs_approval?: boolean;
  is_recorded?: boolean;
  status?: string;
  scheduled_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
};

export type CreateMeetingResponse = {
  meeting: Meeting;
  livekitToken?: string;
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

export type JoinMeetingResponse = {
  meeting: Meeting;
  participant: MeetingParticipant;
  livekitToken: string | null;
};

export type UpdateMeetingRequest = Partial<
  Omit<CreateMeetingRequest, "type" | "scheduled_at">
> & {
  scheduled_at?: string | null;
};

export type MeetingParticipant = {
  id: string;
  user?: Pick<AuthUser, "id" | "name" | "email" | "avatarUrl">;
  userId?: string;
  user_id?: string;
  meetingId?: string;
  meeting_id?: string;
  name?: string;
  email?: string;
  role?: "host" | "cohost" | "participant" | string;
  status?: "waiting" | "admitted" | "denied" | string;
  isMuted?: boolean;
  is_muted?: boolean;
  livekit_token?: string | null;
  joinedAt?: string;
  joined_at?: string | null;
};

export type CreateBreakoutRequest = {
  rooms?: Array<{
    name?: string;
    participantIds?: string[];
  }>;
};

export type BroadcastBreakoutRequest = {
  message: string;
};

export type BreakoutRoom = {
  id: string;
  name: string;
  meetingId?: string;
  meeting_id?: string;
  status?: string;
  participants?: MeetingParticipant[];
  createdAt?: string;
  created_at?: string;
};

export type BreakoutCreateResponse = {
  rooms: BreakoutRoom[];
  assignments: Array<{
    participantId: string;
    roomId: string;
  }>;
};

export type BreakoutListResponse = {
  rooms: BreakoutRoom[];
  myAssignment: {
    roomId: string;
    roomName: string;
  } | null;
};

export type CreatePollRequest = {
  question: string;
  options: string[];
};

export type SubmitVoteRequest = {
  optionId: string;
};

export type PollOption = {
  id: string;
  text?: string;
  option?: string;
  votes?: number;
  voteCount?: number;
  percent?: number;
  selected?: boolean;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  isClosed?: boolean;
  is_closed?: boolean;
  totalVotes?: number;
  myVoteOptionId?: string | null;
  createdAt?: string;
  created_at?: string;
};

export type PollResult = {
  pollId: string;
  question?: string;
  options: PollOption[];
  results?: PollOption[];
  totalVotes?: number;
  myVoteOptionId?: string | null;
};

export type ScreenShareStatus = {
  active?: boolean;
  isSharing?: boolean;
  userId?: string | null;
  requestedBy?: string | null;
  status?: string;
};

export type Recording = {
  id: string;
  meeting_id?: string;
  meetingId?: string;
  s3_key?: string | null;
  url?: string | null;
  status?: string;
  started_at?: string;
  ended_at?: string | null;
  startedAt?: string;
  stoppedAt?: string | null;
  createdAt?: string;
};
