import type { TopikLevel } from "@/types/topik";
import type { FeedbackLanguage } from "@/types/writing-evaluation";
import type { VocabularyMistake, VocabularySentenceFeedback } from "@/types/vocabulary";
import { findTopikWordEntry } from "./topik-word-of-the-day";

/**
 * Offline fallback vocabulary-sentence evaluator for TOPIK, used by
 * /api/topik/vocabulary/evaluate when no ANTHROPIC_API_KEY is configured.
 * A small, independent rule set for Korean — NOT shared with, or derived
 * from, DELF's lib/mock/vocabulary-evaluation.ts (French-specific function
 * words, accent stripping, and the shared French grammar-rules engine don't
 * apply to Korean), so changes here can never regress DELF's already-
 * stabilized behavior and vice versa.
 *
 * Grades the student's ACTUAL sentence in a fixed order — real sentence
 * attempt? word actually used? does it make sense? any punctuation
 * mistake? — and only decides the final status once every step has run.
 * Never defaults to "correct".
 *
 * Honest limit: genuine open-ended semantic and grammatical judgment for
 * Korean (particle choice, honorifics, irregular conjugation) needs real
 * language understanding a regex engine can't provide in general. The
 * checks below are small, curated, bounded signals — real for the cases
 * they cover, not general understanding. The Claude path
 * (lib/ai/topik-vocabulary-evaluator.ts) is where genuine semantic and
 * grammatical judgment actually happens once ANTHROPIC_API_KEY is
 * configured.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

/** Step 0 — reject inputs that aren't a real sentence attempt at all. A
 * genuine Korean sentence, however simple, either ends with a recognizable
 * sentence-final ending (다/요/까/네/죠/ㅂ니다/습니다, optionally followed by
 * terminal punctuation) or contains at least one grammatical particle
 * (은/는/이/가/을/를/...) attaching it to a real clause structure. A bare
 * list of nouns with nothing grammatically connecting them has neither. */
const SENTENCE_FINAL_ENDINGS = [
  "습니다", "ㅂ니다", "니다", "어요", "아요", "여요", "예요", "이에요",
  "다", "요", "까", "네", "죠", "지", "래", "구나",
];

const KOREAN_PARTICLES = [
  "은", "는", "이", "가", "을", "를", "에서", "에게", "한테", "와", "과",
  "도", "만", "부터", "까지", "의", "으로", "로",
];

function endsLikeSentence(text: string): boolean {
  const stripped = text.replace(/[.!?~\s]+$/g, "");
  return SENTENCE_FINAL_ENDINGS.some((ending) => stripped.endsWith(ending));
}

function hasParticle(text: string): boolean {
  return KOREAN_PARTICLES.some((particle) => text.includes(particle));
}

function looksLikeRealSentence(text: string): boolean {
  const trimmed = text.trim();
  const hangulCount = (trimmed.match(/[가-힣]/g) ?? []).length;
  if (hangulCount < 2) return false;
  return endsLikeSentence(trimmed) || hasParticle(trimmed);
}

/** Step 1 — was the target word actually used. Korean particles and verb/
 * adjective endings attach directly onto the word with no space (agglutinative
 * script), so a simple word-boundary match (as DELF uses for French) would
 * miss real, correct usage like "학교에서" for the noun "학교". Instead: for
 * dictionary-form verbs/adjectives (ending in "다"), match on the stem
 * (word minus "다"), which survives conjugation; for everything else, match
 * the word itself as a substring. */
function containsTargetWord(sentence: string, word: string): boolean {
  const trimmedWord = word.trim();
  if (!trimmedWord) return false;
  if (trimmedWord.endsWith("다") && trimmedWord.length > 1) {
    const stem = trimmedWord.slice(0, -1);
    if (stem.length > 0 && sentence.includes(stem)) return true;
  }
  return sentence.includes(trimmedWord);
}

/** Step 2 — bounded semantic-mismatch check, mirroring DELF's eating/
 * drinking-something-inedible pattern. Real signal for the specific case it
 * covers, not general "does this sentence make sense" understanding. */
const INEDIBLE_OBJECTS = [
  "자동차", "컴퓨터", "책상", "의자", "창문", "생각", "대학교", "회사",
  "도시", "산", "돌", "펜", "휴대폰", "지갑", "우산",
];

function findSemanticMismatch(sentence: string): { verb: string; object: string } | null {
  const hasEat = sentence.includes("먹");
  const hasDrink = ["마시", "마셔", "마셨"].some((form) => sentence.includes(form));
  if (!hasEat && !hasDrink) return null;
  for (const object of INEDIBLE_OBJECTS) {
    if (sentence.includes(object)) {
      return { verb: hasEat ? "먹다" : "마시다", object };
    }
  }
  return null;
}

/** Step 3 — terminal punctuation. Korean has no capitalization concept, but
 * a written sentence conventionally still ends with terminal punctuation
 * (. ! ?), same real-but-narrow signal as DELF's punctuation check. */
const PUNCTUATION_EXPLANATION: TranslatedText = {
  en: "Written Korean sentences end with terminal punctuation (. ! ?).",
  ru: "Письменные корейские предложения заканчиваются знаком препинания (. ! ?).",
  kz: "Жазбаша корей сөйлемдері тыныс белгісімен (. ! ?) аяқталады.",
};

function checkPunctuation(sentence: string, language: FeedbackLanguage): VocabularyMistake | null {
  const trimmed = sentence.trim();
  if (!trimmed) return null;
  if (/[.!?]$/.test(trimmed)) return null;
  return { original: trimmed, correction: `${trimmed}.`, whyWrong: PUNCTUATION_EXPLANATION[language] };
}

const NOT_A_SENTENCE: TranslatedText = {
  en: "This isn't a real sentence — just a word or two with nothing grammatically connecting them. Write a full sentence using the target word.",
  ru: "Это не настоящее предложение — всего одно-два слова без грамматической связи. Напишите полное предложение с целевым словом.",
  kz: "Бұл нақты сөйлем емес — грамматикалық байланысы жоқ бір-екі сөз ғана. Мақсатты сөзді қолданып, толық сөйлем жазыңыз.",
};

const MISSING_WORD_TEMPLATES = {
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

function buildSemanticMismatchExplanation(verb: string, object: string, language: FeedbackLanguage): string {
  const templates: TranslatedText = {
    en: `"${verb} ... ${object}" doesn't make sense — you can't eat or drink ${object}. The grammar may look fine, but the sentence's meaning is wrong.`,
    ru: `«${verb} ... ${object}» не имеет смысла — нельзя съесть или выпить ${object}. Грамматика может выглядеть правильно, но смысл предложения неверен.`,
    kz: `«${verb} ... ${object}» мағынасы жоқ — ${object}-ды жеуге немесе ішуге болмайды. Грамматика дұрыс көрінгенімен, сөйлемнің мағынасы қате.`,
  };
  return templates[language];
}

const ENCOURAGEMENT = {
  correct: {
    en: "Nicely done — you used the word correctly and naturally.",
    ru: "Отлично — вы использовали слово правильно и естественно.",
    kz: "Жарайсыз — сөзді дұрыс және табиғи қолдандыңыз.",
  } as TranslatedText,
  incorrect: {
    en: "Good attempt — fix this and it'll be a strong sentence.",
    ru: "Хорошая попытка — исправьте это, и предложение будет отличным.",
    kz: "Жақсы әрекет — мұны түзетсеңіз, сөйлем мықты болады.",
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
  en: "The word is doing genuine work in this sentence, it fits the meaning, and the sentence reads naturally.",
  ru: "Слово по-настоящему используется в этом предложении, подходит по смыслу, и предложение звучит естественно.",
  kz: "Сөз бұл сөйлемде шынымен қызмет етеді, мағынасына сай келеді, сөйлем табиғи оқылады.",
};

const PUNCTUATION_EXPLANATION_SUMMARY: TranslatedText = {
  en: "Fixing this keeps your original meaning while making the sentence properly punctuated.",
  ru: "Исправление этого сохраняет исходный смысл и делает предложение правильно оформленным.",
  kz: "Мұны түзету бастапқы мағынаны сақтай отырып, сөйлемді дұрыс тыныс белгілерімен рәсімдейді.",
};

export function analyzeTopikVocabularySentence(
  word: string,
  sentence: string,
  _level: TopikLevel,
  language: FeedbackLanguage
): VocabularySentenceFeedback {
  const trimmed = sentence.trim();
  // A real, hand-authored example sentence for this word (if it's in the
  // curated word bank) — used as the "corrected sentence" fallback when
  // there's nothing of the student's own to correct, never a generated
  // placeholder.
  const naturalExample = findTopikWordEntry(word)?.exampleSentences[0] ?? null;

  // Step 0: is this even a real sentence attempt?
  if (!looksLikeRealSentence(trimmed)) {
    return {
      status: "incorrect",
      correctedSentence: naturalExample,
      mistakes: [],
      naturalSuggestion: null,
      explanation: NOT_A_SENTENCE[language],
      encouragement: ENCOURAGEMENT.missingWord[language],
    };
  }

  // Step 1: was the target word actually used?
  if (!containsTargetWord(trimmed, word)) {
    return {
      status: "not-used",
      correctedSentence: naturalExample,
      mistakes: [],
      naturalSuggestion: null,
      explanation: MISSING_WORD_TEMPLATES.explanation(word)[language],
      encouragement: ENCOURAGEMENT.missingWord[language],
    };
  }

  // Step 2: does it make sense (bounded semantic check)?
  const semanticMismatch = findSemanticMismatch(trimmed);

  // Step 3: terminal punctuation.
  const punctuationFix = checkPunctuation(trimmed, language);

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const isShort = wordCount < 3;

  // Step 4 (final): decide status only now, after every check above.
  if (semanticMismatch) {
    const semanticMistake: VocabularyMistake = {
      original: trimmed,
      correction: trimmed,
      whyWrong: buildSemanticMismatchExplanation(semanticMismatch.verb, semanticMismatch.object, language),
    };
    return {
      status: "incorrect",
      correctedSentence: null,
      mistakes: punctuationFix ? [semanticMistake, punctuationFix] : [semanticMistake],
      naturalSuggestion: null,
      explanation: buildSemanticMismatchExplanation(semanticMismatch.verb, semanticMismatch.object, language),
      encouragement: ENCOURAGEMENT.incorrect[language],
    };
  }

  if (punctuationFix) {
    return {
      status: "incorrect",
      correctedSentence: punctuationFix.correction,
      mistakes: [punctuationFix],
      naturalSuggestion: isShort ? NATURAL_SUGGESTION_SHORT[language] : null,
      explanation: PUNCTUATION_EXPLANATION_SUMMARY[language],
      encouragement: ENCOURAGEMENT.incorrect[language],
    };
  }

  return {
    status: "correct",
    correctedSentence: null,
    mistakes: [],
    naturalSuggestion: isShort ? NATURAL_SUGGESTION_SHORT[language] : null,
    explanation: USED_CORRECTLY_EXPLANATION[language],
    encouragement: ENCOURAGEMENT.correct[language],
  };
}
