import React from 'react';
import { getPlaces, getRestaurants, getHotels } from '@/lib/dataStore';
import MapComponent from '@/components/MapComponent';
import Breadcrumb from '@/components/Breadcrumb';
import { MapPin } from 'lucide-react';

export const metadata = {
  title: 'Interactive Travel Map | Travel Genie',
  description: 'Explore verified attractions, hotels, and restaurants on an interactive Leaflet OpenStreetMap.',
};

export default async function MapPage() {
  const places = await getPlaces();
  const restaurants = await getRestaurants();
  const hotels = await getHotels();

  const mapPoints = [
    ...places.map((p: any) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      itemType: 'Attraction' as const,
      latitude: p.location.coordinates[1],
      longitude: p.location.coordinates[0],
      primaryPhoto: p.primaryPhoto,
      rating: p.rating,
    })),
    ...restaurants.map((r: any) => ({
      _id: r._id,
      name: r.name,
      slug: r.slug,
      category: r.cuisine?.[0] || 'Restaurant',
      itemType: 'Restaurant' as const,
      latitude: r.location.coordinates[1],
      longitude: r.location.coordinates[0],
      primaryPhoto: r.primaryPhoto,
      rating: r.rating,
    })),
    ...hotels.map((h: any) => ({
      _id: h._id,
      name: h.name,
      slug: h.slug,
      category: h.type || 'Resort',
      itemType: 'Hotel/Resort' as const,
      latitude: h.location.coordinates[1],
      longitude: h.location.coordinates[0],
      primaryPhoto: h.primaryPhoto,
      rating: h.rating,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumb items={[{ label: 'Interactive Map' }]} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#FF6A00] font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Geospatial Map</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717]">Interactive Travel Map</h1>
          <p className="text-xs text-gray-500">
            Click markers to view place details, filter by category or calculate distance from your current location.
          </p>
        </div>
      </div>

      <MapComponent points={mapPoints} height="650px" centerLat={22.5937} centerLng={78.9629} zoom={5} />
    </div>
  );
}
