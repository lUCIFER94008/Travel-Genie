import React from 'react';
import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/lib/dataStore';
import Breadcrumb from '@/components/Breadcrumb';
import RouteMapComponent from '@/components/RouteMapComponent';
import { MapPin, Phone, Globe, Star, Utensils, ExternalLink, Navigation } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: 'Restaurant Not Found | Travel Genie' };
  }

  return {
    title: `${restaurant.name} | Verified Dining | Travel Genie`,
    description: restaurant.description,
  };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const cuisinesList: string[] = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : typeof restaurant.cuisine === 'string'
    ? [restaurant.cuisine]
    : ['Multi-Cuisine'];

  const photoUrl =
    restaurant.image ||
    (typeof restaurant.primaryPhoto === 'object' ? restaurant.primaryPhoto?.url : restaurant.primaryPhoto) ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  const hasCoords = restaurant.location?.coordinates && restaurant.location.coordinates.length >= 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Restaurants', href: '/restaurants' },
          { label: restaurant.name },
        ]}
      />

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" />
                Restaurant
              </span>
              {restaurant.rating && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {restaurant.rating.toFixed(1)} ({restaurant.reviewCount || restaurant.ratingCount || 120} reviews)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">{restaurant.name}</h1>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {restaurant.address}
            </p>
          </div>

          {/* Cuisine Pills */}
          <div className="flex flex-wrap gap-1.5">
            {cuisinesList.map((c: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-[#FFF1E6] text-[#FF6A00] text-xs font-bold rounded-lg">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Photo Banner */}
        <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <img src={photoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        </div>

        {/* Description & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-[#171717]">About {restaurant.name}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{restaurant.description}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3 text-xs">
            <h4 className="text-sm font-bold text-[#171717]">Dining Information</h4>
            {restaurant.openingHours && (
              <div>
                <span className="text-gray-500 font-medium block">Opening Status</span>
                <span className="font-bold text-gray-900">{restaurant.openingHours}</span>
              </div>
            )}
            {restaurant.phone && (
              <div>
                <span className="text-gray-500 font-medium block">Phone</span>
                <a href={`tel:${restaurant.phone}`} className="font-bold text-[#FF6A00]">
                  {restaurant.phone}
                </a>
              </div>
            )}
            {restaurant.website && (
              <div>
                <span className="text-gray-500 font-medium block">Website</span>
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#FF6A00] underline inline-flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Driving Route */}
        {hasCoords && (
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <h3 className="text-xl font-bold text-[#171717]">Driving Route</h3>
            <RouteMapComponent
              destLat={restaurant.location.coordinates[1]}
              destLng={restaurant.location.coordinates[0]}
              destName={restaurant.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
