import React from "react";
import { MessageSquare } from "lucide-react";
import { IconBadge } from "@/components/atoms/Presence";

/** Brand icon + title + subtitle shown above an auth form. */
export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconBadge className="h-16 w-16 shadow-lg shadow-indigo-500/20">
        <MessageSquare className="h-9 w-9 text-white" />
      </IconBadge>
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}

/** Frosted-glass card that wraps the auth form body. */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/40">
      {children}
    </div>
  );
}
