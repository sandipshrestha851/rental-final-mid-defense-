"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Search, Users, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Booking } from "@/lib/types";

type Filter = "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "rejected", label: "Rejected" },
];

function statusStyle(status: string) {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (status === "completed") return "bg-blue-50 text-blue-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "rejected") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isCancelled(status: string) {
  return ["cancelled", "cancelled_by_tenant", "cancelled_by_landlord", "expired"].includes(status);
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      setBookings(await api.getAdminBookings());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const counts = useMemo(() => {
    const value: Record<Filter, number> = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0 };
    bookings.forEach((booking) => {
      if (isCancelled(booking.status)) value.cancelled += 1;
      else if (booking.status in value) value[booking.status as Filter] += 1;
    });
    return value;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesFilter = filter === "all" || (filter === "cancelled" ? isCancelled(booking.status) : booking.status === filter);
      const matchesSearch = !normalizedQuery || [
        booking.id,
        booking.propertyName,
        booking.guestName,
        booking.guestEmail,
        booking.landlordName,
        booking.landlordEmail,
        booking.location,
      ].some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, query]);

  async function cancelBooking(booking: Booking) {
    if (!window.confirm(`Cancel booking #${booking.id} for ${booking.propertyName}?`)) return;
    setCancellingId(booking.id);
    try {
      await api.cancelBooking(booking.id, "Cancelled by administrator");
      await loadBookings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="text-slate-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor and manage all platform reservations.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bookings..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} className={`rounded-xl border p-3 text-left transition-colors ${filter === key ? "border-violet-600 bg-violet-600 text-white" : "border-slate-100 bg-white hover:border-violet-200"}`}>
            <p className={`text-xs font-medium ${filter === key ? "text-violet-100" : "text-slate-500"}`}>{label}</p>
            <p className="mt-1 text-xl font-bold">{counts[key]}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-500"><Loader2 className="mr-3 h-6 w-6 animate-spin text-violet-600" />Loading bookings...</div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full min-w-[980px] text-left">
            <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-5 py-4 font-semibold">Booking</th><th className="px-5 py-4 font-semibold">Tenant</th><th className="px-5 py-4 font-semibold">Landlord</th><th className="px-5 py-4 font-semibold">Dates</th><th className="px-5 py-4 font-semibold">Amount</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Action</th>
            </tr></thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70">
                  <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-800">#{booking.id} · {booking.propertyName}</p><p className="mt-0.5 text-xs text-slate-400">{booking.location}</p></td>
                  <td className="px-5 py-4"><p className="text-sm font-medium text-slate-700">{booking.guestName}</p><p className="text-xs text-slate-400">{booking.guestEmail || "—"}</p></td>
                  <td className="px-5 py-4"><p className="text-sm font-medium text-slate-700">{booking.landlordName || "—"}</p><p className="text-xs text-slate-400">{booking.landlordEmail || "—"}</p></td>
                  <td className="px-5 py-4 text-sm text-slate-600"><div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{booking.checkIn} – {booking.checkOut}</div><div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Users className="h-3.5 w-3.5" />{booking.guests} guest{booking.guests === 1 ? "" : "s"}</div></td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">${Number(booking.totalPrice).toLocaleString()}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(booking.status)}`}>{statusLabel(booking.status)}</span></td>
                  <td className="px-5 py-4">{["pending", "confirmed"].includes(booking.status) ? <button onClick={() => cancelBooking(booking)} disabled={cancellingId === booking.id} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />{cancellingId === booking.id ? "Cancelling..." : "Cancel"}</button> : <span className="text-xs text-slate-400">—</span>}</td>
                </tr>
              ))}
              {filteredBookings.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">No bookings match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
