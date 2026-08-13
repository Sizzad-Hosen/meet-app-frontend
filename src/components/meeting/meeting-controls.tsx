"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, ScreenShare, Square } from "lucide-react";
import { useLocalParticipant } from "@livekit/components-react";
import type { ActiveSession } from "@/components/meeting/meeting.types";
import { getApiErrorMessage } from "@/components/meeting/meeting.utils";
import {
  useGetRecordingsQuery,
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/redux/features/recordings/recordingsApi";
import {
  useGetScreenShareStatusQuery,
  useStartScreenShareMutation,
  useStopScreenShareMutation,
} from "@/redux/features/screenShare/screenShareApi";
import { useAppSelector } from "@/redux/hooks";

export function ScreenShareControl({ session }: { session: ActiveSession }) {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { isScreenShareEnabled, localParticipant } = useLocalParticipant();
  const { data } = useGetScreenShareStatusQuery(session.code, { pollingInterval: 1500 });
  const [startScreenShare] = useStartScreenShareMutation();
  const [stopScreenShare] = useStopScreenShareMutation();
  const [pending, setPending] = useState(false);
  const requestSeen = useRef(false);
  const approvalInFlight = useRef(false);
  const wasSharing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activeShare = data?.data.participant;
  const pendingRequests = data?.data.pending ?? [];
  const requestPending = pendingRequests.some((request) => request.user_id === userId);
  const requestApproved = Boolean(userId && activeShare?.user_id === userId);

  useEffect(() => {
    if (requestPending) requestSeen.current = true;
  }, [requestPending]);

  useEffect(() => {
    if (!pending || !requestApproved || isScreenShareEnabled || approvalInFlight.current) return;
    approvalInFlight.current = true;
    localParticipant.setScreenShareEnabled(true)
      .then(() => {
        setPending(false);
        requestSeen.current = false;
        setMessage(null);
      })
      .catch(async (error) => {
        await stopScreenShare(session.code).unwrap().catch(() => undefined);
        setPending(false);
        setMessage(error instanceof Error ? error.message : "Screen sharing could not start.");
      })
      .finally(() => { approvalInFlight.current = false; });
  }, [isScreenShareEnabled, localParticipant, pending, requestApproved, session.code, stopScreenShare]);

  useEffect(() => {
    if (!pending || !requestSeen.current || requestPending || requestApproved) return;
    const timeout = window.setTimeout(() => {
      setPending(false);
      requestSeen.current = false;
      setMessage("The host declined your screen share request.");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pending, requestApproved, requestPending]);

  useEffect(() => {
    if (isScreenShareEnabled) {
      wasSharing.current = true;
      return;
    }
    if (!wasSharing.current) return;
    wasSharing.current = false;
    void stopScreenShare(session.code).unwrap().catch(() => undefined);
  }, [isScreenShareEnabled, session.code, stopScreenShare]);

  const toggle = async () => {
    setBusy(true);
    setMessage(null);
    try {
      if (isScreenShareEnabled) {
        await localParticipant.setScreenShareEnabled(false);
        await stopScreenShare(session.code).unwrap();
        return;
      }

      const response = await startScreenShare(session.code).unwrap();
      if ("status" in response.data && response.data.status === "pending_approval") {
        setPending(true);
        setMessage("Screen share request sent to the host.");
        return;
      }

      try {
        await localParticipant.setScreenShareEnabled(true);
      } catch (error) {
        await stopScreenShare(session.code).unwrap().catch(() => undefined);
        throw error;
      }
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!session.allowScreenshare) return null;

  return (
    <div className="relative">
      <button className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${isScreenShareEnabled ? "bg-blue-600 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`} disabled={busy || pending} onClick={toggle} title={message ?? (isScreenShareEnabled ? "Stop sharing" : "Share screen")} type="button">
        {isScreenShareEnabled ? <Square className="size-4" /> : <ScreenShare className="size-4" />}
        {pending ? "Waiting for host" : isScreenShareEnabled ? "Stop sharing" : "Share screen"}
      </button>
      {message && <p className="absolute bottom-12 left-1/2 w-64 -translate-x-1/2 rounded-lg bg-black/85 px-3 py-2 text-center text-xs text-white shadow-lg">{message}</p>}
    </div>
  );
}

export function RecordingControl({ session }: { session: ActiveSession }) {
  const { data } = useGetRecordingsQuery(session.meetingId, { pollingInterval: 3000 });
  const [startRecording, startState] = useStartRecordingMutation();
  const [stopRecording, stopState] = useStopRecordingMutation();
  const [message, setMessage] = useState<string | null>(null);
  const activeRecording = data?.data.find((recording) => recording.status === "recording");
  const pending = startState.isLoading || stopState.isLoading;

  const toggle = async () => {
    setMessage(null);
    try {
      if (activeRecording) await stopRecording({ code: session.code, meetingId: session.meetingId }).unwrap();
      else await startRecording({ code: session.code, meetingId: session.meetingId }).unwrap();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  return (
    <div className="relative">
      <button className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${activeRecording ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-700 text-white hover:bg-slate-600"}`} disabled={pending} onClick={toggle} title={message ?? (activeRecording ? "Stop recording" : "Start recording")} type="button">
        {activeRecording ? <Square className="size-4 fill-current" /> : <Circle className="size-4 fill-red-500 text-red-500" />}
        {pending ? "Please wait" : activeRecording ? "Stop recording" : "Record"}
      </button>
      {message && <p className="absolute bottom-12 left-1/2 w-64 -translate-x-1/2 rounded-lg bg-black/85 px-3 py-2 text-center text-xs text-white shadow-lg">{message}</p>}
    </div>
  );
}
