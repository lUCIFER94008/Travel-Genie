'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  Globe,
  Star,
  Bed,
  CalendarCheck,
  Camera,
  Layers,
} from 'lucide-react';

export default function AdminResortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [resort, setResort] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'images'>('overview');
  const [message, setMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [amenitiesStr, setAmenitiesStr] = useState('');

  useEffect(() => {
    fetch(`/api/resorts/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const r = data.data;
          setResort(r);
          setName(r.name || '');
          setDescription(r.description || '');
          setAddress(r.address || '');
          setPhone(r.phone || '');
          setWebsite(r.website || '');
          setAmenitiesStr(Array.isArray(r.amenities) ? r.amenities.join(', ') : '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const amenities = amenitiesStr.split(',').map((a) => a.trim()).filter(Boolean);
      const res = await fetch(`/api/resorts/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          address,
          phone,
          website,
          amenities,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Resort updated successfully!');
        setResort(data.data);
      } else {
        setMessage(data.error || 'Failed to update resort');
      }
    } catch (err) {
      setMessage('Error updating resort');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading resort property details...</div>;
  }

  if (!resort) {
    return <div className="p-12 text-center text-xs text-red-500">Resort property not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href="/admin/resorts"
        className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-[#FF6A00]"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Resorts Catalog
      </Link>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center space-x-4">
            {resort.primaryPhoto?.url ? (
              <img
                src={resort.primaryPhoto.url}
                alt={resort.name}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-xl">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-[#171717]">{resort.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {resort.address} &bull; Destination: <span className="font-bold text-gray-800 uppercase">{resort.destinationId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {resort.rating || '4.8'}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-gray-100">
          {[
            { id: 'overview', label: 'Overview & Details', icon: Layers },
            { id: 'rooms', label: 'Rooms & Pricing', icon: Bed },
            { id: 'images', label: 'Photos Catalog', icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-[#FF6A00] text-[#FF6A00]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold ${
              message.includes('successfully') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Resort Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Address / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Phone Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Official Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Amenities (comma separated)</label>
              <input
                type="text"
                value={amenitiesStr}
                onChange={(e) => setAmenitiesStr(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
                placeholder="WiFi, Swimming Pool, Spa, Free Breakfast, Airport Shuttle"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Overview'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Rooms */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900">Configured Room Categories</h3>
            {resort.roomTypes && resort.roomTypes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resort.roomTypes.map((room: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                    <h4 className="font-bold text-gray-900 text-xs">{room.name || `Room Option #${idx + 1}`}</h4>
                    <p className="text-[11px] text-gray-600">{room.description || 'Standard luxury room option.'}</p>
                    <div className="text-xs font-extrabold text-[#FF6A00]">
                      ₹{room.pricePerNight ? room.pricePerNight.toLocaleString() : '8,500'} / night
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Standard Room Suite available. Custom room pricing configured on booking request.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Images */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900">Resort Photography Catalog</h3>
            {resort.photos && resort.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {resort.photos.map((photo: any, idx: number) => (
                  <div key={idx} className="h-32 rounded-xl overflow-hidden border border-gray-200 relative">
                    <img src={photo.url} alt={photo.alt || 'Resort Photo'} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No extra photos uploaded for this property. Primary cover photo active.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
