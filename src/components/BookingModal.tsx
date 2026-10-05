'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Calendar, User, Phone, Mail, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  property: {
    _id?: string;
    id?: string;
    name: string;
    type?: string;
    slug?: string;
    destinationId?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ property, isOpen, onClose }: BookingModalProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);

  // Auto-fill logged-in user details if available
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessData(null);
      setNeedsAuth(false);

      // Default dates: tomorrow and day after
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      setCheckIn(tomorrow.toISOString().split('T')[0]);
      setCheckOut(dayAfter.toISOString().split('T')[0]);

      fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setContactName(data.user.name || '');
            setContactEmail(data.user.email || '');
            setContactPhone(data.user.phone || '');
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setNeedsAuth(false);

    // 1. Verify property identity
    const propertyId = property._id || property.id || property.slug;
    if (!propertyId) {
      setErrorMsg('Property information is missing. Please reopen the booking form.');
      return;
    }

    // 2. Frontend Date Validation
    if (!checkIn || !checkOut) {
      setErrorMsg('Please select both check-in and check-out dates.');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      setErrorMsg('Please select a valid check-in and check-out date.');
      return;
    }

    if (checkOutDate <= checkInDate) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }

    // 3. Frontend Contact Info Validation
    if (!contactName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const propertyType = (property.type || 'hotel').toLowerCase().includes('resort') ? 'resort' : 'hotel';

      const payload = {
        propertyId,
        propertyType,
        destinationId: property.destinationId || '',
        checkIn,
        checkOut,
        guests: Number(guests),
        rooms: Number(rooms),
        guestName: contactName.trim(),
        guestPhone: contactPhone.trim(),
        guestEmail: contactEmail.trim().toLowerCase(),
        specialRequest: specialRequests?.trim() || '',
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log('Submitting booking request payload:', payload);
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401) {
        setNeedsAuth(true);
        setErrorMsg('Please sign in before submitting a booking request.');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Booking request submission failed.');
      }

      setSuccessData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#FFF1E6] px-6 py-5 flex items-center justify-between border-b border-orange-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold uppercase tracking-wide mb-0.5">
              <Building2 className="w-4 h-4" />
              <span>Booking Request</span>
            </div>
            <h3 className="text-xl font-bold text-[#171717]">{property.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/80 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successData ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-2xl font-black text-gray-900">Booking Request Submitted!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Your reservation request for <span className="font-bold text-gray-800">{property.name}</span> has been received.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-2 font-mono">
                <span className="text-gray-500 font-medium">Booking ID:</span>
                <span className="font-bold text-[#FF6A00]">{successData.bookingCode || successData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in:</span>
                <span className="font-bold text-gray-800">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out:</span>
                <span className="font-bold text-gray-800">{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Party Size:</span>
                <span className="font-bold text-gray-800">{guests} Guests, {rooms} Room(s)</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Status:</span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase rounded-full">
                  Pending Confirmation
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard/bookings"
                className="flex-1 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-colors text-center shadow-md shadow-orange-200"
              >
                View My Bookings
              </Link>
              <button
                onClick={onClose}
                className="py-2.5 px-6 border border-gray-300 text-gray-700 text-xs font-bold rounded-full hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {needsAuth && (
                  <div className="pt-1">
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                      className="inline-flex items-center text-xs font-bold text-[#FF6A00] hover:underline"
                    >
                      Sign In Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rooms</label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Room' : 'Rooms'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Early check-in, high floor, airport transfer..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-sm font-semibold rounded-full shadow-md transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : 'Submit Booking Request'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
