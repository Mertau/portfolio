"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSession } from "next-auth/react";

type WSStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseWebSocketOptions {
  endpoint: string;
  onMessage: (data: unknown) => void;
  reconnectInterval?: number;
  maxReconnects?: number;
}

export function useWebSocket({
  endpoint,
  onMessage,
  reconnectInterval = 3000,
  maxReconnects = 5,
}: UseWebSocketOptions) {
  const { data: session } = useSession();
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<WSStatus>("disconnected");

  const connect = useCallback(() => {
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;
    if (!accessToken) return;

    const wsBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const url = `${wsBase}/api/v1/ws/${endpoint}?token=${accessToken}`;
    setStatus("connecting");

    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      setStatus("connected");
      reconnectCount.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // ignore parse errors
      }
    };

    socket.onerror = () => setStatus("error");

    socket.onclose = () => {
      setStatus("disconnected");
      if (reconnectCount.current < maxReconnects) {
        reconnectCount.current += 1;
        reconnectTimer.current = setTimeout(connect, reconnectInterval);
      }
    };
  }, [session, endpoint, onMessage, reconnectInterval, maxReconnects]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    ws.current?.close();
    setStatus("disconnected");
  }, []);

  const send = useCallback((data: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, send, disconnect, reconnect: connect };
}
