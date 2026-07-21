"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Input, Button, ToggleRow } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EXAMS } from "@/config/exams";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const { profile, updateProfile } = useUserProfile();
  const { t } = useLanguage();
  const [goalDraft, setGoalDraft] = useState(profile?.dailyGoalMinutes ?? 20);
  const [goalSaved, setGoalSaved] = useState(false);
  if (!profile) return null;

  function handleSaveGoal() {
    updateProfile({ dailyGoalMinutes: goalDraft });
    setGoalSaved(true);
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <PageHeader
        title={t.settings.pageTitle}
        description={t.settings.pageDescription}
      />

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
            min={5}
            max={240}
            value={goalDraft}
            onChange={(e) => {
              setGoalSaved(false);
              setGoalDraft(Number(e.target.value) || 0);
            }}
          />
        </CardContent>
        <CardFooter className="justify-end gap-3">
          {goalSaved && (
            <span className="text-sm font-medium text-success-600">{t.settings.goalSaved}</span>
          )}
          <Button onClick={handleSaveGoal}>{t.settings.saveGoal}</Button>
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
