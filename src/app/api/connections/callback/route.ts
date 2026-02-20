import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listAccounts } from "@/lib/late-api";
import type { Platform } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const profileId = searchParams.get("profileId");
    const platform = searchParams.get("platform");

    if (!code || !profileId || !platform) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Find the brand by late_profile_id
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, late_profile_id")
      .eq("late_profile_id", profileId)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Get accounts for this profile from Late API
    // The Late API should have already processed the OAuth callback
    let accounts: Array<{
      id: string;
      platform: string;
      username: string;
      avatarUrl: string;
    }> = [];

    try {
      const accountsResponse = await listAccounts(profileId);
      accounts = accountsResponse.data || [];
    } catch (error) {
      console.error("Failed to list accounts from Late API:", error);
      // Continue - we'll save what we can
    }

    // Find the newly connected account for this platform
    const connectedAccount = accounts.find(
      (acc) => acc.platform.toLowerCase() === platform.toLowerCase()
    );

    if (!connectedAccount) {
      return NextResponse.json(
        { error: "Account connection failed" },
        { status: 400 }
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("connected_accounts")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("platform", platform as Platform)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from("connected_accounts")
        .update({
          late_account_id: connectedAccount.id,
          platform_username: connectedAccount.username || null,
          platform_avatar: connectedAccount.avatarUrl || null,
          status: "active" as const,
        })
        .eq("id", existingAccount.id);

      if (updateError) {
        console.error("Failed to update account:", updateError);
        return NextResponse.json(
          { error: "Failed to update account" },
          { status: 500 }
        );
      }
    } else {
      // Insert new account
      const { error: insertError } = await supabase
        .from("connected_accounts")
        .insert({
          brand_id: brand.id,
          platform: platform as Platform,
          late_account_id: connectedAccount.id,
          platform_username: connectedAccount.username || null,
          platform_avatar: connectedAccount.avatarUrl || null,
          status: "active" as const,
        });

      if (insertError) {
        console.error("Failed to insert account:", insertError);
        return NextResponse.json(
          { error: "Failed to save account" },
          { status: 500 }
        );
      }
    }

    // Redirect to brand settings page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL(`/brands/${brand.id}/settings?connected=true`, baseUrl)
    );
  } catch (error) {
    console.error("GET /api/connections/callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
