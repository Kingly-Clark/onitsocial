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

    // Get the callback URL - points to our page selector UI
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/connections/callback`;

    // Get connect URL from getlate.dev
    let lateResponse;
    try {
      lateResponse = await getConnectUrl(
        platform,
        brand.late_profile_id,
        callbackUrl
      );
    } catch (lateError: unknown) {
      console.error("getLate connect error:", lateError);
      let errorMessage = "Failed to get connect URL from platform";
      
      if (lateError && typeof lateError === "object") {
        const err = lateError as Record<string, unknown>;
        if ("statusCode" in err) {
          const responseBody = err.responseBody as Record<string, unknown> | undefined;
          errorMessage = `Platform error (${err.statusCode}): ${responseBody?.message || responseBody?.error || JSON.stringify(responseBody)}`;
        } else if ("message" in err) {
          errorMessage = String(err.message);
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        url: lateResponse.url,
      },
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/connections error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
