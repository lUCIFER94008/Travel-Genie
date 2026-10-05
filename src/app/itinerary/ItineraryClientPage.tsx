'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { Calendar, Clock, Trash2, ArrowUp, ArrowDown, Plus, MapPin, Sparkles, Save } from 'lucide-react';

interface ItineraryItem {
  _id?: string;
  placeId?: string;
  placeName: string;
  placeCategory?: string;
  placePhoto?: string;
  day: number;
  time: string;
  notes?: string;
}

export default function ItineraryClientPage() {
  const [items, setItems] = useState<ItineraryItem[]>([
    {
      placeName: 'Tata Tea Museum',
      placeCategory: 'Museum',
      placePhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      day: 1,
      time: '09:00',
      notes: 'Tea processing demonstration & tasting session',
    },
    {
      placeName: 'Mattupetty Dam',
      placeCategory: 'Dam & Lake',
      placePhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      day: 1,
      time: '12:00',
      notes: 'Speed boating and reservoir views',
    },
    {
      placeName: 'Echo Point',
      placeCategory: 'Viewpoint',
      placePhoto: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      day: 1,
      time: '15:00',
      notes: 'Natural acoustic echo testing & souvenir craft stalls',
    },
    {
      placeName: 'Saravana Bhavan Munnar',
      placeCategory: 'Restaurant',
      placePhoto: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
      day: 1,
      time: '18:00',
      notes: 'Authentic Kerala dinner & filter coffee',
    },
    {
      placeName: 'Eravikulam National Park',
      placeCategory: 'National Park',
      placePhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      day: 2,
      time: '08:00',
      notes: 'Nilgiri Tahr wildlife safari at Rajamalai',
    },
    {
      placeName: 'Attukad Waterfalls',
      placeCategory: 'Waterfall',
      placePhoto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      day: 2,
      time: '13:00',
      notes: 'Waterfall view & tea break at Pallivasal',
    },
  ]);

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Fetch user persisted itinerary if logged in
    fetch('/api/itinerary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.items && data.data.items.length > 0) {
          setItems(data.data.items);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveItinerary = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/itinerary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setSaveMessage('Itinerary saved to your account!');
      } else {
        setSaveMessage('Please sign in to save your itinerary permanently.');
      }
    } catch (err) {
      setSaveMessage('Error saving itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const dayItems = items.filter((item) => item.day === selectedDay);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Itinerary Builder' }]} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Custom Trip Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">My Trip Itinerary</h1>
          <p className="text-sm text-gray-600">
            Organize places day-by-day, choose visit times, reorder schedule, and save to your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/destinations/munnar"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-full flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FF6A00]" />
            Add More Places
          </Link>

          <button
            onClick={handleSaveItinerary}
            disabled={saving}
            className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Itinerary'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200">
          {saveMessage}
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {[1, 2, 3, 4, 5].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              selectedDay === d
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Day Timeline */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>Day {selectedDay} Plan</span>
          <span className="text-xs text-gray-500 font-normal">({dayItems.length} activities scheduled)</span>
        </h3>

        {dayItems.length > 0 ? (
          <div className="space-y-4">
            {dayItems.map((item, idx) => {
              const originalIndex = items.indexOf(item);
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Time Badge */}
                    <div className="px-3 py-2 bg-[#FFF1E6] text-[#FF6A00] font-extrabold text-sm rounded-xl flex items-center gap-1.5 shrink-0">
                      <Clock className="w-4 h-4" />
                      <span>{item.time}</span>
                    </div>

                    {/* Photo */}
                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
                      {item.placePhoto ? (
                        <img src={item.placePhoto} alt={item.placeName} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-6 h-6 text-gray-400 m-auto" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#171717]">{item.placeName}</h4>
                      {item.placeCategory && (
                        <span className="text-xs text-gray-500 font-medium">{item.placeCategory}</span>
                      )}
                      {item.notes && (
                        <p className="text-xs text-gray-600 mt-1 italic">"{item.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Reorder & Remove Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => moveItem(originalIndex, 'up')}
                      className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveItem(originalIndex, 'down')}
                      className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(originalIndex)}
                      className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="text-base font-bold text-gray-800">No activities scheduled for Day {selectedDay}</h4>
            <p className="text-xs text-gray-500">
              Browse Munnar attractions or restaurants to add items to your trip.
            </p>
            <Link
              href="/destinations/munnar"
              className="inline-block px-5 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-full"
            >
              Browse Munnar Places
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
