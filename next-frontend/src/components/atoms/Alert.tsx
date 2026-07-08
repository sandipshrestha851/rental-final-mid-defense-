import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant: "error" | "success";
  children: React.ReactNode;
}

const styles = {
  error: "bg-red-950/50 border-red-800/50 text-red-400",
  success: "bg-emerald-950/50 border-emerald-800/50 text-emerald-400",
};

/** Inline status message with a matching icon. */
export function Alert({ variant, children }: AlertProps) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-sm",
        styles[variant]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
