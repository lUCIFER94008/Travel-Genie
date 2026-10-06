'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Plus, Trash2, Edit3, Copy, Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UserItinerariesPage() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/itineraries');
      if (res.ok) {
        const json = await res.json();
        setItineraries(json.data || []);
      }
    } catch (err) {
      console.warn('Fetch itineraries error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;
    try {
      const res = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItineraries((prev) => prev.filter((it) => it._id !== id));
      }
    } catch {
      alert('Failed to delete itinerary');
    }
  };

  const handleDuplicate = async (itinerary: any) => {
    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${itinerary.title || itinerary.name} (Copy)`,
          name: `${itinerary.title || itinerary.name} (Copy)`,
          destinationName: itinerary.destinationName,
          destinationId: itinerary.destinationId,
          description: itinerary.description,
          travelers: itinerary.travelers,
          items: itinerary.items || [],
        }),
      });
      if (res.ok) {
        fetchItineraries();
      }
    } catch {
      alert('Failed to duplicate itinerary');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717]">My Travel Itineraries</h2>
          <p className="text-xs text-gray-500">Manage your personalized multi-day trip plans for any destination in India</p>
        </div>
        <Link
          href="/dashboard/itineraries/new"
          className="px-4 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Itinerary
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading your itineraries...</div>
      ) : itineraries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itineraries.map((it) => (
            <div
              key={it._id}
              className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF6A00] text-[11px] font-extrabold">
                    📍 {it.destinationName || 'India'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Updated {new Date(it.updatedAt || it.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{it.title || it.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {it.description || `Custom multi-day ${it.destinationName || 'travel'} trip schedule.`}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Scheduled Items: {it.items?.length || 0} Places</span>
                  <span className="capitalize text-emerald-700 font-bold">{it.status || 'Active'}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(it)}
                      title="Duplicate"
                      className="p-2 text-gray-600 hover:text-[#FF6A00] hover:bg-orange-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(it._id)}
                      title="Delete"
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/itineraries/${it._id}`}
                    className="px-3.5 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl hover:bg-[#e05d00] transition-colors flex items-center gap-1"
                  >
                    Open Builder <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-50 rounded-3xl border border-gray-200 space-y-3">
          <Compass className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No custom itineraries yet.</h3>
          <p className="text-xs text-gray-500">Plan a custom trip to any destination in India.</p>
          <Link
            href="/dashboard/itineraries/new"
            className="inline-block px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-full shadow-xs hover:bg-[#e05d00] transition-colors"
          >
            Create Your First Itinerary
          </Link>
        </div>
      )}
    </div>
  );
}
