"use client";

import React from "react";
import { ChatApp } from "@/components/organisms/chat/ChatApp";

/**
 * The content area shown to the right of a dashboard's fixed nav.
 * Renders the embedded chat when the "messages" tab is active, and a
 * light placeholder for the other (not-yet-built) dashboard tabs.
 */
export function DashboardMain({ navto }: { navto: string }) {
  // if (navto === "messages") {
  //   return (
  //     <main className="ml-[15%] w-[85%] h-screen p-4 bg-[#0f0f1a]">
  //       <ChatApp embedded loginPath="/signin" />
  //     </main>
  //   );
  // }

  const label = navto.charAt(0).toUpperCase() + navto.slice(1);
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f5ff]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">{label}</h2>
        <p className="mt-2 text-slate-500">
          This section is coming soon. Open{" "}
          <span className="font-semibold text-violet-700">Messages</span> to
          start chatting.
        </p>
      </div>
    </main>
  );
}
