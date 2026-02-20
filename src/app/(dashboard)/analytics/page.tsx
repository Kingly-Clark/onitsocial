"use client";

import { useEffect, useState } from "react";
import { subDays, format } from "date-fns";
import { useBrandStore } from "@/store/brand-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, AlertCircle } from "lucide-react";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { StatsOverview } from "@/components/analytics/stats-overview";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { FollowersChart } from "@/components/analytics/followers-chart";
import { PlatformBreakdown } from "@/components/analytics/platform-breakdown";
import type { Platform } from "@/types/database";

interface AnalyticsData {
  dailyData: Array<{
    date: string;
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    platform: Platform | null;
  }>;
  totals: {
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  };
  platformBreakdown: Array<{
    platform: Platform;
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  }>;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export default function AnalyticsPage() {
  const { activeBrandId } = useBrandStore();
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [previousData, setPreviousData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize date range (default to last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    setDateFrom(format(thirtyDaysAgo, "yyyy-MM-dd"));
    setDateTo(format(today, "yyyy-MM-dd"));
  }, []);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!activeBrandId || !dateFrom || !dateTo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics?brand_id=${activeBrandId}&from=${dateFrom}&to=${dateTo}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();
      setData(result.data || result);

      // Fetch previous period for comparison
      const rangeLength = Math.floor(
        (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const prevFrom = format(
        subDays(new Date(dateFrom), rangeLength),
        "yyyy-MM-dd"
      );
      const prevTo = format(subDays(new Date(dateFrom), 1), "yyyy-MM-dd");

      const prevResponse = await fetch(
        `/api/analytics?brand_id=${activeBrandId}&from=${prevFrom}&to=${prevTo}`
      );

      if (prevResponse.ok) {
        const prevResult = await prevResponse.json();
        setPreviousData(prevResult.data || prevResult);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
      setData(null);
      setPreviousData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  // Fetch analytics when date range or brand changes
  useEffect(() => {
    if (dateFrom && dateTo && activeBrandId) {
      fetchAnalytics();
    }
  }, [dateFrom, dateTo, activeBrandId]);

  // Handle sync
  const handleSync = async () => {
    if (!activeBrandId || !dateFrom || !dateTo) return;

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_id: activeBrandId,
          from: dateFrom,
          to: dateTo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync analytics");
      }

      // Refresh data after sync
      await fetchAnalytics();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sync analytics"
      );
    } finally {
      setSyncing(false);
    }
  };

  if (!activeBrandId) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">
          Please select a brand to view analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Track your social media performance
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          size="lg"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Data"}
        </Button>
      </div>

      {/* Date Range Picker */}
      {dateFrom && dateTo && (
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={handleDateRangeChange}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !data?.dailyData?.length && !error && (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-600" />
          <p className="text-center text-slate-600 dark:text-slate-400">
            No analytics data yet. Connect your social accounts and sync to see
            your performance.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="mb-4 h-6 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-4 h-4 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <StatsOverview
            data={data.totals}
            previousPeriod={previousData?.totals}
          />

          {/* Engagement Chart */}
          <EngagementChart data={data.dailyData} />

          {/* Followers Chart */}
          <FollowersChart data={data.dailyData} />

          {/* Platform Breakdown */}
          {data.platformBreakdown && data.platformBreakdown.length > 0 && (
            <PlatformBreakdown platforms={data.platformBreakdown} />
          )}
        </div>
      )}
    </div>
  );
}
