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
  Globe,
  GraduationCap,
  BarChart3,
  Target,
} from "lucide-react";
import { Modal, Avatar, Input, Button, ToggleRow } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { EXAMS } from "@/config/exams";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
    "flex w-full items-center justify-between gap-4 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-background cursor-pointer";

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
  const [expanded, setExpanded] = useState<"password" | "notifications" | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!profile) return null;
  const exam = EXAMS[profile.examId];

  function toggleExpanded(section: "password" | "notifications") {
    setExpanded((prev) => (prev === section ? null : section));
  }

  return (
    <>
      <Modal open={open} onClose={onClose} className="max-w-lg">
        <div className="flex flex-col gap-6">
          {/* Identity header */}
          <div className="flex items-center gap-4">
            <Avatar initials={profile.avatarInitials} size="lg" />
            <div className="flex flex-col gap-1">
              <span className="font-display text-lg font-semibold text-foreground">
                {profile.firstName} {profile.lastName}
              </span>
              <span className="text-sm text-muted">{profile.email}</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Preferences
            </span>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-muted">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">Language</span>
              </div>
              <LanguageSwitcher />
            </div>
            <InfoRow icon={GraduationCap} label="Exam" value={exam.name} />
            <InfoRow icon={BarChart3} label="Current level" value={profile.targetLevel} />
            <InfoRow
              icon={Target}
              label="Study goal"
              value={`${profile.dailyGoalMinutes} min/day`}
            />
          </div>

          {/* Account */}
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Account
            </span>
            <ActionRow icon={UserIcon} label="Profile" href="/profile" onClick={onClose} />
            <ActionRow icon={SettingsIcon} label="Settings" href="/settings" onClick={onClose} />
            <ActionRow
              icon={KeyRound}
              label="Change password"
              onClick={() => toggleExpanded("password")}
              expanded={expanded === "password"}
            />
            {expanded === "password" && (
              <div className="flex flex-col gap-3 rounded-xl bg-background p-4">
                <Input label="Current password" type="password" placeholder="••••••••" />
                <Input label="New password" type="password" placeholder="••••••••" />
                <Input label="Confirm new password" type="password" placeholder="••••••••" />
                <Button disabled size="sm" className="self-end">
                  Save password
                </Button>
              </div>
            )}
            <ActionRow
              icon={Bell}
              label="Notifications"
              onClick={() => toggleExpanded("notifications")}
              expanded={expanded === "notifications"}
            />
            {expanded === "notifications" && (
              <div className="flex flex-col divide-y divide-border rounded-xl bg-background px-4">
                <ToggleRow
                  title="Daily reminder"
                  description="A nudge if you haven't practiced yet today."
                  enabled
                />
                <ToggleRow
                  title="Weekly summary email"
                  description="A recap of your progress every Monday."
                  enabled
                />
                <ToggleRow
                  title="Product updates"
                  description="News about new features and exams."
                  enabled={false}
                />
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Danger zone
            </span>
            <ActionRow icon={LogOut} label="Log out" onClick={() => setLogoutOpen(true)} />
            <ActionRow
              icon={Trash2}
              label="Delete account"
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
