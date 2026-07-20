import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import type { VocabularySentenceFeedback } from "@/types/vocabulary";

/**
 * Offline fallback vocabulary-sentence evaluator, used by
 * /api/vocabulary/evaluate when no ANTHROPIC_API_KEY is configured. Grades
 * the student's ACTUAL sentence against the target word — never assumes
 * correct usage, never invents a mistake that isn't really there. This is a
 * small, independent rule set (not shared with the Speaking evaluator) so
 * changes here can never regress Speaking's already-stabilized behavior.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

const ACCENT_MAP: Record<string, string> = {
  à: "a", â: "a", ä: "a", é: "e", è: "e", ê: "e", ë: "e", î: "i", ï: "i",
  ô: "o", ö: "o", ù: "u", û: "u", ü: "u", ç: "c", œ: "oe", æ: "ae",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => ACCENT_MAP[ch] ?? ch)
    .join("");
}

/** Lenient match — invariable words (most of this app's word bank: adverbs,
 * conjunctions, expressions) need an exact match, but a verb like
 * "parvenir" will appear conjugated ("parvenu", "parvient"), so a stem
 * match on the first ~60% of the word is used as a fallback. */
function containsWord(sentence: string, word: string): boolean {
  const normalizedSentence = normalize(sentence);
  const normalizedWord = normalize(word);
  if (normalizedSentence.includes(normalizedWord)) return true;
  const stemLength = Math.max(4, Math.floor(normalizedWord.length * 0.6));
  const stem = normalizedWord.slice(0, stemLength);
  return stem.length >= 4 && normalizedSentence.includes(stem);
}

interface VocabGrammarRule {
  regex: RegExp;
  correction: (matched: string) => string;
  explanation: TranslatedText;
}

const VOCAB_GRAMMAR_RULES: VocabGrammarRule[] = [
  {
    regex: /\bun\s+(maison|voiture|ville|chose|idée|université|semaine|année|table|chambre|cuisine)(?![a-zà-ÿ])/i,
    correction: (m) => m.replace(/\bun\b/i, "une"),
    explanation: {
      en: "This noun is feminine, so it takes \"une\", not \"un\".",
      ru: "Это существительное женского рода, поэтому употребляется с «une», а не «un».",
      kz: "Бұл зат есім әйел тегінде, сондықтан «une» қолданылады, «un» емес.",
    },
  },
  {
    regex: /\bje\s+suis\s+([a-zà-ÿ0-9-]+)\s+ans?\b/i,
    correction: (m) => m.replace(/\bje\s+suis\b/i, "j'ai"),
    explanation: {
      en: "Age is expressed with \"avoir\" (avoir + age), not \"être\".",
      ru: "Возраст выражается с помощью глагола «avoir» (avoir + возраст), а не «être».",
      kz: "Жас мөлшері «avoir» етістігімен беріледі (avoir + жас), «être» емес.",
    },
  },
  {
    regex:
      /\bj['’]ai\s+(allée?s?|arrivée?s?|partie?s?|venue?s?|entrée?s?|sortie?s?|montée?s?|descendue?s?|restée?s?|tombée?s?|née?s?)(?![a-zà-ÿ])/i,
    correction: (m) => m.replace(/j['’]ai/i, "je suis"),
    explanation: {
      en: "This verb takes \"être\" as its auxiliary in the passé composé, not \"avoir\".",
      ru: "Этот глагол в passé composé спрягается с «être», а не с «avoir».",
      kz: "Бұл етістік passé composé-де «être» көмекші етістігімен тіркеседі, «avoir» емес.",
    },
  },
];

function findGrammarMistake(sentence: string): { original: string; correction: string; explanation: TranslatedText } | null {
  for (const rule of VOCAB_GRAMMAR_RULES) {
    const match = sentence.match(rule.regex);
    if (match) {
      return { original: match[0], correction: rule.correction(match[0]), explanation: rule.explanation };
    }
  }
  return null;
}

const MISSING_WORD_TEMPLATES = {
  correctedSentence: (word: string): string => `... ${word} ...`,
  whyWrong: (word: string): TranslatedText => ({
    en: `Your sentence doesn't actually use "${word}" — it needs to appear (in its correct form) for this exercise.`,
    ru: `В вашем предложении на самом деле не используется «${word}» — оно должно присутствовать (в правильной форме) для этого упражнения.`,
    kz: `Сіздің сөйлеміңізде «${word}» сөзі шын мәнінде қолданылмаған — бұл жаттығу үшін ол дұрыс түрде болуы керек.`,
  }),
  explanation: (word: string): TranslatedText => ({
    en: `Try rewriting your sentence so it genuinely includes "${word}" doing real work in the meaning, not just nearby.`,
    ru: `Попробуйте переписать предложение так, чтобы «${word}» действительно участвовало в его смысле, а не было рядом просто так.`,
    kz: `Сөйлемді «${word}» сөзі мағынаға шынымен қатысатындай етіп қайта жазып көріңіз, тек жанында тұрмасын.`,
  }),
};

const ENCOURAGEMENT = {
  correct: {
    en: "Nicely done — you used the word correctly and naturally.",
    ru: "Отлично — вы использовали слово правильно и естественно.",
    kz: "Жарайсыз — сөзді дұрыс және табиғи қолдандыңыз.",
  } as TranslatedText,
  correctedMistake: {
    en: "Good attempt — fix this one grammar point and it'll be a strong sentence.",
    ru: "Хорошая попытка — исправьте этот момент в грамматике, и предложение будет отличным.",
    kz: "Жақсы әрекет — осы грамматикалық сәтті түзетсеңіз, сөйлем мықты болады.",
  } as TranslatedText,
  missingWord: {
    en: "Keep practicing — the goal is to make the word do real work in your own sentence.",
    ru: "Продолжайте практиковаться — цель в том, чтобы слово действительно работало в вашем собственном предложении.",
    kz: "Жаттығуды жалғастырыңыз — мақсат — сөздің өз сөйлеміңізде шынымен қызмет етуі.",
  } as TranslatedText,
};

const NATURAL_SUGGESTION_SHORT: TranslatedText = {
  en: "This is quite short — try building it into a fuller sentence with a bit more detail.",
  ru: "Это довольно коротко — постарайтесь составить более развёрнутое предложение с деталями.",
  kz: "Бұл біршама қысқа — толығырақ детальмен көбірек сөйлем құрып көріңіз.",
};

const USED_CORRECTLY_EXPLANATION: TranslatedText = {
  en: "The word is doing genuine work in this sentence and the grammar around it holds up.",
  ru: "Слово по-настоящему используется в этом предложении, и грамматика вокруг него верна.",
  kz: "Сөз бұл сөйлемде шынымен қызмет етеді және айналасындағы грамматика дұрыс.",
};

export function analyzeVocabularySentence(
  word: string,
  sentence: string,
  _level: DelfLevel,
  language: FeedbackLanguage
): VocabularySentenceFeedback {
  const trimmed = sentence.trim();
  const wordUsed = containsWord(trimmed, word);

  if (!wordUsed) {
    return {
      usedCorrectly: false,
      correctedSentence: MISSING_WORD_TEMPLATES.correctedSentence(word),
      whyWrong: MISSING_WORD_TEMPLATES.whyWrong(word)[language],
      naturalSuggestion: null,
      explanation: MISSING_WORD_TEMPLATES.explanation(word)[language],
      encouragement: ENCOURAGEMENT.missingWord[language],
    };
  }

  const mistake = findGrammarMistake(trimmed);
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const isShort = wordCount < 5;

  if (mistake) {
    return {
      usedCorrectly: true,
      correctedSentence: trimmed.replace(mistake.original, mistake.correction),
      whyWrong: mistake.explanation[language],
      naturalSuggestion: isShort ? NATURAL_SUGGESTION_SHORT[language] : null,
      explanation: mistake.explanation[language],
      encouragement: ENCOURAGEMENT.correctedMistake[language],
    };
  }

  return {
    usedCorrectly: true,
    correctedSentence: trimmed,
    whyWrong: null,
    naturalSuggestion: isShort ? NATURAL_SUGGESTION_SHORT[language] : null,
    explanation: USED_CORRECTLY_EXPLANATION[language],
    encouragement: ENCOURAGEMENT.correct[language],
  };
}
