"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpenText,
  ListChecks,
  Mic,
  PenLine,
  Flame,
  BarChart3,
  Award,
  History as HistoryIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ProgressBar,
  Badge,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeeklyActivityChart } from "@/components/progress/WeeklyActivityChart";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ActivityLogEntry } from "@/types/user";

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export default function ProgressPage() {
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  if (!profile) return null;

  const { stats } = profile;

  const STATS = [
    { label: t.progress.wordsLearned, value: stats.wordsLearned, icon: BookOpenText },
    { label: t.progress.quizzesCompleted, value: stats.quizzesCompleted, icon: ListChecks },
    { label: t.progress.speakingSessions, value: stats.speakingSessions, icon: Mic },
    { label: t.progress.writingSessions, value: stats.writingSessions, icon: PenLine },
  ];

  const today = new Date();
  const weeklyDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const iso = toIso(date);
    const entriesForDay = stats.history.filter((entry) => entry.date === iso);
    return {
      label: t.weekdaysShort[date.getDay()],
      writing: entriesForDay.filter((e) => e.activity === "writing").length,
      speaking: entriesForDay.filter((e) => e.activity === "speaking").length,
    };
  });

  const overallReadiness = average(stats.history.map((entry) => entry.score));
  const writingReadiness = average(
    stats.history.filter((e) => e.activity === "writing").map((e) => e.score)
  );
  const speakingReadiness = average(
    stats.history.filter((e) => e.activity === "speaking").map((e) => e.score)
  );

  const recentHistory: ActivityLogEntry[] = [...stats.history]
    .reverse()
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.progress.pageTitle}
        description={t.progress.pageDescription}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }, index) => (
          <motion.div
            key={label}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
          >
            <Card className="group h-full transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardContent className="flex flex-col gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-2xl font-semibold text-foreground">
                  {value}
                </span>
                <span className="text-sm text-muted">{label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-[18px] w-[18px] text-warning-500" />
              <CardTitle>{t.progress.currentStreak}</CardTitle>
            </div>
            <CardDescription>
              {t.progress.currentStreakDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-display text-4xl font-semibold text-foreground">
              {stats.currentStreakDays}
              <span className="ml-2 text-base font-normal text-muted">{t.progress.daysUnit}</span>
            </span>
          </CardContent>
        </Card>

        <Card className="transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-[18px] w-[18px] text-warning-600" />
              <CardTitle>{t.progress.estimatedExamReadiness}</CardTitle>
            </div>
            <CardDescription>
              {t.progress.estimatedExamReadinessDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overallReadiness === null ? (
              <p className="text-sm text-muted">
                {t.progress.readinessEmptyState}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <span className="font-display text-4xl font-semibold text-foreground">
                  {overallReadiness}
                  <span className="ml-1 text-base font-normal text-muted">/ 100</span>
                </span>
                <ProgressBar value={overallReadiness} max={100} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{t.progress.weeklyActivity}</CardTitle>
          </div>
          <CardDescription>{t.progress.weeklyActivityDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyActivityChart
            days={weeklyDays}
            writingLabel={t.progress.writingLabel}
            speakingLabel={t.progress.speakingLabel}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.progress.skillBreakdown}</CardTitle>
          <CardDescription>
            {t.progress.skillBreakdownDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <PenLine className="h-4 w-4 text-primary-500" />
                {t.progress.writingLabel}
              </span>
              <span className="text-muted">
                {t.progress.sessionsCount(stats.writingSessions)}
              </span>
            </div>
            {writingReadiness === null ? (
              <p className="text-xs text-muted">{t.progress.noWritingSessions}</p>
            ) : (
              <ProgressBar
                value={writingReadiness}
                max={100}
                showPercentage
                colorClassName="bg-primary-500"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Mic className="h-4 w-4 text-info-600" />
                {t.progress.speakingLabel}
              </span>
              <span className="text-muted">
                {t.progress.sessionsCount(stats.speakingSessions)}
              </span>
            </div>
            {speakingReadiness === null ? (
              <p className="text-xs text-muted">{t.progress.noSpeakingSessions}</p>
            ) : (
              <ProgressBar
                value={speakingReadiness}
                max={100}
                showPercentage
                colorClassName="bg-info-500"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{t.progress.learningHistory}</CardTitle>
          </div>
          <CardDescription>{t.progress.learningHistoryDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentHistory.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-sm text-muted">
              {t.progress.historyEmptyState}
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentHistory.map((entry, index) => (
                <li
                  key={`${entry.date}-${index}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        entry.activity === "writing"
                          ? "flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
                          : "flex h-9 w-9 items-center justify-center rounded-xl bg-info-50 text-info-600"
                      }
                    >
                      {entry.activity === "writing" ? (
                        <PenLine className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {entry.activity === "writing"
                          ? t.progress.writingPracticeEntry
                          : t.progress.speakingPracticeEntry}
                      </span>
                      <span className="text-xs text-muted">{entry.date}</span>
                    </div>
                  </div>
                  <Badge variant="neutral">{entry.score} / 100</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
