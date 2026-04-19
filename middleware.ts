import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/", "/leads", "/routes"];
const SESSION_COOKIE = "showing-agent-session";
const encoder = new TextEncoder();

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || "replace-this-with-a-long-random-secret";
}

async function hasValidSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, encoder.encode(getAuthSecret()));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const hasValidSession = await hasValidSessionToken(sessionToken);

  if (pathname === "/login" && hasValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/login" && sessionToken && !hasValidSession) {
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (isProtectedPath(pathname) && !hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);

    if (sessionToken) {
      response.cookies.delete(SESSION_COOKIE);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
