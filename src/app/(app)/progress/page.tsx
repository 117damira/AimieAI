"use client";

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
  if (!profile) return null;

  const { stats } = profile;

  const STATS = [
    { label: "Words learned", value: stats.wordsLearned, icon: BookOpenText },
    { label: "Quizzes completed", value: stats.quizzesCompleted, icon: ListChecks },
    { label: "Speaking sessions", value: stats.speakingSessions, icon: Mic },
    { label: "Writing sessions", value: stats.writingSessions, icon: PenLine },
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
        title="Progress"
        description="Track how your DELF preparation is coming along."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-semibold text-foreground">
                {value}
              </span>
              <span className="text-sm text-muted">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-[18px] w-[18px] text-warning-500" />
              <CardTitle>Current streak</CardTitle>
            </div>
            <CardDescription>
              Consecutive days of practice — don&apos;t break the chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-display text-4xl font-semibold text-foreground">
              {stats.currentStreakDays}
              <span className="ml-2 text-base font-normal text-muted">days</span>
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-[18px] w-[18px] text-warning-600" />
              <CardTitle>Estimated exam readiness</CardTitle>
            </div>
            <CardDescription>
              Average AI-evaluated score across your writing and speaking sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overallReadiness === null ? (
              <p className="text-sm text-muted">
                Complete a Writing or Speaking session to see your readiness estimate.
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
            <CardTitle>Weekly activity</CardTitle>
          </div>
          <CardDescription>Sessions completed over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyActivityChart days={weeklyDays} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill breakdown</CardTitle>
          <CardDescription>
            Exam readiness by skill, based on your session history.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <PenLine className="h-4 w-4 text-primary-500" />
                Writing
              </span>
              <span className="text-muted">
                {stats.writingSessions} session{stats.writingSessions === 1 ? "" : "s"}
              </span>
            </div>
            {writingReadiness === null ? (
              <p className="text-xs text-muted">No writing sessions yet.</p>
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
                Speaking
              </span>
              <span className="text-muted">
                {stats.speakingSessions} session{stats.speakingSessions === 1 ? "" : "s"}
              </span>
            </div>
            {speakingReadiness === null ? (
              <p className="text-xs text-muted">No speaking sessions yet.</p>
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
            <CardTitle>Learning history</CardTitle>
          </div>
          <CardDescription>Your most recent completed sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentHistory.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-sm text-muted">
              No sessions yet — your history will appear here.
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
                      <span className="text-sm font-medium capitalize text-foreground">
                        {entry.activity} practice
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
