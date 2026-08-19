import type { FeedbackLanguage } from "@/types/writing-evaluation";
import type { TopikBuddyContext, TopikBuddyMessage } from "@/types/topik-buddy";

/**
 * Offline fallback for Aimie Buddy, used by /api/topik/buddy/chat when no
 * ANTHROPIC_API_KEY is configured. Honest limit: a rule-based keyword
 * matcher can't hold a genuine open-ended conversation the way the Claude
 * path (lib/ai/topik-buddy-chat.ts) can — this gives a small set of
 * curated, context-grounded replies for the most common study-mentor
 * questions (what to study, vocabulary/grammar/writing/listening/reading
 * help, motivation) and an honest, still-personalized default otherwise.
 * Every value it mentions (level, track, weakest skill, streak, exam
 * countdown) comes from the real TopikBuddyContext — never invented.
 */

const SKILL_LABEL: Record<"listening" | "reading" | "writing", Record<FeedbackLanguage, string>> = {
  listening: { en: "Listening", ru: "Аудирование", kz: "Тыңдалым" },
  reading: { en: "Reading", ru: "Чтение", kz: "Оқылым" },
  writing: { en: "Writing", ru: "Письмо", kz: "Жазылым" },
};

const KEYWORDS: Record<string, Record<FeedbackLanguage, string[]>> = {
  studyToday: {
    en: ["what should i study", "study today", "what to study", "recommend"],
    ru: ["что мне учить", "что заниматься", "что изучать сегодня", "порекоменд"],
    kz: ["не оқуым керек", "бүгін не", "не істеуім керек", "ұсын"],
  },
  vocabulary: {
    en: ["vocabulary", "vocab", "word"],
    ru: ["словар", "лексик", "слово"],
    kz: ["сөздік", "лексика", "сөз"],
  },
  grammar: {
    en: ["grammar", "particle", "conjugation"],
    ru: ["граммат", "частиц", "спряжен"],
    kz: ["грамматика", "жалғау"],
  },
  writing: {
    en: ["writing", "essay", "write"],
    ru: ["письмо", "эссе", "написать"],
    kz: ["жазылым", "эссе", "жазу"],
  },
  listening: {
    en: ["listening", "audio", "listen"],
    ru: ["аудирован", "слуш"],
    kz: ["тыңдалым", "тыңда"],
  },
  reading: {
    en: ["reading", "passage", "read"],
    ru: ["чтени", "текст"],
    kz: ["оқылым", "мәтін"],
  },
  motivation: {
    en: ["stressed", "overwhelmed", "tired", "give up", "anxious", "worried"],
    ru: ["стресс", "устал", "тяжело", "сдаться", "переживаю"],
    kz: ["шаршадым", "күйзеліс", "қиын", "тастап кету"],
  },
};

function matches(text: string, language: FeedbackLanguage, category: keyof typeof KEYWORDS): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS[category][language].some((kw) => lower.includes(kw));
}

function daysLine(context: TopikBuddyContext, language: FeedbackLanguage): string {
  if (context.daysUntilExam === null) {
    return { en: "You haven't set an exam date yet.", ru: "Вы ещё не указали дату экзамена.", kz: "Сіз әлі емтихан күнін көрсетпедіңіз." }[language];
  }
  if (context.daysUntilExam < 0) {
    return { en: "Your set exam date has already passed.", ru: "Указанная дата экзамена уже прошла.", kz: "Көрсетілген емтихан күні өтіп кетті." }[language];
  }
  return {
    en: `You have ${context.daysUntilExam} day(s) until your exam.`,
    ru: `До экзамена осталось ${context.daysUntilExam} дн.`,
    kz: `Емтиханға дейін ${context.daysUntilExam} күн қалды.`,
  }[language];
}

function weakestSkillLine(context: TopikBuddyContext, language: FeedbackLanguage): string {
  if (!context.weakestSkill) {
    return {
      en: "You don't have enough practice sessions yet for me to spot a weak area — try a Listening, Reading, or Writing session first.",
      ru: "У вас пока недостаточно тренировок, чтобы я мог определить слабое место — попробуйте сначала пройти Аудирование, Чтение или Письмо.",
      kz: "Әлсіз жерді анықтау үшін жаттығуларыңыз әлі жеткіліксіз — алдымен Тыңдалым, Оқылым немесе Жазылымнан өтіп көріңіз.",
    }[language];
  }
  const skill = SKILL_LABEL[context.weakestSkill][language];
  const pct =
    context.weakestSkill === "listening"
      ? context.listeningAccuracyPct
      : context.weakestSkill === "reading"
        ? context.readingAccuracyPct
        : context.writingAccuracyPct;
  return {
    en: `Based on your recent sessions, ${skill} is your weakest area right now${pct !== null ? ` (around ${pct}% accuracy)` : ""} — that's the highest-value place to focus today.`,
    ru: `По вашим последним тренировкам ${skill} — сейчас самое слабое место${pct !== null ? ` (точность около ${pct}%)` : ""} — на этом стоит сосредоточиться сегодня.`,
    kz: `Соңғы жаттығуларыңызға қарағанда, ${skill} қазір ең әлсіз жеріңіз${pct !== null ? ` (дәлдігі шамамен ${pct}%)` : ""} — бүгін осыған назар аударған жөн.`,
  }[language];
}

function levelLine(context: TopikBuddyContext, language: FeedbackLanguage): string {
  const track = context.track ? `TOPIK ${context.track}` : (
    { en: "your TOPIK track", ru: "ваш уровень TOPIK", kz: "сіздің TOPIK бағытыңыз" }[language]
  );
  const level = context.level ?? "?";
  return {
    en: `You're preparing for ${track}, level ${level}.`,
    ru: `Вы готовитесь к ${track}, уровень ${level}.`,
    kz: `Сіз ${track}, деңгей ${level} дайындалып жатырсыз.`,
  }[language];
}

const CATEGORY_TIP: Record<
  "vocabulary" | "grammar" | "writing" | "listening" | "reading",
  Record<FeedbackLanguage, string>
> = {
  vocabulary: {
    en: "Open Vocabulary and check Today's Word — it's picked at your current level, and gets harder as your accuracy improves. Writing your own example sentence and getting feedback is the fastest way to make a word stick.",
    ru: "Откройте раздел «Словарь» и посмотрите «Слово дня» — оно подобрано под ваш текущий уровень и усложняется по мере роста точности. Быстрее всего слово запоминается, если написать с ним своё предложение и получить обратную связь.",
    kz: "Сөздік бөлімін ашып, «Күн сөзін» қараңыз — ол сіздің қазіргі деңгейіңізге сай таңдалған және дәлдігіңіз артқан сайын қиындай түседі. Сөзді есте сақтаудың ең тез жолы — онымен өз сөйлеміңізді жазып, кері байланыс алу.",
  },
  grammar: {
    en: "Grammar mistakes show up clearest in your Writing feedback (particle, conjugation, and formality errors are each labeled) and in the reading skill breakdown. Paste a specific sentence you're unsure about and I can walk through it.",
    ru: "Грамматические ошибки лучше всего видны в обратной связи по Письму (там отдельно помечены ошибки в частицах, спряжении и вежливости) и в разборе навыков чтения. Пришлите конкретное предложение, в котором сомневаетесь, — разберём вместе.",
    kz: "Грамматикалық қателер Жазылым бойынша кері байланыста (жалғау, жіктелу және сыпайылық қателері бөлек белгіленеді) және оқылым дағдыларының талдауында анық көрінеді. Күмәнді нақты сөйлемді жіберіңіз — бірге қарастырайық.",
  },
  writing: {
    en: "For TOPIK II Writing: start from the expected structure shown above the editor for that task type, keep the formal 격식체 register throughout, and use the improved-version rewrite after each attempt to see exactly what changed and why.",
    ru: "Для письменной части TOPIK II: начните со структуры, показанной над полем ответа для этого типа задания, сохраняйте формальный регистр 격식체 на протяжении всего текста и после каждой попытки изучайте улучшенную версию — там видно, что и почему изменилось.",
    kz: "TOPIK II Жазылымы үшін: тапсырма түріне арналған өңдеу өрісінің үстінде көрсетілген құрылымнан бастаңыз, мәтін бойы ресми 격식체 регистрін сақтаңыз және әр әрекеттен кейін жақсартылған нұсқаны қарап, нені және неге өзгергенін көріңіз.",
  },
  listening: {
    en: "In Listening, try summarizing each recording's main point in one sentence right after it ends, before looking at the answer choices — that's usually what separates a close guess from a confident answer.",
    ru: "В Аудировании попробуйте сразу после прослушивания в одном предложении сформулировать главную мысль записи, прежде чем смотреть варианты ответа — это обычно и есть разница между случайной догадкой и уверенным ответом.",
    kz: "Тыңдалымда жазба аяқталғаннан кейін бірден, жауап нұсқаларын қарамай тұрып, оның негізгі ойын бір сөйлеммен қорытындылап көріңіз — көбіне сенімді жауап пен кездейсоқ болжамның айырмашылығы осында.",
  },
  reading: {
    en: "In Reading, slow down slightly on main-idea and inference questions specifically — they're usually where accuracy drops fastest when reading quickly. The Skill Breakdown on your results page shows exactly which question types to focus on.",
    ru: "В Чтении чуть замедлитесь именно на вопросах на главную мысль и на выводы (inference) — обычно точность падает быстрее всего именно на них при быстром чтении. В разделе «Разбор навыков» на странице результатов видно, на каких типах вопросов стоит сосредоточиться.",
    kz: "Оқылымда негізгі ой мен қорытынды жасау сұрақтарында сәл баяулаңыз — тез оқығанда дәлдік көбіне осы жерде түседі. Нәтижелер бетіндегі «Дағдылар талдауы» қай сұрақ түрлеріне назар аудару керектігін нақты көрсетеді.",
  },
};

const MOTIVATION: Record<FeedbackLanguage, string> = {
  en: "It's completely normal to feel that way while preparing for an exam like TOPIK — steady, smaller sessions beat occasional long ones. You don't have to fix everything today; picking one weak area and spending even 10-15 focused minutes on it counts as real progress.",
  ru: "Это совершенно нормально — так себя чувствовать при подготовке к экзамену вроде TOPIK. Регулярные короткие занятия эффективнее редких долгих. Не обязательно исправлять всё сразу — даже 10-15 сфокусированных минут на одном слабом месте уже реальный прогресс.",
  kz: "TOPIK сияқты емтиханға дайындалғанда осылай сезіну — өте қалыпты жағдай. Тұрақты қысқа сабақтар сирек ұзақ сабақтардан гөрі тиімдірек. Бәрін бірден түзетудің қажеті жоқ — тіпті бір әлсіз жерге арналған 10-15 минут та нақты прогресс болып саналады.",
};

function greetingLine(context: TopikBuddyContext, language: FeedbackLanguage): string {
  return {
    en: `Hi ${context.firstName}!`,
    ru: `Привет, ${context.firstName}!`,
    kz: `Сәлем, ${context.firstName}!`,
  }[language];
}

export function generateMockTopikBuddyReply(
  context: TopikBuddyContext,
  history: TopikBuddyMessage[],
  language: FeedbackLanguage
): string {
  const lastUserMessage = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  if (matches(lastUserMessage, language, "motivation")) {
    return `${greetingLine(context, language)} ${MOTIVATION[language]}\n\n${weakestSkillLine(context, language)}`;
  }

  if (matches(lastUserMessage, language, "studyToday")) {
    return `${levelLine(context, language)} ${daysLine(context, language)}\n\n${weakestSkillLine(context, language)}`;
  }

  for (const category of ["vocabulary", "grammar", "writing", "listening", "reading"] as const) {
    if (matches(lastUserMessage, language, category)) {
      return CATEGORY_TIP[category][language];
    }
  }

  return `${greetingLine(context, language)} ${levelLine(context, language)} ${daysLine(context, language)}\n\n${weakestSkillLine(context, language)}`;
}
