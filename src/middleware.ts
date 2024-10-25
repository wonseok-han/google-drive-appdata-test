import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WHITE_LIST = ["/auth/callback"];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const pathname = request.nextUrl.pathname;

  console.log("쿠키::", accessToken);
  console.log("Path::", pathname);

  if (!WHITE_LIST.includes(pathname) && pathname.startsWith("/")) {
    if (!accessToken) {
      return NextResponse.rewrite(new URL("/login", request.url));
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
