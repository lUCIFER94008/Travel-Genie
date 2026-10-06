'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import { MapPin, Heart, ArrowUpRight } from 'lucide-react';

interface DestinationCardProps {
  destination: {
    _id?: string;
    name: string;
    slug: string;
    state: string;
    district?: string;
    description: string;
    heroImage: any;
    categories?: string[];
    placeCount?: number | string;
  };
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const rawImage = typeof destination.heroImage === 'object' ? destination.heroImage?.url : destination.heroImage;

  React.useEffect(() => {
    fetch('/api/favorites')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          const match = data.data.some(
            (fav: any) =>
              fav.itemType === 'destination' &&
              (fav.itemId === destination._id || fav.itemId === destination.slug)
          );
          if (match) setIsFavorite(true);
        }
      })
      .catch(() => {});
  }, [destination._id, destination.slug]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = destination._id || destination.slug;
    const newFavState = !isFavorite;
    setIsFavorite(newFavState);

    try {
      if (newFavState) {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemType: 'destination', itemId: targetId }),
        });
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      } else {
        await fetch(`/api/favorites?itemType=destination&itemId=${targetId}`, {
          method: 'DELETE',
        });
      }
    } catch {
      setIsFavorite(!newFavState);
    }
  };

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <TravelImage
          src={rawImage}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={destination.slug === 'munnar'}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          aria-label={`Favorite ${destination.name}`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-red-500 hover:scale-110 transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* State Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>{destination.district ? `${destination.district}, ` : ''}{destination.state}</span>
        </div>

        {/* Place Count Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FF6A00] text-white text-xs font-bold shadow-md">
          {destination.placeCount ? `${destination.placeCount} Places` : '7+ Places'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-xl font-bold text-[#171717] group-hover:text-[#FF6A00] transition-colors">
              {destination.name}
            </h3>
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#FFF1E6] group-hover:text-[#FF6A00] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-normal">
            {destination.description}
          </p>
        </div>

        {/* Categories Pills */}
        {destination.categories && destination.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-100">
            {destination.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
