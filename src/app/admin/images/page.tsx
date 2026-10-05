'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { Search, Camera, Check, ExternalLink, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import TravelImage from '@/components/TravelImage';

export default function AdminImagesPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [destinations, setDestinations] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedTargetType, setSelectedTargetType] = useState<'destination' | 'place'>('place');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [assigning, setAssigning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch destinations and places for assignment dropdowns
    fetch('/api/destinations')
      .then((res) => res.json())
      .then((data) => setDestinations(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/places')
      .then((res) => res.json())
      .then((data) => setPlaces(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to fetch images from Pixabay.');
      } else {
        setResults(data.images || []);
        if (data.images?.length === 0) {
          setError('No images found on Pixabay for this query. Try a different place name.');
        }
      }
    } catch (err: any) {
      setError('Error connecting to Pixabay search service.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (photo: any) => {
    if (!selectedTargetId) {
      alert('Please select a target Destination or Place first from the dropdown.');
      return;
    }

    setAssigning(photo.id);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/images/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: selectedTargetType,
          targetId: selectedTargetId,
          photo,
          isPrimary: true,
        }),
      });

      if (res.ok) {
        setSuccessMessage(`Successfully updated primary photo for selected ${selectedTargetType}!`);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        const data = await res.json();
        alert(`Failed to assign image: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error while assigning image.');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Pixabay Image Management' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Official Pixabay API</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717]">Pixabay Image Search & Assignment</h1>
          <p className="text-xs text-gray-500 mt-1">
            Search high-resolution real travel photography from Pixabay and assign directly to destinations & attractions.
          </p>
        </div>

        <Link
          href="/admin/image-audit"
          className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shrink-0"
        >
          Open Image Audit →
        </Link>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-semibold">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Assignment Control Box */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            1. Target Type
          </label>
          <select
            value={selectedTargetType}
            onChange={(e) => {
              setSelectedTargetType(e.target.value as any);
              setSelectedTargetId('');
            }}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
          >
            <option value="place">Attraction / Place</option>
            <option value="destination">Destination (Hero Image)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            2. Select Specific Item
          </label>
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
          >
            <option value="">-- Choose {selectedTargetType === 'place' ? 'Place' : 'Destination'} --</option>
            {selectedTargetType === 'destination'
              ? destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.state})
                  </option>
                ))
              : places.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.category})
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pixabay for 'Taj Mahal Agra', 'Munnar Kerala', 'Hawa Mahal', 'Goa Beach'..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6A00] shadow-sm"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-bold text-sm rounded-full shadow-md transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Search Pixabay
        </button>
      </form>

      {/* Error / Warning Alert */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-gray-900">
            Pixabay Search Results ({results.length} Photos)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((img) => (
              <div
                key={img.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-gray-100">
                    <TravelImage src={img.url} alt={img.alt} fill className="object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      Pixabay #{img.id}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-900">Photographer:</span>{' '}
                      {img.photographer || 'Pixabay Contributor'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Resolution: {img.width} × {img.height} px
                    </div>
                    {img.tags && (
                      <div className="text-[10px] text-gray-500 line-clamp-1 italic">
                        Tags: {img.tags}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <a
                    href={img.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#FF6A00] font-semibold hover:underline"
                  >
                    View Original on Pixabay <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleAssign(img)}
                    disabled={assigning === img.id}
                    className="w-full py-2 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {assigning === img.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Assign to Selected {selectedTargetType === 'place' ? 'Place' : 'Destination'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
