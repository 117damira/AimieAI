import type {
  FeedbackLanguage,
  TopikLevel,
  TopikListeningFeedback,
  TopikListeningResult,
  TopikListeningSet,
  TopikListeningSkillTag,
} from "@/types/topik-listening";

/**
 * Synthesizes Listening feedback entirely from the student's actual
 * question-by-question results — every sentence traces back to a real
 * computed number (per-skill accuracy, overall percentage), never a
 * templated compliment unconnected to what actually happened. Mirrors the
 * established pattern in lib/listening/feedback.ts.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

/** Exported so components needing a plain skill-tag label (e.g. the results
 * summary's per-skill row headers) don't have to re-derive translated text
 * that already lives here — translations.ts is off-limits, so this is the
 * single source of truth for these labels, mirroring how config/delf-writing.ts
 * defines local translated constants for exam-specific copy. */
export const TOPIK_LISTENING_SKILL_LABELS: Record<TopikListeningSkillTag, TranslatedText> = {
  mainIdea: { en: "Main idea", ru: "Основная идея", kz: "Негізгі ой" },
  speakerIntention: { en: "Speaker's intention", ru: "Намерение говорящего", kz: "Сөйлеушінің ниеті" },
  detail: { en: "Details", ru: "Детали", kz: "Детальдер" },
  statementMatch: { en: "Matching statement", ru: "Соответствующее утверждение", kz: "Сәйкес мәлімдеме" },
  numberDateLocation: { en: "Numbers, dates & locations", ru: "Числа, даты и места", kz: "Сандар, даталар және орындар" },
  relationship: { en: "Speaker relationship", ru: "Отношения говорящих", kz: "Сөйлеушілер қарым-қатынасы" },
  inference: { en: "Inference", ru: "Умозаключение", kz: "Қорытынды жасау" },
};

function computeSkillAccuracy(
  set: TopikListeningSet,
  result: TopikListeningResult
): Partial<Record<TopikListeningSkillTag, { correct: number; total: number }>> {
  const bySkill: Partial<Record<TopikListeningSkillTag, { correct: number; total: number }>> = {};
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
  tag: TopikListeningSkillTag,
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
  const label = TOPIK_LISTENING_SKILL_LABELS[tag][language];
  const ratio: TranslatedText = {
    en: `${label}: ${bucket.correct} out of ${bucket.total} correct.`,
    ru: `${label}: ${bucket.correct} из ${bucket.total} правильно.`,
    kz: `${label}: ${bucket.total}-ден ${bucket.correct} дұрыс.`,
  };
  return ratio[language];
}

const OVERALL_PERFORMANCE = {
  strong: (level: TopikLevel, percentage: number): TranslatedText => ({
    en: `Strong performance — ${percentage}% correct is a solid result for TOPIK Level ${level} listening comprehension.`,
    ru: `Хороший результат — ${percentage}% правильных ответов — это уверенный результат для понимания на слух TOPIK, уровень ${level}.`,
    kz: `Жақсы нәтиже — ${percentage}% дұрыс жауап TOPIK ${level}-деңгей тыңдалым түсінігі үшін сенімді нәтиже.`,
  }),
  moderate: (level: TopikLevel, percentage: number): TranslatedText => ({
    en: `A moderate result — ${percentage}% correct shows real progress at TOPIK Level ${level}, with room to sharpen specific listening skills.`,
    ru: `Средний результат — ${percentage}% правильных ответов показывает реальный прогресс на уровне TOPIK ${level}, но есть куда расти в конкретных навыках аудирования.`,
    kz: `Орташа нәтиже — ${percentage}% дұрыс жауап TOPIK ${level}-деңгейінде нақты прогресті көрсетеді, бірақ белгілі бір тыңдалым дағдыларын жетілдіру керек.`,
  }),
  weak: (level: TopikLevel, percentage: number): TranslatedText => ({
    en: `${percentage}% correct indicates TOPIK Level ${level} listening comprehension needs focused practice before this would be exam-ready.`,
    ru: `${percentage}% правильных ответов означает, что понимание на слух TOPIK ${level} нуждается в целенаправленной практике перед экзаменом.`,
    kz: `${percentage}% дұрыс жауап TOPIK ${level}-деңгей тыңдалым түсінігінің емтиханға дайын болу үшін мақсатты жаттығуды қажет ететінін көрсетеді.`,
  }),
};

const RECOMMENDATION_BY_SKILL: Record<TopikListeningSkillTag, TranslatedText> = {
  mainIdea: {
    en: "Practice summarizing a recording's overall point in one sentence right after listening, before looking at any answer options.",
    ru: "Тренируйтесь формулировать общую суть записи одним предложением сразу после прослушивания, до того как смотреть варианты ответов.",
    kz: "Жауап нұсқаларын қарамас бұрын, тыңдағаннан кейін бірден жазбаның жалпы мағынасын бір сөйлеммен қорытуды жаттығыңыз.",
  },
  speakerIntention: {
    en: "Pay attention to tone and closing phrases (requests, suggestions, refusals) — the speaker's goal is often signaled at the end of what they say.",
    ru: "Обращайте внимание на тон и завершающие фразы (просьбы, предложения, отказы) — цель говорящего часто выражается в конце высказывания.",
    kz: "Дауыс ырғағы мен аяқтаушы тіркестерге (өтініштер, ұсыныстар, бас тартулар) назар аударыңыз — сөйлеушінің мақсаты көбіне сөйлемнің соңында білінеді.",
  },
  detail: {
    en: "Take brief notes on specific details (who did what, where) while listening, rather than relying on memory alone.",
    ru: "Делайте краткие заметки о конкретных деталях (кто что делал, где) во время прослушивания, не полагайтесь только на память.",
    kz: "Тыңдау кезінде тек жадыға сенбей, нақты детальдер (кім не істеді, қайда) туралы қысқаша жазбалар жасаңыз.",
  },
  statementMatch: {
    en: "When comparing a statement against the recording, check every detail (person, number, time) individually — one wrong detail makes the whole statement false.",
    ru: "Сравнивая утверждение с записью, проверяйте каждую деталь (человек, число, время) отдельно — одна неверная деталь делает всё утверждение ложным.",
    kz: "Мәлімдемені жазбамен салыстырғанда, әрбір детальді (адам, сан, уақыт) жеке тексеріңіз — бір қате детал бүкіл мәлімдемені жалған етеді.",
  },
  numberDateLocation: {
    en: "Numbers, dates, and locations are often said quickly in Korean — practice writing down every one you hear, even ones that seem unimportant.",
    ru: "Числа, даты и места часто произносятся быстро по-корейски — тренируйтесь записывать каждое услышанное, даже если оно кажется неважным.",
    kz: "Сандар, даталар және орындар кореяша жиі тез айтылады — маңызды емес сияқты көрінсе де, естіген әрбір нәрсені жазуды жаттығыңыз.",
  },
  relationship: {
    en: "Listen for honorific/polite speech level markers and forms of address — they reveal how the speakers relate to each other (age, rank, familiarity).",
    ru: "Слушайте маркеры уровня вежливости и обращения — они показывают, как говорящие относятся друг к другу (возраст, статус, близость).",
    kz: "Ізеттілік деңгейінің көрсеткіштері мен қаратпа сөздерге назар аударыңыз — олар сөйлеушілердің бір-біріне қатынасын (жас, дәреже, жақындық) көрсетеді.",
  },
  inference: {
    en: "When the answer isn't stated directly, focus on tone, context, and what's implied between the lines rather than searching for an exact quote.",
    ru: "Когда ответ не сказан напрямую, обращайте внимание на тон, контекст и то, что подразумевается, а не ищите точную цитату.",
    kz: "Жауап тікелей айтылмаса, нақты дәйексөз іздемей, дауыс ырғағына, контекске және жасырын мағынаға назар аударыңыз.",
  },
};

const READINESS = {
  ready: (level: TopikLevel): TranslatedText => ({
    en: `Based on this session, listening comprehension is tracking well toward TOPIK Level ${level} readiness.`,
    ru: `Судя по этой сессии, понимание на слух хорошо продвигается к готовности к TOPIK, уровень ${level}.`,
    kz: `Бұл сессияға қарағанда, тыңдалым түсінігі TOPIK ${level}-деңгейіне дайын болуға жақсы бара жатыр.`,
  }),
  developing: (level: TopikLevel): TranslatedText => ({
    en: `Developing toward TOPIK Level ${level} — consistent practice on the specific skills above will close the gap.`,
    ru: `Развивается в сторону TOPIK, уровень ${level} — регулярная практика указанных выше навыков поможет закрыть пробел.`,
    kz: `TOPIK ${level}-деңгейіне қарай дамып келеді — жоғарыда аталған дағдыларды тұрақты жаттығу алшақтықты жабады.`,
  }),
  notYet: (level: TopikLevel): TranslatedText => ({
    en: `Not yet at TOPIK Level ${level} listening standard — focused, regular practice is recommended before attempting the real exam.`,
    ru: `Пока не дотягивает до стандарта аудирования TOPIK, уровень ${level} — рекомендуется целенаправленная регулярная практика перед реальным экзаменом.`,
    kz: `Әзірге TOPIK ${level}-деңгей тыңдалым стандартына жетпейді — нақты емтиханға дейін мақсатты, тұрақты жаттығу ұсынылады.`,
  }),
};

export function synthesizeTopikListeningFeedback(
  set: TopikListeningSet,
  result: TopikListeningResult,
  language: FeedbackLanguage
): TopikListeningFeedback {
  const bySkill = computeSkillAccuracy(set, result);
  const tags: TopikListeningSkillTag[] = [
    "mainIdea",
    "speakerIntention",
    "detail",
    "statementMatch",
    "numberDateLocation",
    "relationship",
    "inference",
  ];

  const ranked = tags
    .map((tag) => ({ tag, bucket: bySkill[tag] }))
    .filter((t): t is { tag: TopikListeningSkillTag; bucket: { correct: number; total: number } } => t.bucket !== undefined)
    .map((t) => ({ ...t, ratio: t.bucket.correct / t.bucket.total }));

  const strongestSkills = [...ranked]
    .sort((a, b) => b.ratio - a.ratio)
    .filter((t) => t.ratio >= 0.5)
    .slice(0, 3)
    .map((t) => TOPIK_LISTENING_SKILL_LABELS[t.tag][language]);

  const weakestSkills = [...ranked]
    .sort((a, b) => a.ratio - b.ratio)
    .filter((t) => t.ratio < 1)
    .slice(0, 3)
    .map((t) => TOPIK_LISTENING_SKILL_LABELS[t.tag][language]);

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
    understandingMainIdea: understandingSentence("mainIdea", bySkill.mainIdea, language),
    understandingSpeakerIntention: understandingSentence("speakerIntention", bySkill.speakerIntention, language),
    understandingDetail: understandingSentence("detail", bySkill.detail, language),
    understandingStatementMatch: understandingSentence("statementMatch", bySkill.statementMatch, language),
    understandingNumberDateLocation: understandingSentence("numberDateLocation", bySkill.numberDateLocation, language),
    understandingRelationship: understandingSentence("relationship", bySkill.relationship, language),
    understandingInference: understandingSentence("inference", bySkill.inference, language),
    recommendations: recommendations.length > 0 ? recommendations : [RECOMMENDATION_BY_SKILL.detail[language]],
    estimatedTopikReadiness: READINESS[readinessTier](set.level)[language],
  };
}
