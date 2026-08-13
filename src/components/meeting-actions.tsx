"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { MeetingHomeScreen } from "@/components/meeting/meeting-home-screen";
import { MeetingReadyScreen } from "@/components/meeting/meeting-ready-screen";
import { MeetingRoom } from "@/components/meeting/meeting-room";
import { WaitingScreen } from "@/components/meeting/waiting-screen";
import type { ActiveSession, WaitingSession } from "@/components/meeting/meeting.types";
import { useRefreshTokenMutation } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";

export function MeetingActions() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const authInitialized = useAppSelector((state) => state.auth.initialized);
  const [refreshToken] = useRefreshTokenMutation();
  const refreshStarted = useRef(false);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [readyMeeting, setReadyMeeting] = useState<ActiveSession | null>(null);
  const [waiting, setWaiting] = useState<WaitingSession | null>(null);

  useEffect(() => {
    if (accessToken || authInitialized || refreshStarted.current) return;
    refreshStarted.current = true;
    void refreshToken();
  }, [accessToken, authInitialized, refreshToken]);

  const clearMeetingState = useCallback(() => {
    setSession(null);
    setReadyMeeting(null);
    setWaiting(null);
  }, []);

  const enterMeeting = useCallback((nextSession: ActiveSession) => {
    setWaiting(null);
    setReadyMeeting(null);
    setSession(nextSession);
  }, []);

  if (!authInitialized) {
    return <main className="grid min-h-screen place-items-center bg-white text-sm text-slate-500">Restoring your session...</main>;
  }
  if (!accessToken) return <AuthScreen onAuthenticated={clearMeetingState} />;
  if (session) return <MeetingRoom onExit={() => setSession(null)} session={session} />;
  if (waiting) return <WaitingScreen onAdmitted={enterMeeting} onCancel={() => setWaiting(null)} waiting={waiting} />;
  if (readyMeeting) return <MeetingReadyScreen meeting={readyMeeting} onBack={() => setReadyMeeting(null)} onStart={enterMeeting} />;

  return <MeetingHomeScreen onCreated={setReadyMeeting} onSession={enterMeeting} onWaiting={setWaiting} />;
}
