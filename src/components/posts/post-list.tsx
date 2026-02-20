"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
import { useBrandStore } from "@/store/brand-store";
import type { Post, PostStatus } from "@/types/database";

interface PostListProps {
  onEditPost?: (post: Post) => void;
  onPostsLoaded?: (posts: Post[]) => void;
}

type TabValue = "all" | "scheduled" | "published" | "drafts" | "failed";

const TABS: { value: TabValue; label: string; status?: PostStatus }[] = [
  { value: "all", label: "All Posts" },
  { value: "drafts", label: "Drafts", status: "draft" },
  { value: "scheduled", label: "Scheduled", status: "scheduled" },
  { value: "published", label: "Published", status: "published" },
  { value: "failed", label: "Failed", status: "failed" },
];

export function PostList({ onEditPost, onPostsLoaded }: PostListProps) {
  const { activeBrandId } = useBrandStore();
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const limit = 20;

  // Fetch posts
  const fetchPosts = async (newOffset: number = 0) => {
    if (!activeBrandId) return;

    setLoading(true);
    setError(null);

    try {
      const statusFilter =
        activeTab === "all"
          ? ""
          : `&status=${TABS.find((t) => t.value === activeTab)?.status}`;

      const response = await fetch(
        `/api/posts?brandId=${activeBrandId}&limit=${limit}&offset=${newOffset}${statusFilter}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(newOffset === 0 ? data.data : [...posts, ...data.data]);
      setOffset(newOffset + limit);
      setHasMore(data.count > newOffset + limit);
      onPostsLoaded?.(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when brand or tab changes
  useEffect(() => {
    setOffset(0);
    fetchPosts(0);
  }, [activeBrandId, activeTab]);

  // Handle post deletion
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Get current tab's posts
  const currentPosts =
    activeTab === "all"
      ? posts
      : posts.filter((p) => {
          const tabStatus = TABS.find((t) => t.value === activeTab)?.status;
          return tabStatus ? p.status === tabStatus : true;
        });

  // Loading skeleton
  const PostSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800"
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-5">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="space-y-4 mt-4"
          >
            {/* Loading State */}
            {loading && currentPosts.length === 0 ? (
              <PostSkeleton />
            ) : error && currentPosts.length === 0 ? (
              /* Error State */
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : currentPosts.length === 0 ? (
              /* Empty State */
              <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {activeTab === "all"
                    ? "No posts yet. Create your first post to get started!"
                    : `No ${tab.label.toLowerCase()} yet.`}
                </p>
              </div>
            ) : (
              /* Posts Grid */
              <>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {currentPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={onEditPost}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => fetchPosts(offset)}
                      disabled={loading}
                      variant="outline"
                      className="gap-2"
                    >
                      {loading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
