"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingSuccess from "@/components/booking/BookingSuccess";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import TenantLayout from "@/components/layout/TenantLayout";

interface BookingSuccessData {
  bookingId?: number | string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

const STORAGE_KEY = "booking_success_data";

export function getStoredBookingData(): BookingSuccessData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingSuccessData;
  } catch {
    return null;
  }
}

export function clearStoredBookingData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const { ready: authReady } = useAuth();

  const [data, setData] = useState<BookingSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from session storage
    const stored = getStoredBookingData();
    if (stored) {
      setData(stored);
      clearStoredBookingData();
      setLoading(false);
      return;
    }

    // 2. If not in session storage, but we have bookingId and token, fetch details from backend
    if (bookingId) {
      api.getBookingById(bookingId)
        .then((fetched) => {
          setData({
            bookingId: fetched.id,
            propertyName: fetched.propertyName,
            checkIn: fetched.checkIn,
            checkOut: fetched.checkOut,
            guests: fetched.guests,
            totalPrice: fetched.totalPrice,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch booking details:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      if (authReady) {
        setLoading(false);
      }
    }
  }, [bookingId, authReady]);

  if (loading) {
    return (
      <TenantLayout>
        <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#EDE7DA] border-t-[#1F1B16]" />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <BookingSuccess data={data ?? undefined} />
    </TenantLayout>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <TenantLayout>
        <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#EDE7DA] border-t-[#1F1B16]" />
        </div>
      </TenantLayout>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
