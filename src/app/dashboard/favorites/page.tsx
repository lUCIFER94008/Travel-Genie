'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Compass, MapPin, Star, Trash2, ExternalLink, Utensils, Hotel, Building2 } from 'lucide-react';

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const json = await res.json();
        setFavorites(json.data || []);
      }
    } catch (err) {
      console.warn('Fetch favorites error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (fav: any) => {
    try {
      const res = await fetch(`/api/favorites?itemType=${fav.itemType}&itemId=${fav.itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((item) => !(item.itemType === fav.itemType && item.itemId === fav.itemId)));
      }
    } catch {
      alert('Failed to remove favorite.');
    }
  };

  const filteredFavorites = favorites.filter((fav) => {
    if (activeTab === 'all') return true;
    return fav.itemType === activeTab;
  });

  const getDetailHref = (fav: any) => {
    const slug = fav.item?.slug || fav.itemId;
    switch (fav.itemType) {
      case 'destination':
        return `/destinations/${slug}`;
      case 'place':
        return `/places/${slug}`;
      case 'restaurant':
        return `/restaurants/${slug}`;
      case 'hotel':
      case 'resort':
        return `/hotels/${slug}`;
      default:
        return `/destinations`;
    }
  };

  const getItemImage = (fav: any) => {
    const item = fav.item;
    if (!item) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
    if (item.image) return item.image;
    if (item.primaryPhoto?.url) return item.primaryPhoto.url;
    if (typeof item.primaryPhoto === 'string') return item.primaryPhoto;
    if (item.coverImage) return item.coverImage;
    if (item.photos?.[0]?.url) return item.photos[0].url;
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  };

  const getItemName = (fav: any) => {
    return fav.item?.name || fav.itemId || 'Saved Item';
  };

  const getItemLocation = (fav: any) => {
    const item = fav.item;
    if (!item) return 'India';
    return item.address || item.district || item.state || item.city || 'India';
  };

  const tabs = [
    { id: 'all', label: 'All Saved' },
    { id: 'destination', label: 'Destinations' },
    { id: 'place', label: 'Places & Sights' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'hotel', label: 'Hotels & Resorts' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717]">My Saved Favorites</h2>
          <p className="text-xs text-gray-500">View and manage your bookmarked destinations, places, restaurants, and stays</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#FF6A00] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.id === 'all' ? favorites.length : favorites.filter((f) => f.itemType === tab.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading saved favorites...</div>
      ) : filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((fav) => {
            const image = getItemImage(fav);
            const name = getItemName(fav);
            const location = getItemLocation(fav);
            const href = getDetailHref(fav);
            const rating = fav.item?.rating || 4.5;

            return (
              <div
                key={`${fav.itemType}-${fav.itemId}`}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] bg-gray-100">
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {fav.itemType}
                  </span>
                  <button
                    onClick={() => handleRemoveFavorite(fav)}
                    title="Remove Favorite"
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm"
                  >
                    <Heart className="w-4 h-4 fill-red-500" />
                  </button>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF6A00]" />
                        {location}
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {rating}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#171717] line-clamp-1">{name}</h3>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      href={href}
                      className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(fav)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <Heart className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No saved favorites yet.</h3>
          <p className="text-xs text-gray-500">
            Click the heart icon on any destination, attraction, or restaurant to save it here.
          </p>
          <Link
            href="/destinations"
            className="inline-block px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
          >
            Explore Destinations
          </Link>
        </div>
      )}
    </div>
  );
}
