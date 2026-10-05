'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import Breadcrumb from '@/components/Breadcrumb';
import RouteMapComponent from '@/components/RouteMapComponent';
import AddToItineraryModal from '@/components/AddToItineraryModal';
import ReviewModal from '@/components/ReviewModal';
import RestaurantCard from '@/components/RestaurantCard';
import DestinationCard from '@/components/DestinationCard';
import { formatDistance } from '@/lib/geo';
import { MapPin, Navigation, Calendar, Heart, Star, ExternalLink, ShieldCheck, Clock, Phone, Globe, CheckCircle2, Utensils, Compass } from 'lucide-react';

interface PlaceClientPageProps {
  place: any;
  destination?: any;
}

export default function PlaceClientPage({ place, destination }: PlaceClientPageProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showDirections, setShowDirections] = useState(false);
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [nearbyRestaurants, setNearbyRestaurants] = useState<any[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const [nearbyDestinations, setNearbyDestinations] = useState<any[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  const lat = place.location?.coordinates?.[1] || 10.0889;
  const lng = place.location?.coordinates?.[0] || 77.0595;

  useEffect(() => {
    // Fetch place-specific nearby restaurants
    const fetchNearbyRestaurants = async () => {
      setLoadingRestaurants(true);
      try {
        const res = await fetch(`/api/restaurants/nearby?placeId=${place._id || place.slug}&lat=${lat}&lng=${lng}&radius=5000`);
        if (res.ok) {
          const json = await res.json();
          setNearbyRestaurants(json.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch nearby restaurants for place:', err);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    // Fetch geographically nearby destinations
    const fetchNearbyDestinations = async () => {
      setLoadingDestinations(true);
      try {
        const destSlug = destination?.slug || '';
        const res = await fetch(`/api/destinations/nearby?currentSlug=${destSlug}&lat=${lat}&lng=${lng}&limit=3`);
        if (res.ok) {
          const json = await res.json();
          setNearbyDestinations(json.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch nearby destinations:', err);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchNearbyRestaurants();
    fetchNearbyDestinations();
  }, [place._id, place.slug, lat, lng, destination?.slug]);

  const primaryPhotoUrl = typeof place.primaryPhoto === 'string'
    ? place.primaryPhoto
    : place.primaryPhoto?.url;

  const photos = place.photos && place.photos.length > 0
    ? place.photos
    : [{ url: primaryPhotoUrl, caption: place.name, source: place.source || 'Pixabay' }];

  const activePhoto = photos[selectedPhotoIndex] || photos[0];

  const destName = destination?.name || 'Destination';
  const destHref = destination?.slug ? `/destinations/${destination.slug}` : '/destinations';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Dynamic Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Destinations', href: '/destinations' },
          { label: destName, href: destHref },
          { label: place.name },
        ]}
      />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FFF1E6] text-[#FF6A00] text-xs font-bold uppercase tracking-wider">
              {place.category}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {destName}, {destination?.state || 'India'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171717]">{place.name}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1 text-gray-700">
              <MapPin className="w-4 h-4 text-[#FF6A00]" />
              <span>{place.address}</span>
            </div>

            {place.rating && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Rating: {typeof place.rating === 'number' ? place.rating.toFixed(1) : place.rating} ★</span>
                {place.ratingCount && <span className="text-gray-400 font-normal">({place.ratingCount} reviews)</span>}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-full hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Navigation className="w-4 h-4 text-[#FF6A00]" />
            {showDirections ? 'Hide Directions' : 'Get Directions'}
          </button>

          <button
            onClick={() => setItineraryModalOpen(true)}
            className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Add to Itinerary
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* OSRM Route Directions */}
      {showDirections && (
        <RouteMapComponent
          destLat={lat}
          destLng={lng}
          destName={place.name}
        />
      )}

      {/* Photo Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
          <TravelImage
            src={activePhoto.url || primaryPhotoUrl}
            alt={activePhoto.caption || place.name}
            fill
            priority
            className="object-cover"
          />

          {/* Photo Attribution Badge */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-medium max-w-md">
            <span>{activePhoto.caption || place.name}</span>
            <span className="block text-[10px] text-gray-300">
              Source: {activePhoto.source || place.source || 'Pixabay Verified Photo'}
            </span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {photos.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {photos.map((photo: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedPhotoIndex === idx ? 'border-[#FF6A00] scale-105 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-[#171717]">About {place.name}</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {place.description}
            </p>
          </div>

          {/* Activities */}
          {place.activities && place.activities.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-base font-bold text-[#171717]">Popular Activities</h4>
              <div className="flex flex-wrap gap-2">
                {place.activities.map((act: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF6A00] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {act}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {place.facilities && place.facilities.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-base font-bold text-[#171717]">Available Visitor Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {place.facilities.map((fac: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium"
                  >
                    • {fac}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specific Place -> Nearby Restaurants Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#FF6A00]" />
                  Restaurants Near {place.name}
                </h4>
                <p className="text-xs text-gray-500">Real dining spots sorted by distance from this place</p>
              </div>
            </div>

            {loadingRestaurants ? (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
                Loading restaurants near {place.name}...
              </div>
            ) : nearbyRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nearbyRestaurants.map((rest: any, idx: number) => (
                  <div key={rest._id || idx} className="space-y-1">
                    <RestaurantCard restaurant={rest} />
                    {typeof rest.distanceKm === 'number' && (
                      <span className="block text-[11px] font-bold text-[#FF6A00] px-3">
                        📍 {formatDistance(rest.distanceKm)} from {place.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 p-4 bg-gray-50 rounded-xl">
                No verified restaurants found within 5 km of {place.name}.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
            <h4 className="text-base font-bold text-[#171717]">Visitor Information</h4>

            {place.openingHours && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Opening Hours
                </span>
                <p className="text-xs font-bold text-gray-800">{place.openingHours}</p>
              </div>
            )}

            {place.phone && (
              <div className="space-y-1 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Contact Phone
                </span>
                <a href={`tel:${place.phone}`} className="text-xs font-bold text-gray-800 hover:text-[#FF6A00]">
                  {place.phone}
                </a>
              </div>
            )}

            {place.website && (
              <div className="space-y-1 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Official Website
                </span>
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
                >
                  Visit Official Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Verification Badge */}
            <div className="pt-3 border-t border-gray-200 flex flex-col gap-1 text-[11px] text-gray-500">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Attraction Data</span>
              </div>
              <p>
                <span className="font-semibold text-gray-800">Photo Source:</span>{' '}
                {activePhoto?.source || place.source || 'Pixabay'}
              </p>
            </div>
          </div>

          {/* Nearby Destinations Widget */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#FF6A00]" />
              Nearby Destinations
            </h4>

            {loadingDestinations ? (
              <div className="text-xs text-gray-400 p-2">Loading nearby destinations...</div>
            ) : nearbyDestinations.length > 0 ? (
              <div className="space-y-3">
                {nearbyDestinations.map((dest: any) => (
                  <DestinationCard key={dest._id || dest.slug} destination={dest} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Modals */}
      <AddToItineraryModal
        place={place}
        isOpen={itineraryModalOpen}
        onClose={() => setItineraryModalOpen(false)}
      />

      <ReviewModal
        targetId={place._id || place.slug}
        targetType="place"
        targetName={place.name}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

    </div>
  );
}
