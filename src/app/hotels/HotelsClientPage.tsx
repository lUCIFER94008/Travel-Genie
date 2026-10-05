'use client';

import React, { useState } from 'react';
import HotelCard from '@/components/HotelCard';
import BookingModal from '@/components/BookingModal';
import Breadcrumb from '@/components/Breadcrumb';
import { Building2, Search } from 'lucide-react';

interface HotelsClientPageProps {
  hotels: any[];
  search?: string;
  type?: string;
}

export default function HotelsClientPage({ hotels, search, type }: HotelsClientPageProps) {
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<any>(null);

  const filterTypes = ['All', 'Resort', 'Hotel', 'Villa'];
  const activeType = type || 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Hotels & Resorts' }]} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Stays & Resorts Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Verified Hotels & Resorts
          </h1>
          <p className="text-sm text-gray-600">
            Tea plantation bungalows, waterfall view eco-resorts & luxury hill stays in Munnar.
          </p>
        </div>

        <form method="GET" action="/hotels" className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search hotel or amenity..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTypes.map((ft) => (
          <a
            key={ft}
            href={`/hotels?${ft !== 'All' ? `type=${ft}` : ''}${search ? `&search=${search}` : ''}`}
            className={`px-4 py-2 rounded-full text-xs font-semibold ${
              activeType === ft ? 'bg-[#FF6A00] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {ft}s
          </a>
        ))}
      </div>

      {hotels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel: any) => (
            <HotelCard
              key={hotel._id || hotel.slug}
              hotel={hotel}
              onOpenBooking={(h) => setSelectedHotelForBooking(h)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">No properties found</h3>
          <p className="text-xs text-gray-500 mt-1">Try another search keyword or type.</p>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        property={selectedHotelForBooking}
        isOpen={!!selectedHotelForBooking}
        onClose={() => setSelectedHotelForBooking(null)}
      />
    </div>
  );
}
