import type { User } from "@/types/auth";

export type MeetingRole = "host" | "cohost" | "guest";
export type MeetingStatus = "waiting" | "active" | "ended";
export type ParticipantStatus = "waiting" | "admitted" | "denied" | "left";

export type Meeting = {
  id: string;
  title: string;
  join_code: string;
  livekit_room_name: string;
  type: "instant" | "scheduled";
  host_id: string;
  status: MeetingStatus;
  max_participants: number;
  waiting_room_on: boolean;
  allow_screenshare: boolean;
  screenshare_needs_approval: boolean;
  is_recorded: boolean;
  scheduled_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Participant = {
  id: string;
  user_id?: string;
  role: MeetingRole;
  status: ParticipantStatus;
  is_muted?: boolean;
  is_video_off?: boolean;
  user?: User;
};

export type MeetingDetails = Meeting & {
  meetingParticipants: Participant[];
  currentParticipant: Participant | null;
  screenShares?: Array<{
    id: string;
    user_id: string;
    user?: Pick<User, "id" | "name" | "email">;
  }>;
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

export type JoinMeetingRequest = { joinCode: string };

export type CreateMeetingResponse = {
  meeting: Meeting;
  livekitToken: string;
  mediaAvailable: boolean;
};

export type JoinMeetingResponse = {
  meeting: Pick<
    Meeting,
    | "id"
    | "title"
    | "join_code"
    | "livekit_room_name"
    | "waiting_room_on"
    | "allow_screenshare"
    | "screenshare_needs_approval"
    | "status"
  >;
  participant: Participant;
  livekitToken: string | null;
  mediaAvailable: boolean;
};

export type AdmitParticipantResponse = {
  participantId: string;
  userId: string;
  livekitToken: string;
};
