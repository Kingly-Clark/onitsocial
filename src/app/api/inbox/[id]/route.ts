import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { is_read, is_resolved } = body;

    // Verify message exists and belongs to user's brand
    const { data: message, error: fetchError } = await supabase
      .from("inbox_messages")
      .select("id, brand_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Verify brand belongs to user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", message.brand_id)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Build update object - only include fields that are provided
    const updateData: any = {};
    if (typeof is_read === "boolean") {
      updateData.is_read = is_read;
    }
    if (typeof is_resolved === "boolean") {
      updateData.is_resolved = is_resolved;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: updatedMessage, error: updateError } = await supabase
      .from("inbox_messages")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedMessage,
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/inbox/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify message exists and belongs to user's brand
    const { data: message, error: fetchError } = await supabase
      .from("inbox_messages")
      .select("id, brand_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Verify brand belongs to user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", message.brand_id)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("inbox_messages")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete message" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: 204 },
      { status: 204 }
    );
  } catch (error) {
    console.error("DELETE /api/inbox/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
