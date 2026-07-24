"use client";
import { PropertyStatus } from "../../lib/types";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Draft: "bg-gray-100 text-gray-600",
  Rejected: "bg-rose-50 text-rose-600",
};

export default function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
