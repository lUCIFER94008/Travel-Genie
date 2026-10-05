'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Plus, Trash2, Edit3, Copy, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default function UserItinerariesPage() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDest, setNewDest] = useState('Kerala');

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/itinerary');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          title: newName.trim(),
          destinationName: newDest.trim(),
          description: `Custom ${newDest.trim()} trip itinerary.`,
          items: [],
        }),
      });

      if (res.ok) {
        setNewName('');
        setShowCreateModal(false);
        fetchItineraries();
      }
    } catch {
      alert('Failed to create itinerary');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;
    try {
      const res = await fetch(`/api/itinerary/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItineraries((prev) => prev.filter((it) => it._id !== id));
      }
    } catch {
      alert('Failed to delete itinerary');
    }
  };

  const handleDuplicate = async (itinerary: any) => {
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${itinerary.name || itinerary.title} (Copy)`,
          title: `${itinerary.name || itinerary.title} (Copy)`,
          destinationName: itinerary.destinationName,
          description: itinerary.description,
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
          <p className="text-xs text-gray-500">Create, customize, and manage multi-day trip plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Itinerary
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading your itineraries...</div>
      ) : itineraries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itineraries.map((it) => (
            <div
              key={it._id}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF6A00] text-[11px] font-bold">
                    📍 {it.destinationName || 'India'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{it.name || it.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {it.description || 'Custom multi-day travel schedule.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Items: {it.items?.length || 0} Places</span>
                  <span className="capitalize text-emerald-700 font-bold">{it.status || 'Active'}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(it)}
                      title="Duplicate"
                      className="p-2 text-gray-600 hover:text-[#FF6A00] hover:bg-orange-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(it._id)}
                      title="Delete"
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  <Link
                    href="/itinerary"
                    className="px-3 py-1.5 bg-[#FF6A00] text-white text-xs font-bold rounded-xl hover:bg-[#e05d00] transition-colors"
                  >
                    Open Trip Builder →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <Compass className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No custom itineraries yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-full"
          >
            Create Your First Itinerary
          </button>
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 border border-gray-200 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Create New Travel Itinerary</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Trip Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kerala 5-Day Vacation"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Destination</label>
                <input
                  type="text"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  placeholder="e.g. Munnar, Kerala"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#e05d00] rounded-full shadow-xs"
                >
                  Save Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
