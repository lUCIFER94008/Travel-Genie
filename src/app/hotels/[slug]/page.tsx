import React from 'react';
import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/lib/dataStore';
import Breadcrumb from '@/components/Breadcrumb';
import RouteMapComponent from '@/components/RouteMapComponent';
import { MapPin, Phone, Globe, Star, Building2, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    return { title: 'Hotel Not Found | Travel Genie' };
  }

  return {
    title: `${hotel.name} | Munnar Resorts | Travel Genie`,
    description: hotel.description,
  };
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Hotels & Resorts', href: '/hotels' },
          { label: hotel.name },
        ]}
      />

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {hotel.type || 'Resort'}
              </span>
              {hotel.rating && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {hotel.rating.toFixed(1)} ({hotel.ratingCount} reviews)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">{hotel.name}</h1>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {hotel.address}
            </p>
          </div>
        </div>

        {/* Photo Banner */}
        <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <img src={hotel.primaryPhoto} alt={hotel.name} className="w-full h-full object-cover" />
        </div>

        {/* Description & Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#171717]">About {hotel.name}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-base font-bold text-[#171717]">Property Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hotel.amenities.map((am: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
            <h4 className="text-sm font-bold text-[#171717]">Property Contact & Verification</h4>
            
            {hotel.phone && (
              <div>
                <span className="text-gray-500 font-medium block">Phone</span>
                <a href={`tel:${hotel.phone}`} className="font-bold text-[#FF6A00]">
                  {hotel.phone}
                </a>
              </div>
            )}

            {hotel.website && (
              <div>
                <span className="text-gray-500 font-medium block">Official Website</span>
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#FF6A00] underline inline-flex items-center gap-1"
                >
                  Visit Property Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 flex flex-col gap-1 text-[11px] text-gray-500">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Property</span>
              </div>
              <p>{hotel.source || 'Property Direct Registry'}</p>
            </div>
          </div>
        </div>

        {/* Driving Route */}
        <div className="pt-6 border-t border-gray-100 space-y-3">
          <h3 className="text-xl font-bold text-[#171717]">Location & Route</h3>
          <RouteMapComponent
            destLat={hotel.location.coordinates[1]}
            destLng={hotel.location.coordinates[0]}
            destName={hotel.name}
          />
        </div>
      </div>
    </div>
  );
}
