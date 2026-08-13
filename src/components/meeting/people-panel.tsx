"use client";

import { useState } from "react";
import { Check, MicOff, ShieldCheck, X } from "lucide-react";
import type { Participant } from "@/types/meeting";
import type { ParticipantAction } from "@/components/meeting/meeting.types";
import { getApiErrorMessage, getInitials } from "@/components/meeting/meeting.utils";
import {
  useAdmitAllMutation,
  useAdmitParticipantMutation,
  useGetParticipantsQuery,
  useGetWaitingRoomQuery,
  useMuteAllMutation,
  useParticipantActionMutation,
} from "@/redux/features/meetings/meetingsApi";
import {
  useGetScreenShareStatusQuery,
  useScreenShareDecisionMutation,
} from "@/redux/features/screenShare/screenShareApi";

type PeoplePanelProps = { code: string; isHost: boolean; onClose: () => void };

function ParticipantRow({ participant, canModerate, onAction }: {
  participant: Participant;
  canModerate: boolean;
  onAction: (participant: Participant, action: ParticipantAction) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{getInitials(participant.user?.name)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{participant.user?.name ?? "Guest"}</p>
        <p className="text-xs capitalize text-slate-500">{participant.role}</p>
      </div>
      {canModerate && participant.role !== "host" && participant.status === "admitted" && (
        <div className="flex gap-1">
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => onAction(participant, "mute")} title="Mute" type="button"><MicOff className="size-4" /></button>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => onAction(participant, "cohost")} title="Make co-host" type="button"><ShieldCheck className="size-4" /></button>
          <button className="rounded-full p-2 text-red-500 hover:bg-red-50" onClick={() => onAction(participant, "kick")} title="Remove" type="button"><X className="size-4" /></button>
        </div>
      )}
    </div>
  );
}

export function PeoplePanel({ code, isHost, onClose }: PeoplePanelProps) {
  const { data: waitingResponse } = useGetWaitingRoomQuery(code, { skip: !isHost, pollingInterval: 2000, skipPollingIfUnfocused: true });
  const { data: participantsResponse } = useGetParticipantsQuery(code, { pollingInterval: 3000, skipPollingIfUnfocused: true });
  const { data: screenShareResponse } = useGetScreenShareStatusQuery(code, { pollingInterval: 2000, skipPollingIfUnfocused: true });
  const [admit] = useAdmitParticipantMutation();
  const [admitAll] = useAdmitAllMutation();
  const [participantAction] = useParticipantActionMutation();
  const [muteAll] = useMuteAllMutation();
  const [screenShareDecision] = useScreenShareDecisionMutation();
  const [message, setMessage] = useState<string | null>(null);
  const waiting = waitingResponse?.data ?? [];
  const participants = participantsResponse?.data.filter((item) => item.status === "admitted") ?? [];
  const shareRequests = screenShareResponse?.data.pending ?? [];

  const runAction = async (request: () => Promise<unknown>) => {
    setMessage(null);
    try {
      await request();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  const act = async (participant: Participant, action: ParticipantAction) => {
    if (!participant.user_id) return;
    await runAction(() => participantAction({ code, userId: participant.user_id!, action }).unwrap());
  };

  return (
    <aside className="absolute inset-y-3 right-3 z-20 flex w-[min(380px,calc(100%-24px))] flex-col rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">People</h2>
        <button className="rounded-full p-2 hover:bg-slate-100" onClick={onClose} type="button"><X className="size-5" /></button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {message && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
        {isHost && shareRequests.length > 0 && (
          <section className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Screen share requests ({shareRequests.length})</p>
            {shareRequests.map((request) => (
              <div className="flex items-center gap-3 py-2" key={request.id}>
                <span className="grid size-9 place-items-center rounded-full bg-white text-xs font-semibold text-blue-700">{getInitials(request.user?.name)}</span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{request.user?.name ?? "Guest"}</p>
                <button className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700" onClick={() => void runAction(() => screenShareDecision({ code, userId: request.user_id, decision: "approve" }).unwrap())} title="Allow screen share" type="button"><Check className="size-4" /></button>
                <button className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50" onClick={() => void runAction(() => screenShareDecision({ code, userId: request.user_id, decision: "deny" }).unwrap())} title="Deny screen share" type="button"><X className="size-4" /></button>
              </div>
            ))}
          </section>
        )}
        {isHost && waiting.length > 0 && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waiting ({waiting.length})</p>
              <button className="text-xs font-semibold text-blue-600" onClick={() => void runAction(() => admitAll(code).unwrap())} type="button">Admit all</button>
            </div>
            {waiting.map((participant) => (
              <div className="flex items-center gap-3 py-2" key={participant.id}>
                <span className="grid size-9 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">{getInitials(participant.user?.name)}</span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{participant.user?.name ?? "Guest"}</p>
                <button className="rounded-full bg-blue-50 p-2 text-blue-600 hover:bg-blue-100" onClick={() => participant.user_id && void runAction(() => admit({ code, userId: participant.user_id! }).unwrap())} title="Admit" type="button"><Check className="size-4" /></button>
                <button className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100" onClick={() => participant.user_id && void runAction(() => participantAction({ code, userId: participant.user_id!, action: "deny" }).unwrap())} title="Deny" type="button"><X className="size-4" /></button>
              </div>
            ))}
          </section>
        )}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">In this meeting ({participants.length})</p>
            {isHost && <button className="text-xs font-semibold text-blue-600" onClick={() => void runAction(() => muteAll(code).unwrap())} type="button">Mute all</button>}
          </div>
          {participants.map((participant) => <ParticipantRow canModerate={isHost} key={participant.id} onAction={act} participant={participant} />)}
        </section>
      </div>
    </aside>
  );
}
