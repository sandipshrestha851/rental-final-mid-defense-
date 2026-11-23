"use client";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminHeaderProps {
  page: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export default function AdminHeader({ page, searchQuery, onSearchChange }: AdminHeaderProps) {
  const { user } = useAuth();

  const avatarSrc = user?.full_name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=5E35B1&color=fff&size=38`
    : "https://i.pravatar.cc/64?img=47";

  return (
    <header className="flex items-center justify-between h-17.5 shrink-0 bg-white border-b border-slate-200 px-8 rounded-t-xl">
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <span>Admin</span>
        <span className="text-slate-300">/</span>
        <span className="text-violet-600 font-semibold">{page}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 text-slate-400 text-sm w-full max-w-80 border border-slate-200">
          <Search className="w-4 h-4 shrink-0" />
          <input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search properties, bookings..."
            className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="relative text-slate-500 flex cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-[1.5px] border-white" />
        </div>
        <img className="w-9.5 h-9.5 rounded-full object-cover bg-slate-200" src={avatarSrc} alt="Avatar" />
      </div>
    </header>
  );
}
