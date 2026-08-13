import type { Participant } from "@/types/meeting";
import type { User } from "@/types/auth";

export type LiveKitTokenResponse = {
  roomName: string;
  token: string;
  participant: Pick<Participant, "role" | "status">;
};

export type ScreenShareRequest = {
  id: string;
  user_id: string;
  user?: Pick<User, "id" | "name" | "email">;
};

export type ScreenShareStatus = {
  total_sharing: number;
  participant: ScreenShareRequest | null;
  pending: ScreenShareRequest[];
};

export type StartScreenShareResponse =
  | { status: "pending_approval"; activeShare: ScreenShareRequest | null }
  | Participant;

export type Recording = {
  id: string;
  meeting_id: string;
  egress_id: string;
  s3_key?: string | null;
  status: "recording" | "completed" | "failed";
  duration_seconds?: number | null;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
};
