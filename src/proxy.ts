import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

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

export default function middleware(req: NextRequest) {
  const protectedPaths = [/^\/(th|en)\/profile/, /^\/(th|en)\/admin/, /^\/(th|en)\/courses\/certificate/, /^\/admin/, /^\/profile/, /^\/courses\/certificate/];
  
  const isProtected = protectedPaths.some(p => p.test(req.nextUrl.pathname));
  
  if (isProtected) {
    return (authMiddleware as any)(req);
  }
  
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
