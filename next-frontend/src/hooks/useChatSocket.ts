"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";
import type { Message } from "@/lib/types";

interface UseChatSocketOptions {
  token: string | null;
  onStatusChange?: (userId: number, online: boolean) => void;
}

export function useChatSocket({
  token,
  onStatusChange,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user_status", ({ user_id, status }) => {
      if (onStatusChange) {
        onStatusChange(user_id, status === "online");
      }
    });

    socket.on("user_typing", ({ sender_id, is_typing }) => {
      setTypingUserId(is_typing ? sender_id : null);
      setTimeout(() => setTypingUserId(null), 3000);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onStatusChange]);

  const sendMessage = useCallback((receiverId: number, text: string) => {
    if (socketRef.current?.connected && token) {
      socketRef.current.emit("send_message", {
        token,
        receiver_id: receiverId,
        message: text,
      });
    }
  }, [token]);

  const notifyTyping = useCallback((receiverId: number) => {
    if (socketRef.current?.connected && token) {
      socketRef.current.emit("typing", {
        token,
        receiver_id: receiverId,
        is_typing: true,
      });
    }
  }, [token]);

  return { connected, messages, setMessages, typingUserId, sendMessage, notifyTyping };
}
