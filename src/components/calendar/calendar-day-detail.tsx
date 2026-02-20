"use client";

import { useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/components/posts/post-card";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types/database";

interface CalendarDayDetailProps {
  date: Date;
  posts: Post[];
  onBack?: () => void;
  onAddPost?: (date: Date) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
}

export function CalendarDayDetail({
  date,
  posts,
  onBack,
  onAddPost,
  onEditPost,
  onDeletePost,
}: CalendarDayDetailProps) {
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(new Set());

  const visiblePosts = posts.filter((p) => !deletedPostIds.has(p.id));

  const handleDeletePost = (postId: string) => {
    setDeletedPostIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(postId);
      return newSet;
    });
    onDeletePost?.(postId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {formatDate(date)}
        </h3>
        <Button
          onClick={() => onAddPost?.(date)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>

      {/* Posts List */}
      {visiblePosts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              No posts scheduled for this day
            </p>
            <Button
              onClick={() => onAddPost?.(date)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={onEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {visiblePosts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {visiblePosts.length}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Posts
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {visiblePosts.filter((p) => p.status === "published").length}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Published
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {visiblePosts.filter((p) => p.status === "scheduled").length}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
