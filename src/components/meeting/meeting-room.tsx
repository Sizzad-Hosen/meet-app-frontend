"use client";

import { useRef, useState } from "react";
import { Clipboard, PhoneOff, Users } from "lucide-react";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import { PeoplePanel } from "@/components/meeting/people-panel";
import { RecordingControl, ScreenShareControl } from "@/components/meeting/meeting-controls";
import type { ActiveSession } from "@/components/meeting/meeting.types";
import {
  useEndMeetingMutation,
  useLeaveMeetingMutation,
} from "@/redux/features/meetings/meetingsApi";

const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

function MeetingStage({ session, onLeave }: { session: ActiveSession; onLeave: () => void }) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col pt-16">
      <div className="min-h-0 flex-1 p-3 pb-0">
        <GridLayout className="h-full" tracks={tracks}><ParticipantTile /></GridLayout>
      </div>
      <div className="flex min-h-20 flex-wrap items-center justify-center gap-3 px-4 py-3">
        <ControlBar controls={{ camera: true, microphone: true, screenShare: false, chat: false, leave: false, settings: false }} />
        <ScreenShareControl session={session} />
        {session.role === "host" && <RecordingControl session={session} />}
        {session.role !== "host" && (
          <button className="flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700" onClick={onLeave} type="button">
            <PhoneOff className="size-4" /> Leave
          </button>
        )}
      </div>
      <RoomAudioRenderer />
    </div>
  );
}

export function MeetingRoom({ session, onExit }: { session: ActiveSession; onExit: () => void }) {
  const [panelOpen, setPanelOpen] = useState(session.role === "host");
  const [leaveMeeting] = useLeaveMeetingMutation();
  const [endMeeting] = useEndMeetingMutation();
  const exiting = useRef(false);
  const isHost = session.role === "host";

  const exit = async (end = false) => {
    if (exiting.current) return;
    exiting.current = true;
    try {
      if (end && isHost) await endMeeting(session.code).unwrap();
      else await leaveMeeting(session.code).unwrap();
    } catch {
      // Always close the local room, even if REST cleanup fails.
    } finally {
      onExit();
    }
  };

  if (!liveKitUrl) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">LiveKit URL is missing</h1>
          <p className="mt-2 text-slate-300">Add NEXT_PUBLIC_LIVEKIT_URL to .env.local and restart the frontend.</p>
          <Button className="mt-6" onClick={() => exit()} type="button">Back</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[#202124] text-white">
      <header className="absolute inset-x-0 top-0 z-10 flex h-16 items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-5">
        <div className="min-w-0">
          <p className="truncate font-medium">{session.title}</p>
          <button className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300 hover:text-white" onClick={() => navigator.clipboard.writeText(session.code)} type="button">
            {session.code} <Clipboard className="size-3" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-full bg-white/10 p-3 hover:bg-white/20" onClick={() => setPanelOpen((open) => !open)} title="People" type="button"><Users className="size-5" /></button>
          {isHost && <Button className="rounded-full bg-red-600 hover:bg-red-700" onClick={() => exit(true)} type="button"><PhoneOff className="size-4" /> End call</Button>}
        </div>
      </header>
      <LiveKitRoom audio className="h-full pt-16" connect data-lk-theme="default" onDisconnected={() => exit(false)} serverUrl={liveKitUrl} token={session.token} video>
        <MeetingStage onLeave={() => exit(false)} session={session} />
      </LiveKitRoom>
      {panelOpen && <PeoplePanel code={session.code} isHost={session.role !== "guest"} onClose={() => setPanelOpen(false)} />}
    </main>
  );
}
