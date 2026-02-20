import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/lib/late-api";

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

    // Get the connected account and verify ownership
    const { data: connectedAccount, error: accountError } = await supabase
      .from("connected_accounts")
      .select(
        `
        id,
        brand_id,
        late_account_id,
        brands (
          id,
          user_id
        )
      `
      )
      .eq("id", id)
      .single();

    if (accountError || !connectedAccount) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Verify the brand belongs to the user
    const brand = connectedAccount.brands as any;
    if (brand.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete account from getlate.dev if it exists
    if (connectedAccount.late_account_id) {
      try {
        await deleteAccount(connectedAccount.late_account_id);
      } catch (lateError) {
        console.error("Failed to delete Late account:", lateError);
        // Continue with database deletion even if Late API fails
      }
    }

    // Delete the connected account from database
    const { error: deleteError } = await supabase
      .from("connected_accounts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to disconnect account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account disconnected successfully", status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/connections/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
