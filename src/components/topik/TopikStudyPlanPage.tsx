"use client";

import Link from "next/link";
import { CalendarClock, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, buttonVariants } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StudyPlanCalendar } from "@/components/study-plan/StudyPlanCalendar";
import { generateTopikStudyPlan } from "@/lib/study-plan/generateTopikPlan";
import { PageHeader } from "@/components/layout/PageHeader";
import { TopikExamCountdown } from "@/components/topik/TopikExamCountdown";

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
