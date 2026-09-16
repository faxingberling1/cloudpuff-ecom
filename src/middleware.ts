import { NextResponse, NextRequest } from 'next/server';
import { verifyAuthToken, SESSION_COOKIE_NAME } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Verify JWT if token is present
  const user = token ? await verifyAuthToken(token) : null;

  // 1. Guest-Only Routes (e.g. /login)
  // If user is already authenticated with a valid session, redirect away from login
  if (pathname === '/login') {
    if (user) {
      const redirectTarget = searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected User Routes (e.g. /dashboard, /checkout, /orders)
  const isProtectedUserRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/orders');

  if (isProtectedUserRoute) {
    if (!user) {
      const fullPath = pathname + (request.nextUrl.search || '');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', fullPath);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    // 3. ZERO-BYPASS ADMIN ROUTE GUARD
    // If accessing admin tab or admin preference view inside /dashboard
    const tab = searchParams.get('tab');
    const isRequestingAdminDashboard =
      tab === 'admin' ||
      (tab === 'preferences' && user.role !== 'admin');

    if (isRequestingAdminDashboard && user.role !== 'admin') {
      console.warn(`[Security Alert] Non-admin user (${user.email}) attempted to access admin view: ${pathname}?${request.nextUrl.search}`);
      const fallbackUrl = new URL('/dashboard', request.url);
      fallbackUrl.searchParams.set('tab', 'overview');
      fallbackUrl.searchParams.set('denied', 'admin_privileges_required');
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // 4. Dedicated Admin Routes (e.g. /admin/* or /api/admin/*)
  const isDedicatedAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isDedicatedAdminRoute) {
    if (!user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== 'admin') {
      console.warn(`[Security Alert] Non-admin user (${user.email}) attempted to access dedicated admin route: ${pathname}`);
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Administrator privileges required' },
          { status: 403 }
        );
      }
      const deniedUrl = new URL('/dashboard?tab=overview&denied=admin_only', request.url);
      return NextResponse.redirect(deniedUrl);
    }
  }

  // Forward request with injected authenticated user headers
  const response = NextResponse.next();
  if (user) {
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-email', user.email);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/login',
  ],
};
