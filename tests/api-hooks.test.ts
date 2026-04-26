import { describe, expect, it } from "vitest";
import { baseApi } from "../src/redux/api/baseApi";
import "../src/redux/features/Meeting/meetingApi";
import "../src/redux/features/auth/authApi";
import "../src/redux/features/breakout/breakoutApi";
import "../src/redux/features/livekit/livekitApi";
import "../src/redux/features/poll/pollApi";
import "../src/redux/features/recording/recordingApi";
import "../src/redux/features/screenShare/screenShareApi";
import {
  createMeetingSchema,
  createPollSchema,
  loginSchema,
  registerSchema,
} from "../src/lib/validations";

describe("frontend API hooks", () => {
  it("registers all documented RTK Query endpoints", () => {
    expect(Object.keys(baseApi.endpoints).sort()).toEqual(
      expect.arrayContaining([
        "register",
        "login",
        "sendVerificationEmail",
        "verifyEmail",
        "forgotPassword",
        "resetPassword",
        "refreshToken",
        "logout",
        "createMeeting",
        "joinMeeting",
        "getWaitingRoom",
        "admitParticipant",
        "admitAll",
        "getParticipants",
        "createBreakouts",
        "getBreakouts",
        "broadcastBreakout",
        "createPoll",
        "getPolls",
        "submitVote",
        "getScreenShareStatus",
        "startScreenShare",
        "stopScreenShare",
        "startRecording",
        "stopRecording",
        "getRecordings",
        "getLiveKitToken",
      ]),
    );
  });
});

describe("form validation", () => {
  it("accepts valid auth payloads", () => {
    expect(registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "strongpassword",
    }).success).toBe(true);

    expect(loginSchema.safeParse({
      email: "john@example.com",
      password: "strongpassword",
    }).success).toBe(true);
  });

  it("accepts valid meeting and poll payloads", () => {
    expect(createMeetingSchema.safeParse({
      title: "Weekly Sync",
      type: "instant",
      max_participants: 100,
      waiting_room_on: true,
      allow_screenshare: true,
      screenshare_needs_approval: false,
      is_recorded: false,
    }).success).toBe(true);

    expect(createPollSchema.safeParse({
      question: "Which goal?",
      optionA: "Performance",
      optionB: "UX",
    }).success).toBe(true);
  });
});
