import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import type { VocabularyMistake, VocabularySentenceFeedback } from "@/types/vocabulary";
import { findWordEntry } from "./word-of-the-day";

/**
 * Offline fallback vocabulary-sentence evaluator, used by
 * /api/vocabulary/evaluate when no ANTHROPIC_API_KEY is configured. Grades
 * the student's ACTUAL sentence against the target word in a fixed order —
 * real sentence? word actually used? does it make sense? any grammar
 * mistakes? — and only decides the final status once every step has run.
 * Never defaults to "correct." This is a small, independent rule set (not
 * shared with the Speaking evaluator) so changes here can never regress
 * Speaking's already-stabilized behavior.
 *
 * Honest limit: genuine open-ended semantic judgment ("this sentence is
 * nonsensical") needs real language understanding that a regex engine
 * can't provide in general. Step 3 below is a small, curated,
 * bounded check (verb/object edibility) — real signal for the cases it
 * covers, not general understanding. The Claude path
 * (lib/ai/vocabulary-evaluator.ts) is where genuine semantic judgment
 * actually happens once ANTHROPIC_API_KEY is configured.
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

function extractTokens(text: string): string[] {
  return text
    .replace(/[.,!?;:"'’«»()]/g, " ")
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean);
}

/** Step 0 — reject inputs that aren't a real sentence at all (a bag of
 * nouns like "pizza voiture livre" has no function words connecting them;
 * a genuine French sentence, however simple, always has at least one). */
const FRENCH_FUNCTION_WORDS = new Set([
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
  "le", "la", "les", "un", "une", "des", "de", "du", "d",
  "et", "ou", "mais", "donc", "car", "que", "qui", "dont",
  "dans", "sur", "avec", "pour", "par", "sans", "sous", "chez", "vers", "entre",
  "est", "es", "suis", "sont", "etes", "sommes", "etre", "avoir", "ai", "as", "avons", "avez", "ont",
  "ce", "cet", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "notre", "nos", "votre", "vos", "leur", "leurs",
  "ne", "pas", "plus", "tres", "bien", "aussi", "comme",
  "au", "aux", "en", "y", "se", "me", "te", "lui",
]);

function looksLikeRealSentence(text: string): boolean {
  const tokens = extractTokens(text);
  if (tokens.length < 2) return false;
  return tokens.some((tok) => FRENCH_FUNCTION_WORDS.has(tok));
}

/** Step 1 — was the target word actually used. Invariable words (most of
 * this app's word bank: adverbs, conjunctions, expressions, some
 * multi-word like "quand même") require a real word-boundary match, not
 * just substring containment. Only the bank's one verb ("parvenir") needs
 * stem matching, since it appears conjugated ("parvenu", "parvient"). */
const CONJUGATABLE_WORDS = new Set(["parvenir"]);

function containsWordExact(sentence: string, word: string): boolean {
  const normalizedSentence = normalize(sentence).replace(/['’-]/g, " ");
  const normalizedWord = normalize(word).replace(/['’-]/g, " ").trim();
  const pattern = new RegExp(`\\b${normalizedWord.replace(/\s+/g, "\\s+")}\\b`, "i");
  if (pattern.test(normalizedSentence)) return true;
  if (CONJUGATABLE_WORDS.has(normalizedWord)) {
    const stemLength = Math.max(4, Math.floor(normalizedWord.length * 0.6));
    const stem = normalizedWord.slice(0, stemLength);
    return normalizedSentence.includes(stem);
  }
  return false;
}

/** Step 2 — bounded semantic-mismatch check. Real signal for the specific
 * pattern it covers (eating/drinking something inedible), not general
 * "does this sentence make sense" understanding. */
const EATING_DRINKING_VERBS = /\b(mange|manges|mangez|mangeons|mangent|manger|mangé)\b|\b(bois|buvez|buvons|boivent|boire|bu)\b/i;
const INEDIBLE_OBJECTS = [
  "voiture", "maison", "ordinateur", "telephone", "table", "chaise", "livre",
  "ville", "montagne", "idee", "universite", "chambre", "cuisine", "fenetre",
  "porte", "stylo", "chien", "chat", "ami", "amie",
];

function findSemanticMismatch(sentence: string): { verb: string; object: string } | null {
  const normalized = normalize(sentence);
  const verbMatch = normalized.match(EATING_DRINKING_VERBS);
  if (!verbMatch) return null;
  for (const obj of INEDIBLE_OBJECTS) {
    if (new RegExp(`\\b${obj}s?\\b`).test(normalized)) {
      return { verb: verbMatch[0], object: obj };
    }
  }
  return null;
}

/** Step 3 — real, transcript-grounded grammar checking. Every rule only
 * fires when its pattern genuinely appears; corrections are computed from
 * the actual matched text, never a canned phrase. */
interface VocabGrammarRule {
  regex: RegExp;
  correction: (matched: string) => string;
  explanation: TranslatedText;
}

const JE_CONJUGATION_MAP: Record<string, string> = {
  aimer: "j'aime", vouloir: "je veux", pouvoir: "je peux", aller: "je vais",
  faire: "je fais", habiter: "j'habite", parler: "je parle", manger: "je mange",
  avoir: "j'ai", être: "je suis", jouer: "je joue", regarder: "je regarde",
};

const FEMININE_NOUNS = [
  "maison", "voiture", "ville", "chose", "idée", "université", "semaine",
  "année", "table", "chambre", "cuisine", "montagne", "porte", "fenêtre",
];

const FEMININE_ADJECTIVE_MAP: Record<string, string> = {
  blanc: "blanche", grand: "grande", petit: "petite", beau: "belle",
  nouveau: "nouvelle", vieux: "vieille", bon: "bonne",
};

const PLURAL_NOUNS = ["voiture", "maison", "table", "chaise", "idée", "ville", "livre", "ami", "amie"];

const VOCAB_GRAMMAR_RULES: VocabGrammarRule[] = [
  {
    regex: new RegExp(`\\bun\\s+(${FEMININE_NOUNS.join("|")})(?![a-zà-ÿ])`, "i"),
    correction: (m) => m.replace(/\bun\b/i, "une"),
    explanation: {
      en: "This noun is feminine, so it takes \"une\", not \"un\" — a gender/article agreement rule.",
      ru: "Это существительное женского рода, поэтому употребляется с «une», а не «un» — правило согласования рода/артикля.",
      kz: "Бұл зат есім әйел тегінде, сондықтан «une» қолданылады, «un» емес — тек/артикль келісім ережесі.",
    },
  },
  {
    regex: new RegExp(
      `\\b(${FEMININE_NOUNS.join("|")})\\s+(blanc|grand|petit|beau|nouveau|vieux|bon)\\b`,
      "i"
    ),
    correction: (m) => {
      const match = m.match(/^(\S+)\s+(\S+)$/);
      if (!match) return m;
      const [, noun, adj] = match;
      return `${noun} ${FEMININE_ADJECTIVE_MAP[adj.toLowerCase()] ?? adj}`;
    },
    explanation: {
      en: "This noun is feminine, so the adjective describing it must also take its feminine form — noun/adjective agreement.",
      ru: "Это существительное женского рода, поэтому прилагательное тоже должно быть в женском роде — согласование существительного и прилагательного.",
      kz: "Бұл зат есім әйел тегінде, сондықтан оны сипаттайтын сын есім де әйелдік түрде болуы керек — зат есім/сын есім келісімі.",
    },
  },
  {
    regex: new RegExp(`\\b(les|des)\\s+(${PLURAL_NOUNS.join("|")})(?![a-zà-ÿs])`, "i"),
    correction: (m) => m.replace(/(\S+)$/, "$1s"),
    explanation: {
      en: "After \"les\"/\"des\" the noun must be plural — add the missing \"s\".",
      ru: "После «les»/«des» существительное должно стоять во множественном числе — добавьте пропущенное «s».",
      kz: "«Les»/«des»-тен кейін зат есім көпше түрде болуы керек — жетіспейтін «s»-ті қосыңыз.",
    },
  },
  {
    regex: /\bje\s+suis\s+([a-zà-ÿ0-9-]+)\s+ans?\b/i,
    correction: (m) => m.replace(/\bje\s+suis\b/i, "j'ai"),
    explanation: {
      en: "Age is expressed with \"avoir\" (avoir + age), not \"être\" — a fixed verb-choice rule.",
      ru: "Возраст выражается с помощью глагола «avoir» (avoir + возраст), а не «être» — устойчивое правило выбора глагола.",
      kz: "Жас мөлшері «avoir» етістігімен беріледі (avoir + жас), «être» емес — тұрақты етістік таңдау ережесі.",
    },
  },
  {
    regex: new RegExp(`\\bje\\s+(${Object.keys(JE_CONJUGATION_MAP).join("|")})\\b`, "i"),
    correction: (m) => {
      const verb = m.trim().split(/\s+/)[1]?.toLowerCase() ?? "";
      return JE_CONJUGATION_MAP[verb] ?? m;
    },
    explanation: {
      en: "The verb must be conjugated for \"je\", not left in the infinitive — verb conjugation.",
      ru: "Глагол нужно спрягать для «je», а не оставлять в инфинитиве — спряжение глагола.",
      kz: "Етістік «je» үшін жіктелуі керек, тұйық түрде қалмауы керек — етістік жіктелуі.",
    },
  },
  {
    regex:
      /\bj['’]ai\s+(allée?s?|arrivée?s?|partie?s?|venue?s?|entrée?s?|sortie?s?|montée?s?|descendue?s?|restée?s?|tombée?s?|née?s?)(?![a-zà-ÿ])/i,
    correction: (m) => m.replace(/j['’]ai/i, "je suis"),
    explanation: {
      en: "This verb takes \"être\" as its auxiliary in the passé composé, not \"avoir\" — tense/auxiliary rule.",
      ru: "Этот глагол в passé composé спрягается с «être», а не с «avoir» — правило выбора вспомогательного глагола.",
      kz: "Бұл етістік passé composé-де «être» көмекші етістігімен тіркеседі, «avoir» емес — көмекші етістік ережесі.",
    },
  },
  {
    regex: /\belle\s+est\s+(allé|arrivé|parti|venu|entré|sorti|monté|descendu|resté|tombé|né)(?![a-zà-ÿ])/i,
    correction: (m) => `${m}e`,
    explanation: {
      en: "With \"être\", the past participle agrees with the subject — it needs an \"e\" for a feminine subject.",
      ru: "С «être» причастие прошедшего времени согласуется с подлежащим — для женского рода нужна «e».",
      kz: "«Être»-мен есімше бастауышпен келіседі — әйелдік тек үшін «e» қажет.",
    },
  },
  {
    regex: /\bje\s+pense\s+de\s+\w+/i,
    correction: (m) => m.replace(/\spense\s+de\s+/i, " pense "),
    explanation: {
      en: "\"Penser\" + infinitive doesn't take \"de\" when expressing an intention — preposition rule.",
      ru: "«Penser» + инфинитив не требует предлога «de» при выражении намерения — правило предлога.",
      kz: "Ниетті білдіргенде «penser» + тұйық етістік «de» септеулігін қажет етпейді — септеулік ережесі.",
    },
  },
];

function findGrammarMistakes(sentence: string, language: FeedbackLanguage): VocabularyMistake[] {
  const results: VocabularyMistake[] = [];
  for (const rule of VOCAB_GRAMMAR_RULES) {
    const match = sentence.match(rule.regex);
    if (match) {
      results.push({
        original: match[0],
        correction: rule.correction(match[0]),
        whyWrong: rule.explanation[language],
      });
      if (results.length >= 3) break;
    }
  }
  return results;
}

const PUNCTUATION_EXPLANATION: TranslatedText = {
  en: "French sentences start with a capital letter and end with terminal punctuation (. ! ?).",
  ru: "Французские предложения начинаются с заглавной буквы и заканчиваются знаком препинания (. ! ?).",
  kz: "Француз сөйлемдері бас әріппен басталып, тыныс белгісімен (. ! ?) аяқталады.",
};

function checkPunctuation(sentence: string, language: FeedbackLanguage): VocabularyMistake | null {
  const trimmed = sentence.trim();
  if (!trimmed) return null;
  const needsCapital = /^[a-zà-ÿ]/.test(trimmed);
  const needsTerminal = !/[.!?]$/.test(trimmed);
  if (!needsCapital && !needsTerminal) return null;
  let corrected = trimmed;
  if (needsCapital) corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  if (needsTerminal) corrected = `${corrected}.`;
  return { original: trimmed, correction: corrected, whyWrong: PUNCTUATION_EXPLANATION[language] };
}

function applyMistakes(sentence: string, mistakes: VocabularyMistake[]): string {
  let result = sentence;
  for (const mistake of mistakes) {
    result = result.replace(mistake.original, mistake.correction);
  }
  return result;
}

const NOT_A_SENTENCE: TranslatedText = {
  en: "This isn't a real sentence — just a list of words with nothing connecting them. Write a full sentence using the target word.",
  ru: "Это не настоящее предложение — просто список слов без связи между ними. Напишите полное предложение с целевым словом.",
  kz: "Бұл нақты сөйлем емес — тек байланыссыз сөздер тізімі. Мақсатты сөзді қолданып, толық сөйлем жазыңыз.",
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
    en: `"${verb} ... ${object}" doesn't make sense — you can't eat or drink a ${object}. The grammar may look fine, but the sentence's meaning is wrong.`,
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
    en: "Good attempt — fix these points and it'll be a strong sentence.",
    ru: "Хорошая попытка — исправьте эти моменты, и предложение будет отличным.",
    kz: "Жақсы әрекет — осы сәттерді түзетсеңіз, сөйлем мықты болады.",
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
  en: "The word is doing genuine work in this sentence, it fits the meaning, and the grammar around it holds up.",
  ru: "Слово по-настоящему используется в этом предложении, подходит по смыслу, и грамматика вокруг него верна.",
  kz: "Сөз бұл сөйлемде шынымен қызмет етеді, мағынасына сай келеді, айналасындағы грамматика дұрыс.",
};

const GRAMMAR_EXPLANATION_SUMMARY: TranslatedText = {
  en: "Fixing these points keeps your original meaning while making the sentence grammatically correct.",
  ru: "Исправление этих моментов сохраняет исходный смысл и делает предложение грамматически верным.",
  kz: "Осы сәттерді түзету бастапқы мағынаны сақтай отырып, сөйлемді грамматикалық тұрғыдан дұрыс етеді.",
};

export function analyzeVocabularySentence(
  word: string,
  sentence: string,
  _level: DelfLevel,
  language: FeedbackLanguage
): VocabularySentenceFeedback {
  const trimmed = sentence.trim();
  // A real, hand-authored example sentence for this word (if it's in the
  // curated word bank) — used as the "corrected sentence" fallback when
  // there's nothing of the student's own to correct, never a generated
  // placeholder like "... word ...".
  const naturalExample = findWordEntry(word)?.exampleSentences[0] ?? null;

  // Step 0: is this even a real sentence?
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
  if (!containsWordExact(trimmed, word)) {
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

  // Step 3: grammar first, then punctuation — checked and applied against
  // the grammar-corrected text, not the original, so the two fixes never
  // silently conflict (a stale "original" that no longer matches after an
  // earlier substring fix would otherwise cause a fix to be dropped).
  const grammarMistakes = findGrammarMistakes(trimmed, language);
  const afterGrammarFix = applyMistakes(trimmed, grammarMistakes);
  const punctuationFix = checkPunctuation(afterGrammarFix, language);
  const allMistakes = punctuationFix ? [...grammarMistakes, punctuationFix] : grammarMistakes;

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const isShort = wordCount < 5;

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
      mistakes: [semanticMistake, ...allMistakes],
      naturalSuggestion: null,
      explanation: buildSemanticMismatchExplanation(semanticMismatch.verb, semanticMismatch.object, language),
      encouragement: ENCOURAGEMENT.incorrect[language],
    };
  }

  if (allMistakes.length > 0) {
    const corrected = punctuationFix ? applyMistakes(afterGrammarFix, [punctuationFix]) : afterGrammarFix;
    return {
      status: "incorrect",
      correctedSentence: corrected === trimmed ? null : corrected,
      mistakes: allMistakes,
      naturalSuggestion: isShort ? NATURAL_SUGGESTION_SHORT[language] : null,
      explanation: GRAMMAR_EXPLANATION_SUMMARY[language],
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
