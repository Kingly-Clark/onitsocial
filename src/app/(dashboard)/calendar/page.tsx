"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Grid3x3, List, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarDayDetail } from "@/components/calendar/calendar-day-detail";
import { PostList } from "@/components/posts/post-list";
import { useBrandStore } from "@/store/brand-store";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/database";

export default function CalendarPage() {
  const { activeBrandId, getActiveBrand } = useBrandStore();
  const router = useRouter();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayPosts, setSelectedDayPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const activeBrand = getActiveBrand();

  useEffect(() => {
    if (!activeBrandId) {
      router.push("/dashboard");
    }
  }, [activeBrandId, router]);

  // Fetch posts for the brand
  useEffect(() => {
    if (!activeBrandId) return;

    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/posts?brandId=${activeBrandId}&limit=500&offset=0`
        );
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        setPosts(data.data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [activeBrandId]);

  const handleDaySelect = (date: Date, dayPosts: Post[]) => {
    setSelectedDate(date);
    setSelectedDayPosts(dayPosts);
    if (view === "calendar") {
      setView("list");
    }
  };

  const handleBackToCalendar = () => {
    setView("calendar");
    setSelectedDate(null);
    setSelectedDayPosts([]);
  };

  if (!activeBrandId) {
    return (
      <DashboardShell title="Calendar" subtitle="Manage your content schedule">
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              No Brand Selected
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Please select a brand to view its calendar
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell 
      title="Calendar" 
      subtitle={activeBrand?.name ? `Content schedule for ${activeBrand.name}` : "Manage your content schedule"}
    >
      <div className="space-y-6 p-6">
        {/* View Toggle */}
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => setView("calendar")}
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            onClick={() => setView("list")}
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 mx-auto text-slate-600 dark:text-slate-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Loading calendar...
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {view === "calendar" ? (
              <CalendarView
                posts={posts}
                onDaySelect={handleDaySelect}
                selectedDate={selectedDate || undefined}
              />
            ) : selectedDate ? (
              <CalendarDayDetail
                date={selectedDate}
                posts={selectedDayPosts}
                onBack={handleBackToCalendar}
                onAddPost={(date) => {
                  // Navigate to planner with date pre-filled
                  // This would require enhanced planner component
                  router.push("/planner");
                }}
              />
            ) : (
              <PostList />
            )}
          </div>

          {/* Sidebar - Show day detail or stats on large screens */}
          {view === "calendar" && (
            <div className="hidden lg:block sticky top-20">
              {selectedDate ? (
                <CalendarDayDetail
                  date={selectedDate}
                  posts={selectedDayPosts}
                  onBack={handleBackToCalendar}
                  onAddPost={(date) => {
                    router.push("/planner");
                  }}
                />
              ) : (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select a day to view and manage posts
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </DashboardShell>
  );
}
