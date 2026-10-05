'use client';

import React, { useEffect, useState } from 'react';
import { fetchOSRMRoute, RouteResult } from '@/lib/osrm';
import { Navigation, Clock, MapPin } from 'lucide-react';

interface RouteMapComponentProps {
  destLat: number;
  destLng: number;
  destName: string;
  height?: string;
}

export default function RouteMapComponent({
  destLat,
  destLng,
  destName,
  height = '450px',
}: RouteMapComponentProps) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [LeafletModules, setLeafletModules] = useState<any>(null);

  useEffect(() => {
    Promise.all([import('leaflet'), import('react-leaflet')]).then(([L, ReactLeaflet]) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeafletModules({ L, ...ReactLeaflet });
    });
  }, []);

  const getDirections = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserPos({ lat: uLat, lng: uLng });

        const result = await fetchOSRMRoute(uLat, uLng, destLat, destLng);
        setRoute(result);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError('Location permission denied or unavailable. Please enable browser location.');
      }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Route Info Bar */}
      <div className="bg-[#FFF1E6] p-4 rounded-xl border border-orange-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#FF6A00]" />
          <div>
            <h5 className="text-sm font-bold text-gray-900">Driving Directions to {destName}</h5>
            <p className="text-xs text-gray-600">
              {route ? `Distance: ${route.distanceKm} km • Est. Time: ${route.durationMinutes} mins` : 'Click below to calculate exact OSRM route from your location.'}
            </p>
          </div>
        </div>

        <button
          onClick={getDirections}
          disabled={loading}
          className="px-4 py-2 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <span>Fetching Route...</span>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Map display */}
      {LeafletModules && (
        <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <LeafletModules.MapContainer
            center={[destLat, destLng]}
            zoom={userPos ? 11 : 13}
            className="w-full h-full"
          >
            <LeafletModules.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Destination Marker */}
            <LeafletModules.Marker position={[destLat, destLng]}>
              <LeafletModules.Popup>
                <div className="font-bold text-xs">{destName}</div>
              </LeafletModules.Popup>
            </LeafletModules.Marker>

            {/* User Position Marker */}
            {userPos && (
              <LeafletModules.Marker position={[userPos.lat, userPos.lng]}>
                <LeafletModules.Popup>
                  <div className="font-bold text-xs text-[#FF6A00]">Your Current Location</div>
                </LeafletModules.Popup>
              </LeafletModules.Marker>
            )}

            {/* Polyline Route */}
            {route && route.coordinates && route.coordinates.length > 0 && (
              <LeafletModules.Polyline
                positions={route.coordinates}
                pathOptions={{ color: '#FF6A00', weight: 5, opacity: 0.8 }}
              />
            )}
          </LeafletModules.MapContainer>
        </div>
      )}
    </div>
  );
}
