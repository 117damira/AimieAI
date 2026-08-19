import type {
  TopikReadingAnswer,
  TopikReadingQuestion,
  TopikReadingResult,
  TopikReadingSet,
  TopikReadingTiming,
} from "@/types/topik-reading";

const OFFICIAL_EXAM_SCORE_OUT_OF = 100;
/** Practice-proxy passing line for this section alone (50/100) — NOT one
 * of the real published TOPIK level cutoffs, which are combined-score
 * thresholds spanning multiple sections. See config/topik-reading.ts's
 * top-of-file comment for the real figures. */
const OFFICIAL_EXAM_MIN_PASSING = 50;

function arraysMatchAsSets(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

/**
 * Computes a Reading result entirely from the student's actual selected
 * answers compared against each question's real correctOptionIds — never
 * a random or placeholder score. A multi-select question is only correct
 * when the selected set exactly matches the correct set (no partial
 * credit). Mirrors lib/reading/scoring.ts exactly, scaled to TOPIK's
 * 100-point Reading section.
 *
 * "full-exam" is scored on the official 100-point TOPIK Reading scale.
 * Practice modes ("practice-by-text", "daily-challenge") are scored out of
 * their own question count instead, so a short practice session is never
 * dressed up as a 100-point TOPIK result.
 */
export function scoreTopikReadingSet(
  set: TopikReadingSet,
  answers: TopikReadingAnswer[],
  timing: TopikReadingTiming
): TopikReadingResult {
  const isOfficialExam = set.mode === "full-exam";
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionIds]));

  const questionResults = set.questions.map((question: TopikReadingQuestion) => {
    const selectedOptionIds = answerByQuestion.get(question.id) ?? [];
    return {
      questionId: question.id,
      selectedOptionIds,
      correctOptionIds: question.correctOptionIds,
      isCorrect: selectedOptionIds.length > 0 && arraysMatchAsSets(selectedOptionIds, question.correctOptionIds),
    };
  });

  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const total = set.questions.length;
  const accuracy = total > 0 ? correctCount / total : 0;
  const percentage = Math.round(accuracy * 100);

  const scoreOutOf = isOfficialExam ? OFFICIAL_EXAM_SCORE_OUT_OF : total;
  const score = isOfficialExam ? Math.round(accuracy * OFFICIAL_EXAM_SCORE_OUT_OF) : correctCount;
  const passed = isOfficialExam ? score >= OFFICIAL_EXAM_MIN_PASSING : accuracy >= 0.5;

  return {
    setId: set.id,
    level: set.level,
    mode: set.mode,
    score,
    scoreOutOf,
    percentage,
    passed,
    accuracy,
    timing,
    questionResults,
  };
}
