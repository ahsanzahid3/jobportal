import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * /auth/callback
 *
 * Supabase sends a confirmation email whose link points here with ?code=...
 * (@supabase/ssr uses PKCE by default, so the code must be exchanged
 * server-side — the browser client alone cannot do it).
 *
 * After exchanging the code we:
 *  1. Ensure the recruiter_profiles row exists (it was skipped at signup time
 *     because there was no session yet).
 *  2. Redirect the user straight to their role-appropriate dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const role: string = data.user.user_metadata?.role ?? "employee";

      // Create the recruiter_profiles row that was intentionally skipped
      // at signup time (no session existed yet to satisfy RLS).
      if (role === "recruiter") {
        await supabase.from("recruiter_profiles").upsert(
          {
            id: data.user.id,
            company_name: data.user.user_metadata?.company_name ?? null,
          },
          { onConflict: "id" }
        );
      }

      return NextResponse.redirect(`${origin}/dashboard/${role}`);
    }
  }

  // Something went wrong — send them to sign-in with a visible error flag
  return NextResponse.redirect(`${origin}/sign-in?error=confirmation_failed`);
}
