'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Compass, Building2, Utensils, Landmark, X, Loader2 } from 'lucide-react';
import TravelImage from './TravelImage';

interface GlobalSearchInputProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onSelect?: () => void;
}

export default function GlobalSearchInput({
  placeholder = 'Search destinations, places, hotels, restaurants across India...',
  className = '',
  inputClassName = '',
  autoFocus = false,
  onSelect,
}: GlobalSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    destinations: any[];
    places: any[];
    restaurants: any[];
    hotels: any[];
    resorts: any[];
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
          .then((res) => res.json())
          .then((data) => {
            setResults(data);
            setIsOpen(true);
          })
          .catch((err) => console.error('Search fetch error:', err))
          .finally(() => setLoading(false));
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/destinations?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      if (onSelect) onSelect();
    }
  };

  const handleResultClick = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
    if (onSelect) onSelect();
  };

  const totalResults =
    (results?.destinations.length || 0) +
    (results?.places.length || 0) +
    (results?.restaurants.length || 0) +
    (results?.hotels.length || 0) +
    (results?.resorts.length || 0);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleFormSubmit} className="relative w-full flex items-center">
        <div className="absolute left-4 text-[#FF6A00] pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent shadow-md transition-all ${inputClassName}`}
        />
        {loading ? (
          <div className="absolute right-4 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </form>

      {/* Live Results Dropdown Modal */}
      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[75vh] overflow-y-auto z-50 p-3 space-y-4">
          {totalResults === 0 ? (
            <div className="py-8 text-center text-gray-500 space-y-1">
              <p className="text-base font-semibold">No destinations or places found</p>
              <p className="text-xs">Try searching for &quot;Munnar&quot;, &quot;Agra&quot;, &quot;Jaipur&quot;, &quot;Taj Mahal&quot;, or &quot;Goa&quot;</p>
            </div>
          ) : (
            <>
              {/* Destinations Section */}
              {results.destinations.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 border-b border-gray-100 pb-1.5 mb-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#FF6A00]" />
                    DESTINATIONS
                  </div>
                  <div className="space-y-1">
                    {results.destinations.map((dest) => (
                      <button
                        key={dest._id || dest.slug}
                        onClick={() => handleResultClick(`/destinations/${dest.slug}`)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF1E6] transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
                          <TravelImage
                            src={dest.heroImage}
                            alt={dest.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#FF6A00] truncate">
                            {dest.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {dest.state}, India
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Places Section */}
              {results.places.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 border-b border-gray-100 pb-1.5 mb-1.5">
                    <Landmark className="w-3.5 h-3.5 text-[#FF6A00]" />
                    PLACES & ATTRACTIONS
                  </div>
                  <div className="space-y-1">
                    {results.places.map((place) => (
                      <button
                        key={place._id || place.slug}
                        onClick={() => handleResultClick(`/places/${place.slug}`)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF1E6] transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
                          <TravelImage
                            src={place.primaryPhoto?.url || place.primaryPhoto}
                            alt={place.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#FF6A00] truncate">
                            {place.name}
                          </div>
                          <div className="text-xs text-gray-500 capitalize truncate">
                            {place.category} • {place.address}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels & Resorts Section */}
              {(results.hotels.length > 0 || results.resorts.length > 0) && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 border-b border-gray-100 pb-1.5 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF6A00]" />
                    HOTELS & RESORTS
                  </div>
                  <div className="space-y-1">
                    {[...results.hotels, ...results.resorts].slice(0, 5).map((hotel) => (
                      <button
                        key={hotel._id || hotel.slug}
                        onClick={() => handleResultClick(`/hotels/${hotel.slug}`)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF1E6] transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
                          <TravelImage
                            src={hotel.primaryPhoto?.url || hotel.primaryPhoto}
                            alt={hotel.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#FF6A00] truncate">
                            {hotel.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {hotel.address}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurants Section */}
              {results.restaurants.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 border-b border-gray-100 pb-1.5 mb-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#FF6A00]" />
                    RESTAURANTS & DINING
                  </div>
                  <div className="space-y-1">
                    {results.restaurants.map((rest) => (
                      <button
                        key={rest._id || rest.slug}
                        onClick={() => handleResultClick(`/restaurants/${rest.slug}`)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF1E6] transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
                          <TravelImage
                            src={rest.primaryPhoto?.url || rest.primaryPhoto}
                            alt={rest.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#FF6A00] truncate">
                            {rest.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {rest.cuisine} • {rest.address}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
