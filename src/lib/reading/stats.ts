import type { ReadingPersonalBest, ReadingProgressComparison, ReadingSessionRecord } from "@/types/reading";

/**
 * Personal Best and Progress Comparison — both computed purely from the
 * student's real, stored session history (profile.stats.readingSessionHistory),
 * never randomized or estimated. Mirrors the "compute from real data only"
 * philosophy used throughout lib/listening and lib/writing.
 */

function isYesterday(dateIso: string, today: string): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
    yesterday.getDate()
  ).padStart(2, "0")}`;
  return dateIso === yesterdayIso;
}

/** Consecutive-day streak counted across distinct calendar days that have
 * at least one completed Reading session, most recent day first. Distinct
 * from the app-wide `stats.currentStreakDays` (which counts any activity). */
export function computeReadingStreak(history: ReadingSessionRecord[]): number {
  if (history.length === 0) return 0;
  const distinctDays = [...new Set(history.map((h) => h.date))].sort().reverse();
  let streak = 1;
  for (let i = 0; i < distinctDays.length - 1; i++) {
    if (isYesterday(distinctDays[i + 1], distinctDays[i])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function computeReadingPersonalBest(history: ReadingSessionRecord[]): ReadingPersonalBest {
  if (history.length === 0) {
    return { bestScorePercent: null, averageScorePercent: null, readingStreakDays: 0, sessionsCompleted: 0 };
  }
  const percentages = history.map((h) => h.percentage);
  return {
    bestScorePercent: Math.max(...percentages),
    averageScorePercent: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length),
    readingStreakDays: computeReadingStreak(history),
    sessionsCompleted: history.length,
  };
}

/** Compares the just-completed session (already appended as the last entry
 * of `historyIncludingCurrent`) against the one immediately before it. */
export function computeReadingProgressComparison(
  historyIncludingCurrent: ReadingSessionRecord[]
): ReadingProgressComparison {
  const current = historyIncludingCurrent[historyIncludingCurrent.length - 1];
  const previous = historyIncludingCurrent[historyIncludingCurrent.length - 2] ?? null;

  return {
    hasPrevious: previous !== null,
    previousScore: previous?.percentage ?? null,
    currentScore: current.percentage,
    scoreImprovement: previous ? current.percentage - previous.percentage : null,
    previousWordsPerMinute: previous?.wordsPerMinute ?? null,
    currentWordsPerMinute: current.wordsPerMinute,
    speedImprovement: previous ? current.wordsPerMinute - previous.wordsPerMinute : null,
    previousAccuracy: previous ? Math.round(previous.accuracy * 100) : null,
    currentAccuracy: Math.round(current.accuracy * 100),
    accuracyImprovement: previous ? Math.round((current.accuracy - previous.accuracy) * 100) : null,
    previousVocabularyCount: previous?.newVocabularyCount ?? null,
    currentVocabularyCount: current.newVocabularyCount,
    vocabularyImprovement: previous ? current.newVocabularyCount - previous.newVocabularyCount : null,
  };
}
