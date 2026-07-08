import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// Edge in-memory rate limiter (per Edge instance, resets on cold start)
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();

// Default 10 req/min for credentials login (override with CRED_RATE_LIMIT env var)
const CRED_RATE_LIMIT = Number(process.env.CRED_RATE_LIMIT ?? 10);

// Auth middleware – redirects to /th/login on unauthenticated access
const authMiddleware = withAuth(
  (req) => intlMiddleware(req),
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: '/th/login',
    },
  }
);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ─── API routes: handle security checks then pass through ───
  // IMPORTANT: Never send /api/* through intlMiddleware – it would add a
  // locale prefix (e.g. /th/api/auth/callback/google) which breaks OAuth.
  if (pathname.startsWith('/api/')) {
    // Rate-limit credentials login endpoint (max CRED_RATE_LIMIT req/min per IP)
    if (pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const attempt = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };

      if (now - attempt.lastAttempt > 60_000) {
        attempt.count = 0;
        attempt.lastAttempt = now;
      }
      attempt.count++;
      rateLimitMap.set(ip, attempt);

      if (attempt.count > CRED_RATE_LIMIT) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }

    // Protect session endpoint – 401 when no token
    if (pathname.startsWith('/api/auth/session')) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET || 'supersecretkey',
      });
      if (!token) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // All other API routes pass through untouched
    return NextResponse.next();
  }

  // ─── Page routes: protect certain paths, then apply i18n ───
  const protectedPaths = [
    /^\/(th|en)\/profile/,
    /^\/(th|en)\/admin/,
    /^\/(th|en)\/courses\/certificate/,
    /^\/admin/,
    /^\/profile/,
    /^\/courses\/certificate/,
  ];

  const isProtected = protectedPaths.some((p) => p.test(pathname));

  if (isProtected) {
    return (authMiddleware as any)(req);
  }

  // Normal i18n routing for all other pages
  const response = intlMiddleware(req);

  // Ensure NEXT_LOCALE cookie has proper security flags
  const localeCookie = req.cookies.get('NEXT_LOCALE');
  if (localeCookie) {
    response.cookies.set('NEXT_LOCALE', localeCookie.value, {
      httpOnly: true,
      // Secure only in production – dev runs on http://localhost
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // All pages except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
