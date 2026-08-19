import type {
  AccuracyFeedback,
  CoherenceFeedback,
  FeedbackLanguage,
  GrammarError,
  GrammarFeedback,
  OrganizationFeedback,
  RegisterFeedback,
  TaskCompletionFeedback,
  TopikWritingEvaluation,
  TopikWritingTaskType,
  VocabularyFeedback,
} from "@/types/topik-writing";
import { aggregateTopikWritingScore } from "@/lib/topik/writing-scoring";

/**
 * Offline fallback TOPIK II Writing evaluator, used by
 * /api/topik/writing/evaluate when no ANTHROPIC_API_KEY is configured (see
 * lib/ai/topik-writing-evaluator.ts for the real Claude path). Every field
 * is computed from the student's actual submitted Korean text against the
 * actual prompt/data — nothing is picked at random from a canned pool, and
 * no mistake is shown that isn't genuinely present in the text. Entirely
 * independent from DELF's mock (lib/mock/writing-evaluation.ts) — different
 * language, different rubric, different heuristics.
 *
 * Korean grammar has no lightweight, safe-to-trust rule-based parser the
 * way lib/evaluation/grammar-rules.ts covers French conjugation, so this
 * mock deliberately limits itself to ONE genuine, deterministic grammar/
 * register signal it can verify with certainty: mixing the conversational
 * 해요체 register into a response that otherwise (and TOPIK Writing always)
 * requires the formal 격식체 register — a real, well-documented TOPIK
 * writing error, matched only on exact, unambiguous suffixes.
 *
 * Split into two phases so the feedback LANGUAGE can be switched instantly
 * on the client without re-running analysis:
 *  - analyzeResponse(): computes every real signal from the essay text.
 *    Language-independent, fully deterministic (no randomness).
 *  - localizeEvaluation(): pure — turns a selection into display text in
 *    the requested language. Safe to call on the client for instant
 *    re-translation, no network round trip needed.
 *
 * The exam prompt/data and the student's own response always stay in
 * Korean — only this AI-generated feedback text is translated.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

const CONNECTOR_PATTERN = /(그리고|그러나|하지만|그래서|왜냐하면|또한|그런데|반면에|따라서|그러므로|게다가)/;
const CONCLUSION_MARKER_PATTERN = /(따라서|그러므로|결론적으로|요약하면|정리하면|이처럼)/;
const TREND_MARKER_PATTERN = /(증가|감소|변화|비해|반면|각각|차지|줄었|늘었|나타났|많아졌|줄어들었|높아졌|낮아졌)/;
const FORMAL_ENDING_PATTERN = /(습니다|ㅂ니다|입니다)[.!?]/g;
const KOREAN_CHAR_PATTERN = /[가-힣]/;

/** Only exact, unambiguous conversational (해요체) endings — ordered so a
 * longer, more specific suffix is tried before a shorter one it contains,
 * and matches never overlap once claimed. Each correction is a genuine,
 * safe formal (격식체) equivalent — never a guess. */
const INFORMAL_ENDING_RULES: { pattern: string; correction: string }[] = [
  { pattern: "했어요", correction: "했습니다" },
  { pattern: "할 거예요", correction: "할 것입니다" },
  { pattern: "일 거예요", correction: "일 것입니다" },
  { pattern: "이에요", correction: "입니다" },
  { pattern: "예요", correction: "입니다" },
  { pattern: "있어요", correction: "있습니다" },
  { pattern: "없어요", correction: "없습니다" },
  { pattern: "해요", correction: "합니다" },
  { pattern: "돼요", correction: "됩니다" },
];

interface InformalMatch {
  index: number;
  length: number;
  original: string;
  correction: string;
}

/** Finds real, exact occurrences of conversational endings in the text —
 * never overlapping, never invented. Capped by the caller. */
function findInformalEndings(text: string): InformalMatch[] {
  const matches: InformalMatch[] = [];
  const consumed: [number, number][] = [];
  for (const rule of INFORMAL_ENDING_RULES) {
    let searchFrom = 0;
    for (;;) {
      const idx = text.indexOf(rule.pattern, searchFrom);
      if (idx === -1) break;
      const end = idx + rule.pattern.length;
      const overlaps = consumed.some(([s, e]) => idx < e && end > s);
      if (!overlaps) {
        matches.push({ index: idx, length: rule.pattern.length, original: rule.pattern, correction: rule.correction });
        consumed.push([idx, end]);
      }
      searchFrom = idx + rule.pattern.length;
    }
  }
  return matches.sort((a, b) => a.index - b.index);
}

/** Splits Korean text into content tokens (어절-ish units) for real overlap
 * / diversity measurement — not a morphological analyzer, just whitespace
 * segments long enough to carry meaning. */
function contentTokens(text: string): string[] {
  return text
    .replace(/[.,!?;:"'()「」『』·※\n]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

/** Real, deterministic diversity signal: unique tokens ÷ total tokens.
 * Returns 1 (no penalty) when there isn't enough text for it to mean
 * anything. */
function lexicalDiversity(text: string): number {
  const tokens = contentTokens(text);
  if (tokens.length < 4) return 1;
  return new Set(tokens).size / tokens.length;
}

/** Real, structured numeric figures actually present in the given data
 * text (e.g. "72%", "2020년") — used to verify the response genuinely
 * reports what was given, never what it merely could have said. */
function extractFigures(dataText: string): string[] {
  const matches = dataText.match(/\d+(?:[.,]\d+)?%?/g) ?? [];
  return Array.from(new Set(matches));
}

export type MissingElementKey =
  | "onTopicContent"
  | "moreContent"
  | "dataFigures"
  | "trendLanguage"
  | "conclusion";

export interface EvaluationSelection {
  taskType: TopikWritingTaskType;
  charCount: number;
  minChars: number;
  maxChars: number;
  addressedTask: boolean;
  respectedFormat: boolean;
  isMeaningless: boolean;
  isCoherent: boolean;
  isWellOrganized: boolean;
  matchesExpectedStructure: boolean;
  isAppropriateRegister: boolean;
  isAccurate: boolean;
  missingDataFigures: string[];
  missingElementKeys: MissingElementKey[];
  informalMatches: InformalMatch[];
  vocabularyDiversity: number;
  taskPoints: number;
  taskMaxPoints: number;
  estimatedScore: number;
  scoreOutOf: number;
  originalText: string;
}

export function analyzeResponse(params: {
  taskType: TopikWritingTaskType;
  prompt: string;
  dataText: string | null;
  response: string;
  minChars: number;
  maxChars: number;
}): EvaluationSelection {
  const { taskType, prompt, dataText, minChars, maxChars } = params;
  const response = params.response;
  const trimmed = response.trim();
  const charCount = trimmed.length;

  const hasKorean = KOREAN_CHAR_PATTERN.test(trimmed);
  const sentenceCount = (trimmed.match(/[.!?]+/g) ?? []).length || (trimmed ? 1 : 0);

  const promptTokens = new Set(contentTokens(`${prompt} ${dataText ?? ""}`));
  const responseTokens = contentTokens(trimmed);
  const responseTokenSet = new Set(responseTokens);
  const overlap = Array.from(promptTokens).some((tok) => responseTokenSet.has(tok));
  const isRelevant = promptTokens.size === 0 || overlap;
  const addressedTask = charCount >= Math.max(10, minChars * 0.3) && isRelevant && hasKorean;
  // Genuinely meaningless input (no Korean characters at all despite real
  // length) gets a much harsher score floor than a real but off-topic
  // response.
  const isMeaningless = charCount >= 5 && !hasKorean;

  const inRange = charCount >= minChars * 0.7 && charCount <= maxChars * 1.35;

  const informalMatches = findInformalEndings(trimmed).slice(0, 6);
  const formalCount = (trimmed.match(FORMAL_ENDING_PATTERN) ?? []).length;
  const isAppropriateRegister = charCount < 10 || (formalCount > 0 && formalCount >= informalMatches.length);

  const isCoherent = sentenceCount <= 1 || CONNECTOR_PATTERN.test(trimmed);

  let isWellOrganized: boolean;
  let matchesExpectedStructure: boolean;
  if (taskType === "essay") {
    isWellOrganized = sentenceCount >= 5;
    matchesExpectedStructure = CONCLUSION_MARKER_PATTERN.test(trimmed);
  } else if (taskType === "data-description") {
    isWellOrganized = sentenceCount >= 2;
    matchesExpectedStructure = TREND_MARKER_PATTERN.test(trimmed);
  } else {
    isWellOrganized = sentenceCount >= 1 && addressedTask;
    matchesExpectedStructure = addressedTask;
  }

  let isAccurate = addressedTask && !isMeaningless;
  const missingDataFigures: string[] = [];
  if (taskType === "data-description" && dataText) {
    const figures = extractFigures(dataText);
    if (figures.length > 0) {
      const found = figures.filter((f) => trimmed.includes(f));
      missingDataFigures.push(...figures.filter((f) => !trimmed.includes(f)));
      isAccurate = addressedTask && found.length / figures.length >= 0.5;
    }
  }

  const missingElementKeys: MissingElementKey[] = [];
  if (!addressedTask) missingElementKeys.push("onTopicContent");
  else if (charCount < minChars) missingElementKeys.push("moreContent");
  if (taskType === "data-description" && missingDataFigures.length > 0) missingElementKeys.push("dataFigures");
  if (taskType === "data-description" && !matchesExpectedStructure) missingElementKeys.push("trendLanguage");
  if (taskType === "essay" && !matchesExpectedStructure) missingElementKeys.push("conclusion");

  const vocabularyDiversity = lexicalDiversity(trimmed);

  let ratio = 1;
  if (!inRange) ratio -= 0.15;
  if (!isAppropriateRegister) ratio -= 0.2;
  if (!isCoherent && sentenceCount > 1) ratio -= 0.15;
  if (!isWellOrganized || !matchesExpectedStructure) ratio -= 0.15;
  if (!isAccurate) ratio -= 0.2;
  if (vocabularyDiversity < 0.5 && charCount >= 40) ratio -= 0.1;
  if (informalMatches.length > 0) ratio -= Math.min(0.15, informalMatches.length * 0.03);
  ratio = Math.max(0, Math.min(1, ratio));
  if (!addressedTask) ratio = Math.min(ratio, isMeaningless ? 0.05 : 0.25);

  const score = aggregateTopikWritingScore(taskType, ratio);

  return {
    taskType,
    charCount,
    minChars,
    maxChars,
    addressedTask,
    respectedFormat: inRange,
    isMeaningless,
    isCoherent,
    isWellOrganized,
    matchesExpectedStructure,
    isAppropriateRegister,
    isAccurate,
    missingDataFigures,
    missingElementKeys,
    informalMatches,
    vocabularyDiversity,
    taskPoints: score.taskPoints,
    taskMaxPoints: score.taskMaxPoints,
    estimatedScore: score.estimatedScore,
    scoreOutOf: score.scoreOutOf,
    originalText: trimmed,
  };
}

const TASK_TYPE_NAME: Record<TopikWritingTaskType, TranslatedText> = {
  "short-answer": { en: "short-answer task", ru: "задание с коротким ответом", kz: "қысқа жауап тапсырмасы" },
  "data-description": { en: "data-description task", ru: "задание на описание данных", kz: "деректерді сипаттау тапсырмасы" },
  essay: { en: "essay", ru: "эссе", kz: "эссе" },
};

const TASK_NOTES = {
  offTopic: (taskType: TopikWritingTaskType): TranslatedText => ({
    en: `The response doesn't share any real content with the actual ${TASK_TYPE_NAME[taskType].en} given — make sure to respond to what was actually asked.`,
    ru: `Ответ никак не связан по содержанию с заданным ${TASK_TYPE_NAME[taskType].ru} — убедитесь, что вы отвечаете именно на поставленную задачу.`,
    kz: `Жауап берілген ${TASK_TYPE_NAME[taskType].kz} мазмұнымен байланысты емес — нақты сұралғанға жауап беруге көз жеткізіңіз.`,
  }),
  inRange: (min: number, max: number): TranslatedText => ({
    en: `The response engages with the task and stays close to the expected ${min}-${max} character range.`,
    ru: `Ответ раскрывает задание и укладывается в ожидаемый диапазон ${min}-${max} символов.`,
    kz: `Жауап тапсырманы ашады және күтілетін ${min}-${max} таңба аралығына сай келеді.`,
  }),
  outOfRange: (charCount: number, min: number, max: number): TranslatedText => ({
    en: `The response engages with the task, but at ${charCount} characters it falls outside the expected ${min}-${max} character range — aim to match the target length more closely.`,
    ru: `Ответ раскрывает задание, но при объёме в ${charCount} символов выходит за пределы ожидаемого диапазона ${min}-${max} символов — постарайтесь точнее соблюдать нужный объём.`,
    kz: `Жауап тапсырманы ашады, бірақ ${charCount} таңба күтілетін ${min}-${max} таңба аралығынан тыс — көлемді мақсатты аралыққа жақындатуға тырысыңыз.`,
  }),
};

const MISSING_ELEMENT_LABELS: Record<MissingElementKey, TranslatedText> = {
  onTopicContent: {
    en: "content that actually addresses what the task asked",
    ru: "содержание, действительно отвечающее на поставленную задачу",
    kz: "тапсырмада сұралғанға шынымен жауап беретін мазмұн",
  },
  moreContent: {
    en: "more developed content to reach the target character count",
    ru: "более развёрнутое содержание для достижения нужного количества символов",
    kz: "мақсатты таңба санына жету үшін толығырақ мазмұн",
  },
  dataFigures: {
    en: "the actual figures shown in the given data",
    ru: "фактические показатели, указанные в данных",
    kz: "берілген деректердегі нақты көрсеткіштер",
  },
  trendLanguage: {
    en: "language describing the trend or comparison in the data (e.g. 증가, 감소, 비해)",
    ru: "формулировки, описывающие тенденцию или сравнение в данных (например, 증가, 감소, 비해)",
    kz: "деректердегі үрдісті немесе салыстыруды сипаттайтын тіркестер (мысалы, 증가, 감소, 비해)",
  },
  conclusion: {
    en: "a closing sentence summarizing your opinion",
    ru: "заключительное предложение с кратким изложением вашего мнения",
    kz: "пікіріңізді қорытындылайтын қорытынды сөйлем",
  },
};

const ORGANIZATION_NOTES: Record<TopikWritingTaskType, { good: TranslatedText; weak: TranslatedText }> = {
  "short-answer": {
    good: {
      en: "The response fits naturally into the given context.",
      ru: "Ответ естественно вписывается в заданный контекст.",
      kz: "Жауап берілген контекске табиғи түрде сай келеді.",
    },
    weak: {
      en: "The response doesn't yet fit naturally into the given context — re-read the surrounding text before writing.",
      ru: "Ответ пока не вписывается естественно в заданный контекст — перечитайте окружающий текст перед тем, как писать.",
      kz: "Жауап әлі берілген контекске табиғи түрде сай келмейді — жазбас бұрын қоршаған мәтінді қайта оқыңыз.",
    },
  },
  "data-description": {
    good: {
      en: "The description follows a clear, logical order and uses real trend/comparison language.",
      ru: "Описание построено логично и использует реальные формулировки тенденции/сравнения.",
      kz: "Сипаттама логикалық түрде құрылған және нақты үрдіс/салыстыру тіркестерін қолданады.",
    },
    weak: {
      en: "The description would benefit from clearer trend or comparison language (e.g. 증가, 감소, ~에 비해).",
      ru: "Описанию не хватает более чётких формулировок тенденции или сравнения (например, 증가, 감소, ~에 비해).",
      kz: "Сипаттамада үрдіс немесе салыстыру тіркестері жетіспейді (мысалы, 증가, 감소, ~에 비해).",
    },
  },
  essay: {
    good: {
      en: "The essay is developed across multiple ideas and closes with a clear concluding statement.",
      ru: "Эссе развёрнуто по нескольким идеям и завершается чёткой заключительной мыслью.",
      kz: "Эссе бірнеше ой бойынша дамытылған және анық қорытынды пікірмен аяқталады.",
    },
    weak: {
      en: "The essay would benefit from a clearer conclusion summarizing your position (e.g. using 따라서, 결론적으로).",
      ru: "Эссе не хватает более чёткого заключения с итоговой позицией (например, с 따라서, 결론적으로).",
      kz: "Эссеге ұстанымыңызды қорытындылайтын анығырақ қорытынды жетіспейді (мысалы, 따라서, 결론적으로).",
    },
  },
};

const COHERENCE_NOTES = {
  coherent: {
    en: "Ideas connect logically from one sentence to the next.",
    ru: "Идеи логично связаны от одного предложения к другому.",
    kz: "Ойлар бір сөйлемнен екіншісіне логикалық түрде байланысады.",
  } as TranslatedText,
  notCoherent: {
    en: "Sentences sit side by side without connectors (그리고, 하지만, 그래서, 따라서...) linking the ideas together.",
    ru: "Предложения стоят рядом без связующих слов (그리고, 하지만, 그래서, 따라서...), объединяющих идеи.",
    kz: "Сөйлемдер ойларды байланыстыратын жалғаулықтарсыз (그리고, 하지만, 그래서, 따라서...) қатар тұр.",
  } as TranslatedText,
};

const REGISTER_NOTES = {
  appropriate: {
    en: "The formal 격식체 register (-습니다/-ㅂ니다) is used consistently, as required for TOPIK Writing.",
    ru: "Формальный регистр 격식체 (-습니다/-ㅂ니다) используется последовательно, как того требует письменная часть TOPIK.",
    kz: "TOPIK жазбаша бөлімі талап ететіндей, ресми 격식체 регистрі (-습니다/-ㅂ니다) дәйекті түрде қолданылған.",
  } as TranslatedText,
  notAppropriate: {
    en: "Conversational 해요체 endings appear where the formal 격식체 register (-습니다/-ㅂ니다) is required throughout TOPIK Writing.",
    ru: "Встречаются разговорные окончания 해요체, хотя письменная часть TOPIK требует формального регистра 격식체 (-습니다/-ㅂ니다) на всём протяжении текста.",
    kz: "TOPIK жазбаша бөлімі бүкіл мәтінде ресми 격식체 регистрін (-습니다/-ㅂ니다) талап еткенде, ауызекі 해요체 жалғаулары кездеседі.",
  } as TranslatedText,
};

const ACCURACY_NOTES = {
  accurate: {
    en: "The response accurately reflects the actual content it was given to work with.",
    ru: "Ответ точно отражает фактическое содержание, предоставленное для задания.",
    kz: "Жауап тапсырма үшін берілген нақты мазмұнды дәл көрсетеді.",
  } as TranslatedText,
  notAccurateData: {
    en: "Several key figures from the given data aren't reflected in the response — every number reported should match the actual data.",
    ru: "Несколько ключевых показателей из данных не отражены в ответе — все указанные числа должны соответствовать фактическим данным.",
    kz: "Берілген деректердегі бірнеше негізгі көрсеткіш жауапта көрсетілмеген — көрсетілген барлық сан нақты деректерге сай болуы керек.",
  } as TranslatedText,
  notAccurateGeneric: {
    en: "The response doesn't accurately engage with what was actually given in the task.",
    ru: "Ответ неточно раскрывает то, что было фактически задано.",
    kz: "Жауап тапсырмада нақты берілгенді дәл ашпайды.",
  } as TranslatedText,
};

function buildVocabularyFeedback(
  diversity: number,
  charCount: number,
  language: FeedbackLanguage
): VocabularyFeedback {
  const uniqueRatioPercent = Math.round(diversity * 100);
  const wordChoice: TranslatedText =
    charCount < 20
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
  const levelAppropriateness: TranslatedText = {
    en: "Vocabulary register matches formal written Korean expected for TOPIK Writing.",
    ru: "Регистр лексики соответствует формальному письменному корейскому, ожидаемому в письменной части TOPIK.",
    kz: "Лексика регистрі TOPIK жазбаша бөлімінде күтілетін ресми жазбаша корей тіліне сай келеді.",
  };
  return {
    wordChoice: wordChoice[language],
    variety: variety[language],
    levelAppropriateness: levelAppropriateness[language],
  };
}

const FORMALITY_EXPLANATION: TranslatedText = {
  en: "This is a conversational (해요체) ending. TOPIK Writing requires the formal (격식체) register throughout the response.",
  ru: "Это разговорное окончание (해요체). Письменная часть TOPIK требует формального регистра (격식체) на всём протяжении ответа.",
  kz: "Бұл ауызекі (해요체) жалғау. TOPIK жазбаша бөлімі жауаптың бүкіл бойында ресми (격식체) регистрді талап етеді.",
};

const GRAMMAR_SUMMARY = {
  withErrors: (count: number): TranslatedText => ({
    en: `Found ${count} conversational-register ending${count === 1 ? "" : "s"} that should be formal — see the corrections below.`,
    ru: `Найдено ${count} разговорн${count === 1 ? "ое окончание" : "ых окончания"}, которые должны быть в формальном регистре — см. исправления ниже.`,
    kz: `${count} ауызекі регистрдегі жалғау табылды, олар ресми болуы керек — түзетулерді төменнен қараңыз.`,
  }),
  noErrors: {
    en: "No register mistakes detected in this response.",
    ru: "В этом ответе не обнаружено ошибок регистра.",
    kz: "Бұл жауаптан регистр қателері табылмады.",
  } as TranslatedText,
};

const STRENGTH_ADDRESSED_TASK: TranslatedText = {
  en: "Directly addressed the actual task given",
  ru: "Прямо раскрыл(а) заданную задачу",
  kz: "Берілген тапсырманы тікелей ашты",
};
const STRENGTH_IN_RANGE: TranslatedText = {
  en: "Response length matched the target character range",
  ru: "Объём ответа соответствовал целевому диапазону символов",
  kz: "Жауап көлемі мақсатты таңба аралығына сай келді",
};
const STRENGTH_REGISTER: TranslatedText = {
  en: "Used the formal 격식체 register consistently",
  ru: "Последовательно использован формальный регистр 격식체",
  kz: "Ресми 격식체 регистрі дәйекті түрде қолданылды",
};
const STRENGTH_ORGANIZATION: TranslatedText = {
  en: "Well organized and followed the expected structure for this task",
  ru: "Хорошо структурирован и соответствовал ожидаемой форме этого задания",
  kz: "Жақсы құрылымдалған және осы тапсырманың күтілетін пішініне сай келді",
};
const STRENGTH_ACCURATE: TranslatedText = {
  en: "Accurately reflected the actual content of the task",
  ru: "Точно отразил(а) фактическое содержание задания",
  kz: "Тапсырманың нақты мазмұнын дәл көрсетті",
};
const STRENGTH_COHERENT: TranslatedText = {
  en: "Ideas were connected logically with appropriate connectors",
  ru: "Идеи были логично связаны подходящими союзами",
  kz: "Ойлар сәйкес жалғаулықтармен логикалық түрде байланыстырылды",
};
const STRENGTH_VOCAB: TranslatedText = {
  en: "Used a wide range of vocabulary without much repetition",
  ru: "Использован широкий словарный запас без сильных повторов",
  kz: "Қайталаусыз кең сөздік қор қолданылды",
};

const WEAKNESS_OFF_TOPIC: TranslatedText = {
  en: "Didn't share real content with the actual task given",
  ru: "Не был содержательно связан с заданной задачей",
  kz: "Берілген тапсырмамен мазмұндық байланысы болмады",
};
function buildLengthWeakness(charCount: number, min: number, max: number, language: FeedbackLanguage): string {
  return {
    en: `Length (${charCount} characters) fell outside the ${min}-${max} character target`,
    ru: `Объём (${charCount} симв.) вышел за пределы целевого диапазона ${min}-${max} символов`,
    kz: `Көлемі (${charCount} таңба) ${min}-${max} таңба мақсатты аралығынан тыс болды`,
  }[language];
}
function buildRegisterWeakness(count: number, language: FeedbackLanguage): string {
  return {
    en: `${count} conversational-register ending${count === 1 ? "" : "s"} found where formal register was required`,
    ru: `Найдено ${count} разговорн${count === 1 ? "ое окончание" : "ых окончания"} там, где требовался формальный регистр`,
    kz: `Ресми регистр талап етілген жерде ${count} ауызекі жалғау табылды`,
  }[language];
}
const WEAKNESS_NOT_COHERENT: TranslatedText = {
  en: "Sentences aren't linked with connectors, making the flow of ideas hard to follow",
  ru: "Предложения не связаны союзами, из-за чего трудно уследить за ходом мысли",
  kz: "Сөйлемдер жалғаулықтармен байланыспаған, сондықтан ой ағымын түсіну қиын",
};
const WEAKNESS_ORGANIZATION: TranslatedText = {
  en: "Doesn't yet follow the structure expected for this task type",
  ru: "Пока не соответствует структуре, ожидаемой для этого типа задания",
  kz: "Бұл тапсырма түріне күтілетін құрылымға әлі сай емес",
};
const WEAKNESS_ACCURACY_DATA: TranslatedText = {
  en: "Missing several of the actual figures from the given data",
  ru: "Пропущено несколько фактических показателей из данных",
  kz: "Берілген деректердегі бірнеше нақты көрсеткіш жетіспейді",
};
const WEAKNESS_LOW_VOCAB: TranslatedText = {
  en: "Vocabulary repeated frequently instead of varying word choice",
  ru: "Словарный запас часто повторялся вместо разнообразия выбора слов",
  kz: "Сөз таңдауын әртараптандырудың орнына сөздік қор жиі қайталанды",
};

const TIP_RE_READ_TASK: TranslatedText = {
  en: "Re-read the actual task before writing to make sure every sentence relates to it",
  ru: "Перечитайте задание перед тем, как писать, чтобы каждое предложение было с ним связано",
  kz: "Жазбас бұрын тапсырманы қайта оқыңыз, әр сөйлем соған қатысты болсын",
};
const TIP_MATCH_LENGTH: TranslatedText = {
  en: "Plan roughly how many sentences you need before writing to reach the target length naturally",
  ru: "Заранее прикиньте, сколько предложений понадобится, чтобы естественно достичь нужного объёма",
  kz: "Мақсатты көлемге табиғи түрде жету үшін қанша сөйлем керектігін алдын ала жоспарлаңыз",
};
const TIP_USE_FORMAL: TranslatedText = {
  en: "Review the -습니다/-ㅂ니다 endings and use them consistently instead of -아요/-어요/-예요",
  ru: "Повторите окончания -습니다/-ㅂ니다 и используйте их последовательно вместо -아요/-어요/-예요",
  kz: "-습니다/-ㅂ니다 жалғауларын қайталап, -아요/-어요/-예요 орнына оларды дәйекті қолданыңыз",
};
const TIP_USE_CONNECTORS: TranslatedText = {
  en: "Link your sentences with connectors like 그리고, 하지만, 그래서, or 따라서 instead of writing them side by side",
  ru: "Связывайте предложения союзами вроде 그리고, 하지만, 그래서 или 따라서, а не пишите их отдельно друг от друга",
  kz: "Сөйлемдерді бір-бірінен бөлек жазудың орнына 그리고, 하지만, 그래서 немесе 따라서 сияқты жалғаулықтармен байланыстырыңыз",
};
const TIP_ADD_DATA_FIGURES: TranslatedText = {
  en: "Double-check every number you write against the actual data given, and mention the key figures explicitly",
  ru: "Сверяйте каждое написанное число с фактическими данными и явно указывайте ключевые показатели",
  kz: "Жазған әр санды нақты берілген деректермен тексеріп, негізгі көрсеткіштерді нақты көрсетіңіз",
};
const TIP_VARY_VOCAB: TranslatedText = {
  en: "Note 2-3 synonyms for words you use often and work them into your next response",
  ru: "Запишите 2-3 синонима для часто используемых слов и используйте их в следующем ответе",
  kz: "Жиі қолданатын сөздерге 2-3 синоним жазып, келесі жауапта қолданыңыз",
};

function buildExamReadiness(selection: EvaluationSelection, language: FeedbackLanguage) {
  const strengths: string[] = [];
  if (selection.addressedTask) {
    strengths.push(STRENGTH_ADDRESSED_TASK[language]);
    if (selection.respectedFormat) strengths.push(STRENGTH_IN_RANGE[language]);
    if (selection.isAppropriateRegister) strengths.push(STRENGTH_REGISTER[language]);
    if (selection.isWellOrganized && selection.matchesExpectedStructure) strengths.push(STRENGTH_ORGANIZATION[language]);
    if (selection.isAccurate) strengths.push(STRENGTH_ACCURATE[language]);
    if (selection.isCoherent && selection.charCount >= 30) strengths.push(STRENGTH_COHERENT[language]);
    if (selection.vocabularyDiversity >= 0.7 && selection.charCount >= 30) strengths.push(STRENGTH_VOCAB[language]);
  }

  const weaknesses: string[] = [];
  if (!selection.addressedTask) weaknesses.push(WEAKNESS_OFF_TOPIC[language]);
  if (!selection.respectedFormat) {
    weaknesses.push(buildLengthWeakness(selection.charCount, selection.minChars, selection.maxChars, language));
  }
  if (!selection.isAppropriateRegister) weaknesses.push(buildRegisterWeakness(selection.informalMatches.length || 1, language));
  if (!selection.isCoherent && selection.charCount >= 30) weaknesses.push(WEAKNESS_NOT_COHERENT[language]);
  if (!selection.isWellOrganized || !selection.matchesExpectedStructure) weaknesses.push(WEAKNESS_ORGANIZATION[language]);
  if (!selection.isAccurate && selection.taskType === "data-description") weaknesses.push(WEAKNESS_ACCURACY_DATA[language]);
  if (selection.vocabularyDiversity < 0.5 && selection.charCount >= 40) weaknesses.push(WEAKNESS_LOW_VOCAB[language]);

  const improvementTips: string[] = [];
  if (!selection.addressedTask) improvementTips.push(TIP_RE_READ_TASK[language]);
  if (!selection.respectedFormat) improvementTips.push(TIP_MATCH_LENGTH[language]);
  if (!selection.isAppropriateRegister) improvementTips.push(TIP_USE_FORMAL[language]);
  if (!selection.isCoherent && selection.charCount >= 30) improvementTips.push(TIP_USE_CONNECTORS[language]);
  if (!selection.isAccurate && selection.taskType === "data-description") improvementTips.push(TIP_ADD_DATA_FIGURES[language]);
  if (selection.vocabularyDiversity < 0.5 && selection.charCount >= 40) improvementTips.push(TIP_VARY_VOCAB[language]);

  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    improvementTips: improvementTips.slice(0, 4),
  };
}

const SCORE_EXPLANATION = {
  strong: (taskPoints: number, taskMaxPoints: number): TranslatedText => ({
    en: `A strong result — ${taskPoints}/${taskMaxPoints} on this task indicates this response would likely meet the TOPIK II Writing standard comfortably.`,
    ru: `Хороший результат — ${taskPoints}/${taskMaxPoints} за это задание говорит о том, что ответ, скорее всего, уверенно соответствует стандарту письменной части TOPIK II.`,
    kz: `Жақсы нәтиже — осы тапсырма үшін ${taskPoints}/${taskMaxPoints} бұл жауаптың TOPIK II жазбаша бөлімінің стандартына сенімді сай келетінін көрсетеді.`,
  }),
  borderline: (taskPoints: number, taskMaxPoints: number): TranslatedText => ({
    en: `A borderline result — ${taskPoints}/${taskMaxPoints} on this task suggests this response is close to the TOPIK II Writing standard but needs refinement to be reliable on exam day.`,
    ru: `Пограничный результат — ${taskPoints}/${taskMaxPoints} за это задание означает, что ответ близок к стандарту письменной части TOPIK II, но нуждается в доработке для уверенной сдачи экзамена.`,
    kz: `Шекаралық нәтиже — осы тапсырма үшін ${taskPoints}/${taskMaxPoints} бұл жауаптың TOPIK II жазбаша стандартына жақын екенін, бірақ емтихан күні сенімді болу үшін жетілдіруді қажет ететінін білдіреді.`,
  }),
  weak: (taskPoints: number, taskMaxPoints: number): TranslatedText => ({
    en: `Below the target — ${taskPoints}/${taskMaxPoints} on this task indicates this response would likely fall short of the TOPIK II Writing standard without further practice.`,
    ru: `Ниже целевого уровня — ${taskPoints}/${taskMaxPoints} за это задание означает, что без дополнительной практики этот ответ, скорее всего, не дотянет до стандарта письменной части TOPIK II.`,
    kz: `Мақсатты деңгейден төмен — осы тапсырма үшін ${taskPoints}/${taskMaxPoints} қосымша жаттығусыз бұл жауаптың TOPIK II жазбаша стандартына жетпей қалуы мүмкін екенін көрсетеді.`,
  }),
};

/** Deterministic string hash (djb2) — seeds which natural phrasing variant
 * is picked for a given response, without any true randomness. */
function hashText(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function pickVariant<T>(variants: T[], seed: string): T {
  return variants[hashText(seed) % variants.length];
}

const EXPAND_LEAD_VARIANTS: Record<FeedbackLanguage, string[]> = {
  en: ["[Add here, in your own words:", "[Develop this further — write about:", "[Continue with your own ideas about:"],
  ru: ["[Добавьте здесь своими словами:", "[Разверните эту мысль — напишите о:", "[Продолжите своими словами о:"],
  kz: ["[Мұнда өз сөзіңізбен қосыңыз:", "[Мұны әрі қарай дамытыңыз — жазыңыз:", "[Өз ойларыңызбен жалғастырыңыз:"],
};

const CONCLUSION_PLACEHOLDER: Record<FeedbackLanguage, string> = {
  en: "[Add a concluding sentence here summarizing your opinion, e.g. starting with 따라서 or 결론적으로]",
  ru: "[Добавьте здесь заключительное предложение с итогом вашего мнения, например, начав с 따라서 или 결론적으로]",
  kz: "[Мұнда пікіріңізді қорытындылайтын сөйлем қосыңыз, мысалы 따라서 немесе 결론적으로 деп бастап]",
};

/** The scaffold — bracketed placeholders — is always an explicit
 * instruction to the student, never a fabricated fact or figure. Register
 * fixes come straight from the same corrections shown in grammar.errors.
 * Which exact phrasing is used varies per-response (see pickVariant above)
 * so the result is never a single fixed template. */
function buildImprovedVersion(selection: EvaluationSelection, language: FeedbackLanguage): string {
  const original = selection.originalText;
  let result = "";
  let cursor = 0;
  for (const m of selection.informalMatches) {
    result += original.slice(cursor, m.index) + m.correction;
    cursor = m.index + m.length;
  }
  result += original.slice(cursor);

  const parts: string[] = [result];

  const contentGapKeys = selection.missingElementKeys.filter(
    (k) => k === "onTopicContent" || k === "moreContent" || k === "trendLanguage"
  );
  if (contentGapKeys.length > 0) {
    const labels = contentGapKeys.map((k) => MISSING_ELEMENT_LABELS[k][language]);
    const lead = pickVariant(EXPAND_LEAD_VARIANTS[language], `${original}-lead`);
    parts.push(`${lead} ${labels.join(", ")}]`);
  }

  if (selection.missingElementKeys.includes("dataFigures") && selection.missingDataFigures.length > 0) {
    const lead = pickVariant(EXPAND_LEAD_VARIANTS[language], `${original}-data`);
    parts.push(`${lead} ${selection.missingDataFigures.join(", ")}]`);
  }

  if (selection.missingElementKeys.includes("conclusion")) {
    parts.push(CONCLUSION_PLACEHOLDER[language]);
  }

  return parts.join("\n\n");
}

/** Pure and deterministic — turns a language-neutral selection into
 * display text in the requested language. No randomness, safe to call on
 * the client for instant re-translation. */
export function localizeEvaluation(
  selection: EvaluationSelection,
  language: FeedbackLanguage
): Omit<TopikWritingEvaluation, "level" | "taskType" | "charCount"> {
  const taskCompletion: TaskCompletionFeedback = {
    addressedTask: selection.addressedTask,
    respectedFormat: selection.respectedFormat,
    notes: !selection.addressedTask
      ? TASK_NOTES.offTopic(selection.taskType)[language]
      : selection.respectedFormat
        ? TASK_NOTES.inRange(selection.minChars, selection.maxChars)[language]
        : TASK_NOTES.outOfRange(selection.charCount, selection.minChars, selection.maxChars)[language],
    missingElements: selection.missingElementKeys.map((k) => MISSING_ELEMENT_LABELS[k][language]),
  };

  const organizationCopy = ORGANIZATION_NOTES[selection.taskType];
  const organization: OrganizationFeedback = {
    isWellOrganized: selection.isWellOrganized,
    matchesExpectedStructure: selection.matchesExpectedStructure,
    notes: (selection.isWellOrganized && selection.matchesExpectedStructure ? organizationCopy.good : organizationCopy.weak)[
      language
    ],
  };

  const coherence: CoherenceFeedback = {
    isCoherent: selection.isCoherent,
    notes: (selection.isCoherent ? COHERENCE_NOTES.coherent : COHERENCE_NOTES.notCoherent)[language],
  };

  const errors: GrammarError[] = selection.informalMatches.map((m) => ({
    original: m.original,
    correction: m.correction,
    category: "formality",
    explanation: FORMALITY_EXPLANATION[language],
  }));
  const grammar: GrammarFeedback = {
    errors,
    summary: errors.length > 0 ? GRAMMAR_SUMMARY.withErrors(errors.length)[language] : GRAMMAR_SUMMARY.noErrors[language],
  };

  const vocabulary = buildVocabularyFeedback(selection.vocabularyDiversity, selection.charCount, language);

  const register: RegisterFeedback = {
    isAppropriate: selection.isAppropriateRegister,
    notes: (selection.isAppropriateRegister ? REGISTER_NOTES.appropriate : REGISTER_NOTES.notAppropriate)[language],
  };

  const accuracy: AccuracyFeedback = {
    isAccurate: selection.isAccurate,
    notes: selection.isAccurate
      ? ACCURACY_NOTES.accurate[language]
      : selection.taskType === "data-description"
        ? ACCURACY_NOTES.notAccurateData[language]
        : ACCURACY_NOTES.notAccurateGeneric[language],
  };

  const ratio = selection.taskMaxPoints > 0 ? selection.taskPoints / selection.taskMaxPoints : 0;
  const tier = ratio >= 0.75 ? "strong" : ratio >= 0.5 ? "borderline" : "weak";

  const examReadiness = {
    taskPoints: selection.taskPoints,
    taskMaxPoints: selection.taskMaxPoints,
    estimatedScore: selection.estimatedScore,
    scoreOutOf: selection.scoreOutOf,
    ...buildExamReadiness(selection, language),
    scoreExplanation: SCORE_EXPLANATION[tier](selection.taskPoints, selection.taskMaxPoints)[language],
  };

  const improvedVersion = buildImprovedVersion(selection, language);

  return { taskCompletion, organization, coherence, grammar, vocabulary, register, accuracy, examReadiness, improvedVersion };
}
