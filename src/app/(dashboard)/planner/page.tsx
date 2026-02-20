"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
    setRefreshKey((prev) => prev + 1);
  };

  if (!activeBrandId) {
    return (
      <DashboardShell title="Planner" subtitle="Create and schedule content">
        <div className="flex items-center justify-center min-h-[60vh] p-6">
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
      </DashboardShell>
    );
  }

  return (
    <DashboardShell 
      title="Planner" 
      subtitle={activeBrand?.name ? `Create content for ${activeBrand.name}` : "Create and schedule content"}
    >
      <div className="space-y-6 p-6">
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
    </DashboardShell>
  );
}
