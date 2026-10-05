'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DestinationCard from '@/components/DestinationCard';
import PlaceCard from '@/components/PlaceCard';
import { Heart, Compass, MapPin } from 'lucide-react';

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          setFavorites(json.data?.favorites || []);
          setSavedPlaces(json.data?.savedPlaces || []);
          setSavedDestinations(json.data?.savedDestinations || []);
        }
      })
      .catch((err) => console.warn('Fetch favorites error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-extrabold text-[#171717]">Saved Favorites</h2>
        <p className="text-xs text-gray-500">Your bookmarked Indian destinations & attractions</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading saved favorites...</div>
      ) : savedPlaces.length > 0 || savedDestinations.length > 0 ? (
        <div className="space-y-8">
          {savedDestinations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Favorite Destinations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDestinations.map((dest) => (
                  <DestinationCard key={dest._id || dest.slug} destination={dest} />
                ))}
              </div>
            </div>
          )}

          {savedPlaces.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Favorite Sights & Attractions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlaces.map((place) => (
                  <PlaceCard key={place._id || place.slug} place={place} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <Heart className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No saved favorites yet.</p>
          <p className="text-xs text-gray-500">Click the heart icon on any destination or attraction to save it here.</p>
          <Link href="/destinations" className="inline-block px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-full">
            Browse Destinations
          </Link>
        </div>
      )}
    </div>
  );
}
