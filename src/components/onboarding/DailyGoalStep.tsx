"use client";

import { DAILY_GOAL_PRESETS } from "@/config/onboarding";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export function DailyGoalStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (minutes: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {DAILY_GOAL_PRESETS.map((minutes) => {
          const selected = minutes === value;
          return (
            <button
              key={minutes}
              type="button"
              onClick={() => onChange(minutes)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-3 text-center transition-colors",
                selected
                  ? "border-primary-400 bg-primary-50"
                  : "border-border bg-background hover:border-primary-200"
              )}
            >
              <span className="font-display text-base font-semibold text-foreground">
                {minutes}
              </span>
              <span className="text-[11px] text-muted">min/day</span>
            </button>
          );
        })}
      </div>
      <Input
        type="number"
        label="Or enter a custom goal (minutes)"
        min={5}
        max={240}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    </div>
  );
}
