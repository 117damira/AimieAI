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

/**
 * TOPIK-worded equivalent of components/study-plan/ExamCountdown — same
 * visual treatment, but uses t.topik.studyPlan.* copy ("...your TOPIK
 * exam...") instead of the DELF-agnostic-but-still-DELF-flavored original,
 * without touching that shared component. Extracted out of
 * TopikStudyPlanPage so the Dashboard's "What do I need to know?" section
 * can reuse the exact same countdown (same profile.examDate, same logic)
 * instead of building a second exam-date system.
 */
export function TopikExamCountdown({ examDate }: { examDate: string }) {
  const { t } = useLanguage();
  const [days, setDays] = useState(() => daysUntil(examDate));
  const [lastExamDate, setLastExamDate] = useState(examDate);

  if (examDate !== lastExamDate) {
    setLastExamDate(examDate);
    setDays(daysUntil(examDate));
  }

  useEffect(() => {
    const id = setInterval(() => setDays(daysUntil(examDate)), RECHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [examDate]);

  const label =
    days > 0
      ? t.topik.studyPlan.daysUntilExam(days)
      : days === 0
        ? t.topik.studyPlan.examTodayLabel
        : t.topik.studyPlan.examPastLabel;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary-900 to-primary-800 px-6 py-5 text-white shadow-card">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
        <CalendarDays className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">{label}</span>
    </div>
  );
}
