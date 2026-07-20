"use client";

import Link from "next/link";
import { CalendarClock, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, buttonVariants } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StudyPlanCalendar } from "@/components/study-plan/StudyPlanCalendar";
import { generateStudyPlan } from "@/lib/study-plan/generatePlan";
import { STUDY_PLAN_SKILL_CLASSES } from "@/config/studyPlanColors";
import { cn } from "@/lib/utils/cn";

export default function StudyPlanPage() {
  const { profile } = useUserProfile();
  const { t, language } = useLanguage();

  if (!profile) return null;

  const plan = generateStudyPlan(profile, language);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.studyPlan.pageTitle} description={t.studyPlan.pageDescription} />

      {!profile.examDate && (
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
        <CardContent className="pt-6">
          <StudyPlanCalendar examDate={profile.examDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{t.studyPlan.dailyPlanTitle}</CardTitle>
          </div>
          <CardDescription>{t.studyPlan.dailyPlanDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {plan.map((day) => {
            const dateLabel = new Date(day.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            });
            const isExamDay = profile.examDate === day.date;
            return (
              <div key={day.date} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
                <span
                  className={cn(
                    "w-40 shrink-0 text-sm font-medium capitalize",
                    isExamDay ? "text-danger-600" : "text-foreground"
                  )}
                >
                  {dateLabel}
                  {isExamDay && ` — ${t.studyPlan.testDay}`}
                </span>
                <div className="flex flex-wrap gap-2">
                  {day.tasks.map((task, i) => (
                    <span
                      key={`${day.date}-${task.skill}-${i}`}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium",
                        STUDY_PLAN_SKILL_CLASSES[task.skill]
                      )}
                    >
                      {task.title}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
