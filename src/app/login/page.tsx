'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

function isValidCallbackUrl(url: string | null): boolean {
  if (!url) return false;
  // Must start with '/' and must NOT start with '//' or contain protocol schemes
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('://');
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Role-based redirect logic with safe internal callbackUrl validation
      const userRole = data.user?.role || 'user';
      if (isValidCallbackUrl(callbackUrl)) {
        router.push(callbackUrl!);
      } else if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'resort_manager') {
        router.push('/resort-manager');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT / HERO BRANDING AREA */}
        <div className="lg:col-span-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white font-extrabold shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                TRAVEL<span className="text-[#FF6A00]">GENIE</span>
              </span>
            </Link>

            <div className="space-y-3 pt-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-orange-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Travel Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                Plan your next journey with confidence.
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed">
                Discover real tourist destinations, place-specific dining, verified resorts, and custom itineraries across India.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 space-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
              <span>100% Verified Photography & Isolated Destinations</span>
            </div>
            <p>© 2026 Travel Genie Inc. All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT / LOGIN FORM CARD */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">Welcome back</h2>
            <p className="text-xs sm:text-sm text-gray-500">Sign in to continue your journey.</p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#FF6A00] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#FF6A00] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-gray-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
