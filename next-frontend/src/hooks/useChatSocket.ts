"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";
import type { Message } from "@/lib/types";

interface UseChatSocketArgs {
  token: string | null;
  /** Called when a user's online status changes. */
  onStatusChange: (userId: number, online: boolean) => void;
}

/**
 * Owns the socket.io lifecycle: connection, incoming messages,
 * presence updates and typing relays. Exposes imperative senders.
 */
export function useChatSocket({ token, onStatusChange }: UseChatSocketArgs) {
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);

  // Keep the latest status callback without re-subscribing the socket.
  const statusRef = useRef(onStatusChange);
  statusRef.current = onStatusChange;

  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    });

    socket.on(
      "user_status",
      (data: { user_id: number; status: string }) => {
        statusRef.current(data.user_id, data.status === "online");
      }
    );

    socket.on(
      "user_typing",
      (data: { sender_id: number; is_typing: boolean }) => {
        setTypingUserId((prev) =>
          data.is_typing
            ? data.sender_id
            : prev === data.sender_id
            ? null
            : prev
        );
      }
    );

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const sendMessage = useCallback(
    (receiverId: number, text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !token || !socketRef.current) return;
      socketRef.current.emit("send_message", {
        token,
        receiver_id: receiverId,
        message: trimmed,
      });
      socketRef.current.emit("typing", {
        token,
        receiver_id: receiverId,
        is_typing: false,
      });
    },
    [token]
  );

  const notifyTyping = useCallback(
    (receiverId: number) => {
      if (!token || !socketRef.current) return;
      socketRef.current.emit("typing", {
        token,
        receiver_id: receiverId,
        is_typing: true,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", {
          token,
          receiver_id: receiverId,
          is_typing: false,
        });
      }, 2000);
    },
    [token]
  );

  return {
    connected,
    messages,
    setMessages,
    typingUserId,
    sendMessage,
    notifyTyping,
    disconnect: () => socketRef.current?.disconnect(),
  };
}
