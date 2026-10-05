'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Building2,
  Compass,
  MapPin,
  Hotel,
  Utensils,
  Map,
  Star,
  Camera,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Resorts', href: '/admin/resorts', icon: Building2 },
    { label: 'Destinations', href: '/destinations', icon: Compass },
    { label: 'Attractions', href: '/admin/attractions', icon: MapPin },
    { label: 'Hotels', href: '/hotels', icon: Hotel },
    { label: 'Restaurants', href: '/restaurants', icon: Utensils },
    { label: 'Itineraries', href: '/admin/itineraries', icon: Map },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Images', href: '/admin/images', icon: Camera },
    { label: 'Data Audit', href: '/admin/data-audit', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-orange-400 flex items-center justify-center text-white font-black text-sm">
            TG
          </div>
          <div>
            <span className="font-extrabold text-[#171717] tracking-tight text-sm">TRAVEL GENIE</span>
            <span className="text-[10px] font-bold text-[#FF6A00] block uppercase tracking-wider">Admin Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-200">
              TG
            </div>
            <div>
              <h2 className="font-extrabold text-[#171717] tracking-tight text-base">TRAVEL GENIE</h2>
              <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6A00] text-[10px] font-bold uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF6A00] text-white shadow-md shadow-orange-200'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-[#FF6A00]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-[#FF6A00] p-2 rounded-lg hover:bg-white transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#FF6A00]" />
            <span>Switch to User View</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-xs font-bold text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
