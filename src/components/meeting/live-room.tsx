"use client";

import { useMemo, useState } from "react";
import {
  ConnectionState,
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
      setMediaError(
        error instanceof Error ? error.message : "Could not start camera or microphone.",
      );
    }
  }

  return (
    <LiveKitRoom
      className="h-full w-full"
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
      <div className="relative h-full w-full bg-[#121212]">
        <div className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
          LiveKit: <ConnectionState />
        </div>
        {mediaError ? (
          <div className="absolute right-4 top-4 z-10 max-w-sm rounded-lg border border-amber-400/30 bg-amber-950/80 px-3 py-2 text-xs text-amber-100 shadow-lg">
            {mediaError}
          </div>
        ) : null}
        <VideoGrid />
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
    <GridLayout
      className="h-full w-full p-3 [&_.lk-participant-tile]:overflow-hidden [&_.lk-participant-tile]:rounded-2xl [&_.lk-participant-tile]:border-0 [&_.lk-participant-tile]:bg-[#334e65]"
      tracks={tracks}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
