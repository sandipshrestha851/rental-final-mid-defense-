"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface TopBarProps {
  role: string;
  page: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export default function TopBar({ role, page, searchQuery, onSearchChange }: TopBarProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      setUnreadCount(res.unreadCount);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const avatarSrc = user?.full_name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=5E35B1&color=fff&size=38`
    : "https://i.pravatar.cc/64?img=12";

  return (
    <header className="flex items-center justify-between h-17.5 shrink-0 bg-white border-b border-[#e6e4f3] px-8 rounded-t-xl">
      <div className="flex items-center gap-1.5 text-sm text-[#6b6b7c]">
        <span>{role}</span>
        <span>/</span>
        <span className="text-[#5b3fd6] font-semibold">{page}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-[#f2f1f8] rounded-xl px-4 py-2 text-[#9997ad] text-sm w-80">
          <Search className="w-4 h-4" />
          <input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search properties, bookings..."
            className="bg-transparent border-none outline-none w-full text-sm text-[#1c1b2e] placeholder:text-[#9997ad]"
          />
        </div>
        <div className="relative text-[#555267] flex cursor-pointer">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-[1.5px] border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white" />
          )}
        </div>
        <img className="w-9.5 h-9.5 rounded-full object-cover bg-[#d8d5ec]" src={avatarSrc} alt="Avatar" />
      </div>
    </header>
  );
}
