'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Bed,
  ArrowRight,
  User,
  MapPin,
  Star,
  AlertCircle,
} from 'lucide-react';

export default function ResortManagerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [resorts, setResorts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/resort-manager/property').then((r) => r.json()),
      fetch('/api/resort-manager/bookings').then((r) => r.json()),
    ])
      .then(([uData, pData, bData]) => {
        if (uData.success) setUser(uData.user);
        if (pData.success) setResorts(pData.data || []);
        if (bData.success) setBookings(bData.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Property Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] mt-1">
            Welcome, {user?.name || 'Resort Manager'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your resort reservations, update property details, and handle guest requests.
          </p>
        </div>
        <Link
          href="/resort-manager/bookings"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors"
        >
          <span>Manage Resort Bookings</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Total Bookings</p>
            <p className="text-2xl font-black text-[#171717] mt-1">{loading ? '...' : totalBookings}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Pending Requests</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{loading ? '...' : pendingRequests}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Confirmed</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{loading ? '...' : confirmedBookings}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Assigned Resorts</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{loading ? '...' : resorts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#FF6A00]" />
              Resort Reservations
            </h2>
            <Link href="/resort-manager/bookings" className="text-xs font-bold text-[#FF6A00] hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-xl">
              <AlertCircle className="w-6 h-6 text-gray-300 mx-auto" />
              <p>No bookings received yet for your assigned resort(s).</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.slice(0, 5).map((b) => (
                <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">{b.guestName}</span>
                    <span className="text-gray-500 text-[11px]">
                      {new Date(b.checkIn).toLocaleDateString()} &rarr; {new Date(b.checkOut).toLocaleDateString()} ({b.guests} guests)
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'rejected' || b.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Properties Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF6A00]" />
              Assigned Property
            </h2>
            <Link href="/resort-manager/property" className="text-xs font-bold text-[#FF6A00] hover:underline">
              Edit
            </Link>
          </div>

          {resorts.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl text-xs text-amber-800">
              No resort assigned yet. An administrator will assign your resort property shortly.
            </div>
          ) : (
            <div className="space-y-4">
              {resorts.map((r) => (
                <div key={r._id} className="p-4 rounded-xl border border-gray-200 space-y-2">
                  <h3 className="font-extrabold text-gray-900 text-sm">{r.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {r.address}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-bold uppercase">{r.destinationId}</span>
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {r.rating || '4.8'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
