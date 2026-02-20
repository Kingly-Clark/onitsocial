import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPost as createLatePost } from "@/lib/late-api";
import type { Post, PostStatus, Platform } from "@/types/database";

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // Verify brand belongs to user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("brand_id", brandId)
      .order("scheduled_for", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status && ["draft", "scheduled", "published", "failed"].includes(status)) {
      query = query.eq("status", status as PostStatus);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error: postsError, count } = await query;

    if (postsError) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: posts || [],
      count: count || 0,
      limit,
      offset,
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
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
    const {
      brandId,
      content,
      mediaUrls = [],
      platforms = [],
      status = "draft",
      scheduledFor,
      location,
    } = body;

    // Validation
    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    if (!content || Object.keys(content).length === 0) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "platforms array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (status === "scheduled" && !scheduledFor) {
      return NextResponse.json(
        { error: "scheduledFor is required when status is 'scheduled'" },
        { status: 400 }
      );
    }

    // Verify brand belongs to user
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

    // Validate scheduledFor if provided
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      const now = new Date();
      const twoMonthsAhead = new Date();
      twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2);

      if (scheduledDate < now) {
        return NextResponse.json(
          { error: "scheduledFor must be in the future" },
          { status: 400 }
        );
      }

      if (scheduledDate > twoMonthsAhead) {
        return NextResponse.json(
          { error: "scheduledFor must be within 2 months" },
          { status: 400 }
        );
      }
    }

    // Insert post into database
    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        brand_id: brandId,
        user_id: user.id,
        content,
        media_urls: mediaUrls,
        platforms,
        status,
        scheduled_for: status === "scheduled" ? scheduledFor : null,
        location: location || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    }

    // If status is published, also push to getlate.dev
    let latePostId: string | null = null;
    if (status === "published" && brand.late_profile_id) {
      try {
        // Get the first platform's content for Late API
        const firstPlatform = platforms[0];
        const postText = content[firstPlatform] || content[Object.keys(content)[0]] || "";

        const lateResponse = await createLatePost({
          profileId: brand.late_profile_id,
          text: postText,
          mediaUrls,
          platforms,
          publishNow: true,
        });

        latePostId = lateResponse.id;

        // Update post with late_post_id
        await supabase
          .from("posts")
          .update({ late_post_id: latePostId })
          .eq("id", newPost.id);
      } catch (lateError) {
        console.error("Failed to create post on getlate.dev:", lateError);
        // Continue - post was saved to DB even if Late API failed
      }
    }

    return NextResponse.json(
      {
        data: { ...newPost, late_post_id: latePostId },
        status: 201,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
