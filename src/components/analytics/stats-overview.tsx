"use client";

import { formatNumber } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Eye,
  Radio,
  Heart,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatsOverviewProps {
  data: {
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  };
  previousPeriod?: {
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  };
}

export function StatsOverview({ data, previousPeriod }: StatsOverviewProps) {
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const stats = [
    {
      label: "Followers",
      value: data.followers,
      icon: Users,
      change: previousPeriod
        ? calculateChange(data.followers, previousPeriod.followers)
        : undefined,
    },
    {
      label: "Impressions",
      value: data.impressions,
      icon: Eye,
      change: previousPeriod
        ? calculateChange(data.impressions, previousPeriod.impressions)
        : undefined,
    },
    {
      label: "Reach",
      value: data.reach,
      icon: Radio,
      change: previousPeriod
        ? calculateChange(data.reach, previousPeriod.reach)
        : undefined,
    },
    {
      label: "Engagement",
      value: data.engagement,
      icon: Heart,
      change: previousPeriod
        ? calculateChange(data.engagement, previousPeriod.engagement)
        : undefined,
    },
    {
      label: "Clicks",
      value: data.clicks,
      icon: MousePointerClick,
      change: previousPeriod
        ? calculateChange(data.clicks, previousPeriod.clicks)
        : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive =
          stat.change === undefined ? true : stat.change >= 0;

        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stat.value)}
                  </p>
                  {stat.change !== undefined && (
                    <div
                      className={`mt-2 flex items-center text-sm font-semibold ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <Icon className="h-6 w-6 text-slate-400 dark:text-slate-600" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
