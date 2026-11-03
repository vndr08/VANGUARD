import { NextResponse, type NextRequest } from "next/server";

const LOCAL_SESSION_COOKIE = "vanguard-local-session";

export function middleware(request: NextRequest) {
  if (request.cookies.get(LOCAL_SESSION_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tracking/:path*",
    "/locate/:path*",
    "/geofences/:path*",
    "/tasks/:path*",
    "/vehicles/:path*",
    "/drivers/:path*",
    "/history/:path*",
    "/accidents/:path*",
    "/reports/:path*",
    "/snapshots/:path*",
    "/dashcam/:path*",
    "/control/:path*",
    "/settings/:path*",
  ],
};
