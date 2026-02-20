import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Platform, AnalyticsCache } from "@/types/database";

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
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const platformFilter = searchParams.get("platform");

    if (!brandId) {
      return NextResponse.json(
        { error: "brand_id is required" },
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

    // Build query with analytics_cache joined to connected_accounts
    let query = supabase
      .from("analytics_cache")
      .select(
        `
        *,
        connected_accounts(platform, platform_username)
      `
      )
      .eq("connected_accounts.brand_id", brandId);

    // Apply date range filter
    if (fromDate) {
      query = query.gte("date", fromDate);
    }
    if (toDate) {
      query = query.lte("date", toDate);
    }

    // Apply platform filter if provided
    if (platformFilter) {
      query = query.eq("connected_accounts.platform", platformFilter);
    }

    // Order by date ascending
    query = query.order("date", { ascending: true });

    const { data: analyticsData, error: analyticsError } = await query;

    if (analyticsError) {
      console.error("Analytics query error:", analyticsError);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    // Type the data properly
    interface AnalyticsRow {
      id: string;
      connected_account_id: string;
      date: string;
      followers: number;
      impressions: number;
      reach: number;
      engagement: number;
      clicks: number;
      synced_at: string;
      raw_data: Record<string, unknown>;
      connected_accounts: {
        platform: Platform;
        platform_username: string | null;
      } | null;
    }

    const typedData = analyticsData as AnalyticsRow[];

    // Calculate aggregated totals
    let totalFollowers = 0;
    let totalImpressions = 0;
    let totalReach = 0;
    let totalEngagement = 0;
    let totalClicks = 0;

    // Group by platform
    const platformBreakdown: Record<
      string,
      {
        platform: Platform;
        followers: number;
        impressions: number;
        reach: number;
        engagement: number;
        clicks: number;
      }
    > = {};

    // Process analytics data
    typedData.forEach((row) => {
      totalFollowers += row.followers;
      totalImpressions += row.impressions;
      totalReach += row.reach;
      totalEngagement += row.engagement;
      totalClicks += row.clicks;

      if (row.connected_accounts?.platform) {
        const platform = row.connected_accounts.platform;
        if (!platformBreakdown[platform]) {
          platformBreakdown[platform] = {
            platform,
            followers: 0,
            impressions: 0,
            reach: 0,
            engagement: 0,
            clicks: 0,
          };
        }
        platformBreakdown[platform].followers += row.followers;
        platformBreakdown[platform].impressions += row.impressions;
        platformBreakdown[platform].reach += row.reach;
        platformBreakdown[platform].engagement += row.engagement;
        platformBreakdown[platform].clicks += row.clicks;
      }
    });

    // Prepare daily data points with platforms
    const dailyDataMap: Record<
      string,
      {
        date: string;
        followers: number;
        impressions: number;
        reach: number;
        engagement: number;
        clicks: number;
        platform: Platform | null;
      }
    > = {};

    typedData.forEach((row) => {
      const key = `${row.date}`;
      if (!dailyDataMap[key]) {
        dailyDataMap[key] = {
          date: row.date,
          followers: 0,
          impressions: 0,
          reach: 0,
          engagement: 0,
          clicks: 0,
          platform: row.connected_accounts?.platform || null,
        };
      }
      dailyDataMap[key].followers += row.followers;
      dailyDataMap[key].impressions += row.impressions;
      dailyDataMap[key].reach += row.reach;
      dailyDataMap[key].engagement += row.engagement;
      dailyDataMap[key].clicks += row.clicks;
    });

    const dailyData = Object.values(dailyDataMap);

    return NextResponse.json(
      {
        dailyData,
        totals: {
          followers: totalFollowers,
          impressions: totalImpressions,
          reach: totalReach,
          engagement: totalEngagement,
          clicks: totalClicks,
        },
        platformBreakdown: Object.values(platformBreakdown),
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
