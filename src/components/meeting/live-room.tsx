"use client";

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

export function LiveRoom({
  serverUrl,
  token,
}: {
  serverUrl: string;
  token: string;
}) {
  return (
    <LiveKitRoom
      className="min-h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white"
      connect
      serverUrl={serverUrl}
      token={token}
      video
      audio
    >
      <div className="flex min-h-[520px] flex-col">
        <VideoGrid />
        <ControlBar />
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}

function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout className="min-h-[460px] flex-1 p-3" tracks={tracks}>
      <ParticipantTile />
    </GridLayout>
  );
}
