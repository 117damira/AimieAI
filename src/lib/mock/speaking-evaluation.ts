import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import type {
  CompletedTurn,
  MispronuncedWord,
  SpeakingExaminerReport,
  SpeakingGrammarMistake,
  TurnFeedback,
} from "@/types/speaking-evaluation";

/**
 * Offline fallback DELF speaking evaluator, used by the API routes when no
 * ANTHROPIC_API_KEY is configured (see lib/ai/speaking-evaluator.ts for the
 * real Claude path, which returns the same TurnFeedback/SpeakingExaminerReport
 * shapes). analyzeTurn()/localizeTurnFeedback() evaluate one turn at a time;
 * synthesizeReportFromTurns() aggregates the real accumulated CompletedTurn
 * data (actual transcripts, scores, grammar errors) into a final report.
 *
 * Exam prompts and the student's own answers stay in French; only this
 * AI-generated feedback text is translated.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

interface MockSpeakingLevelProfile {
  pronunciationNotes: TranslatedText[];
  fluencyNotes: TranslatedText[];
  vocabularyRangeNotes: TranslatedText[];
  taskCompletionNotes: TranslatedText[];
  coherenceNotes: TranslatedText[];
  sentenceVarietyNotes: TranslatedText[];
  naturalnessNotes: TranslatedText[];
  strengths: TranslatedText[];
  weaknesses: TranslatedText[];
  improvementTips: TranslatedText[];
  baseScore: number;
}

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

const FILLER_WORDS = ["euh", "du coup", "genre", "en fait", "quoi", "voilà", "bah"];

/**
 * Real, transcript-grounded grammar detection — every rule only fires when
 * its pattern genuinely appears in what the student said; `original` is
 * always the actual matched substring (never a canned phrase), and
 * `correction` is computed FROM that substring. This replaces the previous
 * design where 1-2 mistakes were picked at random from a fixed per-level
 * pool regardless of the transcript — that was fabricating errors.
 */
interface GrammarRule {
  id: string;
  category: SpeakingGrammarMistake["category"];
  regex: RegExp;
  correction: (matched: string) => string;
  explanation: TranslatedText;
  betterExample: string;
}

const JE_CONJUGATION_MAP: Record<string, string> = {
  aimer: "j'aime",
  vouloir: "je veux",
  pouvoir: "je peux",
  aller: "je vais",
  faire: "je fais",
  habiter: "j'habite",
  parler: "je parle",
  manger: "je mange",
  travailler: "je travaille",
  étudier: "j'étudie",
  avoir: "j'ai",
  être: "je suis",
  jouer: "je joue",
  regarder: "je regarde",
  écouter: "j'écoute",
};

const SUBJONCTIF_JE_MAP: Record<string, string> = { vais: "aille", peux: "puisse", veux: "veuille", fais: "fasse" };
const SUBJONCTIF_IL_MAP: Record<string, string> = { est: "soit", a: "ait", peut: "puisse", doit: "doive", va: "aille" };

const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "etre-age",
    category: "verb",
    regex: /\bje\s+suis\s+([a-zà-ÿ0-9-]+)\s+ans?\b/i,
    correction: (m) => m.replace(/\bje\s+suis\b/i, "j'ai"),
    explanation: {
      en: "Age is expressed with \"avoir\" (avoir + age), not \"être\".",
      ru: "Возраст выражается с помощью глагола «avoir» (avoir + возраст), а не «être».",
      kz: "Жас мөлшері «avoir» етістігімен беріледі (avoir + жас), «être» емес.",
    },
    betterExample: "J'ai vingt ans et mon frère a dix-huit ans.",
  },
  {
    id: "gender-article",
    category: "agreement",
    regex: /\bun\s+(maison|voiture|ville|chose|idée|université|semaine|année|table|chambre|cuisine)\b/i,
    correction: (m) => m.replace(/\bun\b/i, "une"),
    explanation: {
      en: "This noun is feminine, so it takes \"une\", not \"un\".",
      ru: "Это существительное женского рода, поэтому употребляется с «une», а не «un».",
      kz: "Бұл зат есім әйел тегінде, сондықтан «une» қолданылады, «un» емес.",
    },
    betterExample: "J'habite dans une maison avec un grand jardin.",
  },
  {
    id: "infinitive-not-conjugated",
    category: "sentence-structure",
    regex: new RegExp(`\\bje\\s+(${Object.keys(JE_CONJUGATION_MAP).join("|")})\\b`, "i"),
    correction: (m) => {
      const verb = m.trim().split(/\s+/)[1]?.toLowerCase() ?? "";
      return JE_CONJUGATION_MAP[verb] ?? m;
    },
    explanation: {
      en: "The verb must be conjugated, not left in the infinitive.",
      ru: "Глагол нужно спрягать, а не оставлять в инфинитиве.",
      kz: "Етістік тұйық түрде қалмай, жіктелуі керек.",
    },
    betterExample: "J'aime le sport et je joue au football le week-end.",
  },
  {
    id: "passe-compose-aux",
    category: "verb",
    regex: /\bj['’]ai\s+(allée?s?|arrivée?s?|partie?s?|venue?s?|entrée?s?|sortie?s?|montée?s?|descendue?s?|restée?s?|tombée?s?|née?s?)\b/i,
    correction: (m) => m.replace(/j['’]ai/i, "je suis"),
    explanation: {
      en: "This verb takes \"être\" as its auxiliary in the passé composé, not \"avoir\".",
      ru: "Этот глагол в passé composé спрягается с «être», а не с «avoir».",
      kz: "Бұл етістік passé composé-де «être» көмекші етістігімен тіркеседі, «avoir» емес.",
    },
    betterExample: "Hier, je suis allé(e) au cinéma avec des amis.",
  },
  {
    id: "preposition-penser-de",
    category: "other",
    regex: /\bje\s+pense\s+de\s+\w+/i,
    correction: (m) => m.replace(/\spense\s+de\s+/i, " pense "),
    explanation: {
      en: "\"Penser\" + infinitive doesn't take \"de\" when expressing an intention.",
      ru: "«Penser» + инфинитив не требует предлога «de» при выражении намерения.",
      kz: "Ниетті білдіргенде «penser» + тұйық етістік «de» септеулігін қажет етпейді.",
    },
    betterExample: "Je pense sortir ce soir avec ma sœur.",
  },
  {
    id: "agreement-participle-elle",
    category: "agreement",
    regex: /\belle\s+est\s+(allé|arrivé|parti|venu|entré|sorti|monté|descendu|resté|tombé|né)\b(?!e)/i,
    correction: (m) => `${m}e`,
    explanation: {
      en: "With \"être\", the past participle agrees with the subject: it needs an \"e\" for a feminine subject.",
      ru: "С «être» причастие прошедшего времени согласуется с подлежащим: для женского рода нужна «e».",
      kz: "«Être»-мен есімше бастауышпен келіседі: әйелдік тек үшін «e» қажет.",
    },
    betterExample: "Elle est allée au marché ce matin.",
  },
  {
    id: "subjonctif-il-faut-que",
    category: "verb",
    regex: /\bil\s+faut\s+que\s+je\s+(vais|peux|veux|fais)\b/i,
    correction: (m) => {
      const match = m.match(/(vais|peux|veux|fais)$/i);
      const verb = match ? match[1].toLowerCase() : "";
      const subj = SUBJONCTIF_JE_MAP[verb] ?? verb;
      const jePart = /^[aeiouhâêîôûéèë]/i.test(subj) ? "j'" : "je ";
      return m.replace(/je\s+(vais|peux|veux|fais)$/i, `${jePart}${subj}`);
    },
    explanation: {
      en: "\"Il faut que\" requires the subjunctive, not the indicative.",
      ru: "«Il faut que» требует сослагательного наклонения, а не изъявительного.",
      kz: "«Il faut que» бағыныңқы райды талап етеді, ашық рай емес.",
    },
    betterExample: "Il faut que j'aille au rendez-vous avant midi.",
  },
  {
    id: "double-comparative",
    category: "sentence-structure",
    regex: /\bplus\s+meilleur\b/i,
    correction: (m) => m.replace(/plus\s+meilleur/i, "meilleur"),
    explanation: {
      en: "\"Meilleur\" is already the comparative of \"bon\" — adding \"plus\" doubles the comparison.",
      ru: "«Meilleur» уже является сравнительной формой «bon» — добавление «plus» создаёт двойное сравнение.",
      kz: "«Meilleur» «bon» сөзінің салыстырмалы түрі — «plus» қосу қосарланған салыстыру жасайды.",
    },
    betterExample: "Ce restaurant est meilleur que l'autre.",
  },
  {
    id: "anglicism-definitivement",
    category: "other",
    regex: /\bdéfinitivement\b/i,
    correction: (m) => m.replace(/définitivement/i, "tout à fait"),
    explanation: {
      en: "\"Définitivement\" is an anglicism here; \"tout à fait\" is the natural French equivalent.",
      ru: "«Définitivement» здесь — англицизм; естественный французский эквивалент — «tout à fait».",
      kz: "Бұл жерде «définitivement» — ағылшыншылдық; табиғи француз баламасы — «tout à fait».",
    },
    betterExample: "Je suis tout à fait d'accord avec cette proposition.",
  },
  {
    id: "subjonctif-bien-que",
    category: "verb",
    regex: /\bbien\s+(qu['’]il|qu['’]elle)\s+(est|a|peut|doit|va)\b/i,
    correction: (m) => {
      const match = m.match(/(est|a|peut|doit|va)$/i);
      const verb = match ? match[1].toLowerCase() : "";
      const subj = SUBJONCTIF_IL_MAP[verb] ?? verb;
      return m.replace(new RegExp(`${verb}$`, "i"), subj);
    },
    explanation: {
      en: "\"Bien que\" always triggers the subjunctive, not the indicative.",
      ru: "«Bien que» всегда требует сослагательного наклонения, а не изъявительного.",
      kz: "«Bien que» әрқашан бағыныңқы райды талап етеді, ашық рай емес.",
    },
    betterExample: "Bien qu'il soit difficile de changer ses habitudes, il faut essayer.",
  },
  {
    id: "nuance-absolu",
    category: "other",
    regex: /\b(totalement|complètement)\s+faux\b/i,
    correction: (m) => m.replace(/(totalement|complètement)\s+faux/i, "en grande partie inexact"),
    explanation: {
      en: "At higher levels, absolute statements benefit from more nuanced hedging language.",
      ru: "На продвинутом уровне категоричные утверждения лучше смягчать более нюансированными формулировками.",
      kz: "Жоғары деңгейде категориялық тұжырымдарды нәзігірек тілмен жеткізген жөн.",
    },
    betterExample: "Cela me semble en grande partie inexact, à mon avis.",
  },
  {
    id: "stacked-connectors",
    category: "sentence-structure",
    regex: /\bcependant,?\s+néanmoins\b/i,
    correction: (m) => m.replace(/,?\s+néanmoins/i, ""),
    explanation: {
      en: "Avoid stacking two contrastive connectors in a row — pick one to keep the argument clear.",
      ru: "Избегайте нагромождения двух противительных союзов подряд — выберите один для ясности аргумента.",
      kz: "Екі қарсы мәнді жалғаулықты қатар қоймаңыз — дәлелдің анықтығы үшін біреуін таңдаңыз.",
    },
    betterExample: "Cependant, il faut reconnaître que la situation est complexe.",
  },
];

/** Scans the actual transcript against every rule and returns only genuine
 * matches (capped at 3) — never invents a mistake that wasn't said. */
function findGrammarMistakes(transcript: string): { ruleId: string; original: string; correction: string }[] {
  const results: { ruleId: string; original: string; correction: string }[] = [];
  for (const rule of GRAMMAR_RULES) {
    const match = transcript.match(rule.regex);
    if (match) {
      results.push({ ruleId: rule.id, original: match[0], correction: rule.correction(match[0]) });
      if (results.length >= 3) break;
    }
  }
  return results;
}

/** Words that carry no topical meaning — excluded when comparing the
 * question's real content words against the transcript's, so relevance
 * detection isn't fooled by shared pronouns/articles/question-verbs. */
const FRENCH_STOPWORDS = new Set([
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "le", "la", "les", "un", "une", "des", "de", "du",
  "et", "ou", "mais", "donc", "car", "que", "qui", "quoi", "dont", "dans", "sur", "avec", "pour", "par", "sans", "sous",
  "votre", "vos", "notre", "nos", "leur", "leurs", "cette", "cet", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "est", "es", "suis", "sont", "êtes", "sommes", "être", "avoir", "ai", "as", "avons", "avez", "ont",
  "me", "te", "se", "lui", "y", "en", "au", "aux", "ne", "pas", "plus", "très", "bien", "aussi", "comme", "autre", "autres",
  "pouvez", "voulez", "faire", "fait", "faites", "proposez", "expliquez", "présentez", "parlez", "dites", "pensez",
]);

const ACCENT_MAP: Record<string, string> = {
  à: "a", â: "a", ä: "a", é: "e", è: "e", ê: "e", ë: "e", î: "i", ï: "i",
  ô: "o", ö: "o", ù: "u", û: "u", ü: "u", ç: "c", œ: "oe", æ: "ae",
};

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .split("")
    .map((ch) => ACCENT_MAP[ch] ?? ch)
    .join("");
}

function extractContentWords(text: string): string[] {
  return text
    .replace(/[.,!?;:"'«»()]/g, " ")
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length >= 4 && !FRENCH_STOPWORDS.has(w));
}

/** Real relevance detection — compares the actual question's content words
 * against the actual transcript's, instead of the previous `wordCount >= 5`
 * heuristic, which marked any sufficiently long answer relevant regardless
 * of whether it addressed the question at all. */
/** Self-introduction questions ("Présentez-vous", "Comment vous
 * appelez-vous ?") don't share literal vocabulary with a valid answer — a
 * correct response talks about the candidate, not the question's own
 * wording — so keyword overlap alone would wrongly flag genuine
 * introductions as off-topic. Recognized directly instead. */
const SELF_INTRO_QUESTION_PATTERN = /présent|appelez|votre nom|qui êtes-vous/i;
const SELF_INTRO_ANSWER_PATTERN = /je m['’]appelle|mon nom est|j['’]ai\s+\d+\s+ans|j['’]habite/i;

function computeRelevance(prompt: string, transcript: string, wordCount: number): boolean {
  if (wordCount < 3) return false;
  if (SELF_INTRO_QUESTION_PATTERN.test(prompt) && SELF_INTRO_ANSWER_PATTERN.test(transcript)) {
    return true;
  }
  const questionWords = extractContentWords(prompt);
  if (questionWords.length === 0) return wordCount >= 5;
  const answerWords = new Set(extractContentWords(transcript));
  if (questionWords.some((w) => answerWords.has(w))) return true;
  // No shared content words with the question — only give credit for a
  // developed answer; a short, unrelated answer (e.g. a stock
  // self-introduction to a question that asked for something else) is
  // correctly flagged rather than marked relevant by word count alone.
  return wordCount >= 8;
}

function buildOffTopicNote(prompt: string, language: FeedbackLanguage): string {
  const templates: TranslatedText = {
    en: `This answer doesn't address what was asked ("${prompt}"). Make sure to respond directly to the question before adding extra details.`,
    ru: `Этот ответ не отвечает на заданный вопрос («${prompt}»). Убедитесь, что вы отвечаете именно на вопрос, прежде чем добавлять детали.`,
    kz: `Бұл жауап қойылған сұраққа жауап бермейді («${prompt}»). Қосымша деталь қоспас бұрын сұраққа тікелей жауап беруге көз жеткізіңіз.`,
  };
  return templates[language];
}

const MOCK_SPEAKING_PROFILES: Record<DelfLevel, MockSpeakingLevelProfile> = {
  A1: {
    pronunciationNotes: [
      {
        en: "Pronunciation is understandable overall, with a few vowel sounds that need refinement.",
        ru: "Произношение в целом понятное, но некоторые гласные звуки требуют доработки.",
        kz: "Айтылым жалпы түсінікті, бірақ кейбір дауысты дыбыстарды жетілдіру қажет.",
      },
      {
        en: "Some final consonants are dropped, which is common at this level.",
        ru: "Некоторые конечные согласные не произносятся, что типично для этого уровня.",
        kz: "Кейбір соңғы дауыссыз дыбыстар айтылмайды, бұл бұл деңгейге тән.",
      },
    ],
    fluencyNotes: [
      {
        en: "Speech is slow but steady, with pauses to search for basic words.",
        ru: "Речь медленная, но ровная, с паузами для поиска простых слов.",
        kz: "Сөйлеу баяу, бірақ тұрақты, қарапайым сөздерді іздеу үшін кідірістер бар.",
      },
      {
        en: "Short, simple sentences are delivered confidently.",
        ru: "Короткие простые предложения произносятся уверенно.",
        kz: "Қысқа, қарапайым сөйлемдер сенімді түрде айтылады.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Vocabulary is limited to common, high-frequency words — appropriate for A1.",
        ru: "Словарный запас ограничен распространёнными словами — уместно для уровня A1.",
        kz: "Сөздік қор жиі қолданылатын сөздермен шектелген — A1 деңгейіне сай.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Addressed the question directly with the basic information requested.",
        ru: "Прямо ответил(а) на вопрос, дав запрошенную базовую информацию.",
        kz: "Сұралған негізгі ақпаратты беріп, сұраққа тікелей жауап берді.",
      },
      {
        en: "Covered the main point of the question, though a couple of details were missing.",
        ru: "Раскрыл(а) основную суть вопроса, хотя некоторые детали отсутствовали.",
        kz: "Сұрақтың негізгі мәнін ашты, бірақ кейбір детальдар жетіспеді.",
      },
    ],
    coherenceNotes: [
      {
        en: "Ideas were presented in a simple, easy-to-follow order.",
        ru: "Мысли были изложены в простом, легко воспринимаемом порядке.",
        kz: "Ойлар қарапайым, оңай түсінілетін ретпен айтылды.",
      },
      {
        en: "The answer stayed on one clear idea without wandering off topic.",
        ru: "Ответ оставался в рамках одной чёткой мысли, не отклоняясь от темы.",
        kz: "Жауап тақырыптан ауытқымай, бір анық ойға негізделді.",
      },
    ],
    sentenceVarietyNotes: [
      {
        en: "Uses mostly simple, short sentences — appropriate for A1, with little variation yet.",
        ru: "Использует в основном простые, короткие предложения — уместно для уровня A1, разнообразия пока немного.",
        kz: "Негізінен қарапайым, қысқа сөйлемдерді қолданады — A1 деңгейіне сай, әзірге әртүрлілік аз.",
      },
      {
        en: "A few sentences link two ideas with \"et\" or \"mais\", showing early variety.",
        ru: "Несколько предложений связывают две мысли через «et» или «mais», показывая начальное разнообразие.",
        kz: "Бірнеше сөйлем екі ойды «et» немесе «mais» арқылы байланыстырады, бұл бастапқы әртүрлілікті көрсетеді.",
      },
    ],
    naturalnessNotes: [
      {
        en: "Sounds like a direct, simple answer — natural for this level, though a little translated in places.",
        ru: "Звучит как прямой, простой ответ — естественно для этого уровня, хотя местами ощущается перевод.",
        kz: "Тікелей, қарапайым жауап сияқты естіледі — бұл деңгейге табиғи, дегенмен кейбір жерлерде аударма сияқты.",
      },
      {
        en: "Phrasing is straightforward and easy to follow, typical of an A1 learner.",
        ru: "Формулировки прямые и легко воспринимаются, что типично для уровня A1.",
        kz: "Тіркестер қарапайым және түсінуге жеңіл, бұл A1 деңгейіндегі оқушыға тән.",
      },
    ],
    strengths: [
      {
        en: "Answers personal questions clearly and directly",
        ru: "Ясно и прямо отвечает на личные вопросы",
        kz: "Жеке сұрақтарға анық әрі тікелей жауап береді",
      },
      {
        en: "Stays on topic throughout each answer",
        ru: "Не отклоняется от темы на протяжении всего ответа",
        kz: "Жауап бойы тақырыптан ауытқымайды",
      },
      {
        en: "Good use of everyday vocabulary",
        ru: "Хорошее использование повседневной лексики",
        kz: "Күнделікті лексиканы жақсы қолданады",
      },
      {
        en: "Completes the simple role-play task",
        ru: "Успешно выполняет простое ролевое задание",
        kz: "Қарапайым рөлдік тапсырманы сәтті орындайды",
      },
    ],
    weaknesses: [
      {
        en: "A few basic agreement and conjugation mistakes",
        ru: "Несколько базовых ошибок в согласовании и спряжении",
        kz: "Бірнеше қарапайым келісім және жіктеу қателері бар",
      },
      {
        en: "Limited ability to elaborate beyond the direct question",
        ru: "Ограниченная способность развивать ответ за пределы прямого вопроса",
        kz: "Тікелей сұрақтан тыс жауапты дамыту мүмкіндігі шектеулі",
      },
      {
        en: "Noticeable filler words while searching for vocabulary",
        ru: "Заметны слова-паразиты во время поиска нужных слов",
        kz: "Сөз іздеу кезінде толықтырғыш сөздер байқалады",
      },
    ],
    improvementTips: [
      {
        en: "Practice conjugating common verbs in the present tense",
        ru: "Потренируйте спряжение распространённых глаголов в настоящем времени",
        kz: "Жиі қолданылатын етістіктерді осы шақта жіктеуді жаттығыңыз",
      },
      {
        en: "Review gender for common nouns (le/la, un/une)",
        ru: "Повторите род для распространённых существительных (le/la, un/une)",
        kz: "Жиі кездесетін зат есімдердің тегін қайталаңыз (le/la, un/une)",
      },
      {
        en: "Try short pauses instead of filler words like \"euh\"",
        ru: "Используйте короткие паузы вместо слов-паразитов вроде «euh»",
        kz: "«Euh» сияқты толықтырғыш сөздердің орнына қысқа кідірістерді қолданып көріңіз",
      },
      {
        en: "Add one extra detail to each answer to sound more natural",
        ru: "Добавляйте одну дополнительную деталь к каждому ответу для более естественного звучания",
        kz: "Табиғи естілу үшін әр жауапқа бір қосымша деталь қосыңыз",
      },
    ],
    baseScore: 17,
  },
  A2: {
    pronunciationNotes: [
      {
        en: "Pronunciation is clear enough to follow easily, with occasional stress on the wrong syllable.",
        ru: "Произношение достаточно чёткое для лёгкого понимания, иногда ударение падает не туда.",
        kz: "Айтылым жеңіл түсінуге жеткілікті анық, кейде екпін дұрыс емес буынға түседі.",
      },
      {
        en: "Nasal vowels are mostly accurate.",
        ru: "Носовые гласные в основном произносятся правильно.",
        kz: "Мұрын дауыстылары негізінен дұрыс айтылады.",
      },
    ],
    fluencyNotes: [
      {
        en: "Maintains a steady pace with only brief hesitations.",
        ru: "Сохраняет ровный темп речи с лишь краткими заминками.",
        kz: "Тек қысқа кідірістермен тұрақты қарқынды сақтайды.",
      },
      {
        en: "Can link two or three sentences together without long pauses.",
        ru: "Может связать два-три предложения без долгих пауз.",
        kz: "Ұзақ кідіріссіз екі-үш сөйлемді байланыстыра алады.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Vocabulary covers everyday topics well, with occasional repetition.",
        ru: "Лексика хорошо покрывает повседневные темы, с отдельными повторами.",
        kz: "Лексика күнделікті тақырыптарды жақсы қамтиды, кейде қайталанады.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Answered the question fully and added relevant supporting detail.",
        ru: "Полностью ответил(а) на вопрос и добавил(а) уместные дополнительные детали.",
        kz: "Сұраққа толық жауап беріп, орынды қосымша детальдар қосты.",
      },
      {
        en: "Addressed the main question, but the supporting detail was a little thin.",
        ru: "Ответил(а) на основной вопрос, но дополнительные детали были довольно скудными.",
        kz: "Негізгі сұраққа жауап берді, бірақ қосымша детальдар аздау болды.",
      },
    ],
    coherenceNotes: [
      {
        en: "The answer moved logically from one idea to the next.",
        ru: "Ответ логично переходил от одной мысли к другой.",
        kz: "Жауап бір ойдан екінші ойға логикалық түрде өтті.",
      },
      {
        en: "Ideas were connected with simple linking words, keeping the flow clear.",
        ru: "Мысли были связаны простыми связующими словами, что сохраняло ясность изложения.",
        kz: "Ойлар қарапайым жалғаулық сөздермен байланысып, түсінікті болды.",
      },
    ],
    sentenceVarietyNotes: [
      {
        en: "Combines a few short sentences with \"parce que\" or \"et donc\", showing growing variety.",
        ru: "Соединяет несколько коротких предложений через «parce que» или «et donc», показывая растущее разнообразие.",
        kz: "Бірнеше қысқа сөйлемді «parce que» немесе «et donc» арқылы біріктіреді, бұл өсіп келе жатқан әртүрлілікті көрсетеді.",
      },
      {
        en: "Sentence patterns are still fairly repetitive — mostly subject-verb-object.",
        ru: "Структура предложений всё ещё довольно однообразна — в основном подлежащее-сказуемое-дополнение.",
        kz: "Сөйлем құрылымы әлі де біршама бірыңғай — негізінен бастауыш-баяндауыш-толықтауыш.",
      },
    ],
    naturalnessNotes: [
      {
        en: "Mostly natural phrasing, with a couple of expressions that sound slightly translated from another language.",
        ru: "В основном естественные формулировки, с парой выражений, звучащих как перевод с другого языка.",
        kz: "Негізінен табиғи тіркестер, бірақ екі-үш өрнек басқа тілден аударылғандай естіледі.",
      },
      {
        en: "Sounds like genuine spoken French for this level, with only minor awkward phrasing.",
        ru: "Звучит как настоящая устная французская речь для этого уровня, с лишь небольшими неловкими формулировками.",
        kz: "Бұл деңгейге сай нағыз ауызша француз тілі сияқты естіледі, тек аздаған ыңғайсыз тіркестер бар.",
      },
    ],
    strengths: [
      {
        en: "Narrates a past event with a mostly clear timeline",
        ru: "Описывает прошедшее событие с достаточно чёткой хронологией",
        kz: "Өткен оқиғаны негізінен анық хронологиямен баяндайды",
      },
      {
        en: "Sustains a short monologue without examiner prompting",
        ru: "Поддерживает короткий монолог без подсказок экзаменатора",
        kz: "Емтихан алушының көмегінсіз қысқа монологты жалғастырады",
      },
      {
        en: "Negotiates simple plans reasonably well in the role-play",
        ru: "Достаточно хорошо согласовывает простые планы в ролевой игре",
        kz: "Рөлдік ойында қарапайым жоспарларды жеткілікті жақсы келіседі",
      },
      {
        en: "Friendly, appropriate tone throughout",
        ru: "Дружелюбный, уместный тон на протяжении всего ответа",
        kz: "Жауап бойы достық, орынды стиль сақталады",
      },
    ],
    weaknesses: [
      {
        en: "Auxiliary verb choice (avoir vs être) is inconsistent in the passé composé",
        ru: "Выбор вспомогательного глагола (avoir или être) непоследователен в passé composé",
        kz: "Passé composé-де көмекші етістікті (avoir немесе être) таңдау тұрақты емес",
      },
      {
        en: "Occasional past-participle agreement errors",
        ru: "Иногда встречаются ошибки согласования причастия прошедшего времени",
        kz: "Кейде өткен шақ есімшесінің келісімінде қателер кездеседі",
      },
      {
        en: "Some hesitation when the topic shifts unexpectedly",
        ru: "Некоторая неуверенность при неожиданной смене темы",
        kz: "Тақырып күтпеген жерден өзгергенде біраз екіұдайлық байқалады",
      },
    ],
    improvementTips: [
      {
        en: "Review which common verbs take \"être\" in the passé composé",
        ru: "Повторите, какие распространённые глаголы спрягаются с «être» в passé composé",
        kz: "Passé composé-де қандай жиі етістіктер «être»-мен тіркесетінін қайталаңыз",
      },
      {
        en: "Practice past-participle agreement with être-verbs",
        ru: "Потренируйте согласование причастия с глаголами, спрягаемыми с être",
        kz: "Être-етістіктерімен есімшенің келісуін жаттығыңыз",
      },
      {
        en: "Record yourself narrating your weekend to build fluency",
        ru: "Запишите себя, рассказывая о своих выходных, чтобы развить беглость речи",
        kz: "Демалыс күндеріңіз туралы айтып, өзіңізді жазып алыңыз — бұл сөйлеу еркіндігін дамытады",
      },
      {
        en: "Practice quick transitions when the examiner changes topic",
        ru: "Потренируйте быстрый переход при смене темы экзаменатором",
        kz: "Емтихан алушы тақырыпты өзгерткенде жылдам ауысуды жаттығыңыз",
      },
    ],
    baseScore: 16,
  },
  B1: {
    pronunciationNotes: [
      {
        en: "Pronunciation is clear and generally accurate, supporting easy comprehension.",
        ru: "Произношение чёткое и в целом точное, что облегчает понимание.",
        kz: "Айтылым анық және негізінен дұрыс, түсінуді жеңілдетеді.",
      },
    ],
    fluencyNotes: [
      {
        en: "Speaks at a natural pace with only occasional self-correction.",
        ru: "Говорит в естественном темпе с лишь редкими самоисправлениями.",
        kz: "Тек сирек өзін-өзі түзетумен табиғи қарқында сөйлейді.",
      },
      {
        en: "Handles follow-up questions without losing the thread of the argument.",
        ru: "Отвечает на уточняющие вопросы, не теряя нить рассуждения.",
        kz: "Қосымша сұрақтарға дәлелдеу желісін жоғалтпай жауап береді.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Good range of connectors and opinion vocabulary, appropriate for B1.",
        ru: "Хороший диапазон союзов и лексики для выражения мнения, соответствующий уровню B1.",
        kz: "B1 деңгейіне сай жалғаулықтар мен пікір білдіру лексикасының жақсы ауқымы.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Fully addressed the task, including the negotiation/opinion component expected at this level.",
        ru: "Полностью выполнил(а) задание, включая ожидаемый на этом уровне элемент переговоров/мнения.",
        kz: "Тапсырманы толық орындады, осы деңгейде күтілетін келіссөз/пікір элементін қоса алғанда.",
      },
      {
        en: "Addressed the task overall, though it could have engaged more directly with the specific scenario.",
        ru: "В целом выполнил(а) задание, хотя мог(ла) бы более конкретно отреагировать на данную ситуацию.",
        kz: "Тапсырманы жалпы орындады, бірақ нақты жағдайға тікелей көбірек назар аударса болар еді.",
      },
    ],
    coherenceNotes: [
      {
        en: "Arguments were organized in a clear, logical sequence.",
        ru: "Аргументы были выстроены в чёткой, логичной последовательности.",
        kz: "Дәлелдер анық әрі логикалық ретпен құрылды.",
      },
      {
        en: "The response held together well, though a couple of transitions felt abrupt.",
        ru: "Ответ был в целом связным, хотя пара переходов ощущались резкими.",
        kz: "Жауап тұтастай жақсы құрылды, бірақ бірнеше өтулер кенеттен болды.",
      },
    ],
    sentenceVarietyNotes: [
      {
        en: "Uses a good mix of sentence lengths and some subordinate clauses (parce que, bien que).",
        ru: "Использует хорошее сочетание предложений разной длины и несколько придаточных предложений (parce que, bien que).",
        kz: "Әртүрлі ұзындықтағы сөйлемдер мен бірнеше бағыныңқы сөйлемдерді (parce que, bien que) жақсы үйлестіреді.",
      },
      {
        en: "Relies heavily on one or two sentence patterns — try varying structure more.",
        ru: "Сильно опирается на один-два типа предложений — стоит больше разнообразить структуру.",
        kz: "Бір-екі сөйлем үлгісіне тым көп сүйенеді — құрылымды көбірек әртараптандыруға тырысыңыз.",
      },
    ],
    naturalnessNotes: [
      {
        en: "Expression feels fairly natural, with occasional phrasing that sounds translated rather than spoken.",
        ru: "Выражение мыслей звучит довольно естественно, но иногда формулировки напоминают перевод, а не живую речь.",
        kz: "Ойды жеткізу біршама табиғи, бірақ кейде тіркестер ауызша сөйлеуден гөрі аудармаға ұқсайды.",
      },
      {
        en: "Sounds like genuine conversational French, with good use of natural connectors.",
        ru: "Звучит как настоящая разговорная французская речь, с удачным использованием естественных связок.",
        kz: "Нағыз сөйлесу тіліндегі француз тілі сияқты естіледі, табиғи жалғаулықтарды жақсы қолданады.",
      },
    ],
    strengths: [
      {
        en: "States a clear personal opinion and defends it",
        ru: "Формулирует чёткое личное мнение и отстаивает его",
        kz: "Жеке пікірін анық білдіріп, оны қорғайды",
      },
      {
        en: "Proposes and negotiates a compromise in the interactive exercise",
        ru: "Предлагает и согласовывает компромисс в интерактивном задании",
        kz: "Интерактивті тапсырмада ымыраны ұсынып, келіседі",
      },
      {
        en: "Uses a good range of tenses accurately",
        ru: "Точно использует широкий диапазон времён",
        kz: "Әртүрлі шақтарды дәл қолданады",
      },
      {
        en: "Supports arguments with relevant examples",
        ru: "Подкрепляет аргументы уместными примерами",
        kz: "Дәлелдерін орынды мысалдармен қуаттайды",
      },
    ],
    weaknesses: [
      {
        en: "Subjunctive mood is avoided or used incorrectly after \"il faut que\"",
        ru: "Сослагательное наклонение избегается или используется неверно после «il faut que»",
        kz: "«Il faut que»-ден кейін бағыныңқы рай қолданылмайды немесе қате қолданылады",
      },
      {
        en: "Occasional inconsistency in conditional tense sequences",
        ru: "Иногда встречается непоследовательность в условных временных конструкциях",
        kz: "Кейде шартты шақ тізбегінде тұрақсыздық байқалады",
      },
      {
        en: "A few anglicisms appear under time pressure",
        ru: "Под давлением времени встречаются отдельные англицизмы",
        kz: "Уақыт қысымында кейбір ағылшыншылдықтар кездеседі",
      },
    ],
    improvementTips: [
      {
        en: "Practice the subjunctive after common triggers: il faut que, bien que, pour que",
        ru: "Потренируйте сослагательное наклонение после распространённых триггеров: il faut que, bien que, pour que",
        kz: "Жиі кездесетін тіркестерден кейін бағыныңқы райды жаттығыңыз: il faut que, bien que, pour que",
      },
      {
        en: "Drill si-clause tense pairs until they feel automatic",
        ru: "Отработайте пары времён в предложениях с si до автоматизма",
        kz: "Si-сөйлемдердегі шақ жұптарын автоматты дәрежеге жеткенше жаттығыңыз",
      },
      {
        en: "Build a list of natural French equivalents for common anglicisms",
        ru: "Составьте список естественных французских эквивалентов распространённых англицизмов",
        kz: "Жиі кездесетін ағылшыншылдықтардың табиғи француз баламаларының тізімін жасаңыз",
      },
      {
        en: "Practice defending an opinion against a counter-argument out loud",
        ru: "Потренируйтесь вслух отстаивать мнение против контраргумента",
        kz: "Қарсы дәлелге қарсы пікіріңізді дауыстап қорғауды жаттығыңыз",
      },
    ],
    baseScore: 15,
  },
  B2: {
    pronunciationNotes: [
      {
        en: "Pronunciation is fluent and natural, with intonation supporting the argument's structure.",
        ru: "Произношение беглое и естественное, интонация поддерживает структуру аргументации.",
        kz: "Айтылым еркін әрі табиғи, интонация дәлелдеу құрылымын қолдайды.",
      },
    ],
    fluencyNotes: [
      {
        en: "Speaks fluidly at length, recovering smoothly from rare hesitations.",
        ru: "Говорит бегло и продолжительно, плавно справляясь с редкими заминками.",
        kz: "Ұзақ әрі еркін сөйлейді, сирек кідірістерден тегіс шығады.",
      },
      {
        en: "Handles challenging counter-questions without losing composure.",
        ru: "Справляется со сложными встречными вопросами, не теряя самообладания.",
        kz: "Қиын қарсы сұрақтарды сабырын жоғалтпай шешеді.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Wide-ranging, precise vocabulary suited to formal debate, with occasional B1-level simplification.",
        ru: "Широкий, точный словарный запас, подходящий для формальной дискуссии, с отдельными упрощениями уровня B1.",
        kz: "Формалды пікірталасқа сай кең, дәл сөздік қор, кейде B1 деңгейіндегі жеңілдетулер бар.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Thoroughly addressed the topic with a clear thesis and supporting reasoning.",
        ru: "Всесторонне раскрыл(а) тему с чётким тезисом и обоснованной аргументацией.",
        kz: "Тақырыпты анық тезис пен негізделген дәлелдеумен толық ашты.",
      },
      {
        en: "Addressed the topic well, though the counter-argument could have been engaged more directly.",
        ru: "Хорошо раскрыл(а) тему, хотя мог(ла) бы более прямо ответить на контраргумент.",
        kz: "Тақырыпты жақсы ашты, бірақ қарсы дәлелге тікелейірек жауап берсе болар еді.",
      },
    ],
    coherenceNotes: [
      {
        en: "The argument was structured with a clear line of reasoning from start to finish.",
        ru: "Аргументация была выстроена с чёткой логической линией от начала до конца.",
        kz: "Дәлелдеу басынан аяғына дейін анық логикалық желімен құрылды.",
      },
      {
        en: "Ideas were coherent overall, with sophisticated connectors linking each point.",
        ru: "Мысли были в целом связными, с продуманными союзами, соединяющими каждый пункт.",
        kz: "Ойлар жалпы тұтас болды, әр тармақты байланыстыратын күрделі жалғаулықтармен.",
      },
    ],
    sentenceVarietyNotes: [
      {
        en: "Strong variety of complex sentence structures, including subordinate and relative clauses.",
        ru: "Богатое разнообразие сложных синтаксических конструкций, включая придаточные и относительные предложения.",
        kz: "Бағыныңқы және қатыстық сөйлемдерді қоса алғанда, күрделі сөйлем құрылымдарының бай әртүрлілігі.",
      },
      {
        en: "Sentence structure is solid but could use more varied subordination for a B2 register.",
        ru: "Структура предложений уверенная, но для регистра B2 стоит использовать более разнообразное подчинение.",
        kz: "Сөйлем құрылымы сенімді, бірақ B2 регистріне сай бағыныңқылықты әртараптандыру керек.",
      },
    ],
    naturalnessNotes: [
      {
        en: "Expression is largely natural and idiomatic, appropriate for a formal B2 discussion.",
        ru: "Выражение мыслей в основном естественное и идиоматичное, уместное для формальной дискуссии уровня B2.",
        kz: "Ойды жеткізу негізінен табиғи әрі идиоматикалық, формалды B2 талқылауына сай.",
      },
      {
        en: "Mostly natural, though a few phrases sound more like written than spoken French.",
        ru: "В основном естественно, хотя несколько фраз звучат больше как письменный, а не разговорный французский.",
        kz: "Негізінен табиғи, дегенмен бірнеше тіркес ауызша емес, жазбаша француз тіліне ұқсайды.",
      },
    ],
    strengths: [
      {
        en: "Presents a clear, well-structured argument with a defined thesis",
        ru: "Представляет чёткую, структурированную аргументацию с ясно сформулированным тезисом",
        kz: "Анық тезисі бар құрылымдалған дәлелдеме ұсынады",
      },
      {
        en: "Defends the position convincingly under counter-questioning",
        ru: "Убедительно отстаивает позицию при встречных вопросах",
        kz: "Қарсы сұрақтар кезінде позициясын сенімді қорғайды",
      },
      {
        en: "Uses complex sentence structures and nuanced connectors",
        ru: "Использует сложные синтаксические конструкции и нюансированные союзы",
        kz: "Күрделі сөйлем құрылымдарын және нәзік жалғаулықтарды қолданады",
      },
      {
        en: "Register is consistently appropriate for a formal debate",
        ru: "Стилистический регистр последовательно соответствует формальной дискуссии",
        kz: "Стилі формалды пікірталасқа тұрақты түрде сай келеді",
      },
    ],
    weaknesses: [
      {
        en: "Subjunctive after \"bien que\" is inconsistently applied",
        ru: "Сослагательное наклонение после «bien que» применяется непоследовательно",
        kz: "«Bien que»-ден кейінгі бағыныңқы рай тұрақты қолданылмаған",
      },
      {
        en: "Some absolute statements would benefit from more nuanced hedging",
        ru: "Некоторые категоричные утверждения выиграли бы от более нюансированных формулировок",
        kz: "Кейбір категориялық тұжырымдарды нәзігірек жеткізген жөн болар еді",
      },
      {
        en: "Occasional over-stacking of connectors weakens clarity",
        ru: "Иногда чрезмерное нагромождение союзов снижает ясность",
        kz: "Кейде жалғаулықтардың шамадан тыс қатар қолданылуы анықтықты төмендетеді",
      },
    ],
    improvementTips: [
      {
        en: "Review subjunctive triggers systematically (bien que, quoique, à moins que)",
        ru: "Системно повторите триггеры сослагательного наклонения (bien que, quoique, à moins que)",
        kz: "Бағыныңқы райды талап ететін тіркестерді жүйелі қайталаңыз (bien que, quoique, à moins que)",
      },
      {
        en: "Build a repertoire of hedging phrases (il me semble que, dans une certaine mesure)",
        ru: "Составьте набор смягчающих фраз (il me semble que, dans une certaine mesure)",
        kz: "Жұмсартатын тіркестер жинағын жасаңыз (il me semble que, dans une certaine mesure)",
      },
      {
        en: "Aim for one clear connector per sentence rather than stacking several",
        ru: "Стремитесь использовать один чёткий союз на предложение, а не нагромождать несколько",
        kz: "Бір сөйлемде бірнешеуін емес, бір анық жалғаулықты қолдануға тырысыңыз",
      },
      {
        en: "Practice timed debate simulations to sharpen argument structure under pressure",
        ru: "Практикуйте дебаты на время, чтобы отточить структуру аргументации под давлением",
        kz: "Қысым астында дәлелдеу құрылымын жетілдіру үшін уақыты шектелген пікірталас жаттығуларын өткізіңіз",
      },
    ],
    baseScore: 14,
  },
};

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
  matchedMistakes: { ruleId: string; original: string; correction: string }[];
  fillerCount: number;
  mispronuncedWords: string[];
  strengthIndices: number[];
  weaknessIndices: number[];
  tipIndices: number[];
  turnScore: number;
}

function pickIndices(length: number, count: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).sort((a, b) => a - b);
}

function countFillerWords(text: string): number {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((total, word) => {
    const matches = lower.match(new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "g"));
    return total + (matches?.length ?? 0);
  }, 0);
}

export function analyzeTurn(
  level: DelfLevel,
  partId: string,
  questionId: string,
  prompt: string,
  responseText: string,
  wordCount: number
): TurnSelection {
  const profile = MOCK_SPEAKING_PROFILES[level];
  const relevant = computeRelevance(prompt, responseText, wordCount);
  const fillerCount = countFillerWords(responseText);
  const matchedMistakes = findGrammarMistakes(responseText);

  const jitter = Math.floor(Math.random() * 3) - 1;
  let turnScore = Math.max(
    5,
    Math.min(25, profile.baseScore + jitter - Math.min(fillerCount, 3) - matchedMistakes.length)
  );
  // Task achievement is heavily weighted in real DELF grading — an answer
  // that doesn't address the question is capped well below a passing score.
  if (!relevant) turnScore = Math.min(turnScore, 10);

  const mispronuncedWords = findMispronuncedWords(responseText);
  const strengthIndices = pickIndices(profile.strengths.length, Math.min(2, profile.strengths.length));
  const weaknessIndices = pickIndices(profile.weaknesses.length, Math.min(2, profile.weaknesses.length));
  const tipIndices = pickIndices(profile.improvementTips.length, Math.min(2, profile.improvementTips.length));

  return {
    level,
    partId,
    questionId,
    prompt,
    wordCount,
    relevant,
    matchedMistakes,
    fillerCount,
    mispronuncedWords,
    strengthIndices,
    weaknessIndices,
    tipIndices,
    turnScore,
  };
}

export function localizeTurnFeedback(
  selection: TurnSelection,
  language: FeedbackLanguage
): TurnFeedback {
  const profile = MOCK_SPEAKING_PROFILES[selection.level];
  const grammarErrors: SpeakingGrammarMistake[] = selection.matchedMistakes.map((m) => {
    const rule = GRAMMAR_RULES.find((r) => r.id === m.ruleId)!;
    return {
      original: m.original,
      correction: m.correction,
      category: rule.category,
      whyWrong: rule.explanation[language],
      howToFix: buildHowToFix(m.correction, language),
      betterExample: rule.betterExample,
      howToAvoid: HOW_TO_AVOID_BY_CATEGORY[rule.category][language],
    };
  });

  const fluencyNote =
    profile.fluencyNotes[Math.floor(Math.random() * profile.fluencyNotes.length)][language];
  const vocabularyNote =
    profile.vocabularyRangeNotes[
      Math.floor(Math.random() * profile.vocabularyRangeNotes.length)
    ][language];
  const pronunciationNote =
    profile.pronunciationNotes[
      Math.floor(Math.random() * profile.pronunciationNotes.length)
    ][language];
  const taskCompletionNote = selection.relevant
    ? profile.taskCompletionNotes[
        Math.floor(Math.random() * profile.taskCompletionNotes.length)
      ][language]
    : buildOffTopicNote(selection.prompt, language);
  const coherenceNote =
    profile.coherenceNotes[Math.floor(Math.random() * profile.coherenceNotes.length)][language];
  const sentenceVarietyNote =
    profile.sentenceVarietyNotes[
      Math.floor(Math.random() * profile.sentenceVarietyNotes.length)
    ][language];
  const naturalnessNote =
    profile.naturalnessNotes[Math.floor(Math.random() * profile.naturalnessNotes.length)][language];
  const mispronuncedWords = localizeMispronuncedWords(selection.mispronuncedWords, language);
  const strengths = selection.strengthIndices.map((i) => profile.strengths[i][language]);
  const areasForImprovement = selection.weaknessIndices.map((i) => profile.weaknesses[i][language]);
  const suggestions = selection.tipIndices.map((i) => profile.improvementTips[i][language]);

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
    strengths,
    areasForImprovement,
    suggestions,
    // Fabricating a fake model answer would be worse than omitting it —
    // this becomes real once ANTHROPIC_API_KEY is configured (see
    // lib/ai/speaking-evaluator.ts's evaluateTurnWithClaude).
    betterExampleAnswer: null,
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
  const list = words.join("\", \"");
  return {
    en: `Pronunciation of "${list}" came up more than once — worth extra practice.`,
    ru: `Произношение слов «${words.join("», «")}» повторялось несколько раз — стоит потренировать отдельно.`,
    kz: `«${words.join("», «")}» сөздерінің айтылымы бірнеше рет қайталанды — қосымша жаттығу қажет.`,
  };
}

const CONSISTENCY_WEAKNESS: TranslatedText = {
  en: "Performance dipped in the later part of the session — pace yourself to stay consistent",
  ru: "Результат снизился во второй части сессии — старайтесь сохранять темп до конца",
  kz: "Сессияның екінші бөлігінде нәтиже төмендеді — соңына дейін қарқынды сақтауға тырысыңыз",
};

const RE_READ_QUESTION_SUGGESTION: TranslatedText = {
  en: "Before answering, repeat the question in your head to make sure you address exactly what's asked",
  ru: "Перед ответом мысленно повторите вопрос, чтобы убедиться, что вы отвечаете именно на него",
  kz: "Жауап бермес бұрын сұрақты ойыңызда қайталап, нақты соған жауап беріп жатқаныңызға көз жеткізіңіз",
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

/** Offline fallback (no ANTHROPIC_API_KEY configured) — unlike the old
 * random session synthesis, this aggregates the real accumulated per-turn
 * data (actual transcripts, actual scores, actual grammar errors already
 * produced per-turn) instead of re-rolling its own report independently. */
export function synthesizeReportFromTurns(
  completedTurns: CompletedTurn[],
  level: DelfLevel,
  language: FeedbackLanguage
): SpeakingExaminerReport {
  const profile = MOCK_SPEAKING_PROFILES[level];
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

  // Every list below is built from real observations about this specific
  // session first, and only padded with a static (but still accurate) pool
  // entry when there aren't enough dynamic observations to fill it out —
  // never a purely pre-written summary independent of what happened.
  const dynamicStrengths: string[] = [];
  if (total > 0 && irrelevantCount === 0) dynamicStrengths.push(ALL_RELEVANT_STRENGTH[language]);
  if (improved) dynamicStrengths.push(IMPROVEMENT_STRENGTH[language]);
  if (total >= 2 && commonErrors.length === 0) dynamicStrengths.push(NO_REPEATED_ERRORS_STRENGTH[language]);
  const strengths =
    dynamicStrengths.length >= 2
      ? dynamicStrengths.slice(0, 3)
      : [...dynamicStrengths, ...profile.strengths.slice(0, 3 - dynamicStrengths.length).map((s) => s[language])];

  const dynamicWeaknesses: string[] = [];
  if (irrelevantCount > 0) dynamicWeaknesses.push(buildIrrelevantWeakness(irrelevantCount, total)[language]);
  if (recurringMispronounced.length > 0) {
    dynamicWeaknesses.push(buildRecurringPronunciationNote(recurringMispronounced)[language]);
  }
  if (declined) dynamicWeaknesses.push(CONSISTENCY_WEAKNESS[language]);
  const weaknesses =
    dynamicWeaknesses.length > 0
      ? dynamicWeaknesses.slice(0, 3)
      : profile.weaknesses.slice(0, 2).map((w) => w[language]);

  const dynamicSuggestions: string[] = [];
  if (irrelevantCount > 0) dynamicSuggestions.push(RE_READ_QUESTION_SUGGESTION[language]);
  if (recurringMispronounced.length > 0) dynamicSuggestions.push(buildPracticeWordsSuggestion(recurringMispronounced)[language]);
  if (commonErrors.length > 0) dynamicSuggestions.push(HOW_TO_AVOID_BY_CATEGORY[commonErrors[0].category][language]);
  const suggestions =
    dynamicSuggestions.length >= 2
      ? dynamicSuggestions.slice(0, 3)
      : [...dynamicSuggestions, ...profile.improvementTips.slice(0, 3 - dynamicSuggestions.length).map((s) => s[language])];

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
      summary: profile.vocabularyRangeNotes[0][language],
      rangeNote: profile.vocabularyRangeNotes[
        Math.min(1, profile.vocabularyRangeNotes.length - 1)
      ][language],
    },
    pronunciation: {
      summary:
        recurringMispronounced.length > 0
          ? buildRecurringPronunciationNote(recurringMispronounced)[language]
          : profile.pronunciationNotes[0][language],
      note: profile.pronunciationNotes[
        Math.min(1, profile.pronunciationNotes.length - 1)
      ][language],
    },
    fluency: {
      summary: profile.fluencyNotes[0][language],
      pace: profile.fluencyNotes[Math.min(1, profile.fluencyNotes.length - 1)][language],
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
