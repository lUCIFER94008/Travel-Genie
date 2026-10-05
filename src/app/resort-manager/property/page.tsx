'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Save,
  MapPin,
  Phone,
  Globe,
  Star,
  Layers,
  AlertCircle,
  Bed,
} from 'lucide-react';

export default function ResortManagerPropertyPage() {
  const [resort, setResort] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [amenitiesStr, setAmenitiesStr] = useState('');

  useEffect(() => {
    fetch('/api/resort-manager/property')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const r = data.data[0];
          setResort(r);
          setDescription(r.description || '');
          setAddress(r.address || '');
          setPhone(r.phone || '');
          setWebsite(r.website || '');
          setAmenitiesStr(Array.isArray(r.amenities) ? r.amenities.join(', ') : '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resort) return;

    setSaving(true);
    setMessage('');

    try {
      const amenities = amenitiesStr.split(',').map((a) => a.trim()).filter(Boolean);
      const res = await fetch(`/api/resorts/${resort._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          address,
          phone,
          website,
          amenities,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Resort property updated successfully!');
        setResort(data.data);
      } else {
        setMessage(data.error || 'Failed to update property');
      }
    } catch (err) {
      setMessage('Error updating property details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading assigned resort property...</div>;
  }

  if (!resort) {
    return (
      <div className="p-8 max-w-md mx-auto bg-white rounded-2xl border border-gray-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-gray-900">No Resort Assigned</h2>
        <p className="text-xs text-gray-500">
          You do not have an assigned resort property yet. Please contact an administrator to assign your resort.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center space-x-4">
            {resort.primaryPhoto?.url ? (
              <img
                src={resort.primaryPhoto.url}
                alt={resort.name}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-[#171717]">{resort.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {resort.address} &bull; <span className="font-bold uppercase">{resort.destinationId}</span>
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <Star className="w-3.5 h-3.5 fill-amber-500" /> {resort.rating || '4.8'}
          </span>
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

        {/* Property Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Property Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Direct Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Official Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Property Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700">Guest Amenities (comma separated)</label>
            <input
              type="text"
              value={amenitiesStr}
              onChange={(e) => setAmenitiesStr(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FF6A00] outline-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Updating...' : 'Save Property Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
