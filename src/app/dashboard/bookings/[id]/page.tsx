'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function UserBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${resolvedParams.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load booking')))
      .then((json) => {
        if (json?.success && json.data) {
          setBooking(json.data);
        } else {
          setError(json?.error || 'Booking record not found or access denied.');
        }
      })
      .catch((err) => setError('Booking record not found or access denied.'))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBooking(json.data);
      } else {
        alert(json.error || 'Failed to cancel booking');
      }
    } catch {
      alert('Error cancelling booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-400 animate-pulse">Loading reservation details...</div>;
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 my-8">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-gray-900">Access Denied or Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'The requested booking record could not be found.'}</p>
        <Link
          href="/dashboard/bookings"
          className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation & Status Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-[#FF6A00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to My Bookings
        </Link>

        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            booking.status === 'confirmed'
              ? 'bg-emerald-100 text-emerald-800'
              : booking.status === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : booking.status === 'cancelled'
              ? 'bg-gray-200 text-gray-700'
              : 'bg-red-100 text-red-800'
          }`}
        >
          Status: {booking.status}
        </span>
      </div>

      {/* Main Reservation Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider">Booking Reference</span>
            <h1 className="text-2xl font-black text-[#171717] font-mono">
              {booking.bookingCode || `TG-${booking._id}`}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Info */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
            <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Property & Stay Details
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Property Name</span>
                <span className="font-bold text-gray-900 text-sm">{booking.propertyName || 'Grand Plaza Munnar'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Location / Address</span>
                <span className="font-bold text-gray-800">{booking.propertyAddress || `${booking.destinationId || 'Munnar'}, Kerala`}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Check-In & Check-Out</span>
                <span className="font-bold text-gray-900">
                  {new Date(booking.checkIn).toDateString()} &rarr; {new Date(booking.checkOut).toDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Guests & Rooms</span>
                <span className="font-bold text-gray-900">{booking.guests} Guests &bull; {booking.rooms || 1} Room(s)</span>
              </div>
            </div>
          </div>

          {/* Guest Profile */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
            <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> Contact Information
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Full Name</span>
                <span className="font-bold text-gray-900">{booking.guestName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Email Address</span>
                <span className="font-bold text-gray-900">{booking.guestEmail}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Phone Number</span>
                <span className="font-bold text-gray-900">{booking.guestPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequest && (
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-1 text-xs">
            <h4 className="font-bold text-[#FF6A00] flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Special Requests
            </h4>
            <p className="text-gray-700 italic">{booking.specialRequest}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <Link
            href="/dashboard/bookings"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors"
          >
            Back to My Bookings
          </Link>

          {booking.status === 'pending' && (
            <button
              disabled={cancelling}
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
