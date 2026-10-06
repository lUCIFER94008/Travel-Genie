'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import {
  Calendar,
  Clock,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  MapPin,
  Save,
  Search,
  X,
  Compass,
  Utensils,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

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

export default function ItineraryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [itinerary, setItinerary] = useState<any>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Add place modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<any[]>([]);
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  const [modalTab, setModalTab] = useState<'places' | 'restaurants'>('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalDay, setModalDay] = useState(1);
  const [modalTime, setModalTime] = useState('10:00');
  const [modalNotes, setModalNotes] = useState('');

  const fetchItinerary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/itineraries/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setItinerary(json.data);
          setItems(json.data.items || []);
        }
      } else {
        router.push('/dashboard/itineraries');
      }
    } catch (err) {
      console.warn('Fetch itinerary error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  useEffect(() => {
    if (itinerary?.destinationName) {
      const destName = itinerary.destinationName;
      // Fetch destination-specific places & restaurants
      fetch(`/api/places?destination=${encodeURIComponent(destName)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) setAvailablePlaces(json.data);
        })
        .catch(() => {});

      fetch(`/api/restaurants?destination=${encodeURIComponent(destName)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) setAvailableRestaurants(json.data);
        })
        .catch(() => {});
    }
  }, [itinerary]);

  const handleSaveItinerary = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch(`/api/itineraries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setSaveMessage('Itinerary saved successfully!');
      } else {
        setSaveMessage('Failed to save itinerary.');
      }
    } catch {
      setSaveMessage('Error saving itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
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

  const handleAddSelectedPlace = (place: any, typeLabel: string) => {
    const photo =
      place.image ||
      place.primaryPhoto?.url ||
      (typeof place.primaryPhoto === 'string' ? place.primaryPhoto : '') ||
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

    const newItem: ItineraryItem = {
      _id: new Date().getTime().toString(),
      placeId: place._id || place.slug,
      placeName: place.name,
      placeCategory: place.category || place.cuisine || typeLabel,
      placePhoto: photo,
      day: modalDay,
      time: modalTime,
      notes: modalNotes.trim() || `Visit ${place.name} in ${itinerary?.destinationName || 'destination'}`,
    };

    setItems([...items, newItem]);
    setShowAddModal(false);
    setModalNotes('');
    setSaveMessage(`Added ${place.name} to Day ${modalDay}! Remember to click Save Itinerary.`);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading itinerary builder...</div>;
  }

  if (!itinerary) {
    return <div className="p-8 text-center text-xs text-gray-500">Itinerary not found.</div>;
  }

  const dayItems = items.filter((item) => item.day === selectedDay);

  const filteredPlaces = availablePlaces.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRestaurants = availableRestaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      <Breadcrumb
        items={[
          { label: 'My Account', href: '/dashboard' },
          { label: 'Itineraries', href: '/dashboard/itineraries' },
          { label: itinerary.title || itinerary.name },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link
            href="/dashboard/itineraries"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#FF6A00] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Itineraries
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-extrabold uppercase tracking-wider">
              📍 Destination: {itinerary.destinationName}
            </span>
            {itinerary.travelers && (
              <span className="text-xs text-gray-500 font-medium">👥 {itinerary.travelers} Travelers</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">{itinerary.title || itinerary.name}</h1>
          {itinerary.notes && <p className="text-xs text-gray-500 font-medium">{itinerary.notes}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setModalDay(selectedDay);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FF6A00]" />
            Add {itinerary.destinationName} Place
          </button>

          <button
            onClick={handleSaveItinerary}
            disabled={saving}
            className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Itinerary'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === d
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day {d} ({items.filter((i) => i.day === d).length})
          </button>
        ))}
      </div>

      {/* Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Day {selectedDay} Schedule</span>
            <span className="text-xs text-gray-500 font-normal">
              ({dayItems.length} items for {itinerary.destinationName})
            </span>
          </h3>
          <button
            onClick={() => {
              setModalDay(selectedDay);
              setShowAddModal(true);
            }}
            className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Place to Day {selectedDay}
          </button>
        </div>

        {dayItems.length > 0 ? (
          <div className="space-y-4">
            {dayItems.map((item, idx) => {
              const originalIndex = items.indexOf(item);
              return (
                <div
                  key={item._id || idx}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 bg-[#FFF1E6] text-[#FF6A00] font-extrabold text-sm rounded-xl flex items-center gap-1.5 shrink-0">
                      <Clock className="w-4 h-4" />
                      <span>{item.time}</span>
                    </div>

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
                        <span className="text-xs text-gray-500 font-medium block">{item.placeCategory}</span>
                      )}
                      {item.notes && <p className="text-xs text-gray-600 mt-1 italic">"{item.notes}"</p>}
                    </div>
                  </div>

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
            <Compass className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold text-gray-800">No activities scheduled for Day {selectedDay}</h4>
            <p className="text-xs text-gray-500">
              Add attractions or restaurants near {itinerary.destinationName} to your itinerary.
            </p>
            <button
              onClick={() => {
                setModalDay(selectedDay);
                setShowAddModal(true);
              }}
              className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full transition-colors"
            >
              Add {itinerary.destinationName} Places
            </button>
          </div>
        )}
      </div>

      {/* Add Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 space-y-4 border border-gray-200 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Add Place to {itinerary.destinationName} Trip
                </h3>
                <p className="text-xs text-gray-500">
                  Showing attractions & restaurants verified for {itinerary.destinationName}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Target Day</label>
                <select
                  value={modalDay}
                  onChange={(e) => setModalDay(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Visit Time</label>
                <input
                  type="time"
                  value={modalTime}
                  onChange={(e) => setModalTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Search Places</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setModalTab('places')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  modalTab === 'places'
                    ? 'bg-[#FF6A00] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Attractions ({filteredPlaces.length})
              </button>
              <button
                onClick={() => setModalTab('restaurants')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  modalTab === 'restaurants'
                    ? 'bg-[#FF6A00] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Restaurants ({filteredRestaurants.length})
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {modalTab === 'places' ? (
                filteredPlaces.length > 0 ? (
                  filteredPlaces.map((place) => (
                    <div
                      key={place._id || place.slug}
                      className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-4 hover:bg-orange-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            place.image ||
                            place.primaryPhoto?.url ||
                            (typeof place.primaryPhoto === 'string' ? place.primaryPhoto : '') ||
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={place.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{place.name}</h4>
                          <span className="text-[10px] text-gray-500 font-medium block">
                            {place.category} • {itinerary.destinationName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddSelectedPlace(place, 'Attraction')}
                        className="px-3 py-1.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-xl"
                      >
                        + Add
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No attractions found for {itinerary.destinationName}.
                  </p>
                )
              ) : filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((rest) => (
                  <div
                    key={rest._id || rest.slug}
                    className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-4 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          rest.image ||
                          rest.primaryPhoto?.url ||
                          (typeof rest.primaryPhoto === 'string' ? rest.primaryPhoto : '') ||
                          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={rest.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{rest.name}</h4>
                        <span className="text-[10px] text-gray-500 font-medium block">
                          {Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : rest.cuisine} • {itinerary.destinationName}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddSelectedPlace(rest, 'Restaurant')}
                      className="px-3 py-1.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-xl"
                    >
                      + Add
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">
                  No restaurants found for {itinerary.destinationName}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
