import React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { initial } from "@/lib/utils";

/** Gradient rounded badge used for logos / brand icons. */
export function IconBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Small colored dot indicating online / offline status. */
export function OnlineDot({
  online,
  className,
}: {
  online: boolean;
  className?: string;
}) {
  return (
    <Circle
      className={cn(
        "h-3.5 w-3.5",
        online
          ? "text-emerald-400 fill-emerald-400"
          : "text-zinc-600 fill-zinc-600",
        className
      )}
    />
  );
}

/** Circular avatar showing the user's initial, with an optional presence dot. */
export function Avatar({
  name,
  online,
  size = "md",
}: {
  name: string;
  online?: boolean;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? "h-10 w-10" : "h-10 w-10";
  return (
    <div className="relative">
      <div
        className={cn(
          dimension,
          "rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold"
        )}
      >
        {initial(name)}
      </div>
      {online !== undefined && (
        <OnlineDot
          online={online}
          className="absolute -bottom-0.5 -right-0.5"
        />
      )}
    </div>
  );
}
