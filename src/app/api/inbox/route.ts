import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { InboxMessage } from "@/types/database";

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

    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get("brand_id");
    const type = searchParams.get("type");
    const isRead = searchParams.get("is_read");
    const isResolved = searchParams.get("is_resolved");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    if (!brandId) {
      return NextResponse.json(
        { error: "brand_id query parameter is required" },
        { status: 400 }
      );
    }

    // Verify the brand belongs to this user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build the query
    let query = supabase
      .from("inbox_messages")
      .select("*", { count: "exact" })
      .eq("brand_id", brandId);

    // Apply filters
    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (isRead !== null) {
      const isReadBool = isRead === "true";
      query = query.eq("is_read", isReadBool);
    }

    if (isResolved !== null) {
      const isResolvedBool = isResolved === "true";
      query = query.eq("is_resolved", isResolvedBool);
    }

    // Order by received_at DESC and apply pagination
    const { data: messages, error: messagesError, count } = await query
      .order("received_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (messagesError) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: messages as InboxMessage[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/inbox error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
