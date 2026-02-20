"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORMS } from "@/types/database";
import type { Platform } from "@/types/database";
import { Globe, Facebook, Instagram, Music, Youtube, Linkedin, MapPin } from "lucide-react";

interface PlatformBreakdownProps {
  platforms: Array<{
    platform: Platform;
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  }>;
}

type SortKey = "platform" | "followers" | "impressions" | "reach" | "engagement" | "clicks";

export function PlatformBreakdown({ platforms }: PlatformBreakdownProps) {
  const [sortBy, setSortBy] = useState<SortKey>("followers");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!platforms || platforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
          <CardDescription>
            Performance metrics by platform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">No platform data available</p>
        </CardContent>
      </Card>
    );
  }

  // Sort the data
  const sortedPlatforms = [...platforms].sort((a, b) => {
    let aVal: number | string = a[sortBy];
    let bVal: number | string = b[sortBy];

    if (sortBy === "platform") {
      aVal = PLATFORMS.find((p) => p.id === a.platform)?.label || a.platform;
      bVal = PLATFORMS.find((p) => p.id === b.platform)?.label || b.platform;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortOrder === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // Calculate max values for bar visualization
  const maxFollowers = Math.max(...platforms.map((p) => p.followers), 1);
  const maxImpressions = Math.max(...platforms.map((p) => p.impressions), 1);
  const maxReach = Math.max(...platforms.map((p) => p.reach), 1);
  const maxEngagement = Math.max(...platforms.map((p) => p.engagement), 1);
  const maxClicks = Math.max(...platforms.map((p) => p.clicks), 1);

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "facebook":
        return Facebook;
      case "instagram":
        return Instagram;
      case "tiktok":
        return Music;
      case "youtube":
        return Youtube;
      case "linkedin":
        return Linkedin;
      case "google_business":
        return MapPin;
      default:
        return Globe;
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Breakdown</CardTitle>
        <CardDescription>
          Performance metrics by platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPlatforms.map((platform) => {
            const PlatformIcon = getPlatformIcon(platform.platform);
            const platformConfig = PLATFORMS.find((p) => p.id === platform.platform);

            return (
              <div key={platform.platform} className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <PlatformIcon className="h-5 w-5" style={{ color: platformConfig?.color }} />
                  <span className="font-semibold">{platformConfig?.label || platform.platform}</span>
                </div>

                {/* Followers Bar */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Followers</span>
                    <span className="font-medium">{formatNumber(platform.followers)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(platform.followers / maxFollowers) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Impressions Bar */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Impressions</span>
                    <span className="font-medium">{formatNumber(platform.impressions)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${(platform.impressions / maxImpressions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Reach Bar */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Reach</span>
                    <span className="font-medium">{formatNumber(platform.reach)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-cyan-500"
                      style={{
                        width: `${(platform.reach / maxReach) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Engagement Bar */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Engagement</span>
                    <span className="font-medium">{formatNumber(platform.engagement)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-pink-500"
                      style={{
                        width: `${(platform.engagement / maxEngagement) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Clicks Bar */}
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Clicks</span>
                    <span className="font-medium">{formatNumber(platform.clicks)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${(platform.clicks / maxClicks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
