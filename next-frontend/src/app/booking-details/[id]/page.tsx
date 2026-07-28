"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, Users, Star, CheckCircle2, Hourglass, XCircle, AlertCircle, Clock, FileText, X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import TenantLayout from "@/components/layout/TenantLayout";
import type { Booking, BookingHistoryEntry } from "@/lib/types";

function statusStyles(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-100 text-emerald-700";
    case "completed": return "bg-blue-100 text-blue-700";
    case "cancelled": case "cancelled_by_tenant": case "cancelled_by_landlord": return "bg-rose-100 text-rose-700";
    case "pending": return "bg-amber-100 text-amber-700";
    case "rejected": return "bg-red-100 text-red-700";
    case "expired": return "bg-gray-100 text-gray-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "cancelled_by_tenant": return "Cancelled by You";
    case "cancelled_by_landlord": return "Cancelled by Host";
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "pending": return <Hourglass size={16} />;
    case "cancelled": case "cancelled_by_tenant": case "cancelled_by_landlord": return <XCircle size={16} />;
    case "rejected": return <AlertCircle size={16} />;
    case "expired": return <Clock size={16} />;
    default: return <CheckCircle2 size={16} />;
  }
}

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.push('/signin'); return; }

    api.getBookingById(id)
      .then((data) => { setBooking(data); setLoading(false); })
      .catch((err) => { setError(err instanceof ApiError ? err.message : "Failed to load booking"); setLoading(false); });
  }, [id, ready, user, router]);

  const nights = Math.ceil((new Date(booking?.checkOut || '').getTime() - new Date(booking?.checkIn || '').getTime()) / (1000 * 60 * 60 * 24));
  const price = Number(booking?.totalPrice || 0);
  const monthlyPrice = Number(booking?.price) || Math.round(price / Math.max(1, nights / 30));
  const months = Math.max(1, Math.round(nights / 30));

  if (loading) {
    return (
      <TenantLayout>
        <div className="min-h-screen bg-indigo-50/40 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </TenantLayout>
    );
  }

  if (error || !booking) {
    return (
      <TenantLayout>
        <div className="min-h-screen bg-indigo-50/40 flex items-center justify-center">
          <div className="text-center max-w-sm px-6">
            <p className="text-lg font-semibold text-slate-800 mb-2">Booking not found</p>
            <p className="text-sm text-slate-500 mb-6">{error || "This booking does not exist."}</p>
            <Link href="/tenant-booking" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">← Back to My Bookings</Link>
          </div>
        </div>
      </TenantLayout>
    );
  }

  const rentTotal = monthlyPrice * months;
  const cleaningFee = Math.round(monthlyPrice * 0.05);
  const serviceFee = Math.round(monthlyPrice * 0.03);

  return (
    <TenantLayout>
      <div className="min-h-screen bg-indigo-50/40">
        <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/tenant-booking" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-6">
          <ArrowLeft size={16} /> Back to My Bookings
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{booking.propertyName}</h1>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-1"><MapPin size={14} />{booking.location}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${statusStyles(booking.status)}`}>
            {statusIcon(booking.status)}
            {statusLabel(booking.status)}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Booking ID</span><p className="font-medium text-slate-900">#{booking.id}</p></div>
                <div><span className="text-slate-500">Status</span><p className="font-medium text-slate-900">{statusLabel(booking.status)}</p></div>
                <div><span className="text-slate-500">Check-in</span><p className="font-medium text-slate-900">{booking.checkIn}</p></div>
                <div><span className="text-slate-500">Check-out</span><p className="font-medium text-slate-900">{booking.checkOut}</p></div>
                <div><span className="text-slate-500">Nights</span><p className="font-medium text-slate-900">{nights}</p></div>
                <div><span className="text-slate-500">Guests</span><p className="font-medium text-slate-900">{booking.guests}</p></div>
                <div><span className="text-slate-500">Created</span><p className="font-medium text-slate-900">{new Date(booking.created_at).toLocaleDateString()}</p></div>
                {booking.specialRequests && (
                  <div className="col-span-2"><span className="text-slate-500">Special Requests</span><p className="font-medium text-slate-900 mt-1">{booking.specialRequests}</p></div>
                )}
                {booking.cancellationReason && (
                  <div className="col-span-2"><span className="text-slate-500">Cancellation Reason</span><p className="font-medium text-rose-600 mt-1">{booking.cancellationReason}</p></div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Timeline</h2>
              <div className="space-y-4">
                {(booking.history || []).map((entry: BookingHistoryEntry, i: number) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                      {i < (booking.history?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-slate-900">{statusLabel(entry.status)}</p>
                      <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                      {entry.note && <p className="text-xs text-slate-400 mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
                {(!booking.history || booking.history.length === 0) && (
                  <p className="text-sm text-slate-400">No history available.</p>
                )}
              </div>
            </div>

            {[ "pending", "confirmed" ].includes(booking.status) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100">
                <h2 className="text-lg font-semibold text-rose-700 mb-2">Need to cancel?</h2>
                <p className="text-sm text-slate-500 mb-4">You can cancel this booking at any time.</p>
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to cancel this booking?")) return;
                    try {
                      await api.cancelBooking(booking.id);
                      const updated = await api.getBookingById(booking.id);
                      setBooking(updated);
                    } catch (err) {
                      alert(err instanceof ApiError ? err.message : "Failed to cancel");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 cursor-pointer"
                >
                  <X size={14} /> Cancel Booking
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img src={booking.imageUrl || "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&h=300&fit=crop"} alt={booking.propertyName} className="w-full h-40 object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-slate-900">{booking.propertyName}</h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-slate-500"><MapPin size={12} />{booking.location}</div>
                {booking.rating != null && (
                  <div className="flex items-center gap-1 mt-2"><Star size={14} className="fill-amber-400 text-amber-400" /><span className="text-sm font-medium">{Number(booking.rating).toFixed(1)}</span></div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">${monthlyPrice.toLocaleString()} x {months} mo</span><span>${rentTotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cleaning fee</span><span>${cleaningFee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Service fee</span><span>${serviceFee.toLocaleString()}</span></div>
                <div className="flex justify-between pt-3 border-t font-bold text-base"><span>Total</span><span className="text-indigo-700">${price.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Guest Info</h3>
              <p className="text-sm font-medium">{booking.guestName}</p>
              {booking.guestEmail && <p className="text-xs text-slate-500">{booking.guestEmail}</p>}
              {booking.guestPhone && <p className="text-xs text-slate-500">{booking.guestPhone}</p>}
            </div>

            <button
              onClick={() => window.open(api.getBookingReceiptUrl(booking.id), '_blank')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <FileText size={16} /> Download Receipt
            </button>
          </div>
        </div>
        </div>
      </div>
    </TenantLayout>
  );
}
