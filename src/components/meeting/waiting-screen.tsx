"use client";

import { useEffect, useRef, useState } from "react";
import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetLiveKitTokenMutation } from "@/redux/features/livekit/livekitApi";
import { useGetMeetingQuery } from "@/redux/features/meetings/meetingsApi";
import type { ActiveSession, WaitingSession } from "@/components/meeting/meeting.types";
import { getApiErrorMessage, getApiErrorStatus } from "@/components/meeting/meeting.utils";

type WaitingScreenProps = {
  waiting: WaitingSession;
  onAdmitted: (session: ActiveSession) => void;
  onCancel: () => void;
};

export function WaitingScreen({ waiting, onAdmitted, onCancel }: WaitingScreenProps) {
  const { data, error } = useGetMeetingQuery(waiting.code, {
    pollingInterval: 2000,
    skipPollingIfUnfocused: true,
  });
  const [getToken, tokenState] = useGetLiveKitTokenMutation();
  const tokenRequested = useRef(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const meeting = data?.data;
  const participant = meeting?.currentParticipant;

  useEffect(() => {
    if (!meeting || meeting.status === "ended" || participant?.status !== "admitted" || tokenRequested.current) return;

    tokenRequested.current = true;
    setTokenError(null);
    getToken({ joinCode: waiting.code })
      .unwrap()
      .then((response) => onAdmitted({
        meetingId: meeting.id,
        code: waiting.code,
        title: waiting.title,
        roomName: response.data.roomName,
        token: response.data.token,
        role: response.data.participant.role,
        allowScreenshare: meeting.allow_screenshare,
        screenshareNeedsApproval: meeting.screenshare_needs_approval,
      }))
      .catch((requestError) => {
        tokenRequested.current = false;
        setTokenError(getApiErrorMessage(requestError));
      });
  }, [getToken, meeting, onAdmitted, participant?.status, waiting.code, waiting.title]);

  const denied = participant?.status === "denied";
  const unavailable = meeting?.status === "ended"
    || getApiErrorStatus(error) === 403
    || getApiErrorStatus(error) === 404;
  const stopped = denied || unavailable;
  const heading = denied
    ? "Your request was declined"
    : unavailable
      ? "Meeting unavailable"
      : "Asking to join...";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto grid size-16 place-items-center rounded-full ${stopped ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
          {stopped ? <X className="size-7" /> : <Users className="size-7" />}
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">{heading}</h1>
        <p className="mt-2 text-slate-500">
          {denied
            ? "The host did not admit you to this meeting."
            : unavailable
              ? "This meeting was ended, deleted, or is no longer available."
              : `You will join “${waiting.title}” when the host lets you in.`}
        </p>
        {tokenState.isLoading && <p className="mt-4 text-sm text-blue-600">Preparing the meeting room...</p>}
        {tokenError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{tokenError}</p>}
        <Button className="mt-7" onClick={onCancel} type="button" variant="outline">Cancel</Button>
      </section>
    </main>
  );
}
