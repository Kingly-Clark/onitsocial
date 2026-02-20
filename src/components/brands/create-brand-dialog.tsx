"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/types/database";

interface CreateBrandDialogProps {
  plan?: keyof typeof PLAN_LIMITS;
  used?: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const BRAND_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
];

export function CreateBrandDialog({
  plan = "solo",
  used = 0,
  onSuccess,
  trigger,
}: CreateBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    color: BRAND_COLORS[0],
  });

  const limit = PLAN_LIMITS[plan];
  const isAtLimit = used >= limit;
  const isNearLimit = used >= limit - 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create brand");
      }

      setFormData({ name: "", color: BRAND_COLORS[0] });
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button className="gap-2">
            <span>Add Brand</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Brand</DialogTitle>
        </DialogHeader>

        {isAtLimit && (
          <div className="flex gap-3 rounded-lg bg-amber-50 dark:bg-amber-950 p-3 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">Brand limit reached</p>
              <p>
                You've reached the limit of {limit} brands for your{" "}
                {plan.charAt(0).toUpperCase() + plan.slice(1)} plan.
              </p>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="flex gap-3 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Approaching limit</p>
              <p>
                You have 1 brand slot remaining. Consider upgrading for more.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Brand Name
            </label>
            <Input
              placeholder="My Brand"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isAtLimit || loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Brand Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, color }))
                  }
                  disabled={isAtLimit || loading}
                  className={`h-10 rounded-md border-2 transition-all ${
                    formData.color === color
                      ? "border-slate-900 dark:border-slate-50"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAtLimit || loading || !formData.name.trim()}
              className="gap-2"
            >
              {loading ? "Creating..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Plan usage
            </span>
            <Badge
              variant={isAtLimit ? "destructive" : "secondary"}
            >
              {used} of {limit} brands
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
