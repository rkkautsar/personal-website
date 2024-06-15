import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server';
import { getShortLink } from '@/services/redis/shortlink';
import { auth } from '@/auth';
import { isAuthorized } from '@/services/redis/auth';

export const config: MiddlewareConfig = {
  matcher: ['/l/(.*)', '/dashboard(.*)'],
};

async function middleware(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  if (url.pathname.includes('/l/')) {
    return shortLinkMiddleware(req);
  } else if (url.pathname.includes('/dashboard')) {
    return dashboardMiddleware(req);
  }
  return NextResponse.next();
}

async function shortLinkMiddleware(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  const path = url.pathname.replace('/l', '');
  const redirect = await getShortLink(path);
  if (!redirect) {
    return NextResponse.next();
  }
  return NextResponse.redirect(redirect);
}

async function dashboardMiddleware(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  const session = await auth();
  const isLoginPage = url.pathname.includes('/dashboard/login');
  const isUnauthorizedPage = url.pathname.includes('/dashboard/unauthorized');
  const isAuth = await isAuthorized(session?.user?.email);
  if ((isLoginPage || isUnauthorizedPage) && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', url));
  }
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/dashboard/login', url));
  }
  if (!isLoginPage && session && !isAuth && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL('/dashboard/unauthorized', url));
  }
  return NextResponse.next();
}

export default auth(middleware);
