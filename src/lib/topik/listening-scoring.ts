import type {
  TopikListeningAnswer,
  TopikListeningQuestion,
  TopikListeningResult,
  TopikListeningSet,
} from "@/types/topik-listening";

const OFFICIAL_EXAM_SCORE_OUT_OF = 100;
/** Practice proxy for "passed" on this Listening-only module — NOT the real
 * official combined-level cutoff (see config/topik-listening.ts's comment
 * for the real published TOPIK I/II figures). */
const OFFICIAL_EXAM_MIN_PASSING = 50;

function arraysMatchAsSets(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

/**
 * Computes a Listening result entirely from the student's actual selected
 * answers compared against each question's real correctOptionIds — never a
 * random or placeholder score. A multi-select question is only correct when
 * the selected set exactly matches the correct set (no partial credit).
 *
 * "full-exam" is scored on the official 100-point TOPIK Listening scale.
 * Practice modes ("practice-by-part", "daily-challenge") are real practice,
 * not the exam — they're scored out of their own question count instead, so
 * a small practice session is never dressed up as a 100-point TOPIK result.
 *
 * Mirrors lib/listening/scoring.ts's arraysMatchAsSets logic exactly. Never
 * uses Math.random() — this is deterministic scoring, not content rotation.
 */
export function scoreTopikListeningSet(
  set: TopikListeningSet,
  answers: TopikListeningAnswer[],
  timeSpentSeconds: number
): TopikListeningResult {
  const isOfficialExam = set.mode === "full-exam";
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionIds]));

  const questionResults = set.questions.map((question: TopikListeningQuestion) => {
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
    timeSpentSeconds,
    accuracy,
    questionResults,
  };
}
