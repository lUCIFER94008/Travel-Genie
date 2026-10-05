'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Compass,
  Heart,
  Star,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Shield,
  Building2,
} from 'lucide-react';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
    { label: 'My Itineraries', href: '/dashboard/itineraries', icon: Compass },
    { label: 'Favorites', href: '/dashboard/favorites', icon: Heart },
    { label: 'My Reviews', href: '/dashboard/reviews', icon: Star },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-semibold text-gray-500">
        Loading Travel Genie Dashboard...
      </div>
    );
  }

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Traveller';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-orange-400 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            TG
          </div>
          <div>
            <span className="font-extrabold text-[#171717] text-sm block">TRAVEL GENIE</span>
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider block">User Dashboard</span>
          </div>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {mobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar / Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-200">
              TG
            </div>
            <div>
              <h2 className="font-black text-[#171717] tracking-tight text-base">TRAVEL GENIE</h2>
              <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6A00] text-[10px] font-extrabold uppercase tracking-wider">
                My Account
              </span>
            </div>
          </div>

          {/* User Info Badge */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
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
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
        <div className="p-4 border-t border-gray-100 space-y-1.5 bg-gray-50/50">
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-xs font-bold text-purple-800 bg-purple-50 p-2 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {currentUser?.role === 'resort_manager' && (
            <Link
              href="/resort-manager"
              className="flex items-center space-x-2 text-xs font-bold text-blue-800 bg-blue-50 p-2 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Manager Dashboard</span>
            </Link>
          )}

          <a
            href="mailto:support@travelgenie.com"
            className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-[#FF6A00] p-2 rounded-xl hover:bg-white transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>Help & Support</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-xs font-bold text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Greeting Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">Dashboard Overview</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] mt-0.5">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Plan your next journey and manage your trip bookings, itineraries, and favorites.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/destinations"
              className="px-4 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors"
            >
              Explore Destinations
            </Link>
          </div>
        </div>

        {/* Children View Content */}
        {children}
      </main>
    </div>
  );
}
