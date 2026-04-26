"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  CalendarClock,
  Copy,
  DoorOpen,
  LogOut,
  Mic,
  MonitorUp,
  Radio,
  Share2,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { createMeetingSchema, joinMeetingSchema } from "@/lib/validations";
import { useAppSelector } from "@/redux/hook";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import {
  useCreateMeetingMutation,
  useJoinMeetingMutation,
} from "@/redux/features/Meeting/meetingApi";

type CreateMeetingFormValues = z.infer<typeof createMeetingSchema>;
type JoinMeetingFormValues = z.infer<typeof joinMeetingSchema>;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const featureCards = [
  {
    title: "Waiting room",
    description: "List, admit, deny, kick, mute, and assign co-host users.",
    icon: Users,
    status: "RTK ready",
  },
  {
    title: "Breakout rooms",
    description: "Create rooms, join rooms, broadcast, and end all rooms.",
    icon: DoorOpen,
    status: "RTK ready",
  },
  {
    title: "Polls",
    description: "Create polls, vote, view results, and close active polls.",
    icon: Radio,
    status: "RTK ready",
  },
  {
    title: "Screen share",
    description: "Start, stop, approve, deny, and read share status.",
    icon: MonitorUp,
    status: "RTK ready",
  },
  {
    title: "Recordings",
    description: "Start, stop, list, download, and delete recordings.",
    icon: Video,
    status: "RTK ready",
  },
  {
    title: "LiveKit",
    description: "Request media-room access tokens with the join code.",
    icon: ShieldCheck,
    status: "RTK ready",
  },
];

export default function Home() {
  const router = useRouter();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const [createMeeting, createState] = useCreateMeetingMutation();
  const [joinMeeting, joinState] = useJoinMeetingMutation();
  const [logout] = useLogoutMutation();
  const [message, setMessage] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const createdMeetingLink =
    typeof window !== "undefined" && createdCode
      ? `${window.location.origin}/meetings/${createdCode}`
      : "";
  const createForm = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: "",
      type: "instant",
      max_participants: 100,
      scheduled_at: "",
      waiting_room_on: true,
      allow_screenshare: true,
      screenshare_needs_approval: false,
      is_recorded: false,
    },
  });
  const joinForm = useForm<JoinMeetingFormValues>({
    resolver: zodResolver(joinMeetingSchema),
  });

  async function handleCreateMeeting(values: CreateMeetingFormValues) {
    setMessage("");
    setCreatedCode("");

    try {
      const result = await createMeeting({
        ...values,
        scheduled_at: values.scheduled_at || undefined,
      }).unwrap();

      const code =
        result.data.meeting.join_code ??
          result.data.meeting.joinCode ??
          result.data.meeting.code ??
          "";
      setCreatedCode(code);
      setMessage(code ? "Meeting created. Share the code or link with participants." : result.message);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleJoinMeeting(values: JoinMeetingFormValues) {
    setMessage("");

    try {
      const result = await joinMeeting(values).unwrap();
      setMessage(result.message);
      router.push(`/meetings/${values.joinCode}`);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleCopyCreatedCode() {
    if (!createdCode) {
      return;
    }

    await navigator.clipboard.writeText(createdCode);
    setMessage("Meeting code copied.");
  }

  async function handleCopyCreatedLink() {
    if (!createdMeetingLink) {
      return;
    }

    await navigator.clipboard.writeText(createdMeetingLink);
    setMessage("Meeting link copied.");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
              <Video className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Meet Apps</p>
              <h1 className="text-xl font-semibold text-slate-950">
                Meeting command center
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={accessToken ? "success" : "warning"}>
              {accessToken ? "Authenticated" : "Login required"}
            </Badge>
            {user?.email ? (
              <span className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                {user.email}
              </span>
            ) : null}
            {accessToken ? (
              <Button size="sm" variant="outline" onClick={() => logout()}>
                <LogOut className="size-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  href="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section className="flex flex-col gap-6">
            <Card className="overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">Start a meeting</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a room, copy the invite, then admit guests from the waiting room.
                    </p>
                  </div>
                  <Badge variant="success">Host ready</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <form className="space-y-4" onSubmit={createForm.handleSubmit(handleCreateMeeting)}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Meeting title" {...createForm.register("title")} />
                    <Input
                      min={2}
                      placeholder="Max participants"
                      type="number"
                      {...createForm.register("max_participants", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      {...createForm.register("type")}
                    >
                      <option value="instant">Instant</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <Input type="datetime-local" {...createForm.register("scheduled_at")} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["waiting_room_on", "Waiting room", true],
                      ["allow_screenshare", "Allow screen share", true],
                      ["screenshare_needs_approval", "Require share approval", false],
                      ["is_recorded", "Record meeting", false],
                    ].map(([name, label, checked]) => (
                      <label
                        className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        key={String(name)}
                      >
                        <input
                          className="size-4 accent-cyan-600"
                          defaultChecked={Boolean(checked)}
                          type="checkbox"
                          {...createForm.register(String(name) as keyof CreateMeetingFormValues)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <Button disabled={!accessToken || createState.isLoading} type="submit">
                    <CalendarClock className="size-4" />
                    {createState.isLoading ? "Creating..." : "Create meeting"}
                  </Button>
                </form>
                {createdCode ? (
                  <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                    <p className="text-sm font-semibold text-cyan-950">Meeting is ready</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Code</p>
                        <p className="font-mono text-2xl font-semibold text-slate-950">{createdCode}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={handleCopyCreatedCode}>
                          <Copy className="size-4" />
                          Copy code
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCopyCreatedLink}>
                          <Share2 className="size-4" />
                          Copy link
                        </Button>
                        <Button type="button" onClick={() => router.push(`/meetings/${createdCode}`)}>
                          Enter room
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 truncate rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                      {createdMeetingLink}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Join meeting</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <form
                  className="grid gap-3 sm:grid-cols-[1fr_auto]"
                  onSubmit={joinForm.handleSubmit(handleJoinMeeting)}
                >
                  <Input placeholder="ABCD1234" {...joinForm.register("joinCode")} />
                  <Button disabled={!accessToken || joinState.isLoading} type="submit">
                    <DoorOpen className="size-4" />
                    {joinState.isLoading ? "Joining..." : "Join"}
                  </Button>
                </form>
                {message ? (
                  <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {message}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <aside className="grid content-start gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Feature API map</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-1">
                {featureCards.map((feature) => (
                  <div
                    className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    key={feature.title}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-cyan-50 text-cyan-700">
                      <feature.icon className="size-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950">
                          {feature.title}
                        </p>
                        <Badge variant="success">{feature.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {API_BASE_URL}
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Mic className="size-4 text-cyan-700" />
                  <p>Access token is sent as Authorization: Bearer token.</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
