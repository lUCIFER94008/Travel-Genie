import React from 'react';
import Link from 'next/link';
import TravelImage from '@/components/TravelImage';
import { Search, Compass, Calendar, Building2, Utensils, MapPin, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { getDestinations, getPlaces } from '@/lib/dataStore';
import DestinationCard from '@/components/DestinationCard';
import PlaceCard from '@/components/PlaceCard';
import GlobalSearchInput from '@/components/GlobalSearchInput';

export default async function HomePage() {
  const destinations = await getDestinations();
  const allPlaces = await getPlaces();

  // Select 8-12 icon iconic places across India
  const trendingPlaces = allPlaces.slice(0, 8);

  const quickActions = [
    {
      title: 'Explore Destinations',
      subtitle: 'Discover real places & cities across India',
      icon: Compass,
      href: '/destinations',
      bgColor: 'bg-orange-50',
      iconColor: 'text-[#FF6A00]',
    },
    {
      title: 'Plan Your Trip',
      subtitle: 'Custom day-by-day itineraries',
      icon: Calendar,
      href: '/itinerary',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Book Hotels & Resorts',
      subtitle: 'Verified resorts & heritage stays',
      icon: Building2,
      href: '/hotels',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Discover Food & Dining',
      subtitle: 'Authentic local dining spots',
      icon: Utensils,
      href: '/restaurants',
      bgColor: 'bg-[#FFF1E6]',
      iconColor: 'text-[#FF6A00]',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[520px] md:min-h-[600px] flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
        <TravelImage
          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1600"
          alt="Taj Mahal Agra India"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center space-y-6 pt-12">
          
          {/* Guarantee Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 shadow-md">
            <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
            <span>100% Verified Real Tourism Data & Images Across India</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Explore India <br className="hidden sm:inline" />
            Your Next <span className="text-[#FF6A00]">Adventure</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-200 font-medium max-w-2xl leading-relaxed">
            Discover 15+ verified destinations, 100+ iconic attractions, real hotels, restaurants, and interactive maps.
          </p>

          {/* Hero Live Global Search Bar */}
          <div className="w-full max-w-2xl">
            <GlobalSearchInput
              placeholder="Search Munnar, Agra, Jaipur, Goa, Taj Mahal, Delhi..."
              inputClassName="py-4 text-base shadow-2xl"
            />
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-gray-300">
            <span className="text-gray-400">Popular:</span>
            {['Munnar', 'Agra', 'Jaipur', 'Goa', 'Delhi', 'Mumbai', 'Hampi', 'Udaipur'].map((slug) => (
              <Link
                key={slug}
                href={`/destinations/${slug.toLowerCase()}`}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors"
              >
                {slug}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl ${action.bgColor} ${action.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#171717] group-hover:text-[#FF6A00] transition-colors mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">{action.subtitle}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-[#FF6A00] group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">India Tourism</span>
            <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">Popular Destinations across India</h2>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center text-sm font-semibold text-[#FF6A00] hover:text-[#e05d00]"
          >
            View All 15+ Destinations
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.slice(0, 8).map((dest: any) => (
            <DestinationCard key={dest._id || dest.slug} destination={dest} />
          ))}
        </div>
      </section>

      {/* Trending Places in India Section */}
      <section className="bg-[#F8F8F8] py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-[#FF6A00]" />
                Top Attractions
              </div>
              <h2 className="text-3xl font-extrabold text-[#171717]">Trending Places in India</h2>
              <p className="text-sm text-gray-600">
                Verified heritage sites, palaces, waterfalls, and national parks with real maps and ratings.
              </p>
            </div>
            <Link
              href="/map"
              className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-sm font-semibold rounded-full shadow-xs transition-colors shrink-0"
            >
              View on Interactive Map
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingPlaces.map((place: any) => (
              <PlaceCard key={place._id || place.slug} place={place} />
            ))}
          </div>
        </div>
      </section>

      {/* Real Data Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="px-3 py-1 rounded-full bg-[#FFF1E6] text-[#FF6A00] text-xs font-bold uppercase tracking-wider inline-block">
              100% Authentic Tourism Data
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">No Placeholder Data. No AI Images.</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Every attraction, hotel, restaurant, and map coordinate on Travel Genie is sourced from official state tourism departments and Wikimedia Commons.
            </p>
          </div>
          <Link
            href="/map"
            className="px-8 py-4 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-bold text-sm rounded-full shadow-lg transition-transform hover:scale-105 shrink-0"
          >
            Explore India Map
          </Link>
        </div>
      </section>

    </div>
  );
}
