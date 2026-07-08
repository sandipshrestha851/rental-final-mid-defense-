"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "ghost" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-bold transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "w-full rounded-2xl py-3.5 px-4 text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
  ghost:
    "rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800",
  icon:
    "h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white",
};

/** A themed button. `loading` shows a spinner and disables interaction. */
export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
