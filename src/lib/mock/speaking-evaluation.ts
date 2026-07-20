import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import type {
  CompletedTurn,
  MispronuncedWord,
  SpeakingExaminerReport,
  SpeakingGrammarMistake,
  TurnFeedback,
} from "@/types/speaking-evaluation";
import {
  countFillerWords,
  countSentences,
  extractContentWords,
  FILLER_WORDS,
  lexicalDiversity,
  sentenceLengths,
} from "@/lib/evaluation/text-utils";
import { findGrammarMistakes, getGrammarRule } from "@/lib/evaluation/grammar-rules";

/**
 * Offline fallback DELF speaking evaluator, used by the API routes when no
 * ANTHROPIC_API_KEY is configured (see lib/ai/speaking-evaluator.ts for the
 * real Claude path, which returns the same TurnFeedback/SpeakingExaminerReport
 * shapes). analyzeTurn()/localizeTurnFeedback() evaluate one turn at a time;
 * synthesizeReportFromTurns() aggregates the real accumulated CompletedTurn
 * data (actual transcripts, scores, grammar errors) into a final report.
 *
 * Every field here is computed from the real transcript — nothing is
 * selected at random from a canned per-level pool, and nothing is shown
 * unless it's actually earned by what the student said. Text-analysis
 * primitives and grammar-mistake detection are shared with Writing and
 * Vocabulary (see lib/evaluation/).
 *
 * Exam prompts and the student's own answers stay in French; only this
 * AI-generated feedback text is translated.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

/** A curated set of real French words genuinely known to be commonly
 * mispronounced by learners, each with a defensible phonetic reason —
 * matched against the actual transcript (never fabricated), capped at 2
 * per turn. This is a light, honest illustration for the offline fallback;
 * Claude's live path can identify richer, context-specific words. */
interface TrickyWordEntry {
  word: string; // French, matched case-insensitively as a whole word
  note: TranslatedText;
}

const TRICKY_PRONUNCIATION_WORDS: TrickyWordEntry[] = [
  {
    word: "beaucoup",
    note: {
      en: "The final \"p\" is silent — pronounced \"bo-kou\", not \"bo-koup\".",
      ru: "Конечная «p» не произносится — звучит как «бо-ку», а не «бо-куп».",
      kz: "Соңғы «p» айтылмайды — «бо-ку» деп айтылады, «бо-куп» емес.",
    },
  },
  {
    word: "vingt",
    note: {
      en: "Pronounced \"vɛ̃\" — the \"g\" and final \"t\" are silent (except in liaison, e.g. \"vingt-et-un\").",
      ru: "Произносится «вэ̃» — «g» и конечная «t» не произносятся (кроме связки, напр. «vingt-et-un»).",
      kz: "«Вэ̃» деп айтылады — «g» мен соңғы «t» айтылмайды (liaison жағдайынан басқа, мыс. «vingt-et-un»).",
    },
  },
  {
    word: "temps",
    note: {
      en: "The \"p\" and final \"s\" are silent — pronounced simply \"tɑ̃\".",
      ru: "«P» и конечная «s» не произносятся — произносится просто «тɑ̃».",
      kz: "«P» мен соңғы «s» айтылмайды — жай ғана «тɑ̃» деп айтылады.",
    },
  },
  {
    word: "monsieur",
    note: {
      en: "An irregular pronunciation — \"məsjø\", not read letter-by-letter.",
      ru: "Нерегулярное произношение — «məsjø», не читается по буквам.",
      kz: "Ерекше айтылым — «məsjø», әріптеп оқылмайды.",
    },
  },
  {
    word: "femme",
    note: {
      en: "The \"e\" is pronounced like \"a\" — \"fam\", an exception to the usual spelling rule.",
      ru: "«E» произносится как «a» — «фам», исключение из обычного правила чтения.",
      kz: "«E» «a» болып айтылады — «фам», әдеттегі оқылу ережесінің ерекшелігі.",
    },
  },
  {
    word: "toujours",
    note: {
      en: "The final \"s\" IS pronounced here — \"tou-jour-s\", unlike most French plurals.",
      ru: "Здесь конечная «s» ПРОИЗНОСИТСЯ — «ту-жур-с», в отличие от большинства форм множественного числа.",
      kz: "Мұнда соңғы «s» АЙТЫЛАДЫ — «ту-жур-с», көптеген француз көпше түрлерінен өзгеше.",
    },
  },
  {
    word: "aujourd'hui",
    note: {
      en: "Said as one flowing word — \"o-jour-dui\" — don't pause at the apostrophe.",
      ru: "Произносится слитно — «о-жур-дюи» — не делайте паузу на апострофе.",
      kz: "Бір тұтас сөз ретінде айтылады — «о-жур-дюи» — апострофта кідірмеңіз.",
    },
  },
  {
    word: "œufs",
    note: {
      en: "Tricky one: the \"f\" is pronounced in the singular \"œuf\" but silent in the plural \"œufs\".",
      ru: "Сложный случай: «f» произносится в единственном числе «œuf», но не произносится во множественном «œufs».",
      kz: "Күрделі жағдай: жекеше «œuf»-те «f» айтылады, ал көпше «œufs»-те айтылмайды.",
    },
  },
];

function findMispronuncedWords(transcript: string): string[] {
  const lower = transcript.toLowerCase();
  return TRICKY_PRONUNCIATION_WORDS.filter((entry) =>
    new RegExp(`\\b${entry.word.replace(/'/g, "['’]")}\\b`, "i").test(lower)
  )
    .slice(0, 2)
    .map((entry) => entry.word);
}

function localizeMispronuncedWords(words: string[], language: FeedbackLanguage): MispronuncedWord[] {
  return words.map((word) => {
    const entry = TRICKY_PRONUNCIATION_WORDS.find((e) => e.word === word)!;
    return { word: entry.word, note: entry.note[language] };
  });
}

/** Generic, category-keyed "how to avoid this again" tips, reused across
 * every matching mistake rather than hand-authored per template. */
const HOW_TO_AVOID_BY_CATEGORY: Record<SpeakingGrammarMistake["category"], TranslatedText> = {
  verb: {
    en: "Drill this verb's conjugation pattern out loud a few times before your next practice session.",
    ru: "Перед следующей тренировкой несколько раз проговорите вслух спряжение этого глагола.",
    kz: "Келесі жаттығуға дейін осы етістіктің жіктелу үлгісін бірнеше рет дауыстап қайталаңыз.",
  },
  agreement: {
    en: "Pause briefly before nouns to check gender/number agreement — it becomes automatic with practice.",
    ru: "Делайте небольшую паузу перед существительными, чтобы проверить согласование по роду/числу — с практикой это станет автоматическим.",
    kz: "Зат есімнің алдында аздап кідіріп, тек/сан келісімін тексеріңіз — жаттығу арқылы бұл автоматты болады.",
  },
  "sentence-structure": {
    en: "Mentally say the full sentence slowly before speaking it aloud, checking the word order.",
    ru: "Перед тем как сказать вслух, медленно проговорите предложение целиком про себя, проверяя порядок слов.",
    kz: "Дауыстап айтпас бұрын, сөз тәртібін тексеріп, сөйлемді ішіңізден баяу қайталаңыз.",
  },
  other: {
    en: "Note this pattern down and review it before your next speaking practice.",
    ru: "Запишите эту особенность и повторите её перед следующей устной практикой.",
    kz: "Осы үлгіні жазып алып, келесі ауызша жаттығу алдында қайталаңыз.",
  },
};

function buildHowToFix(correction: string, language: FeedbackLanguage): string {
  const templates: TranslatedText = {
    en: `Use "${correction}" instead.`,
    ru: `Используйте «${correction}» вместо этого.`,
    kz: `Оның орнына «${correction}» қолданыңыз.`,
  };
  return templates[language];
}

/** Real relevance detection — compares the actual question's content words
 * against the actual transcript's. Self-introduction questions ("Présentez-
 * vous", "Comment vous appelez-vous ?") don't share literal vocabulary with
 * a valid answer, so that pattern is recognized directly instead. */
const SELF_INTRO_QUESTION_PATTERN = /présent|appelez|votre nom|qui êtes-vous/i;
const SELF_INTRO_ANSWER_PATTERN = /je m['’]appelle|mon nom est|j['’]ai\s+\d+\s+ans|j['’]habite/i;
/** Unambiguous self-introduction markers only ("j'habite"/"j'ai X ans" are
 * too common in ordinary sentences on their own) — used to decide whether
 * an off-topic answer should specifically be called out as "you introduced
 * yourself" rather than the generic mismatch note. */
const UNAMBIGUOUS_SELF_INTRO_PATTERN = /je m['’]appelle|mon nom est/i;

function computeRelevance(prompt: string, transcript: string, wordCount: number): boolean {
  if (wordCount < 3) return false;
  if (SELF_INTRO_QUESTION_PATTERN.test(prompt) && SELF_INTRO_ANSWER_PATTERN.test(transcript)) {
    return true;
  }
  const questionWords = extractContentWords(prompt);
  if (questionWords.length === 0) return wordCount >= 5;
  const answerWords = new Set(extractContentWords(transcript));
  if (questionWords.some((w) => answerWords.has(w))) return true;
  // No shared content words with the question at all — a real DELF answer
  // to a specific question virtually always echoes at least one topic word;
  // zero overlap (regardless of length) means the answer is talking about
  // something else, not developing a paraphrase.
  return false;
}

function buildOffTopicNote(prompt: string, looksLikeSelfIntro: boolean, language: FeedbackLanguage): string {
  if (looksLikeSelfIntro) {
    const selfIntroTemplates: TranslatedText = {
      en: `You introduced yourself instead of answering what was asked ("${prompt}"). Make sure to respond directly to the actual question next time.`,
      ru: `Вы представились вместо того, чтобы ответить на заданный вопрос («${prompt}»). В следующий раз отвечайте именно на заданный вопрос.`,
      kz: `Сіз сұралғанға («${prompt}») жауап берудің орнына өзіңізді таныстырдыңыз. Келесі жолы нақты сұраққа жауап беруге тырысыңыз.`,
    };
    return selfIntroTemplates[language];
  }
  const templates: TranslatedText = {
    en: `This answer doesn't address what was asked ("${prompt}"). Make sure to respond directly to the question before adding extra details.`,
    ru: `Этот ответ не отвечает на заданный вопрос («${prompt}»). Убедитесь, что вы отвечаете именно на вопрос, прежде чем добавлять детали.`,
    kz: `Бұл жауап қойылған сұраққа жауап бермейді («${prompt}»). Қосымша деталь қоспас бұрын сұраққа тікелей жауап беруге көз жеткізіңіз.`,
  };
  return templates[language];
}

/** Real, transcript-grounded answer-structure analysis — checks whether the
 * response actually contains a direct answer, supporting detail, an example
 * (once the answer is developed enough that one would be expected), and a
 * conclusion (once it's long enough that one would round it off), rather
 * than a generic "good structure" note. */
type StructureIssue = "not-relevant" | "missing-support" | "missing-example" | "missing-conclusion" | "none";

const SUPPORTING_DETAIL_PATTERN = /\b(parce que|car|donc|puisque)\b/i;
const EXAMPLE_PATTERN = /\b(par exemple|comme|tel que|telle que)\b/i;
const CONCLUSION_PATTERN = /\b(donc|enfin|voilà|en résumé|bref|en conclusion)\b/i;
const CONNECTOR_PATTERN = /\b(donc|parce que|car|ensuite|puis|alors|cependant|néanmoins|d'abord|enfin)\b/i;

function classifyStructure(transcript: string, relevant: boolean, wordCount: number): StructureIssue {
  if (!relevant) return "not-relevant";
  const hasSupportingDetail = countSentences(transcript) >= 2 || SUPPORTING_DETAIL_PATTERN.test(transcript);
  if (!hasSupportingDetail) return "missing-support";
  if (wordCount >= 15 && !EXAMPLE_PATTERN.test(transcript)) return "missing-example";
  if (wordCount >= 20 && !CONCLUSION_PATTERN.test(transcript)) return "missing-conclusion";
  return "none";
}

const STRUCTURE_NOTES: Record<StructureIssue, TranslatedText> = {
  "not-relevant": {
    en: "Structure can't be fairly assessed here since the answer didn't address the question — focus on answering directly first, then build out detail.",
    ru: "Оценить структуру здесь сложно, так как ответ не отвечал на вопрос — сначала сосредоточьтесь на прямом ответе, а затем добавляйте детали.",
    kz: "Мұнда құрылымды әділ бағалау қиын, себебі жауап сұраққа жауап бермеді — алдымен тікелей жауап беруге назар аударып, содан кейін деталь қосыңыз.",
  },
  "missing-support": {
    en: "The answer is a direct response but stays very brief — add a reason or detail (e.g. with \"parce que...\") to develop it further.",
    ru: "Ответ прямой, но очень краткий — добавьте причину или деталь (например, с «parce que...»), чтобы развить мысль.",
    kz: "Жауап тікелей, бірақ өте қысқа — оны дамыту үшін себеп немесе деталь қосыңыз (мысалы, «parce que...» арқылы).",
  },
  "missing-example": {
    en: "The answer is developed but doesn't include a concrete example — try adding one with \"par exemple...\" to strengthen it.",
    ru: "Ответ развёрнут, но не содержит конкретного примера — попробуйте добавить его через «par exemple...», чтобы усилить ответ.",
    kz: "Жауап дамытылған, бірақ нақты мысал жоқ — оны күшейту үшін «par exemple...» арқылы мысал қосып көріңіз.",
  },
  "missing-conclusion": {
    en: "The answer covers the main point well but doesn't wrap up — a short closing phrase (e.g. \"donc...\" or \"voilà\") would round it off.",
    ru: "Ответ хорошо раскрывает суть, но не завершён — короткая заключительная фраза (например, «donc...» или «voilà») сделала бы его более законченным.",
    kz: "Жауап негізгі ойды жақсы ашады, бірақ аяқталмаған — қысқа қорытынды тіркес (мысалы, «donc...» немесе «voilà») оны толықтырар еді.",
  },
  none: {
    en: "Well-structured: a direct answer, developed with supporting detail, in a clear order.",
    ru: "Хорошо структурировано: прямой ответ, развитый с помощью деталей, в чёткой последовательности.",
    kz: "Жақсы құрылымдалған: тікелей жауап, деталдармен дамытылған, анық ретпен берілген.",
  },
};

/** A rewrite of the student's OWN transcript — never a fresh, unrelated
 * model answer. Applies the real grammar corrections already found, strips
 * filler words, nudges a couple of common basic words to a slightly higher
 * register, and — only when the answer is genuinely thin — appends clearly
 * bracketed placeholder detail (never a concrete invented fact presented as
 * true) demonstrating what a fuller answer would add. */
const VOCAB_UPGRADE_MAP: Record<string, string> = {
  bien: "vraiment bien",
  content: "ravi",
  contente: "ravie",
  bon: "excellent",
  bonne: "excellente",
};

const SELF_INTRO_HAS_AGE = /j['’]ai\s+\d+\s+ans/i;
const SELF_INTRO_HAS_CITY = /j['’]habite|je vis à/i;
const SELF_INTRO_HAS_PROFESSION = /je suis\s+(étudiant|étudiante|lycéen|lycéenne|élève|professeur)|je travaille/i;
const SELF_INTRO_HAS_HOBBY = /j['’]aime|je fais du|je fais de la|mon passe-temps/i;

function buildSelfIntroExpansion(text: string): string {
  const missing: string[] = [];
  if (!SELF_INTRO_HAS_AGE.test(text)) missing.push("j'ai [ton âge] ans");
  if (!SELF_INTRO_HAS_CITY.test(text)) missing.push("j'habite à [ta ville]");
  if (!SELF_INTRO_HAS_PROFESSION.test(text)) missing.push("je suis [ta profession/ton statut]");
  if (!SELF_INTRO_HAS_HOBBY.test(text)) missing.push("j'aime [une de tes passions]");
  if (missing.length === 0) return "";
  const joined =
    missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} et ${missing[missing.length - 1]}`;
  return ` ${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`;
}

const STRUCTURE_PLACEHOLDER_NOTE: Record<"missing-support" | "missing-example" | "missing-conclusion", string> = {
  "missing-support": " [Ajoute ici une raison ou un détail, par exemple avec « parce que ... »]",
  "missing-example": " [Ajoute ici un exemple concret, par exemple avec « par exemple ... »]",
  "missing-conclusion": " [Termine par une courte conclusion, par exemple « donc ... » ou « voilà »]",
};

function buildImprovedAnswer(
  transcript: string,
  matchedMistakes: { original: string; correction: string }[],
  structureIssue: StructureIssue,
  relevant: boolean,
  looksLikeSelfIntro: boolean,
  wordCount: number
): string {
  let improved = transcript.trim();
  for (const m of matchedMistakes) {
    improved = improved.replace(m.original, m.correction);
  }
  for (const filler of FILLER_WORDS) {
    improved = improved.replace(new RegExp(`\\b${filler.replace(/\s+/g, "\\s+")}\\b,?\\s*`, "gi"), "");
  }
  improved = improved.replace(/\s{2,}/g, " ").trim();

  let vocabUpgraded = false;
  // Negative lookbehind avoids "vraiment vraiment bien" when the transcript
  // already intensified the word itself.
  improved = improved.replace(/\b(?<!vraiment\s)(?<!très\s)(bien|content|contente|bon|bonne)\b/i, (word) => {
    if (vocabUpgraded) return word;
    vocabUpgraded = true;
    return VOCAB_UPGRADE_MAP[word.toLowerCase()] ?? word;
  });

  if (!relevant) return improved;

  if (wordCount < 10) {
    if (looksLikeSelfIntro) {
      improved += buildSelfIntroExpansion(improved);
    } else if (
      structureIssue === "missing-support" ||
      structureIssue === "missing-example" ||
      structureIssue === "missing-conclusion"
    ) {
      improved += STRUCTURE_PLACEHOLDER_NOTE[structureIssue];
    }
  }
  return improved;
}

/** One personalized, actionable coaching tip per turn, picked from a
 * ranked list of candidates keyed to this turn's real signals — never a
 * generic boilerplate line, and never repeated verbatim within a session
 * (the caller supplies previously-shown tips to exclude). */
type CoachingTipId =
  | "off-topic"
  | "missing-support"
  | "missing-example"
  | "missing-conclusion"
  | "grammar-verb"
  | "grammar-agreement"
  | "grammar-sentence-structure"
  | "grammar-other"
  | "filler-heavy"
  | "thin-correct"
  | "well-done-push-further"
  | "keep-practicing";

const COACHING_TIPS: Record<CoachingTipId, TranslatedText> = {
  "off-topic": {
    en: "Before you start speaking, repeat the question to yourself so your answer matches exactly what's asked.",
    ru: "Прежде чем начать говорить, мысленно повторите вопрос, чтобы ваш ответ точно соответствовал тому, что спрашивают.",
    kz: "Сөйлемес бұрын сұрақты өзіңізге қайталаңыз, жауабыңыз нақты сұралғанға сай болсын.",
  },
  "missing-support": {
    en: "Your answer was correct but too short — add one reason or detail to develop it.",
    ru: "Ваш ответ был правильным, но слишком коротким — добавьте одну причину или деталь, чтобы развить мысль.",
    kz: "Жауабыңыз дұрыс болды, бірақ тым қысқа — оны дамыту үшін бір себеп немесе деталь қосыңыз.",
  },
  "missing-example": {
    en: "Add one personal example next time to make your answer more convincing.",
    ru: "В следующий раз добавьте один личный пример, чтобы сделать ответ более убедительным.",
    kz: "Келесі жолы жауабыңызды сенімдірек ету үшін бір жеке мысал қосыңыз.",
  },
  "missing-conclusion": {
    en: "Give a reason before finishing — wrap up with a short closing sentence instead of stopping abruptly.",
    ru: "Перед завершением приведите причину — закончите короткой заключительной фразой, а не резко обрывайте ответ.",
    kz: "Аяқтамас бұрын себеп келтіріңіз — кенеттен тоқтамай, қысқа қорытынды сөйлеммен аяқтаңыз.",
  },
  "grammar-verb": {
    en: "Focus on verb conjugation — that's the type of mistake to watch for in your next answer.",
    ru: "Сосредоточьтесь на спряжении глаголов — именно на этот тип ошибок стоит обратить внимание в следующем ответе.",
    kz: "Етістік жіктелуіне назар аударыңыз — келесі жауапта осы қатеге мұқият болыңыз.",
  },
  "grammar-agreement": {
    en: "Watch noun-adjective agreement — check gender and number before you finish a sentence.",
    ru: "Следите за согласованием существительного и прилагательного — проверяйте род и число перед тем, как закончить предложение.",
    kz: "Зат есім мен сын есімнің келісімін қадағалаңыз — сөйлемді аяқтамас бұрын тек пен санды тексеріңіз.",
  },
  "grammar-sentence-structure": {
    en: "Slow down to organize your sentence structure before speaking — that's where this mistake came from.",
    ru: "Не торопитесь и продумывайте структуру предложения перед тем, как говорить — именно отсюда возникла эта ошибка.",
    kz: "Сөйлемес бұрын сөйлем құрылымын ойластыруға уақыт бөліңіз — бұл қате содан туындады.",
  },
  "grammar-other": {
    en: "Review this specific rule before your next answer so you don't repeat it.",
    ru: "Повторите именно это правило перед следующим ответом, чтобы не повторить ошибку.",
    kz: "Осы қатені қайталамау үшін келесі жауап алдында осы ережені қайталаңыз.",
  },
  "filler-heavy": {
    en: "Try replacing filler words like \"euh\" with a short silent pause instead — it will sound more confident.",
    ru: "Попробуйте заменить слова-паразиты вроде «euh» короткой паузой — это прозвучит увереннее.",
    kz: "«Euh» сияқты толықтырғыш сөздердің орнына қысқа үнсіз кідірісті қолданып көріңіз — бұл сенімдірек естіледі.",
  },
  "thin-correct": {
    en: "Correct, but quite short — expand your answer with another sentence next time.",
    ru: "Правильно, но довольно кратко — в следующий раз дополните ответ ещё одним предложением.",
    kz: "Дұрыс, бірақ біршама қысқа — келесі жолы жауабыңызды тағы бір сөйлеммен толықтырыңыз.",
  },
  "well-done-push-further": {
    en: "Well done — this is a strong, complete answer. Use more linking words to push it even further.",
    ru: "Отлично — это сильный, законченный ответ. Используйте больше связующих слов, чтобы сделать его ещё лучше.",
    kz: "Керемет — бұл мықты, толық жауап. Оны одан әрі жақсарту үшін көбірек жалғаулық сөздерді қолданыңыз.",
  },
  "keep-practicing": {
    en: "Keep practicing consistently — small, regular sessions build fluency fastest.",
    ru: "Продолжайте регулярно практиковаться — короткие регулярные занятия быстрее всего развивают беглость речи.",
    kz: "Тұрақты жаттығуды жалғастырыңыз — қысқа әрі жүйелі сабақтар еркін сөйлеуді жылдам дамытады.",
  },
};

function buildCoachingTipCandidates(
  relevant: boolean,
  structureIssue: StructureIssue,
  matchedMistakes: { ruleId: string }[],
  fillerCount: number,
  wordCount: number
): CoachingTipId[] {
  const candidates: CoachingTipId[] = [];
  if (!relevant) candidates.push("off-topic");
  if (structureIssue === "missing-support") candidates.push("missing-support");
  if (structureIssue === "missing-example") candidates.push("missing-example");
  if (structureIssue === "missing-conclusion") candidates.push("missing-conclusion");
  if (matchedMistakes.length > 0) {
    const rule = getGrammarRule(matchedMistakes[0].ruleId);
    if (rule) candidates.push(`grammar-${rule.category}` as CoachingTipId);
  }
  if (fillerCount >= 2) candidates.push("filler-heavy");
  if (relevant && structureIssue === "none" && wordCount < 15) candidates.push("thin-correct");
  if (relevant && structureIssue === "none" && wordCount >= 15 && matchedMistakes.length === 0) {
    candidates.push("well-done-push-further");
  }
  candidates.push("keep-practicing");
  return candidates;
}

function pickCoachingTip(
  candidates: CoachingTipId[],
  previousCoachingTips: string[],
  language: FeedbackLanguage
): string {
  for (const id of candidates) {
    const text = COACHING_TIPS[id][language];
    if (!previousCoachingTips.includes(text)) return text;
  }
  return COACHING_TIPS[candidates[0]][language];
}

/**
 * Real, computed qualitative notes — each one built from actual numbers
 * measured on the transcript (filler ratio, sentence count, lexical
 * diversity, sentence-length spread, recognition confidence, mispronounced-
 * word count), never chosen from a pool of equally-plausible canned
 * sentences. Two turns with different real signals always produce
 * different note text; two turns with the same real signals produce the
 * same note text — deterministic, not random.
 */
function buildFluencyNote(fillerCount: number, sentenceCount: number, wordCount: number, language: FeedbackLanguage): string {
  if (wordCount < 4) {
    return {
      en: "Too short to assess fluency meaningfully — try developing the answer further.",
      ru: "Слишком коротко, чтобы оценить беглость речи — попробуйте развить ответ подробнее.",
      kz: "Еркін сөйлеуді бағалау үшін тым қысқа — жауапты толығырақ дамытып көріңіз.",
    }[language];
  }
  if (fillerCount === 0) {
    return {
      en: `No filler words across ${sentenceCount} sentence${sentenceCount === 1 ? "" : "s"} — fluent, steady delivery.`,
      ru: `Ни одного слова-паразита в ${sentenceCount} предложени${sentenceCount === 1 ? "и" : "ях"} — беглая, ровная речь.`,
      kz: `${sentenceCount} сөйлемде бірде-бір толықтырғыш сөз жоқ — еркін, тұрақты сөйлеу.`,
    }[language];
  }
  if (fillerCount <= 2) {
    return {
      en: `Mostly steady, with ${fillerCount} filler word${fillerCount === 1 ? "" : "s"} while searching for a word.`,
      ru: `В целом ровная речь, но ${fillerCount} слов${fillerCount === 1 ? "о-паразит" : "а-паразита"} при поиске нужного слова.`,
      kz: `Негізінен тұрақты, бірақ сөз іздеу кезінде ${fillerCount} толықтырғыш сөз кездесті.`,
    }[language];
  }
  return {
    en: `Frequent hesitation — ${fillerCount} filler words across the answer while searching for words.`,
    ru: `Частые заминки — ${fillerCount} слов-паразитов за весь ответ во время поиска слов.`,
    kz: `Жиі кідірістер — жауап барысында сөз іздеу кезінде ${fillerCount} толықтырғыш сөз кездесті.`,
  }[language];
}

function buildVocabularyNote(diversity: number, wordCount: number, language: FeedbackLanguage): string {
  const uniqueRatioPercent = Math.round(diversity * 100);
  if (wordCount < 6) {
    return {
      en: "Too short to assess vocabulary range meaningfully — a longer answer would show more.",
      ru: "Слишком коротко, чтобы оценить словарный запас — более развёрнутый ответ покажет больше.",
      kz: "Сөздік қорды бағалау үшін тым қысқа — толығырақ жауап көбірек көрсетер еді.",
    }[language];
  }
  if (diversity >= 0.75) {
    return {
      en: `Wide vocabulary range for this answer — about ${uniqueRatioPercent}% of the content words are distinct, little repetition.`,
      ru: `Широкий словарный запас в этом ответе — около ${uniqueRatioPercent}% значимых слов уникальны, повторов мало.`,
      kz: `Бұл жауапта сөздік қор кең — мағыналы сөздердің шамамен ${uniqueRatioPercent}%-ы қайталанбайды.`,
    }[language];
  }
  if (diversity >= 0.5) {
    return {
      en: `Reasonable vocabulary range, with some repeated words (about ${uniqueRatioPercent}% distinct).`,
      ru: `Приемлемый словарный запас, но есть повторы слов (уникальны около ${uniqueRatioPercent}%).`,
      kz: `Сөздік қор жеткілікті, бірақ кейбір сөздер қайталанады (шамамен ${uniqueRatioPercent}%-ы қайталанбайды).`,
    }[language];
  }
  return {
    en: `Vocabulary was repeated frequently in this answer — only about ${uniqueRatioPercent}% of the content words were distinct.`,
    ru: `В этом ответе словарный запас часто повторялся — уникальны лишь около ${uniqueRatioPercent}% значимых слов.`,
    kz: `Бұл жауапта сөздік қор жиі қайталанды — мағыналы сөздердің шамамен ${uniqueRatioPercent}%-ы ғана қайталанбайды.`,
  }[language];
}

function buildPronunciationNote(
  mispronuncedCount: number,
  recognitionConfidence: number | null,
  language: FeedbackLanguage
): string {
  const confidencePercent = recognitionConfidence !== null ? Math.round(recognitionConfidence * 100) : null;
  if (mispronuncedCount > 0) {
    return {
      en: `${mispronuncedCount} word${mispronuncedCount === 1 ? "" : "s"} flagged below for tricky pronunciation — worth extra practice.`,
      ru: `Ниже отмечено ${mispronuncedCount} слов${mispronuncedCount === 1 ? "о" : "а"} со сложным произношением — стоит потренировать отдельно.`,
      kz: `Төменде айтылуы күрделі ${mispronuncedCount} сөз белгіленді — қосымша жаттығу қажет.`,
    }[language];
  }
  if (confidencePercent !== null && confidencePercent < 65) {
    return {
      en: `Speech recognition confidence was low (about ${confidencePercent}%) — this can indicate unclear pronunciation or background noise.`,
      ru: `Уверенность распознавания речи была низкой (около ${confidencePercent}%) — это может указывать на нечёткое произношение или фоновый шум.`,
      kz: `Сөйлеуді тану сенімділігі төмен болды (шамамен ${confidencePercent}%) — бұл айтылымның бұлдыр болуын немесе фондық шуды білдіруі мүмkін.`,
    }[language];
  }
  if (confidencePercent !== null) {
    return {
      en: `No notably tricky words detected, and recognition confidence was high (about ${confidencePercent}%).`,
      ru: `Заметно сложных слов не обнаружено, уверенность распознавания речи высокая (около ${confidencePercent}%).`,
      kz: `Айтылуы күрделі сөздер байқалмады, сөйлеуді тану сенімділігі жоғары (шамамен ${confidencePercent}%).`,
    }[language];
  }
  return {
    en: "No notably tricky words detected in this answer.",
    ru: "Заметно сложных для произношения слов в этом ответе не обнаружено.",
    kz: "Бұл жауапта айтылуы күрделі сөздер байқалмады.",
  }[language];
}

function buildCoherenceNote(hasConnectors: boolean, sentenceCount: number, language: FeedbackLanguage): string {
  if (sentenceCount <= 1) {
    return {
      en: "A single short statement — too brief to assess how ideas connect to each other.",
      ru: "Одно короткое высказывание — слишком мало, чтобы оценить связность мыслей.",
      kz: "Бір қысқа сөйлем — ойлардың бір-бірімен байланысын бағалау үшін тым аз.",
    }[language];
  }
  if (hasConnectors) {
    return {
      en: `Ideas across ${sentenceCount} sentences were connected with linking words, aiding coherence.`,
      ru: `Мысли в ${sentenceCount} предложениях были связаны союзами, что помогает связности.`,
      kz: `${sentenceCount} сөйлемдегі ойлар жалғаулық сөздермен байланыстырылды, бұл байланыстылыққа көмектеседі.`,
    }[language];
  }
  return {
    en: `${sentenceCount} sentences given, but without clear linking words (e.g. "donc", "parce que") connecting the ideas.`,
    ru: `Дано ${sentenceCount} предложений, но без явных связующих слов (например, «donc», «parce que»).`,
    kz: `${sentenceCount} сөйлем берілді, бірақ ойларды байланыстыратын анық жалғаулық сөздер («donc», «parce que» сияқты) жоқ.`,
  }[language];
}

function buildSentenceVarietyNote(lengths: number[], language: FeedbackLanguage): string {
  if (lengths.length <= 1) {
    return {
      en: "Only one sentence given — no sentence-to-sentence variety to assess yet.",
      ru: "Дано только одно предложение — пока нельзя оценить разнообразие между предложениями.",
      kz: "Тек бір сөйлем берілді — сөйлемдер арасындағы әртүрлілікті әлі бағалау мүмкін емес.",
    }[language];
  }
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const spread = max - min;
  if (spread >= 4) {
    return {
      en: `Sentence length varied from ${min} to ${max} words across the answer, showing real structural variety.`,
      ru: `Длина предложений менялась от ${min} до ${max} слов — это показывает реальное разнообразие структуры.`,
      kz: `Сөйлем ұзындығы ${min}-ден ${max} сөзге дейін өзгерді — бұл нақты құрылымдық әртүрлілікті көрсетеді.`,
    }[language];
  }
  return {
    en: `Sentences were fairly similar in length (${min}-${max} words) — try varying sentence structure more.`,
    ru: `Предложения были довольно похожи по длине (${min}-${max} слов) — попробуйте больше разнообразить структуру.`,
    kz: `Сөйлемдер ұзындығы жағынан біршама ұқсас болды (${min}-${max} сөз) — құрылымды көбірек әртараптандырып көріңіз.`,
  }[language];
}

function buildNaturalnessNote(hasNaturalnessIssue: boolean, language: FeedbackLanguage): string {
  if (hasNaturalnessIssue) {
    return {
      en: "One phrasing choice below sounds translated or awkward rather than natural French — see the flagged point.",
      ru: "Один из оборотов ниже звучит как перевод, а не естественная французская речь — см. отмеченный пункт.",
      kz: "Төмендегі бір тіркес табиғи француз тілінен гөрі аудармаға ұқсайды — белгіленген тармақты қараңыз.",
    }[language];
  }
  return {
    en: "Phrasing sounds natural for this level, with no translated-sounding expressions detected.",
    ru: "Формулировки звучат естественно для этого уровня, переводных по звучанию выражений не обнаружено.",
    kz: "Тіркестер осы деңгейге табиғи естіледі, аудармаға ұқсас өрнектер байқалмады.",
  }[language];
}

const LEVEL_SCORE_CEILING: Record<DelfLevel, number> = { A1: 20, A2: 21, B1: 22, B2: 23 };

/** A transparent, point-based score — starts from a level-appropriate
 * ceiling and subtracts real, itemized deductions for real detected
 * issues. No random component anywhere; identical input always produces
 * identical output. */
function computeTurnScore(
  level: DelfLevel,
  relevant: boolean,
  mistakeCount: number,
  structureIssue: StructureIssue,
  fillerCount: number,
  wordCount: number
): number {
  let score = LEVEL_SCORE_CEILING[level];
  score -= mistakeCount * 2;
  if (structureIssue === "missing-support") score -= 2;
  if (structureIssue === "missing-example" || structureIssue === "missing-conclusion") score -= 1;
  score -= Math.min(fillerCount, 4);
  if (wordCount < 5) score -= 3;
  score = Math.max(5, Math.min(25, score));
  // Task achievement is heavily weighted in real DELF grading — an answer
  // that doesn't address the question is capped well below a passing score.
  if (!relevant) score = Math.min(score, 10);
  return score;
}

const STRENGTH_RELEVANT: TranslatedText = {
  en: "Answered exactly what was asked",
  ru: "Ответил(а) именно на то, что было спрошено",
  kz: "Дәл сұралғанға жауап берді",
};
const STRENGTH_NO_MISTAKES: TranslatedText = {
  en: "No grammar mistakes detected in this answer",
  ru: "В этом ответе не обнаружено грамматических ошибок",
  kz: "Бұл жауапта грамматикалық қателер табылмады",
};
const STRENGTH_WELL_STRUCTURED: TranslatedText = {
  en: "Well-structured answer with supporting detail",
  ru: "Хорошо структурированный ответ с подкрепляющими деталями",
  kz: "Қолдаушы деталдары бар жақсы құрылымдалған жауап",
};
const STRENGTH_NO_FILLERS: TranslatedText = {
  en: "Delivered without filler words",
  ru: "Произнесено без слов-паразитов",
  kz: "Толықтырғыш сөздерсіз айтылды",
};
const STRENGTH_GOOD_VOCAB: TranslatedText = {
  en: "Used a good range of vocabulary without much repetition",
  ru: "Использован хороший словарный запас без сильных повторов",
  kz: "Қайталаусыз жақсы сөздік қор қолданылды",
};

const WEAKNESS_OFF_TOPIC: TranslatedText = {
  en: "Didn't address what was actually asked",
  ru: "Не ответил(а) на то, что реально спрашивалось",
  kz: "Нақты сұралғанға жауап бермеді",
};
function buildMistakeWeakness(count: number, language: FeedbackLanguage): string {
  return {
    en: `${count} grammar mistake${count === 1 ? "" : "s"} found in this answer`,
    ru: `В этом ответе найдено ${count} грамматическ${count === 1 ? "ая ошибка" : "их ошибки"}`,
    kz: `Бұл жауаптан ${count} грамматикалық қате табылды`,
  }[language];
}
const WEAKNESS_FILLER_HEAVY: TranslatedText = {
  en: "Frequent filler words while searching for vocabulary",
  ru: "Частые слова-паразиты во время поиска нужных слов",
  kz: "Сөз іздеу кезінде толықтырғыш сөздер жиі кездеседі",
};
const WEAKNESS_LOW_VOCAB: TranslatedText = {
  en: "Vocabulary repeated frequently instead of varying word choice",
  ru: "Словарный запас часто повторялся вместо разнообразия выбора слов",
  kz: "Сөз таңдауын әртараптандырудың орнына сөздік қор жиі қайталанды",
};

const SUGGESTION_RE_READ_QUESTION: TranslatedText = {
  en: "Before answering, repeat the question in your head to make sure you address exactly what's asked",
  ru: "Перед ответом мысленно повторите вопрос, чтобы убедиться, что вы отвечаете именно на него",
  kz: "Жауап бермес бұрын сұрақты ойыңызда қайталап, нақты соған жауап беріп жатқаныңызға көз жеткізіңіз",
};
function buildFillerSuggestion(language: FeedbackLanguage): string {
  return COACHING_TIPS["filler-heavy"][language];
}
function buildVocabSuggestion(language: FeedbackLanguage): string {
  return {
    en: "Try using a synonym instead of repeating the same word in your next answer",
    ru: "Попробуйте использовать синоним вместо повторения одного и того же слова в следующем ответе",
    kz: "Келесі жауапта бір сөзді қайталаудың орнына синоним қолданып көріңіз",
  }[language];
}

function buildTurnStrengths(
  relevant: boolean,
  mistakeCount: number,
  structureIssue: StructureIssue,
  fillerCount: number,
  diversity: number,
  wordCount: number,
  language: FeedbackLanguage
): string[] {
  const strengths: string[] = [];
  if (relevant) strengths.push(STRENGTH_RELEVANT[language]);
  if (relevant && mistakeCount === 0) strengths.push(STRENGTH_NO_MISTAKES[language]);
  if (structureIssue === "none") strengths.push(STRENGTH_WELL_STRUCTURED[language]);
  if (fillerCount === 0 && wordCount >= 5) strengths.push(STRENGTH_NO_FILLERS[language]);
  if (diversity >= 0.75 && wordCount >= 8) strengths.push(STRENGTH_GOOD_VOCAB[language]);
  return strengths.slice(0, 3);
}

function buildTurnWeaknesses(
  relevant: boolean,
  mistakeCount: number,
  structureIssue: StructureIssue,
  fillerCount: number,
  diversity: number,
  wordCount: number,
  language: FeedbackLanguage
): string[] {
  const weaknesses: string[] = [];
  if (!relevant) weaknesses.push(WEAKNESS_OFF_TOPIC[language]);
  if (mistakeCount > 0) weaknesses.push(buildMistakeWeakness(mistakeCount, language));
  if (relevant && structureIssue !== "none" && structureIssue !== "not-relevant") {
    weaknesses.push(STRUCTURE_NOTES[structureIssue][language]);
  }
  if (fillerCount >= 3) weaknesses.push(WEAKNESS_FILLER_HEAVY[language]);
  if (diversity < 0.5 && wordCount >= 8) weaknesses.push(WEAKNESS_LOW_VOCAB[language]);
  return weaknesses.slice(0, 3);
}

function buildTurnSuggestions(
  relevant: boolean,
  matchedMistakes: { ruleId: string }[],
  structureIssue: StructureIssue,
  fillerCount: number,
  diversity: number,
  wordCount: number,
  language: FeedbackLanguage
): string[] {
  const suggestions: string[] = [];
  if (!relevant) suggestions.push(SUGGESTION_RE_READ_QUESTION[language]);
  if (matchedMistakes.length > 0) {
    const rule = getGrammarRule(matchedMistakes[0].ruleId);
    if (rule) suggestions.push(HOW_TO_AVOID_BY_CATEGORY[rule.category][language]);
  }
  if (structureIssue === "missing-support" || structureIssue === "missing-example" || structureIssue === "missing-conclusion") {
    suggestions.push(COACHING_TIPS[structureIssue][language]);
  }
  if (fillerCount >= 3) suggestions.push(buildFillerSuggestion(language));
  if (diversity < 0.5 && wordCount >= 8) suggestions.push(buildVocabSuggestion(language));
  return suggestions.filter(Boolean).slice(0, 3);
}

/** Language-neutral result of analyzing one spoken (typed) answer — safe
 * to accumulate in client state and send back for the session report. */
export interface TurnSelection {
  level: DelfLevel;
  partId: string;
  questionId: string;
  /** The actual French question — kept so an off-topic answer can be
   * explained by quoting what was really asked, never invented. */
  prompt: string;
  wordCount: number;
  relevant: boolean;
  /** True when the transcript reads as a self-introduction, regardless of
   * whether that's what was asked — used to explain off-topic answers
   * precisely instead of with a generic mismatch note. */
  looksLikeSelfIntro: boolean;
  structureIssue: StructureIssue;
  /** A rewrite of the student's own transcript — see buildImprovedAnswer. */
  improvedAnswer: string;
  coachingTipCandidates: CoachingTipId[];
  matchedMistakes: { ruleId: string; original: string; correction: string; sentence: string }[];
  fillerCount: number;
  mispronuncedWords: string[];
  recognitionConfidence: number | null;
  turnScore: number;
  /** Real signals computed from the transcript in analyzeTurn (which has
   * the raw text) and carried language-neutral through to localizeTurnFeedback
   * (which builds the translated notes from them) — the transcript itself
   * isn't stored here, only what was actually measured on it. */
  sentenceCount: number;
  vocabularyDiversity: number;
  hasConnectors: boolean;
  sentenceLengthsList: number[];
  hasNaturalnessIssue: boolean;
}

export function analyzeTurn(
  level: DelfLevel,
  partId: string,
  questionId: string,
  prompt: string,
  responseText: string,
  wordCount: number,
  recognitionConfidence: number | null = null
): TurnSelection {
  const relevant = computeRelevance(prompt, responseText, wordCount);
  const looksLikeSelfIntro = UNAMBIGUOUS_SELF_INTRO_PATTERN.test(responseText);
  const structureIssue = classifyStructure(responseText, relevant, wordCount);
  const fillerCount = countFillerWords(responseText);
  const matchedMistakes = findGrammarMistakes(responseText);
  const improvedAnswer = buildImprovedAnswer(
    responseText,
    matchedMistakes,
    structureIssue,
    relevant,
    looksLikeSelfIntro,
    wordCount
  );
  const coachingTipCandidates = buildCoachingTipCandidates(
    relevant,
    structureIssue,
    matchedMistakes,
    fillerCount,
    wordCount
  );

  const turnScore = computeTurnScore(level, relevant, matchedMistakes.length, structureIssue, fillerCount, wordCount);
  const mispronuncedWords = findMispronuncedWords(responseText);

  const sentenceCount = countSentences(responseText);
  const vocabularyDiversity = lexicalDiversity(responseText);
  const hasConnectors = CONNECTOR_PATTERN.test(responseText);
  const sentenceLengthsList = sentenceLengths(responseText);
  const hasNaturalnessIssue = matchedMistakes.some((m) => getGrammarRule(m.ruleId)?.category === "other");

  return {
    level,
    partId,
    questionId,
    prompt,
    wordCount,
    relevant,
    looksLikeSelfIntro,
    structureIssue,
    improvedAnswer,
    coachingTipCandidates,
    matchedMistakes,
    fillerCount,
    mispronuncedWords,
    recognitionConfidence,
    turnScore,
    sentenceCount,
    vocabularyDiversity,
    hasConnectors,
    sentenceLengthsList,
    hasNaturalnessIssue,
  };
}

export function localizeTurnFeedback(
  selection: TurnSelection,
  language: FeedbackLanguage,
  previousCoachingTips: string[] = []
): TurnFeedback {
  const grammarErrors: SpeakingGrammarMistake[] = selection.matchedMistakes.map((m) => {
    const rule = getGrammarRule(m.ruleId)!;
    return {
      original: m.original,
      correction: m.correction,
      sentence: m.sentence,
      category: rule.category,
      whyWrong: rule.explanation[language],
      howToFix: buildHowToFix(m.correction, language),
      betterExample: rule.betterExample,
      howToAvoid: HOW_TO_AVOID_BY_CATEGORY[rule.category][language],
    };
  });

  const taskCompletionNote = selection.relevant
    ? {
        en: "Directly addressed the question that was asked.",
        ru: "Прямо ответил(а) на заданный вопрос.",
        kz: "Қойылған сұраққа тікелей жауап берді.",
      }[language]
    : buildOffTopicNote(selection.prompt, selection.looksLikeSelfIntro, language);

  const fluencyNote = buildFluencyNote(selection.fillerCount, selection.sentenceCount, selection.wordCount, language);
  const vocabularyNote = buildVocabularyNote(selection.vocabularyDiversity, selection.wordCount, language);
  const pronunciationNote = buildPronunciationNote(
    selection.mispronuncedWords.length,
    selection.recognitionConfidence,
    language
  );
  const coherenceNote = buildCoherenceNote(selection.hasConnectors, selection.sentenceCount, language);
  const sentenceVarietyNote = buildSentenceVarietyNote(selection.sentenceLengthsList, language);
  const naturalnessNote = buildNaturalnessNote(selection.hasNaturalnessIssue, language);

  const mispronuncedWords = localizeMispronuncedWords(selection.mispronuncedWords, language);
  const strengths = buildTurnStrengths(
    selection.relevant,
    selection.matchedMistakes.length,
    selection.structureIssue,
    selection.fillerCount,
    selection.vocabularyDiversity,
    selection.wordCount,
    language
  );
  const areasForImprovement = buildTurnWeaknesses(
    selection.relevant,
    selection.matchedMistakes.length,
    selection.structureIssue,
    selection.fillerCount,
    selection.vocabularyDiversity,
    selection.wordCount,
    language
  );
  const suggestions = buildTurnSuggestions(
    selection.relevant,
    selection.matchedMistakes,
    selection.structureIssue,
    selection.fillerCount,
    selection.vocabularyDiversity,
    selection.wordCount,
    language
  );

  const encouragement: TranslatedText = selection.relevant
    ? {
        en: "Good answer — let's move on to the next question.",
        ru: "Хороший ответ — переходим к следующему вопросу.",
        kz: "Жақсы жауап — келесі сұраққа өтейік.",
      }
    : {
        en: "Listen carefully to the question and try again next time — answer what's actually asked.",
        ru: "В следующий раз внимательно слушайте вопрос и отвечайте именно на то, что спрашивается.",
        kz: "Келесі жолы сұрақты мұқият тыңдап, нақты сұралғанға жауап беруге тырысыңыз.",
      };

  return {
    relevance: selection.relevant,
    taskCompletionNote,
    coherenceNote,
    grammarErrors,
    vocabularyNote,
    sentenceVarietyNote,
    fluencyNote,
    pronunciationNote,
    mispronuncedWords,
    naturalnessNote,
    structureNote: STRUCTURE_NOTES[selection.structureIssue][language],
    strengths,
    areasForImprovement,
    suggestions,
    improvedAnswer: selection.improvedAnswer,
    coachingTip: pickCoachingTip(selection.coachingTipCandidates, previousCoachingTips, language),
    encouragement: encouragement[language],
    turnScore: selection.turnScore,
  };
}

/** Finds grammar mistakes that recurred across at least two turns —
 * grouped by category+original text since real per-turn feedback carries
 * full SpeakingGrammarMistake objects, not ids into a shared pool. */
function findRepeatedErrors(completedTurns: CompletedTurn[]): SpeakingGrammarMistake[] {
  const counts = new Map<string, { error: SpeakingGrammarMistake; count: number }>();
  for (const turn of completedTurns) {
    for (const error of turn.feedback.grammarErrors) {
      const key = `${error.category}:${error.original}`;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { error, count: 1 });
    }
  }
  return [...counts.values()].filter((v) => v.count >= 2).map((v) => v.error);
}

const TASK_COMPLETION_SUMMARY = {
  complete: (level: DelfLevel): TranslatedText => ({
    en: `All parts of the DELF ${level} speaking exam were completed.`,
    ru: `Все части устного экзамена DELF ${level} были выполнены.`,
    kz: `DELF ${level} ауызша емтиханының барлық бөлімдері орындалды.`,
  }),
  withIssues: (irrelevantCount: number, total: number): TranslatedText => ({
    en: `${total - irrelevantCount} of ${total} answers directly addressed the question asked; ${irrelevantCount} did not stay on topic.`,
    ru: `${total - irrelevantCount} из ${total} ответов напрямую отвечали на заданный вопрос; ${irrelevantCount} не соответствовали теме.`,
    kz: `${total} жауаптың ${total - irrelevantCount}-і қойылған сұраққа тікелей жауап берді; ${irrelevantCount}-і тақырыптан ауытқыды.`,
  }),
};

const ALL_RELEVANT_STRENGTH: TranslatedText = {
  en: "Addressed every question directly, without going off-topic",
  ru: "Отвечал(а) на каждый вопрос по существу, не отклоняясь от темы",
  kz: "Тақырыптан ауытқымай, әрбір сұраққа тікелей жауап берді",
};

const IMPROVEMENT_STRENGTH: TranslatedText = {
  en: "Showed clear improvement as the session progressed",
  ru: "Показал(а) явное улучшение по ходу сессии",
  kz: "Сессия барысында айқын жақсару көрсетті",
};

const NO_REPEATED_ERRORS_STRENGTH: TranslatedText = {
  en: "No grammar mistake repeated more than once across the session",
  ru: "Ни одна грамматическая ошибка не повторилась за всю сессию",
  kz: "Сессия бойы бірде-бір грамматикалық қате қайталанбады",
};

function buildIrrelevantWeakness(count: number, total: number): TranslatedText {
  return {
    en: `${count} of ${total} answers didn't address the question that was actually asked`,
    ru: `${count} из ${total} ответов не отвечали на заданный вопрос`,
    kz: `${total} жауаптың ${count}-і нақты қойылған сұраққа жауап бермеді`,
  };
}

function buildRecurringPronunciationNote(words: string[]): TranslatedText {
  return {
    en: `Pronunciation of "${words.join("\", \"")}" came up more than once — worth extra practice.`,
    ru: `Произношение слов «${words.join("», «")}» повторялось несколько раз — стоит потренировать отдельно.`,
    kz: `«${words.join("», «")}» сөздерінің айтылымы бірнеше рет қайталанды — қосымша жаттығу қажет.`,
  };
}

const CONSISTENCY_WEAKNESS: TranslatedText = {
  en: "Performance dipped in the later part of the session — pace yourself to stay consistent",
  ru: "Результат снизился во второй части сессии — старайтесь сохранять темп до конца",
  kz: "Сессияның екінші бөлігінде нәтиже төмендеді — соңына дейін қарқынды сақтауға тырысыңыз",
};

const LOW_VOCABULARY_VARIETY_WEAKNESS: TranslatedText = {
  en: "Vocabulary was fairly repetitive across answers — the same words came up often instead of varied alternatives",
  ru: "Словарный запас был довольно однообразным в ответах — часто повторялись одни и те же слова вместо разных альтернатив",
  kz: "Жауаптарда сөздік қор біршама бірыңғай болды — әртүрлі баламалардың орнына бір сөздер жиі қайталанды",
};

const LOW_VOCABULARY_VARIETY_SUGGESTION: TranslatedText = {
  en: "Before your next session, note 2-3 synonyms for words you use often, and try working them into your answers",
  ru: "Перед следующей сессией запишите 2-3 синонима для часто используемых слов и постарайтесь использовать их в ответах",
  kz: "Келесі сессияға дейін жиі қолданатын сөздерге 2-3 синоним жазып алып, оларды жауаптарыңызға қосуға тырысыңыз",
};

const RE_READ_QUESTION_SUGGESTION: TranslatedText = SUGGESTION_RE_READ_QUESTION;

const RECURRING_STRUCTURE_WEAKNESS: Record<Exclude<StructureIssue, "not-relevant" | "none">, TranslatedText> = {
  "missing-support": {
    en: "Several answers stayed too brief without a supporting reason or detail",
    ru: "Несколько ответов оставались слишком краткими без причины или детали",
    kz: "Бірнеше жауап себеп немесе деталсыз тым қысқа қалды",
  },
  "missing-example": {
    en: "Several developed answers didn't include a concrete example",
    ru: "В нескольких развёрнутых ответах не было конкретного примера",
    kz: "Бірнеше дамытылған жауапта нақты мысал болмады",
  },
  "missing-conclusion": {
    en: "Several longer answers didn't wrap up with a closing statement",
    ru: "Несколько более длинных ответов не завершались заключительной фразой",
    kz: "Бірнеше ұзақ жауап қорытынды сөйлемсіз аяқталды",
  },
};

const RECURRING_STRUCTURE_SUGGESTION: Record<Exclude<StructureIssue, "not-relevant" | "none">, TranslatedText> = {
  "missing-support": {
    en: "Add at least one reason or detail to each answer, e.g. with \"parce que...\"",
    ru: "Добавляйте хотя бы одну причину или деталь к каждому ответу, например с «parce que...»",
    kz: "Әр жауапқа кемінде бір себеп немесе деталь қосыңыз, мысалы «parce que...» арқылы",
  },
  "missing-example": {
    en: "Practice adding a concrete example to longer answers with \"par exemple...\"",
    ru: "Тренируйтесь добавлять конкретный пример к более длинным ответам через «par exemple...»",
    kz: "Ұзағырақ жауаптарға «par exemple...» арқылы нақты мысал қосуды жаттығыңыз",
  },
  "missing-conclusion": {
    en: "Close longer answers with a short wrap-up phrase like \"donc...\" or \"voilà\"",
    ru: "Завершайте более длинные ответы короткой заключительной фразой вроде «donc...» или «voilà»",
    kz: "Ұзағырақ жауаптарды «donc...» немесе «voilà» сияқты қысқа қорытынды тіркеспен аяқтаңыз",
  },
};

function buildPracticeWordsSuggestion(words: string[]): TranslatedText {
  return {
    en: `Practice saying "${words.join("\", \"")}" out loud a few times before your next session`,
    ru: `Потренируйтесь произносить «${words.join("», «")}» вслух несколько раз перед следующей сессией`,
    kz: `Келесі сессияға дейін «${words.join("», «")}» сөздерін бірнеше рет дауыстап айтып жаттығыңыз`,
  };
}

const GRAMMAR_SUMMARY = {
  withErrors: (count: number, level: DelfLevel): TranslatedText => ({
    en: `Found ${count} recurring error pattern${count === 1 ? "" : "s"} typical of ${level} learners across the session.`,
    ru: `Обнаружено ${count} повторяющихся ошибок, типичных для уровня ${level}, за всю сессию.`,
    kz: `Сессия бойы ${level} деңгейіндегі оқушыларға тән ${count} қайталанатын қате анықталды.`,
  }),
  noErrors: {
    en: "No major recurring grammar patterns flagged across the session.",
    ru: "Существенных повторяющихся грамматических ошибок за сессию не обнаружено.",
    kz: "Сессия бойы елеулі қайталанатын грамматикалық қателер табылмады.",
  } as TranslatedText,
};

const SCORE_EXPLANATION = {
  strong: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A strong result — ${score}/${scoreOutOf} indicates this session would likely meet the DELF ${level} passing standard comfortably.`,
    ru: `Хороший результат — ${score}/${scoreOutOf} говорит о том, что эта сессия, скорее всего, уверенно соответствует проходному уровню DELF ${level}.`,
    kz: `Жақсы нәтиже — ${score}/${scoreOutOf} бұл сессияның DELF ${level} өту деңгейіне сенімді сай келетінін көрсетеді.`,
  }),
  borderline: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A borderline result — ${score}/${scoreOutOf} is close to the DELF ${level} passing standard but needs refinement.`,
    ru: `Пограничный результат — ${score}/${scoreOutOf} близок к проходному уровню DELF ${level}, но требует доработки.`,
    kz: `Шекаралық нәтиже — ${score}/${scoreOutOf} DELF ${level} өту деңгейіне жақын, бірақ жетілдіруді қажет етеді.`,
  }),
  weak: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `Below the target — ${score}/${scoreOutOf} suggests more practice is needed to reach the DELF ${level} passing standard.`,
    ru: `Ниже целевого уровня — ${score}/${scoreOutOf} говорит о необходимости дополнительной практики для достижения проходного уровня DELF ${level}.`,
    kz: `Мақсатты деңгейден төмен — ${score}/${scoreOutOf} DELF ${level} өту деңгейіне жету үшін қосымша жаттығу қажет екенін білдіреді.`,
  }),
};

/** Offline fallback (no ANTHROPIC_API_KEY configured) — aggregates the real
 * accumulated per-turn data (actual transcripts, actual scores, actual
 * grammar errors already produced per-turn) into a session report. Every
 * field is computed from this specific session's real turns — vocabulary
 * and fluency summaries included, which previously fell back to a static
 * per-level lookup regardless of what actually happened in the session. */
export function synthesizeReportFromTurns(
  completedTurns: CompletedTurn[],
  level: DelfLevel,
  language: FeedbackLanguage
): SpeakingExaminerReport {
  const levelConfig = DELF_SPEAKING_LEVELS[level];

  const commonErrors = findRepeatedErrors(completedTurns);

  const fullTranscript = completedTurns.map((t) => t.transcript).join(" ");
  const fillerTotal = countFillerWords(fullTranscript);
  const fillerExamples = FILLER_WORDS.filter((word) =>
    new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "i").test(fullTranscript)
  ).slice(0, 3);

  const completedPartIds = new Set(completedTurns.map((t) => t.partId));
  const partsCompleted = levelConfig.parts
    .filter((part) => completedPartIds.has(part.id))
    .map((part) => part.partLabel);

  const total = completedTurns.length;
  const irrelevantCount = completedTurns.filter((t) => !t.feedback.relevance).length;

  const mispronouncedCounts = new Map<string, number>();
  for (const t of completedTurns) {
    for (const mw of t.feedback.mispronuncedWords) {
      mispronouncedCounts.set(mw.word, (mispronouncedCounts.get(mw.word) ?? 0) + 1);
    }
  }
  const recurringMispronounced = [...mispronouncedCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([word]) => word);

  // Recurring structure gaps: re-classify each turn's real transcript (the
  // per-turn StructureIssue itself isn't stored on CompletedTurn, so this
  // re-derives it from the same real data rather than adding a new field).
  const structureIssueCounts = new Map<Exclude<StructureIssue, "not-relevant" | "none">, number>();
  for (const t of completedTurns) {
    const issue = classifyStructure(t.transcript, t.feedback.relevance, t.wordCount);
    if (issue === "not-relevant" || issue === "none") continue;
    structureIssueCounts.set(issue, (structureIssueCounts.get(issue) ?? 0) + 1);
  }
  const recurringStructureIssue = [...structureIssueCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const hasRecurringStructureIssue = !!recurringStructureIssue && recurringStructureIssue[1] >= 2;

  // Vocabulary breadth: unique content words ÷ total content words across
  // the whole session — a real, bounded signal used both for the weakness
  // check AND as the session's actual vocabulary summary/range note.
  const fullContentWords = extractContentWords(fullTranscript);
  const uniqueContentWordCount = new Set(fullContentWords).size;
  const sessionDiversity = fullContentWords.length > 0 ? uniqueContentWordCount / fullContentWords.length : 1;
  const hasLowVocabularyVariety = fullContentWords.length >= 15 && sessionDiversity < 0.55;

  const average = (nums: number[]) => (nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length);
  const half = Math.ceil(total / 2);
  const firstHalfAvg = average(completedTurns.slice(0, half).map((t) => t.feedback.turnScore));
  const secondHalfAvg = average(completedTurns.slice(half).map((t) => t.feedback.turnScore));
  const improved = total >= 4 && secondHalfAvg - firstHalfAvg >= 2;
  const declined = total >= 4 && firstHalfAvg - secondHalfAvg >= 2;

  const estimatedScore = Math.max(
    5,
    Math.min(25, Math.round(completedTurns.reduce((sum, t) => sum + t.feedback.turnScore, 0) / Math.max(1, total)))
  );
  const scoreOutOf = 25;
  const ratio = estimatedScore / scoreOutOf;
  const tier = ratio >= 0.75 ? "strong" : ratio >= 0.5 ? "borderline" : "weak";

  // Every list below is built entirely from real observations about this
  // specific session — never a static per-level fallback.
  const dynamicStrengths: string[] = [];
  if (total > 0 && irrelevantCount === 0) dynamicStrengths.push(ALL_RELEVANT_STRENGTH[language]);
  if (improved) dynamicStrengths.push(IMPROVEMENT_STRENGTH[language]);
  if (total >= 2 && commonErrors.length === 0) dynamicStrengths.push(NO_REPEATED_ERRORS_STRENGTH[language]);
  if (sessionDiversity >= 0.75 && fullContentWords.length >= 10) dynamicStrengths.push(STRENGTH_GOOD_VOCAB[language]);
  if (fillerTotal === 0 && total > 0) dynamicStrengths.push(STRENGTH_NO_FILLERS[language]);
  const strengths = dynamicStrengths.slice(0, 3);

  const dynamicWeaknesses: string[] = [];
  if (irrelevantCount > 0) dynamicWeaknesses.push(buildIrrelevantWeakness(irrelevantCount, total)[language]);
  if (recurringMispronounced.length > 0) {
    dynamicWeaknesses.push(buildRecurringPronunciationNote(recurringMispronounced)[language]);
  }
  if (declined) dynamicWeaknesses.push(CONSISTENCY_WEAKNESS[language]);
  if (hasRecurringStructureIssue) {
    dynamicWeaknesses.push(RECURRING_STRUCTURE_WEAKNESS[recurringStructureIssue[0]][language]);
  }
  if (hasLowVocabularyVariety) dynamicWeaknesses.push(LOW_VOCABULARY_VARIETY_WEAKNESS[language]);
  const weaknesses = dynamicWeaknesses.slice(0, 3);

  const dynamicSuggestions: string[] = [];
  if (irrelevantCount > 0) dynamicSuggestions.push(RE_READ_QUESTION_SUGGESTION[language]);
  if (recurringMispronounced.length > 0) dynamicSuggestions.push(buildPracticeWordsSuggestion(recurringMispronounced)[language]);
  if (commonErrors.length > 0) dynamicSuggestions.push(HOW_TO_AVOID_BY_CATEGORY[commonErrors[0].category][language]);
  if (hasRecurringStructureIssue) {
    dynamicSuggestions.push(RECURRING_STRUCTURE_SUGGESTION[recurringStructureIssue[0]][language]);
  }
  if (hasLowVocabularyVariety) dynamicSuggestions.push(LOW_VOCABULARY_VARIETY_SUGGESTION[language]);
  const suggestions = dynamicSuggestions.slice(0, 3);

  const uniqueRatioPercent = Math.round(sessionDiversity * 100);
  const vocabularySummary: TranslatedText =
    fullContentWords.length >= 10
      ? {
          en: `Across the session, about ${uniqueRatioPercent}% of the content words used were distinct.`,
          ru: `За сессию около ${uniqueRatioPercent}% использованных значимых слов были уникальными.`,
          kz: `Сессия бойы қолданылған мағыналы сөздердің шамамен ${uniqueRatioPercent}%-ы қайталанбады.`,
        }
      : {
          en: "Not enough spoken content this session to assess vocabulary range meaningfully.",
          ru: "За эту сессию было сказано недостаточно, чтобы содержательно оценить словарный запас.",
          kz: "Бұл сессияда сөздік қорды мазмұнды бағалау үшін жеткілікті сөз айтылмады.",
        };

  const avgFillerPerTurn = total > 0 ? fillerTotal / total : 0;
  const fluencySummary: TranslatedText =
    avgFillerPerTurn === 0
      ? {
          en: "No filler words across the session — consistently fluent delivery.",
          ru: "За всю сессию не было слов-паразитов — стабильно беглая речь.",
          kz: "Сессия бойы толықтырғыш сөздер болмады — тұрақты еркін сөйлеу.",
        }
      : {
          en: `An average of ${avgFillerPerTurn.toFixed(1)} filler word(s) per answer across the session.`,
          ru: `В среднем ${avgFillerPerTurn.toFixed(1)} слов(а)-паразита на ответ за сессию.`,
          kz: `Сессия бойы жауап басына орта есеппен ${avgFillerPerTurn.toFixed(1)} толықтырғыш сөз келді.`,
        };

  return {
    level,
    totalQuestions: total,
    grammar: {
      summary:
        commonErrors.length > 0
          ? GRAMMAR_SUMMARY.withErrors(commonErrors.length, level)[language]
          : GRAMMAR_SUMMARY.noErrors[language],
      commonErrors,
    },
    vocabulary: {
      summary: vocabularySummary[language],
      rangeNote:
        hasLowVocabularyVariety
          ? LOW_VOCABULARY_VARIETY_WEAKNESS[language]
          : {
              en: "Vocabulary range was reasonable for this session's length.",
              ru: "Словарный запас был приемлемым для длины этой сессии.",
              kz: "Сөздік қор осы сессияның ұзындығына сай жеткілікті болды.",
            }[language],
    },
    pronunciation: {
      summary:
        recurringMispronounced.length > 0
          ? buildRecurringPronunciationNote(recurringMispronounced)[language]
          : {
              en: "No word was flagged as mispronounced more than once this session.",
              ru: "Ни одно слово не было отмечено как неправильно произнесённое более одного раза за сессию.",
              kz: "Бұл сессияда бірде-бір сөз бірнеше рет қате айтылды деп белгіленбеді.",
            }[language],
      note: fluencySummary[language],
    },
    fluency: {
      summary: fluencySummary[language],
      pace:
        total > 0
          ? {
              en: `${total} answer${total === 1 ? "" : "s"} completed this session.`,
              ru: `За эту сессию завершено ${total} ответ${total === 1 ? "" : "ов"}.`,
              kz: `Бұл сессияда ${total} жауап аяқталды.`,
            }[language]
          : "",
    },
    taskCompletion: {
      summary:
        irrelevantCount > 0
          ? TASK_COMPLETION_SUMMARY.withIssues(irrelevantCount, total)[language]
          : TASK_COMPLETION_SUMMARY.complete(level)[language],
      partsCompleted,
    },
    repeatedMistakes: commonErrors.map((e) => `${e.original} → ${e.correction}`),
    fillerWords: {
      count: fillerTotal,
      examples: fillerExamples,
    },
    strengths,
    weaknesses,
    suggestions,
    estimatedScore,
    scoreOutOf,
    scoreExplanation: SCORE_EXPLANATION[tier](level, estimatedScore, scoreOutOf)[language],
  };
}
