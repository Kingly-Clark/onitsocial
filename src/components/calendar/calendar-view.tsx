"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlatformColor } from "@/lib/utils";
import type { Post } from "@/types/database";

interface CalendarViewProps {
  posts: Post[];
  onDaySelect?: (date: Date, dayPosts: Post[]) => void;
  onPostClick?: (post: Post) => void;
  selectedDate?: Date;
}

export function CalendarView({
  posts,
  onDaySelect,
  onPostClick,
  selectedDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all days for current month with padding for previous/next month days
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Pad with days from previous month
    const firstDayOfWeek = start.getDay();
    const previousMonthDays: Date[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(start);
      date.setDate(date.getDate() - (i + 1));
      previousMonthDays.push(date);
    }

    // Pad with days from next month
    const lastDayOfWeek = end.getDay();
    const nextMonthDays: Date[] = [];
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(end);
      date.setDate(date.getDate() + i);
      nextMonthDays.push(date);
    }

    return [...previousMonthDays.reverse(), ...days, ...nextMonthDays];
  }, [currentMonth]);

  // Get posts for a specific day
  const getPostsForDay = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return posts.filter((post) => {
      if (post.status === "scheduled" && post.scheduled_for) {
        const postDate = new Date(post.scheduled_for);
        return postDate >= dayStart && postDate <= dayEnd;
      }
      if (post.status === "published" && post.published_at) {
        const postDate = new Date(post.published_at);
        return postDate >= dayStart && postDate <= dayEnd;
      }
      return false;
    });
  };

  // Get unique platforms for a day
  const getPlatformsForDay = (date: Date) => {
    const dayPosts = getPostsForDay(date);
    const platforms = new Set<string>();
    dayPosts.forEach((post) => {
      post.platforms.forEach((p) => platforms.add(p));
    });
    return Array.from(platforms);
  };

  // Navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  // Day click handler
  const handleDayClick = (date: Date) => {
    const dayPosts = getPostsForDay(date);
    onDaySelect?.(date, dayPosts);
  };

  return (
    <div className="space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePreviousMonth}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            onClick={handleToday}
            variant="outline"
            size="sm"
          >
            Today
          </Button>
          <Button
            onClick={handleNextMonth}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {monthDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const dayPosts = getPostsForDay(date);
            const dayPlatforms = getPlatformsForDay(date);

            return (
              <button
                key={index}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-start p-1 sm:p-2 border-b border-r border-slate-200 dark:border-slate-800 text-xs sm:text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                  !isCurrentMonth && "bg-slate-50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600",
                  isTodayDate && isCurrentMonth && "bg-blue-50 dark:bg-blue-950/30",
                  isSelected && "bg-brand-100 dark:bg-brand-950/30 ring-2 ring-brand-500"
                )}
              >
                {/* Date Number */}
                <span
                  className={cn(
                    "font-semibold mb-1",
                    isTodayDate && isCurrentMonth && "text-blue-600 dark:text-blue-400"
                  )}
                >
                  {format(date, "d")}
                </span>

                {/* Platform Indicators */}
                {dayPlatforms.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayPlatforms.slice(0, 3).map((platform) => (
                      <div
                        key={platform}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getPlatformColor(platform) }}
                        title={platform}
                      />
                    ))}
                    {dayPlatforms.length > 3 && (
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"
                        title={`+${dayPlatforms.length - 3} more`}
                      />
                    )}
                  </div>
                )}

                {/* Post Count */}
                {dayPosts.length > 0 && (
                  <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
