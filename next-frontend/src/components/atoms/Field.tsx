"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Shared control styling so inputs, selects and textareas look identical.
const controlBase =
  "block w-full py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm disabled:opacity-60";

/** Uppercase form label. */
export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2"
    >
      {children}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** When true, adds left padding to make room for a leading icon. */
  hasIcon?: boolean;
}

export function Input({ hasIcon, className, ...props }: InputProps) {
  return (
    <input
      className={cn(controlBase, hasIcon ? "pl-11 pr-4" : "px-4", className)}
      {...props}
    />
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasIcon?: boolean;
}

export function Textarea({ hasIcon, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        controlBase,
        "resize-none",
        hasIcon ? "pl-11 pr-4" : "px-4",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasIcon?: boolean;
}

export function Select({ hasIcon, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(controlBase, hasIcon ? "pl-11 pr-4" : "px-4", className)}
      {...props}
    >
      {children}
    </select>
  );
}
