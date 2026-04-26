"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarClock,
  DoorOpen,
  LogOut,
  Mic,
  MonitorUp,
  Radio,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAppSelector } from "@/redux/hook";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import {
  useCreateMeetingMutation,
  useJoinMeetingMutation,
} from "@/redux/features/Meeting/meetingApi";

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
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const [createMeeting, createState] = useCreateMeetingMutation();
  const [joinMeeting, joinState] = useJoinMeetingMutation();
  const [logout] = useLogoutMutation();
  const [message, setMessage] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  async function handleCreateMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setCreatedCode("");

    const form = new FormData(event.currentTarget);

    try {
      const result = await createMeeting({
        title: String(form.get("title")),
        type: String(form.get("type")) as "instant" | "scheduled",
        max_participants: Number(form.get("max_participants") || 100),
        waiting_room_on: form.get("waiting_room_on") === "on",
        allow_screenshare: form.get("allow_screenshare") === "on",
        screenshare_needs_approval:
          form.get("screenshare_needs_approval") === "on",
        is_recorded: form.get("is_recorded") === "on",
        scheduled_at: String(form.get("scheduled_at") || "") || undefined,
      }).unwrap();

      setCreatedCode(result.data.joinCode ?? result.data.code ?? "");
      setMessage(result.message);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleJoinMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      const result = await joinMeeting({
        joinCode: String(form.get("joinCode")),
      }).unwrap();
      setMessage(result.message);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdfa_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
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

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Start a meeting</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Calls `POST /api/v1/meetings/create`.
                    </p>
                  </div>
                  <Badge>Protected API</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <form className="space-y-4" onSubmit={handleCreateMeeting}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="title" placeholder="Meeting title" required />
                    <Input
                      min={2}
                      name="max_participants"
                      placeholder="Max participants"
                      type="number"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      name="type"
                    >
                      <option value="instant">Instant</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <Input name="scheduled_at" type="datetime-local" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["waiting_room_on", "Waiting room"],
                      ["allow_screenshare", "Allow screen share"],
                      ["screenshare_needs_approval", "Require share approval"],
                      ["is_recorded", "Record meeting"],
                    ].map(([name, label]) => (
                      <label
                        className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        key={name}
                      >
                        <input
                          className="size-4 accent-cyan-600"
                          defaultChecked={name !== "is_recorded"}
                          name={name}
                          type="checkbox"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join meeting</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <form
                  className="grid gap-3 sm:grid-cols-[1fr_auto]"
                  onSubmit={handleJoinMeeting}
                >
                  <Input name="joinCode" placeholder="ABCD1234" required />
                  <Button disabled={!accessToken || joinState.isLoading} type="submit">
                    <DoorOpen className="size-4" />
                    {joinState.isLoading ? "Joining..." : "Join"}
                  </Button>
                </form>
                {createdCode ? (
                  <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Created meeting code: {createdCode}
                  </p>
                ) : null}
                {message ? (
                  <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {message}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <aside className="grid content-start gap-6">
            <Card>
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
