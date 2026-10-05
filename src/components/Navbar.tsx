'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Search,
  User,
  LogOut,
  Bookmark,
  Calendar,
  Menu,
  X,
  Map,
  Shield,
  Building2,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import GlobalSearchInput from './GlobalSearchInput';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setUserDropdownOpen(false);
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Explore Map', href: '/map' },
    { name: 'Itinerary', href: '/itinerary' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#FF6A00] group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#171717]">
                TRAVEL<span className="text-[#FF6A00]">GENIE</span>
              </span>
              <span className="text-[10px] tracking-wider text-gray-500 font-medium -mt-1 uppercase">
                Real Destinations
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#FFF1E6] text-[#FF6A00] font-semibold'
                      : 'text-gray-700 hover:text-[#FF6A00] hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center gap-1 min-w-[320px]">
                  <GlobalSearchInput
                    autoFocus
                    placeholder="Search India destinations, places..."
                    inputClassName="py-1.5 text-sm"
                    onSelect={() => setSearchOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search destinations"
                  className="p-2.5 text-gray-600 hover:text-[#FF6A00] hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[#FFF1E6] hover:text-[#FF6A00] transition-colors text-sm font-medium text-gray-800 border border-gray-200"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs space-y-1"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-extrabold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6A00] text-[10px] font-bold uppercase">
                        Role: {currentUser.role}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#FF6A00] font-bold"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#FF6A00]" />
                      <span>User Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#FF6A00]"
                    >
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      href="/dashboard/itineraries"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#FF6A00]"
                    >
                      <Map className="w-4 h-4 text-gray-400" />
                      <span>My Itineraries</span>
                    </Link>

                    <Link
                      href="/dashboard/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#FF6A00]"
                    >
                      <Bookmark className="w-4 h-4 text-gray-400" />
                      <span>Favorites</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-purple-800 bg-purple-50 font-extrabold hover:bg-purple-100"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {currentUser.role === 'resort_manager' && (
                      <Link
                        href="/resort-manager"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-800 bg-blue-50 font-extrabold hover:bg-blue-100"
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Manager Dashboard</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#FF6A00] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#FF6A00] hover:bg-[#e05d00] rounded-full shadow-xs hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#FF6A00]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-medium ${
                pathname === link.href
                  ? 'bg-[#FFF1E6] text-[#FF6A00] font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-800 font-bold bg-orange-50"
                >
                  <LayoutDashboard className="w-5 h-5 text-[#FF6A00]" />
                  <span>Dashboard ({currentUser.name})</span>
                </Link>

                <Link
                  href="/dashboard/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  href="/dashboard/itineraries"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  <Map className="w-5 h-5 text-gray-400" />
                  <span>My Itineraries</span>
                </Link>

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-purple-800 font-bold bg-purple-50"
                  >
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {currentUser.role === 'resort_manager' && (
                  <Link
                    href="/resort-manager"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-800 font-bold bg-blue-50"
                  >
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Manager Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#FF6A00] text-white font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
