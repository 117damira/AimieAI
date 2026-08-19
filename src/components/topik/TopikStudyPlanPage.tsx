"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarDays, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, buttonVariants } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StudyPlanCalendar } from "@/components/study-plan/StudyPlanCalendar";
import { generateTopikStudyPlan } from "@/lib/study-plan/generateTopikPlan";
import { PageHeader } from "@/components/layout/PageHeader";

const RECHECK_INTERVAL_MS = 60_000;

function daysUntil(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** TOPIK-worded equivalent of components/study-plan/ExamCountdown — same
 * visual treatment, but uses t.topik.studyPlan.* copy ("...your TOPIK
 * exam...") instead of the DELF-agnostic-but-still-DELF-flavored original,
 * without touching that shared component. */
function TopikExamCountdown({ examDate }: { examDate: string }) {
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

export function TopikStudyPlanPage() {
  const { profile } = useUserProfile();
  const { t, language } = useLanguage();

  if (!profile) return null;

  const plan = generateTopikStudyPlan(profile, language);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.studyPlan.pageTitle} description={t.studyPlan.pageDescription} />

      {profile.examDate ? (
        <TopikExamCountdown examDate={profile.examDate} />
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary-100 bg-primary-50 px-5 py-4">
          <div className="flex items-center gap-3 text-sm text-primary-700">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100">
              <Info className="h-4 w-4 text-primary-600" />
            </span>
            <div className="flex flex-col">
              <span className="font-medium">{t.studyPlan.noExamDateTitle}</span>
              <span className="text-primary-600">{t.studyPlan.noExamDateDescription}</span>
            </div>
          </div>
          <Link href="/onboarding" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            {t.studyPlan.setExamDateLink}
          </Link>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{t.studyPlan.dailyPlanTitle}</CardTitle>
          </div>
          <CardDescription>{t.studyPlan.dailyPlanDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyPlanCalendar examDate={profile.examDate} plan={plan} />
        </CardContent>
      </Card>
    </div>
  );
}
