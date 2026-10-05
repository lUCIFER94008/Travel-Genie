'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Search, MapPin, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/destinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDestinations(data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = destinations.filter((d) =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.state || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.district || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Catalog Management</span>
          <h1 className="text-2xl font-black text-[#171717] mt-1">Destinations</h1>
          <p className="text-xs text-gray-500 mt-1">Manage verified Indian destinations and tourist spots.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6A00] outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading destinations...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No destinations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Destination</th>
                  <th className="p-4">District & State</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{d.name}</td>
                    <td className="p-4 text-gray-600">{d.district}, {d.state}</td>
                    <td className="p-4 text-gray-500 font-medium">{d.category || 'Hill Station'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/destinations/${d.slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Public Page
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
