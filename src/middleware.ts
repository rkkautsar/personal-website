import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server';
import { getShortLink } from '@/services/redis/shortlink';

export const config: MiddlewareConfig = {
  matcher: ['/l/(.*)'],
};

export default async function middleware(
  req: NextRequest
): Promise<NextResponse> {
  const url = req.nextUrl;
  const path = url.pathname.replace('/l', '');
  const redirect = await getShortLink(path);
  if (!redirect) {
    return NextResponse.next();
  }
  return NextResponse.redirect(redirect);
}
