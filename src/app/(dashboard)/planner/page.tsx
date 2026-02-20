"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { PostComposer } from "@/components/posts/post-composer";
import { PostList } from "@/components/posts/post-list";
import { useBrandStore } from "@/store/brand-store";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const { activeBrandId, getActiveBrand } = useBrandStore();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const activeBrand = getActiveBrand();

  useEffect(() => {
    if (!activeBrandId) {
      router.push("/dashboard");
    }
  }, [activeBrandId, router]);

  const handlePostSuccess = () => {
    // Trigger PostList to refresh
    setRefreshKey((prev) => prev + 1);
  };

  if (!activeBrandId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            No Brand Selected
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please select a brand to start planning content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Content Planner
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {activeBrand?.name && (
            <>
              Create and schedule content for <span className="font-semibold">{activeBrand.name}</span>
            </>
          )}
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Post Composer - Takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          <PostComposer onSuccess={handlePostSuccess} />
        </div>

        {/* Post List - Takes 1/3 on large screens */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <PostList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
