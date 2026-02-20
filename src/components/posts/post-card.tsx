"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Edit2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime, getPlatformColor } from "@/lib/utils";
import { PLATFORMS } from "@/types/database";
import type { Post } from "@/types/database";

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onClick?: (post: Post) => void;
}

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function PostCard({
  post,
  onEdit,
  onDelete,
  onClick,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get content to display
  const getDisplayContent = () => {
    const firstPlatform = post.platforms[0];
    return post.content[firstPlatform] || post.content[Object.keys(post.content)[0]] || "";
  };

  const displayContent = getDisplayContent();
  const truncatedContent = expanded ? displayContent : displayContent.substring(0, 150);

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");
      onDelete?.(post.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  // Get platform info
  const platformInfo = post.platforms.map((p) => {
    const platform = PLATFORMS.find((pl) => pl.id === p);
    return platform || { id: p, label: p, color: "#999" };
  });

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:bg-slate-50 dark:hover:bg-slate-900"
      )}
      onClick={() => !showActions && onClick?.(post)}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* Status and Date */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={cn(
                  "text-xs font-semibold",
                  STATUS_COLORS[post.status]
                )}
                variant="secondary"
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>

              {post.status === "scheduled" && post.scheduled_for && (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {formatDate(post.scheduled_for)}
                </span>
              )}

              {post.status === "published" && post.published_at && (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {formatRelativeTime(post.published_at)}
                </span>
              )}
            </div>

            {/* Platforms */}
            <div className="flex items-center gap-1 flex-wrap">
              {platformInfo.map((platform) => (
                <Badge
                  key={platform.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: platform.color,
                    color: platform.color,
                  }}
                >
                  {platform.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-10">
                {post.status === "draft" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(post);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 first:rounded-t-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                )}

                {post.status === "published" &&
                  post.platform_post_urls &&
                  Object.entries(post.platform_post_urls).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on {platform}
                    </a>
                  ))}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowActions(false);
                  }}
                  disabled={deleting}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 last:rounded-b-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {truncatedContent}
            {displayContent.length > 150 && !expanded && "..."}
          </p>

          {displayContent.length > 150 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Media Preview */}
        {post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.media_urls.slice(0, 4).map((url, index) => (
              <div key={index} className="relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-16 object-cover"
                  onError={(e) => {
                    // Handle broken image URLs
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3C/svg%3E";
                  }}
                />
                {index === 3 && post.media_urls.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      +{post.media_urls.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Location */}
        {post.location && (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            📍 {typeof post.location === "object" ? post.location.name : post.location}
          </p>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>Posted {formatRelativeTime(post.created_at)}</span>
          {post.status === "scheduled" && post.scheduled_for && (
            <span>Scheduled for {formatDate(post.scheduled_for)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
