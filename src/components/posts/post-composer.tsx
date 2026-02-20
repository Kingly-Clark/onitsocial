"use client";

import { useState, useRef } from "react";
import { Smile, Upload, MapPin, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBrandStore } from "@/store/brand-store";
import { PLATFORMS } from "@/types/database";
import type { Platform } from "@/types/database";

interface PostComposerProps {
  onSuccess?: () => void;
}

const CHARACTER_LIMITS: Record<Platform, number> = {
  facebook: 63206,
  instagram: 2200,
  tiktok: 2200,
  youtube: 5000,
  linkedin: 3000,
  google_business: 2200,
};

export function PostComposer({ onSuccess }: PostComposerProps) {
  const { activeBrandId, accounts } = useBrandStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [content, setContent] = useState<Record<Platform, string>>({} as Record<Platform, string>);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [publishingMode, setPublishingMode] = useState<"draft" | "scheduled" | "publish">("draft");
  const [perPlatformMode, setPerPlatformMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Get connected platforms for active brand
  const connectedPlatforms = accounts
    .map((acc) => acc.platform)
    .filter((platform, index, arr) => arr.indexOf(platform) === index);

  // Helper to get character count for primary platform
  const getPrimaryCharacterCount = () => {
    if (selectedPlatforms.length === 0) return 0;
    const firstPlatform = selectedPlatforms[0];
    return (content[firstPlatform] || "").length;
  };

  // Helper to check if any platform would exceed limit
  const hasExceededLimit = () => {
    return selectedPlatforms.some((platform) => {
      const platformContent = perPlatformMode
        ? content[platform] || ""
        : content[selectedPlatforms[0]] || "";
      return platformContent.length > CHARACTER_LIMITS[platform];
    });
  };

  // Handle platform selection
  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // Handle content change
  const handleContentChange = (value: string) => {
    if (perPlatformMode) {
      // In per-platform mode, update only for primary platform
      setContent((prev) => ({
        ...prev,
        [selectedPlatforms[0]]: value,
      }));
    } else {
      // In shared mode, update primary platform
      setContent((prev) => ({
        ...prev,
        [selectedPlatforms[0]]: value,
      }));
    }
  };

  // Handle file upload
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setMessage({ type: "error", text: "Only image and video files are supported" });
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewImages((prev) => [...prev, url]);

      // In production, upload file and get URL
      // For now, just use the object URL
      setMediaUrls((prev) => [...prev, url]);
    });
  };

  // Remove media
  const removeMedia = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle publish
  const handlePublish = async () => {
    if (!activeBrandId || selectedPlatforms.length === 0) {
      setMessage({ type: "error", text: "Select platforms to publish to" });
      return;
    }

    const primaryContent = content[selectedPlatforms[0]] || "";
    if (!primaryContent.trim()) {
      setMessage({ type: "error", text: "Add content to your post" });
      return;
    }

    if (hasExceededLimit()) {
      setMessage({ type: "error", text: "Content exceeds character limit for selected platform(s)" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Build content object
      const postContent = perPlatformMode
        ? { ...content }
        : selectedPlatforms.reduce((acc, platform) => {
            acc[platform] = primaryContent;
            return acc;
          }, {} as Record<Platform, string>);

      // Determine status and scheduledFor
      let status = "draft";
      let scheduledFor = null;

      if (publishingMode === "publish") {
        status = "published";
      } else if (publishingMode === "scheduled") {
        status = "scheduled";
        scheduledFor = `${scheduledDate}T${scheduledTime}:00`;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: activeBrandId,
          content: postContent,
          mediaUrls,
          platforms: selectedPlatforms,
          status,
          scheduledFor,
          location: location || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      setMessage({
        type: "success",
        text:
          publishingMode === "publish"
            ? "Post published successfully!"
            : publishingMode === "scheduled"
              ? "Post scheduled successfully!"
              : "Post saved as draft!",
      });

      // Reset form
      setSelectedPlatforms([]);
      setContent({} as Record<Platform, string>);
      setMediaUrls([]);
      setPreviewImages([]);
      setLocation("");
      setShowScheduler(false);
      setScheduledDate("");
      setScheduledTime("09:00");
      setPublishingMode("draft");
      setPerPlatformMode(false);

      onSuccess?.();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create post",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the content to display
  const displayContent = perPlatformMode
    ? content[selectedPlatforms[0]] || ""
    : content[selectedPlatforms[0]] || "";

  return (
    <Card className="bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle>Compose Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Messages */}
        {message && (
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg",
              message.type === "success"
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Platform Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Select Platforms
          </label>
          {connectedPlatforms.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No connected platforms. Go to brand settings to connect your social accounts.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.filter((platform) => connectedPlatforms.includes(platform.id)).map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);

                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all",
                      isSelected
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <span className="text-sm font-medium">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedPlatforms.length > 0 && (
          <>
            {/* Per-Platform Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Customize per platform
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Different content for each platform
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPerPlatformMode(!perPlatformMode)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  perPlatformMode
                    ? "bg-brand-500"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                    perPlatformMode && "translate-x-5"
                  )}
                />
              </button>
            </div>

            {/* Text Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Content
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {displayContent.length} /{" "}
                    {CHARACTER_LIMITS[selectedPlatforms[0]]}
                  </span>
                  {displayContent.length > CHARACTER_LIMITS[selectedPlatforms[0]] && (
                    <Badge variant="destructive">Over limit</Badge>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="What's on your mind?"
                value={displayContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-32 resize-none"
                maxLength={Math.max(...selectedPlatforms.map((p) => CHARACTER_LIMITS[p]))}
              />
            </div>

            {/* Per-Platform Content Display */}
            {perPlatformMode && selectedPlatforms.length > 1 && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Platform-specific content preview
                </p>
                <div className="grid gap-3">
                  {selectedPlatforms.map((platform) => (
                    <div key={platform} className="space-y-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {PLATFORMS.find((p) => p.id === platform)?.label}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {content[platform] || "(Same as default)"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Media (Images & Videos)
              </label>
              <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Click to upload or drag files
                  </span>
                </button>
              </div>

              {/* Media Preview */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previewImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                      >
                        <span className="text-white text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="grid gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Location (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  title="Emoji picker (placeholder)"
                >
                  <Smile className="h-4 w-4" />
                  Emoji
                </Button>
              </div>
            </div>

            {/* Schedule Options */}
            {showScheduler && (
              <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Publishing Actions */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPublishingMode("draft");
                    handlePublish();
                  }}
                  variant="secondary"
                  disabled={loading || selectedPlatforms.length === 0}
                  className="flex-1 gap-2"
                >
                  {loading && publishingMode === "draft" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save Draft
                </Button>

                <Button
                  onClick={() => {
                    setPublishingMode("scheduled");
                    if (!showScheduler) {
                      setShowScheduler(true);
                    } else {
                      handlePublish();
                    }
                  }}
                  variant="outline"
                  disabled={loading || selectedPlatforms.length === 0}
                  className="gap-2"
                >
                  {loading && publishingMode === "scheduled" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Schedule
                </Button>

                <Button
                  onClick={() => {
                    setPublishingMode("publish");
                    handlePublish();
                  }}
                  disabled={
                    loading ||
                    selectedPlatforms.length === 0 ||
                    hasExceededLimit()
                  }
                  className="flex-1 gap-2"
                >
                  {loading && publishingMode === "publish" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Post Now
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
