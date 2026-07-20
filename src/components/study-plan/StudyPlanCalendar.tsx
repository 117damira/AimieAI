"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudyPlanCalendar({ examDate }: { examDate: string | null }) {
  const { t } = useLanguage();
  const initialMonth = examDate ? new Date(examDate) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const todayIso = toIso(new Date());

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first grid: JS getDay() is 0=Sunday, shift so Monday=0.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-base font-semibold text-foreground capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const iso = toIso(date);
          const isExamDay = examDate === iso;
          const isToday = todayIso === iso;
          return (
            <div
              key={iso}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm",
                isExamDay
                  ? "bg-danger-500 font-semibold text-white shadow-sm"
                  : isToday
                    ? "border border-primary-400 text-foreground"
                    : "text-foreground hover:bg-background"
              )}
            >
              <span>{date.getDate()}</span>
              {isExamDay && <span className="text-[9px] font-bold uppercase leading-none">{t.studyPlan.testDay}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
