"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const RECHECK_INTERVAL_MS = 60_000;

function daysUntil(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Recomputes on an interval (not just on mount) so the count rolls over
 * automatically at midnight for a tab left open, with no reload needed. */
export function ExamCountdown({ examDate }: { examDate: string }) {
  const { t } = useLanguage();
  const [days, setDays] = useState(() => daysUntil(examDate));
  const [lastExamDate, setLastExamDate] = useState(examDate);

  // Recomputes immediately if examDate itself changes (adjusting state
  // during render, per React's own guidance, rather than in an effect).
  if (examDate !== lastExamDate) {
    setLastExamDate(examDate);
    setDays(daysUntil(examDate));
  }

  useEffect(() => {
    const id = setInterval(() => setDays(daysUntil(examDate)), RECHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [examDate]);

  const label = days > 0 ? t.studyPlan.daysUntilExam(days) : days === 0 ? t.studyPlan.examTodayLabel : t.studyPlan.examPastLabel;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-primary-900/90 px-5 py-4 text-white shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <CalendarDays className="h-5 w-5" />
      </span>
      <span className="font-display text-base font-semibold sm:text-lg">{label}</span>
    </div>
  );
}
