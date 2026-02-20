"use client";

import { useMemo } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { useBrandStore } from "@/store/brand-store";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

interface RecentPost {
  id: string;
  title: string;
  platforms: string[];
  status: "draft" | "scheduled" | "published";
  date: string;
}

const mockStats: StatCard[] = [
  {
    title: "Total Followers",
    value: "24.5K",
    change: 12.5,
    icon: <Users className="h-6 w-6" />,
    trend: "up",
  },
  {
    title: "Posts This Month",
    value: "18",
    change: 8.2,
    icon: <FileText className="h-6 w-6" />,
    trend: "up",
  },
  {
    title: "Unread Messages",
    value: "7",
    change: -2.4,
    icon: <MessageSquare className="h-6 w-6" />,
    trend: "down",
  },
  {
    title: "Connected Platforms",
    value: "4",
    change: 0,
    icon: <Zap className="h-6 w-6" />,
    trend: "up",
  },
];

const mockRecentPosts: RecentPost[] = [
  {
    id: "1",
    title: "Check out our latest product launch!",
    platforms: ["instagram", "facebook", "linkedin"],
    status: "published",
    date: "2 hours ago",
  },
  {
    id: "2",
    title: "Join us for a live Q&A session tomorrow",
    platforms: ["twitter", "youtube"],
    status: "scheduled",
    date: "Scheduled for tomorrow at 2:00 PM",
  },
  {
    id: "3",
    title: "Behind the scenes of our team",
    platforms: ["instagram", "tiktok"],
    status: "draft",
    date: "Just now",
  },
  {
    id: "4",
    title: "New blog post: Best practices for social media",
    platforms: ["linkedin", "facebook"],
    status: "published",
    date: "1 day ago",
  },
  {
    id: "5",
    title: "Summer sale announcement",
    platforms: ["instagram", "facebook", "twitter"],
    status: "scheduled",
    date: "Scheduled for tomorrow at 10:00 AM",
  },
];

const platformColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
  facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  linkedin: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  twitter: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
  youtube: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  tiktok: "bg-black text-white dark:bg-gray-800 dark:text-white",
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  scheduled:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
};

export default function DashboardPage() {
  const { user } = useUserStore();
  const { getActiveBrand } = useBrandStore();
  const activeBrand = getActiveBrand();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName = user?.full_name || user?.email || "there";

  return (
    <DashboardShell
      title="Dashboard"
      subtitle={`${greeting}, ${userName}! Here's what's happening with your brand${activeBrand ? ` "${activeBrand.name}"` : ""}.`}
    >
      <div className="space-y-8 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockStats.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="rounded-md bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(stat.change)}% from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Posts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>
                  Your latest posts across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="flex-1 space-y-2">
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          {post.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform) => (
                            <Badge
                              key={platform}
                              className={cn(
                                "text-xs",
                                platformColors[platform] ||
                                  "bg-slate-100 text-slate-700"
                              )}
                              variant="secondary"
                            >
                              {platform.charAt(0).toUpperCase() +
                                platform.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "text-xs",
                            statusColors[post.status] ||
                              "bg-slate-100 text-slate-700"
                          )}
                          variant="secondary"
                        >
                          {post.status.charAt(0).toUpperCase() +
                            post.status.slice(1)}
                        </Badge>
                        <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {post.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-brand-500 hover:bg-brand-600"
                  onClick={() => {
                    // TODO: Implement new post action
                  }}
                >
                  Create New Post
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Navigate to calendar
                  }}
                >
                  View Calendar
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Navigate to analytics
                  }}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Navigate to inbox
                  }}
                >
                  Check Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
                    <p>Connect all your social media accounts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
                    <p>Schedule your first post</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
                    <p>View your analytics dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
