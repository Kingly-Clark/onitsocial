import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as lateApi from "@/lib/late-api";
import type { InboxMessage, Platform } from "@/types/database";

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
    const { brand_id } = body;

    if (!brand_id) {
      return NextResponse.json(
        { error: "brand_id is required" },
        { status: 400 }
      );
    }

    // Verify brand belongs to user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, late_profile_id")
      .eq("id", brand_id)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found or unauthorized" },
        { status: 404 }
      );
    }

    if (!brand.late_profile_id) {
      return NextResponse.json({
        data: [],
        count: 0,
        status: 200,
      });
    }

    // Get all connected accounts for this brand
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from("connected_accounts")
      .select("id, late_account_id, platform")
      .eq("brand_id", brand_id)
      .eq("status", "active");

    if (accountsError) {
      return NextResponse.json(
        { error: "Failed to fetch connected accounts" },
        { status: 500 }
      );
    }

    if (!connectedAccounts || connectedAccounts.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0,
        status: 200,
      });
    }

    let totalNewMessages = 0;
    const messagesToInsert: any[] = [];
    const existingLateMessageIds = new Set<string>();

    // Fetch existing messages to avoid duplicates
    const { data: existingMessages } = await supabase
      .from("inbox_messages")
      .select("late_message_id")
      .eq("brand_id", brand_id);

    if (existingMessages) {
      existingMessages.forEach((msg) => {
        existingLateMessageIds.add(msg.late_message_id);
      });
    }

    // Fetch messages from each connected account
    for (const account of connectedAccounts) {
      try {
        const response = await lateApi.getMessages(brand.late_profile_id);

        if (response?.data && Array.isArray(response.data)) {
          for (const lateMessage of response.data) {
            // Skip if we already have this message
            if (existingLateMessageIds.has(lateMessage.id)) {
              continue;
            }

            // Only include messages from this account
            if (lateMessage.accountId !== account.late_account_id) {
              continue;
            }

            messagesToInsert.push({
              brand_id,
              connected_account_id: account.id,
              type: lateMessage.type as "comment" | "dm" | "review",
              platform: account.platform as Platform,
              sender_name: lateMessage.senderName,
              sender_avatar: lateMessage.senderAvatar || null,
              content: lateMessage.content,
              is_read: false,
              is_resolved: false,
              late_message_id: lateMessage.id,
              thread_id: lateMessage.threadId || null,
              received_at: new Date(lateMessage.createdAt).toISOString(),
              replied_at: null,
            });

            totalNewMessages++;
          }
        }
      } catch (error) {
        console.error(
          `Failed to fetch messages for account ${account.late_account_id}:`,
          error
        );
        // Continue with next account
      }
    }

    // Insert new messages if any
    if (messagesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("inbox_messages")
        .insert(messagesToInsert);

      if (insertError) {
        console.error("Failed to insert messages:", insertError);
        return NextResponse.json(
          { error: "Failed to sync messages" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      data: messagesToInsert as InboxMessage[],
      count: totalNewMessages,
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/inbox/sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
