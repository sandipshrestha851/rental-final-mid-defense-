"use client";

import React from "react";
import { Send, Users } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { Message, User } from "@/lib/types";
import { Avatar } from "@/components/atoms/Presence";
import { Button } from "@/components/atoms/Button";

/** A selectable user row in the sidebar. */
export function UserListItem({
  user,
  selected,
  onSelect,
}: {
  user: User;
  selected: boolean;
  onSelect: (user: User) => void;
}) {
  return (
    <button
      onClick={() => onSelect(user)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors",
        selected
          ? "bg-indigo-600/20 text-white"
          : "hover:bg-zinc-800 text-zinc-300"
      )}
    >
      <Avatar name={user.full_name} online={user.is_online} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.full_name}</p>
        <p className="text-xs text-zinc-500">
          {user.is_online ? "Online" : "Offline"}
        </p>
      </div>
    </button>
  );
}

/** A single chat bubble, aligned by ownership. */
export function MessageBubble({
  message,
  mine,
}: {
  message: Message;
  mine: boolean;
}) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
          mine
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-zinc-800 text-zinc-100 rounded-bl-md"
        )}
      >
        <p className="break-words">{message.message}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            mine ? "text-indigo-200" : "text-zinc-500"
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

/** The message composer at the bottom of the chat window. */
export function MessageInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <Button variant="icon" type="submit" disabled={!value.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}

/** Header above the message thread showing the active conversation partner. */
export function ChatTopbar({
  user,
  typing,
  onOpenSidebar,
}: {
  user: User;
  typing: boolean;
  onOpenSidebar: () => void;
}) {
  const status = typing ? "typing..." : user.is_online ? "Online" : "Offline";
  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-3">
      <button
        className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
        onClick={onOpenSidebar}
      >
        <Users className="h-5 w-5" />
      </button>
      <Avatar name={user.full_name} online={user.is_online} />
      <div>
        <p className="font-semibold text-sm">{user.full_name}</p>
        <p className="text-xs text-zinc-400">{status}</p>
      </div>
    </div>
  );
}
