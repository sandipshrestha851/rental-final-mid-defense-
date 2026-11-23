"use client";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";

interface TopBarProps {
  role: string;
  page: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export default function TopBar({ role, page, searchQuery, onSearchChange }: TopBarProps) {
  const { user } = useAuth();

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
        <div className="flex items-center gap-2 bg-[#f2f1f8] rounded-xl px-4 py-2 text-[#9997ad] text-sm w-full max-w-80">
          <Search className="w-4 h-4 shrink-0" />
          <input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search properties, bookings..."
            className="bg-transparent border-none outline-none w-full text-sm text-[#1c1b2e] placeholder:text-[#9997ad]"
          />
        </div>
        
        {/* Real-time Notification Dropdown */}
        <NotificationDropdown />
        
        <img className="w-9.5 h-9.5 rounded-full object-cover bg-[#d8d5ec]" src={avatarSrc} alt="Avatar" />
      </div>
    </header>
  );
}

