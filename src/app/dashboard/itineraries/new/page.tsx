'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { Compass, Calendar, Users, MapPin, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function NewItineraryPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState('Kochi');
  const [destinationId, setDestinationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/destinations')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setDestinations(json.data);
          if (json.data.length > 0) {
            setDestinationName(json.data[0].name);
            setDestinationId(json.data[0]._id || json.data[0].slug);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDestinationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setDestinationName(selectedName);
    const match = destinations.find((d) => d.name === selectedName);
    if (match) {
      setDestinationId(match._id || match.slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const tripTitle = title.trim() || `${destinationName} Exploration Trip`;

    setLoading(true);

    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tripTitle,
          name: tripTitle,
          destinationName,
          destinationId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          travelers,
          notes: notes.trim(),
          items: [],
        }),
      });

      const data = await res.json();

      if (res.ok && data.data?._id) {
        router.push(`/dashboard/itineraries/${data.data._id}`);
      } else {
        setErrorMsg(data.error || 'Failed to create itinerary.');
        setLoading(false);
      }
    } catch {
      setErrorMsg('An error occurred while creating the itinerary.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <Breadcrumb
        items={[
          { label: 'My Account', href: '/dashboard' },
          { label: 'Itineraries', href: '/dashboard/itineraries' },
          { label: 'Create New Itinerary' },
        ]}
      />

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <Link
            href="/dashboard/itineraries"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#FF6A00] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Itineraries
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">Plan New Trip Itinerary</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Choose any Indian destination and customize your day-by-day travel schedule
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Itinerary Name / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kochi Weekend Heritage Tour or Goa Beach Getaway"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Target Destination</label>
              {destinations.length > 0 ? (
                <select
                  value={destinationName}
                  onChange={handleDestinationSelect}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  {destinations.map((d) => (
                    <option key={d._id || d.slug} value={d.name}>
                      📍 {d.name} ({d.state})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  placeholder="e.g. Kochi, Agra, Goa, Munnar, Wayanad"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Number of Travelers</label>
              <input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Start Date (Optional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Notes & Trip Objectives</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific places, dining preferences, or travel notes..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Creating Itinerary...</span>
          ) : (
            <>
              <span>Create Itinerary & Open Builder</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
