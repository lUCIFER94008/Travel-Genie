'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import { Star, MapPin, ExternalLink, Navigation, Building2, Calendar } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

interface HotelCardProps {
  hotel: {
    _id?: string;
    name: string;
    slug: string;
    type: string;
    description: string;
    address: string;
    primaryPhoto: any;
    rating?: number;
    ratingCount?: number;
    amenities: string[];
    phone?: string;
    website?: string;
    location: {
      coordinates: [number, number];
    };
    distanceKm?: number;
  };
  onOpenBooking?: (hotel: any) => void;
}

export default function HotelCard({ hotel, onOpenBooking }: HotelCardProps) {
  const rawPhoto = typeof hotel.primaryPhoto === 'object' ? hotel.primaryPhoto?.url : hotel.primaryPhoto;

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hotel.location.coordinates[1]},${hotel.location.coordinates[0]}`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <TravelImage
            src={rawPhoto}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#FF6A00]" />
            <span>{hotel.type || 'Resort'}</span>
          </div>

          {hotel.rating && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-700 text-xs font-bold flex items-center gap-1 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{hotel.rating.toFixed(1)}</span>
              {hotel.ratingCount && (
                <span className="text-gray-400 font-normal">({hotel.ratingCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col gap-2.5">
          <h4 className="text-lg font-bold text-[#171717] leading-snug">
            {hotel.name}
          </h4>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="line-clamp-1">{hotel.address}</span>
          </div>

          {hotel.distanceKm !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-semibold">
              <Navigation className="w-3.5 h-3.5" />
              <span>{formatDistance(hotel.distanceKm)}</span>
            </div>
          )}

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
            {hotel.description}
          </p>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-600 font-medium"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 4 && (
                <span className="text-[11px] text-gray-400 px-1 py-0.5">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
        <a
          href={googleDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-gray-600 hover:text-[#FF6A00] flex items-center gap-1"
        >
          <Navigation className="w-3.5 h-3.5 text-[#FF6A00]" />
          Route
        </a>

        <div className="flex items-center gap-2">
          {hotel.website && (
            <a
              href={hotel.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-[#FF6A00] rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
              title="Official Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => onOpenBooking && onOpenBooking(hotel)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}
