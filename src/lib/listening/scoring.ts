import type { ListeningAnswer, ListeningQuestion, ListeningResult, ListeningSet } from "@/types/listening";

/**
 * Computes a Listening result entirely from the student's actual selected
 * answers compared against each question's real correctOptionId — never a
 * random or placeholder score. Points are distributed evenly across all
 * questions in the set so the total always sums to scoreOutOf (25).
 */
export function scoreListeningSet(
  set: ListeningSet,
  answers: ListeningAnswer[],
  timeSpentSeconds: number
): ListeningResult {
  const scoreOutOf = 25;
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));

  const questionResults = set.questions.map((question: ListeningQuestion) => {
    const selectedOptionId = answerByQuestion.get(question.id) ?? null;
    return {
      questionId: question.id,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect: selectedOptionId !== null && selectedOptionId === question.correctOptionId,
    };
  });

  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const total = set.questions.length;
  const accuracy = total > 0 ? correctCount / total : 0;
  const score = total > 0 ? Math.round((correctCount / total) * scoreOutOf) : 0;
  const percentage = Math.round(accuracy * 100);

  return {
    setId: set.id,
    level: set.level,
    score,
    scoreOutOf,
    percentage,
    passed: score >= 5,
    timeSpentSeconds,
    accuracy,
    questionResults,
  };
}
