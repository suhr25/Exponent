import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Determine the correct base URL for redirects
  // Priority: NEXT_PUBLIC_SITE_URL env var > request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `cookies()` API can only set cookies in a Server Action or Route Handler.
              // This is expected when called from a Server Component.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Successful auth — redirect to dashboard (or wherever `next` points)
      const redirectUrl = new URL(next, siteUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // Auth code exchange failed — send back to login with error
    console.error('Auth callback error:', error.message);
    const loginUrl = new URL('/login', siteUrl);
    loginUrl.searchParams.set('error', 'auth_code_exchange_failed');
    return NextResponse.redirect(loginUrl);
  }

  // No code parameter — redirect to login
  const loginUrl = new URL('/login', siteUrl);
  loginUrl.searchParams.set('error', 'no_auth_code');
  return NextResponse.redirect(loginUrl);
}
