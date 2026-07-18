"use client";

import { Flame } from "lucide-react";
import { Modal } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PROGRESS_SUMMARY } from "@/lib/mock/practice";

function getStreakCalendar(streakDays: number) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayDate = today.getDate();

  const cells: { day: number; active: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: 0, active: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const diff = todayDate - day;
    const active = diff >= 0 && diff < streakDays;
    cells.push({ day, active });
  }
  return cells;
}

export interface StreakModalProps {
  open: boolean;
  onClose: () => void;
}

export function StreakModal({ open, onClose }: StreakModalProps) {
  const { t } = useLanguage();
  const streakDays = PROGRESS_SUMMARY.currentStreakDays;
  const cells = getStreakCalendar(streakDays);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.streakModal.title}
      description={t.streakModal.description(streakDays)}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {t.weekdaysShort.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="text-xs font-medium text-muted"
            >
              {label}
            </span>
          ))}
          {cells.map((cell, index) =>
            cell.day === 0 ? (
              <span key={`blank-${index}`} />
            ) : (
              <span
                key={cell.day}
                className={cn(
                  "flex h-8 w-8 items-center justify-center justify-self-center rounded-full text-xs font-medium",
                  cell.active
                    ? "bg-warning-500 text-white"
                    : "bg-background text-muted"
                )}
              >
                {cell.day}
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-4 text-xs text-muted">
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
    </Modal>
  );
}
