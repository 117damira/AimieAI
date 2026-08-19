"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, buttonVariants } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { computeTopikSkillAverages, weakestTopikSkill } from "@/lib/topik/dashboardInsights";

const SKILL_HREF = { listening: "/listening", reading: "/reading", writing: "/writing" } as const;

/** Above this accuracy, even the "weakest" skill is doing fine — show
 * encouragement instead of steering the student toward a false weak spot. */
const STRONG_PERFORMANCE_THRESHOLD = 85;

/**
 * A single, real, data-driven recommendation — never a generic "study more"
 * tip. Reuses the exact same weakest-skill computation Aimie Buddy's
 * context uses (lib/topik/dashboardInsights.ts), so the two never
 * disagree, sourced entirely from profile.topikStats.history (the same
 * real session data the Progress page already reads).
 */
export function TopikRecommendationCard() {
  const { t } = useLanguage();
  const { profile } = useUserProfile();
  const r = t.topik.recommendation;

  if (!profile) return null;

  const averages = computeTopikSkillAverages(profile);
  const isTrackII = profile.topikTrack === "II";
  const skill = weakestTopikSkill(averages, isTrackII);
  // weakestTopikSkill only ever returns a skill it found a real, non-null
  // average for, so pct is guaranteed non-null whenever skill is non-null.
  const pct = skill === "listening" ? averages.listening : skill === "reading" ? averages.reading : averages.writing;
  const isStrongAcrossTheBoard = skill !== null && pct !== null && pct >= STRONG_PERFORMANCE_THRESHOLD;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>
          <CardTitle>{r.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!skill || pct === null ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{r.noDataTitle}</span>
            <span className="text-xs leading-5 text-muted">{r.noDataDescription}</span>
          </div>
        ) : isStrongAcrossTheBoard ? (
          <p className="text-sm leading-6 text-foreground">{r.allStrongMessage}</p>
        ) : (
          <p className="text-sm leading-6 text-foreground">{r.weakestSkillIntro(r.skillLabels[skill], pct)}</p>
        )}
      </CardContent>
      {skill && pct !== null && !isStrongAcrossTheBoard && (
        <CardFooter>
          <Link href={SKILL_HREF[skill]} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            {r.ctaLabel(r.skillLabels[skill])}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
