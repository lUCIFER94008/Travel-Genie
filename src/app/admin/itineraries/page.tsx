'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Map, Search, Eye } from 'lucide-react';

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/itinerary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItineraries(data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = itineraries.filter((i) =>
    (i.name || i.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.destinationName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">System Administration</span>
          <h1 className="text-2xl font-black text-[#171717] mt-1">User Trip Itineraries</h1>
          <p className="text-xs text-gray-500 mt-1">View user-created travel itineraries and multi-day schedules.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search itinerary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading trip itineraries...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No itineraries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">User ID / Name</th>
                  <th className="p-4">Itinerary Name</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((it) => (
                  <tr key={it._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono text-[11px] text-gray-600 font-bold">{it.userId || 'User'}</td>
                    <td className="p-4 font-bold text-gray-900">{it.name || it.title}</td>
                    <td className="p-4 text-gray-600 font-semibold">{it.destinationName || 'Kerala'}</td>
                    <td className="p-4 text-gray-500">{it.days || 3} Days</td>
                    <td className="p-4 text-gray-400">{new Date(it.createdAt).toLocaleDateString()}</td>
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
