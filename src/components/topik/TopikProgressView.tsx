"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpenText,
  ListChecks,
  Headphones,
  BookOpen,
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
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { defaultLevelForTrack } from "@/lib/utils/topikLevel";
import { estimateTopikLevel } from "@/lib/topik/estimateLevel";
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

const ACTIVITY_ICON = {
  writing: PenLine,
  listening: Headphones,
  reading: BookOpen,
  speaking: PenLine, // TOPIK never logs "speaking" — kept only for type completeness.
} as const;

const TRACK_HEIGHT_PX = 96;

function barHeightPercent(value: number, max: number): number {
  if (value <= 0) return 0;
  return Math.max((value / max) * 100, 8);
}

/** TOPIK equivalent of DelfProgressPage — same structure (stat tiles,
 * streak, estimated readiness, weekly activity, skill breakdown, history)
 * but sourced entirely from profile.topikStats / profile.
 * topikVocabularyProgress, and showing Listening/Reading/Writing (Writing
 * only for TOPIK II) instead of Speaking/Writing. */
export function TopikProgressView() {
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  if (!profile) return null;

  const stats = profile.topikStats;
  const track = profile.topikTrack;
  const isTrackII = track === "II";
  const vocabularyProgress = profile.topikVocabularyProgress ?? [];

  const STATS = [
    { label: t.progress.wordsLearned, value: stats.wordsLearned, icon: BookOpenText },
    { label: t.progress.quizzesCompleted, value: stats.quizzesCompleted, icon: ListChecks },
    { label: t.dashboard.progress.listeningSessions, value: stats.listeningSessions, icon: Headphones },
    { label: t.dashboard.progress.readingSessions, value: stats.readingSessions, icon: BookOpen },
  ];
  if (isTrackII) {
    STATS.push({ label: t.progress.writingSessions, value: stats.writingSessions, icon: PenLine });
  }

  const today = new Date();
  const weeklyDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const iso = toIso(date);
    const entriesForDay = stats.history.filter((entry) => entry.date === iso);
    return {
      label: t.weekdaysShort[date.getDay()],
      listening: entriesForDay.filter((e) => e.activity === "listening").length,
      reading: entriesForDay.filter((e) => e.activity === "reading").length,
      writing: entriesForDay.filter((e) => e.activity === "writing").length,
    };
  });
  const weeklyMax = Math.max(
    1,
    ...weeklyDays.flatMap((day) => (isTrackII ? [day.listening, day.reading, day.writing] : [day.listening, day.reading]))
  );

  const overallReadiness = average(stats.history.map((entry) => entry.score));
  const listeningReadiness = average(stats.history.filter((e) => e.activity === "listening").map((e) => e.score));
  const readingReadiness = average(stats.history.filter((e) => e.activity === "reading").map((e) => e.score));
  const writingReadiness = average(stats.history.filter((e) => e.activity === "writing").map((e) => e.score));

  const estimatedLevel = track
    ? estimateTopikLevel(track, stats.history.map((e) => e.score), profile.topikLevel ?? defaultLevelForTrack(track))
    : null;

  const recentHistory: ActivityLogEntry[] = [...stats.history].reverse().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.progress.pageTitle} description={t.topik.progress.pageDescription} />

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
                <div className="flex items-center gap-3">
                  <span className="font-display text-4xl font-semibold text-foreground">
                    {overallReadiness}
                    <span className="ml-1 text-base font-normal text-muted">/ 100</span>
                  </span>
                  {estimatedLevel && (
                    <Badge variant="primary">{t.profile.targetLevel(estimatedLevel)}</Badge>
                  )}
                </div>
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
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                {t.listening.pageTitle}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-info-500" />
                {t.reading.pageTitle}
              </span>
              {isTrackII && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                  {t.writing.pageTitle}
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-2 rounded-2xl border border-border bg-background/50 p-4 sm:gap-4">
              {weeklyDays.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex items-end gap-1.5">
                    <div className="flex w-3.5 flex-col items-center sm:w-4">
                      <span className="mb-1 h-3.5 text-[10px] font-medium leading-none text-muted">
                        {day.listening > 0 ? day.listening : ""}
                      </span>
                      <div
                        className="flex w-full items-end rounded-t-[4px] bg-surface"
                        style={{ height: TRACK_HEIGHT_PX }}
                        title={`${t.listening.pageTitle}: ${day.listening}`}
                      >
                        <div
                          className="w-full rounded-t-[4px] bg-purple-500 transition-[height] duration-500 transition-smooth"
                          style={{ height: `${barHeightPercent(day.listening, weeklyMax)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex w-3.5 flex-col items-center sm:w-4">
                      <span className="mb-1 h-3.5 text-[10px] font-medium leading-none text-muted">
                        {day.reading > 0 ? day.reading : ""}
                      </span>
                      <div
                        className="flex w-full items-end rounded-t-[4px] bg-surface"
                        style={{ height: TRACK_HEIGHT_PX }}
                        title={`${t.reading.pageTitle}: ${day.reading}`}
                      >
                        <div
                          className="w-full rounded-t-[4px] bg-info-500 transition-[height] duration-500 transition-smooth"
                          style={{ height: `${barHeightPercent(day.reading, weeklyMax)}%` }}
                        />
                      </div>
                    </div>
                    {isTrackII && (
                      <div className="flex w-3.5 flex-col items-center sm:w-4">
                        <span className="mb-1 h-3.5 text-[10px] font-medium leading-none text-muted">
                          {day.writing > 0 ? day.writing : ""}
                        </span>
                        <div
                          className="flex w-full items-end rounded-t-[4px] bg-surface"
                          style={{ height: TRACK_HEIGHT_PX }}
                          title={`${t.writing.pageTitle}: ${day.writing}`}
                        >
                          <div
                            className="w-full rounded-t-[4px] bg-primary-500 transition-[height] duration-500 transition-smooth"
                            style={{ height: `${barHeightPercent(day.writing, weeklyMax)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
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
                <Headphones className="h-4 w-4 text-purple-600" />
                {t.listening.pageTitle}
              </span>
              <span className="text-muted">
                {t.progress.sessionsCount(stats.listeningSessions)}
              </span>
            </div>
            {listeningReadiness === null ? (
              <p className="text-xs text-muted">{t.progress.readinessEmptyState}</p>
            ) : (
              <ProgressBar
                value={listeningReadiness}
                max={100}
                showPercentage
                colorClassName="bg-purple-500"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <BookOpen className="h-4 w-4 text-info-600" />
                {t.reading.pageTitle}
              </span>
              <span className="text-muted">
                {t.progress.sessionsCount(stats.readingSessions)}
              </span>
            </div>
            {readingReadiness === null ? (
              <p className="text-xs text-muted">{t.progress.readinessEmptyState}</p>
            ) : (
              <ProgressBar
                value={readingReadiness}
                max={100}
                showPercentage
                colorClassName="bg-info-500"
              />
            )}
          </div>
          {isTrackII && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <PenLine className="h-4 w-4 text-primary-500" />
                  {t.writing.pageTitle}
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
          )}
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
              {recentHistory.map((entry, index) => {
                const Icon = ACTIVITY_ICON[entry.activity];
                const entryLabel =
                  entry.activity === "listening"
                    ? t.listening.pageTitle
                    : entry.activity === "reading"
                      ? t.reading.pageTitle
                      : t.writing.pageTitle;
                return (
                  <li
                    key={`${entry.date}-${index}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{entryLabel}</span>
                        <span className="text-xs text-muted">{entry.date}</span>
                      </div>
                    </div>
                    <Badge variant="neutral">{entry.score} / 100</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <span className="text-sm text-muted">{t.vocabulary.yourVocabulary}</span>
          <Badge variant="neutral">{vocabularyProgress.length}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
