import { BookOpenText, ListChecks, Mic, PenLine, Flame, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, ProgressBar } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { PROGRESS_SUMMARY } from "@/lib/mock/practice";

const STATS = [
  { label: "Words learned", value: PROGRESS_SUMMARY.wordsLearned, icon: BookOpenText },
  { label: "Quizzes completed", value: PROGRESS_SUMMARY.quizzesCompleted, icon: ListChecks },
  { label: "Speaking sessions", value: PROGRESS_SUMMARY.speakingSessions, icon: Mic },
  { label: "Writing sessions", value: PROGRESS_SUMMARY.writingSessions, icon: PenLine },
];

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Progress"
        description="Track how your DELF preparation is coming along, week over week."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-semibold text-foreground">
                {value}
              </span>
              <span className="text-sm text-muted">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-[18px] w-[18px] text-warning-500" />
              <CardTitle>Current streak</CardTitle>
            </div>
            <CardDescription>
              Consecutive days of practice — don&apos;t break the chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-display text-4xl font-semibold text-foreground">
              {PROGRESS_SUMMARY.currentStreakDays}
              <span className="ml-2 text-base font-normal text-muted">days</span>
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly goal</CardTitle>
            <CardDescription>Your overall progress toward this week&apos;s goal.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={PROGRESS_SUMMARY.weeklyGoalProgress}
              max={100}
              showPercentage
              label="Completed"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>Progress over time</CardTitle>
          </div>
          <CardDescription>
            A detailed chart of your scores and activity will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-sm text-muted">
            Chart coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
