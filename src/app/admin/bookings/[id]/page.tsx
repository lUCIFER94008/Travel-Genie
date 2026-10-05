'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooking(data.data);
        } else {
          setError(data.error || 'Failed to fetch booking');
        }
      })
      .catch((err) => setError('Failed to load booking details'))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-gray-900">Booking Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'The requested booking could not be retrieved.'}</p>
        <Link
          href="/admin/bookings"
          className="inline-block px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold"
        >
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-[#FF6A00]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Bookings
        </Link>

        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            booking.status === 'confirmed'
              ? 'bg-emerald-100 text-emerald-800'
              : booking.status === 'rejected' || booking.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          Status: {booking.status}
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-8">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider">Booking ID</span>
          <h1 className="text-2xl font-black text-[#171717] font-mono">#{booking._id}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Submitted on {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Information */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
            <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> Guest Profile
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

          {/* Property & Dates */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
            <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Property & Stay Details
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Property ID / Name</span>
                <span className="font-bold text-gray-900 capitalize">{booking.propertyId} ({booking.propertyType})</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Check-In / Check-Out</span>
                <span className="font-bold text-gray-900">
                  {new Date(booking.checkIn).toDateString()} &rarr; {new Date(booking.checkOut).toDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Party Size</span>
                <span className="font-bold text-gray-900">{booking.guests} Guests ({booking.rooms || 1} Room)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequest && (
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-1">
            <h4 className="text-xs font-bold text-[#FF6A00] flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Special Instructions
            </h4>
            <p className="text-xs text-gray-700 italic">{booking.specialRequest}</p>
          </div>
        )}

        {/* Admin Action Controls */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            Select an action to update booking status for user and property managers:
          </div>

          <div className="flex items-center space-x-3">
            <button
              disabled={updating || booking.status === 'confirmed'}
              onClick={() => updateStatus('confirmed')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Confirm Reservation
            </button>
            <button
              disabled={updating || booking.status === 'rejected'}
              onClick={() => updateStatus('rejected')}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Reject Booking
            </button>
            <button
              disabled={updating || booking.status === 'cancelled'}
              onClick={() => updateStatus('cancelled')}
              className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
