import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createProfile } from "@/lib/late-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get brand to verify ownership
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, name, late_profile_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Check if already synced
    if (brand.late_profile_id) {
      return NextResponse.json({
        data: { late_profile_id: brand.late_profile_id, already_synced: true },
        message: "Brand is already synced with platform",
        status: 200,
      });
    }

    // Check if API key is configured
    if (!process.env.LATE_API_KEY) {
      return NextResponse.json(
        { error: "LATE_API_KEY environment variable is not configured in Vercel." },
        { status: 500 }
      );
    }

    // Create profile on getLate
    let lateProfileId: string;
    try {
      const lateProfile = await createProfile(brand.name);
      lateProfileId = lateProfile.id;
    } catch (lateError: unknown) {
      console.error("Failed to create Late profile:", lateError);
      
      // Get more detailed error info
      let errorMessage = "Failed to sync with platform.";
      if (lateError && typeof lateError === "object" && "statusCode" in lateError) {
        const apiError = lateError as { statusCode: number; message: string; responseBody?: unknown };
        if (apiError.statusCode === 401) {
          errorMessage = "Invalid API key. Please check your LATE_API_KEY in Vercel.";
        } else if (apiError.statusCode === 403) {
          errorMessage = "API key doesn't have permission. Check your getLate account.";
        } else {
          errorMessage = `Platform error (${apiError.statusCode}): ${apiError.message}`;
        }
        console.error("Late API response:", apiError.responseBody);
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Update brand with late_profile_id
    const { data: updatedBrand, error: updateError } = await supabase
      .from("brands")
      .update({ late_profile_id: lateProfileId })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update brand" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedBrand,
      message: "Brand synced successfully",
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/brands/[id]/sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
