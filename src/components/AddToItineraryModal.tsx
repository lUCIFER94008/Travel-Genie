'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddToItineraryModalProps {
  place: {
    _id?: string;
    name: string;
    category?: string;
    primaryPhoto?: string;
    location?: {
      coordinates: [number, number];
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToItineraryModal({ place, isOpen, onClose }: AddToItineraryModalProps) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !place) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: place._id,
          placeName: place.name,
          placeCategory: place.category,
          placePhoto: place.primaryPhoto,
          location: place.location ? {
            latitude: place.location.coordinates[1],
            longitude: place.location.coordinates[0],
          } : undefined,
          day,
          time,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add place to itinerary');
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error adding to itinerary. Please sign in first.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-8">
        
        {/* Header */}
        <div className="bg-[#FFF1E6] px-6 py-4 flex items-center justify-between border-b border-orange-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold uppercase tracking-wide">
              <Calendar className="w-4 h-4" />
              <span>Trip Planner</span>
            </div>
            <h3 className="text-lg font-bold text-[#171717]">Add to Itinerary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/80 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form / Result */}
        {success ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Added to Itinerary!</h4>
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{place.name}</span> scheduled for <span className="font-bold text-[#FF6A00]">Day {day} at {time}</span>.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#FF6A00] text-white text-xs font-semibold rounded-full"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden relative shrink-0">
                {place.primaryPhoto && (
                  <img src={place.primaryPhoto} alt={place.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h5 className="text-sm font-bold text-gray-900 line-clamp-1">{place.name}</h5>
                <span className="text-xs text-gray-500">{place.category || 'Attraction'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Day</label>
                <select
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Time Slot</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Activity Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Speed boating ticket, Nilgiri Tahr safari..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-semibold rounded-full shadow-md transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add to My Trip'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
