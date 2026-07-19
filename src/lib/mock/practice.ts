import type { WritingPrompt, QuizQuestion } from "@/types";

export const WRITING_PROMPT: WritingPrompt = {
  id: "wp_1",
  title: "Lettre informelle",
  prompt:
    "Écrivez un e-mail à un ami pour lui raconter votre dernier voyage et lui donner des conseils pour son prochain séjour.",
  minWords: 160,
  delfExercise: "DELF B1 · Production Écrite",
};

const NEANMOINS_OPTIONS = [
  "Néanmoins, je vais au marché.",
  "Il faisait froid ; néanmoins, elle est sortie sans manteau.",
  "Néanmoins bonjour !",
];

const MALGRE_OPTIONS = [
  "Malgré la pluie, nous sommes sortis.",
  "Je malgré très fatigué.",
  "Malgré que je suis content.",
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    word: "néanmoins",
    question: {
      en: 'Which sentence uses "néanmoins" correctly?',
      ru: 'В каком предложении слово «néanmoins» использовано правильно?',
      kz: '«Néanmoins» сөзі қай сөйлемде дұрыс қолданылған?',
    },
    options: { en: NEANMOINS_OPTIONS, ru: NEANMOINS_OPTIONS, kz: NEANMOINS_OPTIONS },
  },
  {
    id: "q2",
    word: "davantage",
    question: {
      en: '"Davantage" is closest in meaning to:',
      ru: 'Слово «davantage» ближе всего по смыслу к:',
      kz: '«Davantage» сөзінің мағынасы бойынша ең жақыны:',
    },
    options: {
      en: ["Less", "More / further", "Never"],
      ru: ["Меньше", "Больше / ещё", "Никогда"],
      kz: ["Азырақ", "Көбірек / одан әрі", "Ешқашан"],
    },
  },
  {
    id: "q3",
    word: "malgré",
    question: {
      en: 'Choose the correct usage of "malgré":',
      ru: 'Выберите правильное использование слова «malgré»:',
      kz: '«Malgré» сөзінің дұрыс қолданылуын таңдаңыз:',
    },
    options: { en: MALGRE_OPTIONS, ru: MALGRE_OPTIONS, kz: MALGRE_OPTIONS },
  },
];
