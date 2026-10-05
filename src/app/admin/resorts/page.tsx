'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, MapPin, Star, Edit, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function AdminResortsPage() {
  const [resorts, setResorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/resorts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResorts(data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredResorts = resorts.filter((r) => {
    return (
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.destinationId || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.address || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Property Catalog</span>
          <h1 className="text-2xl font-black text-[#171717] mt-1">Resort Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage resort details, room types, photos, and resort manager assignments.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search resort or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Resorts Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading resorts...</div>
      ) : filteredResorts.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-200">
          No resorts found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResorts.map((resort) => (
            <div
              key={resort._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3 p-5">
                {/* Image / Banner */}
                <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative">
                  {resort.primaryPhoto?.url ? (
                    <img
                      src={resort.primaryPhoto.url}
                      alt={resort.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                      No Image
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {resort.destinationId}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900 line-clamp-1">{resort.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {resort.address}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{resort.rating || '4.5'}</span>
                    <span className="text-gray-400 font-normal">({resort.ratingCount || 12} reviews)</span>
                  </div>
                  <span className="text-gray-500 font-medium">
                    {resort.roomTypes?.length || 0} Room Types
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    resort.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {resort.isActive !== false ? 'Active' : 'Disabled'}
                </span>
                <Link
                  href={`/admin/resorts/${resort._id}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FF6A00] text-white text-xs font-bold shadow-sm hover:bg-orange-600 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Manage Resort
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
