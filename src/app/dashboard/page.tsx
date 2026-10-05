'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import {
  Calendar,
  Compass,
  Heart,
  Star,
  MapPin,
  ArrowRight,
  Clock,
  Plus,
  CheckCircle2,
  Building2,
  Utensils,
  Eye,
  Edit,
} from 'lucide-react';

export default function UserDashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          setData(json.data);
        }
      })
      .catch((err) => console.warn('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-400 animate-pulse">Loading dashboard statistics...</div>;
  }

  const stats = data?.stats || {
    upcomingTrips: 0,
    activeBookings: 0,
    totalItineraries: 0,
    totalFavorites: 0,
    totalReviews: 0,
  };
  const bookings = data?.bookings || [];
  const itineraries = data?.itineraries || [];
  const favorites = data?.favorites || data?.savedDestinations || [];
  const reviews = data?.reviews || [];

  return (
    <div className="space-y-8">
      {/* 1. Four Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Upcoming Trips</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.upcomingTrips || itineraries.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Active Bookings</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.activeBookings || bookings.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Saved Places</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalFavorites || favorites.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">My Reviews</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalReviews || reviews.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/destinations"
          className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-900">Explore Destinations</span>
        </Link>

        <Link
          href="/dashboard/itineraries"
          className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-900">Create Itinerary</span>
        </Link>

        <Link
          href="/dashboard/bookings"
          className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-900">View Bookings</span>
        </Link>

        <Link
          href="/dashboard/favorites"
          className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-900">Saved Places</span>
        </Link>
      </div>

      {/* 3. Upcoming Bookings Section */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#171717]">Upcoming Bookings</h2>
            <p className="text-xs text-gray-500">Your reserved hotel and resort stays</p>
          </div>
          <Link href="/dashboard/bookings" className="text-xs font-bold text-[#FF6A00] hover:underline">
            View All →
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((b: any) => (
              <div key={b._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">{b.propertyName || b.propertyId}</h3>
                    <p className="text-xs text-gray-500 capitalize">{b.destinationId || 'Kerala, India'}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dates:</span>
                    <span className="font-bold text-gray-800">
                      {new Date(b.checkIn).toLocaleDateString()} &rarr; {new Date(b.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Guests & Rooms:</span>
                    <span className="font-medium">{b.guests} Guests &bull; {b.rooms || 1} Room(s)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/dashboard/bookings"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FF6A00] text-white text-xs font-bold hover:bg-orange-600 transition-colors"
                  >
                    View Booking
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl space-y-3 border border-dashed border-gray-200">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-gray-800">No bookings yet</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Explore our catalog of hill stays and tea bungalows.</p>
            </div>
            <Link
              href="/hotels"
              className="inline-block px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Explore Resorts
            </Link>
          </div>
        )}
      </section>

      {/* 4. Recent Itineraries Section */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#171717]">My Itineraries</h2>
            <p className="text-xs text-gray-500">Latest multi-day trip schedules</p>
          </div>
          <Link href="/dashboard/itineraries" className="text-xs font-bold text-[#FF6A00] hover:underline">
            View All Itineraries →
          </Link>
        </div>

        {itineraries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {itineraries.slice(0, 3).map((it: any) => (
              <div key={it._id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-900 text-sm">{it.name || it.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-[#FF6A00]">
                      {it.days || 3} Days
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{it.description || 'Kerala hill & backwater trip plan'}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500">{it.items?.length || 0} Places</span>
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/dashboard/itineraries"
                      className="px-2.5 py-1 rounded bg-white border border-gray-200 text-gray-700 text-[11px] font-bold hover:bg-gray-100"
                    >
                      View
                    </Link>
                    <Link
                      href="/dashboard/itineraries"
                      className="px-2.5 py-1 rounded bg-[#FF6A00] text-white text-[11px] font-bold hover:bg-orange-600"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl space-y-3 border border-dashed border-gray-200">
            <Compass className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-gray-800">No itineraries yet</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Build a custom day-by-day travel plan.</p>
            </div>
            <Link
              href="/dashboard/itineraries"
              className="inline-block px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Create Itinerary
            </Link>
          </div>
        )}
      </section>

      {/* 5. Favorites Grid Section */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#171717]">Saved Places</h2>
            <p className="text-xs text-gray-500">Your bookmarked destinations and spots</p>
          </div>
          <Link href="/dashboard/favorites" className="text-xs font-bold text-[#FF6A00] hover:underline">
            View All Saved →
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favorites.slice(0, 4).map((fav: any, idx: number) => (
              <div key={fav._id || idx} className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 space-y-2 p-2">
                <div className="h-24 bg-gray-200 rounded-lg overflow-hidden relative">
                  {fav.image || fav.heroImage ? (
                    <img src={fav.image || fav.heroImage} alt={fav.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Photo</div>
                  )}
                </div>
                <div className="px-1">
                  <h4 className="font-extrabold text-gray-900 text-xs truncate">{fav.name || fav.title}</h4>
                  <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" /> {fav.location || fav.state || 'Kerala'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl space-y-3 border border-dashed border-gray-200">
            <Heart className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-gray-800">No saved places yet</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Bookmark attractions and destinations to plan your trips.</p>
            </div>
            <Link
              href="/destinations"
              className="inline-block px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Explore Destinations
            </Link>
          </div>
        )}
      </section>

      {/* 6. Recent Reviews Section */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#171717]">Recent Reviews</h2>
            <p className="text-xs text-gray-500">Reviews you published across Travel Genie</p>
          </div>
          <Link href="/dashboard/reviews" className="text-xs font-bold text-[#FF6A00] hover:underline">
            View All Reviews →
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {reviews.slice(0, 3).map((rev: any) => (
              <div key={rev._id} className="py-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{rev.targetName || 'Place Review'}</span>
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" /> {rev.rating || 5}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{rev.comment || rev.text}"</p>
                <span className="text-[10px] text-gray-400 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl space-y-2 border border-dashed border-gray-200">
            <Star className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-bold text-gray-800">You haven't reviewed any places yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
