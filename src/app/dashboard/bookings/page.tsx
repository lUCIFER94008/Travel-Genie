'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Building2,
  MapPin,
  Clock,
  AlertCircle,
  Eye,
  XCircle,
  RefreshCw,
  Compass,
} from 'lucide-react';

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    fetch('/api/bookings')
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch bookings')))
      .then((json) => {
        if (json?.success) {
          setBookings(json.data || json.bookings || []);
        } else {
          setError(json?.error || 'Unable to load your bookings.');
        }
      })
      .catch((err) => setError('Unable to load your bookings. Please check your network connection.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      } else {
        alert(json.error || 'Failed to cancel booking');
      }
    } catch {
      alert('Error cancelling booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wider">
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-extrabold uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-extrabold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Reservations</span>
          <h1 className="text-2xl font-black text-[#171717] mt-0.5">My Bookings</h1>
          <p className="text-xs text-gray-500 mt-1">View and manage your travel reservations.</p>
        </div>

        <Link
          href="/destinations"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors"
        >
          Explore Destinations & Book Stays
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Unable to load your bookings.</h3>
          <p className="text-xs text-red-700 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm animate-pulse flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-40 h-28 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && (
        bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row justify-between hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row p-5 gap-4 flex-1">
                  {/* Property Image */}
                  <div className="w-full sm:w-44 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                    <img
                      src={b.propertyPhoto || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={b.propertyName || 'Property'}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded">
                      {b.propertyType || 'Hotel'}
                    </span>
                  </div>

                  {/* Booking Information */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{b.propertyName || 'Grand Plaza Munnar'}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {b.propertyAddress || `${b.destinationId || 'Munnar'}, Kerala`}
                        </p>
                      </div>
                      <div>{getStatusBadge(b.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 text-[10px] block">Booking Reference</span>
                        <span className="font-mono font-bold text-[#FF6A00]">
                          {b.bookingCode || `TG-${b._id.slice(-8).toUpperCase()}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Dates</span>
                        <span className="font-bold text-gray-800">
                          {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &rarr; {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Party Size</span>
                        <span className="font-semibold text-gray-800">
                          {b.guests} Guests &bull; {b.rooms || 1} Room(s)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer / Right Panel */}
                <div className="bg-gray-50/70 p-4 md:w-48 border-t md:border-t-0 md:border-l border-gray-100 flex flex-row md:flex-col justify-between md:justify-center items-center gap-2">
                  <Link
                    href={`/dashboard/bookings/${b._id}`}
                    className="w-full text-center px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </Link>

                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      className="w-full text-center px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-gray-900">No bookings yet</h3>
              <p className="text-xs text-gray-500 mt-1">Start planning your next journey across India.</p>
            </div>
            <Link
              href="/destinations"
              className="inline-block px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors"
            >
              Explore Destinations
            </Link>
          </div>
        )
      )}
    </div>
  );
}
