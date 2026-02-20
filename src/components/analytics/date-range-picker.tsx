"use client";

import { useState } from "react";
import { subDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onChange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
    setShowCustom(false);
  };

  const handleCustomChange = () => {
    if (customFrom && customTo) {
      onChange(customFrom, customTo);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => {
              handlePreset(7);
              setShowCustom(false);
            }}
          >
            Last 7 days
          </Button>
          <Button
            variant={!showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => {
              handlePreset(30);
              setShowCustom(false);
            }}
          >
            Last 30 days
          </Button>
          <Button
            variant={!showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => {
              handlePreset(90);
              setShowCustom(false);
            }}
          >
            Last 90 days
          </Button>
          <Button
            variant={showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCustom(true)}
          >
            Custom
          </Button>
        </div>

        {showCustom && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  From
                </label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  To
                </label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleCustomChange}
              disabled={!customFrom || !customTo}
            >
              Apply
            </Button>
          </div>
        )}

        <div className="text-sm text-slate-600 dark:text-slate-400">
          {from} to {to}
        </div>
      </div>
    </Card>
  );
}
