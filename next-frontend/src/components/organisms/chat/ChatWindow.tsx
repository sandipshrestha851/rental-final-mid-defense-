"use client";

import React, { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import type { AuthUser, Message, User } from "@/lib/types";
import {
  ChatTopbar,
  MessageBubble,
  MessageInput,
} from "@/components/molecules/chat";

interface ChatWindowProps {
  currentUser: AuthUser;
  selectedUser: User | null;
  messages: Message[];
  draft: string;
  typing: boolean;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onOpenSidebar: () => void;
}

export function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  draft,
  typing,
  onDraftChange,
  onSend,
  onOpenSidebar,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <button
          className="md:hidden mb-6 px-4 py-2 rounded-xl bg-zinc-800 text-sm text-zinc-300"
          onClick={onOpenSidebar}
        >
          Show Users
        </button>
        <MessageSquare className="h-16 w-16 mb-4 text-zinc-700" />
        <p className="text-lg font-medium text-zinc-400">
          Select a user to start chatting
        </p>
        <p className="text-sm mt-1">Pick someone from the sidebar</p>
      </div>
    );
  }

  // Only show messages that belong to this specific conversation.
  const thread = messages.filter(
    (m) =>
      (m.sender_id === currentUser.id &&
        m.receiver_id === selectedUser.id) ||
      (m.sender_id === selectedUser.id && m.receiver_id === currentUser.id)
  );

  return (
    <>
      <ChatTopbar
        user={selectedUser}
        typing={typing}
        onOpenSidebar={onOpenSidebar}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {thread.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            mine={msg.sender_id === currentUser.id}
          />
        ))}
        <div ref={endRef} />
      </div>

      <MessageInput value={draft} onChange={onDraftChange} onSend={onSend} />
    </>
  );
}
