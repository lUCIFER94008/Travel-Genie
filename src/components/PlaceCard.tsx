'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import { Star, MapPin, Heart, Navigation, Info } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

interface PlaceCardProps {
  place: {
    _id?: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    primaryPhoto: any;
    rating?: number;
    ratingCount?: number;
    location: {
      coordinates: [number, number];
    };
    distanceKm?: number;
    source?: string;
  };
  userLat?: number;
  userLng?: number;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const rawPhoto = typeof place.primaryPhoto === 'object' ? place.primaryPhoto?.url : place.primaryPhoto;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId: place._id || place.slug, type: 'place' }),
    }).catch(() => {});
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      <div>
        {/* Image Box */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <TravelImage
            src={rawPhoto}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            aria-label={`Favorite ${place.name}`}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-red-500 hover:scale-110 transition-all shadow-xs"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Category Tag */}
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wide">
            {place.category}
          </span>
        </div>

        {/* Details */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-bold text-[#171717] group-hover:text-[#FF6A00] transition-colors leading-snug">
              {place.name}
            </h4>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
            {place.distanceKm !== undefined ? (
              <span className="flex items-center gap-1 text-[#FF6A00] font-semibold">
                <Navigation className="w-3.5 h-3.5" />
                {formatDistance(place.distanceKm)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Verified Attraction
              </span>
            )}

            {place.rating ? (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{place.rating.toFixed(1)}</span>
                {place.ratingCount ? (
                  <span className="text-gray-400 font-normal">({place.ratingCount > 1000 ? `${(place.ratingCount / 1000).toFixed(1)}k` : place.ratingCount})</span>
                ) : null}
              </div>
            ) : (
              <span className="text-gray-400 text-[11px]">Information unavailable</span>
            )}
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
            {place.description}
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-gray-100 mt-2">
        <span className="text-[10px] text-gray-400 truncate max-w-[120px]" title={place.source}>
          {place.source || 'Kerala Tourism'}
        </span>
        <Link
          href={`/places/${place.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:text-[#e05d00] hover:underline"
        >
          View Details
          <Info className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
