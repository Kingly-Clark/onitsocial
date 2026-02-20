"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORMS } from "@/types/database";
import type { Platform } from "@/types/database";

interface FollowersChartProps {
  data: Array<{
    date: string;
    followers: number;
    platform?: Platform | null;
  }>;
}

export function FollowersChart({ data }: FollowersChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follower Growth</CardTitle>
          <CardDescription>
            Monitor your follower growth across connected platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Get unique platforms from the data
  const platformsInData = Array.from(new Set(data.map((item) => item.platform).filter(Boolean)));

  // Format data for the chart
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Get colors for each platform
  const getPlatformColor = (platform: Platform | null | undefined): string => {
    if (!platform) return "#6b7280";
    const platformConfig = PLATFORMS.find((p) => p.id === platform);
    return platformConfig?.color || "#6b7280";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follower Growth</CardTitle>
        <CardDescription>
          Monitor your follower growth across connected platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend />
            {platformsInData.length === 0 ? (
              <Line
                type="monotone"
                dataKey="followers"
                stroke="#3b82f6"
                name="Total Followers"
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              platformsInData.map((platform) => {
                const platformLabel =
                  PLATFORMS.find((p) => p.id === platform)?.label || platform || "Unknown";
                return (
                  <Line
                    key={platform}
                    type="monotone"
                    dataKey={(item) =>
                      item.platform === platform ? item.followers : null
                    }
                    stroke={getPlatformColor(platform)}
                    name={platformLabel}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
