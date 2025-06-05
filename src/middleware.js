import { NextResponse } from 'next/server';
import { withAuth } from './middleware/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  if (
    pathname.startsWith('/_next') || // Next.js static files
    pathname.startsWith('/api/auth') || // Auth endpoints
    pathname === '/' || // Home page
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    return withAuth(request, ['admin']);
  }

  // Teacher routes
  if (pathname.startsWith('/teacher')) {
    return withAuth(request, ['teacher', 'admin']);
  }

  // Student routes
  if (pathname.startsWith('/student')) {
    return withAuth(request, ['student', 'admin']);
  }

  // API routes that require authentication
  if (pathname.startsWith('/api')) {
    return withAuth(request);
  }

  // Default to requiring authentication for all other routes
  return withAuth(request);
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (static files)
     */
    '/((?!_next|static|favicon.ico|robots.txt).*)',
  ],
};
