import React from 'react';

export function DestinationCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded-md w-2/3" />
        <div className="h-4 bg-gray-200 rounded-md w-full" />
        <div className="h-4 bg-gray-200 rounded-md w-4/5" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-gray-200 rounded-md w-16" />
          <div className="h-5 bg-gray-200 rounded-md w-16" />
        </div>
      </div>
    </div>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between">
      <div>
        <div className="aspect-[16/10] bg-gray-200 w-full" />
        <div className="p-4 space-y-2.5">
          <div className="h-5 bg-gray-200 rounded-md w-3/4" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2" />
          <div className="h-3 bg-gray-200 rounded-md w-full" />
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-between">
        <div className="h-3 bg-gray-200 rounded-md w-20" />
        <div className="h-3 bg-gray-200 rounded-md w-16" />
      </div>
    </div>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-gray-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded-md w-3/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/2" />
        <div className="h-4 bg-gray-200 rounded-md w-full" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-gray-200 rounded-md w-12" />
          <div className="h-5 bg-gray-200 rounded-md w-16" />
          <div className="h-5 bg-gray-200 rounded-md w-14" />
        </div>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse border border-gray-200">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 border-t-[#FF6A00] rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading Interactive Map...</span>
      </div>
    </div>
  );
}
