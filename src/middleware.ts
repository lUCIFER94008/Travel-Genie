import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, decodeTokenPayload } from './lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');
  const isResortManagerRoute = pathname.startsWith('/resort-manager');

  if (!isDashboardRoute && !isAdminRoute && !isResortManagerRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  const user = token ? (verifyToken(token) || decodeTokenPayload(token)) : null;

  if (!user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
  if (isAdminRoute && user.role !== 'admin') {
    const redirectUrl = new URL(user.role === 'resort_manager' ? '/resort-manager' : '/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Resort Manager route protection
  if (isResortManagerRoute && user.role !== 'resort_manager' && user.role !== 'admin') {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/resort-manager',
    '/resort-manager/:path*',
  ],
};
