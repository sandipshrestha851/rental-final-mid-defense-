"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface BookingSuccessData {
  bookingId?: number | string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

interface BookingSuccessProps {
  data?: BookingSuccessData;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function BookingSuccess({ data }: BookingSuccessProps) {
  const [mounted, setMounted] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowCard(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FCFAF6] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Booking confirmed, but we couldn&apos;t load the booking details.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/tenant-booking"
              className="inline-flex items-center justify-center rounded-xl bg-[#5E35B1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A2AA0] transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/tenant"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-[#1A1A2E] hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FCFAF6] px-4">
      <div className="w-full max-w-sm text-center">
        <div
          className={`mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 transition-all duration-500 ${
            mounted ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <Check className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Your reservation at {data.propertyName} has been confirmed. Check your
          email for details.
        </p>

        <div
          className={`rounded-2xl bg-white p-6 border border-gray-100 shadow-sm text-left mb-8 transition-all duration-500 ${
            showCard
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <h3 className="font-semibold text-[#1A1A2E] mb-4">
            Booking Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Property</span>
              <span className="font-medium text-[#1A1A2E] text-right max-w-[60%]">
                {data.propertyName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium text-[#1A1A2E]">
                {formatDate(data.checkIn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium text-[#1A1A2E]">
                {formatDate(data.checkOut)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-medium text-[#1A1A2E]">
                {data.guests} guest{data.guests !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-[#5E35B1] text-base">
                ${data.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {data?.bookingId ? (
            <Link
              href={`/booking-details/${data.bookingId}`}
              className="inline-flex items-center justify-center rounded-xl bg-[#5E35B1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A2AA0] transition-colors"
            >
              View Booking Details
            </Link>
          ) : (
            <Link
              href="/tenant-booking"
              className="inline-flex items-center justify-center rounded-xl bg-[#5E35B1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A2AA0] transition-colors"
            >
              View My Bookings
            </Link>
          )}
          <Link
            href="/tenant"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-[#1A1A2E] hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
