'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateDistance, formatDistance } from '@/lib/geo';
import { Navigation, MapPin, Filter, Star, Info } from 'lucide-react';

interface MapPoint {
  _id?: string;
  name: string;
  slug: string;
  category?: string;
  type?: string;
  itemType: 'Attraction' | 'Restaurant' | 'Hotel/Resort';
  latitude: number;
  longitude: number;
  primaryPhoto: string;
  rating?: number;
  address?: string;
}

interface MapComponentProps {
  points: MapPoint[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
}

export default function MapComponent({
  points,
  centerLat = 10.0889, // Default Munnar Lat
  centerLng = 77.0595, // Default Munnar Lng
  zoom = 12,
  height = '500px',
}: MapComponentProps) {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [isClient, setIsClient] = useState(false);
  const [LeafletModules, setLeafletModules] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet only in browser
    Promise.all([import('leaflet'), import('react-leaflet')]).then(([L, ReactLeaflet]) => {
      // Fix default marker icon paths in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeafletModules({ L, ...ReactLeaflet });
    });
  }, []);

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          alert('Location permission denied or unavailable. Using default destination map center.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (!isClient || !LeafletModules) {
    return (
      <div
        style={{ height }}
        className="w-full bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#FF6A00] rounded-full animate-spin" />
          <span className="text-xs font-semibold">Initializing OpenStreetMap...</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, useMap } = LeafletModules;
  const L = LeafletModules.L;

  // Custom Colored Marker Icons
  const attractionIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: #FF6A00; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); flex: flex; items-center; justify-center; text-align: center; line-height: 22px; color: white; font-weight: bold; font-size: 12px;">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const restaurantIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: #D97706; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); text-align: center; line-height: 22px; color: white; font-size: 12px;">🍴</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const hotelIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: #059669; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); text-align: center; line-height: 22px; color: white; font-size: 12px;">🏨</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const userIcon = L.divIcon({
    className: 'user-pin',
    html: `<div style="background-color: #2563EB; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 4px rgba(37,99,235,0.3); text-align: center; line-height: 24px; color: white; font-size: 14px;">🧍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Filter Points
  const filteredPoints = points.filter((pt) => {
    if (filterType !== 'All' && pt.itemType !== filterType) {
      return false;
    }
    if (userLoc) {
      const dist = calculateDistance(userLoc.lat, userLoc.lng, pt.latitude, pt.longitude);
      if (dist > radiusKm) return false;
    }
    return true;
  });

  const activeCenter = userLoc ? [userLoc.lat, userLoc.lng] : [centerLat, centerLng];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200 flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Use My Location
        </button>

        <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent font-medium text-gray-800 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Attraction">Attractions</option>
            <option value="Restaurant">Restaurants</option>
            <option value="Hotel/Resort">Hotels & Resorts</option>
          </select>
        </div>

        {userLoc && (
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            <span className="text-gray-500">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-transparent font-semibold text-[#FF6A00] focus:outline-none"
            >
              <option value={1}>1 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
            </select>
          </div>
        )}
      </div>

      <MapContainer
        center={activeCenter as [number, number]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLoc && (
          <>
            <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
              <Popup>
                <div className="text-xs font-bold text-gray-900">Your Location</div>
              </Popup>
            </Marker>
            <Circle
              center={[userLoc.lat, userLoc.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: '#FF6A00', fillColor: '#FF6A00', fillOpacity: 0.08 }}
            />
          </>
        )}

        {/* Point Markers */}
        {filteredPoints.map((pt, idx) => {
          let icon = attractionIcon;
          if (pt.itemType === 'Restaurant') icon = restaurantIcon;
          if (pt.itemType === 'Hotel/Resort') icon = hotelIcon;

          const dist = userLoc
            ? calculateDistance(userLoc.lat, userLoc.lng, pt.latitude, pt.longitude)
            : calculateDistance(centerLat, centerLng, pt.latitude, pt.longitude);

          const detailsPath =
            pt.itemType === 'Restaurant'
              ? `/restaurants/${pt.slug}`
              : pt.itemType === 'Hotel/Resort'
              ? `/hotels/${pt.slug}`
              : `/places/${pt.slug}`;

          return (
            <Marker key={pt._id || idx} position={[pt.latitude, pt.longitude]} icon={icon}>
              <Popup>
                <div className="w-52 flex flex-col gap-1.5 p-1">
                  <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-gray-100">
                    <img src={pt.primaryPhoto} alt={pt.name} className="w-full h-full object-cover" />
                  </div>
                  <h5 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">{pt.name}</h5>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-medium text-gray-700">{pt.category || pt.itemType}</span>
                    <span className="text-[#FF6A00] font-semibold">{formatDistance(dist)}</span>
                  </div>
                  {pt.rating && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{pt.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <Link
                    href={detailsPath}
                    className="mt-1 block text-center py-1 bg-[#FF6A00] text-white text-xs font-semibold rounded-md hover:bg-[#e05d00]"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
