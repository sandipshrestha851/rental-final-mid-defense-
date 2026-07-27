"use client";

import React from "react";
import TopBar from "@/components/ui/TopBar";

export function DashboardMain({ navto, role = "Landlord" }: { navto: string; role?: string }) {
  const label = navto.charAt(0).toUpperCase() + navto.slice(1);
  return (
    <div className="flex flex-col min-h-0">
      <TopBar role={role} page={label} />
      <main className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-[#f6f5ff]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">{label}</h2>
          <p className="mt-2 text-slate-500">
            This section is coming soon. Open{" "}
            <span className="font-semibold text-violet-700">Messages</span> to
            start chatting.
          </p>
        </div>
      </main>
    </div>
  );
}
