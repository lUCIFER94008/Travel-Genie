'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { Building2, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Phone, Mail } from 'lucide-react';

export default function BookingsClientPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setBookings(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'My Bookings' }]} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Property Reservations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717]">My Booking Requests</h1>
          <p className="text-xs text-gray-500">
            Track your resort & hotel booking request statuses.
          </p>
        </div>

        <Link
          href="/hotels"
          className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full shadow-xs"
        >
          Book New Resort
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading booking requests...</div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            let statusBadge = (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Pending Verification
              </span>
            );
            if (booking.status === 'Confirmed') {
              statusBadge = (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed
                </span>
              );
            }
            if (booking.status === 'Cancelled') {
              statusBadge = (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelled
                </span>
              );
            }

            return (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#171717]">{booking.propertyName}</h3>
                    {statusBadge}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#FF6A00]" />
                      Check-in: {booking.checkIn}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#FF6A00]" />
                      Check-out: {booking.checkOut}
                    </span>
                    <span>Guests: {booking.guests}</span>
                    <span>Rooms: {booking.rooms}</span>
                  </div>

                  <div className="text-xs text-gray-500 pt-1 flex items-center gap-4">
                    <span>Contact: {booking.contactName}</span>
                    <span>Phone: {booking.contactPhone}</span>
                  </div>
                </div>

                <div className="text-right text-xs text-gray-400">
                  <span>Requested on {new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-base font-bold text-gray-800">No booking requests yet</h4>
          <p className="text-xs text-gray-500">
            Check availability at top resorts like KTDC Tea County, Blanket Hotel & Spa, or Windermere Estate.
          </p>
          <Link
            href="/hotels"
            className="inline-block px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-full"
          >
            Explore Hotels & Resorts
          </Link>
        </div>
      )}
    </div>
  );
}
