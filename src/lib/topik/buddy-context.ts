import type { User } from "@/types/user";
import type { TopikBuddyContext } from "@/types/topik-buddy";
import { computeTopikSkillAverages, weakestTopikSkill, daysUntilExamDate } from "@/lib/topik/dashboardInsights";

/**
 * Builds the compact, curated context sent to the Aimie Buddy chat API —
 * see TopikBuddyContext's own doc comment for why it's deliberately narrow.
 * Sourced entirely from the existing profile/stats fields other TOPIK
 * screens already read (topikTrack, topikLevel, examDate, topikStats) —
 * no new data source, no second exam-date system.
 */
export function buildTopikBuddyContext(profile: User): TopikBuddyContext {
  const averages = computeTopikSkillAverages(profile);
  const isTrackII = profile.topikTrack === "II";
  const stats = profile.topikStats;

  return {
    firstName: profile.firstName,
    track: profile.topikTrack,
    level: profile.topikLevel,
    examDate: profile.examDate,
    daysUntilExam: profile.examDate ? daysUntilExamDate(profile.examDate) : null,
    listeningAccuracyPct: averages.listening,
    readingAccuracyPct: averages.reading,
    writingAccuracyPct: isTrackII ? averages.writing : null,
    weakestSkill: weakestTopikSkill(averages, isTrackII),
    currentStreakDays: stats.currentStreakDays,
    wordsLearned: stats.wordsLearned,
    totalSessionsCompleted: stats.listeningSessions + stats.readingSessions + stats.writingSessions,
  };
}
