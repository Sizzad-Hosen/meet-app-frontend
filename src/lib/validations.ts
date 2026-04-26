import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = emailSchema.extend({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2, "Meeting title is required"),
  type: z.enum(["instant", "scheduled"]),
  max_participants: z.number().int().min(2).max(500),
  scheduled_at: z.string().optional(),
  waiting_room_on: z.boolean(),
  allow_screenshare: z.boolean(),
  screenshare_needs_approval: z.boolean(),
  is_recorded: z.boolean(),
});

export const joinMeetingSchema = z.object({
  joinCode: z.string().trim().min(4).max(12),
});

export const createPollSchema = z.object({
  question: z.string().trim().min(1),
  optionA: z.string().trim().min(1),
  optionB: z.string().trim().min(1),
  optionC: z.string().trim().optional(),
});

export const breakoutSchema = z.object({
  name: z.string().trim().min(1),
  participantIds: z.string().optional(),
});

export const broadcastSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});
