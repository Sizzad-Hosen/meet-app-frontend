import type { MeetingRole } from "@/types/meeting";

export type ActiveSession = {
  meetingId: string;
  code: string;
  title: string;
  roomName: string;
  token: string;
  role: MeetingRole;
  allowScreenshare: boolean;
  screenshareNeedsApproval: boolean;
};

export type WaitingSession = Pick<ActiveSession, "code" | "title">;

export type ParticipantAction = "mute" | "kick" | "cohost";
