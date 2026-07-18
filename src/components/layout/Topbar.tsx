"use client";

import { useState } from "react";
import { Menu, Flame } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import { PROGRESS_SUMMARY } from "@/lib/mock/practice";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { StreakModal } from "./StreakModal";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const { t } = useLanguage();
  const { profile } = useUserProfile();

  if (!profile) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground hover:bg-primary-50 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => setStreakModalOpen(true)}
          aria-label="View streak calendar"
          className="hidden cursor-pointer sm:inline-flex"
        >
          <Badge
            variant="warning"
            className="transition-transform hover:scale-105"
          >
            <Flame className="h-3.5 w-3.5" />
            {t.topbar.streak(PROGRESS_SUMMARY.currentStreakDays)}
          </Badge>
        </button>
        <Avatar initials={profile.avatarInitials} size="sm" />
      </div>

      <StreakModal
        open={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
      />
    </header>
  );
}
