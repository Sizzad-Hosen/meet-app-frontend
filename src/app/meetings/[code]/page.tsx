"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Room } from "livekit-client";
import {
  DoorOpen,
  Megaphone,
  Mic,
  MonitorUp,
  Radio,
  ShieldCheck,
  Video,
} from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LiveRoom } from "@/components/meeting/live-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMeetingSocket } from "@/hooks/use-meeting-socket";
import { getApiErrorMessage } from "@/lib/api-error";
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
  useApproveScreenShareMutation,
  useDenyScreenShareMutation,
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

function MeetingDetailContent() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params?.code ?? "";
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const [liveKitToken, setLiveKitToken] = useState("");
  const [joinStatus, setJoinStatus] = useState("");
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
  const waiting = useGetWaitingRoomQuery(code, { pollingInterval: 3000 });
  const participants = useGetParticipantsQuery(code, { pollingInterval: 3000 });
  const breakouts = useGetBreakoutsQuery(code);
  const polls = useGetPollsQuery(code, { pollingInterval: 3000 });
  const screenShare = useGetScreenShareStatusQuery(code);
  const meetingId = meeting.data?.data.id;
  const recordings = useGetRecordingsQuery(meetingId ?? "", { skip: !meetingId });

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
  const [approveScreenShare] = useApproveScreenShareMutation();
  const [denyScreenShare] = useDenyScreenShareMutation();
  const [startRecording] = useStartRecordingMutation();
  const [stopRecording] = useStopRecordingMutation();
  const [deleteRecording] = useDeleteRecordingMutation();
  const [getRecordingDownload] = useLazyGetRecordingDownloadQuery();
  const [getLiveKitToken, liveKitTokenState] = useGetLiveKitTokenMutation();
  const [autoTokenRequested, setAutoTokenRequested] = useState(false);

  const pollForm = useForm<PollFormValues>({
    resolver: zodResolver(createPollSchema),
  });
  const breakoutForm = useForm<BreakoutFormValues>({
    resolver: zodResolver(breakoutSchema),
  });
  const broadcastForm = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
  });
  const updateForm = useForm<UpdateMeetingFormValues>({
    resolver: zodResolver(updateMeetingSchema),
    values: {
      title: meeting.data?.data.title ?? "",
      max_participants: meeting.data?.data.max_participants ?? 100,
      scheduled_at: meeting.data?.data.scheduled_at?.slice(0, 16) ?? "",
      waiting_room_on: meeting.data?.data.waiting_room_on ?? true,
      allow_screenshare: meeting.data?.data.allow_screenshare ?? true,
      screenshare_needs_approval:
        meeting.data?.data.screenshare_needs_approval ?? false,
      is_recorded: meeting.data?.data.is_recorded ?? false,
    },
  });

  async function run(action: () => Promise<unknown>) {
    setMessage("");
    try {
      await action();
      setMessage("Action completed successfully.");
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleCreatePoll(values: PollFormValues) {
    const options = [values.optionA, values.optionB, values.optionC].filter(Boolean) as string[];
    await run(() => createPoll({ code, body: { question: values.question, options } }).unwrap());
    pollForm.reset();
  }

  async function handleCreateBreakout(values: BreakoutFormValues) {
    const participantIds = values.participantIds
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await run(() =>
      createBreakouts({
        code,
        body: {
          rooms: [{ name: values.name, participantIds }],
        },
      }).unwrap(),
    );
    breakoutForm.reset();
  }

  async function handleBroadcast(values: BroadcastFormValues) {
    await run(() => broadcastBreakout({ code, body: values }).unwrap());
    broadcastForm.reset();
  }

  async function handleLiveKit() {
    setMessage("");
    try {
      const result = await getLiveKitToken({ joinCode: code }).unwrap();
      setLiveKitToken(result.data.token);
      setAutoTokenRequested(true);
      setMessage("LiveKit token generated.");
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
        setMessage("Joined live meeting.");
        return;
      }

      setMessage(
        participantStatus === "waiting"
          ? "You joined the waiting room. The host must admit you before LiveKit can start."
          : result.message,
      );
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  async function handleUpdateMeeting(values: UpdateMeetingFormValues) {
    await run(() =>
      updateMeeting({
        code,
        body: {
          ...values,
          scheduled_at: values.scheduled_at || null,
        },
      }).unwrap(),
    );
  }

  async function handleLeaveMeeting() {
    await run(async () => {
      await leaveMeeting(code).unwrap();
      router.push("/");
    });
  }

  async function handleDeleteMeeting() {
    await run(async () => {
      await deleteMeeting(code).unwrap();
      router.push("/");
    });
  }

  async function handleStartScreenShare() {
    await run(async () => {
      if (!liveKitToken) {
        const result = await getLiveKitToken({ joinCode: code }).unwrap();
        setLiveKitToken(result.data.token);
      }

      await liveKitRoom.localParticipant.setScreenShareEnabled(true, { audio: true });
      await startScreenShare(code).unwrap();
    });
  }

  async function handleStopScreenShare() {
    await run(async () => {
      await liveKitRoom.localParticipant.setScreenShareEnabled(false);
      await stopScreenShare(code).unwrap();
    });
  }

  async function handleCopyMeetingLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/meetings/${code}`);
    setMessage("Meeting link copied.");
  }

  const waitingUsers = waiting.data?.data ?? [];
  const participantUsers = participants.data?.data ?? [];
  const breakoutRooms = Array.isArray(breakouts.data?.data)
    ? breakouts.data.data
    : breakouts.data?.data.rooms ?? [];
  const pollItems = polls.data?.data ?? [];
  const recordingItems = recordings.data?.data ?? [];
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:7880";
  const getParticipantUserId = (participant: (typeof participantUsers)[number]) =>
    participant.user_id ?? participant.userId ?? participant.user?.id ?? "";
  const getParticipantLabel = (participant: (typeof participantUsers)[number]) =>
    participant.user?.email ??
    participant.email ??
    participant.user?.name ??
    participant.name ??
    getParticipantUserId(participant) ??
    participant.id;
  const currentParticipant = participantUsers.find(
    (participant) => getParticipantUserId(participant) === user?.id,
  );
  const getPollOptionText = (option: (typeof pollItems)[number]["options"][number]) =>
    option.text ?? option.option ?? option.id;
  const getPollOptionVoteCount = (option: (typeof pollItems)[number]["options"][number]) =>
    option.voteCount ?? option.votes ?? 0;
  const getPollTotalVotes = (poll: (typeof pollItems)[number]) =>
    poll.totalVotes ?? poll.options?.reduce((sum, option) => sum + getPollOptionVoteCount(option), 0) ?? 0;
  const getPollOptionPercent = (poll: (typeof pollItems)[number], option: (typeof pollItems)[number]["options"][number]) => {
    const totalVotes = getPollTotalVotes(poll);
    const voteCount = getPollOptionVoteCount(option);

    return option.percent ?? (totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0);
  };
  const isPollOptionSelected = (poll: (typeof pollItems)[number], option: (typeof pollItems)[number]["options"][number]) =>
    option.selected || poll.myVoteOptionId === option.id;
  const isHost =
    meeting.data?.data.host_id === user?.id || currentParticipant?.role === "host";
  const canModerate = isHost || currentParticipant?.role === "cohost";
  const isAdmitted =
    currentParticipant?.status === "admitted" ||
    joinStatus === "admitted" ||
    Boolean(liveKitToken);

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
        setMessage("You were admitted. Joining live meeting.");
      })
      .catch((error) => {
        setMessage(getApiErrorMessage(error));
      });
  }, [
    autoTokenRequested,
    code,
    currentParticipant?.status,
    getLiveKitToken,
    liveKitToken,
    liveKitTokenState.isLoading,
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <Link className="text-sm font-medium text-cyan-700" href="/">
              Back to dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {meeting.data?.data.title ?? "Meeting"} · {code}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Socket {socket.status}</Badge>
            <Badge>{meeting.data?.data.status ?? "loading"}</Badge>
            <Button variant="outline" onClick={handleCopyMeetingLink}>
              Copy link
            </Button>
            <Button variant="outline" onClick={handleLeaveMeeting}>
              Leave
            </Button>
            <Button onClick={handleJoinMeeting}>
              Join meeting
            </Button>
            {isHost ? (
              <>
                <Button variant="outline" onClick={() => run(() => endMeeting(code).unwrap())}>
                  End meeting
                </Button>
                <Button variant="outline" onClick={handleDeleteMeeting}>
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        </header>

        <FormMessage message={message} tone={message.includes("success") || message.includes("generated") ? "success" : "info"} />
        {joinStatus ? (
          <Badge variant={joinStatus === "admitted" ? "success" : "warning"}>
            Your status: {joinStatus}
          </Badge>
        ) : null}

        {liveKitToken ? (
          <LiveRoom room={liveKitRoom} serverUrl={liveKitUrl} token={liveKitToken} />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="grid gap-6">
            {canModerate ? (
            <Card>
              <CardHeader>
                <CardTitle>Meeting settings</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form
                  className="grid gap-3 md:grid-cols-2"
                  onSubmit={updateForm.handleSubmit(handleUpdateMeeting)}
                >
                  <Input placeholder="Meeting title" {...updateForm.register("title")} />
                  <Input
                    min={2}
                    placeholder="Max participants"
                    type="number"
                    {...updateForm.register("max_participants", {
                      valueAsNumber: true,
                    })}
                  />
                  <Input type="datetime-local" {...updateForm.register("scheduled_at")} />
                  <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
                    {[
                      ["waiting_room_on", "Waiting room"],
                      ["allow_screenshare", "Allow screen share"],
                      ["screenshare_needs_approval", "Require share approval"],
                      ["is_recorded", "Record meeting"],
                    ].map(([name, label]) => (
                      <label
                        className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        key={name}
                      >
                        <input
                          className="size-4 accent-cyan-600"
                          type="checkbox"
                          {...updateForm.register(name as keyof UpdateMeetingFormValues)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <Button type="submit">Update meeting</Button>
                </form>
              </CardContent>
            </Card>
            ) : null}

            {canModerate ? (
            <Card>
              <CardHeader>
                <CardTitle>Waiting room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <Button size="sm" onClick={() => run(() => admitAll(code).unwrap())}>
                  Admit all
                </Button>
                {waitingUsers.length === 0 ? (
                  <p className="text-sm text-slate-500">No users waiting.</p>
                ) : (
                  waitingUsers.map((participant) => (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3" key={participant.id}>
                      <span className="text-sm text-slate-700">{getParticipantLabel(participant)}</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => run(() => admitParticipant({ code, userId: getParticipantUserId(participant) }).unwrap())}>
                          Admit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => run(() => denyParticipant({ code, userId: getParticipantUserId(participant) }).unwrap())}>
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {canModerate ? (
                <Button size="sm" variant="outline" onClick={() => run(() => muteAll(code).unwrap())}>
                  <Mic className="size-4" />
                  Mute all
                </Button>
                ) : null}
                {participantUsers.map((participant) => (
                  <div className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_auto]" key={participant.id}>
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{getParticipantLabel(participant)}</p>
                      <p className="text-slate-500">{participant.role} · {participant.status}</p>
                    </div>
                    {canModerate ? (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => run(() => muteParticipant({ code, userId: getParticipantUserId(participant) }).unwrap())}>Mute</Button>
                        {isHost ? (
                          <Button size="sm" variant="outline" onClick={() => run(() => assignCohost({ code, userId: getParticipantUserId(participant) }).unwrap())}>Co-host</Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => run(() => kickParticipant({ code, userId: getParticipantUserId(participant) }).unwrap())}>Kick</Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Polls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                {canModerate ? (
                  <form className="grid gap-3 md:grid-cols-2" onSubmit={pollForm.handleSubmit(handleCreatePoll)}>
                    <Input placeholder="Question" {...pollForm.register("question")} />
                    <Input placeholder="Option A" {...pollForm.register("optionA")} />
                    <Input placeholder="Option B" {...pollForm.register("optionB")} />
                    <Input placeholder="Option C" {...pollForm.register("optionC")} />
                    <Button type="submit"><Radio className="size-4" />Create poll</Button>
                  </form>
                ) : null}
                {pollItems.length === 0 ? (
                  <p className="text-sm text-slate-500">No polls yet.</p>
                ) : null}
                {pollItems.map((poll) => (
                  <div className="rounded-md border border-slate-200 p-3" key={poll.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{poll.question}</p>
                        <p className="text-xs text-slate-500">
                          {getPollTotalVotes(poll)} vote{getPollTotalVotes(poll) === 1 ? "" : "s"}
                          {(poll.is_closed || poll.isClosed) ? " - closed" : ""}
                        </p>
                      </div>
                      {canModerate && !(poll.is_closed || poll.isClosed) ? (
                        <Button size="sm" variant="outline" onClick={() => run(() => closePoll({ code, pollId: poll.id }).unwrap())}>Close</Button>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-2">
                      {poll.options?.map((option) => (
                        <button
                          className="relative overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-75"
                          disabled={poll.is_closed || poll.isClosed}
                          key={option.id}
                          onClick={() => run(() => submitVote({ code, pollId: poll.id, body: { optionId: option.id } }).unwrap())}
                          type="button"
                        >
                          <span
                            className="absolute inset-y-0 left-0 bg-cyan-100"
                            style={{ width: `${getPollOptionPercent(poll, option)}%` }}
                          />
                          <span className="relative flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-800">
                              {isPollOptionSelected(poll, option) ? "Selected: " : ""}
                              {getPollOptionText(option)}
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-slate-600">
                              {getPollOptionVoteCount(option)} - {getPollOptionPercent(poll, option)}%
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <aside className="grid content-start gap-6">
            {canModerate ? (
            <Card>
              <CardHeader>
                <CardTitle>Breakout rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                <form className="space-y-3" onSubmit={breakoutForm.handleSubmit(handleCreateBreakout)}>
                  <Input placeholder="Room name" {...breakoutForm.register("name")} />
                  <Input placeholder="Participant UUIDs, comma separated" {...breakoutForm.register("participantIds")} />
                  <Button type="submit"><DoorOpen className="size-4" />Create room</Button>
                </form>
                <form className="flex gap-2" onSubmit={broadcastForm.handleSubmit(handleBroadcast)}>
                  <Input placeholder="Broadcast message" {...broadcastForm.register("message")} />
                  <Button size="icon" type="submit" aria-label="Broadcast"><Megaphone className="size-4" /></Button>
                </form>
                <Button size="sm" variant="outline" onClick={() => run(() => endAllBreakouts(code).unwrap())}>End all</Button>
                {breakoutRooms.map((room) => (
                  <div className="flex items-center justify-between rounded-md border border-slate-200 p-3" key={room.id}>
                    <span className="text-sm font-medium text-slate-800">{room.name}</span>
                    <Button size="sm" variant="outline" onClick={() => run(() => joinBreakout({ code, roomId: room.id }).unwrap())}>Join</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Screen share</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <p className="text-sm text-slate-500">Status: {screenShare.data?.data.status ?? String(screenShare.data?.data.active ?? "unknown")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={!isAdmitted} size="sm" onClick={handleStartScreenShare}><MonitorUp className="size-4" />Start</Button>
                  <Button disabled={!isAdmitted} size="sm" variant="outline" onClick={handleStopScreenShare}>Stop</Button>
                  {canModerate && participantUsers[0] ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => run(() => approveScreenShare({ code, userId: getParticipantUserId(participantUsers[0]) }).unwrap())}>Approve first</Button>
                      <Button size="sm" variant="outline" onClick={() => run(() => denyScreenShare({ code, userId: getParticipantUserId(participantUsers[0]) }).unwrap())}>Deny first</Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {isHost ? (
            <Card>
              <CardHeader>
                <CardTitle>Recordings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => run(() => startRecording(code).unwrap())}><Video className="size-4" />Start</Button>
                  <Button size="sm" variant="outline" onClick={() => run(() => stopRecording(code).unwrap())}>Stop</Button>
                </div>
                {recordingItems.map((recording) => (
                  <div className="rounded-md border border-slate-200 p-3" key={recording.id}>
                    <p className="text-sm font-medium text-slate-800">{recording.status}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => run(() => getRecordingDownload(recording.id).unwrap())}>Download URL</Button>
                      <Button size="sm" variant="outline" onClick={() => run(() => deleteRecording(recording.id).unwrap())}>Delete</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>LiveKit entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <Button onClick={handleLiveKit}><ShieldCheck className="size-4" />Generate token</Button>
                {liveKitToken ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    Token ready. LiveKit URL: {process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:7880"}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Socket.IO events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {socket.events.length === 0 ? <p className="text-sm text-slate-500">No socket events yet.</p> : null}
                {socket.events.map((event) => (
                  <p className="rounded-md bg-slate-100 p-2 text-xs text-slate-600" key={event}>{event}</p>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function MeetingDetailPage() {
  return (
    <ProtectedRoute>
      <MeetingDetailContent />
    </ProtectedRoute>
  );
}
