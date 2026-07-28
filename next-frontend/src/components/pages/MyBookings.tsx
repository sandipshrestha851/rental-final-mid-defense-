"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star, MapPin, Calendar, Clock, CheckCircle2, Hourglass, XCircle,
  AlertCircle, Eye, X, FileText, Trash2,
} from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type { Booking } from "@/lib/types";

type TabKey = "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "rejected", label: "Rejected" },
];

function statusStyles(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-50 text-emerald-600";
    case "completed": return "bg-blue-50 text-blue-600";
    case "cancelled": case "cancelled_by_tenant": case "cancelled_by_landlord": return "bg-rose-50 text-rose-600";
    case "pending": return "bg-amber-50 text-amber-600";
    case "rejected": return "bg-red-50 text-red-600";
    case "expired": return "bg-gray-50 text-gray-600";
    default: return "bg-slate-50 text-slate-600";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "cancelled_by_tenant": return "Cancelled by you";
    case "cancelled_by_landlord": return "Cancelled by host";
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "pending": return <Hourglass size={14} />;
    case "cancelled": case "cancelled_by_tenant": case "cancelled_by_landlord": return <XCircle size={14} />;
    case "rejected": return <AlertCircle size={14} />;
    case "expired": return <Clock size={14} />;
    default: return <CheckCircle2 size={14} />;
  }
}

function isActive(status: string) {
  return status === "pending" || status === "confirmed";
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&h=300&fit=crop";

function BookingCard({ booking, onCancel, onReceipt }: { booking: Booking; onCancel: (b: Booking) => void; onReceipt: (b: Booking) => void }) {
  const dateRange = `${booking.checkIn} - ${booking.checkOut}`;

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-sm overflow-hidden">
      <img
        src={booking.imageUrl || PLACEHOLDER_IMAGE}
        alt={booking.propertyName}
        className="w-full sm:w-56 h-44 sm:h-auto object-cover"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
      />
      <div className="flex-1 flex flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{booking.propertyName}</h3>
              <span className="text-xs text-slate-400">#{booking.id}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={14} />
              <span>{booking.location}</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{dateRange}</span>
              </div>
              {booking.rating != null && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{Number(booking.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
            {booking.cancellationReason && (
              <div className="mt-1 text-xs text-rose-500">{booking.cancellationReason}</div>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyles(booking.status)}`}>
            {statusIcon(booking.status)}
            {statusLabel(booking.status)}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-lg font-bold text-indigo-700">${Number(booking.totalPrice).toLocaleString()}</p>
            <p className="text-xs text-slate-400">Total paid</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/booking-details/${booking.id}`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <Eye size={14} />
              Details
            </Link>
            {isActive(booking.status) && (
              <button
                onClick={() => onCancel(booking)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
              >
                <X size={14} />
                Cancel
              </button>
            )}
            {booking.status === "completed" && (
              <button
                onClick={() => onReceipt(booking)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <FileText size={14} />
                Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelDialog({ booking, onClose, onConfirm }: { booking: Booking; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">Cancel Booking</h3>
        <p className="mt-1 text-sm text-slate-500">Cancel your booking for {booking.propertyName}?</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          rows={3}
        />
        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">Keep Booking</button>
          <button
            onClick={async () => { setSubmitting(true); await onConfirm(reason); setSubmitting(false); }}
            disabled={submitting}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { user, ready } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  function fetchBookings() {
    if (!ready || !user) return;
    setLoading(true);
    api.getBookingsByGuest(user.id)
      .then((data) => { setBookings(data); setLoading(false); })
      .catch((err) => { setError(err instanceof ApiError ? err.message : "Failed to load bookings"); setLoading(false); });
  }

  useEffect(() => { if (ready) { if (!user) { setError("Please sign in."); setLoading(false); } else fetchBookings(); } }, [ready, user]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return bookings;
    if (activeTab === "cancelled") return bookings.filter((b) => ["cancelled", "cancelled_by_tenant", "cancelled_by_landlord", "expired"].includes(b.status));
    return bookings.filter((b) => b.status === activeTab);
  }, [activeTab, bookings]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    for (const b of bookings) {
      const key = ["cancelled", "cancelled_by_tenant", "cancelled_by_landlord", "expired"].includes(b.status) ? "cancelled" : b.status;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [bookings]);

  async function handleCancel(reason: string) {
    if (!cancelling) return;
    try {
      await api.cancelBooking(cancelling.id, reason);
      setCancelling(null);
      fetchBookings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to cancel");
    }
  }

  function handleReceipt(booking: Booking) {
    window.open(api.getBookingReceiptUrl(booking.id), '_blank');
  }

  return (
    <div className="min-h-screen bg-indigo-50/40">
      <TopBar role="Tenant" page="Bookings" />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your reservations</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-1.5 shadow-sm sm:grid-cols-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg py-2.5 text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {tab.label} ({tabCounts[tab.key] || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
        ) : error ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm">{error}</div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onCancel={setCancelling} onReceipt={handleReceipt} />
            ))}
            {filtered.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm">No bookings in this category yet.</div>
            )}
          </div>
        )}
      </main>

      {cancelling && <CancelDialog booking={cancelling} onClose={() => setCancelling(null)} onConfirm={handleCancel} />}
    </div>
  );
}
