'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hotel, Search, Star, Eye } from 'lucide-react';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/hotels')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHotels(data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = hotels.filter((h) =>
    (h.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.destinationId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Catalog Management</span>
          <h1 className="text-2xl font-black text-[#171717] mt-1">Hotels & Stays</h1>
          <p className="text-xs text-gray-500 mt-1">Manage verified hotel listings, locations, and amenities.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading hotels...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No hotels found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Hotel Property</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((h) => (
                  <tr key={h._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{h.name}</td>
                    <td className="p-4 text-gray-600 uppercase font-bold">{h.destinationId}</td>
                    <td className="p-4 text-gray-500">{h.type || 'Hotel'}</td>
                    <td className="p-4 font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {h.rating || '4.5'}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/hotels/${h.slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
