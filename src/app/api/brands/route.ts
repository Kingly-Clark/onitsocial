import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createProfile } from "@/lib/late-api";
import type { Brand } from "@/types/database";
import { PLAN_LIMITS } from "@/types/database";

export async function GET(request: NextRequest) {
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

    // Get user subscription plan
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_plan")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    // Get all brands for the user with connected accounts count
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select(
        `
        id,
        name,
        color,
        logo_url,
        late_profile_id,
        created_at,
        connected_accounts (
          id
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (brandsError) {
      return NextResponse.json(
        { error: "Failed to fetch brands" },
        { status: 500 }
      );
    }

    // Transform response with connected accounts count
    const brandsWithCounts = brands.map((brand: any) => ({
      ...brand,
      connected_accounts_count: brand.connected_accounts?.length || 0,
      connected_accounts: undefined,
    }));

    return NextResponse.json({
      data: brandsWithCounts,
      plan: userData.subscription_plan,
      limit: PLAN_LIMITS[userData.subscription_plan as keyof typeof PLAN_LIMITS],
      used: brands.length,
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { name, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Get user subscription plan
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_plan")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    // Check brand limit
    const { data: existingBrands, error: countError } = await supabase
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return NextResponse.json(
        { error: "Failed to check brand limit" },
        { status: 500 }
      );
    }

    const plan = userData.subscription_plan as keyof typeof PLAN_LIMITS;
    const brandLimit = PLAN_LIMITS[plan];

    if ((existingBrands?.length || 0) >= brandLimit) {
      return NextResponse.json(
        {
          error: `You have reached the brand limit for your plan (${brandLimit} brands)`,
        },
        { status: 409 }
      );
    }

    // Create profile on getlate.dev
    let lateProfileId: string | null = null;
    try {
      const lateProfile = await createProfile(name);
      lateProfileId = lateProfile.id;
    } catch (lateError) {
      console.error("Failed to create Late profile:", lateError);
      // Continue without Late profile - it can be created later
    }

    // Insert brand into database
    const { data: newBrand, error: insertError } = await supabase
      .from("brands")
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color || "#3b82f6",
        late_profile_id: lateProfileId,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create brand" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: newBrand,
        status: 201,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/brands error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
