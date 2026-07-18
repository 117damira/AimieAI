"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Avatar, Badge, Input, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { EXAMS } from "@/config/exams";

export default function ProfilePage() {
  const { profile } = useUserProfile();
  if (!profile) return null;
  const exam = EXAMS[profile.examId];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and exam preferences."
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <Avatar initials={profile.avatarInitials} size="lg" />
          <div className="flex flex-col gap-2">
            <span className="font-display text-xl font-semibold text-foreground">
              {profile.firstName} {profile.lastName}
            </span>
            <span className="text-sm text-muted">{profile.email}</span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="primary">{exam.name} track</Badge>
              <Badge variant="neutral">Target level {profile.targetLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            This information is used to personalize your dashboard and feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" defaultValue={profile.firstName} />
          <Input label="Last name" defaultValue={profile.lastName} />
          <Input
            label="Email"
            type="email"
            defaultValue={profile.email}
            className="sm:col-span-2"
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
