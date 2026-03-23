import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/")
  ) {
    return response;
  }

  // Not logged in — redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Get user profile for role-based routing
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Pending approval — redirect to pending screen
  if (profile.status === "pending" && !pathname.startsWith("/auth/pending")) {
    return NextResponse.redirect(new URL("/auth/pending", request.url));
  }

  if (profile.status === "rejected" && !pathname.startsWith("/auth/pending")) {
    return NextResponse.redirect(new URL("/auth/pending", request.url));
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && profile.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/investor") && profile.role !== "investor") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/seeker") && profile.role !== "seeker") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
