"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StudyPlanDay } from "@/lib/study-plan/generatePlan";
import { STUDY_PLAN_SKILL_CLASSES } from "@/config/studyPlanColors";

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_TASKS = 2;

export function StudyPlanCalendar({
  examDate,
  plan,
}: {
  examDate: string | null;
  plan: StudyPlanDay[];
}) {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const initialMonth = examDate ? new Date(examDate) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const planByDate = new Map(plan.map((day) => [day.date, day]));
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-lg font-semibold text-foreground capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <motion.div
        key={`${year}-${month}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-7 gap-1.5"
      >
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const iso = toIso(date);
          const isExamDay = examDate === iso;
          const isToday = todayIso === iso;
          const day = planByDate.get(iso);
          const tasks = day?.tasks ?? [];
          const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS);
          const hiddenCount = tasks.length - visibleTasks.length;

          return (
            <div
              key={iso}
              className={cn(
                "flex min-h-[96px] flex-col gap-1 rounded-xl border p-2 text-sm transition-colors duration-200 sm:min-h-[108px]",
                isExamDay
                  ? "border-danger-500 bg-danger-500 text-white shadow-card"
                  : isToday
                    ? "border-primary-300 bg-primary-50/70"
                    : "border-border/60 hover:border-border hover:bg-background"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center font-medium leading-none",
                  isExamDay
                    ? "px-0.5 font-semibold"
                    : isToday
                      ? "h-5 w-5 rounded-full bg-primary-500 text-[11px] font-semibold text-white"
                      : "px-0.5 text-foreground"
                )}
              >
                {date.getDate()}
              </span>
              {isExamDay ? (
                <span className="px-0.5 text-[9px] font-bold uppercase tracking-wide leading-none text-white/90">
                  {t.studyPlan.testDay}
                </span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {visibleTasks.map((task, taskIndex) => (
                    <span
                      key={`${iso}-${task.skill}-${taskIndex}`}
                      className={cn(
                        "truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight",
                        STUDY_PLAN_SKILL_CLASSES[task.skill]
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <span className="px-1.5 pt-0.5 text-[10px] font-medium text-muted">
                      {t.studyPlan.moreTasksLabel(hiddenCount)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
