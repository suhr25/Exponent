import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // ── Intercept Supabase OAuth error redirects ──────────────────────────────
  // When an OAuth flow fails (e.g. flow_state_already_used, expired state,
  // user cancellation), Supabase redirects to the site root with error params:
  //   /?error=invalid_request&error_code=flow_state_already_used&error_description=...
  // We intercept these BEFORE any page rendering and redirect to /login with
  // a clean, user-friendly error.
  const errorParam = request.nextUrl.searchParams.get('error');
  const errorCode = request.nextUrl.searchParams.get('error_code');

  if (errorParam && errorCode) {
    // This is an OAuth error redirect from Supabase — send to login gracefully
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Clear all Supabase error params and set our own clean error code
    url.searchParams.delete('error');
    url.searchParams.delete('error_code');
    url.searchParams.delete('error_description');
    url.searchParams.set('error', mapOAuthError(errorCode));
    return NextResponse.redirect(url);
  }

  // ── Standard Supabase session refresh ─────────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes — redirect to login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Map Supabase OAuth error codes to our clean error identifiers
function mapOAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'flow_state_already_used':
    case 'flow_state_expired':
      return 'auth_session_expired';
    case 'user_cancelled':
    case 'access_denied':
      return 'auth_cancelled';
    case 'provider_error':
      return 'auth_provider_error';
    default:
      return 'auth_failed';
  }
}
