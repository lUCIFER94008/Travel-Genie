'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  Building2,
  Hotel,
  Compass,
  MapPin,
  Map,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Camera,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentBookings(data.recentBookings || []);
          setRecentUsers(data.recentUsers || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: stats?.totalBookings ?? '-', icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending Bookings', value: stats?.pendingBookings ?? '-', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmed Bookings', value: stats?.confirmedBookings ?? '-', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Resorts', value: stats?.totalResorts ?? '-', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Hotels', value: stats?.totalHotels ?? '-', icon: Hotel, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Destinations', value: stats?.totalDestinations ?? '-', icon: Compass, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Attractions', value: stats?.totalAttractions ?? '-', icon: MapPin, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Trip Itineraries', value: stats?.totalItineraries ?? '-', icon: Map, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-xs font-extrabold text-[#FF6A00] uppercase tracking-wider">Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] mt-1">Welcome back, Admin</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            System overview, bookings monitor, resort management, and data controls.
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors"
        >
          <span>Manage All Bookings</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500">{card.label}</p>
                <p className="text-2xl font-black text-[#171717] mt-1">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#FF6A00]" />
              Recent Booking Requests
            </h2>
            <Link href="/admin/bookings" className="text-xs font-bold text-[#FF6A00] hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading recent bookings...</div>
          ) : recentBookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
              No recent bookings found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="py-2">Guest</th>
                    <th className="py-2">Property</th>
                    <th className="py-2">Check-In</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-semibold text-gray-900">{b.guestName || b.guestEmail}</td>
                      <td className="py-3 text-gray-600 capitalize">{b.propertyType} ({b.propertyId})</td>
                      <td className="py-3 text-gray-500">
                        {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'rejected' || b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/bookings/${b._id}`}
                          className="text-[#FF6A00] hover:underline font-bold"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Tools */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6A00]" />
              Quick Admin Tools
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">User & Role Management</h3>
                    <p className="text-[10px] text-gray-500">Assign Admin or Resort Manager roles</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/admin/resorts"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Resort & Hotel Catalog</h3>
                    <p className="text-[10px] text-gray-500">Manage property listings & managers</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/admin/images"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Pixabay Image Hub</h3>
                    <p className="text-[10px] text-gray-500">Fetch & assign real photography</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/admin/data-audit"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Data Isolation Audit</h3>
                    <p className="text-[10px] text-gray-500">Inspect cross-destination leaks</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
