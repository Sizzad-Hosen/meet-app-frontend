"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8000";

export function useMeetingSocket(code: string, token?: string | null) {
  const [status, setStatus] = useState("disconnected");
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!code || !token) {
      return;
    }

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("meeting:join", code, (response: unknown) => {
        setEvents((current) => [`meeting:join ${JSON.stringify(response)}`, ...current].slice(0, 5));
      });
    });
    socket.on("connect_error", (error) => setStatus(error.message));
    socket.onAny((event, payload) => {
      setEvents((current) => [`${event} ${JSON.stringify(payload)}`, ...current].slice(0, 5));
    });

    return () => {
      socket.disconnect();
      setStatus("disconnected");
    };
  }, [code, token]);

  return { events, status };
}
