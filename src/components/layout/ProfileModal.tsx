"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Settings as SettingsIcon,
  KeyRound,
  Bell,
  LogOut,
  Trash2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  BarChart3,
  Target,
  CalendarDays,
} from "lucide-react";
import { Modal, Avatar, Input, Button, ToggleRow } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EXAMS } from "@/config/exams";
import { updateAccountPassword } from "@/lib/auth/accountStore";
import { STUDY_DAY_ORDER, STUDY_DAY_WEEKDAY_INDEX } from "@/config/onboarding";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";
import { DeleteAccountConfirmDialog } from "./DeleteAccountConfirmDialog";

export interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-muted">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-sm text-muted">{value}</span>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  href,
  tone = "default",
  expanded,
}: {
  icon: typeof UserIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
  expanded?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span
          className={cnTone(tone)}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span
          className={
            tone === "danger"
              ? "text-sm font-medium text-danger-600"
              : "text-sm font-medium text-foreground"
          }
        >
          {label}
        </span>
      </div>
      {expanded ? (
        <ChevronDown className="h-4 w-4 text-muted" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted" />
      )}
    </>
  );

  const className =
    "flex w-full items-center justify-between gap-4 rounded-xl px-2 py-2.5 text-left transition-colors duration-200 hover:bg-background cursor-pointer";

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function cnTone(tone: "default" | "danger") {
  return tone === "danger"
    ? "flex h-8 w-8 items-center justify-center rounded-lg bg-danger-50 text-danger-600"
    : "flex h-8 w-8 items-center justify-center rounded-lg bg-background text-muted";
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<"password" | "notifications" | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!profile) return null;
  const exam = EXAMS[profile.examId];

  function toggleExpanded(section: "password" | "notifications") {
    setExpanded((prev) => (prev === section ? null : section));
    setPasswordError(null);
    setPasswordSaved(false);
  }

  async function handleSavePassword() {
    if (!profile) return;
    setPasswordError(null);
    setPasswordSaved(false);
    if (newPassword.length < 8) {
      setPasswordError(t.common.passwordTooShortError);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t.common.passwordsDoNotMatchError);
      return;
    }
    setIsSavingPassword(true);
    try {
      const result = await updateAccountPassword(profile.id, currentPassword, newPassword);
      if (!result.ok) {
        setPasswordError(t.profileModal.wrongCurrentPasswordError);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSaved(true);
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} className="max-w-lg">
        <div className="flex flex-col gap-6">
          {/* Identity header */}
          <div className="flex items-center gap-4">
            <Avatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              photoUrl={profile.avatarPhotoDataUrl}
              size="lg"
            />
            <div className="flex flex-col gap-1">
              <span className="font-display text-lg font-semibold text-foreground">
                {profile.firstName} {profile.lastName}
              </span>
              <span className="text-sm text-muted">{profile.email || profile.phone}</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {t.profileModal.preferences}
            </span>
            <InfoRow icon={GraduationCap} label={t.profileModal.exam} value={exam.name} />
            <InfoRow icon={BarChart3} label={t.profileModal.currentLevel} value={profile.targetLevel} />
            <InfoRow
              icon={Target}
              label={t.profileModal.studyGoal}
              value={t.profileModal.minPerDay(profile.dailyGoalMinutes)}
            />
            <InfoRow
              icon={CalendarDays}
              label={t.profileModal.studyDays}
              value={
                profile.studyDays.length === STUDY_DAY_ORDER.length
                  ? t.onboarding.everyDayIntensive
                  : STUDY_DAY_ORDER.filter((day) => profile.studyDays.includes(day))
                      .map((day) => t.weekdaysShort[STUDY_DAY_WEEKDAY_INDEX[day]])
                      .join(", ")
              }
            />
          </div>

          {/* Account */}
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {t.profileModal.account}
            </span>
            <ActionRow icon={UserIcon} label={t.profileModal.profileLink} href="/profile" onClick={onClose} />
            <ActionRow icon={SettingsIcon} label={t.profileModal.settingsLink} href="/settings" onClick={onClose} />
            <ActionRow
              icon={KeyRound}
              label={t.profileModal.changePassword}
              onClick={() => toggleExpanded("password")}
              expanded={expanded === "password"}
            />
            {expanded === "password" && (
              <div className="flex flex-col gap-3 rounded-xl bg-background p-4">
                <Input
                  label={t.profileModal.currentPassword}
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label={t.profileModal.newPassword}
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label={t.profileModal.confirmNewPassword}
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-sm text-danger-600" role="alert">
                    {passwordError}
                  </p>
                )}
                {passwordSaved && (
                  <p className="text-sm text-success-600">{t.profileModal.passwordUpdated}</p>
                )}
                <Button
                  size="sm"
                  className="self-end"
                  onClick={handleSavePassword}
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                >
                  {t.profileModal.savePassword}
                </Button>
              </div>
            )}
            <ActionRow
              icon={Bell}
              label={t.profileModal.notificationsLink}
              onClick={() => toggleExpanded("notifications")}
              expanded={expanded === "notifications"}
            />
            {expanded === "notifications" && (
              <div className="flex flex-col divide-y divide-border rounded-xl bg-background px-4">
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
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {t.profileModal.dangerZone}
            </span>
            <ActionRow icon={LogOut} label={t.profileModal.logOut} onClick={() => setLogoutOpen(true)} />
            <ActionRow
              icon={Trash2}
              label={t.profileModal.deleteAccount}
              tone="danger"
              onClick={() => setDeleteOpen(true)}
            />
          </div>
        </div>
      </Modal>

      <LogoutConfirmDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
      <DeleteAccountConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}
