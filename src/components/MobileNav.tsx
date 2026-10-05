'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, MapPin, Calendar, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, [pathname]);

  const itineraryHref = isLoggedIn
    ? '/dashboard/itineraries'
    : '/login?callbackUrl=' + encodeURIComponent('/dashboard/itineraries');

  const profileHref = isLoggedIn
    ? '/dashboard/profile'
    : '/login?callbackUrl=' + encodeURIComponent('/dashboard/profile');

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      name: 'Explore',
      href: '/destinations',
      icon: Compass,
      isActive: pathname === '/destinations' || (pathname !== '/' && pathname.startsWith('/destinations')),
    },
    {
      name: 'Map',
      href: '/map',
      icon: MapPin,
      isActive: pathname === '/map' || pathname.startsWith('/map'),
    },
    {
      name: 'Itinerary',
      href: itineraryHref,
      icon: Calendar,
      isActive:
        pathname === '/itinerary' ||
        pathname.startsWith('/itinerary') ||
        pathname === '/dashboard/itineraries' ||
        pathname.startsWith('/dashboard/itineraries'),
    },
    {
      name: 'Profile',
      href: profileHref,
      icon: User,
      isActive: pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/profile'),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg px-2 py-1.5">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                item.isActive ? 'text-[#FF6A00] font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5] text-[#FF6A00]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
