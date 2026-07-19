"use client";

import { Flame, Trophy } from "lucide-react";
import { Modal, AnimatedNumber } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getWeekStrip(practicedDates: Set<string>, weekdayLabels: readonly string[]) {
  const today = new Date();
  const days: { iso: string; label: string; dayNumber: number; active: boolean; isToday: boolean }[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const iso = toIso(date);
    days.push({
      iso,
      label: weekdayLabels[date.getDay()],
      dayNumber: date.getDate(),
      active: practicedDates.has(iso),
      isToday: offset === 0,
    });
  }
  return days;
}

function getMonthGrid(practicedDates: Set<string>) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: { day: number; iso: string; active: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: 0, iso: "", active: false, isToday: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toIso(new Date(year, month, day));
    cells.push({
      day,
      iso,
      active: practicedDates.has(iso),
      isToday: day === today.getDate(),
    });
  }
  return cells;
}

function getConsistencyPercent(practicedDates: Set<string>): number {
  const today = new Date();
  let practiced = 0;
  for (let offset = 0; offset < 30; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    if (practicedDates.has(toIso(date))) practiced += 1;
  }
  return Math.round((practiced / 30) * 100);
}

export interface StreakModalProps {
  open: boolean;
  onClose: () => void;
}

export function StreakModal({ open, onClose }: StreakModalProps) {
  const { t } = useLanguage();
  const { profile } = useUserProfile();

  if (!profile) return null;
  const { stats } = profile;
  const practicedDates = new Set(stats.history.map((entry) => entry.date));
  const weekStrip = getWeekStrip(practicedDates, t.weekdaysShort);
  const monthGrid = getMonthGrid(practicedDates);
  const consistencyPercent = getConsistencyPercent(practicedDates);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.streakModal.title}
      description={t.streakModal.description(stats.currentStreakDays)}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-6">
        {/* Current + longest streak */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 rounded-2xl bg-gradient-to-br from-warning-50 to-background p-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <Flame className="h-3.5 w-3.5 text-warning-500" />
              {t.streakModal.currentStreak}
            </div>
            <div className="font-display text-3xl font-semibold text-foreground">
              <AnimatedNumber value={stats.currentStreakDays} />
              <span className="ml-1.5 text-sm font-normal text-muted">
                {t.streakModal.daysUnit}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-gradient-to-br from-primary-50 to-background p-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <Trophy className="h-3.5 w-3.5 text-primary-500" />
              {t.streakModal.longestStreak}
            </div>
            <div className="font-display text-3xl font-semibold text-foreground">
              <AnimatedNumber value={stats.longestStreakDays} />
              <span className="ml-1.5 text-sm font-normal text-muted">
                {t.streakModal.daysUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly strip */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.streakModal.thisWeek}
          </span>
          <div className="grid grid-cols-7 gap-2">
            {weekStrip.map((day) => (
              <div key={day.iso} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-muted">{day.label}</span>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ring-offset-2 ring-offset-surface",
                    day.active
                      ? "bg-warning-500 text-white"
                      : "bg-background text-muted",
                    day.isToday && "ring-2 ring-primary-400"
                  )}
                >
                  {day.dayNumber}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly grid */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.streakModal.thisMonth}
          </span>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {t.weekdaysShort.map((label, index) => (
              <span key={`${label}-${index}`} className="text-xs font-medium text-muted">
                {label}
              </span>
            ))}
            {monthGrid.map((cell, index) =>
              cell.day === 0 ? (
                <span key={`blank-${index}`} />
              ) : (
                <span
                  key={cell.iso}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center justify-self-center rounded-full text-xs font-medium ring-offset-2 ring-offset-surface",
                    cell.active ? "bg-warning-500 text-white" : "bg-background text-muted",
                    cell.isToday && "ring-2 ring-primary-400"
                  )}
                >
                  {cell.day}
                </span>
              )
            )}
          </div>
          <div className="flex items-center gap-4 pt-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-warning-500 text-white">
                <Flame className="h-2.5 w-2.5" />
              </span>
              {t.streakModal.legendActive}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-background" />
              {t.streakModal.legendInactive}
            </span>
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {t.streakModal.consistency}
            </span>
            <span className="text-xs text-muted">
              {stats.history.length === 0
                ? t.streakModal.noHistory
                : t.streakModal.consistencyDescription(consistencyPercent)}
            </span>
          </div>
          <span className="font-display text-2xl font-semibold text-foreground">
            {consistencyPercent}%
          </span>
        </div>
      </div>
    </Modal>
  );
}
