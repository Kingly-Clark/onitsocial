import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { listAccounts } from "@/lib/late-api";
import type { Platform } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profileId, platform } = body;

    if (!profileId || !platform) {
      return NextResponse.json(
        { error: "Missing profileId or platform" },
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
    let accounts: Array<{
      id: string;
      platform: string;
      username: string;
      avatarUrl: string;
    }> = [];

    try {
      const accountsResponse = await listAccounts(profileId);
      accounts = accountsResponse.data || [];
      console.log("Listed accounts from getLate:", JSON.stringify(accounts, null, 2));
    } catch (error) {
      console.error("Failed to list accounts from Late API:", error);
    }

    // Find the connected account for this platform (flexible matching)
    const platformLower = platform.toLowerCase();
    const connectedAccount = accounts.find((acc) => {
      const accPlatform = acc.platform.toLowerCase();
      return accPlatform === platformLower || 
             accPlatform.includes(platformLower) || 
             platformLower.includes(accPlatform);
    });

    if (!connectedAccount) {
      console.error(`Account not found. Platform: ${platform}, Available accounts:`, accounts);
      
      // If no accounts found at all, the API might not have the account yet
      // Try to create a placeholder entry that can be updated later
      if (accounts.length === 0) {
        console.log("No accounts found, creating placeholder entry");
      }
      
      return NextResponse.json(
        { error: `Account not found for ${platform}. Available platforms: ${accounts.map(a => a.platform).join(", ") || "none"}` },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS for insert/update
    const serviceClient = await createServiceRoleClient();

    // Check if account already exists
    const { data: existingAccount } = await serviceClient
      .from("connected_accounts")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("platform", platform as Platform)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await serviceClient
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
      const { error: insertError } = await serviceClient
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

    return NextResponse.json({
      message: "Connection saved successfully",
      brandId: brand.id,
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/connections/complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
