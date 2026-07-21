import type {
  DelfLevel,
  FeedbackLanguage,
  ReadingFeedback,
  ReadingResult,
  ReadingSet,
  ReadingSkillScore,
  ReadingSkillTag,
} from "@/types/reading";
import { classifyPace } from "./timing";

/**
 * Synthesizes Reading feedback (Skill Breakdown + AI Reading Strategy)
 * entirely from the student's actual question-by-question results and real
 * session timing — every sentence traces back to a computed number, never a
 * templated compliment unconnected to what actually happened. Mirrors
 * lib/listening/feedback.ts's established pattern.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

const SKILL_LABELS: Record<ReadingSkillTag | "speed", TranslatedText> = {
  mainIdea: { en: "Understanding the Main Idea", ru: "Понимание основной идеи", kz: "Негізгі ойды түсіну" },
  detail: { en: "Understanding Details", ru: "Понимание деталей", kz: "Детальдерді түсіну" },
  inference: { en: "Making Inferences", ru: "Логические выводы", kz: "Қорытынды жасау" },
  vocabulary: { en: "Vocabulary Recognition", ru: "Распознавание лексики", kz: "Лексиканы тану" },
  grammar: { en: "Grammar Recognition", ru: "Распознавание грамматики", kz: "Грамматиканы тану" },
  speed: { en: "Reading Speed", ru: "Скорость чтения", kz: "Оқу жылдамдығы" },
};

function computeSkillAccuracy(
  set: ReadingSet,
  result: ReadingResult
): Partial<Record<ReadingSkillTag, { correct: number; total: number }>> {
  const bySkill: Partial<Record<ReadingSkillTag, { correct: number; total: number }>> = {};
  for (const question of set.questions) {
    const qResult = result.questionResults.find((r) => r.questionId === question.id);
    if (!qResult) continue;
    const bucket = bySkill[question.skillTag] ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (qResult.isCorrect) bucket.correct += 1;
    bySkill[question.skillTag] = bucket;
  }
  return bySkill;
}

function skillExplanation(
  tag: ReadingSkillTag,
  bucket: { correct: number; total: number } | undefined,
  language: FeedbackLanguage
): string {
  if (!bucket) {
    const notAssessed: TranslatedText = {
      en: "Not assessed in this session — no questions of this type were included.",
      ru: "Не оценивалось в этой сессии — вопросов такого типа не было.",
      kz: "Бұл сессияда бағаланбады — мұндай сұрақтар болмады.",
    };
    return notAssessed[language];
  }
  const ratio: TranslatedText = {
    en: `${bucket.correct} out of ${bucket.total} correct.`,
    ru: `${bucket.correct} из ${bucket.total} правильно.`,
    kz: `${bucket.total}-ден ${bucket.correct} дұрыс.`,
  };
  return ratio[language];
}

function speedExplanation(wordsPerMinute: number, paceRatio: number, language: FeedbackLanguage): string {
  const tier = classifyPace(paceRatio);
  const text: Record<typeof tier, TranslatedText> = {
    fast: {
      en: `You read at roughly ${wordsPerMinute} words per minute — well under the recommended time, which can mean rushing past details.`,
      ru: `Вы читали со скоростью примерно ${wordsPerMinute} слов в минуту — значительно быстрее рекомендованного времени, что может означать пропуск деталей.`,
      kz: `Сіз шамамен минутына ${wordsPerMinute} сөз жылдамдығымен оқыдыңыз — бұл ұсынылған уақыттан әлдеқайда жылдам, бұл детальдерді жіберіп алуды білдіруі мүмкін.`,
    },
    onPace: {
      en: `You read at roughly ${wordsPerMinute} words per minute — right around the recommended DELF pace for this level.`,
      ru: `Вы читали со скоростью примерно ${wordsPerMinute} слов в минуту — это соответствует рекомендованному темпу DELF для этого уровня.`,
      kz: `Сіз шамамен минутына ${wordsPerMinute} сөз жылдамдығымен оқыдыңыз — бұл осы деңгей үшін ұсынылған DELF қарқынына сәйкес келеді.`,
    },
    slow: {
      en: `You read at roughly ${wordsPerMinute} words per minute — slower than the recommended pace, which suggests translating word by word rather than reading for meaning.`,
      ru: `Вы читали со скоростью примерно ${wordsPerMinute} слов в минуту — медленнее рекомендованного темпа, что говорит о переводе слово за словом вместо чтения на понимание смысла.`,
      kz: `Сіз шамамен минутына ${wordsPerMinute} сөз жылдамдығымен оқыдыңыз — бұл ұсынылған қарқыннан баяу, бұл мағынаны түсініп оқудың орнына сөзбе-сөз аударғаныңызды білдіреді.`,
    },
  };
  return text[tier][language];
}

const OVERALL_PERFORMANCE = {
  strong: (level: DelfLevel, percentage: number): TranslatedText => ({
    en: `Strong performance — ${percentage}% correct is a solid result for DELF ${level} reading comprehension.`,
    ru: `Хороший результат — ${percentage}% правильных ответов — это уверенный результат для понимания письменного текста DELF ${level}.`,
    kz: `Жақсы нәтиже — ${percentage}% дұрыс жауап DELF ${level} оқылым түсінігі үшін сенімді нәтиже.`,
  }),
  moderate: (level: DelfLevel, percentage: number): TranslatedText => ({
    en: `A moderate result — ${percentage}% correct shows real progress at DELF ${level}, with room to sharpen specific reading skills.`,
    ru: `Средний результат — ${percentage}% правильных ответов показывает реальный прогресс на уровне DELF ${level}, но есть куда расти в конкретных навыках чтения.`,
    kz: `Орташа нәтиже — ${percentage}% дұрыс жауап DELF ${level} деңгейінде нақты прогресті көрсетеді, бірақ белгілі бір оқылым дағдыларын жетілдіру керек.`,
  }),
  weak: (level: DelfLevel, percentage: number): TranslatedText => ({
    en: `${percentage}% correct indicates DELF ${level} reading comprehension needs focused practice before this would be exam-ready.`,
    ru: `${percentage}% правильных ответов означает, что понимание письменного текста DELF ${level} нуждается в целенаправленной практике перед экзаменом.`,
    kz: `${percentage}% дұрыс жауап DELF ${level} оқылым түсінігінің емтиханға дайын болу үшін мақсатты жаттығуды қажет ететінін көрсетеді.`,
  }),
};

const READINESS = {
  ready: (level: DelfLevel): TranslatedText => ({
    en: `Based on this session, reading comprehension is tracking well toward DELF ${level} readiness.`,
    ru: `Судя по этой сессии, понимание письменного текста хорошо продвигается к готовности к DELF ${level}.`,
    kz: `Бұл сессияға қарағанда, оқылым түсінігі DELF ${level} деңгейіне дайын болуға жақсы бара жатыр.`,
  }),
  developing: (level: DelfLevel): TranslatedText => ({
    en: `Developing toward DELF ${level} — consistent practice on the specific skills above will close the gap.`,
    ru: `Развивается в сторону DELF ${level} — регулярная практика указанных выше навыков поможет закрыть пробел.`,
    kz: `DELF ${level} деңгейіне қарай дамып келеді — жоғарыда аталған дағдыларды тұрақты жаттығу алшақтықты жабады.`,
  }),
  notYet: (level: DelfLevel): TranslatedText => ({
    en: `Not yet at DELF ${level} reading standard — focused, regular practice is recommended before attempting the real exam.`,
    ru: `Пока не дотягивает до стандарта чтения DELF ${level} — рекомендуется целенаправленная регулярная практика перед реальным экзаменом.`,
    kz: `Әзірге DELF ${level} оқылым стандартына жетпейді — нақты емтиханға дейін мақсатты, тұрақты жаттығу ұсынылады.`,
  }),
};

/** Every insight is gated behind a real condition computed from this
 * session's actual data (a skill ratio, the pace tier, overall accuracy) —
 * never chosen at random. Because several independent conditions are
 * checked and interpolated with real numbers, the combination — and the
 * wording — naturally varies from session to session instead of repeating
 * identical advice. */
function buildStrategyInsights(
  bySkill: Partial<Record<ReadingSkillTag, { correct: number; total: number }>>,
  paceRatio: number,
  wordsPerMinute: number,
  overallAccuracy: number,
  language: FeedbackLanguage
): string[] {
  const insights: TranslatedText[] = [];
  const paceTier = classifyPace(paceRatio);
  const ratio = (tag: ReadingSkillTag) => {
    const b = bySkill[tag];
    return b && b.total > 0 ? b.correct / b.total : null;
  };

  const mainIdeaRatio = ratio("mainIdea");
  const inferenceRatio = ratio("inference");
  const detailRatio = ratio("detail");
  const grammarRatio = ratio("grammar");
  const vocabRatio = ratio("vocabulary");

  if (mainIdeaRatio !== null && mainIdeaRatio < 0.6 && (vocabRatio === null || vocabRatio >= mainIdeaRatio)) {
    insights.push({
      en: "You focused too much on individual words instead of the overall meaning — main-idea questions were missed even though vocabulary recognition held up. Try summarizing each paragraph in one phrase before looking at the questions.",
      ru: "Вы слишком сосредоточились на отдельных словах вместо общего смысла — вопросы на основную идею были упущены, хотя распознавание лексики было в порядке. Попробуйте резюмировать каждый абзац одной фразой перед тем, как смотреть вопросы.",
      kz: "Сіз жалпы мағынаның орнына жеке сөздерге тым көп назар аудардыңыз — лексиканы тану жақсы болса да, негізгі ой сұрақтары жіберілді. Сұрақтарды қарамас бұрын әр абзацты бір тіркеспен қорытуды жаттығыңыз.",
    });
  }

  if (inferenceRatio !== null && inferenceRatio < 0.6) {
    insights.push({
      en: "You relied on what was stated directly and missed questions that required reading between the lines. Practice asking \"what does this imply?\" after each paragraph, not just \"what does this say?\"",
      ru: "Вы полагались только на то, что сказано прямо, и упустили вопросы, требующие чтения между строк. Тренируйтесь спрашивать «что это подразумевает?» после каждого абзаца, а не только «что здесь сказано?».",
      kz: "Сіз тек тікелей айтылғанға сүйендіңіз және жол арасын оқуды қажет ететін сұрақтарды жіберіп алдыңыз. Әр абзацтан кейін «бұл нені білдіреді?» деп сұрауды жаттығыңыз, тек «бұл не туралы айтылған?» емес.",
    });
  }

  if (detailRatio !== null && detailRatio < 0.6) {
    insights.push({
      en: "You ignored important numbers, dates, and names — detail questions were the weakest area. Underline every number, date, and proper noun the moment you see it.",
      ru: "Вы пропустили важные числа, даты и имена — вопросы на детали оказались самой слабой областью. Подчёркивайте каждое число, дату и имя собственное сразу, как только увидите их.",
      kz: "Сіз маңызды сандарды, даталарды және есімдерді елемей қалдыңыз — детальдер бойынша сұрақтар ең әлсіз тұс болды. Көрген сәтте әрбір санды, датаны және жалқы есімді сызып қойыңыз.",
    });
  }

  if (grammarRatio !== null && grammarRatio < 0.6) {
    insights.push({
      en: "You missed transition words and grammar signals (mais, cependant, donc, bien que) that mark contrast, cause, or a shift in the argument — those words often point straight at the correct answer.",
      ru: "Вы упустили союзы и грамматические сигналы (mais, cependant, donc, bien que), отмечающие контраст, причину или смену аргумента — эти слова часто прямо указывают на правильный ответ.",
      kz: "Сіз қарама-қайшылықты, себепті немесе дәлелдің өзгеруін білдіретін жалғаулықтар мен грамматикалық белгілерді (mais, cependant, donc, bien que) жіберіп алдыңыз — бұл сөздер жиі дұрыс жауапқа тікелей меңзейді.",
    });
  }

  if (paceTier === "fast" && overallAccuracy < 0.6) {
    insights.push({
      en: "You answered very quickly relative to the recommended time and your accuracy was low — this pattern suggests relying on guessing rather than reading the relevant passage carefully before choosing.",
      ru: "Вы отвечали очень быстро относительно рекомендованного времени, а точность была низкой — это указывает на угадывание ответов, а не на внимательное чтение соответствующего отрывка перед выбором.",
      kz: "Сіз ұсынылған уақытпен салыстырғанда өте жылдам жауап бердіңіз, ал дәлдігіңіз төмен болды — бұл таңдау алдында тиісті үзіндіні мұқият оқымай, болжауға сүйенгеніңізді көрсетеді.",
    });
  } else if (paceTier === "slow") {
    insights.push({
      en: "You spent more time than recommended — likely translating word by word instead of skimming first for the overall meaning and only re-reading closely around the answer.",
      ru: "Вы потратили больше времени, чем рекомендуется — вероятно, переводили слово за словом вместо того, чтобы сначала бегло прочитать текст для общего понимания и лишь затем внимательно перечитать нужный фрагмент.",
      kz: "Сіз ұсынылғаннан көбірек уақыт жұмсадыңыз — бәлкім, алдымен жалпы мағынаны түсіну үшін жүгіртіп оқып, тек жауап маңайын мұқият қайта оқудың орнына сөзбе-сөз аудардыңыз.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      en: `Solid, balanced reading at ${wordsPerMinute} words per minute — no single skill stands out as a weakness this time. Keep practicing with new passages to maintain this level.`,
      ru: `Уверенное, сбалансированное чтение со скоростью ${wordsPerMinute} слов в минуту — на этот раз ни один навык не выделяется как слабый. Продолжайте практиковаться на новых текстах, чтобы удержать этот уровень.`,
      kz: `Минутына ${wordsPerMinute} сөз жылдамдығымен сенімді, теңгерімді оқылым — бұл жолы ешбір дағды әлсіз жақ ретінде ерекшеленбейді. Осы деңгейді сақтау үшін жаңа мәтіндермен жаттығуды жалғастырыңыз.`,
    });
  }

  return insights.map((i) => i[language]);
}

export function synthesizeReadingFeedback(
  set: ReadingSet,
  result: ReadingResult,
  wordsPerMinute: number,
  language: FeedbackLanguage
): ReadingFeedback {
  const bySkill = computeSkillAccuracy(set, result);
  const tags: ReadingSkillTag[] = ["mainIdea", "detail", "inference", "vocabulary", "grammar"];

  const skills: ReadingSkillScore[] = tags.map((tag) => {
    const bucket = bySkill[tag];
    const scorePercent = bucket && bucket.total > 0 ? Math.round((bucket.correct / bucket.total) * 100) : 0;
    return {
      skill: tag,
      label: SKILL_LABELS[tag][language],
      scorePercent,
      explanation: skillExplanation(tag, bucket, language),
    };
  });

  skills.push({
    skill: "speed",
    label: SKILL_LABELS.speed[language],
    scorePercent: Math.max(0, Math.min(100, Math.round(100 - Math.abs(1 - result.timing.paceRatio) * 100))),
    explanation: speedExplanation(wordsPerMinute, result.timing.paceRatio, language),
  });

  const ranked = tags
    .map((tag) => ({ tag, bucket: bySkill[tag] }))
    .filter((t): t is { tag: ReadingSkillTag; bucket: { correct: number; total: number } } => t.bucket !== undefined)
    .map((t) => ({ ...t, ratio: t.bucket.correct / t.bucket.total }));

  const strongestSkills = [...ranked]
    .sort((a, b) => b.ratio - a.ratio)
    .filter((t) => t.ratio >= 0.5)
    .slice(0, 3)
    .map((t) => SKILL_LABELS[t.tag][language]);

  const weakestSkills = [...ranked]
    .sort((a, b) => a.ratio - b.ratio)
    .filter((t) => t.ratio < 1)
    .slice(0, 3)
    .map((t) => SKILL_LABELS[t.tag][language]);

  const tier = result.percentage >= 75 ? "strong" : result.percentage >= 50 ? "moderate" : "weak";
  const readinessTier = result.percentage >= 70 ? "ready" : result.percentage >= 40 ? "developing" : "notYet";

  const strategyInsights = buildStrategyInsights(
    bySkill,
    result.timing.paceRatio,
    wordsPerMinute,
    result.accuracy,
    language
  );

  return {
    overallPerformance: OVERALL_PERFORMANCE[tier](set.level, result.percentage)[language],
    skills,
    strongestSkills,
    weakestSkills,
    strategyInsights,
    estimatedDelfReadiness: READINESS[readinessTier](set.level)[language],
  };
}
