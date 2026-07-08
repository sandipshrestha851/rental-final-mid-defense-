import React from "react";
import { cn } from "@/lib/utils";

/** A minimal spinning loader. Inherits size via className. */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin",
        className
      )}
    />
  );
}
