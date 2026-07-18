"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Input, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { EXAMS } from "@/config/exams";
import { cn } from "@/lib/utils/cn";

function ToggleRow({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted">{description}</span>
      </div>
      <span
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
          enabled ? "bg-primary-500" : "bg-border"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow transition-transform",
            enabled && "translate-x-5"
          )}
        />
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { profile } = useUserProfile();
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your account, exam, and notification preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your login email for Examly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input label="Email" type="email" defaultValue={profile.email} disabled />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily goal</CardTitle>
          <CardDescription>
            How many minutes per day you want to practice.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Input
            label="Minutes per day"
            type="number"
            defaultValue={profile.dailyGoalMinutes}
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled>Save goal</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exam</CardTitle>
          <CardDescription>Choose which exam you&apos;re preparing for.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {Object.values(EXAMS).map((exam) => (
            <div
              key={exam.id}
              className={cn(
                "flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border px-5 py-4",
                exam.id === profile.examId
                  ? "border-primary-300 bg-primary-50"
                  : "border-border bg-background opacity-60"
              )}
            >
              <span className="font-display font-semibold text-foreground">
                {exam.name}
              </span>
              <Badge variant={exam.id === profile.examId ? "primary" : "neutral"}>
                {exam.id === profile.examId ? "Selected" : exam.isActive ? "Available" : "Coming soon"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
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
        </CardContent>
      </Card>

      <Card className="border-danger-100">
        <CardHeader>
          <CardTitle className="text-danger-600">Danger zone</CardTitle>
          <CardDescription>Permanently delete your account and all data.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button variant="danger" disabled>
            Delete account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
