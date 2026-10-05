'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import { Star, MapPin, Phone, ExternalLink, Navigation, Utensils } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

interface RestaurantCardProps {
  restaurant: {
    _id?: string;
    name: string;
    slug: string;
    cuisine: any;
    description: string;
    address: string;
    primaryPhoto: any;
    rating?: number;
    ratingCount?: number;
    phone?: string;
    website?: string;
    openingHours?: string;
    location: {
      coordinates: [number, number];
    };
    distanceKm?: number;
  };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const rawPhoto = typeof restaurant.primaryPhoto === 'object' ? restaurant.primaryPhoto?.url : restaurant.primaryPhoto;

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]}`;

  const cuisinesList: string[] = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : typeof restaurant.cuisine === 'string'
    ? [restaurant.cuisine]
    : ['Multi-Cuisine'];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      <div>
        {/* Photo */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <TravelImage
            src={rawPhoto}
            alt={restaurant.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
            <Utensils className="w-3 h-3 text-[#FF6A00]" />
            <span>Restaurant</span>
          </div>

          {restaurant.rating && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-700 text-xs font-bold flex items-center gap-1 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating.toFixed(1)}</span>
              {restaurant.ratingCount && (
                <span className="text-gray-400 font-normal">({restaurant.ratingCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-2.5">
          <h4 className="text-lg font-bold text-[#171717] leading-snug">
            {restaurant.name}
          </h4>

          {/* Cuisine tags */}
          <div className="flex flex-wrap gap-1.5">
            {cuisinesList.slice(0, 3).map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-[#FFF1E6] text-[#FF6A00] text-[11px] font-medium">
                {c}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>

          <div className="space-y-1.5 pt-2 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>

            {restaurant.distanceKm !== undefined && (
              <div className="flex items-center gap-2 text-[#FF6A00] font-semibold">
                <Navigation className="w-4 h-4 shrink-0" />
                <span>{formatDistance(restaurant.distanceKm)}</span>
              </div>
            )}

            {restaurant.openingHours && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-medium inline-block">
                Hours: {restaurant.openingHours}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
        <a
          href={googleDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-gray-700 hover:text-[#FF6A00] transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-[#FF6A00]" />
          Directions
        </a>

        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            className="inline-flex items-center gap-1 font-semibold text-gray-700 hover:text-[#FF6A00] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
        )}

        {restaurant.website ? (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#FF6A00] hover:underline"
          >
            Website
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="inline-flex items-center gap-1 font-semibold text-[#FF6A00] hover:underline"
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
}
