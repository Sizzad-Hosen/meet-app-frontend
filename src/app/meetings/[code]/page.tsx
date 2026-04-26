"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Room } from "livekit-client";
import {
  Captions,
  Check,
  Copy,
  DoorOpen,
  Hand,
  Info,
  LayoutGrid,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreVertical,
  PhoneOff,
  Radio,
  Settings,
  Share2,
  ShieldCheck,
  Smile,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LiveRoom } from "@/components/meeting/live-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeetingSocket } from "@/hooks/use-meeting-socket";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import {
  breakoutSchema,
  broadcastSchema,
  createPollSchema,
  updateMeetingSchema,
} from "@/lib/validations";
import { useAppSelector } from "@/redux/hook";
import {
  useAdmitAllMutation,
  useAdmitParticipantMutation,
  useAssignCohostMutation,
  useDeleteMeetingMutation,
  useDenyParticipantMutation,
  useEndMeetingMutation,
  useGetMeetingQuery,
  useGetParticipantsQuery,
  useGetWaitingRoomQuery,
  useJoinMeetingMutation,
  useKickParticipantMutation,
  useLeaveMeetingMutation,
  useMuteAllMutation,
  useMuteParticipantMutation,
  useUpdateMeetingMutation,
} from "@/redux/features/Meeting/meetingApi";
import {
  useBroadcastBreakoutMutation,
  useCreateBreakoutsMutation,
  useEndAllBreakoutsMutation,
  useGetBreakoutsQuery,
  useJoinBreakoutMutation,
} from "@/redux/features/breakout/breakoutApi";
import {
  useClosePollMutation,
  useCreatePollMutation,
  useGetPollsQuery,
  useSubmitVoteMutation,
} from "@/redux/features/poll/pollApi";
import {
  useGetScreenShareStatusQuery,
  useStartScreenShareMutation,
  useStopScreenShareMutation,
} from "@/redux/features/screenShare/screenShareApi";
import {
  useDeleteRecordingMutation,
  useGetRecordingsQuery,
  useLazyGetRecordingDownloadQuery,
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/redux/features/recording/recordingApi";
import { useGetLiveKitTokenMutation } from "@/redux/features/livekit/livekitApi";

type PollFormValues = z.infer<typeof createPollSchema>;
type BreakoutFormValues = z.infer<typeof breakoutSchema>;
type BroadcastFormValues = z.infer<typeof broadcastSchema>;
type UpdateMeetingFormValues = z.infer<typeof updateMeetingSchema>;
type SidePanel = "info" | "people" | "chat" | "polls" | "host" | null;

function MeetingDetailContent() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params?.code ?? "";
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const [liveKitToken, setLiveKitToken] = useState("");
  const [joinStatus, setJoinStatus] = useState("");
  const [sidePanel, setSidePanel] = useState<SidePanel>("info");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [autoTokenRequested, setAutoTokenRequested] = useState(false);
  const liveKitRoom = useMemo(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
    [],
  );
  const socket = useMeetingSocket(code, accessToken);

  const meeting = useGetMeetingQuery(code, { pollingInterval: 5000 });
  const participants = useGetParticipantsQuery(code, { pollingInterval: 3000 });
  const pollQuery = useGetPollsQuery(code, { pollingInterval: 3000 });
  const screenShare = useGetScreenShareStatusQuery(code);
  const meetingId = meeting.data?.data.id;
  const recordings = useGetRecordingsQuery(meetingId ?? "", { skip: !meetingId });

  const participantUsers = participants.data?.data ?? [];
  const getParticipantUserId = (participant: (typeof participantUsers)[number]) =>
    participant.user_id ?? participant.userId ?? participant.user?.id ?? "";
  const getParticipantLabel = (participant: (typeof participantUsers)[number]) =>
    participant.user?.name ??
    participant.name ??
    participant.user?.email ??
    participant.email ??
    getParticipantUserId(participant) ??
    participant.id;
  const currentParticipant = participantUsers.find(
    (participant) => getParticipantUserId(participant) === user?.id,
  );
  const isHost = meeting.data?.data.host_id === user?.id || currentParticipant?.role === "host";
  const canModerate = isHost || currentParticipant?.role === "cohost";
  const waiting = useGetWaitingRoomQuery(code, { pollingInterval: 3000, skip: !canModerate });
  const waitingUsers = waiting.data?.data ?? [];

  const breakouts = useGetBreakoutsQuery(code, { skip: !canModerate });
  const breakoutRooms = Array.isArray(breakouts.data?.data)
    ? breakouts.data.data
    : breakouts.data?.data.rooms ?? [];
  const pollItems = pollQuery.data?.data ?? [];
  const recordingItems = recordings.data?.data ?? [];
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:7880";
  const meetingTitle = meeting.data?.data.title ?? "Meeting";
  const meetingLink = typeof window === "undefined" ? "" : `${window.location.origin}/meetings/${code}`;
  const isAdmitted =
    currentParticipant?.status === "admitted" ||
    joinStatus === "admitted" ||
    Boolean(liveKitToken);

  const [admitParticipant] = useAdmitParticipantMutation();
  const [admitAll] = useAdmitAllMutation();
  const [muteParticipant] = useMuteParticipantMutation();
  const [muteAll] = useMuteAllMutation();
  const [kickParticipant] = useKickParticipantMutation();
  const [denyParticipant] = useDenyParticipantMutation();
  const [assignCohost] = useAssignCohostMutation();
  const [endMeeting] = useEndMeetingMutation();
  const [deleteMeeting] = useDeleteMeetingMutation();
  const [leaveMeeting] = useLeaveMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [joinMeeting] = useJoinMeetingMutation();
  const [createBreakouts] = useCreateBreakoutsMutation();
  const [joinBreakout] = useJoinBreakoutMutation();
  const [endAllBreakouts] = useEndAllBreakoutsMutation();
  const [broadcastBreakout] = useBroadcastBreakoutMutation();
  const [createPoll] = useCreatePollMutation();
  const [submitVote] = useSubmitVoteMutation();
  const [closePoll] = useClosePollMutation();
  const [startScreenShare] = useStartScreenShareMutation();
  const [stopScreenShare] = useStopScreenShareMutation();
  const [startRecording] = useStartRecordingMutation();
  const [stopRecording] = useStopRecordingMutation();
  const [deleteRecording] = useDeleteRecordingMutation();
  const [getRecordingDownload] = useLazyGetRecordingDownloadQuery();
  const [getLiveKitToken, liveKitTokenState] = useGetLiveKitTokenMutation();

  const pollForm = useForm<PollFormValues>({ resolver: zodResolver(createPollSchema) });
  const breakoutForm = useForm<BreakoutFormValues>({ resolver: zodResolver(breakoutSchema) });
  const broadcastForm = useForm<BroadcastFormValues>({ resolver: zodResolver(broadcastSchema) });
  const updateForm = useForm<UpdateMeetingFormValues>({
    resolver: zodResolver(updateMeetingSchema),
    values: {
      title: meeting.data?.data.title ?? "",
      max_participants: meeting.data?.data.max_participants ?? 100,
      scheduled_at: meeting.data?.data.scheduled_at?.slice(0, 16) ?? "",
      waiting_room_on: meeting.data?.data.waiting_room_on ?? true,
      allow_screenshare: meeting.data?.data.allow_screenshare ?? true,
      screenshare_needs_approval: meeting.data?.data.screenshare_needs_approval ?? false,
      is_recorded: meeting.data?.data.is_recorded ?? false,
    },
  });

  async function run(action: () => Promise<unknown>, successMessage = "Done") {
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleJoinMeeting() {
    setMessage("");
    setJoinStatus("");

    try {
      const result = await joinMeeting({ joinCode: code }).unwrap();
      const participantStatus = result.data.participant.status ?? "";
      setJoinStatus(participantStatus);

      if (result.data.livekitToken) {
        setLiveKitToken(result.data.livekitToken);
        setAutoTokenRequested(true);
        setMessage("You are in the meeting.");
        return;
      }

      setMessage(
        participantStatus === "waiting"
          ? "You are in the waiting room. The host can admit you now."
          : result.message,
      );
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleLeaveMeeting() {
    await run(async () => {
      await liveKitRoom.disconnect();
      await leaveMeeting(code).unwrap();
      router.push("/");
    }, "Left meeting");
  }

  async function handleCopyMeetingLink() {
    await navigator.clipboard.writeText(meetingLink);
    setMessage("Meeting link copied.");
  }

  async function handleCopyMeetingCode() {
    await navigator.clipboard.writeText(code);
    setMessage("Meeting code copied.");
  }

  async function handleToggleMic() {
    const next = !micOn;
    await liveKitRoom.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  }

  async function handleToggleCamera() {
    const next = !cameraOn;
    await liveKitRoom.localParticipant.setCameraEnabled(next);
    setCameraOn(next);
  }

  async function handleStartScreenShare() {
    await run(async () => {
      if (!liveKitToken) {
        const result = await getLiveKitToken({ joinCode: code }).unwrap();
        setLiveKitToken(result.data.token);
      }

      await liveKitRoom.localParticipant.setScreenShareEnabled(true, { audio: true });
      await startScreenShare(code).unwrap();
      setScreenOn(true);
    }, "Screen sharing started");
  }

  async function handleStopScreenShare() {
    await run(async () => {
      await liveKitRoom.localParticipant.setScreenShareEnabled(false);
      await stopScreenShare(code).unwrap();
      setScreenOn(false);
    }, "Screen sharing stopped");
  }

  async function handleCreatePoll(values: PollFormValues) {
    const options = [values.optionA, values.optionB, values.optionC].filter(Boolean) as string[];
    await run(() => createPoll({ code, body: { question: values.question, options } }).unwrap(), "Poll created");
    pollForm.reset();
  }

  async function handleCreateBreakout(values: BreakoutFormValues) {
    const participantIds = values.participantIds
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await run(
      () =>
        createBreakouts({
          code,
          body: { rooms: [{ name: values.name, participantIds }] },
        }).unwrap(),
      "Breakout room created",
    );
    breakoutForm.reset();
  }

  async function handleBroadcast(values: BroadcastFormValues) {
    await run(() => broadcastBreakout({ code, body: values }).unwrap(), "Broadcast sent");
    broadcastForm.reset();
  }

  async function handleUpdateMeeting(values: UpdateMeetingFormValues) {
    await run(
      () =>
        updateMeeting({
          code,
          body: { ...values, scheduled_at: values.scheduled_at || null },
        }).unwrap(),
      "Meeting settings updated",
    );
  }

  const getPollOptionText = (option: (typeof pollItems)[number]["options"][number]) =>
    option.text ?? option.option ?? option.id;
  const getPollOptionVoteCount = (option: (typeof pollItems)[number]["options"][number]) =>
    option.voteCount ?? option.votes ?? 0;
  const getPollTotalVotes = (poll: (typeof pollItems)[number]) =>
    poll.totalVotes ?? poll.options?.reduce((sum, option) => sum + getPollOptionVoteCount(option), 0) ?? 0;
  const getPollOptionPercent = (
    poll: (typeof pollItems)[number],
    option: (typeof pollItems)[number]["options"][number],
  ) => {
    const totalVotes = getPollTotalVotes(poll);
    const voteCount = getPollOptionVoteCount(option);
    return option.percent ?? (totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0);
  };
  const isPollOptionSelected = (
    poll: (typeof pollItems)[number],
    option: (typeof pollItems)[number]["options"][number],
  ) => option.selected || poll.myVoteOptionId === option.id;

  useEffect(() => {
    setAutoTokenRequested(false);
  }, [code]);

  useEffect(() => {
    if (
      !code ||
      liveKitToken ||
      autoTokenRequested ||
      liveKitTokenState.isLoading ||
      currentParticipant?.status !== "admitted"
    ) {
      return;
    }

    setAutoTokenRequested(true);
    getLiveKitToken({ joinCode: code })
      .unwrap()
      .then((result) => {
        setLiveKitToken(result.data.token);
        setJoinStatus("admitted");
        setMessage("The host admitted you. Joining now.");
      })
      .catch((error) => setMessage(getApiErrorMessage(error)));
  }, [
    autoTokenRequested,
    code,
    currentParticipant?.status,
    getLiveKitToken,
    liveKitToken,
    liveKitTokenState.isLoading,
  ]);

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <div className="grid min-h-screen grid-rows-[1fr_auto]">
        <section className={cn("grid gap-3 p-3", sidePanel ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1")}>
          <div className="relative min-h-[calc(100vh-116px)] overflow-hidden rounded-[28px] bg-[#1a1a1a]">
            {liveKitToken ? (
              <LiveRoom room={liveKitRoom} serverUrl={liveKitUrl} token={liveKitToken} />
            ) : (
              <JoinLobby
                canModerate={canModerate}
                code={code}
                isAdmitted={isAdmitted}
                joinStatus={joinStatus}
                meetingLink={meetingLink}
                meetingTitle={meetingTitle}
                onCopyCode={handleCopyMeetingCode}
                onCopyLink={handleCopyMeetingLink}
                onJoin={handleJoinMeeting}
                waitingCount={waitingUsers.length}
              />
            )}

            <div className="absolute bottom-5 left-5 max-w-[80%]">
              <p className="text-lg font-semibold text-white drop-shadow">{meetingTitle}</p>
              <p className="text-sm text-white/65">{currentParticipant?.role ?? "guest"} - {currentParticipant?.status ?? "not joined"}</p>
            </div>
            <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-sm font-semibold backdrop-blur">
              <Users className="size-4" />
              {participantUsers.length}
            </div>
          </div>

          {sidePanel ? (
            <aside className="min-h-[calc(100vh-116px)] overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f1f] shadow-2xl">
              <PanelHeader panel={sidePanel} onClose={() => setSidePanel(null)} />
              <div className="h-[calc(100vh-180px)] overflow-y-auto p-4">
                {sidePanel === "info" ? (
                  <InfoPanel
                    code={code}
                    meetingLink={meetingLink}
                    onCopyCode={handleCopyMeetingCode}
                    onCopyLink={handleCopyMeetingLink}
                    socketStatus={socket.status}
                  />
                ) : null}
                {sidePanel === "people" ? (
                  <PeoplePanel
                    canModerate={canModerate}
                    getParticipantLabel={getParticipantLabel}
                    getParticipantUserId={getParticipantUserId}
                    onAdmit={(userId) => run(() => admitParticipant({ code, userId }).unwrap(), "Participant admitted")}
                    onAdmitAll={() => run(() => admitAll(code).unwrap(), "All waiting participants admitted")}
                    onAssignCohost={(userId) => run(() => assignCohost({ code, userId }).unwrap(), "Co-host assigned")}
                    onDeny={(userId) => run(() => denyParticipant({ code, userId }).unwrap(), "Participant denied")}
                    onKick={(userId) => run(() => kickParticipant({ code, userId }).unwrap(), "Participant removed")}
                    onMute={(userId) => run(() => muteParticipant({ code, userId }).unwrap(), "Participant muted")}
                    onMuteAll={() => run(() => muteAll(code).unwrap(), "All guests muted")}
                    participants={participantUsers}
                    waitingUsers={waitingUsers}
                  />
                ) : null}
                {sidePanel === "polls" ? (
                  <PollsPanel
                    canModerate={canModerate}
                    closePoll={(pollId) => run(() => closePoll({ code, pollId }).unwrap(), "Poll closed")}
                    createPollForm={pollForm}
                    getPollOptionPercent={getPollOptionPercent}
                    getPollOptionText={getPollOptionText}
                    getPollOptionVoteCount={getPollOptionVoteCount}
                    getPollTotalVotes={getPollTotalVotes}
                    isPollOptionSelected={isPollOptionSelected}
                    onCreatePoll={handleCreatePoll}
                    polls={pollItems}
                    vote={(pollId, optionId) =>
                      run(() => submitVote({ code, pollId, body: { optionId } }).unwrap(), "Vote submitted")
                    }
                  />
                ) : null}
                {sidePanel === "chat" ? (
                  <ChatPanel events={socket.events} />
                ) : null}
                {sidePanel === "host" ? (
                  <HostPanel
                    breakouts={breakoutRooms}
                    breakoutForm={breakoutForm}
                    broadcastForm={broadcastForm}
                    canModerate={canModerate}
                    isHost={isHost}
                    onBroadcast={handleBroadcast}
                    onCreateBreakout={handleCreateBreakout}
                    onDeleteMeeting={() =>
                      run(async () => {
                        await deleteMeeting(code).unwrap();
                        router.push("/");
                      }, "Meeting deleted")
                    }
                    onDownloadRecording={(recordingId) => run(() => getRecordingDownload(recordingId).unwrap(), "Download URL ready")}
                    onEndAllBreakouts={() => run(() => endAllBreakouts(code).unwrap(), "Breakout rooms closed")}
                    onEndMeeting={() => run(() => endMeeting(code).unwrap(), "Meeting ended")}
                    onJoinBreakout={(roomId) => run(() => joinBreakout({ code, roomId }).unwrap(), "Joined breakout room")}
                    onRemoveRecording={(recordingId) => run(() => deleteRecording(recordingId).unwrap(), "Recording deleted")}
                    onStartRecording={() => run(() => startRecording(code).unwrap(), "Recording started")}
                    onStopRecording={() => run(() => stopRecording(code).unwrap(), "Recording stopped")}
                    onUpdateMeeting={handleUpdateMeeting}
                    recordings={recordingItems}
                    screenShareStatus={screenShare.data?.data.status ?? String(screenShare.data?.data.active ?? "unknown")}
                    updateForm={updateForm}
                  />
                ) : null}
              </div>
            </aside>
          ) : null}
        </section>

        <footer className="grid min-h-[92px] grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/5 px-4 py-3">
          <div className="hidden items-center gap-4 text-sm font-semibold text-white/90 md:flex">
            <span>{new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            <span className="h-6 w-px bg-white/30" />
            <span>{code}</span>
          </div>

          <CallControls
            cameraOn={cameraOn}
            isAdmitted={isAdmitted}
            micOn={micOn}
            onEnd={handleLeaveMeeting}
            onScreenShare={screenOn ? handleStopScreenShare : handleStartScreenShare}
            onToggleCamera={handleToggleCamera}
            onToggleMic={handleToggleMic}
            screenOn={screenOn}
          />

          <div className="flex justify-end gap-2">
            <PanelButton active={sidePanel === "info"} icon={Info} label="Meeting info" onClick={() => setSidePanel(sidePanel === "info" ? null : "info")} />
            <PanelButton active={sidePanel === "chat"} icon={MessageSquare} label="Chat" onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")} />
            <PanelButton active={sidePanel === "people"} icon={Users} label="People" onClick={() => setSidePanel(sidePanel === "people" ? null : "people")} />
            <PanelButton active={sidePanel === "polls"} icon={Radio} label="Polls" onClick={() => setSidePanel(sidePanel === "polls" ? null : "polls")} />
            {canModerate ? (
              <PanelButton active={sidePanel === "host"} icon={ShieldCheck} label="Host tools" onClick={() => setSidePanel(sidePanel === "host" ? null : "host")} />
            ) : null}
          </div>
        </footer>
      </div>

      {message ? (
        <div className="fixed bottom-24 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2">
          <FormMessage message={message} tone={message.toLowerCase().includes("error") ? "error" : "info"} />
        </div>
      ) : null}
    </main>
  );
}

function JoinLobby({
  canModerate,
  code,
  isAdmitted,
  joinStatus,
  meetingLink,
  meetingTitle,
  onCopyCode,
  onCopyLink,
  onJoin,
  waitingCount,
}: {
  canModerate: boolean;
  code: string;
  isAdmitted: boolean;
  joinStatus: string;
  meetingLink: string;
  meetingTitle: string;
  onCopyCode: () => void;
  onCopyLink: () => void;
  onJoin: () => void;
  waitingCount: number;
}) {
  return (
    <div className="grid h-full min-h-[calc(100vh-116px)] place-items-center bg-[radial-gradient(circle_at_center,#263e53_0%,#203446_45%,#172431_100%)] px-6">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-white/15 text-3xl font-semibold shadow-2xl ring-1 ring-white/20">
          {meetingTitle.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white md:text-4xl">{meetingTitle}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
          Share the meeting link or code. Guests enter the waiting room first, then the host admits them into the live call.
        </p>

        <div className="mx-auto mt-6 grid max-w-xl gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-left backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 p-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">Meeting code</p>
              <p className="font-mono text-xl font-semibold text-white">{code}</p>
            </div>
            <Button size="sm" variant="outline" onClick={onCopyCode}>
              <Copy className="size-4" />
              Copy code
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 p-3">
            <p className="min-w-0 flex-1 truncate text-sm text-white/80">{meetingLink}</p>
            <Button size="sm" variant="outline" onClick={onCopyLink}>
              <Share2 className="size-4" />
              Copy link
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="h-11 rounded-full px-6" onClick={onJoin}>
            <DoorOpen className="size-4" />
            {isAdmitted ? "Enter meeting" : "Join meeting"}
          </Button>
          <Link className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white/80 hover:bg-white/10" href="/">
            Back home
          </Link>
        </div>

        {joinStatus || waitingCount > 0 ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {joinStatus ? <Badge variant={joinStatus === "admitted" ? "success" : "warning"}>Your status: {joinStatus}</Badge> : null}
            {canModerate && waitingCount > 0 ? <Badge variant="warning">{waitingCount} waiting</Badge> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CallControls({
  cameraOn,
  isAdmitted,
  micOn,
  onEnd,
  onScreenShare,
  onToggleCamera,
  onToggleMic,
  screenOn,
}: {
  cameraOn: boolean;
  isAdmitted: boolean;
  micOn: boolean;
  onEnd: () => void;
  onScreenShare: () => void;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  screenOn: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <RoundControl disabled={!isAdmitted} icon={micOn ? Mic : MicOff} label="Microphone" onClick={onToggleMic} tone={micOn ? "default" : "off"} />
      <RoundControl disabled={!isAdmitted} icon={cameraOn ? Video : VideoOff} label="Camera" onClick={onToggleCamera} tone={cameraOn ? "default" : "off"} />
      <RoundControl disabled={!isAdmitted} icon={MonitorUp} label="Present" onClick={onScreenShare} tone={screenOn ? "active" : "default"} />
      <RoundControl icon={Captions} label="Captions" />
      <RoundControl icon={Smile} label="Reactions" />
      <RoundControl icon={Hand} label="Raise hand" />
      <RoundControl icon={MoreVertical} label="More" />
      <button
        aria-label="Leave call"
        className="grid h-14 min-w-24 place-items-center rounded-full bg-red-500 px-7 text-white shadow-lg transition-colors hover:bg-red-600"
        onClick={onEnd}
        type="button"
      >
        <PhoneOff className="size-6" />
      </button>
    </div>
  );
}

function RoundControl({
  disabled,
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  tone?: "default" | "active" | "off";
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid size-14 place-items-center rounded-full text-white transition-colors",
        tone === "default" && "bg-[#303134] hover:bg-[#3c4043]",
        tone === "active" && "bg-cyan-600 hover:bg-cyan-700",
        tone === "off" && "bg-red-500 hover:bg-red-600",
        disabled && "cursor-not-allowed opacity-45",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-6" />
    </button>
  );
}

function PanelButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid size-11 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10",
        active && "bg-cyan-500/20 text-cyan-200",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-5" />
    </button>
  );
}

function PanelHeader({ onClose, panel }: { onClose: () => void; panel: Exclude<SidePanel, null> }) {
  const title = {
    info: "Meeting details",
    people: "People",
    chat: "Chat",
    polls: "Polls",
    host: "Host tools",
  }[panel];

  return (
    <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <button className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10" onClick={onClose} type="button">
        <X className="size-5" />
      </button>
    </div>
  );
}

function InfoPanel({
  code,
  meetingLink,
  onCopyCode,
  onCopyLink,
  socketStatus,
}: {
  code: string;
  meetingLink: string;
  onCopyCode: () => void;
  onCopyLink: () => void;
  socketStatus: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-white/45">Meeting code</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-mono text-2xl font-semibold">{code}</p>
          <Button size="sm" variant="outline" onClick={onCopyCode}><Copy className="size-4" />Copy</Button>
        </div>
      </div>
      <div className="rounded-2xl bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-white/45">Invite link</p>
        <p className="mt-2 truncate text-sm text-white/75">{meetingLink}</p>
        <Button className="mt-3" size="sm" variant="outline" onClick={onCopyLink}><Share2 className="size-4" />Copy link</Button>
      </div>
      <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
        Socket status: <span className="font-semibold text-white">{socketStatus}</span>
      </div>
    </div>
  );
}

function PeoplePanel({
  canModerate,
  getParticipantLabel,
  getParticipantUserId,
  onAdmit,
  onAdmitAll,
  onAssignCohost,
  onDeny,
  onKick,
  onMute,
  onMuteAll,
  participants,
  waitingUsers,
}: {
  canModerate: boolean;
  getParticipantLabel: (participant: any) => string;
  getParticipantUserId: (participant: any) => string;
  onAdmit: (userId: string) => void;
  onAdmitAll: () => void;
  onAssignCohost: (userId: string) => void;
  onDeny: (userId: string) => void;
  onKick: (userId: string) => void;
  onMute: (userId: string) => void;
  onMuteAll: () => void;
  participants: any[];
  waitingUsers: any[];
}) {
  return (
    <div className="space-y-5">
      {canModerate ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Waiting room</h3>
            <Button size="sm" variant="outline" onClick={onAdmitAll}>Admit all</Button>
          </div>
          {waitingUsers.length === 0 ? <p className="text-sm text-white/50">No one is waiting.</p> : null}
          {waitingUsers.map((participant) => {
            const userId = getParticipantUserId(participant);
            return (
              <div className="rounded-xl bg-white/5 p-3" key={participant.id}>
                <p className="font-medium">{getParticipantLabel(participant)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => onAdmit(userId)}><Check className="size-4" />Admit</Button>
                  <Button size="sm" variant="outline" onClick={() => onDeny(userId)}>Deny</Button>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Participants</h3>
          {canModerate ? <Button size="sm" variant="outline" onClick={onMuteAll}>Mute all</Button> : null}
        </div>
        {participants.map((participant) => {
          const userId = getParticipantUserId(participant);
          return (
            <div className="rounded-xl bg-white/5 p-3" key={participant.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{getParticipantLabel(participant)}</p>
                  <p className="text-xs text-white/45">{participant.role} - {participant.status}</p>
                </div>
                <div className="grid size-10 place-items-center rounded-full bg-cyan-500/20 text-sm font-semibold text-cyan-100">
                  {getParticipantLabel(participant).charAt(0).toUpperCase()}
                </div>
              </div>
              {canModerate ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onMute(userId)}>Mute</Button>
                  <Button size="sm" variant="outline" onClick={() => onAssignCohost(userId)}>Co-host</Button>
                  <Button size="sm" variant="outline" onClick={() => onKick(userId)}>Kick</Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function PollsPanel({
  canModerate,
  closePoll,
  createPollForm,
  getPollOptionPercent,
  getPollOptionText,
  getPollOptionVoteCount,
  getPollTotalVotes,
  isPollOptionSelected,
  onCreatePoll,
  polls,
  vote,
}: {
  canModerate: boolean;
  closePoll: (pollId: string) => void;
  createPollForm: ReturnType<typeof useForm<PollFormValues>>;
  getPollOptionPercent: (poll: any, option: any) => number;
  getPollOptionText: (option: any) => string;
  getPollOptionVoteCount: (option: any) => number;
  getPollTotalVotes: (poll: any) => number;
  isPollOptionSelected: (poll: any, option: any) => boolean;
  onCreatePoll: (values: PollFormValues) => void;
  polls: any[];
  vote: (pollId: string, optionId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {canModerate ? (
        <form className="grid gap-3 rounded-2xl bg-white/5 p-3" onSubmit={createPollForm.handleSubmit(onCreatePoll)}>
          <Input placeholder="Ask a question" {...createPollForm.register("question")} />
          <Input placeholder="Option 1" {...createPollForm.register("optionA")} />
          <Input placeholder="Option 2" {...createPollForm.register("optionB")} />
          <Input placeholder="Option 3 optional" {...createPollForm.register("optionC")} />
          <Button type="submit"><Radio className="size-4" />Create poll</Button>
        </form>
      ) : null}
      {polls.length === 0 ? <p className="text-sm text-white/50">No polls yet.</p> : null}
      {polls.map((poll) => (
        <div className="rounded-2xl bg-white/5 p-4" key={poll.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{poll.question}</p>
              <p className="text-xs text-white/45">{getPollTotalVotes(poll)} votes{poll.is_closed ? " - closed" : ""}</p>
            </div>
            {canModerate && !poll.is_closed ? (
              <Button size="sm" variant="outline" onClick={() => closePoll(poll.id)}>Close</Button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-2">
            {poll.options?.map((option: any) => (
              <button
                className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-left text-sm disabled:cursor-not-allowed"
                disabled={poll.is_closed || poll.isClosed}
                key={option.id}
                onClick={() => vote(poll.id, option.id)}
                type="button"
              >
                <span className="absolute inset-y-0 left-0 bg-cyan-500/20" style={{ width: `${getPollOptionPercent(poll, option)}%` }} />
                <span className="relative flex items-center justify-between gap-3">
                  <span>{isPollOptionSelected(poll, option) ? "Selected: " : ""}{getPollOptionText(option)}</span>
                  <span className="text-xs font-semibold text-white/70">{getPollOptionVoteCount(option)} - {getPollOptionPercent(poll, option)}%</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatPanel({ events }: { events: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/55">Room activity appears here. A typed chat composer can be added on top of this socket stream.</p>
      {events.length === 0 ? <p className="text-sm text-white/45">No activity yet.</p> : null}
      {events.map((event) => (
        <p className="rounded-xl bg-white/5 p-3 text-xs text-white/65" key={event}>{event}</p>
      ))}
    </div>
  );
}

function HostPanel({
  breakouts,
  breakoutForm,
  broadcastForm,
  canModerate,
  isHost,
  onBroadcast,
  onCreateBreakout,
  onDeleteMeeting,
  onDownloadRecording,
  onEndAllBreakouts,
  onEndMeeting,
  onJoinBreakout,
  onRemoveRecording,
  onStartRecording,
  onStopRecording,
  onUpdateMeeting,
  recordings,
  screenShareStatus,
  updateForm,
}: {
  breakouts: any[];
  breakoutForm: ReturnType<typeof useForm<BreakoutFormValues>>;
  broadcastForm: ReturnType<typeof useForm<BroadcastFormValues>>;
  canModerate: boolean;
  isHost: boolean;
  onBroadcast: (values: BroadcastFormValues) => void;
  onCreateBreakout: (values: BreakoutFormValues) => void;
  onDeleteMeeting: () => void;
  onDownloadRecording: (recordingId: string) => void;
  onEndAllBreakouts: () => void;
  onEndMeeting: () => void;
  onJoinBreakout: (roomId: string) => void;
  onRemoveRecording: (recordingId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onUpdateMeeting: (values: UpdateMeetingFormValues) => void;
  recordings: any[];
  screenShareStatus: string;
  updateForm: ReturnType<typeof useForm<UpdateMeetingFormValues>>;
}) {
  if (!canModerate) {
    return <p className="text-sm text-white/50">Host controls are only available to hosts and co-hosts.</p>;
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <h3 className="font-semibold">Meeting settings</h3>
        <form className="grid gap-3" onSubmit={updateForm.handleSubmit(onUpdateMeeting)}>
          <Input placeholder="Meeting title" {...updateForm.register("title")} />
          <Input min={2} placeholder="Max participants" type="number" {...updateForm.register("max_participants", { valueAsNumber: true })} />
          <Input type="datetime-local" {...updateForm.register("scheduled_at")} />
          {[
            ["waiting_room_on", "Waiting room"],
            ["allow_screenshare", "Allow screen share"],
            ["screenshare_needs_approval", "Require share approval"],
            ["is_recorded", "Record meeting"],
          ].map(([name, label]) => (
            <label className="flex items-center gap-2 text-sm text-white/75" key={name}>
              <input className="size-4 accent-cyan-500" type="checkbox" {...updateForm.register(name as keyof UpdateMeetingFormValues)} />
              {label}
            </label>
          ))}
          <Button type="submit"><Settings className="size-4" />Save settings</Button>
        </form>
      </section>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <h3 className="font-semibold">Screen share</h3>
        <p className="text-sm text-white/55">Status: {screenShareStatus}</p>
      </section>

      {isHost ? (
        <section className="space-y-3 rounded-2xl bg-white/5 p-4">
          <h3 className="font-semibold">Recording</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={onStartRecording}><Video className="size-4" />Start</Button>
            <Button size="sm" variant="outline" onClick={onStopRecording}>Stop</Button>
          </div>
          {recordings.map((recording) => (
            <div className="rounded-xl bg-black/20 p-3" key={recording.id}>
              <p className="text-sm font-medium">{recording.status}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onDownloadRecording(recording.id)}>Download</Button>
                <Button size="sm" variant="outline" onClick={() => onRemoveRecording(recording.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <h3 className="font-semibold">Breakout rooms</h3>
        <form className="grid gap-2" onSubmit={breakoutForm.handleSubmit(onCreateBreakout)}>
          <Input placeholder="Room name" {...breakoutForm.register("name")} />
          <Input placeholder="Participant UUIDs, comma separated" {...breakoutForm.register("participantIds")} />
          <Button type="submit"><LayoutGrid className="size-4" />Create room</Button>
        </form>
        <form className="flex gap-2" onSubmit={broadcastForm.handleSubmit(onBroadcast)}>
          <Input placeholder="Broadcast message" {...broadcastForm.register("message")} />
          <Button size="icon" type="submit" aria-label="Broadcast"><MessageSquare className="size-4" /></Button>
        </form>
        <Button size="sm" variant="outline" onClick={onEndAllBreakouts}>End all</Button>
        {breakouts.map((room) => (
          <div className="flex items-center justify-between rounded-xl bg-black/20 p-3" key={room.id}>
            <span className="text-sm font-medium">{room.name}</span>
            <Button size="sm" variant="outline" onClick={() => onJoinBreakout(room.id)}>Join</Button>
          </div>
        ))}
      </section>

      {isHost ? (
        <section className="space-y-3 rounded-2xl bg-red-500/10 p-4">
          <h3 className="font-semibold text-red-100">Danger zone</h3>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onEndMeeting}>End meeting</Button>
            <Button size="sm" variant="outline" onClick={onDeleteMeeting}>Delete meeting</Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function MeetingDetailPage() {
  return (
    <ProtectedRoute>
      <MeetingDetailContent />
    </ProtectedRoute>
  );
}
