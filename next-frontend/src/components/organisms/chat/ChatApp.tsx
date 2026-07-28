"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useChatSocket } from "@/hooks/useChatSocket";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";

/** Top-level chat screen: guards auth, loads data, wires the socket. */
export function ChatApp({
  embedded = false,
  loginPath = "/chat/login",
}: {
  /** When true, fills its parent container instead of the whole viewport. */
  embedded?: boolean;
  /** Where to send unauthenticated users. */
  loginPath?: string;
} = {}) {
  const router = useRouter();
  const { token, user: currentUser, ready, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Update a single user's online flag (called from the socket hook).
  const handleStatusChange = useCallback((userId: number, online: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_online: online } : u))
    );
    setSelectedUser((prev) =>
      prev && prev.id === userId ? { ...prev, is_online: online } : prev
    );
  }, []);

  const { connected, messages, setMessages, typingUserId, sendMessage, notifyTyping } =
    useChatSocket({ token, onStatusChange: handleStatusChange });

  // Redirect to login once we know there's no session.
  useEffect(() => {
    if (ready && !token && !currentUser) {
      router.push(loginPath);
    }
  }, [ready, token, currentUser, router, loginPath]);

  // Load the user list once authenticated.
  useEffect(() => {
    if (!currentUser) return;
    api
      .getUsers()
      .then(setUsers)
      .catch((err) => console.error("Failed to fetch users:", err));
  }, [currentUser]);

  const handleSelectUser = useCallback(
    async (user: User) => {
      setSelectedUser(user);
      setMessages([]);
      if (window.innerWidth < 768) setSidebarOpen(false);
      try {
        const history = await api.getMessages(user.id);
        setMessages(history);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    },
    [setMessages]
  );

  const handleSend = useCallback(() => {
    if (!selectedUser) return;
    sendMessage(selectedUser.id, draft);
    setDraft("");
  }, [selectedUser, draft, sendMessage]);

  const handleDraftChange = useCallback(
    (value: string) => {
      setDraft(value);
      if (selectedUser) notifyTyping(selectedUser.id);
    },
    [selectedUser, notifyTyping]
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push(loginPath);
  }, [logout, router, loginPath]);

  // Wait for the session check before rendering anything.
  if (!ready || !currentUser) return null;

  return (
    <div
      className={
        embedded
          ? "relative flex h-full bg-zinc-950 text-white overflow-hidden rounded-2xl border border-zinc-800"
          : "flex h-screen bg-zinc-950 text-white overflow-hidden"
      }
    >
      <ChatSidebar
        open={sidebarOpen}
        embedded={embedded}
        currentUser={currentUser}
        users={users}
        selectedUser={selectedUser}
        searchQuery={searchQuery}
        connected={connected}
        onSearch={setSearchQuery}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          className={
            (embedded ? "absolute" : "fixed") +
            " inset-0 bg-black/50 z-20 md:hidden"
          }
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          currentUser={currentUser}
          selectedUser={selectedUser}
          messages={messages}
          draft={draft}
          typing={
            selectedUser !== null && typingUserId === selectedUser.id
          }
          onDraftChange={handleDraftChange}
          onSend={handleSend}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
