import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user data from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: user as User,
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, timezone } = body;

    // Validation
    if (full_name !== undefined && typeof full_name !== "string") {
      return NextResponse.json(
        { error: "full_name must be a string" },
        { status: 400 }
      );
    }

    if (full_name !== undefined && full_name.trim().length === 0) {
      return NextResponse.json(
        { error: "full_name cannot be empty" },
        { status: 400 }
      );
    }

    if (timezone !== undefined && typeof timezone !== "string") {
      return NextResponse.json(
        { error: "timezone must be a string" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }
    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", authUser.id)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedUser as User,
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
