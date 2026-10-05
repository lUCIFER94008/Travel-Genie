import React from 'react';
import { getRestaurants } from '@/lib/dataStore';
import RestaurantCard from '@/components/RestaurantCard';
import Breadcrumb from '@/components/Breadcrumb';
import { Utensils, Search } from 'lucide-react';

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const restaurants = await getRestaurants(undefined, search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Restaurants' }]} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-xs uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Dining Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">
            Verified Restaurants
          </h1>
          <p className="text-sm text-gray-600">
            Discover real local restaurants, traditional Kerala meals, and multi-cuisine dining spots near Munnar.
          </p>
        </div>

        <form method="GET" action="/restaurants" className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search cuisine or restaurant..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
        </form>
      </div>

      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest: any) => (
            <RestaurantCard key={rest._id || rest.slug} restaurant={rest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">No restaurants found</h3>
          <p className="text-xs text-gray-500 mt-1">Try another search keyword.</p>
        </div>
      )}
    </div>
  );
}
