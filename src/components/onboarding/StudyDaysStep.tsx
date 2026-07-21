"use client";

import { useRef } from "react";
import { Flame } from "lucide-react";
import { STUDY_DAY_ORDER, STUDY_DAY_WEEKDAY_INDEX } from "@/config/onboarding";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StudyDay } from "@/types/user";

export function StudyDaysStep({
  value,
  onChange,
}: {
  value: StudyDay[];
  onChange: (days: StudyDay[]) => void;
}) {
  const { t } = useLanguage();
  // Remembers the manual selection from before "Every Day" was toggled on,
  // so toggling it off restores it instead of leaving zero days selected.
  const lastManualSelection = useRef<StudyDay[]>(
    value.length < STUDY_DAY_ORDER.length ? value : ["mon"]
  );
  const isEveryDay = value.length === STUDY_DAY_ORDER.length;

  function toggleDay(day: StudyDay) {
    const next = value.includes(day)
      ? value.filter((d) => d !== day)
      : [...value, day];
    if (next.length === 0) return; // at least one day must always be selected
    lastManualSelection.current = next;
    onChange(next);
  }

  function toggleEveryDay() {
    if (isEveryDay) {
      onChange(lastManualSelection.current.length > 0 ? lastManualSelection.current : ["mon"]);
    } else {
      lastManualSelection.current = value;
      onChange([...STUDY_DAY_ORDER]);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-center gap-3">
        {STUDY_DAY_ORDER.map((day) => {
          const selected = value.includes(day);
          const label = t.weekdaysShort[STUDY_DAY_WEEKDAY_INDEX[day]];
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={selected}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 transition-smooth",
                selected
                  ? "border-primary-400 bg-primary-500 text-white shadow-card-hover"
                  : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={toggleEveryDay}
        aria-pressed={isEveryDay}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 transition-smooth",
          isEveryDay
            ? "border-primary-400 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-card-hover"
            : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
        )}
      >
        <Flame className="h-4 w-4" />
        {t.onboarding.everyDayIntensive}
      </button>
    </div>
  );
}
