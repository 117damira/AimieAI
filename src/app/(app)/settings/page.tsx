"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Input, Button, ToggleRow } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EXAMS } from "@/config/exams";
import { APP_NAME } from "@/config/app";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <PageHeader
        title={t.settings.pageTitle}
        description={t.settings.pageDescription}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.account}</CardTitle>
          <CardDescription>{t.settings.accountDescription(APP_NAME)}</CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Input label={t.settings.email} type="email" defaultValue={profile.email} disabled />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.dailyGoal}</CardTitle>
          <CardDescription>
            {t.settings.dailyGoalDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Input
            label={t.settings.minutesPerDay}
            type="number"
            defaultValue={profile.dailyGoalMinutes}
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled>{t.settings.saveGoal}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.exam}</CardTitle>
          <CardDescription>{t.settings.examDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {Object.values(EXAMS).map((exam) => (
            <div
              key={exam.id}
              className={cn(
                "flex min-w-[140px] flex-col items-center gap-2.5 rounded-2xl border px-5 py-5 transition-all duration-200 ease-out",
                exam.id === profile.examId
                  ? "border-primary-300 bg-primary-50 shadow-sm"
                  : "border-border bg-background opacity-60 hover:opacity-80"
              )}
            >
              <span className="font-display font-semibold text-foreground">
                {exam.name}
              </span>
              <Badge variant={exam.id === profile.examId ? "primary" : "neutral"}>
                {exam.id === profile.examId
                  ? t.settings.selected
                  : exam.isActive
                    ? t.settings.available
                    : t.settings.comingSoon}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.notifications}</CardTitle>
          <CardDescription>{t.settings.notificationsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          <ToggleRow
            title={t.notifications.dailyReminder.title}
            description={t.notifications.dailyReminder.description}
            enabled
          />
          <ToggleRow
            title={t.notifications.weeklySummary.title}
            description={t.notifications.weeklySummary.description}
            enabled
          />
          <ToggleRow
            title={t.notifications.productUpdates.title}
            description={t.notifications.productUpdates.description}
            enabled={false}
          />
        </CardContent>
      </Card>

    </div>
  );
}
