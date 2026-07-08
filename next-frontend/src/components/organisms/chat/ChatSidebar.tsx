"use client";

import React from "react";
import { LogOut, Search, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser, User } from "@/lib/types";
import { IconBadge } from "@/components/atoms/Presence";
import { Button } from "@/components/atoms/Button";
import { UserListItem } from "@/components/molecules/chat";

interface ChatSidebarProps {
  open: boolean;
  embedded?: boolean;
  currentUser: AuthUser;
  users: User[];
  selectedUser: User | null;
  searchQuery: string;
  connected: boolean;
  onSearch: (v: string) => void;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

export function ChatSidebar({
  open,
  embedded = false,
  currentUser,
  users,
  selectedUser,
  searchQuery,
  connected,
  onSearch,
  onSelectUser,
  onLogout,
}: ChatSidebarProps) {
  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={cn(
        "inset-y-0 left-0 z-30 w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200 md:static md:translate-x-0",
        embedded ? "absolute" : "fixed",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconBadge className="h-10 w-10 rounded-xl">
              <MessageSquare className="h-5 w-5 text-white" />
            </IconBadge>
            <div>
              <h1 className="font-bold text-sm">ChatApp</h1>
              <p className="text-xs text-zinc-400 truncate max-w-[10rem]">
                {currentUser.full_name}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5" />
            Users ({filtered.length})
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-zinc-500 text-sm py-8">
              No users found
            </p>
          )}
          {filtered.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              selected={selectedUser?.id === user.id}
              onSelect={onSelectUser}
            />
          ))}
        </div>
      </div>

      {/* Connection status */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              connected ? "bg-emerald-400" : "bg-red-400"
            )}
          />
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>
    </div>
  );
}
