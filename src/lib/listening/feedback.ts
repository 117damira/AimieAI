import type {
  DelfLevel,
  FeedbackLanguage,
  ListeningFeedback,
  ListeningResult,
  ListeningSet,
  ListeningSkillTag,
} from "@/types/listening";

/**
 * Synthesizes Listening feedback entirely from the student's actual
 * question-by-question results — every sentence traces back to a real
 * computed number (per-skill accuracy, overall percentage), never a
 * templated compliment unconnected to what actually happened. Mirrors the
 * established pattern in lib/mock/writing-evaluation.ts and
 * lib/mock/speaking-evaluation.ts.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

const SKILL_LABELS: Record<ListeningSkillTag, TranslatedText> = {
  mainIdea: { en: "Main ideas", ru: "Основные идеи", kz: "Негізгі ойлар" },
  detail: { en: "Details", ru: "Детали", kz: "Детальдер" },
  number: { en: "Numbers", ru: "Числа", kz: "Сандар" },
  name: { en: "Names", ru: "Имена", kz: "Есімдер" },
  date: { en: "Dates", ru: "Даты", kz: "Даталар" },
  vocabulary: { en: "Vocabulary", ru: "Словарный запас", kz: "Сөздік қор" },
};

function computeSkillAccuracy(set: ListeningSet, result: ListeningResult): Partial<Record<ListeningSkillTag, { correct: number; total: number }>> {
  const bySkill: Partial<Record<ListeningSkillTag, { correct: number; total: number }>> = {};
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

function understandingSentence(
  tag: ListeningSkillTag,
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
  const label = SKILL_LABELS[tag][language];
  const ratio: TranslatedText = {
    en: `${label}: ${bucket.correct} out of ${bucket.total} correct.`,
    ru: `${label}: ${bucket.correct} из ${bucket.total} правильно.`,
    kz: `${label}: ${bucket.total}-ден ${bucket.correct} дұрыс.`,
  };
  return ratio[language];
}

const OVERALL_PERFORMANCE = {
  strong: (level: DelfLevel, percentage: number): TranslatedText => ({
    en: `Strong performance — ${percentage}% correct is a solid result for DELF ${level} listening comprehension.`,
    ru: `Хороший результат — ${percentage}% правильных ответов — это уверенный результат для понимания на слух DELF ${level}.`,
    kz: `Жақсы нәтиже — ${percentage}% дұрыс жауап DELF ${level} тыңдалым түсінігі үшін сенімді нәтиже.`,
  }),
  moderate: (level: DelfLevel, percentage: number): TranslatedText => ({
    en: `A moderate result — ${percentage}% correct shows real progress at DELF ${level}, with room to sharpen specific listening skills.`,
    ru: `Средний результат — ${percentage}% правильных ответов показывает реальный прогресс на уровне DELF ${level}, но есть куда расти в конкретных навыках аудирования.`,
    kz: `Орташа нәтиже — ${percentage}% дұрыс жауап DELF ${level} деңгейінде нақты прогресті көрсетеді, бірақ белгілі бір тыңдалым дағдыларын жетілдіру керек.`,
  }),
  weak: (level: DelfLevel, percentage: number): TranslatedText => ({
    en: `${percentage}% correct indicates DELF ${level} listening comprehension needs focused practice before this would be exam-ready.`,
    ru: `${percentage}% правильных ответов означает, что понимание на слух DELF ${level} нуждается в целенаправленной практике перед экзаменом.`,
    kz: `${percentage}% дұрыс жауап DELF ${level} тыңдалым түсінігінің емтиханға дайын болу үшін мақсатты жаттығуды қажет ететінін көрсетеді.`,
  }),
};

const RECOMMENDATION_BY_SKILL: Record<ListeningSkillTag, TranslatedText> = {
  mainIdea: {
    en: "Practice summarizing a recording's overall point in one sentence right after listening, before looking at any answer options.",
    ru: "Тренируйтесь формулировать общую суть записи одним предложением сразу после прослушивания, до того как смотреть варианты ответов.",
    kz: "Жауап нұсқаларын қарамас бұрын, тыңдағаннан кейін бірден жазбаның жалпы мағынасын бір сөйлеммен қорытуды жаттығыңыз.",
  },
  detail: {
    en: "Take brief notes on specific details (who did what, where) while listening, rather than relying on memory alone.",
    ru: "Делайте краткие заметки о конкретных деталях (кто что делал, где) во время прослушивания, не полагайтесь только на память.",
    kz: "Тыңдау кезінде тек жадыға сенбей, нақты детальдер (кім не істеді, қайда) туралы қысқаша жазбалар жасаңыз.",
  },
  number: {
    en: "Numbers are often said quickly — practice writing down every number you hear in a recording, even ones that seem unimportant.",
    ru: "Числа часто произносятся быстро — тренируйтесь записывать каждое услышанное число, даже если оно кажется неважным.",
    kz: "Сандар жиі тез айтылады — маңызды емес сияқты көрінсе де, есту кезінде естіген әрбір санды жазуды жаттығыңыз.",
  },
  name: {
    en: "Listen for capitalized-sounding proper nouns (names of people and places) and jot them down as soon as you hear them.",
    ru: "Слушайте имена собственные (людей и мест) и записывайте их сразу, как только услышите.",
    kz: "Жалқы есімдерді (адамдар мен орындардың атауларын) тыңдап, естігеннен кейін бірден жазып алыңыз.",
  },
  date: {
    en: "Review French date and time expressions (days, months, \"il y a\", \"dans\") so you recognize them instantly instead of translating word by word.",
    ru: "Повторите французские выражения дат и времени (дни, месяцы, «il y a», «dans»), чтобы узнавать их мгновенно, а не переводить слово за словом.",
    kz: "Күн мен уақыт өрнектерін (күндер, айлар, «il y a», «dans») қайталаңыз, сонда оларды сөзбе-сөз аудармай, бірден таниды екенсіз.",
  },
  vocabulary: {
    en: "Build vocabulary around the recording's topic area before practicing again — unfamiliar words are often what causes a wrong answer, not the grammar.",
    ru: "Расширяйте словарный запас по теме записи перед следующей практикой — часто причиной неправильного ответа становятся незнакомые слова, а не грамматика.",
    kz: "Келесі жаттығу алдында жазба тақырыбына қатысты сөздік қорды кеңейтіңіз — көбіне қате жауаптың себебі грамматика емес, таныс емес сөздер болады.",
  },
};

const READINESS = {
  ready: (level: DelfLevel): TranslatedText => ({
    en: `Based on this session, listening comprehension is tracking well toward DELF ${level} readiness.`,
    ru: `Судя по этой сессии, понимание на слух хорошо продвигается к готовности к DELF ${level}.`,
    kz: `Бұл сессияға қарағанда, тыңдалым түсінігі DELF ${level} деңгейіне дайын болуға жақсы бара жатыр.`,
  }),
  developing: (level: DelfLevel): TranslatedText => ({
    en: `Developing toward DELF ${level} — consistent practice on the specific skills above will close the gap.`,
    ru: `Развивается в сторону DELF ${level} — регулярная практика указанных выше навыков поможет закрыть пробел.`,
    kz: `DELF ${level} деңгейіне қарай дамып келеді — жоғарыда аталған дағдыларды тұрақты жаттығу алшақтықты жабады.`,
  }),
  notYet: (level: DelfLevel): TranslatedText => ({
    en: `Not yet at DELF ${level} listening standard — focused, regular practice is recommended before attempting the real exam.`,
    ru: `Пока не дотягивает до стандарта аудирования DELF ${level} — рекомендуется целенаправленная регулярная практика перед реальным экзаменом.`,
    kz: `Әзірге DELF ${level} тыңдалым стандартына жетпейді — нақты емтиханға дейін мақсатты, тұрақты жаттығу ұсынылады.`,
  }),
};

export function synthesizeListeningFeedback(
  set: ListeningSet,
  result: ListeningResult,
  language: FeedbackLanguage
): ListeningFeedback {
  const bySkill = computeSkillAccuracy(set, result);
  const tags: ListeningSkillTag[] = ["mainIdea", "detail", "number", "name", "date", "vocabulary"];

  const ranked = tags
    .map((tag) => ({ tag, bucket: bySkill[tag] }))
    .filter((t): t is { tag: ListeningSkillTag; bucket: { correct: number; total: number } } => t.bucket !== undefined)
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

  const recommendations =
    ranked
      .filter((t) => t.ratio < 1)
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 3)
      .map((t) => RECOMMENDATION_BY_SKILL[t.tag][language]) ?? [];

  const readinessTier = result.percentage >= 70 ? "ready" : result.percentage >= 40 ? "developing" : "notYet";

  const listeningAccuracy: TranslatedText = {
    en: `${result.questionResults.filter((r) => r.isCorrect).length} out of ${set.questions.length} questions correct (${result.percentage}% accuracy).`,
    ru: `${result.questionResults.filter((r) => r.isCorrect).length} из ${set.questions.length} вопросов правильно (точность ${result.percentage}%).`,
    kz: `${set.questions.length}-ден ${result.questionResults.filter((r) => r.isCorrect).length} сұрақ дұрыс (дәлдік ${result.percentage}%).`,
  };

  return {
    overallPerformance: OVERALL_PERFORMANCE[tier](set.level, result.percentage)[language],
    strongestSkills,
    weakestSkills,
    listeningAccuracy: listeningAccuracy[language],
    understandingMainIdeas: understandingSentence("mainIdea", bySkill.mainIdea, language),
    understandingDetails: understandingSentence("detail", bySkill.detail, language),
    understandingNumbers: understandingSentence("number", bySkill.number, language),
    understandingNames: understandingSentence("name", bySkill.name, language),
    understandingDates: understandingSentence("date", bySkill.date, language),
    vocabularyComprehension: understandingSentence("vocabulary", bySkill.vocabulary, language),
    recommendations: recommendations.length > 0 ? recommendations : [RECOMMENDATION_BY_SKILL.detail[language]],
    estimatedDelfReadiness: READINESS[readinessTier](set.level)[language],
  };
}
