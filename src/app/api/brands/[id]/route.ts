import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteProfile } from "@/lib/late-api";
import type { Brand } from "@/types/database";

export async function GET(
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

    // Get brand with connected accounts
    const { data: brand, error: brandError } = await supabase
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
          id,
          brand_id,
          platform,
          late_account_id,
          platform_username,
          platform_avatar,
          connected_at,
          status
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: brand,
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verify brand ownership
    const { data: brand, error: brandCheckError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (brandCheckError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, color, logo_url } = body;

    const updateData: Partial<Brand> = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (logo_url !== undefined) updateData.logo_url = logo_url;

    const { data: updatedBrand, error: updateError } = await supabase
      .from("brands")
      .update(updateData)
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
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get brand to verify ownership and get late_profile_id
    const { data: brand, error: brandCheckError } = await supabase
      .from("brands")
      .select("id, late_profile_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (brandCheckError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Delete profile from getlate.dev if it exists
    if (brand.late_profile_id) {
      try {
        await deleteProfile(brand.late_profile_id);
      } catch (lateError) {
        console.error("Failed to delete Late profile:", lateError);
        // Continue with database deletion even if Late API fails
      }
    }

    // Delete brand (cascades to connected_accounts due to DB constraints)
    const { error: deleteError } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete brand" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Brand deleted successfully", status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
