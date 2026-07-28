"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye, MapPin, Calendar, Search, CheckCircle2, XCircle, Hourglass, Clock, AlertCircle, X, Check, FileText,
} from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type { Booking, BookingStats } from "@/lib/types";

function statusStyles(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-100 text-emerald-700";
    case "completed": return "bg-blue-100 text-blue-700";
    case "cancelled": case "cancelled_by_tenant": case "cancelled_by_landlord": return "bg-rose-100 text-rose-700";
    case "pending": return "bg-amber-100 text-amber-700";
    case "rejected": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "cancelled_by_tenant": return "Cancelled by Guest";
    case "cancelled_by_landlord": return "Cancelled by You";
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
}

type TabKey = "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

export default function Reservations() {
  const { user, ready } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchTerm, setSearchTerm] = useState("");

  function fetchData() {
    if (!ready || !user) return;
    setLoading(true);
    Promise.all([
      api.getLandlordBookings(),
      api.getBookingStats(),
    ])
      .then(([bookingsData, statsData]) => {
        setBookings(bookingsData);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load");
        setLoading(false);
      });
  }

  useEffect(() => { if (ready) { if (!user) { setError("Please sign in."); setLoading(false); } else fetchData(); } }, [ready, user]);

  async function handleApprove(booking: Booking) {
    try {
      await api.approveBooking(booking.id);
      fetchData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to approve");
    }
  }

  async function handleReject(booking: Booking) {
    const reason = prompt("Reason for rejection (optional):");
    try {
      await api.rejectBooking(booking.id, reason || undefined);
      fetchData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to reject");
    }
  }

  async function handleCancel(booking: Booking) {
    const reason = prompt("Reason for cancellation:");
    if (reason === null) return;
    try {
      await api.cancelBooking(booking.id, reason || undefined);
      fetchData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to cancel");
    }
  }

  async function handleComplete(booking: Booking) {
    if (!confirm(`Mark stay at ${booking.propertyName} as completed?`)) return;
    try {
      await api.completeBooking(booking.id);
      fetchData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to complete");
    }
  }

  const filtered = useMemo(() => {
    let result = bookings;
    if (activeTab !== "all") {
      if (activeTab === "cancelled") {
        result = result.filter((b) => ["cancelled", "cancelled_by_tenant", "cancelled_by_landlord"].includes(b.status));
      } else {
        result = result.filter((b) => b.status === activeTab);
      }
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((b) =>
        b.propertyName?.toLowerCase().includes(term) ||
        b.guestName?.toLowerCase().includes(term) ||
        b.location?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [bookings, activeTab, searchTerm]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    for (const b of bookings) {
      const key = ["cancelled", "cancelled_by_tenant", "cancelled_by_landlord"].includes(b.status) ? "cancelled" : b.status;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [bookings]);

  const tabs = [
    { key: "all" as TabKey, label: "All" },
    { key: "pending" as TabKey, label: "Pending" },
    { key: "confirmed" as TabKey, label: "Confirmed" },
    { key: "completed" as TabKey, label: "Completed" },
    { key: "cancelled" as TabKey, label: "Cancelled" },
    { key: "rejected" as TabKey, label: "Rejected" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50/40">
        <TopBar role="Landlord" page="Reservations" />
        <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-indigo-50/40">
        <TopBar role="Landlord" page="Reservations" />
        <div className="p-8 text-center text-sm text-slate-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50/40">
      <TopBar role="Landlord" page="Reservations" />

      <main className="px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
        <p className="mt-1 text-sm text-slate-500">Manage booking requests for your properties</p>

        {stats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-indigo-600">{stats.pending}</p><p className="text-xs text-slate-500">Pending</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p><p className="text-xs text-slate-500">Confirmed</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-blue-600">{stats.completed}</p><p className="text-xs text-slate-500">Completed</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-rose-600">{stats.cancelled}</p><p className="text-xs text-slate-500">Cancelled</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-amber-600">{stats.todayCheckIns}</p><p className="text-xs text-slate-500">Today Check-ins</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-amber-600">{stats.todayCheckOuts}</p><p className="text-xs text-slate-500">Today Check-outs</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-violet-600">{stats.currentGuests}</p><p className="text-xs text-slate-500">Current Guests</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-2xl font-bold text-green-600">${Number(stats.revenue).toLocaleString()}</p><p className="text-xs text-slate-500">Revenue</p></div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm w-full sm:w-80">
            <Search size={16} className="text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by property, guest..." className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400" />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.key ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50 shadow-sm"}`}
            >
              {tab.label} ({tabCounts[tab.key] || 0})
            </button>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Guest</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Dates</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No reservations match this filter.</td></tr>
                )}
                {filtered.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={booking.imageUrl || "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=48&h=48&fit=crop"} alt={booking.propertyName} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-slate-900">{booking.propertyName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{booking.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{booking.guestName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar size={12} className="shrink-0" />
                        <span className="text-xs">{booking.checkIn} - {booking.checkOut}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">${Number(booking.totalPrice).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles(booking.status)}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/booking-details/${booking.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="View details"><Eye size={15} /></Link>
                        {booking.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(booking)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 cursor-pointer" title="Approve"><Check size={15} /></button>
                            <button onClick={() => handleReject(booking)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer" title="Reject"><X size={15} /></button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <button onClick={() => handleComplete(booking)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer" title="Mark completed"><CheckCircle2 size={15} /></button>
                            <button onClick={() => handleCancel(booking)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer" title="Cancel"><XCircle size={15} /></button>
                          </>
                        )}
                        <button onClick={() => window.open(api.getBookingReceiptUrl(booking.id), '_blank')} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer" title="Receipt"><FileText size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
