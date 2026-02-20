"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EngagementChartProps {
  data: Array<{
    date: string;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  }>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>
            Track impressions, reach, engagement, and clicks over time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
        <CardDescription>
          Track impressions, reach, engagement, and clicks over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <Area
              type="monotone"
              dataKey="impressions"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              isAnimationActive={false}
              name="Impressions"
            />
            <Area
              type="monotone"
              dataKey="reach"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              isAnimationActive={false}
              name="Reach"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stackId="1"
              stroke="#ec4899"
              fill="#ec4899"
              isAnimationActive={false}
              name="Engagement"
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              isAnimationActive={false}
              name="Clicks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
