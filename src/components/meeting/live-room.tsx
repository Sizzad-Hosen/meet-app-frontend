"use client";

import { useMemo, useState } from "react";
import {
  ConnectionState,
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";

export function LiveRoom({
  room,
  serverUrl,
  token,
}: {
  room?: Room;
  serverUrl: string;
  token: string;
}) {
  const fallbackRoom = useMemo(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
    [],
  );
  const activeRoom = room ?? fallbackRoom;
  const [mediaError, setMediaError] = useState("");

  async function publishLocalMedia() {
    setMediaError("");

    try {
      await activeRoom.localParticipant.setMicrophoneEnabled(true);
      await activeRoom.localParticipant.setCameraEnabled(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not start camera or microphone.";
      setMediaError(message);
    }
  }

  return (
    <LiveKitRoom
      className="min-h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white"
      connect
      connectOptions={{ autoSubscribe: true }}
      onConnected={() => {
        void publishLocalMedia();
      }}
      onError={(error) => setMediaError(error.message)}
      onMediaDeviceFailure={(_failure, kind) => {
        setMediaError(`Could not access ${kind ?? "media device"}. Check browser permissions.`);
      }}
      room={activeRoom}
      serverUrl={serverUrl}
      token={token}
      video={false}
      audio={false}
    >
      <div className="flex min-h-[520px] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-xs text-slate-300">
          <span>LiveKit: <ConnectionState /></span>
          {mediaError ? <span className="text-amber-300">{mediaError}</span> : null}
        </div>
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
