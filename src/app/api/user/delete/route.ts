import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
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

    // Get all brands for this user
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", authUser.id);

    if (brandsError) {
      console.error("Error fetching brands:", brandsError);
      return NextResponse.json(
        { error: "Failed to fetch user brands" },
        { status: 500 }
      );
    }

    const brandIds = brands?.map((b) => b.id) || [];

    // Delete data in order of dependencies
    // 1. Delete posts
    if (brandIds.length > 0) {
      const { error: postsError } = await supabase
        .from("posts")
        .delete()
        .in("brand_id", brandIds);

      if (postsError) {
        console.error("Error deleting posts:", postsError);
        return NextResponse.json(
          { error: "Failed to delete posts" },
          { status: 500 }
        );
      }
    }

    // 2. Delete messages
    if (brandIds.length > 0) {
      const { error: messagesError } = await supabase
        .from("inbox_messages")
        .delete()
        .in("brand_id", brandIds);

      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        return NextResponse.json(
          { error: "Failed to delete messages" },
          { status: 500 }
        );
      }
    }

    // 3. Delete analytics
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from("connected_accounts")
      .select("id")
      .in("brand_id", brandIds);

    if (accountsError) {
      console.error("Error fetching connected accounts:", accountsError);
      return NextResponse.json(
        { error: "Failed to fetch connected accounts" },
        { status: 500 }
      );
    }

    const accountIds = connectedAccounts?.map((a) => a.id) || [];

    if (accountIds.length > 0) {
      const { error: analyticsError } = await supabase
        .from("analytics_cache")
        .delete()
        .in("connected_account_id", accountIds);

      if (analyticsError) {
        console.error("Error deleting analytics:", analyticsError);
        return NextResponse.json(
          { error: "Failed to delete analytics" },
          { status: 500 }
        );
      }
    }

    // 4. Delete connected accounts
    if (brandIds.length > 0) {
      const { error: connectedError } = await supabase
        .from("connected_accounts")
        .delete()
        .in("brand_id", brandIds);

      if (connectedError) {
        console.error("Error deleting connected accounts:", connectedError);
        return NextResponse.json(
          { error: "Failed to delete connected accounts" },
          { status: 500 }
        );
      }
    }

    // 5. Delete brands
    if (brandIds.length > 0) {
      const { error: brandsDeleteError } = await supabase
        .from("brands")
        .delete()
        .in("id", brandIds);

      if (brandsDeleteError) {
        console.error("Error deleting brands:", brandsDeleteError);
        return NextResponse.json(
          { error: "Failed to delete brands" },
          { status: 500 }
        );
      }
    }

    // 6. Delete user from users table
    const { error: userDeleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", authUser.id);

    if (userDeleteError) {
      console.error("Error deleting user:", userDeleteError);
      return NextResponse.json(
        { error: "Failed to delete user account" },
        { status: 500 }
      );
    }

    // 7. Delete auth user using service role
    const adminClient = await createServiceRoleClient();
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      authUser.id
    );

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      return NextResponse.json(
        { error: "Failed to delete auth account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account deleted successfully", status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/user/delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
