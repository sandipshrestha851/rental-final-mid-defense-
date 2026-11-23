"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&auto=format&fit=crop&q=60';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, CreditCard, MapPin, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/hooks/useAuth';
import { api, ApiError } from '@/lib/api';
import type { Property } from '@/lib/types';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push(`/signin?redirect=/tenant/book/${id}`);
      return;
    }
    setLoading(true);
    Promise.all([
      api.getPropertyById(id),
      api.getUnavailableDates(id).catch(() => []),
    ])
      .then(([prop, dates]) => {
        setProperty(prop);
        setUnavailableDates(dates);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load property'))
      .finally(() => setLoading(false));
  }, [ready, user, id, router]);

  function isDateUnavailable(date: string): boolean {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return unavailableDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      end.setDate(end.getDate() - 1);
      return d >= start && d <= end;
    });
  }

  function getMinDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  async function handleContinue() {
    setAvailabilityError(null);

    if (!checkIn || !checkOut) {
      setAvailabilityError('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setAvailabilityError('Check-out must be after check-in.');
      return;
    }

    if (new Date(checkIn) < new Date(getMinDate())) {
      setAvailabilityError('Check-in cannot be in the past.');
      return;
    }

    if (isDateUnavailable(checkIn) || isDateUnavailable(checkOut)) {
      setAvailabilityError('One or more selected dates are already booked.');
      return;
    }

    try {
      const result = await api.checkAvailability(id, checkIn, checkOut);
      if (!result.available) {
        setAvailabilityError('These dates are not available. The property has conflicting bookings.');
        return;
      }
    } catch {
      setAvailabilityError('Could not verify availability. Please try again.');
      return;
    }

    setStep('confirm');
  }

  const handleBooking = async () => {
    if (!property) return;
    setSubmitting(true);
    try {
      const res = await api.createBooking({
        propertyId: property.id,
        checkIn: checkIn || new Date().toISOString().split('T')[0],
        checkOut: checkOut || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        guests,
        totalAmount: grandTotal,
      });

      sessionStorage.setItem(
        "booking_success_data",
        JSON.stringify({
          bookingId: res.bookingId,
          propertyName: property.title,
          checkIn: checkIn || new Date().toISOString().split('T')[0],
          checkOut: checkOut || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          guests,
          totalPrice: grandTotal,
        })
      );
      router.push(`/booking/success?bookingId=${res.bookingId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Booking failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFAF6]">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#EDE7DA] border-t-[#1F1B16]" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFAF6]">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#EDE7DA] border-t-[#1F1B16]" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFAF6]">
        <div className="text-center max-w-sm px-6">
          <p className="text-lg font-bold text-[#1F1B16] mb-2">Oops</p>
          <p className="text-sm text-[#8A8071] mb-6">{error || 'Property not found'}</p>
          <Link href="/tenant"><Button className="rounded-xl bg-[#1F1B16] text-[#FCFAF6] hover:bg-[#3B362E]">Back to Browse</Button></Link>
        </div>
      </div>
    );
  }

  const months = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 1;
  const rentTotal = property.price * months;
  const cleaningFee = Math.round(property.price * 0.05);
  const serviceFee = Math.round(property.price * 0.03);
  const grandTotal = rentTotal + cleaningFee + serviceFee;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link href={`/property/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#5E35B1] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to property
      </Link>

      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Book Your Stay</h1>

      {(error || availabilityError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error || availabilityError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          {step === 'form' ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-[#5E35B1]" /> Select Dates</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Check-in</Label>
                    <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={getMinDate()} className="mt-1 rounded-xl" required />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Check-out</Label>
                    <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || getMinDate()} className="mt-1 rounded-xl" required />
                  </div>
                </div>
                {availabilityError && <p className="mt-2 text-xs text-red-500">{availabilityError}</p>}
              </div>

              <div>
                <h2 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#5E35B1]" /> Guests</h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">-</button>
                  <span className="text-lg font-semibold w-8 text-center">{guests}</span>
                  <button onClick={() => setGuests(Math.min(property.guests || 10, guests + 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">+</button>
                  <span className="text-sm text-gray-500">(Max {property.guests || 10})</span>
                </div>
              </div>

              <Button onClick={handleContinue} className="w-full h-12 text-white bg-[#5E35B1] hover:bg-[#4A2AA0] rounded-xl font-semibold cursor-pointer" disabled={!checkIn || !checkOut}>
                Continue
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#5E35B1]" /> Confirm Booking</h2>
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2"><Calendar className="w-4 h-4" /> {checkIn} to {checkOut} ({months} month{months > 1 ? 's' : ''})</div>
                <div className="flex items-center gap-1 text-sm text-gray-500"><Users className="w-4 h-4" /> {guests} guest{guests > 1 ? 's' : ''}</div>
              </div>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-gray-600">${property.price.toLocaleString()} x {months} mo</span><span>${rentTotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Cleaning fee</span><span>${cleaningFee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Service fee</span><span>${serviceFee.toLocaleString()}</span></div>
                <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-base"><span>Total</span><span className="text-[#5E35B1]">${grandTotal.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-11 cursor-pointer" onClick={() => setStep('form')}>Back</Button>
                <Button className="text-white flex-1 h-11 bg-[#5E35B1] hover:bg-[#4A2AA0] rounded-xl font-semibold cursor-pointer" onClick={handleBooking} disabled={submitting}>
                  {submitting ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <img src={property.photos?.[0] || property.imageUrl || PLACEHOLDER_IMAGE} alt={property.title} className="w-full h-48 sm:h-40 object-cover" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
            <div className="p-5">
              <h3 className="font-semibold text-[#1A1A2E]">{property.title}</h3>
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500"><MapPin className="w-3 h-3" />{property.city || property.location}</div>
              <div className="flex items-center gap-1 mt-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-medium text-sm">{property.rating}</span></div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xl font-bold text-[#5E35B1]">${property.price.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
