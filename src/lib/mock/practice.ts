import type { WritingPrompt, QuizQuestion } from "@/types";

export const WRITING_PROMPT: WritingPrompt = {
  id: "wp_1",
  title: "Lettre informelle",
  prompt:
    "Écrivez un e-mail à un ami pour lui raconter votre dernier voyage et lui donner des conseils pour son prochain séjour.",
  minWords: 160,
  delfExercise: "DELF B1 · Production Écrite",
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    word: "néanmoins",
    question: "Which sentence uses \"néanmoins\" correctly?",
    options: [
      "Néanmoins, je vais au marché.",
      "Il faisait froid ; néanmoins, elle est sortie sans manteau.",
      "Néanmoins bonjour !",
    ],
  },
  {
    id: "q2",
    word: "davantage",
    question: "\"Davantage\" is closest in meaning to:",
    options: ["Less", "More / further", "Never"],
  },
  {
    id: "q3",
    word: "malgré",
    question: "Choose the correct usage of \"malgré\":",
    options: [
      "Malgré la pluie, nous sommes sortis.",
      "Je malgré très fatigué.",
      "Malgré que je suis content.",
    ],
  },
];
