"use client";

import { useState } from "react";
import { Check, Clipboard, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteMeetingMutation } from "@/redux/features/meetings/meetingsApi";
import type { ActiveSession } from "@/components/meeting/meeting.types";
import { getApiErrorMessage } from "@/components/meeting/meeting.utils";

type MeetingReadyScreenProps = {
  meeting: ActiveSession;
  onBack: () => void;
  onStart: (session: ActiveSession) => void;
};

export function MeetingReadyScreen({ meeting, onBack, onStart }: MeetingReadyScreenProps) {
  const [deleteMeeting, deleteState] = useDeleteMeetingMutation();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const copyCode = async () => {
    await navigator.clipboard.writeText(meeting.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const start = () => {
    setMessage(null);
    if (!meeting.token) {
      setMessage("The meeting token was not returned. Please create the meeting again.");
      return;
    }

    onStart(meeting);
  };

  const cancel = async () => {
    setMessage(null);
    try {
      await deleteMeeting(meeting.code).unwrap();
      onBack();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  const pending = deleteState.isLoading;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-green-50 text-green-600"><Check className="size-8" /></span>
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">Your meeting is ready</h1>
        <p className="mt-2 text-slate-500">Share this code. Participants will wait until you admit them.</p>
        <button className="mx-auto mt-7 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-blue-800 hover:bg-blue-100" onClick={copyCode} type="button">
          <span className="text-2xl font-semibold tracking-[0.25em]">{meeting.code}</span>
          {copied ? <Check className="size-5" /> : <Clipboard className="size-5" />}
        </button>
        {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <Button disabled={pending} onClick={cancel} type="button" variant="outline">Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled={pending} onClick={start} type="button">
            <Video className="size-4" /> Join now
          </Button>
        </div>
      </section>
    </main>
  );
}
