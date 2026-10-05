import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFF1E6] flex items-center justify-center text-[#FF6A00]">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#171717]">
                TRAVEL<span className="text-[#FF6A00]">GENIE</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 font-medium">
              Discover. Plan. Experience real India.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-600">
            <Link href="/destinations" className="hover:text-[#FF6A00] transition-colors">
              Destinations
            </Link>
            <Link href="/map" className="hover:text-[#FF6A00] transition-colors">
              Explore
            </Link>
            <Link href="/itinerary" className="hover:text-[#FF6A00] transition-colors">
              Itinerary
            </Link>
            <Link href="/bookings" className="hover:text-[#FF6A00] transition-colors">
              Bookings
            </Link>
            <Link href="/destinations/munnar" className="hover:text-[#FF6A00] transition-colors">
              Munnar Guide
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Privacy</span>
            <span className="text-gray-400">Terms</span>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 text-center sm:text-left gap-2">
          <p>© {new Date().getFullYear()} Travel Genie. Verified authentic travel platform.</p>
          <p>Real photos • Verified locations • Accurate distances</p>
        </div>
      </div>
    </footer>
  );
}
