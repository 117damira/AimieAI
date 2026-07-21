"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { Camera, Image as ImageIcon, LogOut, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Avatar, Badge, Input, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { LogoutConfirmDialog } from "@/components/layout/LogoutConfirmDialog";
import { DeleteAccountConfirmDialog } from "@/components/layout/DeleteAccountConfirmDialog";
import { LevelStep } from "@/components/onboarding/LevelStep";
import { DailyGoalStep } from "@/components/onboarding/DailyGoalStep";
import { StudyDaysStep } from "@/components/onboarding/StudyDaysStep";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EXAMS } from "@/config/exams";
import { emailExists } from "@/lib/auth/accountStore";
import { fileToResizedDataUrl } from "@/lib/utils/image";
import { STUDY_DAY_ORDER, STUDY_DAY_WEEKDAY_INDEX } from "@/config/onboarding";
import type { OnboardingLevel, StudyDay } from "@/types/user";

function formatStudyDays(days: StudyDay[], weekdaysShort: readonly string[], everyDayLabel: string): string {
  if (days.length === STUDY_DAY_ORDER.length) return everyDayLabel;
  return STUDY_DAY_ORDER.filter((day) => days.includes(day))
    .map((day) => weekdaysShort[STUDY_DAY_WEEKDAY_INDEX[day]])
    .join(", ");
}

export default function ProfilePage() {
  const { profile, updateProfile } = useUserProfile();
  const { t } = useLanguage();

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [editingLevel, setEditingLevel] = useState(false);
  const [levelDraft, setLevelDraft] = useState<OnboardingLevel | null>(profile?.targetLevel ?? null);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(profile?.dailyGoalMinutes ?? 20);

  const [editingDays, setEditingDays] = useState(false);
  const [daysDraft, setDaysDraft] = useState<StudyDay[]>(profile?.studyDays ?? [...STUDY_DAY_ORDER]);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const takePhotoInputRef = useRef<HTMLInputElement>(null);
  const chooseFileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;
  const exam = EXAMS[profile.examId];

  function handleSave() {
    if (!profile) return;
    setError(null);
    setSaved(false);
    const trimmedEmail = email.trim();
    if (trimmedEmail !== profile.email && emailExists(trimmedEmail, profile.id)) {
      setError(t.common.duplicateEmailError);
      return;
    }
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
    });
    setSaved(true);
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataUrl = await fileToResizedDataUrl(file);
    updateProfile({ avatarPhotoDataUrl: dataUrl });
  }

  function handleSaveLevel() {
    if (!levelDraft) return;
    updateProfile({ targetLevel: levelDraft });
    setEditingLevel(false);
  }

  function handleSaveGoal() {
    updateProfile({ dailyGoalMinutes: goalDraft });
    setEditingGoal(false);
  }

  function handleSaveDays() {
    updateProfile({ studyDays: daysDraft });
    setEditingDays(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.profile.pageTitle}
        description={t.profile.pageDescription}
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:gap-8 sm:text-left">
          <div className="flex flex-col items-center gap-3.5">
            <Avatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              photoUrl={profile.avatarPhotoDataUrl}
              size="lg"
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                ref={takePhotoInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handlePhotoSelected}
              />
              <input
                ref={chooseFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelected}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => takePhotoInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {t.profile.takePhoto}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => chooseFileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4" />
                {t.profile.chooseFromLibrary}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:border-l sm:border-border sm:pl-8">
            <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {profile.firstName} {profile.lastName}
            </span>
            <span className="text-sm text-muted">{profile.email || profile.phone}</span>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="primary">{t.profile.track(exam.name)}</Badge>
              <Badge variant="neutral">{t.profile.targetLevel(profile.targetLevel)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.profile.personalInformation}</CardTitle>
          <CardDescription>
            {t.profile.personalInformationDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
          <Input
            label={t.profile.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label={t.profile.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            label={t.profile.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={profile.phone ? undefined : "sm:col-span-2"}
          />
          {profile.phone && (
            <Input label={t.profile.phone} value={profile.phone} disabled />
          )}
          {error && (
            <p
              className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600 sm:col-span-2"
              role="alert"
            >
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          {saved && (
            <span className="text-sm font-medium text-success-600">{t.profile.changesSaved}</span>
          )}
          <Button onClick={handleSave}>{t.profile.saveChanges}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>{t.profile.levelTitle}</CardTitle>
            <CardDescription>{t.profile.levelDescription}</CardDescription>
          </div>
          {!editingLevel && (
            <Button variant="secondary" size="sm" onClick={() => { setLevelDraft(profile.targetLevel); setEditingLevel(true); }}>
              {t.common.edit}
            </Button>
          )}
        </CardHeader>
        {editingLevel && (
          <>
            <CardContent>
              <LevelStep value={levelDraft} onChange={setLevelDraft} />
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingLevel(false)}>{t.common.cancel}</Button>
              <Button onClick={handleSaveLevel} disabled={!levelDraft}>{t.common.save}</Button>
            </CardFooter>
          </>
        )}
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>{t.profile.studyGoalTitle}</CardTitle>
            <CardDescription>{t.profile.studyGoalDescription}</CardDescription>
          </div>
          {!editingGoal && (
            <Button variant="secondary" size="sm" onClick={() => { setGoalDraft(profile.dailyGoalMinutes); setEditingGoal(true); }}>
              {t.common.edit}
            </Button>
          )}
        </CardHeader>
        {editingGoal ? (
          <>
            <CardContent>
              <DailyGoalStep value={goalDraft} onChange={setGoalDraft} />
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingGoal(false)}>{t.common.cancel}</Button>
              <Button onClick={handleSaveGoal}>{t.common.save}</Button>
            </CardFooter>
          </>
        ) : (
          <CardContent>
            <span className="text-sm text-muted">{t.onboarding.reviewDailyGoal(profile.dailyGoalMinutes)}</span>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>{t.profile.studyDaysTitle}</CardTitle>
            <CardDescription>{t.profile.studyDaysDescription}</CardDescription>
          </div>
          {!editingDays && (
            <Button variant="secondary" size="sm" onClick={() => { setDaysDraft(profile.studyDays); setEditingDays(true); }}>
              {t.common.edit}
            </Button>
          )}
        </CardHeader>
        {editingDays ? (
          <>
            <CardContent>
              <StudyDaysStep value={daysDraft} onChange={setDaysDraft} />
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingDays(false)}>{t.common.cancel}</Button>
              <Button onClick={handleSaveDays}>{t.common.save}</Button>
            </CardFooter>
          </>
        ) : (
          <CardContent>
            <span className="text-sm text-muted">
              {formatStudyDays(profile.studyDays, t.weekdaysShort, t.onboarding.everyDayIntensive)}
            </span>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.profile.accountTitle}</CardTitle>
          <CardDescription>{t.profile.accountDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setLogoutOpen(true)}>
            <LogOut className="h-4 w-4" />
            {t.profileModal.logOut}
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t.profileModal.deleteAccount}
          </Button>
        </CardContent>
      </Card>

      <LogoutConfirmDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
      <DeleteAccountConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
