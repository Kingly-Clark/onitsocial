"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  MessageSquare,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
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
import type { Post, InboxMessage } from "@/types/database";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const platformColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
  facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  linkedin: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  twitter: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
  youtube: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  tiktok: "bg-black text-white dark:bg-gray-800 dark:text-white",
  google_business: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded bg-slate-200 dark:bg-slate-700", className)} />
);

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { accounts, activeBrandId, getActiveBrand } = useBrandStore();
  const activeBrand = getActiveBrand();

  const [posts, setPosts] = useState<Post[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName = user?.full_name || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    const fetchData = async () => {
      if (!activeBrandId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [postsRes, inboxRes] = await Promise.all([
          fetch(`/api/posts?brandId=${activeBrandId}&limit=10&offset=0`),
          fetch(`/api/inbox?brand_id=${activeBrandId}`),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(Array.isArray(postsData) ? postsData : []);
        }

        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          const messages: InboxMessage[] = inboxData.messages || [];
          const unread = messages.filter((m) => !m.is_read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeBrandId]);

  const connectedAccountsCount = accounts.filter(
    (a) => a.brand_id === activeBrandId && a.status === "active"
  ).length;

  const postsThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return posts.filter((p) => new Date(p.created_at) >= startOfMonth).length;
  }, [posts]);

  const stats: StatCard[] = [
    {
      title: "Connected Platforms",
      value: connectedAccountsCount,
      icon: <Zap className="h-6 w-6" />,
      description: connectedAccountsCount === 0 ? "Connect accounts to get started" : "Active connections",
    },
    {
      title: "Posts This Month",
      value: postsThisMonth,
      icon: <FileText className="h-6 w-6" />,
      description: postsThisMonth === 0 ? "Create your first post" : "Posts created",
    },
    {
      title: "Unread Messages",
      value: unreadCount,
      icon: <MessageSquare className="h-6 w-6" />,
      description: unreadCount === 0 ? "All caught up!" : "Awaiting response",
    },
    {
      title: "Recent Posts",
      value: posts.length,
      icon: <Users className="h-6 w-6" />,
      description: "Latest content",
    },
  ];

  const recentPosts = posts.slice(0, 5);

  const formatPostDate = (post: Post) => {
    if (post.published_at) {
      const date = new Date(post.published_at);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString();
    }
    if (post.scheduled_for) {
      const date = new Date(post.scheduled_for);
      return `Scheduled for ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return "Draft";
  };

  const getPostTitle = (post: Post) => {
    const content = post.content;
    if (typeof content === "object" && content !== null) {
      const firstContent = Object.values(content)[0];
      if (typeof firstContent === "string") {
        return firstContent.length > 60 ? firstContent.substring(0, 60) + "..." : firstContent;
      }
    }
    return "Untitled post";
  };

  const hasNoAccounts = connectedAccountsCount === 0;
  const hasNoBrand = !activeBrandId;

  return (
    <DashboardShell
      title="Dashboard"
      subtitle={`${greeting}, ${userName}!${activeBrand ? ` Here's what's happening with "${activeBrand.name}".` : ""}`}
    >
      <div className="space-y-8 p-6">
        {hasNoBrand ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                No Brand Selected
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md">
                Please select a brand from the sidebar or create a new one to get started.
              </p>
              <Button onClick={() => router.push("/brands")}>
                Manage Brands
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {hasNoAccounts && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                    <LinkIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                      Connect your social accounts
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Link your social media accounts to start scheduling posts and viewing analytics.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
                    onClick={() => router.push(`/brands/${activeBrandId}/settings`)}
                  >
                    Connect Accounts
                  </Button>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-10 rounded-md" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <div className="flex gap-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                              </div>
                            </div>
                            <Skeleton className="h-5 w-20" />
                          </div>
                        ))}
                      </div>
                    ) : recentPosts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          No posts yet
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          Create your first post to get started
                        </p>
                        <Button size="sm" onClick={() => router.push("/planner")}>
                          Create Post
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentPosts.map((post) => (
                          <div
                            key={post.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                          >
                            <div className="flex-1 space-y-2">
                              <p className="font-medium text-slate-900 dark:text-slate-50">
                                {getPostTitle(post)}
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
                                      platform.slice(1).replace("_", " ")}
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
                                {formatPostDate(post)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full bg-brand-500 hover:bg-brand-600"
                      onClick={() => router.push("/planner")}
                    >
                      Create New Post
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/calendar")}
                    >
                      View Calendar
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/analytics")}
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/inbox")}
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
                        <div className={cn(
                          "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                          connectedAccountsCount > 0 ? "bg-green-500" : "bg-slate-300"
                        )} />
                        <p className={connectedAccountsCount > 0 ? "line-through opacity-60" : ""}>
                          Connect all your social media accounts
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                          posts.length > 0 ? "bg-green-500" : "bg-slate-300"
                        )} />
                        <p className={posts.length > 0 ? "line-through opacity-60" : ""}>
                          Schedule your first post
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 flex-shrink-0" />
                        <p>View your analytics dashboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
