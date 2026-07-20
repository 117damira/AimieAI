"use client";

import { useState } from "react";
import { Menu, Flame } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { StreakModal } from "./StreakModal";
import { ProfileModal } from "./ProfileModal";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { t } = useLanguage();
  const { profile } = useUserProfile();

  if (!profile) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={t.topbar.ariaOpenMenu}
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
          aria-label={t.topbar.ariaViewStreak}
          className="hidden cursor-pointer sm:inline-flex"
        >
          <Badge
            variant="warning"
            className="transition-transform hover:scale-105"
          >
            <Flame className="h-3.5 w-3.5" />
            {t.topbar.streak(profile.stats.currentStreakDays)}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          aria-label={t.topbar.ariaOpenProfile}
          className="cursor-pointer rounded-full transition-transform hover:scale-105"
        >
          <Avatar
            firstName={profile.firstName}
            lastName={profile.lastName}
            photoUrl={profile.avatarPhotoDataUrl}
            size="sm"
          />
        </button>
      </div>

      <StreakModal
        open={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
      />
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
}
