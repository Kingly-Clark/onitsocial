import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as lateApi from "@/lib/late-api";

export async function POST(
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
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Reply content is required" },
        { status: 400 }
      );
    }

    // Get the message
    const { data: message, error: messageError } = await supabase
      .from("inbox_messages")
      .select("id, brand_id, late_message_id, connected_account_id")
      .eq("id", params.id)
      .single();

    if (messageError || !message) {
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

    // Get the connected account to verify it exists
    const { data: connectedAccount, error: accountError } = await supabase
      .from("connected_accounts")
      .select("id, late_account_id")
      .eq("id", message.connected_account_id)
      .single();

    if (accountError || !connectedAccount) {
      return NextResponse.json(
        { error: "Connected account not found" },
        { status: 404 }
      );
    }

    // Call Late API to send the reply
    try {
      await lateApi.replyToMessage(message.late_message_id, content.trim());
    } catch (lateError) {
      console.error("Late API reply error:", lateError);
      return NextResponse.json(
        { error: "Failed to send reply via social platform" },
        { status: 500 }
      );
    }

    // Update the message with replied_at timestamp
    const { data: updatedMessage, error: updateError } = await supabase
      .from("inbox_messages")
      .update({
        replied_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update message replied_at:", updateError);
      // Still return success since the reply was sent
      return NextResponse.json({
        data: { id: params.id, replied_at: new Date().toISOString() },
        status: 200,
      });
    }

    return NextResponse.json({
      data: updatedMessage,
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/inbox/[id]/reply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
