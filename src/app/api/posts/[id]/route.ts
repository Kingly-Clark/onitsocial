import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPost as createLatePost, deletePost as deleteLatePost } from "@/lib/late-api";
import type { PostStatus } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: post,
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
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

    const { id } = await params;
    const body = await request.json();
    const { content, platforms, scheduledFor, status } = body;

    // Get existing post
    const { data: existingPost, error: getError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (getError || !existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
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

    // Prepare update object
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (platforms !== undefined) updateData.platforms = platforms;
    if (scheduledFor !== undefined) updateData.scheduled_for = scheduledFor;
    if (status !== undefined) updateData.status = status;

    // If changing from draft to published, call getlate.dev
    if (
      status === "published" &&
      existingPost.status !== "published" &&
      existingPost.late_profile_id === null
    ) {
      // Get brand to access late_profile_id
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("late_profile_id")
        .eq("id", existingPost.brand_id)
        .single();

      if (!brandError && brand?.late_profile_id) {
        try {
          const finalContent = content || existingPost.content;
          const finalPlatforms = platforms || existingPost.platforms;
          const firstPlatform = finalPlatforms[0];
          const postText = finalContent[firstPlatform] || finalContent[Object.keys(finalContent)[0]] || "";

          const lateResponse = await createLatePost({
            profileId: brand.late_profile_id,
            text: postText,
            mediaUrls: existingPost.media_urls,
            platforms: finalPlatforms,
            publishNow: true,
          });

          updateData.late_post_id = lateResponse.id;
        } catch (lateError) {
          console.error("Failed to create post on getlate.dev:", lateError);
          // Continue - allow update even if Late API fails
        }
      }
    }

    // Update post
    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedPost,
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/posts/[id] error:", error);
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

    const { id } = await params;

    // Get post to check if it needs to be deleted from getlate.dev
    const { data: post, error: getError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (getError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // If post was published on getlate.dev, delete it there first
    if (post.late_post_id) {
      try {
        await deleteLatePost(post.late_post_id);
      } catch (lateError) {
        console.error("Failed to delete post on getlate.dev:", lateError);
        // Continue - delete from DB anyway
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { id }, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
