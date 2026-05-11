import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Note: Auth tokens are stored in localStorage (client-side only).
  // Next.js middleware runs on the server and cannot access localStorage.
  // Client-side route protection is handled by:
  //   - The root page.tsx redirect logic
  //   - The useAuth() hook in each page component
  //
  // We allow all requests to pass through here.
  // The login page and dashboard pages handle their own auth checks client-side.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)','/', '/(api|trpc)(.*)'],
};
