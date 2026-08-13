"use client";

import { useState, type FormEvent } from "react";
import { DoorOpen, LogOut, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActiveSession, WaitingSession } from "@/components/meeting/meeting.types";
import { getApiErrorMessage, getApiErrorStatus, getInitials } from "@/components/meeting/meeting.utils";
import { normalizeMeetingCode } from "@/lib/meeting-code";
import { useLogoutMutation } from "@/redux/features/auth/authApi";

import {
  useCreateMeetingMutation,
  useJoinMeetingMutation,
} from "@/redux/features/meetings/meetingsApi";
import { useAppSelector } from "@/redux/hooks";


type MeetingHomeScreenProps = {
  onCreated: (session: ActiveSession) => void;
  onSession: (session: ActiveSession) => void;
  onWaiting: (waiting: WaitingSession) => void;
};

export function MeetingHomeScreen({ onCreated, onSession, onWaiting }: MeetingHomeScreenProps) {
  const user = useAppSelector((state) => state.auth.user);
  const [createMeeting, createState] = useCreateMeetingMutation();
  const [joinMeeting, joinState] = useJoinMeetingMutation();
  const [logout] = useLogoutMutation();
  const [title, setTitle] = useState("New meeting");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const create = async () => {
    setMessage(null);
    try {
      const { data } = await createMeeting({
        title: title.trim() || "New meeting",
        type: "instant",
        max_participants: 100,
        waiting_room_on: true,
        allow_screenshare: true,
        screenshare_needs_approval: false,
        is_recorded: false,
      }).unwrap();
      onCreated({
        meetingId: data.meeting.id,
        code: data.meeting.join_code,
        title: data.meeting.title,
        roomName: data.meeting.livekit_room_name,
        token: data.livekitToken,
        role: "host",
        allowScreenshare: data.meeting.allow_screenshare,
        screenshareNeedsApproval: data.meeting.screenshare_needs_approval,
      });
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };


  
  const join = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const code = normalizeMeetingCode(joinCode);

    try {
      const { data } = await joinMeeting({ joinCode: code }).unwrap();

      if (data.participant.status === "waiting") {
        onWaiting({ code, title: data.meeting.title });
        return;
      }
      if (!data.livekitToken) throw new Error("The meeting token was not returned.");
      onSession({
        meetingId: data.meeting.id,
        code,
        title: data.meeting.title,
        roomName: data.meeting.livekit_room_name,
        token: data.livekitToken,
        role: data.participant.role,
        allowScreenshare: data.meeting.allow_screenshare,
        screenshareNeedsApproval: data.meeting.screenshare_needs_approval,
      });
    } catch (error) {
      setMessage(
        getApiErrorStatus(error) === 404
          ? "Meeting not found. Check the code with the host and try again."
          : getApiErrorMessage(error),
      );
    }
  };

  
  const signOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // The auth endpoint always clears local credentials, even if the server is unavailable.
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"><Video className="size-5" /></span>
          <span className="text-xl font-semibold text-slate-800">Meet Apps</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:block">{user?.name ?? "Signed in"}</span>
          <button className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700" title="Account" type="button">{getInitials(user?.name)}</button>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={signOut} title="Sign out" type="button"><LogOut className="size-5" /></button>
        </div>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div>
          <h1 className="max-w-xl text-4xl font-normal leading-tight tracking-tight text-slate-900 sm:text-5xl">Video calls and meetings for everyone</h1>
          <p className="mt-5 max-w-lg text-lg leading-7 text-slate-500">Connect, collaborate, and meet securely from your browser.</p>
          <div className="mt-9 max-w-xl space-y-4">
            <Input className="h-12 rounded-lg text-base" onChange={(event) => setTitle(event.target.value)} placeholder="Meeting title" value={title} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-lg bg-blue-600 px-6 hover:bg-blue-700" disabled={createState.isLoading} onClick={create} type="button">
                <Video className="size-5" /> {createState.isLoading ? "Starting..." : "New meeting"}
              </Button>
              <form className="flex flex-1 gap-2" onSubmit={join}>
                <div className="relative flex-1">
                  <DoorOpen className="absolute left-3 top-3.5 size-5 text-slate-400" />
                  <Input className="h-12 pl-10 uppercase tracking-wider" maxLength={16} minLength={4} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="Enter a code" required value={joinCode} />
                </div>
                <Button className="h-12 px-5 text-blue-600" disabled={joinState.isLoading} type="submit" variant="ghost">Join</Button>
              </form>
            </div>
            {message && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
          </div>
        </div>
        <div className="mx-auto w-full max-w-lg">
          <div className="aspect-video rounded-3xl bg-slate-100 p-5 shadow-inner">
            <div className="grid h-full place-items-center rounded-2xl bg-[#202124] text-center text-white shadow-xl">
              <div>
                <span className="mx-auto grid size-20 place-items-center rounded-full bg-blue-600"><Users className="size-9" /></span>
                <p className="mt-5 text-lg font-medium">Your meeting is ready when you are</p>
                <p className="mt-1 text-sm text-slate-400">Camera and microphone controls appear in the room</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm text-slate-500">
            <span>Secure access</span><span>Waiting room</span><span>Screen sharing</span>
          </div>
        </div>
      </section>
    </main>
  );
}



