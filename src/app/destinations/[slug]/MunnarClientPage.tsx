'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import Breadcrumb from '@/components/Breadcrumb';
import PlaceCard from '@/components/PlaceCard';
import RestaurantCard from '@/components/RestaurantCard';
import HotelCard from '@/components/HotelCard';
import MapComponent from '@/components/MapComponent';
import BookingModal from '@/components/BookingModal';
import AddToItineraryModal from '@/components/AddToItineraryModal';
import ReviewModal from '@/components/ReviewModal';
import DestinationCard from '@/components/DestinationCard';
import { MapPin, Navigation, Calendar, Heart, Share2, Star, CheckCircle, Info, Compass } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

interface MunnarClientPageProps {
  destination: any;
  places: any[];
  restaurants: any[];
  hotels: any[];
  reviews: any[];
}

export default function MunnarClientPage({
  destination,
  places,
  restaurants,
  hotels,
  reviews,
}: MunnarClientPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'places' | 'restaurants' | 'hotels' | 'map' | 'reviews'>('overview');
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<any>(null);
  const [placeToItinerary, setPlaceToItinerary] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [nearbyDestinations, setNearbyDestinations] = useState<any[]>([]);

  const destLat = destination.location?.coordinates?.[1] || 10.0889;
  const destLng = destination.location?.coordinates?.[0] || 77.0595;

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const res = await fetch(`/api/destinations/nearby?currentSlug=${destination.slug}&lat=${destLat}&lng=${destLng}&limit=4`);
        if (res.ok) {
          const json = await res.json();
          setNearbyDestinations(json.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch nearby destinations:', err);
      }
    };
    fetchNearby();
  }, [destination.slug, destLat, destLng]);

  // Map points format
  const mapPoints = [
    ...places.map((p) => ({
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
    ...restaurants.map((r) => ({
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
    ...hotels.map((h) => ({
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Destinations', href: '/destinations' },
          { label: destination.name },
        ]}
      />

      {/* Hero Header */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-900 border border-gray-200 shadow-xl min-h-[380px] sm:min-h-[460px] flex items-end">
        <TravelImage
          src={destination.heroImage}
          alt={destination.name}
          fill
          priority
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 text-white max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>{destination.district} District, {destination.state}, {destination.country}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">{destination.name}</h1>
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-3 leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className="px-4 py-2.5 bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#FF6A00]" />
              View Map
            </button>
            <button
              onClick={() => setPlaceToItinerary({ name: destination.name, category: 'Destination Trip' })}
              className="px-4 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Add to Itinerary
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-800 hover:text-red-500 transition-colors shadow-md"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 flex items-center gap-2 sm:gap-6 overflow-x-auto pb-1 text-sm font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'places', label: `Places (${places.length})` },
          { id: 'restaurants', label: `Restaurants (${restaurants.length})` },
          { id: 'hotels', label: `Hotels & Resorts (${hotels.length})` },
          { id: 'map', label: 'Interactive Map' },
          { id: 'reviews', label: `Reviews (${reviews.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm ${
              activeTab === tab.id
                ? 'border-[#FF6A00] text-[#FF6A00] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Verified Attractions</span>
              <p className="text-2xl font-extrabold text-[#171717]">{places.length}+ Places</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Verified Dining</span>
              <p className="text-2xl font-extrabold text-[#171717]">{restaurants.length}+ Restaurants</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Resorts & Hotels</span>
              <p className="text-2xl font-extrabold text-[#171717]">{hotels.length}+ Stays</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Elevation</span>
              <p className="text-2xl font-extrabold text-[#FF6A00]">1,600 m ASL</p>
            </div>
          </div>

          {/* Places Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#171717]">Top Places to Visit in {destination.name}</h3>
                <p className="text-xs text-gray-500">Verified locations, photos & calculated distances</p>
              </div>
              <button
                onClick={() => setActiveTab('places')}
                className="text-xs font-bold text-[#FF6A00] hover:underline"
              >
                See All ({places.length}) →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {places.slice(0, 8).map((place) => (
                <PlaceCard key={place._id || place.slug} place={place} />
              ))}
            </div>
          </section>

          {/* Restaurants Section */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#171717]">Restaurants in {destination.name}</h3>
                <p className="text-xs text-gray-500">Authentic regional thalis & local dining</p>
              </div>
              <button
                onClick={() => setActiveTab('restaurants')}
                className="text-xs font-bold text-[#FF6A00] hover:underline"
              >
                See All ({restaurants.length}) →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((rest) => (
                <RestaurantCard key={rest._id || rest.slug} restaurant={rest} />
              ))}
            </div>
          </section>

          {/* Hotels & Resorts Section */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#171717]">Hotels & Resorts in {destination.name}</h3>
                <p className="text-xs text-gray-500">Verified hotels & heritage stays</p>
              </div>
              <button
                onClick={() => setActiveTab('hotels')}
                className="text-xs font-bold text-[#FF6A00] hover:underline"
              >
                See All ({hotels.length}) →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.slice(0, 6).map((hotel) => (
                <HotelCard
                  key={hotel._id || hotel.slug}
                  hotel={hotel}
                  onOpenBooking={(h) => setSelectedHotelForBooking(h)}
                />
              ))}
            </div>
          </section>

          {/* Map Preview */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-[#171717]">{destination.name} Interactive Map</h3>
            <MapComponent points={mapPoints} height="420px" centerLat={destination.location?.coordinates?.[1]} centerLng={destination.location?.coordinates?.[0]} zoom={11} />
          </section>

          {/* Nearby Destinations Section */}
          {nearbyDestinations.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#171717] flex items-center gap-2">
                    <Compass className="w-6 h-6 text-[#FF6A00]" />
                    Nearby Destinations
                  </h3>
                  <p className="text-xs text-gray-500">Geographically calculated nearby travel spots in India</p>
                </div>
                <Link href="/destinations" className="text-xs font-bold text-[#FF6A00] hover:underline">
                  View All Destinations →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyDestinations.map((nearDest: any) => (
                  <div key={nearDest._id || nearDest.slug} className="space-y-1">
                    <DestinationCard destination={nearDest} />
                    {typeof nearDest.distanceKm === 'number' && (
                      <span className="block text-[11px] font-bold text-gray-600 px-2 pt-1">
                        📍 {formatDistance(nearDest.distanceKm)} from {destination.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB CONTENT: Places */}
      {activeTab === 'places' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#171717]">Attractions & Sights in {destination.name} ({places.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {places.map((place) => (
              <PlaceCard key={place._id || place.slug} place={place} />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Restaurants */}
      {activeTab === 'restaurants' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#171717]">Verified Local Restaurants in {destination.name} ({restaurants.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <RestaurantCard key={rest._id || rest.slug} restaurant={rest} />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Hotels */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#171717]">Hotels, Resorts & Villas in {destination.name} ({hotels.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel._id || hotel.slug}
                hotel={hotel}
                onOpenBooking={(h) => setSelectedHotelForBooking(h)}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Map */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-[#171717]">Interactive Map of {destination.name}</h3>
          <MapComponent points={mapPoints} height="600px" centerLat={destination.location?.coordinates?.[1]} centerLng={destination.location?.coordinates?.[0]} zoom={12} />
        </div>
      )}

      {/* TAB CONTENT: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#171717]">Travel Genie Community Reviews</h3>
              <p className="text-xs text-gray-500">Authentic reviews from registered travellers</p>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-full hover:bg-[#e05d00]"
            >
              Write a Review
            </button>
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev: any, idx: number) => (
                <div key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FFF1E6] text-[#FF6A00] font-bold text-xs flex items-center justify-center">
                        {rev.userName ? rev.userName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-gray-900">{rev.userName}</h5>
                        <span className="text-[11px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{rev.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <p className="text-sm font-bold text-gray-700">No community reviews yet for {destination.name}.</p>
                <p className="text-xs text-gray-500">Be the first to share your authentic travel experience!</p>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-full"
                >
                  Write First Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <BookingModal
        property={selectedHotelForBooking}
        isOpen={!!selectedHotelForBooking}
        onClose={() => setSelectedHotelForBooking(null)}
      />

      <AddToItineraryModal
        place={placeToItinerary}
        isOpen={!!placeToItinerary}
        onClose={() => setPlaceToItinerary(null)}
      />

      <ReviewModal
        targetId={destination._id || destination.slug}
        targetType="place"
        targetName={destination.name}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

    </div>
  );
}
