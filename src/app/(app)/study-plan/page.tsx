"use client";

import Link from "next/link";
import { CalendarClock, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, buttonVariants } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StudyPlanCalendar } from "@/components/study-plan/StudyPlanCalendar";
import { ExamCountdown } from "@/components/study-plan/ExamCountdown";
import { generateStudyPlan } from "@/lib/study-plan/generatePlan";

export default function StudyPlanPage() {
  const { profile } = useUserProfile();
  const { t, language } = useLanguage();

  if (!profile) return null;

  const plan = generateStudyPlan(profile, language);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.studyPlan.pageTitle} description={t.studyPlan.pageDescription} />

      {profile.examDate ? (
        <ExamCountdown examDate={profile.examDate} />
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-primary-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-primary-700">
            <Info className="h-4 w-4 shrink-0" />
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
