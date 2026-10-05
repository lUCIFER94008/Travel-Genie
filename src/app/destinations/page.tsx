import React from 'react';
import { getDestinations } from '@/lib/dataStore';
import DestinationCard from '@/components/DestinationCard';
import Breadcrumb from '@/components/Breadcrumb';
import { Search, Compass } from 'lucide-react';

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const destinations = await getDestinations(search);

  const categories = ['All', 'Mountains', 'Beaches', 'Heritage', 'Wildlife', 'Cities', 'Backwaters', 'Spiritual', 'Adventure'];
  const activeCategory = category || 'All';

  const filteredDestinations = destinations.filter((dest: any) => {
    if (activeCategory === 'All') return true;
    return dest.categories && dest.categories.some((c: string) => c.toLowerCase() === activeCategory.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Destinations' }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>India Tourism Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Explore India
          </h1>
          <p className="text-sm text-gray-600">
            Discover real places, experiences and destinations across India.
          </p>
        </div>

        {/* Search */}
        <form method="GET" action="/destinations" className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search destinations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <a
              key={cat}
              href={`/destinations?${cat !== 'All' ? `category=${cat}` : ''}${search ? `&search=${search}` : ''}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FF6A00] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </a>
          );
        })}
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((dest: any) => (
            <DestinationCard key={dest._id || dest.slug} destination={dest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">No destinations found</h3>
          <p className="text-xs text-gray-500 mt-1">Try clearing filters or search terms.</p>
          <a
            href="/destinations"
            className="mt-4 inline-block px-4 py-2 bg-[#FF6A00] text-white text-xs font-semibold rounded-full"
          >
            Clear Filters
          </a>
        </div>
      )}
    </div>
  );
}
