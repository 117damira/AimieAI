"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Avatar, Badge, Input, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EXAMS } from "@/config/exams";
import { emailExists } from "@/lib/auth/accountStore";
import { fileToResizedDataUrl } from "@/lib/utils/image";

export default function ProfilePage() {
  const { profile, updateProfile } = useUserProfile();
  const { t } = useLanguage();

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.profile.pageTitle}
        description={t.profile.pageDescription}
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-3">
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
          <div className="flex flex-col gap-2">
            <span className="font-display text-xl font-semibold text-foreground">
              {profile.firstName} {profile.lastName}
            </span>
            <span className="text-sm text-muted">{profile.email}</span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
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
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            className="sm:col-span-2"
          />
          {error && (
            <p className="text-sm text-danger-600 sm:col-span-2" role="alert">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          {saved && (
            <span className="text-sm text-success-600">{t.profile.changesSaved}</span>
          )}
          <Button onClick={handleSave}>{t.profile.saveChanges}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
