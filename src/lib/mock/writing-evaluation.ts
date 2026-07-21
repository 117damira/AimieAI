import { DELF_WRITING_LEVELS } from "@/config/delf-writing";
import type {
  CoherenceFeedback,
  DelfLevel,
  ExamReadinessFeedback,
  FeedbackLanguage,
  GrammarError,
  LanguageAccuracyFeedback,
  RelevanceFeedback,
  StructureFeedback,
  TaskCompletionFeedback,
  VocabularyFeedback,
  WritingEvaluation,
} from "@/types/writing-evaluation";
import { extractContentWords, findSentenceFragments, lexicalDiversity } from "@/lib/evaluation/text-utils";
import { findGrammarMistakes, getGrammarRule } from "@/lib/evaluation/grammar-rules";

/**
 * Offline fallback DELF writing evaluator, used by /api/writing/evaluate
 * when no ANTHROPIC_API_KEY is configured (see lib/ai/writing-evaluator.ts
 * for the real Claude path). Every field is computed from the student's
 * actual submitted essay against the actual prompt — nothing is picked at
 * random from a canned per-level pool, and no mistake is shown that isn't
 * genuinely present in the text. Grammar-mistake detection is shared with
 * Speaking and Vocabulary (see lib/evaluation/).
 *
 * Split into two phases so the feedback LANGUAGE can be switched instantly
 * on the client without re-running analysis:
 *  - analyzeResponse(): computes every real signal from the essay text.
 *    Language-independent, fully deterministic (no randomness).
 *  - localizeEvaluation(): pure — turns a selection into display text in
 *    the requested language. Safe to call on the client for instant
 *    re-translation, no network round trip needed.
 *
 * The exam prompt and the student's own response always stay in French —
 * only this AI-generated feedback text is translated. Grammar "original"
 * and "correction" excerpts are always French too; only their explanation
 * is localized.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

/** Real per-level rubric facts (not feedback content) — whether a
 * conclusion is expected at this level, and the point ceiling used by the
 * transparent scoring formula below. */
const CONCLUSION_REQUIRED_BY_LEVEL: Record<DelfLevel, boolean> = {
  A1: false,
  A2: false,
  B1: true,
  B2: true,
};

const LEVEL_SCORE_CEILING: Record<DelfLevel, number> = { A1: 20, A2: 21, B1: 22, B2: 23 };

const GREETING_PATTERN = /\b(bonjour|cher|ch[eè]re|salut|madame|monsieur)\b/i;
const CLOSING_PATTERN =
  /\b(cordialement|bisous|[aà] bient[oô]t|bien [aà] vous|salutations|amicalement)\b/i;
const BASIC_CONNECTOR_PATTERN = /\b(et|mais|donc|parce que|alors|puis|ensuite|d['’]abord|enfin|car)\b/i;
const ADVANCED_CONNECTOR_PATTERN = /\b(cependant|néanmoins|bien que|quoique|en revanche|par ailleurs|toutefois)\b/i;

export type MissingElementKey = "greeting" | "onTopicContent" | "moreContent" | "mainIdeas" | "conclusion";

/** Selection produced by analyzing the real essay. Language-neutral — safe
 * to keep in client state and re-localize instantly. Fully deterministic:
 * identical input always produces an identical selection. */
export interface EvaluationSelection {
  level: DelfLevel;
  wordCount: number;
  addressedPrompt: boolean;
  respectedFormat: boolean;
  isRelevant: boolean;
  hasIntroduction: boolean;
  hasMainIdeas: boolean;
  hasConclusion: boolean;
  conclusionRequired: boolean;
  isCoherent: boolean;
  missingElementKeys: MissingElementKey[];
  matchedMistakes: { ruleId: string; original: string; correction: string }[];
  fragments: { original: string; correction: string }[];
  vocabularyDiversity: number;
  hasAdvancedConnectors: boolean;
  estimatedScore: number;
  scoreOutOf: number;
  originalText: string;
}

/** Inserts a visible, bracketed placeholder rather than guessing what verb
 * the student meant — flags the gap without inventing content. */
function markMissingVerb(sentence: string): string {
  const match = sentence.match(/^(je|j['’]|tu|il|elle|on|nous|vous|ils|elles)\b/i);
  if (match) {
    const end = match[0].length;
    return `${sentence.slice(0, end)} [verbe manquant] ${sentence.slice(end).trim()}`;
  }
  return `[verbe manquant] ${sentence}`;
}

export function analyzeResponse(
  level: DelfLevel,
  prompt: string,
  responseText: string,
  wordCount: number
): EvaluationSelection {
  const config = DELF_WRITING_LEVELS[level];

  const hasIntroduction = GREETING_PATTERN.test(responseText) || wordCount > 5;
  const hasConclusion = CLOSING_PATTERN.test(responseText);
  const hasMainIdeas = wordCount >= config.minWords * 0.5;
  const inRange = wordCount >= config.minWords * 0.8 && wordCount <= config.maxWords * 1.3;
  const sentenceCount = (responseText.match(/[.!?]+/g) ?? []).length || 1;

  // Real relevance check: does the essay actually share content words with
  // the real prompt it was asked to respond to — not just "is it long
  // enough". Kept as its own signal (isRelevant) separate from
  // addressedPrompt, which also folds in length, so a short-but-on-topic
  // answer and an off-topic answer are distinguishable.
  const promptWords = extractContentWords(prompt);
  const responseWords = new Set(extractContentWords(responseText));
  const isRelevant = promptWords.length === 0 || promptWords.some((w) => responseWords.has(w));
  const addressedPrompt = wordCount >= Math.max(10, config.minWords * 0.4) && isRelevant;

  const matchedMistakes = findGrammarMistakes(responseText, 6).map((m) => ({
    ruleId: m.ruleId,
    original: m.original,
    correction: m.correction,
  }));

  const fragments = findSentenceFragments(responseText).map((f) => ({
    original: f.sentence,
    correction: markMissingVerb(f.sentence),
  }));

  const vocabularyDiversity = lexicalDiversity(responseText);
  const hasAdvancedConnectors = ADVANCED_CONNECTOR_PATTERN.test(responseText);
  const isCoherent = sentenceCount <= 1 || BASIC_CONNECTOR_PATTERN.test(responseText) || hasAdvancedConnectors;

  const missingElementKeys: MissingElementKey[] = [];
  if (!hasIntroduction) missingElementKeys.push("greeting");
  if (!isRelevant) missingElementKeys.push("onTopicContent");
  else if (!hasMainIdeas) missingElementKeys.push("moreContent");
  if (isRelevant && !hasMainIdeas) missingElementKeys.push("mainIdeas");
  if (!hasConclusion) missingElementKeys.push("conclusion");

  let score = LEVEL_SCORE_CEILING[level];
  score -= matchedMistakes.length * 2;
  score -= fragments.length * 2;
  if (!inRange) score -= 2;
  if (!hasIntroduction) score -= 2;
  if (CONCLUSION_REQUIRED_BY_LEVEL[level] && !hasConclusion) score -= 2;
  if (!isCoherent) score -= 2;
  if (vocabularyDiversity < 0.5 && wordCount >= 20) score -= 2;
  score = Math.max(5, Math.min(25, score));
  if (!addressedPrompt) score = Math.min(score, 10);
  const estimatedScore = score;

  return {
    level,
    wordCount,
    addressedPrompt,
    respectedFormat: inRange,
    isRelevant,
    hasIntroduction,
    hasMainIdeas,
    hasConclusion,
    conclusionRequired: CONCLUSION_REQUIRED_BY_LEVEL[level],
    isCoherent,
    missingElementKeys,
    matchedMistakes,
    fragments,
    vocabularyDiversity,
    hasAdvancedConnectors,
    estimatedScore,
    scoreOutOf: 25,
    originalText: responseText,
  };
}

const TASK_NOTES = {
  short: (level: DelfLevel, wordCount: number): TranslatedText => ({
    en: `The response is too short (${wordCount} words) to fully develop the task expected at ${level}.`,
    ru: `Ответ слишком короткий (${wordCount} слов), чтобы полностью раскрыть задание уровня ${level}.`,
    kz: `Жауап тым қысқа (${wordCount} сөз) — бұл ${level} деңгейіне тән тапсырманы толық аша алмайды.`,
  }),
  offTopic: (level: DelfLevel): TranslatedText => ({
    en: `The response doesn't share any real content with the actual prompt given at ${level} — make sure to respond to what was actually asked.`,
    ru: `Ответ никак не связан по содержанию с заданной темой уровня ${level} — убедитесь, что вы отвечаете именно на поставленный вопрос.`,
    kz: `Жауап ${level} деңгейінде берілген тапсырманың мазмұнымен байланысты емес — нақты сұралғанға жауап беруге көз жеткізіңіз.`,
  }),
  inRange: (level: DelfLevel, min: number, max: number): TranslatedText => ({
    en: `The response engages with the prompt and stays close to the expected ${min}-${max} word range for ${level}.`,
    ru: `Ответ раскрывает тему и укладывается в ожидаемый диапазон ${min}-${max} слов для уровня ${level}.`,
    kz: `Жауап тақырыпты ашады және ${level} деңгейі үшін күтілетін ${min}-${max} сөз аралығына сай келеді.`,
  }),
  outOfRange: (level: DelfLevel, wordCount: number, min: number, max: number): TranslatedText => ({
    en: `The response engages with the prompt, but at ${wordCount} words it falls outside the expected ${min}-${max} word range for ${level} — aim to match the target length more closely.`,
    ru: `Ответ раскрывает тему, но при объёме в ${wordCount} слов выходит за пределы ожидаемого диапазона ${min}-${max} слов для уровня ${level} — постарайтесь точнее соблюдать нужный объём.`,
    kz: `Жауап тақырыпты ашады, бірақ ${wordCount} сөз ${level} деңгейі үшін күтілетін ${min}-${max} сөз аралығынан тыс — көлемді мақсатты аралыққа жақындатуға тырысыңыз.`,
  }),
};

const MISSING_ELEMENT_LABELS: Record<MissingElementKey, TranslatedText> = {
  greeting: {
    en: "an opening greeting or sign-in line",
    ru: "вступительное приветствие",
    kz: "кіріспе сәлемдесу сөйлемі",
  },
  onTopicContent: {
    en: "content that actually addresses what the prompt asked",
    ru: "содержание, действительно отвечающее на заданный вопрос",
    kz: "тапсырмада сұралғанға шынымен жауап беретін мазмұн",
  },
  moreContent: {
    en: "more developed content to reach the expected length",
    ru: "более развёрнутое содержание для достижения нужного объёма",
    kz: "күтілетін көлемге жету үшін толығырақ мазмұн",
  },
  mainIdeas: {
    en: "clearly developed main ideas",
    ru: "чётко развитые основные идеи",
    kz: "анық дамытылған негізгі ойлар",
  },
  conclusion: {
    en: "a closing line or conclusion",
    ru: "заключительная фраза или вывод",
    kz: "қорытынды сөйлем",
  },
};

const RELEVANCE_NOTES = {
  relevant: (level: DelfLevel): TranslatedText => ({
    en: `The content genuinely relates to the ${level} prompt's actual subject.`,
    ru: `Содержание действительно соответствует теме задания уровня ${level}.`,
    kz: `Мазмұны ${level} деңгейіндегі тапсырманың нақты тақырыбына шынымен сәйкес келеді.`,
  }),
  notRelevant: (level: DelfLevel): TranslatedText => ({
    en: `Nothing in the response connects to what the ${level} prompt actually asked — re-read the prompt and respond to its specific subject.`,
    ru: `Ничто в ответе не связано с тем, что действительно спрашивалось в задании уровня ${level} — перечитайте задание и ответьте на его конкретную тему.`,
    kz: `Жауапта ${level} деңгейіндегі тапсырмада нақты сұралғанмен байланысты ештеңе жоқ — тапсырманы қайта оқып, оның нақты тақырыбына жауап беріңіз.`,
  }),
};

const COHERENCE_NOTES = {
  coherent: {
    en: "Ideas connect logically from one sentence to the next.",
    ru: "Идеи логично связаны от одного предложения к другому.",
    kz: "Ойлар бір сөйлемнен екіншісіне логикалық түрде байланысады.",
  } as TranslatedText,
  notCoherent: {
    en: "Sentences sit side by side without connectors (et, mais, donc, parce que...) linking the ideas together.",
    ru: "Предложения стоят рядом без связующих слов (et, mais, donc, parce que...), объединяющих идеи.",
    kz: "Сөйлемдер ойларды байланыстыратын жалғаулықтарсыз (et, mais, donc, parce que...) қатар тұр.",
  } as TranslatedText,
};

const PARAGRAPH_ORGANIZATION: { withMainIdeas: TranslatedText; without: TranslatedText } = {
  withMainIdeas: {
    en: "Ideas are organized into readable segments, though transitions between them could be smoother.",
    ru: "Идеи организованы в читаемые смысловые блоки, однако переходы между ними можно сделать более плавными.",
    kz: "Ойлар оқуға ыңғайлы бөліктерге бөлінген, дегенмен олардың арасындағы байланыс тегісірек болуы мүмкін еді.",
  },
  without: {
    en: "The response would benefit from clearer paragraph breaks separating each idea.",
    ru: "Ответу не хватает чётких абзацев, разделяющих отдельные идеи.",
    kz: "Жауапта әрбір ойды бөлек көрсететін анық абзацтар жетіспейді.",
  },
};

const LANGUAGE_SUMMARY = {
  withErrors: (count: number): TranslatedText => ({
    en: `Found ${count} real error${count === 1 ? "" : "s"} in this response — see the corrections below.`,
    ru: `В этом ответе найдено ${count} реальн${count === 1 ? "ая ошибка" : "ых ошибки"} — см. исправления ниже.`,
    kz: `Бұл жауаптан ${count} нақты қате табылды — түзетулерді төменнен қараңыз.`,
  }),
  noErrors: {
    en: "No grammar mistakes detected in this response.",
    ru: "В этом ответе не обнаружено грамматических ошибок.",
    kz: "Бұл жауаптан грамматикалық қателер табылмады.",
  } as TranslatedText,
};

const FRAGMENT_EXPLANATION: TranslatedText = {
  en: "This sentence is missing a verb, so it isn't a complete sentence — a French sentence needs a conjugated verb (e.g. \"Je suis avec ma famille\" or \"J'aime ma famille\").",
  ru: "В этом предложении отсутствует глагол, поэтому оно не является законченным — французскому предложению нужен спрягаемый глагол (например, «Je suis avec ma famille» или «J'aime ma famille»).",
  kz: "Бұл сөйлемде етістік жоқ, сондықтан ол толық сөйлем емес — француз сөйлеміне жіктелген етістік қажет (мысалы, «Je suis avec ma famille» немесе «J'aime ma famille»).",
};

function buildVocabularyFeedback(
  diversity: number,
  hasAdvancedConnectors: boolean,
  level: DelfLevel,
  wordCount: number,
  language: FeedbackLanguage
): VocabularyFeedback {
  const uniqueRatioPercent = Math.round(diversity * 100);
  const wordChoice: TranslatedText =
    wordCount < 15
      ? {
          en: "Too short to assess word choice meaningfully.",
          ru: "Слишком коротко, чтобы содержательно оценить выбор слов.",
          kz: "Сөз таңдауын мазмұнды бағалау үшін тым қысқа.",
        }
      : {
          en: `About ${uniqueRatioPercent}% of the content words used are distinct — a real measure of how varied the vocabulary is in this specific response.`,
          ru: `Около ${uniqueRatioPercent}% использованных значимых слов уникальны — это реальный показатель разнообразия лексики именно в этом ответе.`,
          kz: `Қолданылған мағыналы сөздердің шамамен ${uniqueRatioPercent}%-ы қайталанбайды — бұл осы жауаптағы лексика әртүрлілігінің нақты көрсеткіші.`,
        };
  const variety: TranslatedText =
    diversity >= 0.7
      ? {
          en: "Wide range of vocabulary with little repetition.",
          ru: "Широкий словарный запас с небольшим количеством повторов.",
          kz: "Аз қайталанатын кең сөздік қор.",
        }
      : diversity >= 0.5
        ? {
            en: "Reasonable vocabulary range, with some words repeated.",
            ru: "Приемлемый словарный запас, некоторые слова повторяются.",
            kz: "Жеткілікті сөздік қор, кейбір сөздер қайталанады.",
          }
        : {
            en: "Vocabulary was repeated frequently — try varying word choice more.",
            ru: "Словарный запас часто повторялся — попробуйте больше разнообразить выбор слов.",
            kz: "Сөздік қор жиі қайталанды — сөз таңдауын көбірек әртараптандырып көріңіз.",
          };
  const levelAppropriateness: TranslatedText =
    (level === "B1" || level === "B2") && !hasAdvancedConnectors
      ? {
          en: `No higher-register connectors (e.g. "cependant", "néanmoins") were detected — using one would better match the ${level} register.`,
          ru: `Не обнаружены связующие слова более высокого регистра (например, «cependant», «néanmoins») — их использование лучше соответствовало бы уровню ${level}.`,
          kz: `Жоғары регистрдегі жалғаулық сөздер (мысалы, «cependant», «néanmoins») байқалмады — оларды қолдану ${level} деңгейіне сай келер еді.`,
        }
      : {
          en: `Vocabulary register is appropriate for ${level}.`,
          ru: `Регистр лексики соответствует уровню ${level}.`,
          kz: `Лексика регистрі ${level} деңгейіне сай келеді.`,
        };
  return {
    wordChoice: wordChoice[language],
    variety: variety[language],
    levelAppropriateness: levelAppropriateness[language],
  };
}

const STRENGTH_ADDRESSED_PROMPT: TranslatedText = {
  en: "Directly addressed the actual prompt given",
  ru: "Прямо раскрыл(а) заданную тему",
  kz: "Берілген тапсырманы тікелей ашты",
};
const STRENGTH_IN_RANGE: TranslatedText = {
  en: "Response length matched the expected word range",
  ru: "Объём ответа соответствовал ожидаемому диапазону слов",
  kz: "Жауап көлемі күтілетін сөз аралығына сай келді",
};
const STRENGTH_NO_MISTAKES: TranslatedText = {
  en: "No grammar mistakes detected",
  ru: "Грамматических ошибок не обнаружено",
  kz: "Грамматикалық қателер табылмады",
};
const STRENGTH_STRUCTURE: TranslatedText = {
  en: "Included both a clear introduction and a proper conclusion",
  ru: "Присутствуют и чёткое вступление, и правильное заключение",
  kz: "Анық кіріспе мен дұрыс қорытынды бар",
};
const STRENGTH_VOCAB: TranslatedText = {
  en: "Used a wide range of vocabulary without much repetition",
  ru: "Использован широкий словарный запас без сильных повторов",
  kz: "Қайталаусыз кең сөздік қор қолданылды",
};
const STRENGTH_COHERENT: TranslatedText = {
  en: "Ideas were connected logically with appropriate connectors",
  ru: "Идеи были логично связаны подходящими союзами",
  kz: "Ойлар сәйкес жалғаулықтармен логикалық түрде байланыстырылды",
};

const WEAKNESS_OFF_TOPIC: TranslatedText = {
  en: "Didn't share real content with the actual prompt",
  ru: "Не был содержательно связан с заданной темой",
  kz: "Берілген тапсырмамен мазмұндық байланысы болмады",
};
const WEAKNESS_TOO_SHORT: TranslatedText = {
  en: "Too short to fully develop the task",
  ru: "Слишком короткий, чтобы полностью раскрыть задание",
  kz: "Тапсырманы толық ашу үшін тым қысқа",
};
function buildMistakeWeakness(count: number, language: FeedbackLanguage): string {
  return {
    en: `${count} grammar mistake${count === 1 ? "" : "s"} found in this response`,
    ru: `В этом ответе найдено ${count} грамматическ${count === 1 ? "ая ошибка" : "их ошибки"}`,
    kz: `Бұл жауаптан ${count} грамматикалық қате табылды`,
  }[language];
}
function buildFragmentWeakness(count: number, language: FeedbackLanguage): string {
  return {
    en: `${count} sentence${count === 1 ? "" : "s"} missing a complete verb structure`,
    ru: `${count} предложени${count === 1 ? "е" : "я"} без полной глагольной структуры`,
    kz: `${count} сөйлемде толық етістік құрылымы жоқ`,
  }[language];
}
const WEAKNESS_MISSING_CONCLUSION: TranslatedText = {
  en: "Missing the conclusion expected at this level",
  ru: "Отсутствует заключение, ожидаемое на этом уровне",
  kz: "Бұл деңгейде күтілетін қорытынды жоқ",
};
const WEAKNESS_LOW_VOCAB: TranslatedText = {
  en: "Vocabulary repeated frequently instead of varying word choice",
  ru: "Словарный запас часто повторялся вместо разнообразия выбора слов",
  kz: "Сөз таңдауын әртараптандырудың орнына сөздік қор жиі қайталанды",
};
const WEAKNESS_NOT_COHERENT: TranslatedText = {
  en: "Sentences aren't linked with connectors, making the flow of ideas hard to follow",
  ru: "Предложения не связаны союзами, из-за чего трудно уследить за ходом мысли",
  kz: "Сөйлемдер жалғаулықтармен байланыспаған, сондықтан ой ағымын түсіну қиын",
};

const TIP_RE_READ_PROMPT: TranslatedText = {
  en: "Re-read the actual prompt before writing to make sure every sentence relates to it",
  ru: "Перечитайте задание перед тем, как писать, чтобы каждое предложение было с ним связано",
  kz: "Жазбас бұрын тапсырманы қайта оқыңыз, әр сөйлем соған қатысты болсын",
};
const TIP_ADD_CONCLUSION: TranslatedText = {
  en: "Add a short closing sentence or sign-off to properly conclude the response",
  ru: "Добавьте короткое заключительное предложение или подпись, чтобы правильно завершить ответ",
  kz: "Жауапты дұрыс аяқтау үшін қысқа қорытынды сөйлем немесе қол қою қосыңыз",
};
const TIP_VARY_VOCAB: TranslatedText = {
  en: "Note 2-3 synonyms for words you use often and work them into your next response",
  ru: "Запишите 2-3 синонима для часто используемых слов и используйте их в следующем ответе",
  kz: "Жиі қолданатын сөздерге 2-3 синоним жазып, келесі жауапта қолданыңыз",
};
const TIP_FIX_FRAGMENTS: TranslatedText = {
  en: "Check every sentence has a real conjugated verb before moving to the next one",
  ru: "Проверяйте, что в каждом предложении есть настоящий спрягаемый глагол, прежде чем переходить к следующему",
  kz: "Келесі сөйлемге өтпес бұрын әр сөйлемде нақты жіктелген етістік бар-жоғын тексеріңіз",
};
const TIP_USE_CONNECTORS: TranslatedText = {
  en: "Link your sentences with connectors like \"et\", \"mais\", \"donc\", or \"parce que\" instead of writing them side by side",
  ru: "Связывайте предложения союзами вроде «et», «mais», «donc» или «parce que», а не пишите их отдельно друг от друга",
  kz: "Сөйлемдерді бір-бірінен бөлек жазудың орнына «et», «mais», «donc» немесе «parce que» сияқты жалғаулықтармен байланыстырыңыз",
};

function buildExamReadiness(
  selection: EvaluationSelection,
  language: FeedbackLanguage
): Omit<ExamReadinessFeedback, "estimatedScore" | "scoreOutOf" | "scoreExplanation"> {
  const totalMistakes = selection.matchedMistakes.length + selection.fragments.length;

  // A response that doesn't genuinely address the prompt has no real
  // "strengths" to report — an examiner wouldn't praise the structure or
  // vocabulary of an off-topic or meaningless answer.
  const strengths: string[] = [];
  if (selection.addressedPrompt) {
    strengths.push(STRENGTH_ADDRESSED_PROMPT[language]);
    if (selection.respectedFormat) strengths.push(STRENGTH_IN_RANGE[language]);
    if (totalMistakes === 0) strengths.push(STRENGTH_NO_MISTAKES[language]);
    if (selection.hasIntroduction && (!selection.conclusionRequired || selection.hasConclusion)) {
      strengths.push(STRENGTH_STRUCTURE[language]);
    }
    if (selection.vocabularyDiversity >= 0.7 && selection.wordCount >= 15) strengths.push(STRENGTH_VOCAB[language]);
    if (selection.isCoherent && selection.wordCount >= 15) strengths.push(STRENGTH_COHERENT[language]);
  }

  const weaknesses: string[] = [];
  if (!selection.addressedPrompt) weaknesses.push(WEAKNESS_OFF_TOPIC[language]);
  if (selection.wordCount < 15) weaknesses.push(WEAKNESS_TOO_SHORT[language]);
  if (selection.matchedMistakes.length > 0) weaknesses.push(buildMistakeWeakness(selection.matchedMistakes.length, language));
  if (selection.fragments.length > 0) weaknesses.push(buildFragmentWeakness(selection.fragments.length, language));
  if (selection.conclusionRequired && !selection.hasConclusion) weaknesses.push(WEAKNESS_MISSING_CONCLUSION[language]);
  if (selection.vocabularyDiversity < 0.5 && selection.wordCount >= 20) weaknesses.push(WEAKNESS_LOW_VOCAB[language]);
  if (!selection.isCoherent) weaknesses.push(WEAKNESS_NOT_COHERENT[language]);

  const improvementTips: string[] = [];
  if (!selection.addressedPrompt) improvementTips.push(TIP_RE_READ_PROMPT[language]);
  if (selection.matchedMistakes.length > 0) {
    const rule = getGrammarRule(selection.matchedMistakes[0].ruleId);
    if (rule) {
      improvementTips.push(
        {
          verb: {
            en: "Drill this verb's conjugation pattern before your next practice essay.",
            ru: "Отработайте спряжение этого глагола перед следующим эссе.",
            kz: "Келесі эссе алдында осы етістіктің жіктелуін жаттығыңыз.",
          },
          agreement: {
            en: "Double-check gender/number agreement before finishing each sentence.",
            ru: "Проверяйте согласование рода/числа перед завершением каждого предложения.",
            kz: "Әр сөйлемді аяқтамас бұрын тек/сан келісімін тексеріңіз.",
          },
          "sentence-structure": {
            en: "Slow down to check sentence structure and word order while writing.",
            ru: "Не торопитесь, проверяйте структуру предложения и порядок слов при письме.",
            kz: "Жазу кезінде сөйлем құрылымы мен сөз тәртібін тексеруге уақыт бөліңіз.",
          },
          other: {
            en: "Review this specific rule before your next practice essay.",
            ru: "Повторите именно это правило перед следующим эссе.",
            kz: "Келесі эссе алдында осы ережені қайталаңыз.",
          },
        }[rule.category][language]
      );
    }
  }
  if (selection.fragments.length > 0) improvementTips.push(TIP_FIX_FRAGMENTS[language]);
  if (selection.conclusionRequired && !selection.hasConclusion) improvementTips.push(TIP_ADD_CONCLUSION[language]);
  if (selection.vocabularyDiversity < 0.5 && selection.wordCount >= 20) improvementTips.push(TIP_VARY_VOCAB[language]);
  if (!selection.isCoherent) improvementTips.push(TIP_USE_CONNECTORS[language]);

  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    improvementTips: improvementTips.slice(0, 4),
  };
}

const SCORE_EXPLANATION = {
  strong: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A strong result — ${score}/${scoreOutOf} indicates this response would likely meet the DELF ${level} passing standard comfortably.`,
    ru: `Хороший результат — ${score}/${scoreOutOf} говорит о том, что этот ответ, скорее всего, уверенно соответствует проходному уровню DELF ${level}.`,
    kz: `Жақсы нәтиже — ${score}/${scoreOutOf} бұл жауаптың DELF ${level} өту деңгейіне сенімді түрде сай келетінін көрсетеді.`,
  }),
  borderline: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A borderline result — ${score}/${scoreOutOf} suggests this response is close to the DELF ${level} passing standard but needs refinement to be reliable on exam day.`,
    ru: `Пограничный результат — ${score}/${scoreOutOf} означает, что ответ близок к проходному уровню DELF ${level}, но нуждается в доработке для уверенной сдачи экзамена.`,
    kz: `Шекаралық нәтиже — ${score}/${scoreOutOf} бұл жауаптың DELF ${level} өту деңгейіне жақын екенін, бірақ емтихан күні сенімді болу үшін жетілдіруді қажет ететінін білдіреді.`,
  }),
  weak: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `Below the target — ${score}/${scoreOutOf} indicates this response would likely fall short of the DELF ${level} passing standard without further practice.`,
    ru: `Ниже целевого уровня — ${score}/${scoreOutOf} означает, что без дополнительной практики этот ответ, скорее всего, не дотянет до проходного уровня DELF ${level}.`,
    kz: `Мақсатты деңгейден төмен — ${score}/${scoreOutOf} қосымша жаттығусыз бұл жауаптың DELF ${level} өту деңгейіне жетпей қалуы мүмкін екенін көрсетеді.`,
  }),
};

const GREETING_SCAFFOLD: TranslatedText = {
  en: "Bonjour,",
  ru: "Bonjour,",
  kz: "Bonjour,",
};
const CLOSING_SCAFFOLD: TranslatedText = {
  en: "Cordialement,",
  ru: "Cordialement,",
  kz: "Cordialement,",
};
const EXPAND_PLACEHOLDER = {
  build: (missingLabels: string[], language: FeedbackLanguage): string => {
    const lead: TranslatedText = {
      en: "[Add here, in your own words:",
      ru: "[Добавьте здесь своими словами:",
      kz: "[Мұнда өз сөзіңізбен қосыңыз:",
    };
    return `${lead[language]} ${missingLabels.join(", ")}]`;
  },
};

/** The scaffold — greetings, closings, and bracketed placeholders — is
 * always formulaic register filler or an explicit instruction to the
 * student, never a fabricated personal fact. Grammar fixes come straight
 * from the same corrections shown in languageAccuracy.errors. */
function buildImprovedVersion(selection: EvaluationSelection, language: FeedbackLanguage): string {
  let body = selection.originalText.trim();
  // Fragments first: markMissingVerb() only inserts a marker, it doesn't
  // remove any text, so grammar-rule substrings (e.g. "and", "avons
  // travail") are still present afterward for the next loop to find. Doing
  // this in the other order would let a grammar fix silently consume the
  // literal substring a fragment correction was matching against.
  for (const fragment of selection.fragments) {
    if (body.includes(fragment.original)) {
      body = body.replace(fragment.original, fragment.correction);
    }
  }
  for (const mistake of selection.matchedMistakes) {
    if (body.includes(mistake.original)) {
      body = body.replace(mistake.original, mistake.correction);
    }
  }

  const parts: string[] = [];
  if (!selection.hasIntroduction) parts.push(GREETING_SCAFFOLD[language]);
  parts.push(body);

  const contentGapKeys = selection.missingElementKeys.filter(
    (k) => k === "onTopicContent" || k === "moreContent" || k === "mainIdeas"
  );
  if (contentGapKeys.length > 0) {
    const labels = contentGapKeys.map((k) => MISSING_ELEMENT_LABELS[k][language]);
    parts.push(EXPAND_PLACEHOLDER.build(labels, language));
  }

  if (!selection.hasConclusion) parts.push(CLOSING_SCAFFOLD[language]);

  return parts.join("\n\n");
}

/** Pure and deterministic — turns a language-neutral selection into
 * display text in the requested language. No randomness, safe to call
 * on the client for instant re-translation. */
export function localizeEvaluation(
  selection: EvaluationSelection,
  language: FeedbackLanguage
): Omit<WritingEvaluation, "level" | "wordCount"> {
  const config = DELF_WRITING_LEVELS[selection.level];

  const taskCompletion: TaskCompletionFeedback = {
    addressedPrompt: selection.addressedPrompt,
    respectedFormat: selection.respectedFormat,
    notes: !selection.addressedPrompt
      ? selection.wordCount < Math.max(10, config.minWords * 0.4)
        ? TASK_NOTES.short(selection.level, selection.wordCount)[language]
        : TASK_NOTES.offTopic(selection.level)[language]
      : selection.respectedFormat
        ? TASK_NOTES.inRange(selection.level, config.minWords, config.maxWords)[language]
        : TASK_NOTES.outOfRange(
            selection.level,
            selection.wordCount,
            config.minWords,
            config.maxWords
          )[language],
    missingElements: selection.missingElementKeys.map((k) => MISSING_ELEMENT_LABELS[k][language]),
  };

  const relevance: RelevanceFeedback = {
    isRelevant: selection.isRelevant,
    notes: (selection.isRelevant ? RELEVANCE_NOTES.relevant : RELEVANCE_NOTES.notRelevant)(selection.level)[language],
  };

  const structure: StructureFeedback = {
    hasIntroduction: selection.hasIntroduction,
    hasMainIdeas: selection.hasMainIdeas,
    hasConclusion: selection.hasConclusion,
    conclusionRequired: selection.conclusionRequired,
    paragraphOrganization: (selection.hasMainIdeas
      ? PARAGRAPH_ORGANIZATION.withMainIdeas
      : PARAGRAPH_ORGANIZATION.without)[language],
  };

  const coherence: CoherenceFeedback = {
    isCoherent: selection.isCoherent,
    notes: (selection.isCoherent ? COHERENCE_NOTES.coherent : COHERENCE_NOTES.notCoherent)[language],
  };

  const ruleErrors: GrammarError[] = selection.matchedMistakes.map((m) => {
    const rule = getGrammarRule(m.ruleId)!;
    return {
      original: m.original,
      correction: m.correction,
      category: rule.category,
      explanation: rule.explanation[language],
    };
  });
  const fragmentErrors: GrammarError[] = selection.fragments.map((f) => ({
    original: f.original,
    correction: f.correction,
    category: "sentence-structure",
    explanation: FRAGMENT_EXPLANATION[language],
  }));
  const errors = [...ruleErrors, ...fragmentErrors];

  const languageAccuracy: LanguageAccuracyFeedback = {
    errors,
    summary:
      errors.length > 0
        ? LANGUAGE_SUMMARY.withErrors(errors.length)[language]
        : LANGUAGE_SUMMARY.noErrors[language],
  };

  const vocabulary = buildVocabularyFeedback(
    selection.vocabularyDiversity,
    selection.hasAdvancedConnectors,
    selection.level,
    selection.wordCount,
    language
  );

  const ratio = selection.estimatedScore / selection.scoreOutOf;
  const tier = ratio >= 0.75 ? "strong" : ratio >= 0.5 ? "borderline" : "weak";

  const examReadiness: ExamReadinessFeedback = {
    estimatedScore: selection.estimatedScore,
    scoreOutOf: selection.scoreOutOf,
    ...buildExamReadiness(selection, language),
    scoreExplanation: SCORE_EXPLANATION[tier](
      selection.level,
      selection.estimatedScore,
      selection.scoreOutOf
    )[language],
  };

  const improvedVersion = buildImprovedVersion(selection, language);

  return { taskCompletion, relevance, structure, coherence, languageAccuracy, vocabulary, examReadiness, improvedVersion };
}
