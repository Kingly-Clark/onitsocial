import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth/confirmation errors
  if (error) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", error);
    if (errorDescription) {
      redirectUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Handle confirmation code
  if (code) {
    try {
      const supabase = await createServerSupabaseClient();

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        code
      );

      if (exchangeError) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set(
          "error",
          exchangeError.message || "Failed to exchange code"
        );
        return NextResponse.redirect(redirectUrl);
      }

      // Get the current user to check if they have brands
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check if user has any brands
      const { data: brands, error: brandsError } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (brandsError) {
        console.error("Error checking brands:", brandsError);
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      // Redirect to onboarding if no brands, otherwise dashboard
      const redirectPath = brands && brands.length > 0 ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch (err) {
      console.error("Auth callback error:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // No code or error provided
  return NextResponse.redirect(new URL("/login", request.url));
}
