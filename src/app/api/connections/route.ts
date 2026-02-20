import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getConnectUrl } from "@/lib/late-api";
import type { Platform } from "@/types/database";
import { PLATFORMS } from "@/types/database";

const VALID_PLATFORMS = PLATFORMS.map((p) => p.id);

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
    const { brandId, platform } = body;

    if (!brandId || typeof brandId !== "string") {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Verify brand ownership
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, late_profile_id")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    if (!brand.late_profile_id) {
      return NextResponse.json(
        { error: "Brand has not been synced with platform" },
        { status: 400 }
      );
    }

    // Get the callback URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/connections/callback`;

    // Get connect URL from getlate.dev
    const lateResponse = await getConnectUrl(
      platform,
      brand.late_profile_id,
      callbackUrl
    );

    return NextResponse.json({
      data: {
        url: lateResponse.url,
      },
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/connections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
