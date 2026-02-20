import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAccountAnalytics } from "@/lib/late-api";
import { generateId } from "@/lib/utils";

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
    const { brand_id, from, to } = body;

    if (!brand_id) {
      return NextResponse.json(
        { error: "brand_id is required" },
        { status: 400 }
      );
    }

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to dates are required" },
        { status: 400 }
      );
    }

    // Verify brand belongs to user
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", brand_id)
      .eq("user_id", user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Get connected accounts for this brand
    const { data: accounts, error: accountsError } = await supabase
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

    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        {
          data: {
            syncedAccounts: [],
            totalDataPoints: 0,
          },
          status: 200,
        },
        { status: 200 }
      );
    }

    // Sync analytics for each account
    const syncedAccounts = [];
    let totalDataPoints = 0;

    for (const account of accounts) {
      try {
        const analyticsResponse = await getAccountAnalytics(
          account.late_account_id,
          from,
          to
        );

        if (analyticsResponse && analyticsResponse.daily) {
          // Upsert daily analytics records
          const upsertData = analyticsResponse.daily.map((dailyItem) => ({
            id: generateId(),
            connected_account_id: account.id,
            date: dailyItem.date,
            followers: dailyItem.followers,
            impressions: dailyItem.impressions,
            reach: dailyItem.reach,
            engagement: dailyItem.engagement,
            clicks: dailyItem.clicks,
            raw_data: {
              dailyItem,
            },
            synced_at: new Date().toISOString(),
          }));

          // Delete existing records for this date range and account
          await supabase
            .from("analytics_cache")
            .delete()
            .eq("connected_account_id", account.id)
            .gte("date", from)
            .lte("date", to);

          // Insert new records
          const { error: insertError } = await supabase
            .from("analytics_cache")
            .insert(upsertData);

          if (insertError) {
            console.error(
              `Failed to insert analytics for account ${account.id}:`,
              insertError
            );
          } else {
            syncedAccounts.push({
              accountId: account.id,
              platform: account.platform,
              dataPoints: upsertData.length,
            });
            totalDataPoints += upsertData.length;
          }
        }
      } catch (error) {
        console.error(
          `Failed to fetch analytics for account ${account.id}:`,
          error
        );
        // Continue with next account on error
      }
    }

    return NextResponse.json(
      {
        data: {
          syncedAccounts,
          totalDataPoints,
        },
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/analytics/sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
