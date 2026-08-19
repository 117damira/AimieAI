import type {
  TopikLevel,
  FeedbackLanguage,
  TopikReadingDifficulty,
  TopikReadingPassage,
  TopikReadingQuestion,
  TopikReadingQuestionExplanation,
  TopikReadingQuestionOption,
  TopikReadingQuestionType,
  TopikReadingSkillTag,
  TopikReadingVocabularyItem,
} from "@/types/topik-reading";

/**
 * Offline fallback content bank for TOPIK Reading (읽기) — used whenever no
 * ANTHROPIC_API_KEY is configured, and ALWAYS for the Daily Challenge (see
 * lib/ai/topik-reading-generator.ts's file comment for why). Two original
 * passages per level, three questions per passage, each question fully
 * localized in en/ru/kz (prompt, options, hint, explanation). Every
 * passage is hand-written Korean, genuinely original — never a translation
 * of DELF French content and never copied from real official TOPIK test
 * material. Every explanation and evidence quote is grounded in the
 * passage actually written for it. Mirrors config/delf-reading-content.ts's
 * pattern and helper functions.
 *
 * Passage `title`/`textType` are stored once (not per-language), matching
 * the existing precedent in delf-reading-content.ts.
 */

const LANGS: FeedbackLanguage[] = ["en", "ru", "kz"];

interface QuestionContentSpec {
  prompt: string;
  options: TopikReadingQuestionOption[];
  hint: string;
  explanation: TopikReadingQuestionExplanation;
}

interface QuestionSpec {
  id: string;
  passageId: string;
  questionNumber: number;
  type: TopikReadingQuestionType;
  correctOptionIds: string[];
  difficulty: TopikReadingDifficulty;
  skillTag: TopikReadingSkillTag;
  /** Korean — an exact substring of the passage body. */
  evidenceQuote: string;
  content: Record<FeedbackLanguage, QuestionContentSpec>;
}

interface VocabularySpec {
  term: string; // Korean
  translation: Record<FeedbackLanguage, string>;
  definition: Record<FeedbackLanguage, string>;
  exampleSentence: string; // Korean
}

function buildQuestionSet(spec: QuestionSpec): Record<FeedbackLanguage, TopikReadingQuestion> {
  const out = {} as Record<FeedbackLanguage, TopikReadingQuestion>;
  for (const lang of LANGS) {
    const content = spec.content[lang];
    out[lang] = {
      id: spec.id,
      passageId: spec.passageId,
      questionNumber: spec.questionNumber,
      type: spec.type,
      prompt: content.prompt,
      options: content.options,
      correctOptionIds: spec.correctOptionIds,
      difficulty: spec.difficulty,
      skillTag: spec.skillTag,
      evidenceQuote: spec.evidenceQuote,
      hint: content.hint,
      explanation: content.explanation,
    };
  }
  return out;
}

function buildPassageQuestions(...specs: QuestionSpec[]): Record<FeedbackLanguage, TopikReadingQuestion[]> {
  const built = specs.map(buildQuestionSet);
  return {
    en: built.map((b) => b.en),
    ru: built.map((b) => b.ru),
    kz: built.map((b) => b.kz),
  };
}

function buildVocabulary(specs: VocabularySpec[]): Record<FeedbackLanguage, TopikReadingVocabularyItem[]> {
  const out = {} as Record<FeedbackLanguage, TopikReadingVocabularyItem[]>;
  for (const lang of LANGS) {
    out[lang] = specs.map((s) => ({
      term: s.term,
      translation: s.translation[lang],
      definition: s.definition[lang],
      exampleSentence: s.exampleSentence,
    }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Level 1 — 1급 Beginner I: greetings, family, daily routine, ~25-30 words.
// ---------------------------------------------------------------------------

const L1_SELF_INTRO: TopikReadingPassage = {
  id: "topik1-self-intro-1",
  textType: "Personal note",
  title: "Introducing myself",
  body: "안녕하세요. 저는 마리아입니다. 저는 학생입니다. 저는 스무 살입니다. 저는 서울에 삽니다. 저는 매일 아침 아홉 시에 학교에 갑니다. 저는 한국어를 배웁니다. 한국어는 재미있습니다. 저는 친구들과 같이 공부합니다. 우리는 도서관에서 만납니다.",
  estimatedWordCount: 30,
};

const l1IntroQ1: QuestionSpec = {
  id: "topik1-self-intro-1-q1",
  passageId: "topik1-self-intro-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "안녕하세요. 저는 마리아입니다.",
  content: {
    en: {
      prompt: "What is this text mainly about?",
      options: [
        { id: "opt-a", text: "A self-introduction" },
        { id: "opt-b", text: "A weather report" },
        { id: "opt-c", text: "A shopping list" },
        { id: "opt-d", text: "A job advertisement" },
      ],
      hint: "Look at how the writer talks about herself from the very first sentence.",
      explanation: {
        whereInText: "The whole text is written in first person, starting with \"저는 마리아입니다\" (I am Maria).",
        keywords: "저는, 마리아입니다",
        whyCorrect: "Every sentence gives a fact about the writer herself — her name, age, city, and studies — which is exactly what a self-introduction does.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "There is no mention of weather, temperature, or climate anywhere." },
          { optionId: "opt-c", reason: "No items or prices are listed — nothing about shopping appears." },
          { optionId: "opt-d", reason: "There is no job title, company, or hiring information in the text." },
        ],
        vocabulary: [{ term: "저는", translation: "I / as for me" }],
        grammarPattern: "\"저는 [noun]입니다\" is the basic self-introduction pattern — subject + 는 (topic marker) + noun + 입니다 (polite \"to be\").",
        strategy: "For short personal texts, check whether every sentence describes the same person — that's a strong sign the text is a self-introduction.",
      },
    },
    ru: {
      prompt: "О чём в основном этот текст?",
      options: [
        { id: "opt-a", text: "О самопредставлении" },
        { id: "opt-b", text: "О прогнозе погоды" },
        { id: "opt-c", text: "О списке покупок" },
        { id: "opt-d", text: "Об объявлении о работе" },
      ],
      hint: "Обратите внимание, как автор рассказывает о себе с самого первого предложения.",
      explanation: {
        whereInText: "Весь текст написан от первого лица, начиная с «저는 마리아입니다» (Я Мария).",
        keywords: "저는, 마리아입니다",
        whyCorrect: "Каждое предложение сообщает факт о самой писательнице — имя, возраст, город, учёбу — именно это и делает самопредставление.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Нигде не упоминается погода, температура или климат." },
          { optionId: "opt-c", reason: "Не перечислены товары или цены — о покупках ничего не сказано." },
          { optionId: "opt-d", reason: "В тексте нет ни должности, ни компании, ни информации о найме." },
        ],
        vocabulary: [{ term: "저는", translation: "я / что касается меня" }],
        grammarPattern: "«저는 [существительное]입니다» — базовая модель самопредставления: подлежащее + 는 (показатель темы) + существительное + 입니다 (вежливое «быть»).",
        strategy: "В коротких личных текстах проверьте, описывает ли каждое предложение одного и того же человека — это явный признак самопредставления.",
      },
    },
    kz: {
      prompt: "Бұл мәтін негізінен не туралы?",
      options: [
        { id: "opt-a", text: "Өзін таныстыру туралы" },
        { id: "opt-b", text: "Ауа райы болжамы туралы" },
        { id: "opt-c", text: "Сауда тізімі туралы" },
        { id: "opt-d", text: "Жұмыс хабарландыруы туралы" },
      ],
      hint: "Автордың бірінші сөйлемнен бастап өзі туралы қалай айтатынына назар аударыңыз.",
      explanation: {
        whereInText: "Бүкіл мәтін бірінші жақта жазылған, «저는 마리아입니다» (Мен Мариямын) деп басталады.",
        keywords: "저는, 마리아입니다",
        whyCorrect: "Әр сөйлем автордың өзі туралы факт береді — аты, жасы, қаласы, оқуы — бұл дәл өзін таныстыру.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Ауа райы, температура немесе климат туралы ешбір жерде айтылмайды." },
          { optionId: "opt-c", reason: "Тауарлар немесе бағалар тізілмеген — сауда туралы ештеңе жоқ." },
          { optionId: "opt-d", reason: "Мәтінде лауазым, компания немесе жалдау туралы ақпарат жоқ." },
        ],
        vocabulary: [{ term: "저는", translation: "мен / маған келсек" }],
        grammarPattern: "«저는 [зат есім]입니다» — өзін таныстырудың негізгі үлгісі: бастауыш + 는 (тақырып жалғауы) + зат есім + 입니다 (сыпайы «болу»).",
        strategy: "Қысқа жеке мәтіндерде әр сөйлем бір адам туралы ма — соны тексеріңіз, бұл өзін таныстырудың айқын белгісі.",
      },
    },
  },
};

const l1IntroQ2: QuestionSpec = {
  id: "topik1-self-intro-1-q2",
  passageId: "topik1-self-intro-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "detail",
  evidenceQuote: "저는 매일 아침 아홉 시에 학교에 갑니다.",
  content: {
    en: {
      prompt: "What time does Maria go to school?",
      options: [
        { id: "opt-a", text: "8 o'clock" },
        { id: "opt-b", text: "9 o'clock" },
        { id: "opt-c", text: "10 o'clock" },
        { id: "opt-d", text: "11 o'clock" },
      ],
      hint: "The exact hour appears right after she describes her morning routine.",
      explanation: {
        whereInText: "\"저는 매일 아침 아홉 시에 학교에 갑니다\" (I go to school at 9 o'clock every morning).",
        keywords: "아홉 시",
        whyCorrect: "\"아홉 시\" is the native Korean number for 9 o'clock, matching exactly what the sentence states.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "8 o'clock (여덟 시) never appears in the text." },
          { optionId: "opt-c", reason: "10 o'clock (열 시) is not mentioned anywhere." },
          { optionId: "opt-d", reason: "11 o'clock (열한 시) is not stated in the passage." },
        ],
        vocabulary: [{ term: "아홉 시", translation: "9 o'clock" }],
        grammarPattern: "Korean has two number systems: native Korean numbers (하나, 둘, 셋...) are used for counting hours (아홉 시 = 9 o'clock), while Sino-Korean numbers are used for minutes.",
        strategy: "When a question asks about time, scan the text for the native Korean number + 시 (o'clock) pattern — it's the single clearest signal.",
      },
    },
    ru: {
      prompt: "Во сколько Мария идёт в школу?",
      options: [
        { id: "opt-a", text: "В 8 часов" },
        { id: "opt-b", text: "В 9 часов" },
        { id: "opt-c", text: "В 10 часов" },
        { id: "opt-d", text: "В 11 часов" },
      ],
      hint: "Точный час указан сразу после описания утреннего распорядка.",
      explanation: {
        whereInText: "«저는 매일 아침 아홉 시에 학교에 갑니다» (Я хожу в школу в 9 часов каждое утро).",
        keywords: "아홉 시",
        whyCorrect: "«아홉 시» — исконно корейское числительное для 9 часов, что точно совпадает с текстом.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "8 часов (여덟 시) в тексте не встречается." },
          { optionId: "opt-c", reason: "10 часов (열 시) нигде не упоминается." },
          { optionId: "opt-d", reason: "11 часов (열한 시) в тексте не указано." },
        ],
        vocabulary: [{ term: "아홉 시", translation: "9 часов" }],
        grammarPattern: "В корейском есть две системы чисел: исконно корейские числа (하나, 둘, 셋...) используются для часов (아홉 시 = 9 часов), а китайско-корейские — для минут.",
        strategy: "Когда вопрос о времени, ищите в тексте сочетание «исконно корейское число + 시» (час) — это самый явный сигнал.",
      },
    },
    kz: {
      prompt: "Мария мектепке неше сағатта барады?",
      options: [
        { id: "opt-a", text: "Сағат 8-де" },
        { id: "opt-b", text: "Сағат 9-да" },
        { id: "opt-c", text: "Сағат 10-да" },
        { id: "opt-d", text: "Сағат 11-де" },
      ],
      hint: "Нақты сағат таңғы тәртібін сипаттағаннан кейін бірден келтіріледі.",
      explanation: {
        whereInText: "«저는 매일 아침 아홉 시에 학교에 갑니다» (Мен күн сайын таңертең сағат 9-да мектепке барамын).",
        keywords: "아홉 시",
        whyCorrect: "«아홉 시» — 9 сағатты білдіретін таза корей сан есімі, бұл сөйлеммен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Сағат 8 (여덟 시) мәтінде мүлде жоқ." },
          { optionId: "opt-c", reason: "Сағат 10 (열 시) ешбір жерде аталмаған." },
          { optionId: "opt-d", reason: "Сағат 11 (열한 시) мәтінде көрсетілмеген." },
        ],
        vocabulary: [{ term: "아홉 시", translation: "сағат 9" }],
        grammarPattern: "Корей тілінде екі сан жүйесі бар: таза корей сандары (하나, 둘, 셋...) сағатты санауға (아홉 시 = сағат 9), ал қытай-корей сандары минутқа қолданылады.",
        strategy: "Уақыт туралы сұрақта мәтіннен «таза корей саны + 시» (сағат) тіркесін іздеңіз — бұл ең анық белгі.",
      },
    },
  },
};

const l1IntroQ3: QuestionSpec = {
  id: "topik1-self-intro-1-q3",
  passageId: "topik1-self-intro-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "vocabGrammar",
  evidenceQuote: "저는 친구들과 같이 공부합니다.",
  content: {
    en: {
      prompt: "Choose the word that correctly fills the blank: 저는 친구들과 ___ 공부합니다.",
      options: [
        { id: "opt-a", text: "같이 (together)" },
        { id: "opt-b", text: "먼저 (first)" },
        { id: "opt-c", text: "아직 (yet)" },
        { id: "opt-d", text: "벌써 (already)" },
      ],
      hint: "Think about what makes sense between \"with friends\" and \"study\" — how are they studying?",
      explanation: {
        whereInText: "\"저는 친구들과 같이 공부합니다\" (I study together with my friends).",
        keywords: "같이",
        whyCorrect: "\"같이\" means \"together\" and fits naturally between \"친구들과\" (with friends) and \"공부합니다\" (study) to describe studying together.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "\"먼저\" (first) doesn't fit — the sentence isn't describing a sequence of actions." },
          { optionId: "opt-c", reason: "\"아직\" (yet/still) requires a negative context, which this sentence doesn't have." },
          { optionId: "opt-d", reason: "\"벌써\" (already) implies something happened sooner than expected, which isn't the meaning here." },
        ],
        vocabulary: [{ term: "같이", translation: "together" }],
        grammarPattern: "\"같이\" is an adverb placed before the verb it modifies, common in beginner-level sentences describing joint actions.",
        strategy: "For fill-in-the-blank vocabulary questions, read the whole sentence first, then test each option by saying the sentence with it in your head.",
      },
    },
    ru: {
      prompt: "Выберите слово, которое правильно заполняет пропуск: 저는 친구들과 ___ 공부합니다.",
      options: [
        { id: "opt-a", text: "같이 (вместе)" },
        { id: "opt-b", text: "먼저 (сначала)" },
        { id: "opt-c", text: "아직 (ещё)" },
        { id: "opt-d", text: "벌써 (уже)" },
      ],
      hint: "Подумайте, что логично между «с друзьями» и «учиться» — как именно они учатся?",
      explanation: {
        whereInText: "«저는 친구들과 같이 공부합니다» (Я учусь вместе с друзьями).",
        keywords: "같이",
        whyCorrect: "«같이» означает «вместе» и естественно вписывается между «친구들과» (с друзьями) и «공부합니다» (учусь), описывая совместную учёбу.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "«먼저» (сначала) не подходит — предложение не описывает последовательность действий." },
          { optionId: "opt-c", reason: "«아직» (ещё) требует отрицательного контекста, которого здесь нет." },
          { optionId: "opt-d", reason: "«벌써» (уже) подразумевает, что что-то произошло раньше ожидаемого — это не подходит по смыслу." },
        ],
        vocabulary: [{ term: "같이", translation: "вместе" }],
        grammarPattern: "«같이» — наречие, ставится перед глаголом, который оно определяет; часто встречается в предложениях начального уровня о совместных действиях.",
        strategy: "В вопросах на заполнение пропуска сначала прочитайте всё предложение, затем мысленно проверьте каждый вариант, подставив его в предложение.",
      },
    },
    kz: {
      prompt: "Бос орынды дұрыс толтыратын сөзді таңдаңыз: 저는 친구들과 ___ 공부합니다.",
      options: [
        { id: "opt-a", text: "같이 (бірге)" },
        { id: "opt-b", text: "먼저 (алдымен)" },
        { id: "opt-c", text: "아직 (әлі)" },
        { id: "opt-d", text: "벌써 (қазірдің өзінде)" },
      ],
      hint: "«достарымен» мен «оқу» арасында не логикалы екенін ойланыңыз — олар қалай оқиды?",
      explanation: {
        whereInText: "«저는 친구들과 같이 공부합니다» (Мен достарыммен бірге оқимын).",
        keywords: "같이",
        whyCorrect: "«같이» «бірге» дегенді білдіреді және «친구들과» (достарымен) мен «공부합니다» (оқимын) арасына бірге оқуды сипаттау үшін дәл келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "«먼저» (алдымен) сәйкес келмейді — сөйлем әрекеттер ретін сипаттамайды." },
          { optionId: "opt-c", reason: "«아직» (әлі) теріс мағыналы контекстті қажет етеді, ол мұнда жоқ." },
          { optionId: "opt-d", reason: "«벌써» (қазірдің өзінде) күтілгеннен ертерек болғанын білдіреді, бұл мұнда сәйкес келмейді." },
        ],
        vocabulary: [{ term: "같이", translation: "бірге" }],
        grammarPattern: "«같이» — етістіктің алдына қойылатын үстеу, бастауыш деңгейдегі бірлескен әрекеттерді сипаттайтын сөйлемдерде жиі кездеседі.",
        strategy: "Бос орынды толтыру сұрақтарында алдымен бүкіл сөйлемді оқыңыз, содан кейін әр нұсқаны ойша сөйлемге қойып көріңіз.",
      },
    },
  },
};

const L1_INTRO_VOCAB: VocabularySpec[] = [
  {
    term: "학생",
    translation: { en: "student", ru: "студент/ученик", kz: "оқушы/студент" },
    definition: {
      en: "A person who is studying, typically at a school or university.",
      ru: "Человек, который учится, обычно в школе или университете.",
      kz: "Мектепте немесе университетте оқитын адам.",
    },
    exampleSentence: "저는 학생입니다.",
  },
  {
    term: "매일",
    translation: { en: "every day", ru: "каждый день", kz: "күн сайын" },
    definition: {
      en: "Happening on every single day, without exception.",
      ru: "Происходящее каждый день без исключения.",
      kz: "Ерекшесіз әр күні болатын.",
    },
    exampleSentence: "저는 매일 아침 아홉 시에 학교에 갑니다.",
  },
  {
    term: "도서관",
    translation: { en: "library", ru: "библиотека", kz: "кітапхана" },
    definition: {
      en: "A place where books are kept and people can study.",
      ru: "Место, где хранятся книги и можно учиться.",
      kz: "Кітаптар сақталатын және оқуға болатын орын.",
    },
    exampleSentence: "우리는 도서관에서 만납니다.",
  },
  {
    term: "친구",
    translation: { en: "friend", ru: "друг", kz: "дос" },
    definition: {
      en: "A person one knows well and likes.",
      ru: "Человек, которого хорошо знаешь и любишь.",
      kz: "Жақсы білетін және жақсы көретін адам.",
    },
    exampleSentence: "저는 친구들과 같이 공부합니다.",
  },
];

const L1_STORE_NOTICE: TopikReadingPassage = {
  id: "topik1-store-notice-1",
  textType: "Notice",
  title: "Convenience store hours",
  body: "편의점 안내\n\n평일: 오전 7시 – 오후 11시\n주말: 오전 8시 – 오후 10시\n\n공휴일에는 오후 9시에 문을 닫습니다. 컵라면과 김밥이 있습니다. 화장실은 없습니다. 감사합니다.",
  estimatedWordCount: 25,
};

const l1StoreQ1: QuestionSpec = {
  id: "topik1-store-notice-1-q1",
  passageId: "topik1-store-notice-1",
  questionNumber: 1,
  type: "matching",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "편의점 안내",
  content: {
    en: {
      prompt: "What is this notice about?",
      options: [
        { id: "opt-a", text: "Store opening hours" },
        { id: "opt-b", text: "A job posting" },
        { id: "opt-c", text: "A bus schedule" },
        { id: "opt-d", text: "A recipe" },
      ],
      hint: "The title tells you exactly what kind of information follows.",
      explanation: {
        whereInText: "The title \"편의점 안내\" (convenience store information), followed by lists of opening times.",
        keywords: "편의점 안내",
        whyCorrect: "\"안내\" means \"information/notice\", and every line after the title lists opening hours for the store.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "No hiring, salary, or position information appears anywhere." },
          { optionId: "opt-c", reason: "There is no mention of buses, routes, or stops." },
          { optionId: "opt-d", reason: "No cooking steps or ingredients are listed." },
        ],
        vocabulary: [{ term: "안내", translation: "notice / information" }],
        grammarPattern: "Notices often use a title + list format with no full sentences — the title alone usually names the whole topic.",
        strategy: "For short official notices, always read the title first — it names the topic before you even reach the details.",
      },
    },
    ru: {
      prompt: "О чём это объявление?",
      options: [
        { id: "opt-a", text: "О часах работы магазина" },
        { id: "opt-b", text: "О вакансии" },
        { id: "opt-c", text: "О расписании автобусов" },
        { id: "opt-d", text: "О рецепте" },
      ],
      hint: "Заголовок сразу говорит, о какой информации пойдёт речь.",
      explanation: {
        whereInText: "Заголовок «편의점 안내» (информация о магазине), далее списки часов работы.",
        keywords: "편의점 안내",
        whyCorrect: "«안내» значит «объявление/информация», и каждая строка после заголовка перечисляет часы работы магазина.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Нигде нет информации о найме, зарплате или должности." },
          { optionId: "opt-c", reason: "Нет упоминания автобусов, маршрутов или остановок." },
          { optionId: "opt-d", reason: "Не перечислены шаги приготовления или ингредиенты." },
        ],
        vocabulary: [{ term: "안내", translation: "объявление / информация" }],
        grammarPattern: "Объявления часто строятся как заголовок + список без полных предложений — заголовок обычно называет всю тему.",
        strategy: "В коротких официальных объявлениях всегда сначала читайте заголовок — он называет тему ещё до деталей.",
      },
    },
    kz: {
      prompt: "Бұл хабарландыру не туралы?",
      options: [
        { id: "opt-a", text: "Дүкеннің жұмыс уақыты туралы" },
        { id: "opt-b", text: "Жұмыс орны туралы" },
        { id: "opt-c", text: "Автобус кестесі туралы" },
        { id: "opt-d", text: "Рецепт туралы" },
      ],
      hint: "Тақырып сізге қандай ақпарат берілетінін бірден айтады.",
      explanation: {
        whereInText: "Тақырып «편의점 안내» (дүкен туралы ақпарат), одан кейін жұмыс уақыттарының тізімдері.",
        keywords: "편의점 안내",
        whyCorrect: "«안내» «хабарландыру/ақпарат» дегенді білдіреді, тақырыптан кейінгі әрбір жол дүкеннің жұмыс уақытын тізеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Жалдау, жалақы немесе лауазым туралы ешбір жерде ақпарат жоқ." },
          { optionId: "opt-c", reason: "Автобус, бағыт немесе аялдама туралы айтылмайды." },
          { optionId: "opt-d", reason: "Дайындау қадамдары немесе құрамдастар тізілмеген." },
        ],
        vocabulary: [{ term: "안내", translation: "хабарландыру / ақпарат" }],
        grammarPattern: "Хабарландырулар көбіне толық сөйлемсіз, тақырып + тізім түрінде беріледі — тақырыптың өзі бүкіл тақырыпты атайды.",
        strategy: "Қысқа ресми хабарландыруларда әрқашан алдымен тақырыпты оқыңыз — ол детальдерге жеткенше тақырыпты атайды.",
      },
    },
  },
};

const l1StoreQ2: QuestionSpec = {
  id: "topik1-store-notice-1-q2",
  passageId: "topik1-store-notice-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "detail",
  evidenceQuote: "평일: 오전 7시 – 오후 11시",
  content: {
    en: {
      prompt: "What time does the store close on weekdays?",
      options: [
        { id: "opt-a", text: "9 o'clock" },
        { id: "opt-b", text: "10 o'clock" },
        { id: "opt-c", text: "11 o'clock" },
        { id: "opt-d", text: "12 o'clock" },
      ],
      hint: "Weekdays have their own separate line — don't confuse it with the weekend hours.",
      explanation: {
        whereInText: "\"평일: 오전 7시 – 오후 11시\" (Weekdays: 7am – 11pm).",
        keywords: "평일",
        whyCorrect: "The weekday line lists \"오후 11시\" (11pm) as the closing time.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "9 o'clock is not the weekday closing time in the notice." },
          { optionId: "opt-b", reason: "10 o'clock is the weekend (주말) closing time, not the weekday one." },
          { optionId: "opt-d", reason: "12 o'clock never appears anywhere in the notice." },
        ],
        vocabulary: [{ term: "평일", translation: "weekday" }],
        grammarPattern: "The dash between two times (\"오전 7시 – 오후 11시\") marks an opening-to-closing range.",
        strategy: "When a text lists different hours for different day types, match the exact category named in the question to its own line — don't mix them up.",
      },
    },
    ru: {
      prompt: "Во сколько магазин закрывается в будние дни?",
      options: [
        { id: "opt-a", text: "В 9 часов" },
        { id: "opt-b", text: "В 10 часов" },
        { id: "opt-c", text: "В 11 часов" },
        { id: "opt-d", text: "В 12 часов" },
      ],
      hint: "У будних дней отдельная строка — не путайте её с часами выходных.",
      explanation: {
        whereInText: "«평일: 오전 7시 – 오후 11시» (будни: 7:00 – 23:00).",
        keywords: "평일",
        whyCorrect: "В строке про будние дни указано время закрытия «오후 11시» (23:00).",
        whyIncorrect: [
          { optionId: "opt-a", reason: "9 часов не является временем закрытия в будни по объявлению." },
          { optionId: "opt-b", reason: "10 часов — время закрытия в выходные (주말), а не в будни." },
          { optionId: "opt-d", reason: "12 часов нигде в объявлении не встречается." },
        ],
        vocabulary: [{ term: "평일", translation: "будний день" }],
        grammarPattern: "Тире между двумя временами («오전 7시 – 오후 11시») обозначает диапазон от открытия до закрытия.",
        strategy: "Когда в тексте перечислены разные часы для разных типов дней, сопоставляйте именно ту категорию, что названа в вопросе, с её собственной строкой.",
      },
    },
    kz: {
      prompt: "Дүкен апта күндері неше сағатта жабылады?",
      options: [
        { id: "opt-a", text: "Сағат 9-да" },
        { id: "opt-b", text: "Сағат 10-да" },
        { id: "opt-c", text: "Сағат 11-де" },
        { id: "opt-d", text: "Сағат 12-де" },
      ],
      hint: "Апта күндерінің өз жолы бар — оны демалыс күндерінің уақытымен шатастырмаңыз.",
      explanation: {
        whereInText: "«평일: 오전 7시 – 오후 11시» (апта күндері: 07:00 – 23:00).",
        keywords: "평일",
        whyCorrect: "Апта күндері жолында жабылу уақыты «오후 11시» (23:00) көрсетілген.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Сағат 9 хабарландыру бойынша апта күндерінің жабылу уақыты емес." },
          { optionId: "opt-b", reason: "Сағат 10 — демалыс күндерінің (주말) жабылу уақыты, апта күндерінікі емес." },
          { optionId: "opt-d", reason: "Сағат 12 хабарландыруда мүлде жоқ." },
        ],
        vocabulary: [{ term: "평일", translation: "апта күні" }],
        grammarPattern: "Екі уақыт арасындағы сызықша («오전 7시 – 오후 11시») ашылудан жабылуға дейінгі аралықты білдіреді.",
        strategy: "Мәтінде әр түрлі күн түрлеріне әр түрлі уақыт көрсетілгенде, сұрақта аталған санатты дәл сол жолмен салыстырыңыз.",
      },
    },
  },
};

const l1StoreQ3: QuestionSpec = {
  id: "topik1-store-notice-1-q3",
  passageId: "topik1-store-notice-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "correctStatement",
  evidenceQuote: "공휴일에는 오후 9시에 문을 닫습니다.",
  content: {
    en: {
      prompt: "Which statement is correct according to the notice?",
      options: [
        { id: "opt-a", text: "This store has a restroom." },
        { id: "opt-b", text: "On public holidays, it closes at 9pm." },
        { id: "opt-c", text: "It opens at 7am on weekends." },
        { id: "opt-d", text: "You can buy clothes here." },
      ],
      hint: "Check every option against the notice one at a time — three of them contradict a specific line.",
      explanation: {
        whereInText: "\"공휴일에는 오후 9시에 문을 닫습니다\" (On public holidays, it closes at 9pm).",
        keywords: "공휴일에는 오후 9시에",
        whyCorrect: "This statement matches the notice's holiday line exactly.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The notice explicitly says \"화장실은 없습니다\" (there is no restroom)." },
          { optionId: "opt-c", reason: "The notice states the weekend opens at 8am (오전 8시), not 7am." },
          { optionId: "opt-d", reason: "The notice only mentions instant noodles (컵라면) and gimbap (김밥) — nothing about clothes." },
        ],
        vocabulary: [{ term: "공휴일", translation: "public holiday" }],
        grammarPattern: "\"에는\" combines the time marker 에 with the topic marker 는 to single out \"on holidays\" specifically, contrasting it with the other schedules.",
        strategy: "For \"which statement is correct\" questions, eliminate options that directly contradict a specific detail rather than guessing which one sounds right.",
      },
    },
    ru: {
      prompt: "Какое утверждение верно согласно объявлению?",
      options: [
        { id: "opt-a", text: "В этом магазине есть туалет." },
        { id: "opt-b", text: "В праздничные дни он закрывается в 21:00." },
        { id: "opt-c", text: "Он открывается в 7 утра по выходным." },
        { id: "opt-d", text: "Здесь можно купить одежду." },
      ],
      hint: "Проверьте каждый вариант по объявлению по очереди — три из них противоречат конкретной строке.",
      explanation: {
        whereInText: "«공휴일에는 오후 9시에 문을 닫습니다» (В праздничные дни закрывается в 21:00).",
        keywords: "공휴일에는 오후 9시에",
        whyCorrect: "Это утверждение точно совпадает со строкой объявления о праздничных днях.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "В объявлении прямо сказано «화장실은 없습니다» (туалета нет)." },
          { optionId: "opt-c", reason: "В объявлении указано, что по выходным открытие в 8 утра (오전 8시), а не в 7." },
          { optionId: "opt-d", reason: "В объявлении упоминаются только лапша быстрого приготовления (컵라면) и кимбап (김밥) — об одежде ничего нет." },
        ],
        vocabulary: [{ term: "공휴일", translation: "праздничный день" }],
        grammarPattern: "«에는» объединяет показатель времени 에 с показателем темы 는, чтобы особо выделить «в праздники», противопоставляя их другому расписанию.",
        strategy: "В вопросах «какое утверждение верно» исключайте варианты, прямо противоречащие конкретной детали, вместо того чтобы угадывать, какой звучит правдоподобно.",
      },
    },
    kz: {
      prompt: "Хабарландыруға сәйкес қай тұжырым дұрыс?",
      options: [
        { id: "opt-a", text: "Бұл дүкенде дәретхана бар." },
        { id: "opt-b", text: "Мереке күндері сағат 21:00-де жабылады." },
        { id: "opt-c", text: "Демалыс күндері сағат 7:00-де ашылады." },
        { id: "opt-d", text: "Бұдан киім сатып алуға болады." },
      ],
      hint: "Әр нұсқаны хабарландырумен кезек-кезек салыстырыңыз — үшеуі нақты жолға қайшы келеді.",
      explanation: {
        whereInText: "«공휴일에는 오후 9시에 문을 닫습니다» (Мереке күндері сағат 21:00-де жабылады).",
        keywords: "공휴일에는 오후 9시에",
        whyCorrect: "Бұл тұжырым хабарландырудың мереке күндері туралы жолымен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Хабарландыруда тікелей «화장실은 없습니다» (дәретхана жоқ) делінген." },
          { optionId: "opt-c", reason: "Хабарландыруда демалыс күндері сағат 8:00-де (오전 8시) ашылатыны көрсетілген, 7:00 емес." },
          { optionId: "opt-d", reason: "Хабарландыруда тек лапша (컵라면) мен кимбап (김밥) аталған — киім туралы ештеңе жоқ." },
        ],
        vocabulary: [{ term: "공휴일", translation: "мереке күні" }],
        grammarPattern: "«에는» уақыт жалғауы 에 мен тақырып жалғауы 는-ді біріктіріп, «мереке күндерін» басқа кестелермен қарама-қарсы қойып, ерекше бөліп көрсетеді.",
        strategy: "«Қай тұжырым дұрыс» сұрақтарында қай нұсқа сенімді көрінетінін болжамай, нақты детальге тікелей қайшы келетін нұсқаларды алып тастаңыз.",
      },
    },
  },
};

const L1_STORE_VOCAB: VocabularySpec[] = [
  {
    term: "평일",
    translation: { en: "weekday", ru: "будний день", kz: "апта күні" },
    definition: {
      en: "Any day from Monday to Friday.",
      ru: "Любой день с понедельника по пятницу.",
      kz: "Дүйсенбіден жұмаға дейінгі кез келген күн.",
    },
    exampleSentence: "평일: 오전 7시 – 오후 11시",
  },
  {
    term: "주말",
    translation: { en: "weekend", ru: "выходные", kz: "демалыс күндері" },
    definition: {
      en: "Saturday and Sunday.",
      ru: "Суббота и воскресенье.",
      kz: "Сенбі мен жексенбі.",
    },
    exampleSentence: "주말: 오전 8시 – 오후 10시",
  },
  {
    term: "공휴일",
    translation: { en: "public holiday", ru: "праздничный день", kz: "мереке күні" },
    definition: {
      en: "An official day off recognized nationally.",
      ru: "Официальный нерабочий день, признанный на государственном уровне.",
      kz: "Мемлекеттік деңгейде танылған ресми демалыс күні.",
    },
    exampleSentence: "공휴일에는 오후 9시에 문을 닫습니다.",
  },
];

export const TOPIK_LEVEL_1_PASSAGES: TopikReadingPassage[] = [L1_SELF_INTRO, L1_STORE_NOTICE];
export const TOPIK_LEVEL_1_QUESTIONS: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  "topik1-self-intro-1": buildPassageQuestions(l1IntroQ1, l1IntroQ2, l1IntroQ3),
  "topik1-store-notice-1": buildPassageQuestions(l1StoreQ1, l1StoreQ2, l1StoreQ3),
};
export const TOPIK_LEVEL_1_VOCAB: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  "topik1-self-intro-1": buildVocabulary(L1_INTRO_VOCAB),
  "topik1-store-notice-1": buildVocabulary(L1_STORE_VOCAB),
};

// ---------------------------------------------------------------------------
// Level 2 — 2급 Beginner II: past tense, daily plans, requests, ~45-55 words.
// ---------------------------------------------------------------------------

const L2_WEEKEND_DIARY: TopikReadingPassage = {
  id: "topik2-weekend-diary-1",
  textType: "Diary entry",
  title: "My weekend at Han River park",
  body: "지난 토요일에 저는 친구 수진 씨와 한강공원에 갔습니다. 날씨가 아주 좋았습니다. 우리는 자전거를 타고 공원을 한 바퀴 돌았습니다. 그다음에 편의점에서 김밥과 라면을 사서 같이 먹었습니다. 오후에는 사람이 너무 많아서 조금 불편했습니다. 저녁에 비가 오기 시작해서 우리는 집으로 일찍 돌아갔습니다. 그래도 정말 즐거운 하루였습니다. 다음 주말에는 수진 씨와 영화를 보러 갈 계획입니다.",
  estimatedWordCount: 55,
};

const l2DiaryQ1: QuestionSpec = {
  id: "topik2-weekend-diary-1-q1",
  passageId: "topik2-weekend-diary-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "지난 토요일에 저는 친구 수진 씨와 한강공원에 갔습니다.",
  content: {
    en: {
      prompt: "What is this diary entry mainly about?",
      options: [
        { id: "opt-a", text: "A weekend outing with a friend" },
        { id: "opt-b", text: "A job interview" },
        { id: "opt-c", text: "A cooking class" },
        { id: "opt-d", text: "A doctor's appointment" },
      ],
      hint: "The first sentence names who the writer went with and where.",
      explanation: {
        whereInText: "\"지난 토요일에 저는 친구 수진 씨와 한강공원에 갔습니다\" (Last Saturday I went to Han River park with my friend Sujin).",
        keywords: "친구 수진 씨와 한강공원",
        whyCorrect: "The whole entry describes a day spent with a friend at a park — cycling, eating, and the weather — a classic weekend outing.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "There is no mention of a company, a résumé, or an interview." },
          { optionId: "opt-c", reason: "Buying and eating gimbap is mentioned, but no cooking or class is described." },
          { optionId: "opt-d", reason: "Nothing about health, a clinic, or a doctor appears anywhere." },
        ],
        vocabulary: [{ term: "지난 토요일", translation: "last Saturday" }],
        grammarPattern: "\"지난 [day]에\" (last [day]) + past tense verb (갔습니다) marks a completed past event — a strong signal this is a personal recount.",
        strategy: "In diary entries, the opening sentence almost always names the who/where/when — read it carefully before anything else.",
      },
    },
    ru: {
      prompt: "О чём в основном эта запись в дневнике?",
      options: [
        { id: "opt-a", text: "О прогулке на выходных с другом" },
        { id: "opt-b", text: "О собеседовании на работу" },
        { id: "opt-c", text: "О кулинарных курсах" },
        { id: "opt-d", text: "О приёме у врача" },
      ],
      hint: "Первое предложение называет, с кем и куда пошёл автор.",
      explanation: {
        whereInText: "«지난 토요일에 저는 친구 수진 씨와 한강공원에 갔습니다» (В прошлую субботу я пошла в парк на реке Хан с подругой Суджин).",
        keywords: "친구 수진 씨와 한강공원",
        whyCorrect: "Вся запись описывает день, проведённый с подругой в парке — велосипед, еда, погода — классическая прогулка на выходных.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Нет упоминания компании, резюме или собеседования." },
          { optionId: "opt-c", reason: "Покупка и еда кимбапа упоминаются, но занятия готовкой не описаны." },
          { optionId: "opt-d", reason: "Нигде не упоминается здоровье, клиника или врач." },
        ],
        vocabulary: [{ term: "지난 토요일", translation: "прошлая суббота" }],
        grammarPattern: "«지난 [день]에» (в прошлый [день]) + глагол прошедшего времени (갔습니다) обозначает завершённое событие в прошлом — явный признак личного рассказа.",
        strategy: "В дневниковых записях первое предложение почти всегда называет кто/куда/когда — читайте его внимательно в первую очередь.",
      },
    },
    kz: {
      prompt: "Бұл күнделік жазбасы негізінен не туралы?",
      options: [
        { id: "opt-a", text: "Достың демалыс күндеріндегі серуені туралы" },
        { id: "opt-b", text: "Жұмысқа сұхбат туралы" },
        { id: "opt-c", text: "Аспаздық курс туралы" },
        { id: "opt-d", text: "Дәрігерге қаралу туралы" },
      ],
      hint: "Бірінші сөйлем автордың кіммен және қайда барғанын атайды.",
      explanation: {
        whereInText: "«지난 토요일에 저는 친구 수진 씨와 한강공원에 갔습니다» (Өткен сенбіде мен досым Суджинмен Хан өзені паркіне бардым).",
        keywords: "친구 수진 씨와 한강공원",
        whyCorrect: "Бүкіл жазба досымен паркте өткізген күнді сипаттайды — велосипед, тамақ, ауа райы — бұл классикалық демалыс серуені.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Компания, түйіндеме немесе сұхбат туралы айтылмайды." },
          { optionId: "opt-c", reason: "Кимбап сатып алу мен жеу аталады, бірақ аспаздық сабақ сипатталмаған." },
          { optionId: "opt-d", reason: "Денсаулық, клиника немесе дәрігер туралы ешбір жерде айтылмайды." },
        ],
        vocabulary: [{ term: "지난 토요일", translation: "өткен сенбі" }],
        grammarPattern: "«지난 [күн]에» (өткен [күн]) + өткен шақ етістігі (갔습니다) аяқталған өткен оқиғаны білдіреді — бұл жеке әңгіме екенінің айқын белгісі.",
        strategy: "Күнделік жазбаларында бірінші сөйлем әдетте кім/қайда/қашан екенін атайды — оны алдымен мұқият оқыңыз.",
      },
    },
  },
};

const l2DiaryQ2: QuestionSpec = {
  id: "topik2-weekend-diary-1-q2",
  passageId: "topik2-weekend-diary-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "저녁에 비가 오기 시작해서 우리는 집으로 일찍 돌아갔습니다.",
  content: {
    en: {
      prompt: "Why did they go home early?",
      options: [
        { id: "opt-a", text: "It started to rain" },
        { id: "opt-b", text: "They were tired" },
        { id: "opt-c", text: "The park closed" },
        { id: "opt-d", text: "They missed the bus" },
      ],
      hint: "The reason appears right before the mention of going home early.",
      explanation: {
        whereInText: "\"저녁에 비가 오기 시작해서 우리는 집으로 일찍 돌아갔습니다\" (In the evening it started to rain, so we went home early).",
        keywords: "비가 오기 시작해서",
        whyCorrect: "\"-아서/어서\" (because) directly connects \"it started to rain\" to the result \"went home early\".",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Tiredness is never mentioned anywhere in the diary entry." },
          { optionId: "opt-c", reason: "There is no mention of the park closing." },
          { optionId: "opt-d", reason: "Buses are never mentioned — they went by bicycle." },
        ],
        vocabulary: [{ term: "비가 오다", translation: "to rain" }],
        grammarPattern: "\"-아서/어서\" attaches to a verb stem to mean \"because/so\", linking a cause directly to its result within one sentence.",
        strategy: "For \"why\" questions, look for a connector like -아서/어서 or 그래서 near the event mentioned in the question — the cause is usually right next to it.",
      },
    },
    ru: {
      prompt: "Почему они рано вернулись домой?",
      options: [
        { id: "opt-a", text: "Начался дождь" },
        { id: "opt-b", text: "Они устали" },
        { id: "opt-c", text: "Парк закрылся" },
        { id: "opt-d", text: "Они опоздали на автобус" },
      ],
      hint: "Причина указана прямо перед упоминанием раннего возвращения домой.",
      explanation: {
        whereInText: "«저녁에 비가 오기 시작해서 우리는 집으로 일찍 돌아갔습니다» (Вечером начался дождь, поэтому мы рано вернулись домой).",
        keywords: "비가 오기 시작해서",
        whyCorrect: "«-아서/어서» (потому что) напрямую связывает «начался дождь» с результатом «рано вернулись домой».",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Об усталости в записи нигде не упоминается." },
          { optionId: "opt-c", reason: "О закрытии парка ничего не сказано." },
          { optionId: "opt-d", reason: "Об автобусах речи нет — они ехали на велосипедах." },
        ],
        vocabulary: [{ term: "비가 오다", translation: "идти дождю" }],
        grammarPattern: "«-아서/어서» присоединяется к основе глагола со значением «потому что/поэтому», напрямую связывая причину с результатом в одном предложении.",
        strategy: "В вопросах «почему» ищите связку вроде -아서/어서 или 그래서 рядом с событием из вопроса — причина обычно находится прямо рядом.",
      },
    },
    kz: {
      prompt: "Олар неге үйге ерте қайтты?",
      options: [
        { id: "opt-a", text: "Жаңбыр жауа бастады" },
        { id: "opt-b", text: "Олар шаршады" },
        { id: "opt-c", text: "Парк жабылды" },
        { id: "opt-d", text: "Олар автобусқа кешікті" },
      ],
      hint: "Себебі үйге ерте қайту туралы айтылардың алдында келтіріледі.",
      explanation: {
        whereInText: "«저녁에 비가 오기 시작해서 우리는 집으로 일찍 돌아갔습니다» (Кешке жаңбыр жауа бастады, сондықтан біз үйге ерте қайттық).",
        keywords: "비가 오기 시작해서",
        whyCorrect: "«-아서/어서» (себебі) «жаңбыр жауа бастады» дегенді «үйге ерте қайттық» нәтижесімен тікелей байланыстырады.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Шаршау туралы жазбада ешбір жерде айтылмайды." },
          { optionId: "opt-c", reason: "Парктің жабылғаны туралы ештеңе жоқ." },
          { optionId: "opt-d", reason: "Автобус туралы мүлде айтылмайды — олар велосипедпен жүрді." },
        ],
        vocabulary: [{ term: "비가 오다", translation: "жаңбыр жаууы" }],
        grammarPattern: "«-아서/어서» етістік түбіріне жалғанып, «себебі/сондықтан» мағынасын береді, себепті бір сөйлем ішінде нәтижесімен тікелей байланыстырады.",
        strategy: "«Неге» сұрақтарында сұрақтағы оқиғаның маңында -아서/어서 немесе 그래서 сияқты жалғаулықты іздеңіз — себеп әдетте дәл жанында тұрады.",
      },
    },
  },
};

const l2DiaryQ3: QuestionSpec = {
  id: "topik2-weekend-diary-1-q3",
  passageId: "topik2-weekend-diary-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "inference",
  evidenceQuote: "그래도 정말 즐거운 하루였습니다.",
  content: {
    en: {
      prompt: "What can be inferred about the writer's feelings about the day overall?",
      options: [
        { id: "opt-a", text: "Despite some inconveniences, she still enjoyed the day" },
        { id: "opt-b", text: "She regretted going" },
        { id: "opt-c", text: "She was angry at her friend" },
        { id: "opt-d", text: "She never wants to go back" },
      ],
      hint: "Look at the word right before \"정말 즐거운 하루였습니다\" — it connects back to the earlier complaints.",
      explanation: {
        whereInText: "\"그래도 정말 즐거운 하루였습니다\" (Even so, it was a really fun day).",
        keywords: "그래도",
        whyCorrect: "\"그래도\" (even so/despite that) explicitly links the earlier problems (crowds, rain) to a positive conclusion — enjoyment despite the inconveniences.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The final sentences (즐거운 하루, 다음 주말에는... 계획입니다) show the opposite of regret — she's already planning another outing." },
          { optionId: "opt-c", reason: "Nothing in the text expresses anger or blame toward the friend." },
          { optionId: "opt-d", reason: "She explicitly plans to see a movie with Sujin next weekend — the opposite of never wanting to return." },
        ],
        vocabulary: [{ term: "그래도", translation: "even so / still" }],
        grammarPattern: "\"그래도\" is a connective adverb that concedes a prior point before stating a contrasting, often positive, conclusion.",
        strategy: "For feeling/attitude questions, check the sentences right after any listed problems — connectives like 그래도 or 하지만 often reveal the writer's real overall judgment.",
      },
    },
    ru: {
      prompt: "Что можно понять об общем отношении автора к этому дню?",
      options: [
        { id: "opt-a", text: "Несмотря на некоторые неудобства, ей всё равно понравился день" },
        { id: "opt-b", text: "Она пожалела, что пошла" },
        { id: "opt-c", text: "Она разозлилась на подругу" },
        { id: "opt-d", text: "Она больше никогда не хочет туда возвращаться" },
      ],
      hint: "Посмотрите на слово прямо перед «정말 즐거운 하루였습니다» — оно связывает с прежними жалобами.",
      explanation: {
        whereInText: "«그래도 정말 즐거운 하루였습니다» (Тем не менее, это был действительно весёлый день).",
        keywords: "그래도",
        whyCorrect: "«그래도» (тем не менее) явно связывает предыдущие проблемы (толпа, дождь) с положительным выводом — удовольствие несмотря на неудобства.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Последние предложения (즐거운 하루, 다음 주말에는... 계획입니다) показывают обратное сожалению — она уже планирует новую прогулку." },
          { optionId: "opt-c", reason: "В тексте нет ничего о злости или обвинении подруги." },
          { optionId: "opt-d", reason: "Она явно планирует пойти в кино с Суджин на следующих выходных — противоположность нежеланию возвращаться." },
        ],
        vocabulary: [{ term: "그래도", translation: "тем не менее / всё же" }],
        grammarPattern: "«그래도» — соединительное наречие, которое признаёт предыдущий пункт перед тем, как заявить контрастный, часто позитивный, вывод.",
        strategy: "В вопросах об отношении/чувствах проверяйте предложения сразу после перечисленных проблем — связки вроде 그래도 или 하지만 часто раскрывают настоящее общее мнение автора.",
      },
    },
    kz: {
      prompt: "Автордың сол күнге деген жалпы көзқарасы туралы не деп қорытынды жасауға болады?",
      options: [
        { id: "opt-a", text: "Кейбір қолайсыздықтарға қарамастан, ол күнге риза болды" },
        { id: "opt-b", text: "Ол барғанына өкінді" },
        { id: "opt-c", text: "Ол досына ашуланды" },
        { id: "opt-d", text: "Ол енді ешқашан ол жерге барғысы келмейді" },
      ],
      hint: "«정말 즐거운 하루였습니다»-ның алдындағы сөзге қараңыз — ол бұрынғы шағымдармен байланысады.",
      explanation: {
        whereInText: "«그래도 정말 즐거운 하루였습니다» (Дегенмен, бұл шынымен қуанышты күн болды).",
        keywords: "그래도",
        whyCorrect: "«그래도» (дегенмен) алдыңғы мәселелерді (тобыр, жаңбыр) оң қорытындымен нақты байланыстырады — қолайсыздықтарға қарамастан ләззат алу.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Соңғы сөйлемдер (즐거운 하루, 다음 주말에는... 계획입니다) өкінудің керісін көрсетеді — ол жаңа серуенді жоспарлап та қойған." },
          { optionId: "opt-c", reason: "Мәтінде досына ашулану немесе кінәлау туралы ештеңе жоқ." },
          { optionId: "opt-d", reason: "Ол келесі демалыс күндері Суджинмен киноға баруды нақты жоспарлайды — бұл ешқашан қайтпауды қалауға қарама-қарсы." },
        ],
        vocabulary: [{ term: "그래도", translation: "дегенмен / сонда да" }],
        grammarPattern: "«그래도» — қарама-қарсы, көбіне оң қорытындыны айтпас бұрын алдыңғы пікірді мойындайтын жалғаулық үстеу.",
        strategy: "Көзқарас/сезім туралы сұрақтарда тізілген мәселелерден кейінгі сөйлемдерді тексеріңіз — 그래도 немесе 하지만 сияқты жалғаулықтар автордың нақты жалпы пікірін жиі ашады.",
      },
    },
  },
};

const L2_DIARY_VOCAB: VocabularySpec[] = [
  {
    term: "자전거를 타다",
    translation: { en: "to ride a bicycle", ru: "кататься на велосипеде", kz: "велосипед тебу" },
    definition: {
      en: "To move by pedaling a bicycle.",
      ru: "Передвигаться, крутя педали велосипеда.",
      kz: "Велосипед педалін басып жүру.",
    },
    exampleSentence: "우리는 자전거를 타고 공원을 한 바퀴 돌았습니다.",
  },
  {
    term: "불편하다",
    translation: { en: "to be inconvenient/uncomfortable", ru: "быть неудобным", kz: "ыңғайсыз болу" },
    definition: {
      en: "To feel discomfort or difficulty in a situation.",
      ru: "Испытывать дискомфорт или затруднение в ситуации.",
      kz: "Жағдайда қолайсыздық немесе қиындық сезіну.",
    },
    exampleSentence: "오후에는 사람이 너무 많아서 조금 불편했습니다.",
  },
  {
    term: "계획",
    translation: { en: "plan", ru: "план", kz: "жоспар" },
    definition: {
      en: "An intention for a future action.",
      ru: "Намерение совершить действие в будущем.",
      kz: "Болашақ әрекетке деген ниет.",
    },
    exampleSentence: "다음 주말에는 수진 씨와 영화를 보러 갈 계획입니다.",
  },
];

const L2_PACKAGE_MESSAGE: TopikReadingPassage = {
  id: "topik2-message-note-1",
  textType: "Text message",
  title: "A note about picking up a package",
  body: "민수 씨,\n\n오늘 오후에 택배가 도착할 거예요. 저는 회사에 있어서 집에 없어요. 미안하지만 택배 좀 받아 주시겠어요? 경비실에 맡겨도 괜찮아요. 제가 저녁 7시쯤 집에 도착할 거예요. 그때 다시 연락할게요. 고마워요!\n\n지현 드림",
  estimatedWordCount: 45,
};

const l2MessageQ1: QuestionSpec = {
  id: "topik2-message-note-1-q1",
  passageId: "topik2-message-note-1",
  questionNumber: 1,
  type: "matching",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "택배 좀 받아 주시겠어요?",
  content: {
    en: {
      prompt: "What is this message mainly asking for?",
      options: [
        { id: "opt-a", text: "Help receiving a delivery" },
        { id: "opt-b", text: "An invitation to dinner" },
        { id: "opt-c", text: "A request to borrow money" },
        { id: "opt-d", text: "A reminder about a meeting" },
      ],
      hint: "The main request is phrased as a polite question near the start of the message.",
      explanation: {
        whereInText: "\"택배 좀 받아 주시겠어요?\" (Could you please receive the package for me?).",
        keywords: "택배 좀 받아 주시겠어요",
        whyCorrect: "\"-아/어 주시겠어요?\" is a polite request form, and \"택배\" (delivery/package) names exactly what's being asked for.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "No food, restaurant, or dinner plan is mentioned." },
          { optionId: "opt-c", reason: "Money is never mentioned anywhere in the message." },
          { optionId: "opt-d", reason: "There is no meeting time or agenda referenced." },
        ],
        vocabulary: [{ term: "택배", translation: "delivery / package" }],
        grammarPattern: "\"-아/어 주시겠어요?\" politely asks someone to do something for you — a common request pattern above beginner level.",
        strategy: "In message-style texts, the core request is usually a question ending in -겠어요? or -줄래요? — scan for that pattern first.",
      },
    },
    ru: {
      prompt: "О чём в основном просит это сообщение?",
      options: [
        { id: "opt-a", text: "О помощи с получением посылки" },
        { id: "opt-b", text: "О приглашении на ужин" },
        { id: "opt-c", text: "О просьбе одолжить денег" },
        { id: "opt-d", text: "О напоминании о встрече" },
      ],
      hint: "Основная просьба сформулирована как вежливый вопрос в начале сообщения.",
      explanation: {
        whereInText: "«택배 좀 받아 주시겠어요?» (Не могли бы вы получить для меня посылку?).",
        keywords: "택배 좀 받아 주시겠어요",
        whyCorrect: "«-아/어 주시겠어요?» — вежливая форма просьбы, а «택배» (посылка/доставка) точно называет, о чём просят.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Нет упоминания еды, ресторана или плана на ужин." },
          { optionId: "opt-c", reason: "О деньгах в сообщении нигде не упоминается." },
          { optionId: "opt-d", reason: "Нет ссылки на время встречи или повестку." },
        ],
        vocabulary: [{ term: "택배", translation: "посылка / доставка" }],
        grammarPattern: "«-아/어 주시겠어요?» вежливо просит кого-то сделать что-то для вас — распространённая форма просьбы выше начального уровня.",
        strategy: "В текстах-сообщениях основная просьба обычно оформлена как вопрос, заканчивающийся на -겠어요? или -줄래요? — ищите этот шаблон в первую очередь.",
      },
    },
    kz: {
      prompt: "Бұл хабарлама негізінен нені сұрайды?",
      options: [
        { id: "opt-a", text: "Жеткізілімді алуға көмек" },
        { id: "opt-b", text: "Кешкі асқа шақыру" },
        { id: "opt-c", text: "Ақша қарызға алу сұранысы" },
        { id: "opt-d", text: "Кездесу туралы еске салу" },
      ],
      hint: "Негізгі сұраныс хабарламаның басында сыпайы сұрақ түрінде тұжырымдалған.",
      explanation: {
        whereInText: "«택배 좀 받아 주시겠어요?» (Менің орныма жеткізілімді алып қоя аласыз ба?).",
        keywords: "택배 좀 받아 주시겠어요",
        whyCorrect: "«-아/어 주시겠어요?» — сыпайы сұраныс формасы, ал «택배» (жеткізілім/сәлемдеме) нақты не сұралып жатқанын атайды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Тамақ, мейрамхана немесе кешкі ас жоспары туралы айтылмайды." },
          { optionId: "opt-c", reason: "Ақша туралы хабарламада ешбір жерде айтылмайды." },
          { optionId: "opt-d", reason: "Кездесу уақыты немесе күн тәртібі туралы сілтеме жоқ." },
        ],
        vocabulary: [{ term: "택배", translation: "жеткізілім / сәлемдеме" }],
        grammarPattern: "«-아/어 주시겠어요?» біреуден өзіңе бір нәрсе жасауын сыпайы түрде сұрайды — бастауыш деңгейден жоғары жиі кездесетін сұраныс үлгісі.",
        strategy: "Хабарлама түріндегі мәтіндерде негізгі сұраныс әдетте -겠어요? немесе -줄래요? деп аяқталатын сұрақ түрінде болады — алдымен осы үлгіні іздеңіз.",
      },
    },
  },
};

const l2MessageQ2: QuestionSpec = {
  id: "topik2-message-note-1-q2",
  passageId: "topik2-message-note-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "appropriateResponse",
  evidenceQuote: "택배 좀 받아 주시겠어요?",
  content: {
    en: {
      prompt: "Which reply would be the most appropriate response to Jihyun's message?",
      options: [
        { id: "opt-a", text: "네, 제가 대신 받아 놓을게요. (Sure, I'll receive it for you.)" },
        { id: "opt-b", text: "저는 택배를 안 좋아해요. (I don't like packages.)" },
        { id: "opt-c", text: "오늘 날씨가 좋네요. (The weather is nice today.)" },
        { id: "opt-d", text: "저는 회사에 없어요. (I'm not at the office.)" },
      ],
      hint: "Think about what directly answers her polite request, rather than a comment on something unrelated.",
      explanation: {
        whereInText: "The request itself: \"택배 좀 받아 주시겠어요?\" (Could you please receive the package?).",
        keywords: "받아 주시겠어요?",
        whyCorrect: "This directly agrees to the specific request — receiving the package — which is exactly what a fitting reply to a request should do.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "This reacts emotionally to \"packages\" in general instead of answering whether he'll help." },
          { optionId: "opt-c", reason: "This changes the subject entirely to the weather, ignoring the request." },
          { optionId: "opt-d", reason: "\"저는 회사에 없어요\" restates Jihyun's own line about herself rather than answering as Minsu." },
        ],
        vocabulary: [{ term: "대신", translation: "instead / on someone's behalf" }],
        grammarPattern: "\"-을게요/ㄹ게요\" expresses a speaker's willing promise to do something — a natural way to accept a request.",
        strategy: "For \"appropriate response\" questions, the correct reply directly addresses the specific request or question just asked — not a generic or unrelated comment.",
      },
    },
    ru: {
      prompt: "Какой ответ будет наиболее уместным на сообщение Джихён?",
      options: [
        { id: "opt-a", text: "네, 제가 대신 받아 놓을게요. (Хорошо, я приму её вместо вас.)" },
        { id: "opt-b", text: "저는 택배를 안 좋아해요. (Мне не нравятся посылки.)" },
        { id: "opt-c", text: "오늘 날씨가 좋네요. (Сегодня хорошая погода.)" },
        { id: "opt-d", text: "저는 회사에 없어요. (Я не в офисе.)" },
      ],
      hint: "Подумайте, что напрямую отвечает на её вежливую просьбу, а не комментарий на постороннюю тему.",
      explanation: {
        whereInText: "Сама просьба: «택배 좀 받아 주시겠어요?» (Не могли бы вы принять посылку?).",
        keywords: "받아 주시겠어요?",
        whyCorrect: "Это напрямую соглашается с конкретной просьбой — принять посылку, — именно так и должен выглядеть уместный ответ на просьбу.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Это эмоциональная реакция на «посылки» вообще, а не ответ на то, поможет ли он." },
          { optionId: "opt-c", reason: "Это полностью меняет тему на погоду, игнорируя просьбу." },
          { optionId: "opt-d", reason: "«저는 회사에 없어요» повторяет собственную фразу Джихён о себе, а не отвечает от лица Минсу." },
        ],
        vocabulary: [{ term: "대신", translation: "вместо / от чьего-то имени" }],
        grammarPattern: "«-을게요/ㄹ게요» выражает добровольное обещание говорящего что-то сделать — естественный способ согласиться на просьбу.",
        strategy: "В вопросах «уместный ответ» правильный ответ напрямую отвечает на конкретную просьбу или вопрос, а не является общим или посторонним комментарием.",
      },
    },
    kz: {
      prompt: "Джихённың хабарламасына қандай жауап ең орынды болады?",
      options: [
        { id: "opt-a", text: "네, 제가 대신 받아 놓을게요. (Жарайды, мен оны сіздің орныңызға алып қоямын.)" },
        { id: "opt-b", text: "저는 택배를 안 좋아해요. (Маған сәлемдемелер ұнамайды.)" },
        { id: "opt-c", text: "오늘 날씨가 좋네요. (Бүгін ауа райы жақсы.)" },
        { id: "opt-d", text: "저는 회사에 없어요. (Мен офисте емеспін.)" },
      ],
      hint: "Оның сыпайы сұранысына тікелей жауап беретінді ойланыңыз, байланыссыз пікір емес.",
      explanation: {
        whereInText: "Сұраныстың өзі: «택배 좀 받아 주시겠어요?» (Сәлемдемені алып қоя аласыз ба?).",
        keywords: "받아 주시겠어요?",
        whyCorrect: "Бұл нақты сұранысқа — сәлемдемені алуға — тікелей келіседі, дәл осылай орынды жауап болуы керек.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Бұл жалпы «сәлемдемелерге» эмоционалды әрекет, көмектесе ме жоқ па деген сұраққа жауап емес." },
          { optionId: "opt-c", reason: "Бұл тақырыпты мүлде ауа райына ауыстырады, сұранысты елемейді." },
          { optionId: "opt-d", reason: "«저는 회사에 없어요» Джихённың өзі туралы сөйлемін қайталайды, Минсу атынан жауап бермейді." },
        ],
        vocabulary: [{ term: "대신", translation: "орнына / атынан" }],
        grammarPattern: "«-을게요/ㄹ게요» сөйлеушінің бір нәрсе жасауға деген өз еркімен уәдесін білдіреді — сұранысты қабылдаудың табиғи жолы.",
        strategy: "«Орынды жауап» сұрақтарында дұрыс жауап нақты сұралған сұранысқа немесе сұраққа тікелей жауап береді — жалпы немесе байланыссыз пікір емес.",
      },
    },
  },
};

const l2MessageQ3: QuestionSpec = {
  id: "topik2-message-note-1-q3",
  passageId: "topik2-message-note-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "detail",
  evidenceQuote: "제가 저녁 7시쯤 집에 도착할 거예요.",
  content: {
    en: {
      prompt: "What time will Jihyun arrive home?",
      options: [
        { id: "opt-a", text: "6 o'clock" },
        { id: "opt-b", text: "7 o'clock" },
        { id: "opt-c", text: "8 o'clock" },
        { id: "opt-d", text: "9 o'clock" },
      ],
      hint: "The approximate time is stated near the end of the message, right before she says she'll be in touch again.",
      explanation: {
        whereInText: "\"제가 저녁 7시쯤 집에 도착할 거예요\" (I'll arrive home around 7pm).",
        keywords: "저녁 7시쯤",
        whyCorrect: "\"7시쯤\" (around 7 o'clock) directly states her expected arrival time.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "6 o'clock is never mentioned in the message." },
          { optionId: "opt-c", reason: "8 o'clock doesn't appear anywhere in the text." },
          { optionId: "opt-d", reason: "9 o'clock is not stated at all." },
        ],
        vocabulary: [{ term: "-쯤", translation: "around / approximately" }],
        grammarPattern: "\"-쯤\" attaches to a time expression to mean \"around/approximately\" — useful for distinguishing an estimate from an exact time.",
        strategy: "When a question asks for a specific time, check whether the text says \"exactly\" or \"약/쯤\" (around) — that distinction can matter for related questions.",
      },
    },
    ru: {
      prompt: "Во сколько Джихён вернётся домой?",
      options: [
        { id: "opt-a", text: "В 6 часов" },
        { id: "opt-b", text: "В 7 часов" },
        { id: "opt-c", text: "В 8 часов" },
        { id: "opt-d", text: "В 9 часов" },
      ],
      hint: "Примерное время указано ближе к концу сообщения, прямо перед словами о том, что она снова свяжется.",
      explanation: {
        whereInText: "«제가 저녁 7시쯤 집에 도착할 거예요» (Я приеду домой примерно в 7 вечера).",
        keywords: "저녁 7시쯤",
        whyCorrect: "«7시쯤» (около 7 часов) прямо указывает ожидаемое время прибытия.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "6 часов в сообщении не упоминаются." },
          { optionId: "opt-c", reason: "8 часов нигде в тексте не встречаются." },
          { optionId: "opt-d", reason: "9 часов вообще не указаны." },
        ],
        vocabulary: [{ term: "-쯤", translation: "около / примерно" }],
        grammarPattern: "«-쯤» присоединяется к выражению времени со значением «около/примерно» — полезно, чтобы отличать оценку от точного времени.",
        strategy: "Когда вопрос про конкретное время, проверьте, сказано ли в тексте «точно» или «약/쯤» (около) — это различие может быть важно для смежных вопросов.",
      },
    },
    kz: {
      prompt: "Джихён үйге неше сағатта жетеді?",
      options: [
        { id: "opt-a", text: "Сағат 6-да" },
        { id: "opt-b", text: "Сағат 7-де" },
        { id: "opt-c", text: "Сағат 8-де" },
        { id: "opt-d", text: "Сағат 9-да" },
      ],
      hint: "Шамамен уақыт хабарламаның соңына жақын, ол қайта хабарласатыны туралы айтардың алдында көрсетілген.",
      explanation: {
        whereInText: "«제가 저녁 7시쯤 집에 도착할 거예요» (Мен кешке шамамен сағат 7-де үйге жетемін).",
        keywords: "저녁 7시쯤",
        whyCorrect: "«7시쯤» (шамамен сағат 7) оның күтілетін келу уақытын тікелей көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Сағат 6 хабарламада мүлде аталмаған." },
          { optionId: "opt-c", reason: "Сағат 8 мәтінде ешбір жерде жоқ." },
          { optionId: "opt-d", reason: "Сағат 9 мүлде көрсетілмеген." },
        ],
        vocabulary: [{ term: "-쯤", translation: "шамамен / жуық" }],
        grammarPattern: "«-쯤» уақыт өрнегіне жалғанып, «шамамен/жуық» мағынасын береді — бағалауды нақты уақыттан ажырату үшін пайдалы.",
        strategy: "Сұрақ нақты уақыт туралы болғанда, мәтінде «дәл» немесе «약/쯤» (шамамен) делінгенін тексеріңіз — бұл айырмашылық байланысты сұрақтарда маңызды болуы мүмкін.",
      },
    },
  },
};

const L2_MESSAGE_VOCAB: VocabularySpec[] = [
  {
    term: "경비실",
    translation: { en: "security office", ru: "пост охраны", kz: "күзет бөлмесі" },
    definition: {
      en: "A small office at a building's entrance staffed by security/management personnel.",
      ru: "Небольшой пост у входа в здание, где работает охрана/управляющий персонал.",
      kz: "Ғимарат кірер жерінде күзет/басқару қызметкерлері отыратын шағын бөлме.",
    },
    exampleSentence: "경비실에 맡겨도 괜찮아요.",
  },
  {
    term: "연락하다",
    translation: { en: "to contact", ru: "связываться", kz: "хабарласу" },
    definition: {
      en: "To get in touch with someone, e.g. by phone or message.",
      ru: "Связаться с кем-то, например, по телефону или в сообщении.",
      kz: "Біреумен телефон немесе хабарлама арқылы байланысу.",
    },
    exampleSentence: "그때 다시 연락할게요.",
  },
];

export const TOPIK_LEVEL_2_PASSAGES: TopikReadingPassage[] = [L2_WEEKEND_DIARY, L2_PACKAGE_MESSAGE];
export const TOPIK_LEVEL_2_QUESTIONS: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  "topik2-weekend-diary-1": buildPassageQuestions(l2DiaryQ1, l2DiaryQ2, l2DiaryQ3),
  "topik2-message-note-1": buildPassageQuestions(l2MessageQ1, l2MessageQ2, l2MessageQ3),
};
export const TOPIK_LEVEL_2_VOCAB: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  "topik2-weekend-diary-1": buildVocabulary(L2_DIARY_VOCAB),
  "topik2-message-note-1": buildVocabulary(L2_MESSAGE_VOCAB),
};

// ---------------------------------------------------------------------------
// Level 3 — 3급 Intermediate I: opinions, past experiences, ~130-150 words.
// ---------------------------------------------------------------------------

const L3_JEJU_BLOG: TopikReadingPassage = {
  id: "topik3-jeju-blog-1",
  textType: "Blog post",
  title: "A solo trip to Jeju Island",
  body: "지난달에 나는 처음으로 제주도를 혼자 여행했다. 원래는 친구와 같이 갈 계획이었지만 친구가 갑자기 일이 생겨서 혼자 가게 되었다. 처음에는 혼자 여행하는 것이 조금 걱정되었지만, 막상 도착해 보니 생각보다 훨씬 편했다. 첫날에는 바닷가를 따라 오래 걸으면서 사진을 많이 찍었고, 둘째 날에는 유명한 오름에 올라가서 제주도 전체를 내려다보았다. 특히 저녁에 먹은 흑돼지 구이는 정말 잊을 수 없는 맛이었다. 날씨가 계속 좋아서 여행 내내 큰 불편함은 없었다. 이번 여행을 통해 나는 혼자 하는 여행도 충분히 즐거울 수 있다는 것을 깨달았다. 다음에는 더 긴 일정으로 다시 제주도를 찾고 싶다.",
  estimatedWordCount: 140,
};

const l3JejuQ1: QuestionSpec = {
  id: "topik3-jeju-blog-1-q1",
  passageId: "topik3-jeju-blog-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "mainIdea",
  evidenceQuote: "이번 여행을 통해 나는 혼자 하는 여행도 충분히 즐거울 수 있다는 것을 깨달았다.",
  content: {
    en: {
      prompt: "What is the writer's main point about this trip?",
      options: [
        { id: "opt-a", text: "Traveling alone can be enjoyable, even if it starts with worry" },
        { id: "opt-b", text: "Traveling alone is always dangerous" },
        { id: "opt-c", text: "Jeju Island has bad weather" },
        { id: "opt-d", text: "She regrets going alone" },
      ],
      hint: "The concluding sentence near the end states what she personally realized from the trip.",
      explanation: {
        whereInText: "\"이번 여행을 통해 나는 혼자 하는 여행도 충분히 즐거울 수 있다는 것을 깨달았다\" (Through this trip, I realized that traveling alone can be enjoyable too).",
        keywords: "혼자 하는 여행도 충분히 즐거울 수 있다",
        whyCorrect: "This concluding sentence, paired with the earlier \"조금 걱정되었지만... 훨씬 편했다\" (a bit worried but... much more comfortable), is exactly the arc of the whole entry.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The passage describes a comfortable, enjoyable trip — nothing suggests danger." },
          { optionId: "opt-c", reason: "The text says \"날씨가 계속 좋아서\" (the weather stayed good) — the opposite of bad weather." },
          { optionId: "opt-d", reason: "She explicitly wants to return to Jeju with a longer itinerary — the opposite of regret." },
        ],
        vocabulary: [{ term: "깨닫다", translation: "to realize" }],
        grammarPattern: "\"-다는 것을 깨달았다\" (realized that...) reports a personal insight gained from experience — common in reflective blog writing.",
        strategy: "For main-idea questions in personal narratives, the concluding paragraph usually states the lesson learned — read the ending as carefully as the opening.",
      },
    },
    ru: {
      prompt: "В чём главная мысль автора об этой поездке?",
      options: [
        { id: "opt-a", text: "Путешествовать одному может быть приятно, даже если начинается с беспокойства" },
        { id: "opt-b", text: "Путешествовать одному всегда опасно" },
        { id: "opt-c", text: "На острове Чеджу плохая погода" },
        { id: "opt-d", text: "Она жалеет, что поехала одна" },
      ],
      hint: "Заключительное предложение ближе к концу говорит о том, что она лично поняла из этой поездки.",
      explanation: {
        whereInText: "«이번 여행을 통해 나는 혼자 하는 여행도 충분히 즐거울 수 있다는 것을 깨달았다» (Благодаря этой поездке я поняла, что путешествие в одиночку тоже может быть приятным).",
        keywords: "혼자 하는 여행도 충분히 즐거울 수 있다",
        whyCorrect: "Это заключительное предложение вместе с более ранним «조금 걱정되었지만... 훨씬 편했다» (немного беспокоилась, но... стало намного комфортнее) — именно та дуга, что проходит через весь текст.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Текст описывает комфортную, приятную поездку — ничто не намекает на опасность." },
          { optionId: "opt-c", reason: "В тексте сказано «날씨가 계속 좋아서» (погода оставалась хорошей) — противоположность плохой погоде." },
          { optionId: "opt-d", reason: "Она явно хочет снова поехать на Чеджу с более долгим маршрутом — противоположность сожалению." },
        ],
        vocabulary: [{ term: "깨닫다", translation: "осознавать" }],
        grammarPattern: "«-다는 것을 깨달았다» (поняла, что...) передаёт личное озарение, полученное из опыта — часто встречается в рефлексивных блог-записях.",
        strategy: "В вопросах на основную идею в личных рассказах заключительный абзац обычно содержит извлечённый урок — читайте концовку так же внимательно, как и начало.",
      },
    },
    kz: {
      prompt: "Автордың бұл сапар туралы негізгі ойы қандай?",
      options: [
        { id: "opt-a", text: "Жалғыз саяхаттау уайыммен басталса да, қуанышты болуы мүмкін" },
        { id: "opt-b", text: "Жалғыз саяхаттау әрқашан қауіпті" },
        { id: "opt-c", text: "Чеджудо аралында ауа райы нашар" },
        { id: "opt-d", text: "Ол жалғыз барғанына өкінеді" },
      ],
      hint: "Соңына жақын қорытынды сөйлем ол сапардан жеке не түсінгенін айтады.",
      explanation: {
        whereInText: "«이번 여행을 통해 나는 혼자 하는 여행도 충분히 즐거울 수 있다는 것을 깨달았다» (Осы сапар арқылы мен жалғыз саяхаттаудың да қуанышты бола алатынын түсіндім).",
        keywords: "혼자 하는 여행도 충분히 즐거울 수 있다",
        whyCorrect: "Бұл қорытынды сөйлем бұрынғы «조금 걱정되었지만... 훨씬 편했다» (біраз уайымдадым, бірақ... әлдеқайда ыңғайлы болды) дегенмен бірге бүкіл жазбаның желісін көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мәтін ыңғайлы, қуанышты сапарды сипаттайды — қауіп туралы ештеңе жоқ." },
          { optionId: "opt-c", reason: "Мәтінде «날씨가 계속 좋아서» (ауа райы жақсы болып қалды) делінген — нашар ауа райына қарама-қарсы." },
          { optionId: "opt-d", reason: "Ол ұзағырақ бағдарламамен Чеджуға қайта баруды нақты қалайды — бұл өкінудің керісі." },
        ],
        vocabulary: [{ term: "깨닫다", translation: "түсіну/сезіну" }],
        grammarPattern: "«-다는 것을 깨달았다» (...екенін түсіндім) тәжірибеден алынған жеке түйсікті білдіреді — рефлексиялық блог жазуларында жиі кездеседі.",
        strategy: "Жеке әңгімелердегі негізгі ой сұрақтарында қорытынды абзац әдетте алынған сабақты айтады — соңын да басы сияқты мұқият оқыңыз.",
      },
    },
  },
};

const l3JejuQ2: QuestionSpec = {
  id: "topik3-jeju-blog-1-q2",
  passageId: "topik3-jeju-blog-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "친구가 갑자기 일이 생겨서 혼자 가게 되었다.",
  content: {
    en: {
      prompt: "Why did the writer end up traveling alone?",
      options: [
        { id: "opt-a", text: "Her friend suddenly had something come up" },
        { id: "opt-b", text: "She preferred to travel alone from the start" },
        { id: "opt-c", text: "Her friend got sick" },
        { id: "opt-d", text: "There was no flight for two people" },
      ],
      hint: "The original plan and what changed it are both stated in the second sentence.",
      explanation: {
        whereInText: "\"친구가 갑자기 일이 생겨서 혼자 가게 되었다\" (My friend suddenly had something come up, so I ended up going alone).",
        keywords: "갑자기 일이 생겨서",
        whyCorrect: "\"일이 생기다\" (something comes up) directly explains why the friend couldn't go, matching this option exactly.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The text says \"원래는 친구와 같이 갈 계획이었지만\" (originally planned to go together) — she didn't prefer solo travel from the start." },
          { optionId: "opt-c", reason: "Illness is never mentioned — only a vague \"일이 생겨서\" (something came up)." },
          { optionId: "opt-d", reason: "Flights are never mentioned anywhere in the passage." },
        ],
        vocabulary: [{ term: "일이 생기다", translation: "something comes up / an issue arises" }],
        grammarPattern: "\"-게 되다\" expresses a result that happened due to circumstances, not the subject's own choice — fitting the unplanned solo trip.",
        strategy: "For \"why\" detail questions, look for the exact cause clause (-아서/어서) rather than assuming a reason from general context.",
      },
    },
    ru: {
      prompt: "Почему в итоге автор путешествовала одна?",
      options: [
        { id: "opt-a", text: "У её подруги внезапно возникли дела" },
        { id: "opt-b", text: "Она с самого начала предпочла путешествовать одна" },
        { id: "opt-c", text: "Её подруга заболела" },
        { id: "opt-d", text: "Не было рейса на двоих" },
      ],
      hint: "Первоначальный план и то, что его изменило, указаны во втором предложении.",
      explanation: {
        whereInText: "«친구가 갑자기 일이 생겨서 혼자 가게 되었다» (У подруги внезапно возникли дела, поэтому я поехала одна).",
        keywords: "갑자기 일이 생겨서",
        whyCorrect: "«일이 생기다» (возникли дела) напрямую объясняет, почему подруга не смогла поехать — это точно совпадает с вариантом.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "В тексте сказано «원래는 친구와 같이 갈 계획이었지만» (изначально планировали поехать вместе) — она не предпочитала одиночное путешествие с самого начала." },
          { optionId: "opt-c", reason: "Болезнь нигде не упоминается — только расплывчатое «일이 생겨서» (возникли дела)." },
          { optionId: "opt-d", reason: "О рейсах в тексте вообще не говорится." },
        ],
        vocabulary: [{ term: "일이 생기다", translation: "возникают дела / появляется проблема" }],
        grammarPattern: "«-게 되다» выражает результат, произошедший из-за обстоятельств, а не по собственному выбору подлежащего — подходит для незапланированной одиночной поездки.",
        strategy: "В детальных вопросах «почему» ищите точное причинное предложение (-아서/어서), а не предполагайте причину из общего контекста.",
      },
    },
    kz: {
      prompt: "Автор неге ақыр аяғында жалғыз саяхаттады?",
      options: [
        { id: "opt-a", text: "Досының кенеттен ісі шықты" },
        { id: "opt-b", text: "Ол бастан-ақ жалғыз саяхаттауды қалады" },
        { id: "opt-c", text: "Досы ауырып қалды" },
        { id: "opt-d", text: "Екеуіне рейс болмады" },
      ],
      hint: "Бастапқы жоспар мен оны өзгерткен нәрсе екінші сөйлемде көрсетілген.",
      explanation: {
        whereInText: "«친구가 갑자기 일이 생겨서 혼자 가게 되었다» (Досының кенеттен ісі шықты, сондықтан мен жалғыз бардым).",
        keywords: "갑자기 일이 생겨서",
        whyCorrect: "«일이 생기다» (іс шығу) досының неге бара алмағанын тікелей түсіндіреді, бұл нұсқамен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мәтінде «원래는 친구와 같이 갈 계획이었지만» (бастапқыда бірге баруды жоспарлаған) делінген — ол бастан-ақ жалғыз саяхаттауды қаламаған." },
          { optionId: "opt-c", reason: "Ауру туралы мүлде айтылмайды — тек анық емес «일이 생겨서» (іс шықты)." },
          { optionId: "opt-d", reason: "Рейс туралы мәтінде мүлде айтылмайды." },
        ],
        vocabulary: [{ term: "일이 생기다", translation: "іс шығу / мәселе туындау" }],
        grammarPattern: "«-게 되다» бастауыштың өз таңдауы емес, жағдайларға байланысты болған нәтижені білдіреді — жоспарланбаған жалғыз сапарға сәйкес келеді.",
        strategy: "«Неге» детальді сұрақтарында жалпы контекстен себепті болжамай, нақты себеп сөйлемшесін (-아서/어서) іздеңіз.",
      },
    },
  },
};

const l3JejuQ3: QuestionSpec = {
  id: "topik3-jeju-blog-1-q3",
  passageId: "topik3-jeju-blog-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "vocabGrammar",
  evidenceQuote: "막상 도착해 보니 생각보다 훨씬 편했다.",
  content: {
    en: {
      prompt: "Choose the correct connective for the blank: 막상 도착해 ___ 생각보다 훨씬 편했다.",
      options: [
        { id: "opt-a", text: "보니 (having actually done it, ...)" },
        { id: "opt-b", text: "보면 (if one tries)" },
        { id: "opt-c", text: "봐도 (even if one tries)" },
        { id: "opt-d", text: "보다가 (while trying)" },
      ],
      hint: "The sentence reports a discovery made only after she actually arrived — think about which form reports a realization following a real experience.",
      explanation: {
        whereInText: "\"막상 도착해 보니 생각보다 훨씬 편했다\" (Once I actually arrived, it was far more comfortable than expected).",
        keywords: "-아/어 보니",
        whyCorrect: "\"-아/어 보니\" reports a realization discovered specifically after trying/experiencing something — exactly matching \"막상\" (actually, upon doing).",
        whyIncorrect: [
          { optionId: "opt-b", reason: "\"-으면\" (if) sets up a hypothetical condition, but the sentence describes something that already happened, not a hypothetical." },
          { optionId: "opt-c", reason: "\"-아도\" (even if) implies a contrast/concession that doesn't fit — there's no contrasting result here." },
          { optionId: "opt-d", reason: "\"-다가\" (while in the middle of) implies an interruption mid-action, which doesn't fit a completed arrival followed by a realization." },
        ],
        vocabulary: [{ term: "막상", translation: "actually, when it came down to it" }],
        grammarPattern: "\"-아/어 보니\" = try/experience + realize — used to report something learned only through direct experience, common at intermediate level.",
        strategy: "For grammar-choice questions, check what happens BEFORE and AFTER the blank — a completed action followed by a new realization usually calls for -아/어 보니, not a hypothetical form.",
      },
    },
    ru: {
      prompt: "Выберите правильную связку для пропуска: 막상 도착해 ___ 생각보다 훨씬 편했다.",
      options: [
        { id: "opt-a", text: "보니 (когда действительно сделала это, ...)" },
        { id: "opt-b", text: "보면 (если попробовать)" },
        { id: "opt-c", text: "봐도 (даже если попробовать)" },
        { id: "opt-d", text: "보다가 (в процессе попытки)" },
      ],
      hint: "Предложение сообщает об открытии, сделанном только после того, как она действительно приехала — подумайте, какая форма передаёт осознание после реального опыта.",
      explanation: {
        whereInText: "«막상 도착해 보니 생각보다 훨씬 편했다» (Когда я действительно приехала, оказалось намного комфортнее, чем ожидала).",
        keywords: "-아/어 보니",
        whyCorrect: "«-아/어 보니» сообщает об осознании, обнаруженном именно после того, как что-то попробовали/испытали — точно совпадает с «막상» (действительно, по факту).",
        whyIncorrect: [
          { optionId: "opt-b", reason: "«-으면» (если) задаёт гипотетическое условие, но предложение описывает уже произошедшее, а не гипотезу." },
          { optionId: "opt-c", reason: "«-아도» (даже если) подразумевает контраст/уступку, что не подходит — здесь нет противоречащего результата." },
          { optionId: "opt-d", reason: "«-다가» (в процессе) подразумевает прерывание на середине действия, что не подходит для завершённого приезда с последующим осознанием." },
        ],
        vocabulary: [{ term: "막상", translation: "на самом деле, когда дошло до дела" }],
        grammarPattern: "«-아/어 보니» = попробовать/испытать + осознать — используется, чтобы сообщить о том, что узнали только через непосредственный опыт; распространено на среднем уровне.",
        strategy: "В вопросах на грамматику проверяйте, что происходит ДО и ПОСЛЕ пропуска — завершённое действие с последующим новым осознанием обычно требует -아/어 보니, а не гипотетическую форму.",
      },
    },
    kz: {
      prompt: "Бос орынға дұрыс жалғаулықты таңдаңыз: 막상 도착해 ___ 생각보다 훨씬 편했다.",
      options: [
        { id: "opt-a", text: "보니 (шынымен жасап көргенде, ...)" },
        { id: "opt-b", text: "보면 (көрсе)" },
        { id: "opt-c", text: "봐도 (көрсе де)" },
        { id: "opt-d", text: "보다가 (көріп жатқанда)" },
      ],
      hint: "Сөйлем ол шынымен жеткен соң ғана білген жаңалығын хабарлайды — нақты тәжірибеден кейінгі түсінуді білдіретін форманы ойланыңыз.",
      explanation: {
        whereInText: "«막상 도착해 보니 생각보다 훨씬 편했다» (Шынымен жеткенде, күткеннен әлдеқайда ыңғайлы болды).",
        keywords: "-아/어 보니",
        whyCorrect: "«-아/어 보니» бір нәрсені байқап көргеннен/тәжірибеден өткеннен кейін ғана білінген түсінікті хабарлайды — бұл «막상» (шынымен, іс жүзінде) сөзімен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "«-으면» (егер) болжамды шартты білдіреді, бірақ сөйлем болжам емес, болып қойған нәрсені сипаттайды." },
          { optionId: "opt-c", reason: "«-아도» (десе де) қайшылық/жеңілдікті білдіреді, бұл сәйкес келмейді — мұнда қайшы нәтиже жоқ." },
          { optionId: "opt-d", reason: "«-다가» (жасап жатқанда) әрекеттің ортасында үзілуді білдіреді, бұл аяқталған келу мен одан кейінгі түсінуге сәйкес келмейді." },
        ],
        vocabulary: [{ term: "막상", translation: "шынымен, іс жүзінде" }],
        grammarPattern: "«-아/어 보니» = байқап көру/тәжірибе алу + түсіну — тікелей тәжірибе арқылы ғана білінген нәрсені хабарлау үшін қолданылады, орта деңгейде жиі кездеседі.",
        strategy: "Грамматика таңдау сұрақтарында бос орынның АЛДЫНДА және КЕЙІН не болатынын тексеріңіз — аяқталған әрекеттен кейін жаңа түсінік келсе, әдетте болжамды форма емес, -아/어 보니 қажет.",
      },
    },
  },
};

const L3_JEJU_VOCAB: VocabularySpec[] = [
  {
    term: "걱정되다",
    translation: { en: "to feel worried", ru: "чувствовать беспокойство", kz: "уайымдау" },
    definition: {
      en: "To feel anxious or concerned about something.",
      ru: "Испытывать тревогу или беспокойство по поводу чего-либо.",
      kz: "Бір нәрсе туралы алаңдау немесе уайымдау.",
    },
    exampleSentence: "처음에는 혼자 여행하는 것이 조금 걱정되었지만...",
  },
  {
    term: "깨닫다",
    translation: { en: "to realize", ru: "осознавать", kz: "түсіну" },
    definition: {
      en: "To come to understand something clearly, often through experience.",
      ru: "Прийти к чёткому пониманию чего-либо, часто через опыт.",
      kz: "Көбіне тәжірибе арқылы бір нәрсені анық түсінуге келу.",
    },
    exampleSentence: "나는 혼자 하는 여행도 충분히 즐거울 수 있다는 것을 깨달았다.",
  },
];

const L3_FESTIVAL_NEWS: TopikReadingPassage = {
  id: "topik3-local-festival-news-1",
  textType: "Short news article",
  title: "Neighborhood festival news brief",
  body: "서울 마포구는 다음 주 토요일부터 이틀간 '한강 벚꽃 축제'를 연다고 밝혔다. 이번 축제는 코로나 이후 5년 만에 다시 열리는 대규모 행사로, 지역 상인들과 시민 단체가 함께 준비했다. 축제 기간에는 벚꽃길 산책, 지역 음식 장터, 야간 조명 전시 등 다양한 프로그램이 마련된다. 주최 측은 방문객이 지난해보다 두 배 이상 늘어날 것으로 예상하며, 대중교통 이용을 적극 권장했다. 특히 첫날 저녁에는 유명 가수의 축하 공연도 예정되어 있어 많은 인파가 몰릴 것으로 보인다. 구청 관계자는 안전 관리를 위해 추가 인력을 배치할 계획이라고 설명했다.",
  estimatedWordCount: 130,
};

const l3FestivalQ1: QuestionSpec = {
  id: "topik3-local-festival-news-1-q1",
  passageId: "topik3-local-festival-news-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "서울 마포구는 다음 주 토요일부터 이틀간 '한강 벚꽃 축제'를 연다고 밝혔다.",
  content: {
    en: {
      prompt: "What is this news brief mainly about?",
      options: [
        { id: "opt-a", text: "An upcoming cherry blossom festival" },
        { id: "opt-b", text: "A new subway line opening" },
        { id: "opt-c", text: "A local election" },
        { id: "opt-d", text: "A traffic accident" },
      ],
      hint: "The very first sentence names the event and when it starts.",
      explanation: {
        whereInText: "\"서울 마포구는 다음 주 토요일부터 이틀간 '한강 벚꽃 축제'를 연다고 밝혔다\" (Seoul's Mapo district announced it will hold the 'Han River Cherry Blossom Festival' for two days starting next Saturday).",
        keywords: "한강 벚꽃 축제",
        whyCorrect: "The opening sentence names the festival directly, and the rest of the article details its programs, expected attendance, and safety plans.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "No subway, train, or transit line opening is mentioned — only a general call to use public transport." },
          { optionId: "opt-c", reason: "There is no mention of candidates, voting, or an election." },
          { optionId: "opt-d", reason: "No accident, injury, or incident is described anywhere." },
        ],
        vocabulary: [{ term: "축제", translation: "festival" }],
        grammarPattern: "\"-다고 밝혔다\" (announced/stated that...) is a common news-report structure for quoting an official announcement indirectly.",
        strategy: "In short news briefs, the headline-like first sentence almost always states the core event — confirm the topic there before reading details.",
      },
    },
    ru: {
      prompt: "О чём в основном эта новостная заметка?",
      options: [
        { id: "opt-a", text: "О предстоящем фестивале цветения вишни" },
        { id: "opt-b", text: "Об открытии новой ветки метро" },
        { id: "opt-c", text: "О местных выборах" },
        { id: "opt-d", text: "О дорожно-транспортном происшествии" },
      ],
      hint: "Самое первое предложение называет мероприятие и когда оно начинается.",
      explanation: {
        whereInText: "«서울 마포구는 다음 주 토요일부터 이틀간 '한강 벚꽃 축제'를 연다고 밝혔다» (Район Мапхо в Сеуле объявил, что проведёт «Фестиваль цветения вишни у реки Хан» в течение двух дней, начиная со следующей субботы).",
        keywords: "한강 벚꽃 축제",
        whyCorrect: "Первое предложение напрямую называет фестиваль, а остальная часть статьи описывает его программу, ожидаемую посещаемость и меры безопасности.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Об открытии метро, поезда или транспортной линии не упоминается — только общий призыв пользоваться общественным транспортом." },
          { optionId: "opt-c", reason: "Нет упоминания кандидатов, голосования или выборов." },
          { optionId: "opt-d", reason: "Нигде не описывается происшествие, травма или инцидент." },
        ],
        vocabulary: [{ term: "축제", translation: "фестиваль" }],
        grammarPattern: "«-다고 밝혔다» (объявил, что...) — распространённая новостная конструкция для косвенного цитирования официального заявления.",
        strategy: "В коротких новостных заметках первое, похожее на заголовок предложение почти всегда называет основное событие — сначала подтвердите тему там, прежде чем читать детали.",
      },
    },
    kz: {
      prompt: "Бұл жаңалық қысқаша негізінен не туралы?",
      options: [
        { id: "opt-a", text: "Алдағы шие гүлдену фестивалі туралы" },
        { id: "opt-b", text: "Жаңа метро желісінің ашылуы туралы" },
        { id: "opt-c", text: "Жергілікті сайлау туралы" },
        { id: "opt-d", text: "Жол-көлік оқиғасы туралы" },
      ],
      hint: "Ең бірінші сөйлем іс-шараны және оның қашан басталатынын атайды.",
      explanation: {
        whereInText: "«서울 마포구는 다음 주 토요일부터 이틀간 '한강 벚꽃 축제'를 연다고 밝혔다» (Сеулдің Мапхо ауданы келесі сенбіден бастап екі күн бойы «Хан өзені шие гүлдену фестивалін» өткізетінін мәлімдеді).",
        keywords: "한강 벚꽃 축제",
        whyCorrect: "Бірінші сөйлем фестивальді тікелей атайды, ал мақаланың қалған бөлігі оның бағдарламаларын, күтілетін қатысушылар санын және қауіпсіздік жоспарларын сипаттайды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Метро, пойыз немесе көлік желісінің ашылуы туралы айтылмайды — тек қоғамдық көлікті пайдалану туралы жалпы шақыру бар." },
          { optionId: "opt-c", reason: "Кандидаттар, дауыс беру немесе сайлау туралы айтылмайды." },
          { optionId: "opt-d", reason: "Ешбір жерде оқиға, жарақат немесе апат сипатталмайды." },
        ],
        vocabulary: [{ term: "축제", translation: "фестиваль" }],
        grammarPattern: "«-다고 밝혔다» (...деп мәлімдеді) — ресми мәлімдемені жанама түрде дәйексөз ретінде келтіретін жиі кездесетін жаңалық құрылымы.",
        strategy: "Қысқа жаңалықтарда тақырыпқа ұқсас бірінші сөйлем әдетте негізгі оқиғаны айтады — детальдерді оқымас бұрын алдымен сол жерде тақырыпты растаңыз.",
      },
    },
  },
};

const l3FestivalQ2: QuestionSpec = {
  id: "topik3-local-festival-news-1-q2",
  passageId: "topik3-local-festival-news-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "correctStatement",
  evidenceQuote: "방문객이 지난해보다 두 배 이상 늘어날 것으로 예상하며",
  content: {
    en: {
      prompt: "Which statement matches the article?",
      options: [
        { id: "opt-a", text: "This is the first time the festival has ever been held." },
        { id: "opt-b", text: "Organizers expect more visitors than last year." },
        { id: "opt-c", text: "The festival lasts for one week." },
        { id: "opt-d", text: "There is no entertainment planned." },
      ],
      hint: "Check the number comparison to last year's attendance carefully.",
      explanation: {
        whereInText: "\"방문객이 지난해보다 두 배 이상 늘어날 것으로 예상하며\" (expecting visitors to more than double compared to last year).",
        keywords: "지난해보다 두 배 이상",
        whyCorrect: "This directly states organizers' expectation of more visitors than the previous year — matching the statement exactly.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The article says \"코로나 이후 5년 만에 다시 열리는\" (held again after 5 years since COVID) — implying it existed before, not a first-ever event." },
          { optionId: "opt-c", reason: "The article states \"이틀간\" (for two days), not one week." },
          { optionId: "opt-d", reason: "A singer's celebratory performance is explicitly planned for the first evening." },
        ],
        vocabulary: [{ term: "두 배", translation: "double / twice as much" }],
        grammarPattern: "\"-을 것으로 예상하며\" (expecting that...) reports an organization's forecast, common in news writing about upcoming events.",
        strategy: "For \"which statement matches\" questions, check numbers and dates against the text word for word — plausible-sounding distractors often just swap one number or detail.",
      },
    },
    ru: {
      prompt: "Какое утверждение соответствует статье?",
      options: [
        { id: "opt-a", text: "Это первый раз, когда фестиваль вообще проводится." },
        { id: "opt-b", text: "Организаторы ожидают больше посетителей, чем в прошлом году." },
        { id: "opt-c", text: "Фестиваль длится одну неделю." },
        { id: "opt-d", text: "Развлекательная программа не запланирована." },
      ],
      hint: "Внимательно проверьте сравнение чисел с посещаемостью прошлого года.",
      explanation: {
        whereInText: "«방문객이 지난해보다 두 배 이상 늘어날 것으로 예상하며» (ожидая, что число посетителей более чем удвоится по сравнению с прошлым годом).",
        keywords: "지난해보다 두 배 이상",
        whyCorrect: "Это напрямую заявляет об ожидании организаторов большего числа посетителей, чем в прошлом году — точно совпадает с утверждением.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "В статье сказано «코로나 이후 5년 만에 다시 열리는» (проводится снова спустя 5 лет после COVID) — это подразумевает, что фестиваль уже существовал, а не проводится впервые." },
          { optionId: "opt-c", reason: "В статье указано «이틀간» (в течение двух дней), а не неделю." },
          { optionId: "opt-d", reason: "На первый вечер прямо запланировано праздничное выступление певца." },
        ],
        vocabulary: [{ term: "두 배", translation: "вдвое / в два раза" }],
        grammarPattern: "«-을 것으로 예상하며» (ожидая, что...) сообщает прогноз организации — распространено в новостях о предстоящих событиях.",
        strategy: "В вопросах «какое утверждение соответствует» сверяйте числа и даты с текстом слово в слово — правдоподобные отвлекающие варианты часто просто меняют одну цифру или деталь.",
      },
    },
    kz: {
      prompt: "Мақалаға қай тұжырым сәйкес келеді?",
      options: [
        { id: "opt-a", text: "Бұл фестивальдің тұңғыш рет өткізілуі." },
        { id: "opt-b", text: "Ұйымдастырушылар өткен жылға қарағанда көбірек қонақ күтеді." },
        { id: "opt-c", text: "Фестиваль бір апта бойы жалғасады." },
        { id: "opt-d", text: "Ешбір ойын-сауық жоспарланбаған." },
      ],
      hint: "Өткен жылғы қатысушылар санымен салыстырылған сандарды мұқият тексеріңіз.",
      explanation: {
        whereInText: "«방문객이 지난해보다 두 배 이상 늘어날 것으로 예상하며» (қонақтар саны өткен жылмен салыстырғанда екі еседен астам артады деп күтіп).",
        keywords: "지난해보다 두 배 이상",
        whyCorrect: "Бұл ұйымдастырушылардың өткен жылға қарағанда көбірек қонақ күтетінін тікелей айтады — тұжырыммен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Мақалада «코로나 이후 5년 만에 다시 열리는» (COVID-тен кейін 5 жылдан соң қайта өткізіледі) делінген — бұл фестивальдің бұрын да болғанын білдіреді, тұңғыш емес." },
          { optionId: "opt-c", reason: "Мақалада «이틀간» (екі күн бойы) көрсетілген, апта емес." },
          { optionId: "opt-d", reason: "Бірінші кешке әнші орындайтын салтанатты өнер көрсету нақты жоспарланған." },
        ],
        vocabulary: [{ term: "두 배", translation: "екі есе" }],
        grammarPattern: "«-을 것으로 예상하며» (...деп күтіп) ұйымның болжамын хабарлайды, алдағы оқиғалар туралы жаңалықтарда жиі кездеседі.",
        strategy: "«Қай тұжырым сәйкес келеді» сұрақтарында сандар мен даталарды мәтінмен сөзбе-сөз салыстырыңыз — сенімді көрінетін нұсқалар жиі бір санды немесе детальді ғана ауыстырады.",
      },
    },
  },
};

const l3FestivalQ3: QuestionSpec = {
  id: "topik3-local-festival-news-1-q3",
  passageId: "topik3-local-festival-news-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "authorIntention",
  evidenceQuote: "구청 관계자는 안전 관리를 위해 추가 인력을 배치할 계획이라고 설명했다.",
  content: {
    en: {
      prompt: "Why does the article mention that extra staff will be deployed?",
      options: [
        { id: "opt-a", text: "To reassure readers that safety is being managed given the expected crowds" },
        { id: "opt-b", text: "To criticize the district office" },
        { id: "opt-c", text: "To announce new job openings" },
        { id: "opt-d", text: "To explain a change in festival dates" },
      ],
      hint: "Read this sentence together with the earlier mention of a large expected crowd — what connects the two ideas?",
      explanation: {
        whereInText: "\"구청 관계자는 안전 관리를 위해 추가 인력을 배치할 계획이라고 설명했다\" (A district office official explained that extra staff will be deployed for safety management).",
        keywords: "안전 관리를 위해 추가 인력",
        whyCorrect: "Placed right after the article discusses a doubled crowd and a big performance drawing more people, this detail directly addresses the safety concern that a large crowd raises.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The tone is informational, quoting an official's explanation — nothing criticizes the district office." },
          { optionId: "opt-c", reason: "\"추가 인력을 배치\" (deploy extra staff) describes an internal safety measure, not a public job announcement." },
          { optionId: "opt-d", reason: "No date change is mentioned anywhere in the article." },
        ],
        vocabulary: [{ term: "배치하다", translation: "to deploy / to station" }],
        grammarPattern: "\"-기 위해\" (in order to) links an action to its purpose — here, connecting extra staffing directly to the goal of safety management.",
        strategy: "For author's-intention questions, connect the sentence to what was mentioned just before it — details rarely appear in isolation from the surrounding context.",
      },
    },
    ru: {
      prompt: "Зачем в статье упоминается, что будет привлечён дополнительный персонал?",
      options: [
        { id: "opt-a", text: "Чтобы заверить читателей, что безопасность обеспечена с учётом ожидаемой толпы" },
        { id: "opt-b", text: "Чтобы раскритиковать районную администрацию" },
        { id: "opt-c", text: "Чтобы объявить о новых вакансиях" },
        { id: "opt-d", text: "Чтобы объяснить изменение дат фестиваля" },
      ],
      hint: "Прочитайте это предложение вместе с более ранним упоминанием большой ожидаемой толпы — что связывает эти две идеи?",
      explanation: {
        whereInText: "«구청 관계자는 안전 관리를 위해 추가 인력을 배치할 계획이라고 설명했다» (Представитель районной администрации пояснил, что для управления безопасностью будет размещён дополнительный персонал).",
        keywords: "안전 관리를 위해 추가 인력",
        whyCorrect: "Расположенная сразу после обсуждения удвоенной толпы и крупного выступления, привлекающего больше людей, эта деталь напрямую отвечает на опасение о безопасности, которое вызывает большая толпа.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Тон информационный, цитируется объяснение чиновника — ничего не критикует районную администрацию." },
          { optionId: "opt-c", reason: "«추가 인력을 배치» (разместить дополнительный персонал) описывает внутреннюю меру безопасности, а не публичное объявление о вакансиях." },
          { optionId: "opt-d", reason: "Об изменении дат в статье нигде не упоминается." },
        ],
        vocabulary: [{ term: "배치하다", translation: "размещать / расставлять" }],
        grammarPattern: "«-기 위해» (для того, чтобы) связывает действие с его целью — здесь напрямую связывая дополнительный персонал с целью управления безопасностью.",
        strategy: "В вопросах о намерении автора связывайте предложение с тем, что упоминалось непосредственно перед ним — детали редко появляются в отрыве от окружающего контекста.",
      },
    },
    kz: {
      prompt: "Мақалада неге қосымша қызметкерлер тартылатыны айтылады?",
      options: [
        { id: "opt-a", text: "Оқырмандарды күтілетін тобырды ескере отырып қауіпсіздік қамтамасыз етіліп жатқанына сендіру үшін" },
        { id: "opt-b", text: "Аудан әкімшілігін сынау үшін" },
        { id: "opt-c", text: "Жаңа жұмыс орындарын жариялау үшін" },
        { id: "opt-d", text: "Фестиваль даталарының өзгеруін түсіндіру үшін" },
      ],
      hint: "Бұл сөйлемді бұрын аталған үлкен тобыр туралы жолмен бірге оқыңыз — екі ойды не байланыстырады?",
      explanation: {
        whereInText: "«구청 관계자는 안전 관리를 위해 추가 인력을 배치할 계획이라고 설명했다» (Аудан әкімшілігінің өкілі қауіпсіздікті басқару үшін қосымша қызметкерлер орналастырылатынын түсіндірді).",
        keywords: "안전 관리를 위해 추가 인력",
        whyCorrect: "Екі есе тобыр мен көбірек адам тартатын үлкен өнер көрсету туралы айтылғаннан кейін бірден орналасқан бұл деталь үлкен тобыр тудыратын қауіпсіздік алаңдаушылығына тікелей жауап береді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Үні ақпараттық, шенеуніктің түсіндірмесі келтірілген — аудан әкімшілігін ешбір сын жоқ." },
          { optionId: "opt-c", reason: "«추가 인력을 배치» (қосымша қызметкер орналастыру) ішкі қауіпсіздік шарасын сипаттайды, көпшілікке арналған жұмыс хабарландыруын емес." },
          { optionId: "opt-d", reason: "Дата өзгеруі туралы мақалада мүлде айтылмайды." },
        ],
        vocabulary: [{ term: "배치하다", translation: "орналастыру" }],
        grammarPattern: "«-기 위해» (үшін) әрекетті оның мақсатымен байланыстырады — мұнда қосымша қызметкерлерді қауіпсіздікті басқару мақсатымен тікелей байланыстырады.",
        strategy: "Автордың ниеті туралы сұрақтарда сөйлемді оның алдында аталғанмен байланыстырыңыз — детальдер сирек қоршаған контекстен бөлек пайда болады.",
      },
    },
  },
};

const L3_FESTIVAL_VOCAB: VocabularySpec[] = [
  {
    term: "주최 측",
    translation: { en: "organizer(s)", ru: "организаторы", kz: "ұйымдастырушылар" },
    definition: {
      en: "The party responsible for planning and running an event.",
      ru: "Сторона, ответственная за планирование и проведение мероприятия.",
      kz: "Іс-шараны жоспарлауға және өткізуге жауапты тарап.",
    },
    exampleSentence: "주최 측은 방문객이 지난해보다 두 배 이상 늘어날 것으로 예상했다.",
  },
  {
    term: "인파",
    translation: { en: "crowd of people", ru: "толпа людей", kz: "адам тобыры" },
    definition: {
      en: "A large number of people gathered in one place.",
      ru: "Большое количество людей, собравшихся в одном месте.",
      kz: "Бір жерге жиналған көп адам.",
    },
    exampleSentence: "많은 인파가 몰릴 것으로 보인다.",
  },
];

export const TOPIK_LEVEL_3_PASSAGES: TopikReadingPassage[] = [L3_JEJU_BLOG, L3_FESTIVAL_NEWS];
export const TOPIK_LEVEL_3_QUESTIONS: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  "topik3-jeju-blog-1": buildPassageQuestions(l3JejuQ1, l3JejuQ2, l3JejuQ3),
  "topik3-local-festival-news-1": buildPassageQuestions(l3FestivalQ1, l3FestivalQ2, l3FestivalQ3),
};
export const TOPIK_LEVEL_3_VOCAB: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  "topik3-jeju-blog-1": buildVocabulary(L3_JEJU_VOCAB),
  "topik3-local-festival-news-1": buildVocabulary(L3_FESTIVAL_VOCAB),
};

// ---------------------------------------------------------------------------
// Level 4 — 4급 Intermediate II: abstract/social topics, formal register,
// ~200-220 words.
// ---------------------------------------------------------------------------

const L4_WORKLIFE_BALANCE: TopikReadingPassage = {
  id: "topik4-worklife-balance-1",
  textType: "Opinion article",
  title: "An opinion piece on work-life balance",
  body: "최근 몇 년 사이 '워라밸'이라는 단어가 직장인들 사이에서 널리 쓰이고 있다. 이는 일과 삶의 균형을 뜻하는 말로, 과거처럼 회사 일에만 몰두하는 대신 개인의 삶도 소중히 여기려는 사회적 분위기를 반영한다. 그러나 일부 전문가들은 이러한 흐름이 오히려 조직의 생산성을 떨어뜨릴 수 있다고 지적한다. 특히 마감이 임박한 프로젝트에서도 정시 퇴근을 고집하는 태도는 동료들에게 부담을 전가할 위험이 있다는 것이다. 반면 다른 전문가들은 장시간 노동이 오히려 창의성과 효율성을 저해한다고 주장하며, 충분한 휴식이야말로 장기적으로 더 나은 성과를 만든다고 강조한다. 두 입장 모두 나름의 근거가 있지만, 결국 중요한 것은 개인의 상황과 조직의 문화에 맞는 균형점을 찾는 것이다. 획일적인 기준을 모든 직장에 적용하려는 시도는 오히려 갈등을 키울 수 있다.",
  estimatedWordCount: 200,
};

const l4WorklifeQ1: QuestionSpec = {
  id: "topik4-worklife-balance-1-q1",
  passageId: "topik4-worklife-balance-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "mainIdea",
  evidenceQuote: "결국 중요한 것은 개인의 상황과 조직의 문화에 맞는 균형점을 찾는 것이다.",
  content: {
    en: {
      prompt: "What is the main point of this article?",
      options: [
        { id: "opt-a", text: "Finding a balance suited to individual and organizational context matters more than a single fixed standard" },
        { id: "opt-b", text: "Everyone should work overtime" },
        { id: "opt-c", text: "Work-life balance should be banned" },
        { id: "opt-d", text: "Companies should fire employees who leave on time" },
      ],
      hint: "The article presents two opposing expert views before reaching its own conclusion — look at the sentence right after both sides are summarized.",
      explanation: {
        whereInText: "\"결국 중요한 것은 개인의 상황과 조직의 문화에 맞는 균형점을 찾는 것이다\" (In the end, what matters is finding a balance point suited to individual circumstances and organizational culture).",
        keywords: "개인의 상황과 조직의 문화에 맞는 균형점",
        whyCorrect: "This sentence, followed by the warning against \"획일적인 기준\" (a uniform standard) for every workplace, is the article's actual conclusion after weighing both expert views.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The article presents overtime critically, quoting experts who argue long hours hurt creativity — it doesn't recommend it universally." },
          { optionId: "opt-c", reason: "The article never argues work-life balance itself should be eliminated, only that a rigid, one-size-fits-all approach is risky." },
          { optionId: "opt-d", reason: "No such recommendation about firing employees appears anywhere." },
        ],
        vocabulary: [{ term: "균형점", translation: "balance point" }],
        grammarPattern: "\"결국 중요한 것은 -는 것이다\" (in the end, what matters is...) is a common way Korean opinion pieces state their final position after presenting multiple viewpoints.",
        strategy: "In opinion articles with two competing views, the author's real position is usually stated in the concluding sentences, not in either side's argument alone.",
      },
    },
    ru: {
      prompt: "В чём главная мысль этой статьи?",
      options: [
        { id: "opt-a", text: "Найти баланс, подходящий конкретному человеку и организации, важнее единого фиксированного стандарта" },
        { id: "opt-b", text: "Все должны работать сверхурочно" },
        { id: "opt-c", text: "Баланс между работой и личной жизнью следует запретить" },
        { id: "opt-d", text: "Компании должны увольнять сотрудников, уходящих вовремя" },
      ],
      hint: "Статья представляет два противоположных экспертных мнения перед тем, как прийти к собственному выводу — посмотрите на предложение сразу после того, как обе стороны обобщены.",
      explanation: {
        whereInText: "«결국 중요한 것은 개인의 상황과 조직의 문화에 맞는 균형점을 찾는 것이다» (В конце концов, важно найти баланс, соответствующий личным обстоятельствам и культуре организации).",
        keywords: "개인의 상황과 조직의 문화에 맞는 균형점",
        whyCorrect: "Это предложение вместе с предостережением против «획일적인 기준» (единого стандарта) для каждого рабочего места — реальный вывод статьи после взвешивания обеих экспертных точек зрения.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Статья критически представляет сверхурочную работу, цитируя экспертов, утверждающих, что долгие часы вредят творчеству — она не рекомендует это повсеместно." },
          { optionId: "opt-c", reason: "Статья никогда не утверждает, что сам баланс между работой и жизнью нужно устранить, только что жёсткий универсальный подход рискован." },
          { optionId: "opt-d", reason: "Такой рекомендации об увольнении сотрудников нигде не встречается." },
        ],
        vocabulary: [{ term: "균형점", translation: "точка баланса" }],
        grammarPattern: "«결국 중요한 것은 -는 것이다» (в конце концов, важно то, что...) — распространённый способ, которым корейские статьи-мнения формулируют итоговую позицию после представления нескольких точек зрения.",
        strategy: "В статьях-мнениях с двумя конкурирующими взглядами реальная позиция автора обычно изложена в заключительных предложениях, а не в аргументах какой-либо одной стороны.",
      },
    },
    kz: {
      prompt: "Бұл мақаланың негізгі ойы қандай?",
      options: [
        { id: "opt-a", text: "Жеке адам мен ұйымға сай теңгерім табу бір біркелкі стандарттан маңыздырақ" },
        { id: "opt-b", text: "Барлығы қосымша уақыт жұмыс істеуі керек" },
        { id: "opt-c", text: "Жұмыс пен өмір теңгерімі тыйым салынуы керек" },
        { id: "opt-d", text: "Компаниялар уақытында кететін қызметкерлерді жұмыстан шығаруы керек" },
      ],
      hint: "Мақала өз қорытындысына келмес бұрын екі қарама-қарсы сарапшы көзқарасын келтіреді — екі жақ қорытылғаннан кейінгі сөйлемге қараңыз.",
      explanation: {
        whereInText: "«결국 중요한 것은 개인의 상황과 조직의 문화에 맞는 균형점을 찾는 것이다» (Ақыр соңында маңыздысы — жеке жағдай мен ұйым мәдениетіне сай теңгерім табу).",
        keywords: "개인의 상황과 조직의 문화에 맞는 균형점",
        whyCorrect: "Бұл сөйлем әр жұмыс орнына «획일적인 기준» (біркелкі стандарт) қоюдан сақтандырумен бірге, екі сарапшы көзқарасын салмақтағаннан кейінгі мақаланың нақты қорытындысы.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мақала қосымша уақытты сынай отырып, ұзақ жұмыс сағаттары шығармашылыққа зиян тигізетінін айтатын сарапшыларды келтіреді — оны жалпыға ұсынбайды." },
          { optionId: "opt-c", reason: "Мақала жұмыс пен өмір теңгерімінің өзін жоюды ешқашан айтпайды, тек қатаң, барлығына бірдей әдіс қауіпті екенін айтады." },
          { optionId: "opt-d", reason: "Қызметкерлерді жұмыстан шығару туралы мұндай ұсыныс ешбір жерде жоқ." },
        ],
        vocabulary: [{ term: "균형점", translation: "теңгерім нүктесі" }],
        grammarPattern: "«결국 중요한 것은 -는 것이다» (ақыр соңында маңыздысы — ...) — корей пікір мақалаларының бірнеше көзқарасты келтіргеннен кейін өз соңғы ұстанымын білдіретін жиі кездесетін тәсілі.",
        strategy: "Екі қарама-қарсы көзқарасы бар пікір мақалаларында автордың нақты ұстанымы әдетте бір жақтың дәлелінде емес, қорытынды сөйлемдерде айтылады.",
      },
    },
  },
};

const l4WorklifeQ2: QuestionSpec = {
  id: "topik4-worklife-balance-1-q2",
  passageId: "topik4-worklife-balance-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "동료들에게 부담을 전가할 위험이 있다는 것이다.",
  content: {
    en: {
      prompt: "According to the article, what risk do critics of strict on-time departure raise?",
      options: [
        { id: "opt-a", text: "Passing the burden onto coworkers" },
        { id: "opt-b", text: "Losing customers" },
        { id: "opt-c", text: "Reducing salaries" },
        { id: "opt-d", text: "Increasing turnover" },
      ],
      hint: "This risk is mentioned right after the example of insisting on leaving on time during an urgent project.",
      explanation: {
        whereInText: "\"동료들에게 부담을 전가할 위험이 있다는 것이다\" (there is a risk of passing the burden onto colleagues).",
        keywords: "동료들에게 부담을 전가할",
        whyCorrect: "This phrase states exactly this risk — extra work shifting onto coworkers when someone insists on leaving on time.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Customers are never mentioned anywhere in the article." },
          { optionId: "opt-c", reason: "Salaries are not discussed in this context at all." },
          { optionId: "opt-d", reason: "Employee turnover (people quitting) is not mentioned in the article." },
        ],
        vocabulary: [{ term: "전가하다", translation: "to pass on (a burden) / to shift" }],
        grammarPattern: "\"-ㄹ/을 위험이 있다\" (there is a risk of...) is a common hedge used when introducing a potential negative consequence, not a certainty.",
        strategy: "For detail questions about a specific claim, find the exact noun phrase (here, \"부담\"/burden and who it's \"전가\"/passed to) rather than a general impression of the paragraph.",
      },
    },
    ru: {
      prompt: "Какой риск, согласно статье, отмечают критики строгого ухода вовремя?",
      options: [
        { id: "opt-a", text: "Перекладывание нагрузки на коллег" },
        { id: "opt-b", text: "Потерю клиентов" },
        { id: "opt-c", text: "Снижение зарплат" },
        { id: "opt-d", text: "Рост текучести кадров" },
      ],
      hint: "Этот риск упоминается сразу после примера настойчивого ухода вовремя во время срочного проекта.",
      explanation: {
        whereInText: "«동료들에게 부담을 전가할 위험이 있다는 것이다» (существует риск переложить нагрузку на коллег).",
        keywords: "동료들에게 부담을 전가할",
        whyCorrect: "Эта фраза прямо описывает именно этот риск — дополнительная работа перекладывается на коллег, когда кто-то настаивает на уходе вовремя.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "О клиентах в статье нигде не упоминается." },
          { optionId: "opt-c", reason: "Зарплаты в этом контексте вообще не обсуждаются." },
          { optionId: "opt-d", reason: "Текучесть кадров (увольнения) в статье не упоминается." },
        ],
        vocabulary: [{ term: "전가하다", translation: "перекладывать (нагрузку)" }],
        grammarPattern: "«-ㄹ/을 위험이 있다» (существует риск...) — распространённая оговорка при введении потенциального негативного последствия, а не факта.",
        strategy: "В детальных вопросах о конкретном утверждении находите точную именную группу (здесь «부담»/нагрузка и на кого она «전가»/перекладывается), а не общее впечатление от абзаца.",
      },
    },
    kz: {
      prompt: "Мақалаға сәйкес, уақытында кетуді талап ететіндерді сынаушылар қандай қауіп туралы айтады?",
      options: [
        { id: "opt-a", text: "Жүкті әріптестерге аудару" },
        { id: "opt-b", text: "Клиенттерді жоғалту" },
        { id: "opt-c", text: "Жалақыны азайту" },
        { id: "opt-d", text: "Қызметкерлердің ауысымын арттыру" },
      ],
      hint: "Бұл қауіп шұғыл жобада уақытында кетуді талап ету мысалынан кейін бірден аталады.",
      explanation: {
        whereInText: "«동료들에게 부담을 전가할 위험이 있다는 것이다» (әріптестерге жүкті аудару қаупі бар).",
        keywords: "동료들에게 부담을 전가할",
        whyCorrect: "Бұл тіркес дәл осы қауіпті айтады — біреу уақытында кетуді талап еткенде қосымша жұмыс әріптестерге ауады.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Клиенттер туралы мақалада мүлде айтылмайды." },
          { optionId: "opt-c", reason: "Жалақы бұл контексте мүлде талқыланбайды." },
          { optionId: "opt-d", reason: "Қызметкерлердің жұмыстан кетуі туралы мақалада айтылмайды." },
        ],
        vocabulary: [{ term: "전가하다", translation: "(жүкті) аудару" }],
        grammarPattern: "«-ㄹ/을 위험이 있다» (...қаупі бар) ықтимал теріс салдарды енгізу кезінде қолданылатын жиі кездесетін сақтық тәсілі, факт емес.",
        strategy: "Нақты тұжырым туралы детальді сұрақтарда абзацтың жалпы әсерін емес, нақты зат есім тіркесін (мұнда «부담»/жүк және ол кімге «전가»/ауатынын) табыңыз.",
      },
    },
  },
};

const l4WorklifeQ3: QuestionSpec = {
  id: "topik4-worklife-balance-1-q3",
  passageId: "topik4-worklife-balance-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "inference",
  evidenceQuote: "획일적인 기준을 모든 직장에 적용하려는 시도는 오히려 갈등을 키울 수 있다.",
  content: {
    en: {
      prompt: "What can be inferred about the author's own stance?",
      options: [
        { id: "opt-a", text: "The author favors flexible, context-specific solutions over one-size-fits-all rules" },
        { id: "opt-b", text: "The author strongly opposes work-life balance entirely" },
        { id: "opt-c", text: "The author believes only long hours lead to success" },
        { id: "opt-d", text: "The author has no opinion at all" },
      ],
      hint: "The final sentence warns against a specific kind of approach — what does that warning suggest the author actually favors?",
      explanation: {
        whereInText: "\"획일적인 기준을 모든 직장에 적용하려는 시도는 오히려 갈등을 키울 수 있다\" (Trying to apply a uniform standard to every workplace can actually increase conflict).",
        keywords: "획일적인 기준",
        whyCorrect: "By warning against uniform standards right after stating that finding a fitting balance point matters, the author implicitly favors flexible, situation-specific solutions.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The author presents both sides fairly and never argues to eliminate work-life balance itself." },
          { optionId: "opt-c", reason: "The article quotes experts who argue long hours hurt creativity — the author doesn't adopt that view as the sole truth either." },
          { optionId: "opt-d", reason: "The concluding sentences do state a clear position (avoid rigid, uniform rules) — this isn't neutral silence." },
        ],
        vocabulary: [{ term: "획일적", translation: "uniform / one-size-fits-all" }],
        grammarPattern: "\"-려는 시도는 -을 수 있다\" (an attempt to... can...) frames a cautionary prediction — often used to argue against a proposed approach without stating it as fact.",
        strategy: "For inference questions about an author's stance in an opinion piece, focus on the final sentence's warning or recommendation — it usually reveals the author's real position even when both sides were presented fairly.",
      },
    },
    ru: {
      prompt: "Что можно понять о собственной позиции автора?",
      options: [
        { id: "opt-a", text: "Автор предпочитает гибкие, зависящие от контекста решения универсальным правилам" },
        { id: "opt-b", text: "Автор категорически против баланса между работой и личной жизнью в целом" },
        { id: "opt-c", text: "Автор считает, что только долгие часы работы ведут к успеху" },
        { id: "opt-d", text: "У автора вообще нет мнения" },
      ],
      hint: "Последнее предложение предостерегает от определённого подхода — что это предостережение говорит о том, что на самом деле предпочитает автор?",
      explanation: {
        whereInText: "«획일적인 기준을 모든 직장에 적용하려는 시도는 오히려 갈등을 키울 수 있다» (Попытка применить единый стандарт ко всем рабочим местам может, наоборот, усилить конфликт).",
        keywords: "획일적인 기준",
        whyCorrect: "Предостерегая от единых стандартов сразу после утверждения о важности нахождения подходящего баланса, автор косвенно выступает за гибкие, зависящие от ситуации решения.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Автор представляет обе стороны справедливо и никогда не выступает за полное устранение баланса между работой и жизнью." },
          { optionId: "opt-c", reason: "В статье цитируются эксперты, утверждающие, что долгие часы вредят творчеству — автор тоже не принимает эту точку зрения как единственную истину." },
          { optionId: "opt-d", reason: "Заключительные предложения ясно выражают позицию (избегать жёстких, единых правил) — это не нейтральное молчание." },
        ],
        vocabulary: [{ term: "획일적", translation: "единообразный / универсальный" }],
        grammarPattern: "«-려는 시도는 -을 수 있다» (попытка... может...) формулирует предостерегающий прогноз — часто используется, чтобы возразить против предлагаемого подхода, не заявляя это как факт.",
        strategy: "В вопросах на вывод о позиции автора в статье-мнении сосредоточьтесь на предостережении или рекомендации в последнем предложении — оно обычно раскрывает настоящую позицию автора, даже если обе стороны были представлены справедливо.",
      },
    },
    kz: {
      prompt: "Автордың өз ұстанымы туралы не деп қорытынды жасауға болады?",
      options: [
        { id: "opt-a", text: "Автор барлығына бірдей ережелерден гөрі икемді, жағдайға сай шешімдерді жақсы көреді" },
        { id: "opt-b", text: "Автор жұмыс пен өмір теңгеріміне мүлдем қарсы" },
        { id: "opt-c", text: "Автор тек ұзақ жұмыс сағаттары ғана табысқа әкеледі деп есептейді" },
        { id: "opt-d", text: "Автордың мүлде пікірі жоқ" },
      ],
      hint: "Соңғы сөйлем белгілі бір көзқарастан сақтандырады — бұл сақтандыру автордың шын мәнінде нені жақсы көретінін көрсетеді?",
      explanation: {
        whereInText: "«획일적인 기준을 모든 직장에 적용하려는 시도는 오히려 갈등을 키울 수 있다» (Барлық жұмыс орнына біркелкі стандарт қолдануға тырысу керісінше қақтығысты күшейтуі мүмкін).",
        keywords: "획일적인 기준",
        whyCorrect: "Сәйкес теңгерім табу маңызды екенін айтқаннан кейін бірден біркелкі стандарттардан сақтандыру арқылы автор жанама түрде икемді, жағдайға сай шешімдерді жақтайды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Автор екі жақты да әділ көрсетеді және жұмыс пен өмір теңгерімінің өзін жоюды ешқашан жақтамайды." },
          { optionId: "opt-c", reason: "Мақалада ұзақ жұмыс сағаттары шығармашылыққа зиян тигізеді дейтін сарапшылар келтіріледі — автор да мұны жалғыз ақиқат ретінде қабылдамайды." },
          { optionId: "opt-d", reason: "Қорытынды сөйлемдер нақты ұстанымды білдіреді (қатаң, біркелкі ережелерден аулақ болу) — бұл бейтарап үнсіздік емес." },
        ],
        vocabulary: [{ term: "획일적", translation: "біркелкі / бәріне ортақ" }],
        grammarPattern: "«-려는 시도는 -을 수 있다» (...тырысу... мүмкін) сақтандыратын болжамды құрайды — ұсынылған көзқарасқа қарсы дәлел келтіру үшін, оны факт ретінде айтпай, жиі қолданылады.",
        strategy: "Пікір мақаласындағы автордың ұстанымы туралы қорытынды сұрақтарда соңғы сөйлемдегі ескертуге немесе ұсынысқа назар аударыңыз — ол екі жақ әділ көрсетілсе де, автордың нақты ұстанымын әдетте ашады.",
      },
    },
  },
};

const L4_WORKLIFE_VOCAB: VocabularySpec[] = [
  {
    term: "생산성",
    translation: { en: "productivity", ru: "производительность", kz: "өнімділік" },
    definition: {
      en: "The efficiency with which work is produced or output is generated.",
      ru: "Эффективность выполнения работы или производства продукции.",
      kz: "Жұмыстың немесе өнімнің шығарылу тиімділігі.",
    },
    exampleSentence: "이러한 흐름이 오히려 조직의 생산성을 떨어뜨릴 수 있다.",
  },
  {
    term: "균형",
    translation: { en: "balance", ru: "баланс", kz: "теңгерім" },
    definition: {
      en: "A state in which different elements are equal or proportionate.",
      ru: "Состояние, при котором разные элементы равны или соразмерны.",
      kz: "Әртүрлі элементтердің тең немесе пропорционал болу жағдайы.",
    },
    exampleSentence: "개인의 상황과 조직의 문화에 맞는 균형점을 찾는 것이다.",
  },
];

const L4_PLASTIC_WASTE: TopikReadingPassage = {
  id: "topik4-plastic-waste-1",
  textType: "Informational article",
  title: "An informational article on plastic waste",
  body: "플라스틱은 값이 싸고 사용이 편리해 지난 수십 년간 우리 생활 곳곳에 자리 잡았다. 그러나 이러한 편리함의 이면에는 심각한 환경 문제가 숨어 있다. 한 번 만들어진 플라스틱은 자연적으로 분해되는 데 수백 년이 걸리며, 그 과정에서 잘게 쪼개진 미세 플라스틱이 바다와 토양으로 흘러 들어간다. 최근 연구에 따르면 이러한 미세 플라스틱은 물고기와 조개류를 통해 결국 사람의 몸속까지 들어올 가능성이 있다고 한다. 이에 여러 국가들은 일회용 플라스틱 사용을 줄이기 위한 정책을 앞다투어 도입하고 있다. 예를 들어 일부 도시에서는 비닐봉지 사용을 전면 금지했고, 다른 지역에서는 플라스틱 용기에 추가 비용을 부과하고 있다. 그러나 전문가들은 정책만으로는 부족하며, 대체 소재 개발과 소비자의 인식 변화가 함께 이루어져야 근본적인 해결이 가능하다고 입을 모은다.",
  estimatedWordCount: 210,
};

const l4PlasticQ1: QuestionSpec = {
  id: "topik4-plastic-waste-1-q1",
  passageId: "topik4-plastic-waste-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "mainIdea",
  evidenceQuote: "이러한 편리함의 이면에는 심각한 환경 문제가 숨어 있다.",
  content: {
    en: {
      prompt: "What is this article mainly about?",
      options: [
        { id: "opt-a", text: "The environmental dangers of plastic and possible policy/consumer solutions" },
        { id: "opt-b", text: "How to manufacture plastic more cheaply" },
        { id: "opt-c", text: "A history of packaging design" },
        { id: "opt-d", text: "New fishing regulations" },
      ],
      hint: "The article moves from a problem (hidden behind convenience) to responses to that problem — track that overall shape.",
      explanation: {
        whereInText: "\"이러한 편리함의 이면에는 심각한 환경 문제가 숨어 있다\" (Behind this convenience lies a serious environmental problem).",
        keywords: "심각한 환경 문제",
        whyCorrect: "The article explains microplastic pollution, then covers government bans/fees and experts' call for material innovation and consumer awareness — all environmental cause-and-response.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Manufacturing cost or process is never discussed — only plastic's low price is mentioned in passing." },
          { optionId: "opt-c", reason: "No history of packaging design or its evolution is described." },
          { optionId: "opt-d", reason: "Fishing regulations are not mentioned — fish are referenced only as a route microplastics take into the human body." },
        ],
        vocabulary: [{ term: "환경 문제", translation: "environmental problem" }],
        grammarPattern: "\"이러한 -의 이면에는 -이 숨어 있다\" (behind this... lies a hidden...) is a common structure for introducing a hidden downside to something seemingly positive.",
        strategy: "For informational articles, track the shift from problem to response — the main idea usually covers both halves, not just the opening issue.",
      },
    },
    ru: {
      prompt: "О чём в основном эта статья?",
      options: [
        { id: "opt-a", text: "Об экологических опасностях пластика и возможных решениях на уровне политики/потребителей" },
        { id: "opt-b", text: "О том, как производить пластик дешевле" },
        { id: "opt-c", text: "Об истории дизайна упаковки" },
        { id: "opt-d", text: "О новых правилах рыболовства" },
      ],
      hint: "Статья движется от проблемы (скрытой за удобством) к ответам на эту проблему — проследите эту общую структуру.",
      explanation: {
        whereInText: "«이러한 편리함의 이면에는 심각한 환경 문제가 숨어 있다» (За этим удобством скрывается серьёзная экологическая проблема).",
        keywords: "심각한 환경 문제",
        whyCorrect: "Статья объясняет загрязнение микропластиком, затем рассказывает о государственных запретах/сборах и призыве экспертов к разработке новых материалов и изменению сознания потребителей — всё это причины и ответы на экологическую проблему.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Стоимость или процесс производства нигде не обсуждаются — упоминается лишь низкая цена пластика мимоходом." },
          { optionId: "opt-c", reason: "История дизайна упаковки или её эволюция не описывается." },
          { optionId: "opt-d", reason: "Правила рыболовства не упоминаются — рыба упоминается лишь как путь микропластика в организм человека." },
        ],
        vocabulary: [{ term: "환경 문제", translation: "экологическая проблема" }],
        grammarPattern: "«이러한 -의 이면에는 -이 숨어 있다» (за этим... скрывается...) — распространённая структура для введения скрытого недостатка чего-то кажущегося положительным.",
        strategy: "В информационных статьях следите за переходом от проблемы к ответу — основная идея обычно охватывает обе половины, а не только начальную проблему.",
      },
    },
    kz: {
      prompt: "Бұл мақала негізінен не туралы?",
      options: [
        { id: "opt-a", text: "Пластиктің экологиялық қауіптері және мүмкін саясат/тұтынушы шешімдері туралы" },
        { id: "opt-b", text: "Пластикті арзанырақ өндіру жолы туралы" },
        { id: "opt-c", text: "Қаптама дизайнының тарихы туралы" },
        { id: "opt-d", text: "Жаңа балық аулау ережелері туралы" },
      ],
      hint: "Мақала мәселеден (ыңғайлылықтың артында жасырылған) сол мәселеге жауаптарға қарай жылжиды — осы жалпы құрылымды бақылаңыз.",
      explanation: {
        whereInText: "«이러한 편리함의 이면에는 심각한 환경 문제가 숨어 있다» (Осы ыңғайлылықтың артында елеулі экологиялық мәселе жасырылған).",
        keywords: "심각한 환경 문제",
        whyCorrect: "Мақала микропластик ластануын түсіндіреді, содан кейін мемлекеттік тыйымдар/төлемдерді және сарапшылардың жаңа материал әзірлеу мен тұтынушылардың хабардарлығын өзгертуге шақыруын қамтиды — бұның бәрі экологиялық себеп пен жауап.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Өндіру құны немесе процесі мүлде талқыланбайды — тек пластиктің арзан бағасы өтіп бара жатқанда аталады." },
          { optionId: "opt-c", reason: "Қаптама дизайнының тарихы немесе оның дамуы сипатталмайды." },
          { optionId: "opt-d", reason: "Балық аулау ережелері аталмайды — балық тек микропластиктің адам ағзасына жету жолы ретінде аталады." },
        ],
        vocabulary: [{ term: "환경 문제", translation: "экологиялық мәселе" }],
        grammarPattern: "«이러한 -의 이면에는 -이 숨어 있다» (осының артында... жасырылған) оң болып көрінетін нәрсенің жасырын кемшілігін енгізудің жиі кездесетін құрылымы.",
        strategy: "Ақпараттық мақалаларда мәселеден жауапқа өтуді бақылаңыз — негізгі ой әдетте бастапқы мәселені ғана емес, екі жартысын да қамтиды.",
      },
    },
  },
};

const l4PlasticQ2: QuestionSpec = {
  id: "topik4-plastic-waste-1-q2",
  passageId: "topik4-plastic-waste-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "일부 도시에서는 비닐봉지 사용을 전면 금지했고",
  content: {
    en: {
      prompt: "What have some cities done to reduce single-use plastic?",
      options: [
        { id: "opt-a", text: "Completely banned plastic bags" },
        { id: "opt-b", text: "Built new recycling factories" },
        { id: "opt-c", text: "Raised taxes on all packaging" },
        { id: "opt-d", text: "Banned plastic bottles only" },
      ],
      hint: "This example is given right after the article says countries are introducing policies to reduce single-use plastic.",
      explanation: {
        whereInText: "\"일부 도시에서는 비닐봉지 사용을 전면 금지했고\" (Some cities have completely banned the use of plastic bags).",
        keywords: "비닐봉지 사용을 전면 금지",
        whyCorrect: "\"전면 금지\" (complete ban) applied specifically to \"비닐봉지\" (plastic bags) matches this option exactly.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Recycling factories are never mentioned anywhere in the article." },
          { optionId: "opt-c", reason: "The article mentions extra fees on plastic containers in \"다른 지역\" (other regions), not taxes on all packaging." },
          { optionId: "opt-d", reason: "The ban described is on plastic bags, not bottles — bottles aren't mentioned." },
        ],
        vocabulary: [{ term: "전면 금지", translation: "complete ban" }],
        grammarPattern: "\"예를 들어\" (for example) introduces a specific illustration of a broader claim just made — here, the general policy trend.",
        strategy: "When a paragraph gives a general claim followed by \"예를 들어\" (for example), the specific detail asked about is usually right there in that example sentence.",
      },
    },
    ru: {
      prompt: "Что сделали некоторые города для сокращения одноразового пластика?",
      options: [
        { id: "opt-a", text: "Полностью запретили пластиковые пакеты" },
        { id: "opt-b", text: "Построили новые заводы по переработке" },
        { id: "opt-c", text: "Повысили налоги на всю упаковку" },
        { id: "opt-d", text: "Запретили только пластиковые бутылки" },
      ],
      hint: "Этот пример приведён сразу после того, как статья говорит, что страны вводят политику по сокращению одноразового пластика.",
      explanation: {
        whereInText: "«일부 도시에서는 비닐봉지 사용을 전면 금지했고» (Некоторые города полностью запретили использование полиэтиленовых пакетов).",
        keywords: "비닐봉지 사용을 전면 금지",
        whyCorrect: "«전면 금지» (полный запрет), применённый именно к «비닐봉지» (пластиковым пакетам), точно совпадает с этим вариантом.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "О заводах по переработке в статье нигде не упоминается." },
          { optionId: "opt-c", reason: "Статья упоминает дополнительные сборы за пластиковые контейнеры в «다른 지역» (других регионах), а не налоги на всю упаковку." },
          { optionId: "opt-d", reason: "Описанный запрет касается пакетов, а не бутылок — бутылки не упоминаются." },
        ],
        vocabulary: [{ term: "전면 금지", translation: "полный запрет" }],
        grammarPattern: "«예를 들어» (например) вводит конкретную иллюстрацию только что сделанного более общего утверждения — здесь общей тенденции политики.",
        strategy: "Когда абзац даёт общее утверждение, за которым следует «예를 들어» (например), запрашиваемая конкретная деталь обычно находится прямо в этом примере.",
      },
    },
    kz: {
      prompt: "Кейбір қалалар бір реттік пластикті азайту үшін не істеді?",
      options: [
        { id: "opt-a", text: "Полиэтилен пакеттерге толығымен тыйым салды" },
        { id: "opt-b", text: "Жаңа қайта өңдеу зауыттарын салды" },
        { id: "opt-c", text: "Барлық қаптамаға салықты арттырды" },
        { id: "opt-d", text: "Тек пластик бөтелкелерге тыйым салды" },
      ],
      hint: "Бұл мысал мақалада елдер бір реттік пластикті азайту саясатын енгізіп жатыр деп айтылғаннан кейін бірден келтіріледі.",
      explanation: {
        whereInText: "«일부 도시에서는 비닐봉지 사용을 전면 금지했고» (Кейбір қалалар полиэтилен пакеттерді қолдануға толығымен тыйым салды).",
        keywords: "비닐봉지 사용을 전면 금지",
        whyCorrect: "Нақты «비닐봉지» (полиэтилен пакеттерге) қолданылған «전면 금지» (толық тыйым) осы нұсқамен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Қайта өңдеу зауыттары туралы мақалада мүлде айтылмайды." },
          { optionId: "opt-c", reason: "Мақалада «다른 지역» (басқа аймақтарда) пластик ыдыстарға қосымша төлем туралы айтылады, барлық қаптамаға салық емес." },
          { optionId: "opt-d", reason: "Сипатталған тыйым бөтелкелерге емес, пакеттерге қатысты — бөтелкелер аталмайды." },
        ],
        vocabulary: [{ term: "전면 금지", translation: "толық тыйым" }],
        grammarPattern: "«예를 들어» (мысалы) жаңа айтылған жалпы тұжырымның нақты мысалын енгізеді — мұнда саясаттың жалпы үрдісі.",
        strategy: "Абзацта жалпы тұжырымнан кейін «예를 들어» (мысалы) келсе, сұралып жатқан нақты деталь әдетте дәл сол мысал сөйлемінде болады.",
      },
    },
  },
};

const l4PlasticQ3: QuestionSpec = {
  id: "topik4-plastic-waste-1-q3",
  passageId: "topik4-plastic-waste-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "correctStatement",
  evidenceQuote: "미세 플라스틱은 물고기와 조개류를 통해 결국 사람의 몸속까지 들어올 가능성이 있다",
  content: {
    en: {
      prompt: "Which statement matches the article?",
      options: [
        { id: "opt-a", text: "Experts believe policy alone is enough to solve the problem." },
        { id: "opt-b", text: "Microplastics may eventually enter the human body through seafood." },
        { id: "opt-c", text: "Plastic decomposes within a few years." },
        { id: "opt-d", text: "All countries have banned plastic completely." },
      ],
      hint: "Check the sentence about research findings on microplastics carefully.",
      explanation: {
        whereInText: "\"미세 플라스틱은 물고기와 조개류를 통해 결국 사람의 몸속까지 들어올 가능성이 있다\" (Microplastics may eventually enter the human body through fish and shellfish).",
        keywords: "물고기와 조개류를 통해 사람의 몸속까지",
        whyCorrect: "This statement directly matches the research finding described in the article about seafood as a pathway for microplastics.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The article states the opposite: \"정책만으로는 부족하며\" (policy alone is not enough)." },
          { optionId: "opt-c", reason: "The article says decomposition takes \"수백 년\" (hundreds of years), not a few years." },
          { optionId: "opt-d", reason: "The article only mentions \"일부 도시\"/\"다른 지역\" (some cities/other regions) — not all countries." },
        ],
        vocabulary: [{ term: "조개류", translation: "shellfish" }],
        grammarPattern: "\"-을 가능성이 있다\" (there is a possibility that...) hedges a research finding as a possibility rather than a proven certainty.",
        strategy: "For \"which statement matches\" questions with research claims, watch for hedging words like 가능성이 있다 (there is a possibility) — a matching option should preserve that same degree of certainty.",
      },
    },
    ru: {
      prompt: "Какое утверждение соответствует статье?",
      options: [
        { id: "opt-a", text: "Эксперты считают, что одной политики достаточно для решения проблемы." },
        { id: "opt-b", text: "Микропластик может в конечном итоге попасть в организм человека через морепродукты." },
        { id: "opt-c", text: "Пластик разлагается за несколько лет." },
        { id: "opt-d", text: "Все страны полностью запретили пластик." },
      ],
      hint: "Внимательно проверьте предложение о результатах исследования микропластика.",
      explanation: {
        whereInText: "«미세 플라스틱은 물고기와 조개류를 통해 결국 사람의 몸속까지 들어올 가능성이 있다» (Микропластик может в конечном итоге попасть в организм человека через рыбу и моллюсков).",
        keywords: "물고기와 조개류를 통해 사람의 몸속까지",
        whyCorrect: "Это утверждение напрямую совпадает с результатом исследования, описанным в статье, о морепродуктах как пути попадания микропластика.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "В статье сказано обратное: «정책만으로는 부족하며» (одной политики недостаточно)." },
          { optionId: "opt-c", reason: "В статье говорится, что разложение занимает «수백 년» (сотни лет), а не несколько лет." },
          { optionId: "opt-d", reason: "В статье упоминаются только «일부 도시»/«다른 지역» (некоторые города/другие регионы) — не все страны." },
        ],
        vocabulary: [{ term: "조개류", translation: "моллюски" }],
        grammarPattern: "«-을 가능성이 있다» (существует вероятность, что...) представляет результат исследования как возможность, а не доказанный факт.",
        strategy: "В вопросах «какое утверждение соответствует» с исследовательскими утверждениями следите за оговорками вроде 가능성이 있다 (есть вероятность) — соответствующий вариант должен сохранять ту же степень уверенности.",
      },
    },
    kz: {
      prompt: "Мақалаға қай тұжырым сәйкес келеді?",
      options: [
        { id: "opt-a", text: "Сарапшылар мәселені шешуге тек саясаттың өзі жеткілікті деп есептейді." },
        { id: "opt-b", text: "Микропластик соңында теңіз өнімдері арқылы адам ағзасына түсуі мүмкін." },
        { id: "opt-c", text: "Пластик бірнеше жылда ыдырайды." },
        { id: "opt-d", text: "Барлық елдер пластикке толығымен тыйым салды." },
      ],
      hint: "Микропластик туралы зерттеу нәтижелері сөйлемін мұқият тексеріңіз.",
      explanation: {
        whereInText: "«미세 플라스틱은 물고기와 조개류를 통해 결국 사람의 몸속까지 들어올 가능성이 있다» (Микропластик соңында балық пен ұлу тәрізділер арқылы адам ағзасына түсуі мүмкін).",
        keywords: "물고기와 조개류를 통해 사람의 몸속까지",
        whyCorrect: "Бұл тұжырым мақалада сипатталған теңіз өнімдерінің микропластик жолы ретіндегі зерттеу нәтижесімен тікелей сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Мақалада керісінше делінген: «정책만으로는 부족하며» (тек саясат жеткіліксіз)." },
          { optionId: "opt-c", reason: "Мақалада ыдырау «수백 년» (жүздеген жыл) алады делінген, бірнеше жыл емес." },
          { optionId: "opt-d", reason: "Мақалада тек «일부 도시»/«다른 지역» (кейбір қалалар/басқа аймақтар) аталады — барлық ел емес." },
        ],
        vocabulary: [{ term: "조개류", translation: "ұлу тәрізділер" }],
        grammarPattern: "«-을 가능성이 있다» (...мүмкіндігі бар) зерттеу нәтижесін дәлелденген факт емес, ықтималдық ретінде білдіреді.",
        strategy: "Зерттеу тұжырымдары бар «қай тұжырым сәйкес келеді» сұрақтарында 가능성이 있다 (мүмкіндігі бар) сияқты сақтық сөздерге назар аударыңыз — сәйкес нұсқа сол сенімділік дәрежесін сақтауы керек.",
      },
    },
  },
};

const L4_PLASTIC_VOCAB: VocabularySpec[] = [
  {
    term: "분해되다",
    translation: { en: "to decompose", ru: "разлагаться", kz: "ыдырау" },
    definition: {
      en: "To break down naturally into simpler substances over time.",
      ru: "Со временем естественным образом распадаться на более простые вещества.",
      kz: "Уақыт өте келе табиғи түрде қарапайым заттарға бөліну.",
    },
    exampleSentence: "한 번 만들어진 플라스틱은 자연적으로 분해되는 데 수백 년이 걸린다.",
  },
  {
    term: "대체 소재",
    translation: { en: "alternative material", ru: "альтернативный материал", kz: "балама материал" },
    definition: {
      en: "A different material used in place of a standard one.",
      ru: "Другой материал, используемый вместо стандартного.",
      kz: "Стандартты материалдың орнына қолданылатын басқа материал.",
    },
    exampleSentence: "대체 소재 개발과 소비자의 인식 변화가 함께 이루어져야 한다.",
  },
];

export const TOPIK_LEVEL_4_PASSAGES: TopikReadingPassage[] = [L4_WORKLIFE_BALANCE, L4_PLASTIC_WASTE];
export const TOPIK_LEVEL_4_QUESTIONS: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  "topik4-worklife-balance-1": buildPassageQuestions(l4WorklifeQ1, l4WorklifeQ2, l4WorklifeQ3),
  "topik4-plastic-waste-1": buildPassageQuestions(l4PlasticQ1, l4PlasticQ2, l4PlasticQ3),
};
export const TOPIK_LEVEL_4_VOCAB: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  "topik4-worklife-balance-1": buildVocabulary(L4_WORKLIFE_VOCAB),
  "topik4-plastic-waste-1": buildVocabulary(L4_PLASTIC_VOCAB),
};

// ---------------------------------------------------------------------------
// Level 5 — 5급 Advanced I: editorial/academic argumentation, ~270-290 words.
// ---------------------------------------------------------------------------

const L5_AI_SOCIETY: TopikReadingPassage = {
  id: "topik5-ai-society-editorial-1",
  textType: "Newspaper editorial",
  title: "Editorial: artificial intelligence and the shape of society",
  body: "인공지능 기술의 발전 속도는 이제 누구도 부인할 수 없을 만큼 빨라졌다. 불과 몇 년 전만 해도 공상 과학 영화에나 나올 법했던 대화형 인공지능이 오늘날에는 업무 현장 곳곳에서 활용되고 있다. 문제는 이러한 변화가 우리 사회에 던지는 질문들이 결코 가볍지 않다는 데 있다. 일자리 대체에 대한 우려는 이미 오래전부터 제기되어 왔지만, 최근에는 창작이나 판단처럼 인간 고유의 영역으로 여겨지던 일들마저 기계가 대신할 수 있다는 사실이 확인되면서 논의의 성격이 달라지고 있다. 일각에서는 기술 발전이 결국 새로운 형태의 일자리를 만들어 낼 것이므로 지나친 우려는 불필요하다고 주장한다. 그러나 이러한 낙관론은 변화의 속도가 인간의 적응 속도를 앞지르고 있다는 현실을 간과하고 있다는 비판을 피하기 어렵다. 결국 필요한 것은 기술 발전 자체를 막는 것이 아니라, 그 혜택과 위험이 사회 전체에 고르게 분배되도록 제도를 정비하는 일이다. 기술은 중립적이지만, 그것을 다루는 사회의 방식은 결코 중립적이지 않기 때문이다.",
  estimatedWordCount: 270,
};

const l5AiQ1: QuestionSpec = {
  id: "topik5-ai-society-editorial-1-q1",
  passageId: "topik5-ai-society-editorial-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "mainIdea",
  evidenceQuote: "필요한 것은 기술 발전 자체를 막는 것이 아니라, 그 혜택과 위험이 사회 전체에 고르게 분배되도록 제도를 정비하는 일이다.",
  content: {
    en: {
      prompt: "What is the central argument of this editorial?",
      options: [
        { id: "opt-a", text: "The real challenge is ensuring AI's benefits and risks are distributed fairly through proper institutions, not simply opposing progress" },
        { id: "opt-b", text: "AI should be banned entirely" },
        { id: "opt-c", text: "AI will definitely destroy all jobs" },
        { id: "opt-d", text: "Society should not worry about AI at all" },
      ],
      hint: "The editorial rejects both blocking progress and blind optimism — look for the sentence that states what should actually be done instead.",
      explanation: {
        whereInText: "\"필요한 것은 기술 발전 자체를 막는 것이 아니라, 그 혜택과 위험이 사회 전체에 고르게 분배되도록 제도를 정비하는 일이다\" (What's needed is not to block technological progress itself, but to reform institutions so its benefits and risks are distributed evenly across society).",
        keywords: "혜택과 위험이 사회 전체에 고르게 분배",
        whyCorrect: "This sentence is the editorial's explicit resolution after weighing both the concern about job displacement and the optimistic counter-argument.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The editorial explicitly rejects \"기술 발전 자체를 막는 것\" (blocking technological progress itself) as the answer." },
          { optionId: "opt-c", reason: "The editorial raises concern about job displacement but never claims it is a certainty (\"결국\"/definitely) — it frames it as a serious question, not a foregone conclusion." },
          { optionId: "opt-d", reason: "The editorial directly criticizes this kind of dismissive optimism as ignoring how fast change is outpacing adaptation." },
        ],
        vocabulary: [{ term: "제도를 정비하다", translation: "to reform/organize institutions" }],
        grammarPattern: "\"-이 아니라 -이다\" (it's not X, but Y) is a strong contrastive structure often used to state a central thesis by first ruling out a tempting but wrong answer.",
        strategy: "In editorials that weigh two sides, the true thesis is usually marked by \"-이 아니라\" (not X, but Y) — it explicitly rules out both extremes before stating the real position.",
      },
    },
    ru: {
      prompt: "Какова центральная мысль этой редакционной статьи?",
      options: [
        { id: "opt-a", text: "Реальная задача — обеспечить справедливое распределение выгод и рисков ИИ через надлежащие институты, а не просто противостоять прогрессу" },
        { id: "opt-b", text: "ИИ следует полностью запретить" },
        { id: "opt-c", text: "ИИ определённо уничтожит все рабочие места" },
        { id: "opt-d", text: "Обществу вообще не стоит беспокоиться об ИИ" },
      ],
      hint: "Статья отвергает и блокирование прогресса, и слепой оптимизм — найдите предложение, где сказано, что нужно делать на самом деле.",
      explanation: {
        whereInText: "«필요한 것은 기술 발전 자체를 막는 것이 아니라, 그 혜택과 위험이 사회 전체에 고르게 분배되도록 제도를 정비하는 일이다» (Нужно не блокировать сам технологический прогресс, а реформировать институты так, чтобы его выгоды и риски распределялись поровну по всему обществу).",
        keywords: "혜택과 위험이 사회 전체에 고르게 분배",
        whyCorrect: "Это предложение — явное решение статьи после взвешивания как опасений о вытеснении рабочих мест, так и оптимистичного контраргумента.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Статья явно отвергает «기술 발전 자체를 막는 것» (блокирование самого технологического прогресса) как ответ." },
          { optionId: "opt-c", reason: "Статья поднимает опасение о вытеснении рабочих мест, но никогда не заявляет об этом как о неизбежности («결국»/определённо) — она формулирует это как серьёзный вопрос, а не предрешённый вывод." },
          { optionId: "opt-d", reason: "Статья прямо критикует такой пренебрежительный оптимизм как игнорирующий то, насколько быстро перемены опережают адаптацию." },
        ],
        vocabulary: [{ term: "제도를 정비하다", translation: "реформировать/упорядочивать институты" }],
        grammarPattern: "«-이 아니라 -이다» (не X, а Y) — сильная контрастная конструкция, часто используемая для формулирования центрального тезиса через отклонение соблазнительного, но неверного ответа.",
        strategy: "В редакционных статьях, взвешивающих две стороны, истинный тезис обычно отмечен «-이 아니라» (не X, а Y) — он явно отвергает обе крайности перед изложением реальной позиции.",
      },
    },
    kz: {
      prompt: "Бұл редакциялық мақаланың негізгі дәлелі қандай?",
      options: [
        { id: "opt-a", text: "Нағыз міндет — прогреске қарсы тұру емес, тиісті институттар арқылы ЖИ-дің пайдасы мен қауіптерін әділ бөлуді қамтамасыз ету" },
        { id: "opt-b", text: "ЖИ-ге толығымен тыйым салу керек" },
        { id: "opt-c", text: "ЖИ барлық жұмыс орындарын міндетті түрде жояды" },
        { id: "opt-d", text: "Қоғам ЖИ туралы мүлде алаңдамауы керек" },
      ],
      hint: "Мақала прогресті бөгеуді де, соқыр оптимизмді де жоққа шығарады — нақты не істеу керектігін айтатын сөйлемді іздеңіз.",
      explanation: {
        whereInText: "«필요한 것은 기술 발전 자체를 막는 것이 아니라, 그 혜택과 위험이 사회 전체에 고르게 분배되도록 제도를 정비하는 일이다» (Керегі — технологиялық прогрестің өзін тоқтату емес, оның пайдасы мен қауіптерін бүкіл қоғамда бірдей бөлу үшін институттарды реформалау).",
        keywords: "혜택과 위험이 사회 전체에 고르게 분배",
        whyCorrect: "Бұл сөйлем жұмыс орындарының жойылуы туралы алаңдаушылық пен оптимистік қарсы дәлелді салмақтағаннан кейінгі мақаланың нақты шешімі.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мақала «기술 발전 자체를 막는 것» (технологиялық прогрестің өзін тоқтатуды) жауап ретінде нақты жоққа шығарады." },
          { optionId: "opt-c", reason: "Мақала жұмыс орындарының жойылуы туралы алаңдаушылық көтереді, бірақ мұны ешқашан сөзсіз («결국»/міндетті түрде) деп мәлімдемейді — оны сөзсіз қорытынды емес, елеулі мәселе ретінде тұжырымдайды." },
          { optionId: "opt-d", reason: "Мақала мұндай елемеушілік оптимизмді өзгерістің бейімделу жылдамдығынан қаншалықты озып бара жатқанын елемейді деп тікелей сынайды." },
        ],
        vocabulary: [{ term: "제도를 정비하다", translation: "институттарды реформалау/ретке келтіру" }],
        grammarPattern: "«-이 아니라 -이다» (X емес, Y) — көбіне тартымды, бірақ қате жауапты алдымен жоққа шығару арқылы негізгі тезисті тұжырымдау үшін қолданылатын күшті қарама-қарсы құрылым.",
        strategy: "Екі жақты салмақтайтын редакциялық мақалаларда шынайы тезис әдетте «-이 아니라» (X емес, Y) арқылы белгіленеді — ол нақты ұстанымды айтпас бұрын екі шектен де бас тартады.",
      },
    },
  },
};

const l5AiQ2: QuestionSpec = {
  id: "topik5-ai-society-editorial-1-q2",
  passageId: "topik5-ai-society-editorial-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "authorIntention",
  evidenceQuote: "창작이나 판단처럼 인간 고유의 영역으로 여겨지던 일들마저 기계가 대신할 수 있다는 사실이 확인되면서 논의의 성격이 달라지고 있다.",
  content: {
    en: {
      prompt: "Why does the author mention that AI can now replace \"creation or judgment,\" areas once thought uniquely human?",
      options: [
        { id: "opt-a", text: "To show that the nature of the debate has shifted beyond earlier concerns about routine job replacement" },
        { id: "opt-b", text: "To argue that AI cannot be creative" },
        { id: "opt-c", text: "To prove that AI is dangerous and should be shut down" },
        { id: "opt-d", text: "To compare AI to science fiction movies only" },
      ],
      hint: "This sentence directly follows a statement that job-displacement worries are old news — what does it say happened to change that?",
      explanation: {
        whereInText: "\"창작이나 판단처럼 인간 고유의 영역으로 여겨지던 일들마저 기계가 대신할 수 있다는 사실이 확인되면서 논의의 성격이 달라지고 있다\" (As it's been confirmed that machines can now take over even areas like creation and judgment once thought uniquely human, the nature of the discussion is changing).",
        keywords: "논의의 성격이 달라지고 있다",
        whyCorrect: "The author explicitly states \"논의의 성격이 달라지고 있다\" (the nature of the discussion is changing) — using this example specifically to mark a shift from earlier, narrower concerns to a deeper one.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The sentence states the opposite — that AI CAN now do creative/judgment work, not that it cannot." },
          { optionId: "opt-c", reason: "The editorial never calls for shutting AI down; it argues for regulating its distribution of benefits and risks instead." },
          { optionId: "opt-d", reason: "The science-fiction comparison appears earlier, about conversational AI, and is not the point of this particular sentence." },
        ],
        vocabulary: [{ term: "고유의 영역", translation: "a domain/territory unique to something" }],
        grammarPattern: "\"-마저\" (even) adds emphasis by naming the most surprising or extreme case in a series — here, that even creation/judgment (not just routine tasks) can be automated.",
        strategy: "For author's-intention questions, look at what claim the sentence explicitly makes about itself (like \"논의의 성격이 달라지고 있다\") — the author often states the purpose directly rather than leaving it fully implicit.",
      },
    },
    ru: {
      prompt: "Зачем автор упоминает, что ИИ теперь может заменить «творчество или суждение» — области, ранее считавшиеся исключительно человеческими?",
      options: [
        { id: "opt-a", text: "Чтобы показать, что характер дискуссии сместился за пределы прежних опасений о рутинном замещении работы" },
        { id: "opt-b", text: "Чтобы утверждать, что ИИ не может быть творческим" },
        { id: "opt-c", text: "Чтобы доказать, что ИИ опасен и его следует отключить" },
        { id: "opt-d", text: "Чтобы сравнить ИИ только с научно-фантастическими фильмами" },
      ],
      hint: "Это предложение идёт сразу после утверждения, что опасения о вытеснении рабочих мест — давняя тема — что, по словам автора, изменило это?",
      explanation: {
        whereInText: "«창작이나 판단처럼 인간 고유의 영역으로 여겨지던 일들마저 기계가 대신할 수 있다는 사실이 확인되면서 논의의 성격이 달라지고 있다» (По мере подтверждения того, что машины теперь могут заменить даже такие области, как творчество и суждение, ранее считавшиеся исключительно человеческими, характер дискуссии меняется).",
        keywords: "논의의 성격이 달라지고 있다",
        whyCorrect: "Автор прямо заявляет «논의의 성격이 달라지고 있다» (характер дискуссии меняется) — используя этот пример именно для того, чтобы отметить сдвиг от прежних, более узких опасений к более глубоким.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Предложение утверждает обратное — что ИИ ТЕПЕРЬ МОЖЕТ выполнять творческую работу/работу суждения, а не то, что не может." },
          { optionId: "opt-c", reason: "Статья никогда не призывает отключить ИИ; вместо этого она выступает за регулирование распределения его выгод и рисков." },
          { optionId: "opt-d", reason: "Сравнение с научной фантастикой появляется раньше, о диалоговом ИИ, и не является сутью именно этого предложения." },
        ],
        vocabulary: [{ term: "고유의 영역", translation: "уникальная область/территория чего-либо" }],
        grammarPattern: "«-마저» (даже) добавляет акцент, называя самый удивительный или крайний случай в ряду — здесь то, что даже творчество/суждение (а не только рутинные задачи) может быть автоматизировано.",
        strategy: "В вопросах о намерении автора обращайте внимание на то, какое утверждение делает само предложение о себе (например, «논의의 성격이 달라지고 있다») — автор часто прямо заявляет цель, а не оставляет её полностью подразумеваемой.",
      },
    },
    kz: {
      prompt: "Автор ЖИ енді бұрын тек адамға тән деп саналған «шығармашылық немесе пайымдауды» алмастыра алатынын неге айтады?",
      options: [
        { id: "opt-a", text: "Талқылаудың сипаты жұмыс орнын әдеттегідей алмастыру туралы бұрынғы алаңдаушылықтан асып кеткенін көрсету үшін" },
        { id: "opt-b", text: "ЖИ шығармашыл бола алмайды деп дәлелдеу үшін" },
        { id: "opt-c", text: "ЖИ қауіпті және сөндірілуі керек екенін дәлелдеу үшін" },
        { id: "opt-d", text: "ЖИ-ді тек ғылыми-фантастикалық фильмдермен салыстыру үшін" },
      ],
      hint: "Бұл сөйлем жұмыс орнының жойылуы туралы алаңдаушылық ескі жаңалық екені туралы мәлімдемеден кейін бірден келеді — автордың айтуынша, оны не өзгертті?",
      explanation: {
        whereInText: "«창작이나 판단처럼 인간 고유의 영역으로 여겨지던 일들마저 기계가 대신할 수 있다는 사실이 확인되면서 논의의 성격이 달라지고 있다» (Бұрын тек адамға тән деп саналған шығармашылық пен пайымдау сияқты салаларды да машиналар енді алмастыра алатыны расталуымен талқылаудың сипаты өзгеруде).",
        keywords: "논의의 성격이 달라지고 있다",
        whyCorrect: "Автор «논의의 성격이 달라지고 있다» (талқылаудың сипаты өзгеруде) деп нақты мәлімдейді — осы мысалды бұрынғы тар алаңдаушылықтан тереңірек мәселеге ауысуды белгілеу үшін қолданады.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Сөйлем керісінше — ЖИ ЕНДІ шығармашылық/пайымдау жұмысын істей алады дейді, істей алмайды емес." },
          { optionId: "opt-c", reason: "Мақала ЖИ-ді сөндіруге ешқашан шақырмайды; оның орнына оның пайдасы мен қауіптерін бөлуді реттеуді жақтайды." },
          { optionId: "opt-d", reason: "Ғылыми-фантастикамен салыстыру бұрынырақ, диалогтық ЖИ туралы келтіріледі және дәл осы сөйлемнің мәні емес." },
        ],
        vocabulary: [{ term: "고유의 영역", translation: "бір нәрсеге тән аймақ/сала" }],
        grammarPattern: "«-마저» (тіпті) қатардағы ең таңғаларлық немесе шеткі жағдайды атап, екпін қосады — мұнда тіпті шығармашылық/пайымдау да (тек әдеттегі тапсырмалар емес) автоматтандырылуы мүмкін екенін.",
        strategy: "Автордың ниеті туралы сұрақтарда сөйлемнің өзі туралы нақты не мәлімдейтінін қараңыз (мысалы, «논의의 성격이 달라지고 있다») — автор көбіне мақсатты толығымен тұспалдамай, тікелей айтады.",
      },
    },
  },
};

const l5AiQ3: QuestionSpec = {
  id: "topik5-ai-society-editorial-1-q3",
  passageId: "topik5-ai-society-editorial-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "inference",
  evidenceQuote: "이러한 낙관론은 변화의 속도가 인간의 적응 속도를 앞지르고 있다는 현실을 간과하고 있다는 비판을 피하기 어렵다.",
  content: {
    en: {
      prompt: "What can be inferred about the author's view of the optimistic argument that new jobs will emerge?",
      options: [
        { id: "opt-a", text: "The author is skeptical of that optimism, seeing it as ignoring how fast change is outpacing adaptation" },
        { id: "opt-b", text: "The author fully agrees with the optimists" },
        { id: "opt-c", text: "The author thinks new jobs will never appear" },
        { id: "opt-d", text: "The author has no view on this at all" },
      ],
      hint: "Look at the word right before \"비판을 피하기 어렵다\" (hard to avoid criticism) — whose criticism is being described, and does the author distance themselves from it?",
      explanation: {
        whereInText: "\"이러한 낙관론은 변화의 속도가 인간의 적응 속도를 앞지르고 있다는 현실을 간과하고 있다는 비판을 피하기 어렵다\" (This optimism finds it hard to avoid the criticism that it overlooks the reality that the pace of change is outpacing human adaptation).",
        keywords: "비판을 피하기 어렵다",
        whyCorrect: "By stating that the optimistic view \"finds it hard to avoid\" this criticism, the author is endorsing the criticism as valid, signaling skepticism toward blind optimism.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The sentence structure directly challenges the optimists' view rather than affirming it." },
          { optionId: "opt-c", reason: "The author never claims new jobs will never appear — only that the optimism ignores the speed mismatch, a narrower point." },
          { optionId: "opt-d", reason: "The critical language (\"간과하고 있다는 비판을 피하기 어렵다\") is itself a clear evaluative stance, not an absence of opinion." },
        ],
        vocabulary: [{ term: "간과하다", translation: "to overlook" }],
        grammarPattern: "\"-다는 비판을 피하기 어렵다\" (finds it hard to avoid the criticism that...) is an indirect but clear way for a writer to voice disagreement while still sounding measured.",
        strategy: "For inference questions about an author's implicit stance, look for indirect evaluative phrases (like \"비판을 피하기 어렵다\") rather than a direct \"I disagree\" — Korean editorials often criticize indirectly.",
      },
    },
    ru: {
      prompt: "Что можно понять об отношении автора к оптимистичному аргументу о появлении новых рабочих мест?",
      options: [
        { id: "opt-a", text: "Автор скептически относится к этому оптимизму, считая, что он игнорирует то, насколько быстро перемены опережают адаптацию" },
        { id: "opt-b", text: "Автор полностью согласен с оптимистами" },
        { id: "opt-c", text: "Автор считает, что новые рабочие места никогда не появятся" },
        { id: "opt-d", text: "У автора вообще нет мнения по этому поводу" },
      ],
      hint: "Посмотрите на слово прямо перед «비판을 피하기 어렵다» (трудно избежать критики) — чья критика описывается, и дистанцируется ли автор от неё?",
      explanation: {
        whereInText: "«이러한 낙관론은 변화의 속도가 인간의 적응 속도를 앞지르고 있다는 현실을 간과하고 있다는 비판을 피하기 어렵다» (Этому оптимизму трудно избежать критики за то, что он игнорирует реальность опережения темпов изменений скоростью адаптации человека).",
        keywords: "비판을 피하기 어렵다",
        whyCorrect: "Заявляя, что оптимистичный взгляд «трудно избежит» этой критики, автор подтверждает обоснованность критики, сигнализируя о скепсисе к слепому оптимизму.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Структура предложения напрямую оспаривает взгляд оптимистов, а не подтверждает его." },
          { optionId: "opt-c", reason: "Автор никогда не заявляет, что новые рабочие места никогда не появятся — только что оптимизм игнорирует несоответствие скоростей, более узкий тезис." },
          { optionId: "opt-d", reason: "Критическая формулировка («간과하고 있다는 비판을 피하기 어렵다») сама по себе является чёткой оценочной позицией, а не отсутствием мнения." },
        ],
        vocabulary: [{ term: "간과하다", translation: "упускать из виду" }],
        grammarPattern: "«-다는 비판을 피하기 어렵다» (трудно избежать критики, что...) — косвенный, но ясный способ для автора выразить несогласие, сохраняя при этом сдержанный тон.",
        strategy: "В вопросах на вывод о скрытой позиции автора ищите косвенные оценочные фразы (например, «비판을 피하기 어렵다»), а не прямое «я не согласен» — корейские редакционные статьи часто критикуют косвенно.",
      },
    },
    kz: {
      prompt: "Автордың жаңа жұмыс орындары пайда болады деген оптимистік дәлелге көзқарасы туралы не деп қорытынды жасауға болады?",
      options: [
        { id: "opt-a", text: "Автор бұл оптимизмге күмәнмен қарайды, оны өзгерістің бейімделуден қаншалықты озып бара жатқанын елемейді деп есептейді" },
        { id: "opt-b", text: "Автор оптимистермен толық келіседі" },
        { id: "opt-c", text: "Автор жаңа жұмыс орындары ешқашан пайда болмайды деп есептейді" },
        { id: "opt-d", text: "Автордың бұл туралы мүлде пікірі жоқ" },
      ],
      hint: "«비판을 피하기 어렵다» (сынды болдырмау қиын) сөзінің алдындағы сөзге қараңыз — кімнің сыны сипатталып жатыр, автор одан аулақ жүре ме?",
      explanation: {
        whereInText: "«이러한 낙관론은 변화의 속도가 인간의 적응 속도를 앞지르고 있다는 현실을 간과하고 있다는 비판을 피하기 어렵다» (Бұл оптимизм өзгеріс жылдамдығы адамның бейімделу жылдамдығынан озып бара жатқан шындықты елемейді деген сынды болдырмауы қиын).",
        keywords: "비판을 피하기 어렵다",
        whyCorrect: "Оптимистік көзқарас бұл сынды «болдырмауы қиын» деп мәлімдеу арқылы автор сынды дұрыс деп мойындап, соқыр оптимизмге күмәнін білдіреді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Сөйлем құрылымы оптимистердің көзқарасын растаудың орнына оған тікелей қарсы шығады." },
          { optionId: "opt-c", reason: "Автор жаңа жұмыс орындары ешқашан пайда болмайды деп ешқашан мәлімдемейді — тек оптимизм жылдамдық сәйкессіздігін елемейді дейді, бұл тарырақ ой." },
          { optionId: "opt-d", reason: "Сын тудыратын тіл («간과하고 있다는 비판을 피하기 어렵다») өзі анық бағалау ұстанымы, пікірдің жоқтығы емес." },
        ],
        vocabulary: [{ term: "간과하다", translation: "елемеу" }],
        grammarPattern: "«-다는 비판을 피하기 어렵다» (...деген сынды болдырмау қиын) жазушының өлшемді үнде қала отырып, келіспеушілігін білдірудің жанама, бірақ анық жолы.",
        strategy: "Автордың жасырын ұстанымы туралы қорытынды сұрақтарда тікелей «мен келіспеймін» дегеннен гөрі жанама бағалау тіркестерін («비판을 피하기 어렵다» сияқты) іздеңіз — корей редакциялық мақалалары жиі жанама сынайды.",
      },
    },
  },
};

const L5_AI_VOCAB: VocabularySpec[] = [
  {
    term: "낙관론",
    translation: { en: "optimism / optimistic view", ru: "оптимизм / оптимистичный взгляд", kz: "оптимизм / оптимистік көзқарас" },
    definition: {
      en: "A hopeful view that things will turn out well.",
      ru: "Надежда на то, что всё сложится хорошо.",
      kz: "Барлығы жақсы болады деген үміт.",
    },
    exampleSentence: "이러한 낙관론은 변화의 속도가 인간의 적응 속도를 앞지르고 있다는 현실을 간과하고 있다.",
  },
  {
    term: "분배되다",
    translation: { en: "to be distributed", ru: "распределяться", kz: "бөлінуі" },
    definition: {
      en: "To be divided or shared out among a group.",
      ru: "Быть разделённым или распределённым среди группы.",
      kz: "Топ арасында бөлінуі немесе үлестірілуі.",
    },
    exampleSentence: "혜택과 위험이 사회 전체에 고르게 분배되도록 제도를 정비하는 일이다.",
  },
];

const L5_EDUCATION_POLICY: TopikReadingPassage = {
  id: "topik5-education-policy-1",
  textType: "Academic-style article",
  title: "An academic-style discussion of standardized testing",
  body: "표준화 시험이 교육의 질을 실질적으로 향상시키는가에 대한 논쟁은 오랫동안 지속되어 왔다. 찬성하는 입장에서는 표준화 시험이 학생들의 성취도를 객관적으로 비교할 수 있는 유일한 수단이라고 본다. 이를 통해 교육 자원을 필요한 곳에 효율적으로 배분할 수 있으며, 학교 간 책무성을 확보하는 데에도 유용하다는 것이다. 반면 반대하는 입장에서는 표준화 시험이 학생들의 창의성과 비판적 사고력을 오히려 억누른다고 주장한다. 시험 점수를 높이는 데만 초점을 맞춘 수업 방식이 확산되면서, 정작 학생들이 스스로 질문하고 탐구하는 능력은 뒷전으로 밀려난다는 것이다. 최근 몇몇 국가에서 시행한 연구에 따르면, 표준화 시험 의존도가 높은 학교일수록 학생들의 장기적인 학업 흥미도가 낮아지는 경향이 나타났다. 물론 이 상관관계가 곧 인과관계를 의미하는 것은 아니라는 반론도 있다. 결국 이 논쟁의 핵심은 시험 자체의 존폐가 아니라, 시험이 교육 전체에서 차지하는 비중을 어떻게 조정할 것인가에 있다고 할 수 있다.",
  estimatedWordCount: 280,
};

const l5EduQ1: QuestionSpec = {
  id: "topik5-education-policy-1-q1",
  passageId: "topik5-education-policy-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "mainIdea",
  evidenceQuote: "결국 이 논쟁의 핵심은 시험 자체의 존폐가 아니라, 시험이 교육 전체에서 차지하는 비중을 어떻게 조정할 것인가에 있다고 할 수 있다.",
  content: {
    en: {
      prompt: "What is the core of the debate, according to this article's conclusion?",
      options: [
        { id: "opt-a", text: "Not whether to abolish testing, but how much weight it should have in education overall" },
        { id: "opt-b", text: "Standardized tests should be immediately abolished" },
        { id: "opt-c", text: "All countries agree tests are harmful" },
        { id: "opt-d", text: "Testing has no relation to student creativity" },
      ],
      hint: "The final sentence uses \"-이 아니라\" (not X, but Y) — that structure usually marks the article's real conclusion.",
      explanation: {
        whereInText: "\"결국 이 논쟁의 핵심은 시험 자체의 존폐가 아니라, 시험이 교육 전체에서 차지하는 비중을 어떻게 조정할 것인가에 있다\" (In the end, the core of this debate is not whether testing itself should exist, but how to adjust the weight it holds in education overall).",
        keywords: "시험 자체의 존폐가 아니라, 비중을 어떻게 조정할 것인가",
        whyCorrect: "This final sentence is the article's own explicit statement of what the debate's real core is.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The article explicitly says the debate is NOT about \"시험 자체의 존폐\" (whether testing should exist or not) — abolition isn't the conclusion." },
          { optionId: "opt-c", reason: "The article presents both supporting and opposing views as ongoing positions, not a settled consensus." },
          { optionId: "opt-d", reason: "The article directly states opponents argue tests suppress creativity — a relationship, not \"no relation\"." },
        ],
        vocabulary: [{ term: "존폐", translation: "existence or abolition" }],
        grammarPattern: "\"핵심은 -이 아니라 -이다\" (the core is not X, but Y) restates a debate's framing to redirect it toward what the author sees as the real issue.",
        strategy: "When an academic-style article ends with \"결국\" (in the end/ultimately) followed by \"-이 아니라\", that sentence reliably states the article's true main point.",
      },
    },
    ru: {
      prompt: "В чём суть дискуссии, согласно заключению этой статьи?",
      options: [
        { id: "opt-a", text: "Не в том, отменять ли тестирование, а в том, какой вес оно должно иметь в образовании в целом" },
        { id: "opt-b", text: "Стандартизированные тесты следует немедленно отменить" },
        { id: "opt-c", text: "Все страны согласны, что тесты вредны" },
        { id: "opt-d", text: "Тестирование никак не связано с творчеством учащихся" },
      ],
      hint: "Последнее предложение использует «-이 아니라» (не X, а Y) — эта структура обычно отмечает настоящий вывод статьи.",
      explanation: {
        whereInText: "«결국 이 논쟁의 핵심은 시험 자체의 존폐가 아니라, 시험이 교육 전체에서 차지하는 비중을 어떻게 조정할 것인가에 있다» (В конце концов, суть этого спора не в том, должно ли существовать само тестирование, а в том, как скорректировать его вес в образовании в целом).",
        keywords: "시험 자체의 존폐가 아니라, 비중을 어떻게 조정할 것인가",
        whyCorrect: "Это заключительное предложение — явное собственное заявление статьи о том, в чём реальная суть спора.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Статья прямо говорит, что спор НЕ о «시험 자체의 존폐» (должно ли тестирование существовать) — отмена не является выводом." },
          { optionId: "opt-c", reason: "Статья представляет и сторонников, и противников как продолжающиеся позиции, а не устоявшийся консенсус." },
          { optionId: "opt-d", reason: "Статья прямо утверждает, что противники считают, что тесты подавляют творчество — это связь, а не «отсутствие связи»." },
        ],
        vocabulary: [{ term: "존폐", translation: "существование или отмена" }],
        grammarPattern: "«핵심은 -이 아니라 -이다» (суть не в X, а в Y) переформулирует рамки спора, чтобы перенаправить его к тому, что автор считает реальной проблемой.",
        strategy: "Когда академическая статья заканчивается словом «결국» (в конце концов), за которым следует «-이 아니라», это предложение надёжно выражает истинную главную мысль статьи.",
      },
    },
    kz: {
      prompt: "Бұл мақаланың қорытындысына сәйкес, талқылаудың негізі неде?",
      options: [
        { id: "opt-a", text: "Тестілеуді жою керек пе дегенде емес, оның білім берудегі жалпы салмағын қалай реттеу керектігінде" },
        { id: "opt-b", text: "Стандартталған тестілерді дереу жою керек" },
        { id: "opt-c", text: "Барлық елдер тестілер зиянды деп келіседі" },
        { id: "opt-d", text: "Тестілеудің оқушылардың шығармашылығына қатысы жоқ" },
      ],
      hint: "Соңғы сөйлем «-이 아니라» (X емес, Y) құрылымын қолданады — бұл құрылым әдетте мақаланың нақты қорытындысын белгілейді.",
      explanation: {
        whereInText: "«결국 이 논쟁의 핵심은 시험 자체의 존폐가 아니라, 시험이 교육 전체에서 차지하는 비중을 어떻게 조정할 것인가에 있다» (Ақыр соңында бұл талқылаудың негізі тестілеудің өзі болу керек пе жоқ па дегенде емес, оның білім берудегі жалпы салмағын қалай реттеуде).",
        keywords: "시험 자체의 존폐가 아니라, 비중을 어떻게 조정할 것인가",
        whyCorrect: "Бұл соңғы сөйлем мақаланың талқылаудың нақты негізі туралы өзінің анық мәлімдемесі.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мақала талқылау «시험 자체의 존폐» (тестілеу болу керек пе жоқ па) туралы ЕМЕС екенін нақты айтады — жою қорытынды емес." },
          { optionId: "opt-c", reason: "Мақала жақтаушылар мен қарсыластарды жалғасып жатқан ұстанымдар ретінде көрсетеді, орныққан келісім ретінде емес." },
          { optionId: "opt-d", reason: "Мақала қарсыластар тестілер шығармашылықты басады деп тікелей мәлімдейді — бұл байланыс, «байланыс жоқ» емес." },
        ],
        vocabulary: [{ term: "존폐", translation: "болу немесе жою" }],
        grammarPattern: "«핵심은 -이 아니라 -이다» (негізі X емес, Y) талқылаудың шеңберін автор нақты мәселе деп есептейтін нәрсеге қарай бағыттау үшін қайта тұжырымдайды.",
        strategy: "Академиялық стильдегі мақала «결국» (ақыр соңында) деп аяқталып, одан кейін «-이 아니라» келсе, бұл сөйлем мақаланың шынайы негізгі ойын сенімді түрде білдіреді.",
      },
    },
  },
};

const l5EduQ2: QuestionSpec = {
  id: "topik5-education-policy-1-q2",
  passageId: "topik5-education-policy-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "정작 학생들이 스스로 질문하고 탐구하는 능력은 뒷전으로 밀려난다는 것이다.",
  content: {
    en: {
      prompt: "According to opponents, what happens as instruction focuses only on raising test scores?",
      options: [
        { id: "opt-a", text: "Students' ability to question and explore independently gets pushed aside" },
        { id: "opt-b", text: "School funding increases" },
        { id: "opt-c", text: "Teachers receive higher salaries" },
        { id: "opt-d", text: "Test scores immediately drop" },
      ],
      hint: "This consequence is stated right after the sentence about instruction spreading that focuses only on scores.",
      explanation: {
        whereInText: "\"정작 학생들이 스스로 질문하고 탐구하는 능력은 뒷전으로 밀려난다\" (Students' own ability to question and explore actually gets pushed to the back burner).",
        keywords: "스스로 질문하고 탐구하는 능력은 뒷전으로",
        whyCorrect: "This phrase states exactly this consequence — independent inquiry skills being deprioritized as instruction narrows to test scores.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Funding is never mentioned anywhere in the article." },
          { optionId: "opt-c", reason: "Teacher salaries are not discussed in this passage." },
          { optionId: "opt-d", reason: "The passage doesn't claim scores drop immediately — it's about creativity/inquiry being suppressed, a different claim." },
        ],
        vocabulary: [{ term: "뒷전으로 밀려나다", translation: "to be pushed to the back / deprioritized" }],
        grammarPattern: "\"정작\" (in fact / when it actually comes down to it) signals an ironic gap between an intended goal (raising scores) and its real side effect.",
        strategy: "For detail questions following \"정작\" (in fact/actually), that sentence is usually stating a consequence the surface-level policy didn't intend — read it as the article's real point about that policy.",
      },
    },
    ru: {
      prompt: "По мнению противников, что происходит, когда обучение фокусируется только на повышении результатов тестов?",
      options: [
        { id: "opt-a", text: "Способность учащихся самостоятельно задавать вопросы и исследовать отходит на второй план" },
        { id: "opt-b", text: "Финансирование школ увеличивается" },
        { id: "opt-c", text: "Учителя получают более высокие зарплаты" },
        { id: "opt-d", text: "Результаты тестов сразу падают" },
      ],
      hint: "Это последствие указано сразу после предложения о распространении обучения, сфокусированного только на баллах.",
      explanation: {
        whereInText: "«정작 학생들이 스스로 질문하고 탐구하는 능력은 뒷전으로 밀려난다» (Способность учащихся самостоятельно задавать вопросы и исследовать на деле отходит на второй план).",
        keywords: "스스로 질문하고 탐구하는 능력은 뒷전으로",
        whyCorrect: "Эта фраза точно описывает это последствие — навыки самостоятельного исследования отходят на второй план по мере того, как обучение сужается до результатов тестов.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "О финансировании в статье нигде не упоминается." },
          { optionId: "opt-c", reason: "Зарплаты учителей в этом отрывке не обсуждаются." },
          { optionId: "opt-d", reason: "В отрывке не утверждается, что результаты сразу падают — речь о подавлении творчества/исследования, это другое утверждение." },
        ],
        vocabulary: [{ term: "뒷전으로 밀려나다", translation: "отходить на второй план" }],
        grammarPattern: "«정작» (на самом деле / когда доходит до дела) сигнализирует об ироничном разрыве между намеченной целью (повышением баллов) и её реальным побочным эффектом.",
        strategy: "В детальных вопросах после «정작» (на самом деле) это предложение обычно указывает на последствие, которое поверхностная политика не предполагала — читайте его как реальную мысль статьи об этой политике.",
      },
    },
    kz: {
      prompt: "Қарсыластардың пікірінше, оқыту тек тест нәтижелерін көтеруге ғана бағытталғанда не болады?",
      options: [
        { id: "opt-a", text: "Оқушылардың өз бетінше сұрақ қою мен зерттеу қабілеті екінші орынға ысырылады" },
        { id: "opt-b", text: "Мектеп қаржыландыруы артады" },
        { id: "opt-c", text: "Мұғалімдер жоғары жалақы алады" },
        { id: "opt-d", text: "Тест нәтижелері дереу төмендейді" },
      ],
      hint: "Бұл салдар тек баллдарға бағытталған оқыту таралуы туралы сөйлемнен кейін бірден көрсетіледі.",
      explanation: {
        whereInText: "«정작 학생들이 스스로 질문하고 탐구하는 능력은 뒷전으로 밀려난다» (Іс жүзінде оқушылардың өз бетінше сұрақ қою мен зерттеу қабілеті екінші орынға ысырылады).",
        keywords: "스스로 질문하고 탐구하는 능력은 뒷전으로",
        whyCorrect: "Бұл тіркес дәл осы салдарды сипаттайды — оқыту тест нәтижелеріне ғана тарылғанда өз бетінше зерттеу дағдылары бірінші кезектен шығады.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Қаржыландыру туралы мақалада мүлде айтылмайды." },
          { optionId: "opt-c", reason: "Мұғалімдердің жалақысы бұл үзіндіде талқыланбайды." },
          { optionId: "opt-d", reason: "Үзіндіде нәтижелер дереу төмендейді деп айтылмайды — бұл шығармашылық/зерттеудің басылуы туралы, басқа тұжырым." },
        ],
        vocabulary: [{ term: "뒷전으로 밀려나다", translation: "екінші орынға ысырылу" }],
        grammarPattern: "«정작» (шын мәнінде / іс жүзінде) көздеген мақсат (баллдарды көтеру) мен оның нақты жанама әсері арасындағы ирониялық алшақтықты білдіреді.",
        strategy: "«정작» (шын мәнінде) сөзінен кейінгі детальді сұрақтарда бұл сөйлем әдетте беткі саясат көздемеген салдарды көрсетеді — оны сол саясат туралы мақаланың нақты ойы ретінде оқыңыз.",
      },
    },
  },
};

const l5EduQ3: QuestionSpec = {
  id: "topik5-education-policy-1-q3",
  passageId: "topik5-education-policy-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "correctStatement",
  evidenceQuote: "표준화 시험이 학생들의 성취도를 객관적으로 비교할 수 있는 유일한 수단이라고 본다.",
  content: {
    en: {
      prompt: "Which statement matches the passage?",
      options: [
        { id: "opt-a", text: "All researchers agree the correlation proves causation." },
        { id: "opt-b", text: "Supporters argue tests allow objective comparison of student achievement." },
        { id: "opt-c", text: "The article concludes tests should be completely eliminated." },
        { id: "opt-d", text: "No studies have examined this relationship." },
      ],
      hint: "Check each option against the specific claim attributed to supporters versus what the article says about the research finding.",
      explanation: {
        whereInText: "\"표준화 시험이 학생들의 성취도를 객관적으로 비교할 수 있는 유일한 수단이라고 본다\" (They see standardized testing as the only means of objectively comparing student achievement).",
        keywords: "객관적으로 비교할 수 있는 유일한 수단",
        whyCorrect: "This is exactly the supporters' argument as stated in the passage.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The article explicitly notes a counter-argument: \"이 상관관계가 곧 인과관계를 의미하는 것은 아니라는 반론도 있다\" (there is also a counter-argument that correlation doesn't mean causation) — not universal agreement." },
          { optionId: "opt-c", reason: "The article's conclusion is about adjusting testing's weight in education, not eliminating it entirely." },
          { optionId: "opt-d", reason: "The article explicitly references \"최근 몇몇 국가에서 시행한 연구\" (research recently conducted in several countries) on this exact relationship." },
        ],
        vocabulary: [{ term: "책무성", translation: "accountability" }],
        grammarPattern: "\"-라고 본다\" (they view it as...) attributes a stance to a specific group (here, supporters) rather than stating it as the article's own claim.",
        strategy: "For \"which statement matches\" questions in academic-style texts with multiple viewpoints, check which group each claim is attributed to — a true statement about supporters isn't automatically true about the article's own conclusion.",
      },
    },
    ru: {
      prompt: "Какое утверждение соответствует тексту?",
      options: [
        { id: "opt-a", text: "Все исследователи согласны, что корреляция доказывает причинность." },
        { id: "opt-b", text: "Сторонники утверждают, что тесты позволяют объективно сравнивать успеваемость учащихся." },
        { id: "opt-c", text: "Статья приходит к выводу, что тесты следует полностью отменить." },
        { id: "opt-d", text: "Никакие исследования не изучали эту связь." },
      ],
      hint: "Сверьте каждый вариант с конкретным утверждением, приписываемым сторонникам, и с тем, что статья говорит о результате исследования.",
      explanation: {
        whereInText: "«표준화 시험이 학생들의 성취도를 객관적으로 비교할 수 있는 유일한 수단이라고 본다» (Они считают стандартизированное тестирование единственным средством объективного сравнения успеваемости учащихся).",
        keywords: "객관적으로 비교할 수 있는 유일한 수단",
        whyCorrect: "Это именно аргумент сторонников, как он указан в тексте.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Статья прямо отмечает контраргумент: «이 상관관계가 곧 인과관계를 의미하는 것은 아니라는 반론도 있다» (есть также контраргумент, что корреляция не означает причинность) — не всеобщее согласие." },
          { optionId: "opt-c", reason: "Вывод статьи касается корректировки веса тестирования в образовании, а не его полной отмены." },
          { optionId: "opt-d", reason: "Статья прямо ссылается на «최근 몇몇 국가에서 시행한 연구» (недавние исследования в нескольких странах) именно по этой связи." },
        ],
        vocabulary: [{ term: "책무성", translation: "подотчётность" }],
        grammarPattern: "«-라고 본다» (они рассматривают это как...) приписывает позицию конкретной группе (здесь — сторонникам), а не заявляет это как собственное утверждение статьи.",
        strategy: "В вопросах «какое утверждение соответствует» для академических текстов с несколькими точками зрения проверяйте, какой группе приписано каждое утверждение — верное утверждение о сторонниках не обязательно верно как собственный вывод статьи.",
      },
    },
    kz: {
      prompt: "Мәтінге қай тұжырым сәйкес келеді?",
      options: [
        { id: "opt-a", text: "Барлық зерттеушілер корреляция себептілікті дәлелдейді деп келіседі." },
        { id: "opt-b", text: "Жақтаушылар тестілер оқушылардың жетістігін объективті салыстыруға мүмкіндік береді дейді." },
        { id: "opt-c", text: "Мақала тестілерді толығымен жою керек деген қорытындыға келеді." },
        { id: "opt-d", text: "Бұл байланысты ешбір зерттеу қарастырмаған." },
      ],
      hint: "Әр нұсқаны жақтаушыларға телінген нақты тұжырыммен және мақаланың зерттеу нәтижесі туралы айтқанымен салыстырыңыз.",
      explanation: {
        whereInText: "«표준화 시험이 학생들의 성취도를 객관적으로 비교할 수 있는 유일한 수단이라고 본다» (Олар стандартталған тестілеуді оқушылардың жетістігін объективті салыстырудың жалғыз құралы деп санайды).",
        keywords: "객관적으로 비교할 수 있는 유일한 수단",
        whyCorrect: "Бұл мәтінде көрсетілгендей жақтаушылардың дәл сол дәлелі.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Мақала қарсы дәлелді нақты атап өтеді: «이 상관관계가 곧 인과관계를 의미하는 것은 아니라는 반론도 있다» (корреляция себептілікті білдірмейді деген қарсы пікір де бар) — жалпыға ортақ келісім емес." },
          { optionId: "opt-c", reason: "Мақаланың қорытындысы тестілеуді толығымен жою емес, оның білім берудегі салмағын реттеу туралы." },
          { optionId: "opt-d", reason: "Мақала дәл осы байланыс бойынша «최근 몇몇 국가에서 시행한 연구» (бірнеше елде жуырда жүргізілген зерттеулерге) нақты сілтеме жасайды." },
        ],
        vocabulary: [{ term: "책무성", translation: "есеп берушілік" }],
        grammarPattern: "«-라고 본다» (олар... деп санайды) ұстанымды мақаланың өз тұжырымы ретінде емес, нақты топқа (мұнда жақтаушыларға) телиді.",
        strategy: "Бірнеше көзқарасы бар академиялық мәтіндердегі «қай тұжырым сәйкес келеді» сұрақтарында әр тұжырым қай топқа телінгенін тексеріңіз — жақтаушылар туралы дұрыс тұжырым мақаланың өз қорытындысы ретінде автоматты түрде дұрыс бола бермейді.",
      },
    },
  },
};

const L5_EDU_VOCAB: VocabularySpec[] = [
  {
    term: "표준화",
    translation: { en: "standardization", ru: "стандартизация", kz: "стандарттау" },
    definition: {
      en: "The process of making something conform to a fixed standard.",
      ru: "Процесс приведения чего-либо к единому стандарту.",
      kz: "Бір нәрсені белгіленген стандартқа сәйкестендіру процесі.",
    },
    exampleSentence: "표준화 시험이 교육의 질을 실질적으로 향상시키는가에 대한 논쟁.",
  },
  {
    term: "상관관계",
    translation: { en: "correlation", ru: "корреляция", kz: "корреляция" },
    definition: {
      en: "A statistical relationship between two variables.",
      ru: "Статистическая связь между двумя переменными.",
      kz: "Екі айнымалы арасындағы статистикалық байланыс.",
    },
    exampleSentence: "이 상관관계가 곧 인과관계를 의미하는 것은 아니다.",
  },
];

export const TOPIK_LEVEL_5_PASSAGES: TopikReadingPassage[] = [L5_AI_SOCIETY, L5_EDUCATION_POLICY];
export const TOPIK_LEVEL_5_QUESTIONS: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  "topik5-ai-society-editorial-1": buildPassageQuestions(l5AiQ1, l5AiQ2, l5AiQ3),
  "topik5-education-policy-1": buildPassageQuestions(l5EduQ1, l5EduQ2, l5EduQ3),
};
export const TOPIK_LEVEL_5_VOCAB: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  "topik5-ai-society-editorial-1": buildVocabulary(L5_AI_VOCAB),
  "topik5-education-policy-1": buildVocabulary(L5_EDU_VOCAB),
};

// ---------------------------------------------------------------------------
// Level 6 — 6급 Advanced II: critical/abstract essay, formal register,
// ~310-330 words.
// ---------------------------------------------------------------------------

const L6_TRADITION_MODERNITY: TopikReadingPassage = {
  id: "topik6-tradition-modernity-1",
  textType: "Critical essay",
  title: "A critical essay on tradition and modernity",
  body: "전통과 근대성의 관계를 단순한 대립 구도로 파악하려는 시도는 흔히 볼 수 있지만, 이는 지나치게 도식적인 접근이라 할 수 있다. 흔히 전통은 과거에 머물러 있는 것, 근대성은 그것을 극복하고 나아가는 것으로 그려지곤 한다. 그러나 실제로 여러 문화권에서 전통은 고정된 유물이 아니라 시대의 요구에 따라 끊임없이 재해석되어 온 살아 있는 실천이었다. 예컨대 오늘날 우리가 '전통적'이라고 여기는 관습 가운데 상당수는 근대화 과정에서 새롭게 구성되거나 강조된 것들이다. 이러한 관점에서 보면, 전통과 근대성은 서로를 배제하는 두 개의 항이 아니라, 끊임없이 상호작용하며 서로를 규정해 온 개념이라 할 수 있다. 물론 이러한 주장이 모든 전통을 무비판적으로 옹호하려는 것은 아니다. 어떤 전통은 분명 현재의 가치와 충돌하며, 마땅히 재검토되어야 한다. 다만 여기서 강조하고자 하는 바는, 전통을 근대성의 단순한 대립항으로 취급하는 순간 우리는 그 전통이 실제로 어떻게 형성되고 변형되어 왔는지를 파악할 기회를 잃게 된다는 점이다. 결국 필요한 태도는 전통을 무조건 지키거나 버리는 것이 아니라, 그것이 놓인 구체적인 역사적 맥락 속에서 비판적으로 독해하는 것이다.",
  estimatedWordCount: 310,
};

const l6TraditionQ1: QuestionSpec = {
  id: "topik6-tradition-modernity-1-q1",
  passageId: "topik6-tradition-modernity-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "mainIdea",
  evidenceQuote: "결국 필요한 태도는 전통을 무조건 지키거나 버리는 것이 아니라, 그것이 놓인 구체적인 역사적 맥락 속에서 비판적으로 독해하는 것이다.",
  content: {
    en: {
      prompt: "What is the essay's main argument?",
      options: [
        { id: "opt-a", text: "Tradition and modernity should be understood as mutually constituting concepts requiring critical historical reading, not simple opposites" },
        { id: "opt-b", text: "Tradition must always be preserved unchanged" },
        { id: "opt-c", text: "Modernity is entirely opposed to tradition and always superior" },
        { id: "opt-d", text: "All traditions must be discarded" },
      ],
      hint: "The final sentence states what attitude is actually needed — read it alongside the essay's rejection of a simple opposition framing.",
      explanation: {
        whereInText: "\"결국 필요한 태도는 전통을 무조건 지키거나 버리는 것이 아니라, 그것이 놓인 구체적인 역사적 맥락 속에서 비판적으로 독해하는 것이다\" (In the end, the needed attitude is not to unconditionally preserve or discard tradition, but to critically read it within its specific historical context).",
        keywords: "무조건 지키거나 버리는 것이 아니라, 비판적으로 독해",
        whyCorrect: "This concluding sentence, together with the essay's earlier claim that tradition and modernity \"끊임없이 상호작용하며 서로를 규정해 온 개념\" (concepts that have continuously interacted and defined each other), is exactly this option's claim.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The essay explicitly states \"어떤 전통은 분명 현재의 가치와 충돌하며, 마땅히 재검토되어야 한다\" (some traditions clearly conflict with present values and should be reviewed) — not unconditional preservation." },
          { optionId: "opt-c", reason: "The whole essay argues against treating tradition and modernity as simple opposites, let alone modernity being categorically superior." },
          { optionId: "opt-d", reason: "The essay explicitly denies this: \"이러한 주장이 모든 전통을 무비판적으로 옹호하려는 것은 아니다\" argues against uncritical defense, not blanket discarding either." },
        ],
        vocabulary: [{ term: "재해석되다", translation: "to be reinterpreted" }],
        grammarPattern: "\"-는 것이 아니라 -는 것이다\" (it's not doing X, but doing Y) frames the essay's nuanced final position against two extreme readings at once.",
        strategy: "In critical essays that reject a simple binary, expect the true thesis to explicitly name and dismiss BOTH extremes (here, blind preservation and blanket rejection) before stating the nuanced middle position.",
      },
    },
    ru: {
      prompt: "Какова главная мысль эссе?",
      options: [
        { id: "opt-a", text: "Традицию и современность следует понимать как взаимоформирующие понятия, требующие критического исторического прочтения, а не простые противоположности" },
        { id: "opt-b", text: "Традицию всегда нужно сохранять неизменной" },
        { id: "opt-c", text: "Современность полностью противоположна традиции и всегда превосходит её" },
        { id: "opt-d", text: "От всех традиций нужно отказаться" },
      ],
      hint: "Последнее предложение говорит о том, какое отношение на самом деле нужно — читайте его вместе с отказом эссе от простого противопоставления.",
      explanation: {
        whereInText: "«결국 필요한 태도는 전통을 무조건 지키거나 버리는 것이 아니라, 그것이 놓인 구체적인 역사적 맥락 속에서 비판적으로 독해하는 것이다» (В конце концов, нужное отношение — не безусловно сохранять или отвергать традицию, а критически читать её в конкретном историческом контексте).",
        keywords: "무조건 지키거나 버리는 것이 아니라, 비판적으로 독해",
        whyCorrect: "Это заключительное предложение вместе с более ранним утверждением эссе, что традиция и современность — «끊임없이 상호작용하며 서로를 규정해 온 개념» (понятия, непрерывно взаимодействующие и определяющие друг друга), — именно и есть утверждение этого варианта.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Эссе прямо заявляет: «어떤 전통은 분명 현재의 가치와 충돌하며, 마땅히 재검토되어야 한다» (некоторые традиции явно конфликтуют с современными ценностями и должны быть пересмотрены) — не безусловное сохранение." },
          { optionId: "opt-c", reason: "Всё эссе выступает против трактовки традиции и современности как простых противоположностей, тем более против категорического превосходства современности." },
          { optionId: "opt-d", reason: "Эссе прямо это отрицает: «이러한 주장이 모든 전통을 무비판적으로 옹호하려는 것은 아니다» выступает против некритической защиты, но и не за полный отказ." },
        ],
        vocabulary: [{ term: "재해석되다", translation: "быть переосмысленным" }],
        grammarPattern: "«-는 것이 아니라 -는 것이다» (это не X, а Y) формулирует нюансированную итоговую позицию эссе сразу против двух крайних трактовок.",
        strategy: "В критических эссе, отвергающих простую бинарность, ожидайте, что истинный тезис явно назовёт и отклонит ОБЕ крайности (здесь — слепое сохранение и полный отказ), прежде чем изложить нюансированную среднюю позицию.",
      },
    },
    kz: {
      prompt: "Эссенің негізгі дәлелі қандай?",
      options: [
        { id: "opt-a", text: "Дәстүр мен заманауилықты қарапайым қарама-қайшылық емес, сыни тарихи оқуды қажет ететін өзара қалыптастырушы ұғымдар ретінде түсіну керек" },
        { id: "opt-b", text: "Дәстүрді әрқашан өзгеріссіз сақтау керек" },
        { id: "opt-c", text: "Заманауилық дәстүрге толығымен қарама-қарсы және әрқашан жоғары тұрады" },
        { id: "opt-d", text: "Барлық дәстүрден бас тарту керек" },
      ],
      hint: "Соңғы сөйлем шын мәнінде қандай көзқарас керектігін айтады — оны эссенің қарапайым қарама-қайшылықты жоққа шығаруымен бірге оқыңыз.",
      explanation: {
        whereInText: "«결국 필요한 태도는 전통을 무조건 지키거나 버리는 것이 아니라, 그것이 놓인 구체적인 역사적 맥락 속에서 비판적으로 독해하는 것이다» (Ақыр соңында керекті көзқарас — дәстүрді сөзсіз сақтау немесе тастау емес, оны нақты тарихи контексте сыни түрде оқу).",
        keywords: "무조건 지키거나 버리는 것이 아니라, 비판적으로 독해",
        whyCorrect: "Бұл қорытынды сөйлем эссенің бұрынғы дәстүр мен заманауилық «끊임없이 상호작용하며 서로를 규정해 온 개념» (үздіксіз өзара әрекеттесіп, бір-бірін анықтап келген ұғымдар) деген тұжырымымен бірге дәл осы нұсқаның мәлімдемесі.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Эссе нақты айтады: «어떤 전통은 분명 현재의 가치와 충돌하며, 마땅히 재검토되어야 한다» (кейбір дәстүрлер қазіргі құндылықтармен нақты қайшы келеді және қайта қаралуы керек) — сөзсіз сақтау емес." },
          { optionId: "opt-c", reason: "Бүкіл эссе дәстүр мен заманауилықты қарапайым қарама-қайшылық ретінде қарауға қарсы, заманауилықтың категориялық басымдығына қарсы одан да көп." },
          { optionId: "opt-d", reason: "Эссе мұны нақты жоққа шығарады: «이러한 주장이 모든 전통을 무비판적으로 옹호하려는 것은 아니다» сыни емес қорғауға қарсы, бірақ толық бас тартуға да қарсы." },
        ],
        vocabulary: [{ term: "재해석되다", translation: "қайта түсіндірілу" }],
        grammarPattern: "«-는 것이 아니라 -는 것이다» (бұл X емес, Y) эссенің нюансты соңғы ұстанымын екі шеткі түсіндірмеге қарсы бірден тұжырымдайды.",
        strategy: "Қарапайым екіұштылықты жоққа шығаратын сын эсселерде шынайы тезис нюансты орта ұстанымды айтпас бұрын ЕКІ шетті де (мұнда — соқыр сақтау мен толық бас тарту) нақты атап, жоққа шығарады деп күтіңіз.",
      },
    },
  },
};

const l6TraditionQ2: QuestionSpec = {
  id: "topik6-tradition-modernity-1-q2",
  passageId: "topik6-tradition-modernity-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "authorIntention",
  evidenceQuote: "오늘날 우리가 '전통적'이라고 여기는 관습 가운데 상당수는 근대화 과정에서 새롭게 구성되거나 강조된 것들이다.",
  content: {
    en: {
      prompt: "Why does the author mention that many things considered \"traditional\" today were newly constructed during modernization?",
      options: [
        { id: "opt-a", text: "To challenge the assumption that tradition and modernity are simply opposites" },
        { id: "opt-b", text: "To prove that all traditions are fake" },
        { id: "opt-c", text: "To argue modernization destroyed every tradition" },
        { id: "opt-d", text: "To recommend banning modern customs" },
      ],
      hint: "This example follows the claim that tradition is a \"living practice\" rather than a fixed relic — see what point it's used as evidence for.",
      explanation: {
        whereInText: "\"예컨대 오늘날 우리가 '전통적'이라고 여기는 관습 가운데 상당수는 근대화 과정에서 새롭게 구성되거나 강조된 것들이다\" (For example, many of the customs we consider \"traditional\" today were newly constructed or emphasized during the modernization process).",
        keywords: "예컨대",
        whyCorrect: "Introduced with \"예컨대\" (for example) right after the claim that tradition is continuously reinterpreted, this example serves as direct evidence against the simple opposition framing the essay is arguing against.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The author isn't calling traditions \"fake\" — the point is that they were actively shaped by modernization, not that they're illegitimate." },
          { optionId: "opt-c", reason: "The example shows modernization CREATING/emphasizing traditions, not destroying them — the opposite claim." },
          { optionId: "opt-d", reason: "No recommendation about banning anything appears anywhere in the essay." },
        ],
        vocabulary: [{ term: "예컨대", translation: "for example" }],
        grammarPattern: "\"예컨대\" (for example) introduces a concrete illustration that supports the abstract claim stated just before it — a common academic-essay structure.",
        strategy: "When a sentence starts with \"예컨대\" (for example), connect it back to the claim immediately preceding it — the example almost always exists to support exactly that point.",
      },
    },
    ru: {
      prompt: "Зачем автор упоминает, что многие вещи, считающиеся сегодня «традиционными», были заново созданы в процессе модернизации?",
      options: [
        { id: "opt-a", text: "Чтобы оспорить предположение, что традиция и современность — просто противоположности" },
        { id: "opt-b", text: "Чтобы доказать, что все традиции фальшивы" },
        { id: "opt-c", text: "Чтобы утверждать, что модернизация уничтожила все традиции" },
        { id: "opt-d", text: "Чтобы рекомендовать запретить современные обычаи" },
      ],
      hint: "Этот пример следует за утверждением, что традиция — это «живая практика», а не застывший реликт — посмотрите, для какого тезиса он служит доказательством.",
      explanation: {
        whereInText: "«예컨대 오늘날 우리가 '전통적'이라고 여기는 관습 가운데 상당수는 근대화 과정에서 새롭게 구성되거나 강조된 것들이다» (Например, многие обычаи, которые мы сегодня считаем «традиционными», были заново сконструированы или подчёркнуты в процессе модернизации).",
        keywords: "예컨대",
        whyCorrect: "Введённый словом «예컨대» (например) сразу после утверждения, что традиция постоянно переосмысливается, этот пример служит прямым доказательством против простого противопоставления, против которого выступает эссе.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Автор не называет традиции «фальшивыми» — суть в том, что они были активно сформированы модернизацией, а не в том, что они нелегитимны." },
          { optionId: "opt-c", reason: "Пример показывает, что модернизация СОЗДАЁТ/подчёркивает традиции, а не уничтожает их — противоположное утверждение." },
          { optionId: "opt-d", reason: "Рекомендации о запрете чего-либо нигде в эссе не встречается." },
        ],
        vocabulary: [{ term: "예컨대", translation: "например" }],
        grammarPattern: "«예컨대» (например) вводит конкретную иллюстрацию, подтверждающую абстрактное утверждение, сделанное непосредственно перед ним — распространённая структура академического эссе.",
        strategy: "Когда предложение начинается с «예컨대» (например), связывайте его с утверждением, непосредственно предшествующим ему — пример почти всегда существует, чтобы подтвердить именно этот тезис.",
      },
    },
    kz: {
      prompt: "Автор бүгін «дәстүрлі» деп саналатын көптеген нәрселердің жаңғыру процесінде жаңадан құрылғанын неге айтады?",
      options: [
        { id: "opt-a", text: "Дәстүр мен заманауилық жай ғана қарама-қайшы деген болжамға күмән келтіру үшін" },
        { id: "opt-b", text: "Барлық дәстүрдің жалған екенін дәлелдеу үшін" },
        { id: "opt-c", text: "Жаңғыру барлық дәстүрді жойды деп дәлелдеу үшін" },
        { id: "opt-d", text: "Заманауи әдет-ғұрыптарға тыйым салуды ұсыну үшін" },
      ],
      hint: "Бұл мысал дәстүр қатып қалған ескерткіш емес, «тірі тәжірибе» деген тұжырымнан кейін келеді — оның қай ойға дәлел ретінде қолданылғанын қараңыз.",
      explanation: {
        whereInText: "«예컨대 오늘날 우리가 '전통적'이라고 여기는 관습 가운데 상당수는 근대화 과정에서 새롭게 구성되거나 강조된 것들이다» (Мысалы, бүгін біз «дәстүрлі» деп санайтын әдет-ғұрыптардың көбі жаңғыру процесінде жаңадан құрылған немесе баса көрсетілген).",
        keywords: "예컨대",
        whyCorrect: "Дәстүр үздіксіз қайта түсіндіріледі деген тұжырымнан кейін бірден «예컨대» (мысалы) сөзімен енгізілген бұл мысал эссе қарсы шығатын қарапайым қарама-қайшылыққа тікелей дәлел болып табылады.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Автор дәстүрлерді «жалған» демейді — мәселе олардың жаңғыру арқылы белсенді қалыптастырылғанында, заңсыз екенінде емес." },
          { optionId: "opt-c", reason: "Мысал жаңғырудың дәстүрлерді ЖОЙҒАНЫН емес, ЖАСАҒАНЫН/баса көрсеткенін көрсетеді — қарама-қарсы тұжырым." },
          { optionId: "opt-d", reason: "Эсседе ешнәрсеге тыйым салу туралы ұсыныс мүлде жоқ." },
        ],
        vocabulary: [{ term: "예컨대", translation: "мысалы" }],
        grammarPattern: "«예컨대» (мысалы) алдында айтылған абстрактілі тұжырымды қолдайтын нақты мысалды енгізеді — академиялық эссенің жиі кездесетін құрылымы.",
        strategy: "Сөйлем «예컨대» (мысалы) деп басталғанда, оны дәл алдындағы тұжырыммен байланыстырыңыз — мысал әдетте дәл сол ойды қолдау үшін келтіріледі.",
      },
    },
  },
};

const l6TraditionQ3: QuestionSpec = {
  id: "topik6-tradition-modernity-1-q3",
  passageId: "topik6-tradition-modernity-1",
  questionNumber: 3,
  type: "ordering",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "ordering",
  evidenceQuote: "결국 필요한 태도는 전통을 무조건 지키거나 버리는 것이 아니라, 그것이 놓인 구체적인 역사적 맥락 속에서 비판적으로 독해하는 것이다.",
  content: {
    en: {
      prompt: "Which order of these four ideas correctly reflects the essay's structure?\n가: introduces the common view that tradition and modernity are simple opposites\n나: explains that tradition is actually a living practice, constantly reinterpreted\n다: clarifies that this doesn't mean defending every tradition uncritically\n라: concludes that tradition must be critically read within its historical context",
      options: [
        { id: "opt-a", text: "가 – 나 – 다 – 라" },
        { id: "opt-b", text: "나 – 가 – 다 – 라" },
        { id: "opt-c", text: "가 – 다 – 나 – 라" },
        { id: "opt-d", text: "라 – 가 – 나 – 다" },
      ],
      hint: "Essays that challenge a common assumption typically state that assumption first, then complicate it, then qualify the complication, then conclude.",
      explanation: {
        whereInText: "The essay opens with the common tradition-vs-modernity opposition, then argues tradition is a living, reinterpreted practice (가→나), then clarifies this isn't uncritical defense of all tradition (다), and ends with the critical-reading conclusion (라).",
        keywords: "결국 필요한 태도는",
        whyCorrect: "가–나–다–라 matches the essay's actual paragraph order: common view → complication → qualification → conclusion.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "나 (tradition as living practice) is the essay's response to 가 (the common view) — it cannot logically come before the view it's responding to." },
          { optionId: "opt-c", reason: "다 (the qualification about not defending all tradition) only makes sense after 나 has been introduced — placing it before 나 leaves it with nothing to qualify yet." },
          { optionId: "opt-d", reason: "라 is explicitly the essay's final conclusion (\"결국\"/in the end) — it cannot logically open the essay." },
        ],
        vocabulary: [{ term: "결국", translation: "in the end / ultimately" }],
        grammarPattern: "Essays that complicate a common view follow: [common view] → [counter-evidence] → [qualification/caveat] → [nuanced conclusion] — a recognizable four-part shape.",
        strategy: "For sentence-ordering questions, look for connective/discourse markers (\"흔히\"/commonly, \"그러나\"/however, \"물론\"/of course, \"결국\"/in the end) — they usually signal each part's role in the argument's structure.",
      },
    },
    ru: {
      prompt: "Какой порядок этих четырёх идей правильно отражает структуру эссе?\n가: вводит распространённый взгляд, что традиция и современность — простые противоположности\n나: объясняет, что традиция на самом деле является живой практикой, постоянно переосмысливаемой\n다: уточняет, что это не означает некритическую защиту каждой традиции\n라: заключает, что традицию нужно критически читать в её историческом контексте",
      options: [
        { id: "opt-a", text: "가 – 나 – 다 – 라" },
        { id: "opt-b", text: "나 – 가 – 다 – 라" },
        { id: "opt-c", text: "가 – 다 – 나 – 라" },
        { id: "opt-d", text: "라 – 가 – 나 – 다" },
      ],
      hint: "Эссе, оспаривающие распространённое предположение, обычно сначала формулируют это предположение, затем усложняют его, затем уточняют усложнение, затем делают вывод.",
      explanation: {
        whereInText: "Эссе начинается с распространённого противопоставления традиции и современности, затем утверждает, что традиция — живая, переосмысливаемая практика (가→나), затем уточняет, что это не означает некритическую защиту всякой традиции (다), и завершается выводом о критическом чтении (라).",
        keywords: "결국 필요한 태도는",
        whyCorrect: "가–나–다–라 совпадает с реальным порядком абзацев эссе: распространённый взгляд → усложнение → уточнение → вывод.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "나 (традиция как живая практика) — это ответ эссе на 가 (распространённый взгляд) — логически не может идти перед взглядом, на который отвечает." },
          { optionId: "opt-c", reason: "다 (уточнение о том, что не всякая традиция защищается) имеет смысл только после введения 나 — размещение его перед 나 оставляет его без того, что уточнять." },
          { optionId: "opt-d", reason: "라 явно является заключительным выводом эссе («결국»/в конце концов) — логически не может открывать эссе." },
        ],
        vocabulary: [{ term: "결국", translation: "в конце концов / в итоге" }],
        grammarPattern: "Эссе, усложняющие распространённый взгляд, следуют схеме: [распространённый взгляд] → [контраргумент] → [уточнение/оговорка] → [нюансированный вывод] — узнаваемая четырёхчастная структура.",
        strategy: "В вопросах на расстановку предложений ищите связующие/дискурсивные маркеры («흔히»/обычно, «그러나»/однако, «물론»/конечно, «결국»/в конце концов) — они обычно сигнализируют о роли каждой части в структуре аргумента.",
      },
    },
    kz: {
      prompt: "Осы төрт ойдың қай реті эссенің құрылымын дұрыс көрсетеді?\n가: дәстүр мен заманауилық жай ғана қарама-қайшы деген кең тараған көзқарасты енгізеді\n나: дәстүр шын мәнінде үздіксіз қайта түсіндірілетін тірі тәжірибе екенін түсіндіреді\n다: бұл әрбір дәстүрді сыни емес қорғауды білдірмейтінін нақтылайды\n라: дәстүрді тарихи контексінде сыни түрде оқу керек деген қорытындыға келеді",
      options: [
        { id: "opt-a", text: "가 – 나 – 다 – 라" },
        { id: "opt-b", text: "나 – 가 – 다 – 라" },
        { id: "opt-c", text: "가 – 다 – 나 – 라" },
        { id: "opt-d", text: "라 – 가 – 나 – 다" },
      ],
      hint: "Кең тараған болжамға күмән келтіретін эссе әдетте алдымен сол болжамды тұжырымдап, содан кейін оны күрделендіріп, содан кейін күрделенуді нақтылап, содан кейін қорытынды жасайды.",
      explanation: {
        whereInText: "Эссе дәстүр мен заманауилықтың кең тараған қарама-қайшылығынан басталады, содан кейін дәстүр — үздіксіз қайта түсіндірілетін тірі тәжірибе екенін дәлелдейді (가→나), содан кейін бұл әрбір дәстүрді сыни емес қорғауды білдірмейтінін нақтылайды (다), және сыни оқу қорытындысымен аяқталады (라).",
        keywords: "결국 필요한 태도는",
        whyCorrect: "가–나–다–라 эссенің нақты абзац ретімен сәйкес келеді: кең тараған көзқарас → күрделендіру → нақтылау → қорытынды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "나 (тірі тәжірибе ретіндегі дәстүр) эссенің 가-ға (кең тараған көзқарасқа) жауабы — ол жауап беріп жатқан көзқарастың алдында логикалық тұрғыдан келе алмайды." },
          { optionId: "opt-c", reason: "다 (әр дәстүрді қорғамау туралы нақтылау) тек 나 енгізілгеннен кейін ғана мағыналы — оны 나-ның алдына қою нақтылайтын ештеңе қалдырмайды." },
          { optionId: "opt-d", reason: "라 эссенің нақты қорытынды сөйлемі («결국»/ақыр соңында) — ол логикалық тұрғыдан эссені аша алмайды." },
        ],
        vocabulary: [{ term: "결국", translation: "ақыр соңында" }],
        grammarPattern: "Кең тараған көзқарасты күрделендіретін эсселер мына схеманы ұстанады: [кең тараған көзқарас] → [қарсы дәлел] → [нақтылау/ескерту] → [нюансты қорытынды] — танылатын төрт бөліктен тұратын пішін.",
        strategy: "Сөйлемдерді ретке келтіру сұрақтарында жалғаулық/дискурс маркерлерін («흔히»/әдетте, «그러나»/дегенмен, «물론»/әрине, «결국»/ақыр соңында) іздеңіз — олар әдетте әр бөліктің дәлел құрылымындағы рөлін білдіреді.",
      },
    },
  },
};

const L6_TRADITION_VOCAB: VocabularySpec[] = [
  {
    term: "도식적",
    translation: { en: "schematic / oversimplified", ru: "схематичный / упрощённый", kz: "схемалық / жеңілдетілген" },
    definition: {
      en: "Reduced to an overly simple, rigid pattern that ignores nuance.",
      ru: "Сведённый к слишком простой, жёсткой схеме, игнорирующей нюансы.",
      kz: "Нюанстарды елемейтін тым қарапайым, қатаң үлгіге дейін жеңілдетілген.",
    },
    exampleSentence: "이는 지나치게 도식적인 접근이라 할 수 있다.",
  },
  {
    term: "재검토되다",
    translation: { en: "to be reviewed again", ru: "быть пересмотренным", kz: "қайта қаралу" },
    definition: {
      en: "To be examined again, often to reconsider a prior judgment.",
      ru: "Быть рассмотренным заново, часто для пересмотра прежнего суждения.",
      kz: "Бұрынғы пікірді қайта қарау үшін жиі қайта тексерілу.",
    },
    exampleSentence: "어떤 전통은 분명 현재의 가치와 충돌하며, 마땅히 재검토되어야 한다.",
  },
];

const L6_ECONOMIC_TREND_REPORT: TopikReadingPassage = {
  id: "topik6-economic-trend-report-1",
  textType: "Formal analytical report",
  title: "Analysis: shifting patterns in household saving",
  body: "최근 발표된 가계 금융 동향 보고서에 따르면, 지난 십 년간 가구의 저축 성향에 뚜렷한 변화가 관찰되었다. 과거에는 소득이 늘어날수록 저축률도 함께 상승하는 경향이 뚜렷했지만, 최근 자료에서는 이러한 상관관계가 예전만큼 견고하지 않은 것으로 나타났다. 보고서는 이러한 변화의 배경으로 몇 가지 요인을 지목한다. 첫째, 주거비 부담이 크게 늘어나면서 가처분 소득 가운데 저축으로 돌릴 수 있는 여력이 줄어들었다는 점이다. 둘째, 디지털 금융 서비스의 확산으로 소비와 투자의 경계가 모호해지면서, 전통적인 의미의 저축과 구분하기 어려운 자산 운용 방식이 늘어났다는 점도 지적된다. 셋째, 세대별로 미래에 대한 인식 차이가 뚜렷해지면서, 장기 저축보다 단기적 소비나 경험에 자산을 배분하려는 경향이 젊은 세대를 중심으로 확산되고 있다는 분석도 제시된다. 보고서는 이러한 변화를 단순히 저축 의식의 약화로 해석하는 것은 성급하다고 경고한다. 오히려 자산을 관리하는 방식 자체가 다변화되고 있다고 보는 편이 더 정확하다는 것이다. 이에 따라 보고서는 기존의 저축률 지표만으로 가계의 재정 건전성을 판단하는 방식에 대한 재검토가 필요하다고 제언한다.",
  estimatedWordCount: 320,
};

const l6EconomyQ1: QuestionSpec = {
  id: "topik6-economic-trend-report-1-q1",
  passageId: "topik6-economic-trend-report-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "mainIdea",
  evidenceQuote: "오히려 자산을 관리하는 방식 자체가 다변화되고 있다고 보는 편이 더 정확하다는 것이다.",
  content: {
    en: {
      prompt: "What is the report's main argument?",
      options: [
        { id: "opt-a", text: "Changing saving patterns reflect diversifying asset management rather than simply weaker saving habits, calling for a review of how financial health is measured" },
        { id: "opt-b", text: "The report proves young people no longer care about money" },
        { id: "opt-c", text: "Households are saving more than ever before" },
        { id: "opt-d", text: "Digital finance has no effect on saving" },
      ],
      hint: "The report explicitly warns against one interpretation before offering what it considers the more accurate one — find that contrast.",
      explanation: {
        whereInText: "\"오히려 자산을 관리하는 방식 자체가 다변화되고 있다고 보는 편이 더 정확하다는 것이다\" (Rather, it is more accurate to see it as the way assets are managed itself becoming more diversified).",
        keywords: "다변화되고 있다고 보는 편이 더 정확하다",
        whyCorrect: "This sentence, paired with the report's call to review \"기존의 저축률 지표만으로... 판단하는 방식\" (judging financial health by existing savings-rate indicators alone), matches this option's claim exactly.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The report describes a generational difference in resource allocation, not a claim that young people don't care about money at all." },
          { optionId: "opt-c", reason: "The report opens by describing the correlation between income and saving weakening — not households saving more than ever." },
          { optionId: "opt-d", reason: "The report explicitly lists digital finance's spread as one of three factors behind the changing pattern — the opposite of no effect." },
        ],
        vocabulary: [{ term: "다변화되다", translation: "to become diversified" }],
        grammarPattern: "\"단순히 -로 해석하는 것은 성급하다\" (it is premature to interpret this simply as...) rejects an oversimplified reading before the report gives its preferred interpretation.",
        strategy: "In analytical reports, look for a sentence warning against a \"hasty\"/\"premature\" (성급하다) reading — the report's own preferred interpretation almost always follows immediately after.",
      },
    },
    ru: {
      prompt: "В чём главный аргумент отчёта?",
      options: [
        { id: "opt-a", text: "Изменение моделей сбережений отражает диверсификацию управления активами, а не просто ослабление привычки сберегать, что требует пересмотра способа измерения финансового здоровья" },
        { id: "opt-b", text: "Отчёт доказывает, что молодёжь больше не заботится о деньгах" },
        { id: "opt-c", text: "Домохозяйства сберегают больше, чем когда-либо" },
        { id: "opt-d", text: "Цифровые финансы не влияют на сбережения" },
      ],
      hint: "Отчёт явно предостерегает от одной трактовки, прежде чем предложить то, что считает более точным — найдите этот контраст.",
      explanation: {
        whereInText: "«오히려 자산을 관리하는 방식 자체가 다변화되고 있다고 보는 편이 더 정확하다는 것이다» (Скорее, точнее рассматривать это как диверсификацию самого способа управления активами).",
        keywords: "다변화되고 있다고 보는 편이 더 정확하다",
        whyCorrect: "Это предложение вместе с призывом отчёта пересмотреть «기존의 저축률 지표만으로... 판단하는 방식» (способ оценки финансового здоровья только по существующим показателям нормы сбережений) точно совпадает с этим вариантом.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Отчёт описывает поколенческое различие в распределении ресурсов, а не утверждение, что молодёжь вообще не заботится о деньгах." },
          { optionId: "opt-c", reason: "Отчёт начинается с описания ослабления связи между доходом и сбережениями — а не того, что домохозяйства сберегают больше, чем когда-либо." },
          { optionId: "opt-d", reason: "Отчёт прямо перечисляет распространение цифровых финансов как один из трёх факторов изменения модели — это противоположно отсутствию влияния." },
        ],
        vocabulary: [{ term: "다변화되다", translation: "диверсифицироваться" }],
        grammarPattern: "«단순히 -로 해석하는 것은 성급하다» (поспешно интерпретировать это просто как...) отвергает упрощённое прочтение перед тем, как отчёт даёт предпочитаемую интерпретацию.",
        strategy: "В аналитических отчётах ищите предложение, предостерегающее от «поспешного» (성급하다) прочтения — собственная предпочитаемая интерпретация отчёта почти всегда следует сразу после.",
      },
    },
    kz: {
      prompt: "Есептің негізгі дәлелі қандай?",
      options: [
        { id: "opt-a", text: "Жинақ үлгілерінің өзгеруі жай ғана жинақтау әдетінің әлсіреуін емес, актив басқарудың әртараптануын көрсетеді, бұл қаржылық денсаулықты өлшеу тәсілін қайта қарауды талап етеді" },
        { id: "opt-b", text: "Есеп жастардың ақшаға енді мән бермейтінін дәлелдейді" },
        { id: "opt-c", text: "Үй шаруашылықтары бұрын-соңды болмағандай көп жинақтауда" },
        { id: "opt-d", text: "Цифрлық қаржы жинақтауға әсер етпейді" },
      ],
      hint: "Есеп өзі дәлірек деп есептейтінін ұсынбас бұрын бір түсіндірмеден нақты сақтандырады — сол қайшылықты табыңыз.",
      explanation: {
        whereInText: "«오히려 자산을 관리하는 방식 자체가 다변화되고 있다고 보는 편이 더 정확하다는 것이다» (Керісінше, активтерді басқару тәсілінің өзі әртараптанып жатыр деп қарау дәлірек).",
        keywords: "다변화되고 있다고 보는 편이 더 정확하다",
        whyCorrect: "Бұл сөйлем есептің «기존의 저축률 지표만으로... 판단하는 방식» (тек қолданыстағы жинақ мөлшерлемесі көрсеткіштері бойынша ғана бағалау тәсілі) қайта қаралуы керек деген шақыруымен бірге осы нұсқаның тұжырымымен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Есеп ресурстарды бөлудегі ұрпақ аралық айырмашылықты сипаттайды, жастар ақшаға мүлде мән бермейді деген тұжырым емес." },
          { optionId: "opt-c", reason: "Есеп кіріс пен жинақ арасындағы байланыстың әлсіреуін сипаттаудан басталады — үй шаруашылықтары бұрын-соңды болмағандай көп жинақтап жатыр дегеннен емес." },
          { optionId: "opt-d", reason: "Есеп цифрлық қаржының таралуын үлгі өзгеруінің үш факторының бірі ретінде нақты тізеді — бұл әсердің жоқтығына қарама-қарсы." },
        ],
        vocabulary: [{ term: "다변화되다", translation: "әртараптану" }],
        grammarPattern: "«단순히 -로 해석하는 것은 성급하다» (мұны жай ғана... деп түсіндіру асығыс) есеп өзі қалаған түсіндірмені бермес бұрын жеңілдетілген оқуды жоққа шығарады.",
        strategy: "Талдамалық есептерде «асығыс» (성급하다) оқудан сақтандыратын сөйлемді іздеңіз — есептің өзі қалаған түсіндірмесі әдетте дәл содан кейін келеді.",
      },
    },
  },
};

const l6EconomyQ2: QuestionSpec = {
  id: "topik6-economic-trend-report-1-q2",
  passageId: "topik6-economic-trend-report-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "주거비 부담이 크게 늘어나면서 가처분 소득 가운데 저축으로 돌릴 수 있는 여력이 줄어들었다는 점이다.",
  content: {
    en: {
      prompt: "According to the report, what is one reason disposable income available for saving has decreased?",
      options: [
        { id: "opt-a", text: "Rising housing cost burden" },
        { id: "opt-b", text: "Falling wages" },
        { id: "opt-c", text: "Higher taxes on savings accounts" },
        { id: "opt-d", text: "Reduced working hours" },
      ],
      hint: "This is stated as the first (\"첫째\") of the three factors the report lists.",
      explanation: {
        whereInText: "\"첫째, 주거비 부담이 크게 늘어나면서 가처분 소득 가운데 저축으로 돌릴 수 있는 여력이 줄어들었다는 점이다\" (First, as the housing cost burden has greatly increased, the room within disposable income available for saving has decreased).",
        keywords: "주거비 부담이 크게 늘어나면서",
        whyCorrect: "\"주거비 부담\" (housing cost burden) is stated explicitly as the first cause listed, matching this option exactly.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Falling wages are never mentioned — the report discusses spending pressure, not income decline." },
          { optionId: "opt-c", reason: "Taxes on savings accounts are not mentioned anywhere in the report." },
          { optionId: "opt-d", reason: "Working hours are never discussed in this report." },
        ],
        vocabulary: [{ term: "가처분 소득", translation: "disposable income" }],
        grammarPattern: "\"첫째, 둘째, 셋째\" (first, second, third) explicitly numbers a list of factors — a common structure in analytical reports for enumerating causes clearly.",
        strategy: "When a report numbers its factors (첫째/둘째/셋째), match the ordinal in the question to the correct numbered item rather than picking a plausible-sounding cause from memory.",
      },
    },
    ru: {
      prompt: "Согласно отчёту, какова одна из причин сокращения располагаемого дохода, доступного для сбережений?",
      options: [
        { id: "opt-a", text: "Растущее бремя расходов на жильё" },
        { id: "opt-b", text: "Падение заработной платы" },
        { id: "opt-c", text: "Повышенные налоги на сберегательные счета" },
        { id: "opt-d", text: "Сокращение рабочего времени" },
      ],
      hint: "Это указано как первый («첫째») из трёх факторов, перечисленных в отчёте.",
      explanation: {
        whereInText: "«첫째, 주거비 부담이 크게 늘어나면서 가처분 소득 가운데 저축으로 돌릴 수 있는 여력이 줄어들었다는 점이다» (Во-первых, поскольку бремя расходов на жильё значительно возросло, пространство для сбережений в располагаемом доходе сократилось).",
        keywords: "주거비 부담이 크게 늘어나면서",
        whyCorrect: "«주거비 부담» (бремя расходов на жильё) прямо указано как первая перечисленная причина, точно совпадающая с этим вариантом.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Падение зарплат нигде не упоминается — отчёт обсуждает давление расходов, а не снижение дохода." },
          { optionId: "opt-c", reason: "Налоги на сберегательные счета в отчёте нигде не упоминаются." },
          { optionId: "opt-d", reason: "Рабочее время в этом отчёте вообще не обсуждается." },
        ],
        vocabulary: [{ term: "가처분 소득", translation: "располагаемый доход" }],
        grammarPattern: "«첫째, 둘째, 셋째» (во-первых, во-вторых, в-третьих) явно нумерует список факторов — распространённая структура в аналитических отчётах для чёткого перечисления причин.",
        strategy: "Когда отчёт нумерует свои факторы (첫째/둘째/셋째), сопоставляйте порядковое число из вопроса с правильным пронумерованным пунктом, а не выбирайте правдоподобно звучащую причину по памяти.",
      },
    },
    kz: {
      prompt: "Есепке сәйкес, жинақтауға арналған қолда бар табыстың азаюының бір себебі қандай?",
      options: [
        { id: "opt-a", text: "Тұрғын үй шығынының артуы" },
        { id: "opt-b", text: "Жалақының төмендеуі" },
        { id: "opt-c", text: "Жинақ шоттарына салықтың артуы" },
        { id: "opt-d", text: "Жұмыс сағаттарының қысқаруы" },
      ],
      hint: "Бұл есепте тізілген үш фактордың біріншісі («첫째») ретінде көрсетілген.",
      explanation: {
        whereInText: "«첫째, 주거비 부담이 크게 늘어나면서 가처분 소득 가운데 저축으로 돌릴 수 있는 여력이 줄어들었다는 점이다» (Біріншіден, тұрғын үй шығыны едәуір артқандықтан, қолда бар табыс ішінде жинақтауға бөлуге болатын мүмкіндік азайды).",
        keywords: "주거비 부담이 크게 늘어나면서",
        whyCorrect: "«주거비 부담» (тұрғын үй шығыны) бірінші тізілген себеп ретінде нақты көрсетілген, бұл нұсқамен дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Жалақының төмендеуі мүлде аталмайды — есеп табыстың төмендеуін емес, шығын қысымын талқылайды." },
          { optionId: "opt-c", reason: "Жинақ шоттарына салық туралы есепте ешбір жерде айтылмайды." },
          { optionId: "opt-d", reason: "Жұмыс сағаттары бұл есепте мүлде талқыланбайды." },
        ],
        vocabulary: [{ term: "가처분 소득", translation: "қолда бар табыс" }],
        grammarPattern: "«첫째, 둘째, 셋째» (біріншіден, екіншіден, үшіншіден) факторлар тізімін нақты нөмірлейді — талдамалық есептерде себептерді анық санау үшін жиі кездесетін құрылым.",
        strategy: "Есеп факторларын нөмірлегенде (첫째/둘째/셋째), сұрақтағы реттік санды есте сақтаудан сенімді көрінетін себепті таңдамай, дұрыс нөмірленген тармақпен салыстырыңыз.",
      },
    },
  },
};

const l6EconomyQ3: QuestionSpec = {
  id: "topik6-economic-trend-report-1-q3",
  passageId: "topik6-economic-trend-report-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "correctStatement",
  evidenceQuote: "이러한 상관관계가 예전만큼 견고하지 않은 것으로 나타났다.",
  content: {
    en: {
      prompt: "Which statement matches the report?",
      options: [
        { id: "opt-a", text: "The report concludes that saving consciousness has clearly weakened." },
        { id: "opt-b", text: "The link between rising income and rising savings is no longer as strong as before." },
        { id: "opt-c", text: "Younger generations are saving more for the long term than before." },
        { id: "opt-d", text: "Digital finance has had no impact on how people manage assets." },
      ],
      hint: "Check the sentence describing what happened to the old relationship between income and saving.",
      explanation: {
        whereInText: "\"이러한 상관관계가 예전만큼 견고하지 않은 것으로 나타났다\" (This correlation has been shown to no longer be as strong as before).",
        keywords: "예전만큼 견고하지 않은",
        whyCorrect: "This directly matches the report's description of the weakened income-savings correlation.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The report explicitly warns this interpretation is \"성급하다\" (premature/hasty) — it does NOT conclude saving consciousness has weakened." },
          { optionId: "opt-c", reason: "The report says younger generations increasingly favor short-term spending/experience over long-term saving — the opposite trend." },
          { optionId: "opt-d", reason: "The report lists digital finance's spread as one of the very factors reshaping how assets are managed — not \"no impact\"." },
        ],
        vocabulary: [{ term: "견고하다", translation: "to be solid/robust" }],
        grammarPattern: "\"-것으로 나타났다\" (it has been shown that...) reports a finding as an observed result, distinct from the report's own interpretive conclusion stated later.",
        strategy: "In reports with both findings and interpretation, keep the observed data (\"-것으로 나타났다\") separate from the report's own conclusion (\"보고서는 -라고 경고한다/제언한다\") — a true statement about one isn't automatically true of the other.",
      },
    },
    ru: {
      prompt: "Какое утверждение соответствует отчёту?",
      options: [
        { id: "opt-a", text: "Отчёт заключает, что осознанность в отношении сбережений явно ослабла." },
        { id: "opt-b", text: "Связь между ростом дохода и ростом сбережений уже не так сильна, как раньше." },
        { id: "opt-c", text: "Молодые поколения сберегают больше на долгий срок, чем раньше." },
        { id: "opt-d", text: "Цифровые финансы не повлияли на то, как люди управляют активами." },
      ],
      hint: "Проверьте предложение, описывающее, что случилось со старой связью между доходом и сбережениями.",
      explanation: {
        whereInText: "«이러한 상관관계가 예전만큼 견고하지 않은 것으로 나타났다» (Было показано, что эта корреляция уже не так сильна, как раньше).",
        keywords: "예전만큼 견고하지 않은",
        whyCorrect: "Это напрямую совпадает с описанием отчёта об ослабевшей корреляции между доходом и сбережениями.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Отчёт прямо предупреждает, что эта трактовка «성급하다» (поспешна) — он НЕ заключает, что осознанность сбережений ослабла." },
          { optionId: "opt-c", reason: "Отчёт говорит, что молодые поколения всё чаще предпочитают краткосрочные траты/впечатления долгосрочным сбережениям — противоположная тенденция." },
          { optionId: "opt-d", reason: "Отчёт перечисляет распространение цифровых финансов как один из самых факторов, меняющих способ управления активами — не «отсутствие влияния»." },
        ],
        vocabulary: [{ term: "견고하다", translation: "быть прочным/устойчивым" }],
        grammarPattern: "«-것으로 나타났다» (было показано, что...) сообщает вывод как наблюдаемый результат, отдельно от собственного интерпретационного заключения отчёта, изложенного позже.",
        strategy: "В отчётах с результатами и интерпретацией отделяйте наблюдаемые данные («-것으로 나타났다») от собственного вывода отчёта («보고서는 -라고 경고한다/제언한다») — верное утверждение об одном не обязательно верно для другого.",
      },
    },
    kz: {
      prompt: "Есепке қай тұжырым сәйкес келеді?",
      options: [
        { id: "opt-a", text: "Есеп жинақтауға деген сана нақты әлсіреді деген қорытындыға келеді." },
        { id: "opt-b", text: "Кірістің өсуі мен жинақтың өсуі арасындағы байланыс бұрынғыдай мықты емес." },
        { id: "opt-c", text: "Жас ұрпақ бұрынғыдан гөрі ұзақ мерзімге көбірек жинақтауда." },
        { id: "opt-d", text: "Цифрлық қаржы адамдардың активтерді басқару тәсіліне әсер еткен жоқ." },
      ],
      hint: "Кіріс пен жинақ арасындағы ескі байланысқа не болғанын сипаттайтын сөйлемді тексеріңіз.",
      explanation: {
        whereInText: "«이러한 상관관계가 예전만큼 견고하지 않은 것으로 나타났다» (Бұл корреляция бұрынғыдай мықты емес екені көрсетілді).",
        keywords: "예전만큼 견고하지 않은",
        whyCorrect: "Бұл есептің кіріс-жинақ корреляциясының әлсіреуі туралы сипаттамасымен тікелей сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Есеп бұл түсіндірменің «성급하다» (асығыс) екенін нақты ескертеді — ол жинақтауға деген сананың әлсіреуі туралы қорытынды жасамайды." },
          { optionId: "opt-c", reason: "Есеп жас ұрпақ ұзақ мерзімді жинақтаудан гөрі қысқа мерзімді шығын/тәжірибені көбірек қалайтынын айтады — керісінше үрдіс." },
          { optionId: "opt-d", reason: "Есеп цифрлық қаржының таралуын активтерді басқару тәсілін өзгертетін факторлардың бірі ретінде тізеді — «әсер жоқ» емес." },
        ],
        vocabulary: [{ term: "견고하다", translation: "мықты/берік болу" }],
        grammarPattern: "«-것으로 나타났다» (...екені көрсетілді) нәтижені кейінірек айтылатын есептің өз түсіндірме қорытындысынан бөлек, байқалған нәтиже ретінде хабарлайды.",
        strategy: "Нәтижелер мен түсіндірмесі бар есептерде байқалған деректерді («-것으로 나타났다») есептің өз қорытындысынан («보고서는 -라고 경고한다/제언한다») бөлек ұстаңыз — біреуі туралы дұрыс тұжырым екіншісі үшін автоматты түрде дұрыс бола бермейді.",
      },
    },
  },
};

const L6_ECONOMY_VOCAB: VocabularySpec[] = [
  {
    term: "가처분 소득",
    translation: { en: "disposable income", ru: "располагаемый доход", kz: "қолда бар табыс" },
    definition: {
      en: "Income remaining after taxes, available for spending or saving.",
      ru: "Доход, остающийся после уплаты налогов, доступный для расходов или сбережений.",
      kz: "Салықтан кейін қалатын, жұмсауға немесе жинақтауға болатын табыс.",
    },
    exampleSentence: "가처분 소득 가운데 저축으로 돌릴 수 있는 여력이 줄어들었다.",
  },
  {
    term: "재정 건전성",
    translation: { en: "financial health/soundness", ru: "финансовая устойчивость", kz: "қаржылық тұрақтылық" },
    definition: {
      en: "The overall stability and soundness of one's financial situation.",
      ru: "Общая устойчивость и стабильность финансового положения.",
      kz: "Қаржылық жағдайдың жалпы тұрақтылығы мен беріктігі.",
    },
    exampleSentence: "가계의 재정 건전성을 판단하는 방식에 대한 재검토가 필요하다.",
  },
];

export const TOPIK_LEVEL_6_PASSAGES: TopikReadingPassage[] = [L6_TRADITION_MODERNITY, L6_ECONOMIC_TREND_REPORT];
export const TOPIK_LEVEL_6_QUESTIONS: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  "topik6-tradition-modernity-1": buildPassageQuestions(l6TraditionQ1, l6TraditionQ2, l6TraditionQ3),
  "topik6-economic-trend-report-1": buildPassageQuestions(l6EconomyQ1, l6EconomyQ2, l6EconomyQ3),
};
export const TOPIK_LEVEL_6_VOCAB: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  "topik6-tradition-modernity-1": buildVocabulary(L6_TRADITION_VOCAB),
  "topik6-economic-trend-report-1": buildVocabulary(L6_ECONOMY_VOCAB),
};

// ---------------------------------------------------------------------------
// Combined per-level exports — what lib/topik/reading-rotation.ts and
// lib/mock/topik-reading-generator.ts actually consume.
// ---------------------------------------------------------------------------

export const TOPIK_READING_CONTENT_BANK: Record<TopikLevel, TopikReadingPassage[]> = {
  "1": TOPIK_LEVEL_1_PASSAGES,
  "2": TOPIK_LEVEL_2_PASSAGES,
  "3": TOPIK_LEVEL_3_PASSAGES,
  "4": TOPIK_LEVEL_4_PASSAGES,
  "5": TOPIK_LEVEL_5_PASSAGES,
  "6": TOPIK_LEVEL_6_PASSAGES,
};

export const TOPIK_READING_QUESTIONS_BY_PASSAGE: Record<string, Record<FeedbackLanguage, TopikReadingQuestion[]>> = {
  ...TOPIK_LEVEL_1_QUESTIONS,
  ...TOPIK_LEVEL_2_QUESTIONS,
  ...TOPIK_LEVEL_3_QUESTIONS,
  ...TOPIK_LEVEL_4_QUESTIONS,
  ...TOPIK_LEVEL_5_QUESTIONS,
  ...TOPIK_LEVEL_6_QUESTIONS,
};

export const TOPIK_READING_VOCABULARY_BY_PASSAGE: Record<string, Record<FeedbackLanguage, TopikReadingVocabularyItem[]>> = {
  ...TOPIK_LEVEL_1_VOCAB,
  ...TOPIK_LEVEL_2_VOCAB,
  ...TOPIK_LEVEL_3_VOCAB,
  ...TOPIK_LEVEL_4_VOCAB,
  ...TOPIK_LEVEL_5_VOCAB,
  ...TOPIK_LEVEL_6_VOCAB,
};
