// Tiny helpers shared across components.

/** Join conditional class names, dropping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO timestamp as a short HH:MM local time. */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** First letter of a name, uppercased — used for avatar fallbacks. */
export function initial(name: string): string {
  return (name || "?").trim().charAt(0).toUpperCase();
}
