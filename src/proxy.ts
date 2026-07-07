import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// Edge in-memory rate limiter (per Edge instance)
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null
    },
    pages: {
      signIn: '/th/login'
    }
  }
);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rate limit NextAuth Credentials login (max 5 requests per minute per IP)
  if (pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const attempt = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };
    
    if (now - attempt.lastAttempt > 60000) {
      attempt.count = 0;
      attempt.lastAttempt = now;
    }
    attempt.count++;
    rateLimitMap.set(ip, attempt);
    
    if (attempt.count > 5) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Block unauthenticated access to session endpoint
  if (pathname.startsWith('/api/auth/session')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "supersecretkey" });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  const protectedPaths = [/^\/(th|en)\/profile/, /^\/(th|en)\/admin/, /^\/(th|en)\/courses\/certificate/, /^\/admin/, /^\/profile/, /^\/courses\/certificate/];
  
  const isProtected = protectedPaths.some(p => p.test(pathname));
  
  if (isProtected) {
    return (authMiddleware as any)(req);
  }
  
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
