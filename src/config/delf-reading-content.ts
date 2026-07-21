import type {
  DelfLevel,
  FeedbackLanguage,
  ReadingDifficulty,
  ReadingPassage,
  ReadingQuestion,
  ReadingQuestionExplanation,
  ReadingQuestionOption,
  ReadingQuestionType,
  ReadingSkillTag,
  ReadingVocabularyItem,
} from "@/types/reading";

/**
 * Offline fallback content bank for DELF Reading (Compréhension des Écrits)
 * — used whenever no ANTHROPIC_API_KEY is configured. Two original passages
 * per level, three questions per passage, each question fully localized in
 * en/ru/kz (prompt, options, hint, explanation). Never copies real DELF
 * texts; every explanation and evidence quote is grounded in the passage
 * actually written for it. Mirrors config/delf-listening-content.ts's
 * pattern.
 *
 * Passage `title`/`textType` are stored once (not per-language), matching
 * the existing precedent in delf-listening-content.ts's `topic` field.
 */

const LANGS: FeedbackLanguage[] = ["en", "ru", "kz"];

interface QuestionContentSpec {
  prompt: string;
  options: ReadingQuestionOption[];
  hint: string;
  explanation: ReadingQuestionExplanation;
}

interface QuestionSpec {
  id: string;
  passageId: string;
  questionNumber: number;
  type: ReadingQuestionType;
  correctOptionIds: string[];
  difficulty: ReadingDifficulty;
  skillTag: ReadingSkillTag;
  /** French — an exact substring of the passage body. */
  evidenceQuote: string;
  content: Record<FeedbackLanguage, QuestionContentSpec>;
}

interface VocabularySpec {
  term: string; // French
  translation: Record<FeedbackLanguage, string>;
  definition: Record<FeedbackLanguage, string>;
  exampleSentence: string; // French
}

function buildQuestionSet(spec: QuestionSpec): Record<FeedbackLanguage, ReadingQuestion> {
  const out = {} as Record<FeedbackLanguage, ReadingQuestion>;
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

function buildPassageQuestions(...specs: QuestionSpec[]): Record<FeedbackLanguage, ReadingQuestion[]> {
  const built = specs.map(buildQuestionSet);
  return {
    en: built.map((b) => b.en),
    ru: built.map((b) => b.ru),
    kz: built.map((b) => b.kz),
  };
}

function buildVocabulary(specs: VocabularySpec[]): Record<FeedbackLanguage, ReadingVocabularyItem[]> {
  const out = {} as Record<FeedbackLanguage, ReadingVocabularyItem[]>;
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
// A1 — Découverte: everyday situations, very short texts, ~40-60 words.
// ---------------------------------------------------------------------------

const A1_BIRTHDAY_EMAIL: ReadingPassage = {
  id: "a1-birthday-email-1",
  textType: "Email",
  title: "A birthday invitation",
  body: "Salut Camille,\n\nSamedi, c'est mon anniversaire ! Je fais une fête chez moi à 15h00. Il y a un gâteau au chocolat et de la musique. Mes cousins viennent aussi. Apporte ton maillot de bain, il y a une piscine !\n\nRéponds-moi vite.\n\nÀ samedi,\nLéo",
  estimatedWordCount: 55,
};

const a1BirthdayQ1: QuestionSpec = {
  id: "a1-birthday-email-1-q1",
  passageId: "a1-birthday-email-1",
  questionNumber: 1,
  type: "heading-matching",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "Samedi, c'est mon anniversaire ! Je fais une fête chez moi à 15h00.",
  content: {
    en: {
      prompt: "What is this email about?",
      options: [
        { id: "opt-a", text: "A birthday party" },
        { id: "opt-b", text: "A wedding" },
        { id: "opt-c", text: "A work meeting" },
        { id: "opt-d", text: "A vacation" },
      ],
      hint: "Look at the very first sentence — it names the occasion directly.",
      explanation: {
        whereInText: "The second sentence states the occasion directly: \"Samedi, c'est mon anniversaire ! Je fais une fête chez moi à 15h00.\"",
        keywords: "anniversaire, fête",
        whyCorrect: "\"Anniversaire\" means birthday, and Léo says he's hosting a party (\"fête\") at his home — this is a birthday party invitation.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Nothing in the email mentions marriage or a wedding ceremony." },
          { optionId: "opt-c", reason: "The tone is casual (\"Salut\") and about cake and music, not work." },
          { optionId: "opt-d", reason: "There's no mention of travel or a trip — the party happens \"chez moi\" (at my place)." },
        ],
        vocabulary: [
          { term: "anniversaire", translation: "birthday" },
          { term: "fête", translation: "party" },
        ],
        grammarPattern: "\"C'est mon anniversaire\" uses c'est + possessive to identify what an occasion is — a very common A1 pattern for announcing events.",
        strategy: "For short informal texts, the occasion is almost always named in the first or second sentence — read the opening carefully before anything else.",
      },
    },
    ru: {
      prompt: "О чём это письмо?",
      options: [
        { id: "opt-a", text: "О дне рождения" },
        { id: "opt-b", text: "О свадьбе" },
        { id: "opt-c", text: "О рабочей встрече" },
        { id: "opt-d", text: "Об отпуске" },
      ],
      hint: "Посмотрите на самое первое предложение — там прямо назван повод.",
      explanation: {
        whereInText: "Второе предложение прямо называет повод: «Samedi, c'est mon anniversaire ! Je fais une fête chez moi à 15h00.»",
        keywords: "anniversaire, fête",
        whyCorrect: "«Anniversaire» значит день рождения, и Лео пишет, что устраивает вечеринку («fête») у себя дома — это приглашение на день рождения.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "В письме нет ни слова о свадьбе или бракосочетании." },
          { optionId: "opt-c", reason: "Тон письма неформальный («Salut»), речь о торте и музыке, а не о работе." },
          { optionId: "opt-d", reason: "Нет упоминания о путешествии — вечеринка проходит «chez moi» (у меня дома)." },
        ],
        vocabulary: [
          { term: "anniversaire", translation: "день рождения" },
          { term: "fête", translation: "вечеринка" },
        ],
        grammarPattern: "«C'est mon anniversaire» — конструкция c'est + притяжательное местоимение, обычная для уровня A1 при объявлении повода.",
        strategy: "В коротких неформальных текстах повод почти всегда называется в первом или втором предложении — внимательно читайте начало текста.",
      },
    },
    kz: {
      prompt: "Бұл хат не туралы?",
      options: [
        { id: "opt-a", text: "Туған күн туралы" },
        { id: "opt-b", text: "Үйлену тойы туралы" },
        { id: "opt-c", text: "Жұмыс кездесуі туралы" },
        { id: "opt-d", text: "Демалыс туралы" },
      ],
      hint: "Ең бірінші сөйлемге қараңыз — онда себеп тікелей аталған.",
      explanation: {
        whereInText: "Екінші сөйлемде себеп тікелей айтылады: «Samedi, c'est mon anniversaire ! Je fais une fête chez moi à 15h00.»",
        keywords: "anniversaire, fête",
        whyCorrect: "«Anniversaire» туған күнді білдіреді, ал Лео үйінде кеш («fête») өткізетінін жазады — бұл туған күнге шақыру.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Хатта үйлену тойы туралы бірде-бір сөз жоқ." },
          { optionId: "opt-c", reason: "Хаттың үні бейресми («Salut»), онда торт пен музыка туралы айтылады, жұмыс емес." },
          { optionId: "opt-d", reason: "Саяхат туралы айтылмайды — кеш «chez moi» (менің үйімде) өтеді." },
        ],
        vocabulary: [
          { term: "anniversaire", translation: "туған күн" },
          { term: "fête", translation: "мереке/кеш" },
        ],
        grammarPattern: "«C'est mon anniversaire» — c'est + тәуелдік есімдігі құрылымы, A1 деңгейінде себепті хабарлауда жиі қолданылады.",
        strategy: "Қысқа бейресми мәтіндерде себеп әдетте бірінші немесе екінші сөйлемде аталады — мәтіннің басын мұқият оқыңыз.",
      },
    },
  },
};

const a1BirthdayQ2: QuestionSpec = {
  id: "a1-birthday-email-1-q2",
  passageId: "a1-birthday-email-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "detail",
  evidenceQuote: "Je fais une fête chez moi à 15h00.",
  content: {
    en: {
      prompt: "What time does the party start?",
      options: [
        { id: "opt-a", text: "14h00" },
        { id: "opt-b", text: "15h00" },
        { id: "opt-c", text: "16h00" },
        { id: "opt-d", text: "17h00" },
      ],
      hint: "The exact time appears right after Léo says he's hosting a party.",
      explanation: {
        whereInText: "\"Je fais une fête chez moi à 15h00.\"",
        keywords: "à 15h00",
        whyCorrect: "The text states the party is \"à 15h00\" (at 3pm) — a single, unambiguous number.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "14h00 doesn't appear anywhere in the text — it's a plausible but invented distractor." },
          { optionId: "opt-c", reason: "16h00 is not mentioned; it's close to the real time to test careful reading." },
          { optionId: "opt-d", reason: "17h00 is never stated in the email." },
        ],
        vocabulary: [{ term: "à 15h00", translation: "at 3pm" }],
        grammarPattern: "French uses the 24-hour clock in formal/written contexts, so \"15h00\" = 3pm, not 5pm.",
        strategy: "For time/number questions, scan the text for digits first — they're easy to spot and rarely repeated elsewhere, so there's only one place to check.",
      },
    },
    ru: {
      prompt: "Во сколько начинается вечеринка?",
      options: [
        { id: "opt-a", text: "14:00" },
        { id: "opt-b", text: "15:00" },
        { id: "opt-c", text: "16:00" },
        { id: "opt-d", text: "17:00" },
      ],
      hint: "Точное время указано сразу после того, как Лео пишет, что устраивает вечеринку.",
      explanation: {
        whereInText: "«Je fais une fête chez moi à 15h00.»",
        keywords: "à 15h00",
        whyCorrect: "В тексте прямо сказано «à 15h00» (в 15:00) — однозначное число.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "14:00 нигде не упоминается — это правдоподобный, но выдуманный вариант." },
          { optionId: "opt-c", reason: "16:00 не упоминается; вариант близок к реальному времени, чтобы проверить внимательность." },
          { optionId: "opt-d", reason: "17:00 в письме не встречается." },
        ],
        vocabulary: [{ term: "à 15h00", translation: "в 15:00" }],
        grammarPattern: "Во французском в письменной речи используется 24-часовой формат, поэтому «15h00» — это 15:00, а не 17:00.",
        strategy: "В вопросах о времени и числах сначала ищите в тексте цифры — их легко заметить, и они обычно встречаются только один раз.",
      },
    },
    kz: {
      prompt: "Кеш неше сағатта басталады?",
      options: [
        { id: "opt-a", text: "14:00" },
        { id: "opt-b", text: "15:00" },
        { id: "opt-c", text: "16:00" },
        { id: "opt-d", text: "17:00" },
      ],
      hint: "Нақты уақыт Лео кеш өткізетінін айтқаннан кейін бірден келтіріледі.",
      explanation: {
        whereInText: "«Je fais une fête chez moi à 15h00.»",
        keywords: "à 15h00",
        whyCorrect: "Мәтінде тікелей «à 15h00» (сағат 15:00-де) делінген — бір мағыналы сан.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "14:00 мәтінде мүлде жоқ — бұл сенімді көрінетін, бірақ ойдан шығарылған нұсқа." },
          { optionId: "opt-c", reason: "16:00 аталмаған; мұқияттылықты тексеру үшін нақты уақытқа жақын қойылған." },
          { optionId: "opt-d", reason: "17:00 хатта мүлде айтылмайды." },
        ],
        vocabulary: [{ term: "à 15h00", translation: "сағат 15:00-де" }],
        grammarPattern: "Француз тілінде жазбаша мәтінде 24 сағаттық формат қолданылады, сондықтан «15h00» — 15:00, 17:00 емес.",
        strategy: "Уақыт пен сандар туралы сұрақтарда алдымен мәтіндегі цифрларды іздеңіз — оларды байқау оңай және әдетте бір рет қана кездеседі.",
      },
    },
  },
};

const a1BirthdayQ3: QuestionSpec = {
  id: "a1-birthday-email-1-q3",
  passageId: "a1-birthday-email-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "easy",
  skillTag: "detail",
  evidenceQuote: "Apporte ton maillot de bain, il y a une piscine !",
  content: {
    en: {
      prompt: "Léo asks Camille to bring her swimsuit.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      hint: "Look near the end of the email, right after the mention of a pool.",
      explanation: {
        whereInText: "\"Apporte ton maillot de bain, il y a une piscine !\"",
        keywords: "Apporte ton maillot de bain",
        whyCorrect: "\"Apporte\" is an imperative (\"bring\"), and \"ton maillot de bain\" means \"your swimsuit\" — a direct request.",
        whyIncorrect: [{ optionId: "opt-false", reason: "The imperative \"Apporte ton maillot de bain\" is an explicit, unambiguous request — there's no room to read it as false." }],
        vocabulary: [
          { term: "maillot de bain", translation: "swimsuit" },
          { term: "piscine", translation: "swimming pool" },
        ],
        grammarPattern: "\"Apporte\" is the tu-form imperative of \"apporter\" (to bring) — imperatives drop the subject pronoun in French.",
        strategy: "For true/false questions, find the exact sentence and check whether it matches the statement word for word — don't rely on a vague impression of the whole text.",
      },
    },
    ru: {
      prompt: "Лео просит Камиль принести купальник.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      hint: "Посмотрите ближе к концу письма, сразу после упоминания бассейна.",
      explanation: {
        whereInText: "«Apporte ton maillot de bain, il y a une piscine !»",
        keywords: "Apporte ton maillot de bain",
        whyCorrect: "«Apporte» — повелительное наклонение («принеси»), а «ton maillot de bain» значит «твой купальник» — это прямая просьба.",
        whyIncorrect: [{ optionId: "opt-false", reason: "Повелительная форма «Apporte ton maillot de bain» — это явная, однозначная просьба, здесь нет места для утверждения «неверно»." }],
        vocabulary: [
          { term: "maillot de bain", translation: "купальник" },
          { term: "piscine", translation: "бассейн" },
        ],
        grammarPattern: "«Apporte» — форма повелительного наклонения глагола «apporter» (приносить) для «tu»; во французском повелительном наклонении местоимение опускается.",
        strategy: "В вопросах «верно/неверно» найдите точное предложение и сравните его с утверждением слово в слово — не полагайтесь на общее впечатление от текста.",
      },
    },
    kz: {
      prompt: "Лео Камильден жүзу костюмін алып келуін сұрайды.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Дұрыс емес" },
      ],
      hint: "Хаттың соңына жақын, бассейн туралы айтылғаннан кейінгі жерге қараңыз.",
      explanation: {
        whereInText: "«Apporte ton maillot de bain, il y a une piscine !»",
        keywords: "Apporte ton maillot de bain",
        whyCorrect: "«Apporte» — бұйрық рай («әкел»), ал «ton maillot de bain» «сенің жүзу костюміңді» дегенді білдіреді — бұл тікелей сұраныс.",
        whyIncorrect: [{ optionId: "opt-false", reason: "«Apporte ton maillot de bain» бұйрық түрі — анық, бір мағыналы сұраныс, оны «дұрыс емес» деп түсінуге негіз жоқ." }],
        vocabulary: [
          { term: "maillot de bain", translation: "жүзу костюмі" },
          { term: "piscine", translation: "бассейн" },
        ],
        grammarPattern: "«Apporte» — «apporter» (әкелу) етістігінің tu-формасындағы бұйрық райы; француз тілінде бұйрық райда есімдік түсіп қалады.",
        strategy: "Дұрыс/дұрыс емес сұрақтарында нақты сөйлемді тауып, оны тұжырыммен сөзбе-сөз салыстырыңыз — мәтіннің жалпы әсеріне сүйенбеңіз.",
      },
    },
  },
};

const A1_BIRTHDAY_VOCAB: VocabularySpec[] = [
  {
    term: "anniversaire",
    translation: { en: "birthday", ru: "день рождения", kz: "туған күн" },
    definition: {
      en: "The yearly celebration of the day someone was born.",
      ru: "Ежегодное празднование дня, когда кто-то родился.",
      kz: "Біреудің дүниеге келген күнін жыл сайын тойлау.",
    },
    exampleSentence: "Samedi, c'est mon anniversaire !",
  },
  {
    term: "fête",
    translation: { en: "party", ru: "вечеринка", kz: "мереке/кеш" },
    definition: {
      en: "A social gathering to celebrate an occasion.",
      ru: "Общественное собрание в честь какого-либо события.",
      kz: "Бір оқиғаны атап өтуге арналған жиын.",
    },
    exampleSentence: "Je fais une fête chez moi à 15h00.",
  },
  {
    term: "maillot de bain",
    translation: { en: "swimsuit", ru: "купальник", kz: "жүзу костюмі" },
    definition: {
      en: "Clothing worn for swimming.",
      ru: "Одежда, которую носят для плавания.",
      kz: "Жүзу кезінде киілетін киім.",
    },
    exampleSentence: "Apporte ton maillot de bain, il y a une piscine !",
  },
  {
    term: "piscine",
    translation: { en: "swimming pool", ru: "бассейн", kz: "бассейн" },
    definition: {
      en: "A structure filled with water for swimming.",
      ru: "Сооружение с водой для плавания.",
      kz: "Жүзуге арналған сумен толтырылған құрылым.",
    },
    exampleSentence: "Il y a une piscine chez Léo.",
  },
];

const A1_LIBRARY_NOTICE: ReadingPassage = {
  id: "a1-library-notice-1",
  textType: "Notice",
  title: "Library summer hours",
  body: "Bibliothèque municipale — Horaires d'été\n\nDu lundi au vendredi : 9h00 – 18h00.\nLe samedi : 9h00 – 13h00.\nFermée le dimanche et les jours fériés.\n\nAttention : la bibliothèque est fermée du 1er au 15 août pour les vacances. Merci de votre compréhension !",
  estimatedWordCount: 45,
};

const a1LibraryQ1: QuestionSpec = {
  id: "a1-library-notice-1-q1",
  passageId: "a1-library-notice-1",
  questionNumber: 1,
  type: "matching",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "Bibliothèque municipale — Horaires d'été",
  content: {
    en: {
      prompt: "What is this notice about?",
      options: [
        { id: "opt-a", text: "Library opening hours" },
        { id: "opt-b", text: "A book sale" },
        { id: "opt-c", text: "A concert" },
        { id: "opt-d", text: "A job offer" },
      ],
      hint: "The title tells you exactly what kind of information follows.",
      explanation: {
        whereInText: "The title: \"Bibliothèque municipale — Horaires d'été\", followed by a list of opening times.",
        keywords: "Horaires d'été",
        whyCorrect: "\"Horaires\" means schedule/hours, and every line that follows lists opening times for the library.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "No prices or books for sale are mentioned anywhere in the notice." },
          { optionId: "opt-c", reason: "There is no mention of music, tickets, or an event." },
          { optionId: "opt-d", reason: "Nothing about hiring or employment appears in the text." },
        ],
        vocabulary: [{ term: "horaires", translation: "opening hours / schedule" }],
        grammarPattern: "Notices often use a title + list format with no full sentences — the title alone usually tells you the whole topic.",
        strategy: "For short official notices, always read the title first — it names the topic before you even reach the details.",
      },
    },
    ru: {
      prompt: "О чём это объявление?",
      options: [
        { id: "opt-a", text: "О часах работы библиотеки" },
        { id: "opt-b", text: "О распродаже книг" },
        { id: "opt-c", text: "О концерте" },
        { id: "opt-d", text: "О вакансии" },
      ],
      hint: "Заголовок сразу говорит, о какой информации пойдёт речь.",
      explanation: {
        whereInText: "Заголовок: «Bibliothèque municipale — Horaires d'été», далее список часов работы.",
        keywords: "Horaires d'été",
        whyCorrect: "«Horaires» значит расписание/часы, и каждая последующая строка перечисляет часы работы библиотеки.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Ни цены, ни книги на продажу нигде не упоминаются." },
          { optionId: "opt-c", reason: "Нет упоминания музыки, билетов или мероприятия." },
          { optionId: "opt-d", reason: "О найме на работу в тексте ничего не сказано." },
        ],
        vocabulary: [{ term: "horaires", translation: "часы работы / расписание" }],
        grammarPattern: "Объявления часто строятся как заголовок + список, без полных предложений — заголовок обычно называет всю тему.",
        strategy: "В коротких официальных объявлениях всегда сначала читайте заголовок — он называет тему ещё до деталей.",
      },
    },
    kz: {
      prompt: "Бұл хабарландыру не туралы?",
      options: [
        { id: "opt-a", text: "Кітапхананың жұмыс уақыты туралы" },
        { id: "opt-b", text: "Кітап сатылымы туралы" },
        { id: "opt-c", text: "Концерт туралы" },
        { id: "opt-d", text: "Жұмыс орны туралы" },
      ],
      hint: "Тақырып сізге қандай ақпарат берілетінін бірден айтады.",
      explanation: {
        whereInText: "Тақырып: «Bibliothèque municipale — Horaires d'été», одан кейін жұмыс уақыттарының тізімі.",
        keywords: "Horaires d'été",
        whyCorrect: "«Horaires» кесте/уақыт дегенді білдіреді, келесі әрбір жол кітапхананың жұмыс уақытын тізеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Хабарландыруда баға немесе сатылымдағы кітаптар туралы ештеңе жоқ." },
          { optionId: "opt-c", reason: "Музыка, билет немесе іс-шара туралы айтылмайды." },
          { optionId: "opt-d", reason: "Мәтінде жалдау немесе жұмысқа қабылдау туралы ештеңе жоқ." },
        ],
        vocabulary: [{ term: "horaires", translation: "жұмыс уақыты / кесте" }],
        grammarPattern: "Хабарландырулар көбіне толық сөйлемсіз, тақырып + тізім түрінде беріледі — тақырыптың өзі бүкіл тақырыпты айтады.",
        strategy: "Қысқа ресми хабарландыруларда әрқашан алдымен тақырыпты оқыңыз — ол детальдерге жеткенше тақырыпты атайды.",
      },
    },
  },
};

const a1LibraryQ2: QuestionSpec = {
  id: "a1-library-notice-1-q2",
  passageId: "a1-library-notice-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "detail",
  evidenceQuote: "Le samedi : 9h00 – 13h00.",
  content: {
    en: {
      prompt: "What time does the library close on Saturday?",
      options: [
        { id: "opt-a", text: "13h00" },
        { id: "opt-b", text: "18h00" },
        { id: "opt-c", text: "9h00" },
        { id: "opt-d", text: "20h00" },
      ],
      hint: "Saturday has its own separate line — don't confuse it with the weekday hours.",
      explanation: {
        whereInText: "\"Le samedi : 9h00 – 13h00.\"",
        keywords: "Le samedi",
        whyCorrect: "The Saturday line lists \"9h00 – 13h00\", so closing time is 13h00.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "18h00 is the weekday (Monday-Friday) closing time, not Saturday's." },
          { optionId: "opt-c", reason: "9h00 is the opening time on Saturday, not the closing time." },
          { optionId: "opt-d", reason: "20h00 doesn't appear anywhere in the notice." },
        ],
        vocabulary: [{ term: "samedi", translation: "Saturday" }],
        grammarPattern: "The dash between two times (\"9h00 – 13h00\") marks an opening-to-closing range.",
        strategy: "When a text lists different hours for different days, match the exact day named in the question to its own line — don't average or guess.",
      },
    },
    ru: {
      prompt: "Во сколько библиотека закрывается в субботу?",
      options: [
        { id: "opt-a", text: "13:00" },
        { id: "opt-b", text: "18:00" },
        { id: "opt-c", text: "9:00" },
        { id: "opt-d", text: "20:00" },
      ],
      hint: "У субботы отдельная строка — не путайте её с часами в будние дни.",
      explanation: {
        whereInText: "«Le samedi : 9h00 – 13h00.»",
        keywords: "Le samedi",
        whyCorrect: "В строке про субботу указано «9h00 – 13h00», значит закрытие в 13:00.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "18:00 — время закрытия в будние дни (с понедельника по пятницу), а не в субботу." },
          { optionId: "opt-c", reason: "9:00 — время открытия в субботу, а не закрытия." },
          { optionId: "opt-d", reason: "20:00 нигде в объявлении не упоминается." },
        ],
        vocabulary: [{ term: "samedi", translation: "суббота" }],
        grammarPattern: "Тире между двумя временами («9h00 – 13h00») обозначает диапазон от открытия до закрытия.",
        strategy: "Когда в тексте перечислены разные часы для разных дней, сопоставляйте именно тот день, который назван в вопросе, с его собственной строкой — не усредняйте и не гадайте.",
      },
    },
    kz: {
      prompt: "Кітапхана сенбіде неше сағатта жабылады?",
      options: [
        { id: "opt-a", text: "13:00" },
        { id: "opt-b", text: "18:00" },
        { id: "opt-c", text: "9:00" },
        { id: "opt-d", text: "20:00" },
      ],
      hint: "Сенбінің өз жолы бар — оны апта күндерінің уақытымен шатастырмаңыз.",
      explanation: {
        whereInText: "«Le samedi : 9h00 – 13h00.»",
        keywords: "Le samedi",
        whyCorrect: "Сенбі жолында «9h00 – 13h00» көрсетілген, демек жабылу уақыты 13:00.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "18:00 — дүйсенбіден жұмаға дейінгі жабылу уақыты, сенбінікі емес." },
          { optionId: "opt-c", reason: "9:00 — сенбідегі ашылу уақыты, жабылу емес." },
          { optionId: "opt-d", reason: "20:00 хабарландыруда мүлде жоқ." },
        ],
        vocabulary: [{ term: "samedi", translation: "сенбі" }],
        grammarPattern: "Екі уақыт арасындағы сызықша («9h00 – 13h00») ашылудан жабылуға дейінгі аралықты білдіреді.",
        strategy: "Мәтінде әр түрлі күндерге әр түрлі уақыт көрсетілгенде, сұрақта аталған күнді дәл сол жолмен салыстырыңыз — орташалама немесе болжамаңыз.",
      },
    },
  },
};

const a1LibraryQ3: QuestionSpec = {
  id: "a1-library-notice-1-q3",
  passageId: "a1-library-notice-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "inference",
  evidenceQuote: "la bibliothèque est fermée du 1er au 15 août pour les vacances",
  content: {
    en: {
      prompt: "The library is closed for the entire month of August.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      hint: "Compare the exact dates given to the length of a full month.",
      explanation: {
        whereInText: "\"la bibliothèque est fermée du 1er au 15 août pour les vacances\"",
        keywords: "du 1er au 15 août",
        whyCorrect: "The notice says the library is closed \"du 1er au 15 août\" — from August 1st to 15th, which is only half the month, not the whole thing.",
        whyIncorrect: [{ optionId: "opt-true", reason: "This misreads \"du 1er au 15 août\" (half the month) as if it meant the entire month — the dates given are a specific two-week range, not \"all of August\"." }],
        vocabulary: [{ term: "fermée", translation: "closed" }],
        grammarPattern: "\"Du... au...\" marks a date range (\"from... to...\") — it always names both a start and an end point, never an open-ended period.",
        strategy: "When a statement uses an absolute word like \"entire\" or \"all\", check the text for an exact range first — a partial date range almost always makes an \"entire/all\" statement false.",
      },
    },
    ru: {
      prompt: "Библиотека закрыта весь август.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      hint: "Сравните точные даты с длительностью целого месяца.",
      explanation: {
        whereInText: "«la bibliothèque est fermée du 1er au 15 août pour les vacances»",
        keywords: "du 1er au 15 août",
        whyCorrect: "В объявлении сказано, что библиотека закрыта «du 1er au 15 août» — с 1 по 15 августа, это только половина месяца, а не весь месяц.",
        whyIncorrect: [{ optionId: "opt-true", reason: "Это неверно истолковывает «du 1er au 15 août» (половина месяца), как будто имеется в виду весь месяц — указан конкретный двухнедельный период, а не «весь август»." }],
        vocabulary: [{ term: "fermée", translation: "закрыта" }],
        grammarPattern: "«Du... au...» обозначает диапазон дат («с... по...») — всегда называет и начало, и конец, а не неограниченный период.",
        strategy: "Когда утверждение использует абсолютное слово вроде «весь» или «целиком», сначала проверьте в тексте точный диапазон — частичный диапазон дат почти всегда делает утверждение «весь/целиком» неверным.",
      },
    },
    kz: {
      prompt: "Кітапхана тамыздың бүкіл айында жабық.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Дұрыс емес" },
      ],
      hint: "Берілген нақты даталарды толық айдың ұзақтығымен салыстырыңыз.",
      explanation: {
        whereInText: "«la bibliothèque est fermée du 1er au 15 août pour les vacances»",
        keywords: "du 1er au 15 août",
        whyCorrect: "Хабарландыруда кітапхана «du 1er au 15 août» — тамыздың 1-нен 15-іне дейін жабық делінген, бұл айдың жартысы ғана, бүкіл ай емес.",
        whyIncorrect: [{ optionId: "opt-true", reason: "Бұл «du 1er au 15 août» (айдың жартысы) дегенді бүкіл ай ретінде қате түсіндіреді — нақты екі апталық аралық көрсетілген, «бүкіл тамыз» емес." }],
        vocabulary: [{ term: "fermée", translation: "жабық" }],
        grammarPattern: "«Du... au...» дата аралығын білдіреді («...-нан ...-ге дейін») — әрқашан басы мен соңын атайды, шексіз кезеңді емес.",
        strategy: "Тұжырымда «бүкіл» немесе «толығымен» сияқты абсолютті сөз қолданылғанда, алдымен мәтіндегі нақты аралықты тексеріңіз — ішінара дата аралығы әдетте «бүкіл/толығымен» тұжырымын дұрыс емес етеді.",
      },
    },
  },
};

const A1_LIBRARY_VOCAB: VocabularySpec[] = [
  {
    term: "bibliothèque",
    translation: { en: "library", ru: "библиотека", kz: "кітапхана" },
    definition: {
      en: "A place where books are kept for people to read or borrow.",
      ru: "Место, где хранятся книги для чтения или выдачи на дом.",
      kz: "Кітаптар оқу немесе алу үшін сақталатын орын.",
    },
    exampleSentence: "Bibliothèque municipale — Horaires d'été",
  },
  {
    term: "horaires",
    translation: { en: "opening hours", ru: "часы работы", kz: "жұмыс уақыты" },
    definition: {
      en: "The times during which a place is open.",
      ru: "Время, в течение которого место открыто.",
      kz: "Орынның ашық болатын уақыты.",
    },
    exampleSentence: "Horaires d'été",
  },
  {
    term: "fermée",
    translation: { en: "closed", ru: "закрыта", kz: "жабық" },
    definition: {
      en: "Not open to the public.",
      ru: "Не открыта для посетителей.",
      kz: "Жұртшылыққа ашық емес.",
    },
    exampleSentence: "Fermée le dimanche et les jours fériés.",
  },
  {
    term: "jours fériés",
    translation: { en: "public holidays", ru: "праздничные дни", kz: "мереке күндері" },
    definition: {
      en: "Official days off, usually national or religious holidays.",
      ru: "Официальные нерабочие дни, обычно национальные или религиозные праздники.",
      kz: "Ресми демалыс күндері, әдетте ұлттық немесе діни мерекелер.",
    },
    exampleSentence: "Fermée le dimanche et les jours fériés.",
  },
];

export const A1_PASSAGES: ReadingPassage[] = [A1_BIRTHDAY_EMAIL, A1_LIBRARY_NOTICE];

export const A1_QUESTIONS_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingQuestion[]>> = {
  "a1-birthday-email-1": buildPassageQuestions(a1BirthdayQ1, a1BirthdayQ2, a1BirthdayQ3),
  "a1-library-notice-1": buildPassageQuestions(a1LibraryQ1, a1LibraryQ2, a1LibraryQ3),
};

export const A1_VOCABULARY_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingVocabularyItem[]>> = {
  "a1-birthday-email-1": buildVocabulary(A1_BIRTHDAY_VOCAB),
  "a1-library-notice-1": buildVocabulary(A1_LIBRARY_VOCAB),
};

// ---------------------------------------------------------------------------
// A2 — Survie: everyday situations, short texts, ~100-150 words.
// ---------------------------------------------------------------------------

const A2_NICE_BLOG: ReadingPassage = {
  id: "a2-nice-blog-1",
  textType: "Blog post",
  title: "My weekend in Nice",
  body: "Mon week-end à Nice\n\nLe week-end dernier, je suis allée à Nice avec mon amie Sarah. Nous avons pris le train vendredi soir et nous sommes arrivées très fatiguées, mais heureuses ! Samedi matin, nous avons marché le long de la Promenade des Anglais et nous avons mangé une socca, une spécialité niçoise à base de farine de pois chiches. L'après-midi, il a commencé à pleuvoir, alors nous avons visité le musée Matisse. Le soir, nous avons dîné dans un petit restaurant du Vieux Nice. Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu. Malgré la pluie, ce court séjour restera un très bon souvenir.",
  estimatedWordCount: 130,
};

const a2NiceQ1: QuestionSpec = {
  id: "a2-nice-blog-1-q1",
  passageId: "a2-nice-blog-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "Mon week-end à Nice\n\nLe week-end dernier, je suis allée à Nice avec mon amie Sarah.",
  content: {
    en: {
      prompt: "What is this blog post mainly about?",
      options: [
        { id: "opt-a", text: "A weekend trip to Nice" },
        { id: "opt-b", text: "A cooking recipe" },
        { id: "opt-c", text: "A job interview" },
        { id: "opt-d", text: "A history lesson" },
      ],
      hint: "Check the title and first sentence together — they usually agree on the topic.",
      explanation: {
        whereInText: "The title \"Mon week-end à Nice\" and the opening line about going to Nice with a friend.",
        keywords: "week-end à Nice",
        whyCorrect: "The title and the whole post describe a two-day trip to Nice: travel, sightseeing, food, weather, and a museum visit.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Socca is mentioned as a food eaten, not as a recipe being explained." },
          { optionId: "opt-c", reason: "There's no mention of a job, an employer, or an interview anywhere." },
          { optionId: "opt-d", reason: "The Matisse museum is visited, but the post isn't a history lesson — it's a personal account of the trip." },
        ],
        vocabulary: [{ term: "week-end", translation: "weekend" }],
        grammarPattern: "The passé composé (\"je suis allée\", \"nous avons marché\") narrates completed past actions — a strong signal this is a personal recount, not a recipe or lesson.",
        strategy: "Titles in blog posts almost always match the main idea directly — read the title as your first clue before the body text.",
      },
    },
    ru: {
      prompt: "О чём в основном этот пост в блоге?",
      options: [
        { id: "opt-a", text: "О поездке на выходные в Ниццу" },
        { id: "opt-b", text: "О кулинарном рецепте" },
        { id: "opt-c", text: "О собеседовании на работу" },
        { id: "opt-d", text: "Об уроке истории" },
      ],
      hint: "Посмотрите вместе на заголовок и первое предложение — они обычно совпадают по теме.",
      explanation: {
        whereInText: "Заголовок «Mon week-end à Nice» и первая фраза о поездке в Ниццу с подругой.",
        keywords: "week-end à Nice",
        whyCorrect: "Заголовок и весь текст описывают двухдневную поездку в Ниццу: дорога, прогулки, еда, погода и посещение музея.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Сокка упоминается как еда, которую съели, а не как объясняемый рецепт." },
          { optionId: "opt-c", reason: "Нигде не упоминается работа, работодатель или собеседование." },
          { optionId: "opt-d", reason: "Музей Матисса посетили, но пост — это не урок истории, а личный рассказ о поездке." },
        ],
        vocabulary: [{ term: "week-end", translation: "выходные" }],
        grammarPattern: "Passé composé («je suis allée», «nous avons marché») описывает завершённые действия в прошлом — явный признак личного рассказа, а не рецепта или урока.",
        strategy: "Заголовки в блог-постах почти всегда напрямую совпадают с основной идеей — сначала используйте заголовок как подсказку, прежде чем читать основной текст.",
      },
    },
    kz: {
      prompt: "Бұл блог жазбасы негізінен не туралы?",
      options: [
        { id: "opt-a", text: "Ниццаға демалыс күндеріндегі сапар туралы" },
        { id: "opt-b", text: "Тағам дайындау рецепті туралы" },
        { id: "opt-c", text: "Жұмысқа сұхбат туралы" },
        { id: "opt-d", text: "Тарих сабағы туралы" },
      ],
      hint: "Тақырып пен бірінші сөйлемді бірге қараңыз — олар әдетте тақырыпта сәйкес келеді.",
      explanation: {
        whereInText: "«Mon week-end à Nice» тақырыбы және досымен Ниццаға баруы туралы бірінші сөйлем.",
        keywords: "week-end à Nice",
        whyCorrect: "Тақырып пен бүкіл мәтін Ниццаға екі күндік сапарды сипаттайды: жол жүру, серуендеу, тамақ, ауа райы және мұражайға бару.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Сокка жеген тағам ретінде айтылады, түсіндірілетін рецепт ретінде емес." },
          { optionId: "opt-c", reason: "Жұмыс, жұмыс беруші немесе сұхбат туралы ешбір жерде айтылмайды." },
          { optionId: "opt-d", reason: "Матисс мұражайына барады, бірақ жазба тарих сабағы емес — бұл сапар туралы жеке әңгіме." },
        ],
        vocabulary: [{ term: "week-end", translation: "демалыс күндері" }],
        grammarPattern: "Passé composé («je suis allée», «nous avons marché») аяқталған өткен әрекеттерді баяндайды — бұл жеке әңгіме екенінің айқын белгісі, рецепт немесе сабақ емес.",
        strategy: "Блог жазбаларындағы тақырыптар әдетте негізгі оймен тікелей сәйкес келеді — мәтінді оқымас бұрын алдымен тақырыпты белгі ретінде пайдаланыңыз.",
      },
    },
  },
};

const a2NiceQ2: QuestionSpec = {
  id: "a2-nice-blog-1-q2",
  passageId: "a2-nice-blog-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "Dimanche, malheureusement, il pleuvait encore",
  content: {
    en: {
      prompt: "What was the weather like on Sunday?",
      options: [
        { id: "opt-a", text: "Sunny" },
        { id: "opt-b", text: "Rainy" },
        { id: "opt-c", text: "Snowy" },
        { id: "opt-d", text: "Windy" },
      ],
      hint: "The last part of the post describes the second day, Sunday.",
      explanation: {
        whereInText: "\"Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu.\"",
        keywords: "il pleuvait encore",
        whyCorrect: "\"Il pleuvait encore\" means \"it was still raining\", directly describing Sunday's weather.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Sunny weather is never mentioned for Sunday — Saturday afternoon rain is what's described, continuing into Sunday." },
          { optionId: "opt-c", reason: "Snow is never mentioned anywhere in the post — this is a summer/rainy scenario, not winter." },
          { optionId: "opt-d", reason: "Wind is not mentioned at all; the described weather is rain." },
        ],
        vocabulary: [{ term: "pleuvoir", translation: "to rain" }],
        grammarPattern: "\"Il pleuvait\" is the imperfect tense, used for an ongoing weather condition in the past — different from passé composé, which marks completed one-time actions.",
        strategy: "When a question asks about a specific day, locate that day's name in the text first, then read only the sentence(s) right around it.",
      },
    },
    ru: {
      prompt: "Какая была погода в воскресенье?",
      options: [
        { id: "opt-a", text: "Солнечная" },
        { id: "opt-b", text: "Дождливая" },
        { id: "opt-c", text: "Снежная" },
        { id: "opt-d", text: "Ветреная" },
      ],
      hint: "В последней части поста описывается второй день, воскресенье.",
      explanation: {
        whereInText: "«Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu.»",
        keywords: "il pleuvait encore",
        whyCorrect: "«Il pleuvait encore» значит «всё ещё шёл дождь», это прямо описывает погоду в воскресенье.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Солнечная погода в воскресенье нигде не упоминается — описан дождь, начавшийся в субботу днём и продолжившийся в воскресенье." },
          { optionId: "opt-c", reason: "Снег вообще не упоминается в посте — это летний/дождливый сценарий, а не зимний." },
          { optionId: "opt-d", reason: "Ветер вообще не упоминается; описанная погода — дождь." },
        ],
        vocabulary: [{ term: "pleuvoir", translation: "идти (о дожде)" }],
        grammarPattern: "«Il pleuvait» — имперфект, используется для продолжающегося погодного условия в прошлом — в отличие от passé composé, который отмечает завершённые однократные действия.",
        strategy: "Когда вопрос касается конкретного дня, сначала найдите название этого дня в тексте, затем читайте только предложения рядом с ним.",
      },
    },
    kz: {
      prompt: "Жексенбіде ауа райы қандай болды?",
      options: [
        { id: "opt-a", text: "Күн шуақты болды" },
        { id: "opt-b", text: "Жаңбыр жауды" },
        { id: "opt-c", text: "Қар жауды" },
        { id: "opt-d", text: "Жел соқты" },
      ],
      hint: "Жазбаның соңғы бөлігінде екінші күн, жексенбі сипатталады.",
      explanation: {
        whereInText: "«Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu.»",
        keywords: "il pleuvait encore",
        whyCorrect: "«Il pleuvait encore» «әлі де жаңбыр жауып тұрды» дегенді білдіреді, бұл жексенбідегі ауа райын тікелей сипаттайды.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Жексенбіде күн шуақты болғаны туралы ешбір жерде айтылмайды — сипатталған жаңбыр сенбі түстен кейін басталып, жексенбіге дейін жалғасты." },
          { optionId: "opt-c", reason: "Жазбада қар туралы мүлде айтылмайды — бұл жазғы/жаңбырлы жағдай, қысқы емес." },
          { optionId: "opt-d", reason: "Жел туралы мүлде айтылмайды; сипатталған ауа райы — жаңбыр." },
        ],
        vocabulary: [{ term: "pleuvoir", translation: "жаңбыр жаву" }],
        grammarPattern: "«Il pleuvait» — өткен шақтағы жалғасып тұрған ауа-райы жағдайы үшін қолданылатын imparfait — аяқталған бір реттік әрекеттерді білдіретін passé composé-ден өзгеше.",
        strategy: "Сұрақ белгілі бір күн туралы болса, алдымен мәтіннен сол күннің атын тауып, тек соның маңындағы сөйлем(дер)ді ғана оқыңыз.",
      },
    },
  },
};

const a2NiceQ3: QuestionSpec = {
  id: "a2-nice-blog-1-q3",
  passageId: "a2-nice-blog-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "inference",
  evidenceQuote: "il pleuvait encore, donc nous sommes rentrées plus tôt que prévu",
  content: {
    en: {
      prompt: "Why did the two friends return home earlier than planned?",
      options: [
        { id: "opt-a", text: "Because of the rain" },
        { id: "opt-b", text: "Because they were sick" },
        { id: "opt-c", text: "Because they missed their train" },
        { id: "opt-d", text: "Because the hotel closed" },
      ],
      hint: "Look for the word \"donc\" (so/therefore) — it links a cause to its result.",
      explanation: {
        whereInText: "\"Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu.\"",
        keywords: "donc",
        whyCorrect: "\"Donc\" (so/therefore) directly connects the rain to the decision to return early — the rain is the stated cause.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Illness is never mentioned anywhere in the post." },
          { optionId: "opt-c", reason: "There's no mention of a missed train — only the outbound Friday train is described." },
          { optionId: "opt-d", reason: "The hotel/lodging closing is never mentioned; the post doesn't even name where they stayed." },
        ],
        vocabulary: [{ term: "donc", translation: "so / therefore" }],
        grammarPattern: "\"Donc\" is a cause-and-effect connector — whatever comes right before it is the reason for what comes after.",
        strategy: "For \"why\" questions, scan for connector words like \"donc\", \"parce que\", \"car\" — they mark exactly where a reason is given.",
      },
    },
    ru: {
      prompt: "Почему подруги вернулись домой раньше, чем планировали?",
      options: [
        { id: "opt-a", text: "Из-за дождя" },
        { id: "opt-b", text: "Потому что заболели" },
        { id: "opt-c", text: "Потому что опоздали на поезд" },
        { id: "opt-d", text: "Потому что отель закрылся" },
      ],
      hint: "Ищите слово «donc» (поэтому) — оно связывает причину со следствием.",
      explanation: {
        whereInText: "«Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu.»",
        keywords: "donc",
        whyCorrect: "«Donc» (поэтому) напрямую связывает дождь с решением вернуться раньше — дождь назван причиной.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Болезнь нигде в тексте не упоминается." },
          { optionId: "opt-c", reason: "Об опоздании на поезд ничего не сказано — описан только поезд туда, в пятницу." },
          { optionId: "opt-d", reason: "О закрытии отеля/жилья не упоминается вообще; в посте даже не названо, где они остановились." },
        ],
        vocabulary: [{ term: "donc", translation: "поэтому" }],
        grammarPattern: "«Donc» — связка причины и следствия: то, что стоит перед ней, является причиной того, что следует после.",
        strategy: "Для вопросов «почему» ищите связующие слова вроде «donc», «parce que», «car» — они точно указывают, где даётся причина.",
      },
    },
    kz: {
      prompt: "Достар неге жоспарланғаннан ерте үйге қайтты?",
      options: [
        { id: "opt-a", text: "Жаңбырға байланысты" },
        { id: "opt-b", text: "Ауырып қалғандықтан" },
        { id: "opt-c", text: "Пойызға кешігіп қалғандықтан" },
        { id: "opt-d", text: "Қонақүй жабылғандықтан" },
      ],
      hint: "«Donc» (сондықтан) сөзін іздеңіз — ол себепті салдармен байланыстырады.",
      explanation: {
        whereInText: "«Dimanche, malheureusement, il pleuvait encore, donc nous sommes rentrées plus tôt que prévu.»",
        keywords: "donc",
        whyCorrect: "«Donc» (сондықтан) жаңбырды ерте қайту шешімімен тікелей байланыстырады — жаңбыр себеп ретінде аталған.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Ауру туралы мәтінде мүлде айтылмайды." },
          { optionId: "opt-c", reason: "Пойызға кешігу туралы ештеңе жоқ — тек жұмада баратын пойыз ғана сипатталады." },
          { optionId: "opt-d", reason: "Қонақүйдің/тұрғын жердің жабылғаны туралы мүлде айтылмайды; жазбада қайда тоқтағаны да аталмаған." },
        ],
        vocabulary: [{ term: "donc", translation: "сондықтан" }],
        grammarPattern: "«Donc» — себеп-салдар жалғаулығы: одан бұрын келген нәрсе одан кейінгінің себебі болады.",
        strategy: "«Неге» деген сұрақтар үшін «donc», «parce que», «car» сияқты жалғаулық сөздерді іздеңіз — олар себептің қай жерде берілгенін дәл көрсетеді.",
      },
    },
  },
};

const A2_NICE_VOCAB: VocabularySpec[] = [
  {
    term: "socca",
    translation: { en: "socca (chickpea flatbread)", ru: "сокка (лепёшка из нутовой муки)", kz: "сокка (нохат ұнынан жасалған тәтті нан)" },
    definition: {
      en: "A savory flatbread from Nice made with chickpea flour.",
      ru: "Несладкая лепёшка из Ниццы, приготовленная из нутовой муки.",
      kz: "Ниццаның нохат ұнынан жасалатын дәмді жалпақ наны.",
    },
    exampleSentence: "Nous avons mangé une socca, une spécialité niçoise.",
  },
  {
    term: "promenade",
    translation: { en: "waterfront walkway", ru: "набережная / променад", kz: "жағалау серуен жолы" },
    definition: {
      en: "A paved path for walking, often along the coast.",
      ru: "Мощёная дорожка для прогулок, часто вдоль побережья.",
      kz: "Көбіне жағалау бойындағы серуендеуге арналған тасжол.",
    },
    exampleSentence: "Nous avons marché le long de la Promenade des Anglais.",
  },
  {
    term: "séjour",
    translation: { en: "stay / trip", ru: "пребывание / поездка", kz: "сапар / болу" },
    definition: {
      en: "A period of time spent somewhere, especially while traveling.",
      ru: "Период времени, проведённый где-либо, особенно во время путешествия.",
      kz: "Әсіресе саяхат кезінде бір жерде өткізілген уақыт кезеңі.",
    },
    exampleSentence: "Ce court séjour restera un très bon souvenir.",
  },
  {
    term: "malgré",
    translation: { en: "despite", ru: "несмотря на", kz: "қарамастан" },
    definition: {
      en: "In spite of something; used to contrast an obstacle with an outcome.",
      ru: "Вопреки чему-либо; используется для противопоставления препятствия и результата.",
      kz: "Бір нәрсеге қарамастан; кедергі мен нәтижені қарама-қарсы қоюда қолданылады.",
    },
    exampleSentence: "Malgré la pluie, ce court séjour restera un très bon souvenir.",
  },
];

const A2_RESTAURANT_REVIEW: ReadingPassage = {
  id: "a2-restaurant-review-1",
  textType: "Review",
  title: "Restaurant review: Le Petit Jardin",
  body: "Avis sur le restaurant \"Le Petit Jardin\"\n\nJ'ai dîné hier soir au Petit Jardin, un restaurant familial dans le centre-ville. L'accueil était chaleureux et le service rapide, même si le restaurant était complet. J'ai commandé le poulet rôti aux herbes, servi avec des légumes de saison : c'était délicieux et bien présenté. Mon mari a pris le poisson du jour, un peu trop salé à son goût. Les prix restent raisonnables pour la qualité proposée, environ vingt-cinq euros par personne sans les boissons. Seul petit bémol : la salle est bruyante quand il y a du monde. Je recommande cet endroit pour un dîner entre amis, mais peut-être pas pour un repas romantique et tranquille.",
  estimatedWordCount: 135,
};

const a2ReviewQ1: QuestionSpec = {
  id: "a2-restaurant-review-1-q1",
  passageId: "a2-restaurant-review-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "Avis sur le restaurant \"Le Petit Jardin\"",
  content: {
    en: {
      prompt: "What is the writer doing in this text?",
      options: [
        { id: "opt-a", text: "Reviewing a restaurant" },
        { id: "opt-b", text: "Complaining to a chef directly" },
        { id: "opt-c", text: "Advertising a hotel" },
        { id: "opt-d", text: "Describing how to cook a recipe" },
      ],
      hint: "The title itself names the genre of text this is.",
      explanation: {
        whereInText: "The title \"Avis sur le restaurant\" and the balanced mix of praise and criticism throughout.",
        keywords: "Avis sur le restaurant",
        whyCorrect: "\"Avis\" means \"review/opinion\", and the text evaluates food, service, price, and noise — a classic restaurant review structure.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The text is written for readers, not addressed to the chef directly — there's no \"vous\" aimed at restaurant staff." },
          { optionId: "opt-c", reason: "Nothing about rooms, hotels, or lodging is mentioned." },
          { optionId: "opt-d", reason: "No ingredients or cooking steps are given — dishes are only described as eaten, not prepared." },
        ],
        vocabulary: [{ term: "avis", translation: "review / opinion" }],
        grammarPattern: "The passé composé throughout (\"j'ai dîné\", \"j'ai commandé\") signals a first-person account of a past personal experience — typical of review writing.",
        strategy: "Identify the text type from its title and opening line before reading for detail — it tells you what kind of information to expect.",
      },
    },
    ru: {
      prompt: "Чем занимается автор в этом тексте?",
      options: [
        { id: "opt-a", text: "Пишет отзыв о ресторане" },
        { id: "opt-b", text: "Жалуется шеф-повару напрямую" },
        { id: "opt-c", text: "Рекламирует отель" },
        { id: "opt-d", text: "Описывает, как готовить блюдо" },
      ],
      hint: "Сам заголовок называет жанр этого текста.",
      explanation: {
        whereInText: "Заголовок «Avis sur le restaurant» и сбалансированное сочетание похвалы и критики по всему тексту.",
        keywords: "Avis sur le restaurant",
        whyCorrect: "«Avis» значит «отзыв/мнение», а текст оценивает еду, обслуживание, цену и уровень шума — классическая структура отзыва о ресторане.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Текст написан для читателей, а не обращён напрямую к шеф-повару — нет обращения «вы» к персоналу ресторана." },
          { optionId: "opt-c", reason: "Ничего о номерах, отелях или проживании не упоминается." },
          { optionId: "opt-d", reason: "Ингредиенты или шаги приготовления не даны — блюда описаны только как съеденные, а не приготовленные." },
        ],
        vocabulary: [{ term: "avis", translation: "отзыв / мнение" }],
        grammarPattern: "Passé composé на протяжении всего текста («j'ai dîné», «j'ai commandé») указывает на рассказ от первого лица о прошлом личном опыте — типично для отзыва.",
        strategy: "Определите тип текста по заголовку и первой строке, прежде чем читать детали — это подскажет, какой информации ожидать.",
      },
    },
    kz: {
      prompt: "Автор бұл мәтінде не істеп жатыр?",
      options: [
        { id: "opt-a", text: "Мейрамхана туралы пікір жазып жатыр" },
        { id: "opt-b", text: "Аспазшыға тікелей шағымданып жатыр" },
        { id: "opt-c", text: "Қонақүйді жарнамалап жатыр" },
        { id: "opt-d", text: "Тағам дайындауды сипаттап жатыр" },
      ],
      hint: "Тақырыптың өзі мәтіннің жанрын атайды.",
      explanation: {
        whereInText: "«Avis sur le restaurant» тақырыбы және мәтін бойы мақтау мен сынның теңгерімді қосындысы.",
        keywords: "Avis sur le restaurant",
        whyCorrect: "«Avis» «пікір/көзқарас» дегенді білдіреді, ал мәтін тағамды, қызметті, бағаны және шуды бағалайды — бұл мейрамхана пікірінің классикалық құрылымы.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мәтін оқырмандарға арналған, аспазшыға тікелей емес — мейрамхана қызметкерлеріне бағытталған «сіз» жоқ." },
          { optionId: "opt-c", reason: "Бөлмелер, қонақүйлер немесе тұру туралы ештеңе айтылмайды." },
          { optionId: "opt-d", reason: "Ингредиенттер немесе дайындау қадамдары берілмеген — тағамдар тек жеген түрінде сипатталған, дайындалған емес." },
        ],
        vocabulary: [{ term: "avis", translation: "пікір / көзқарас" }],
        grammarPattern: "Мәтін бойы passé composé («j'ai dîné», «j'ai commandé») бірінші жақтан баяндалған өткен жеке тәжірибені білдіреді — бұл пікір жазуға тән.",
        strategy: "Детальдерді оқымас бұрын мәтін түрін тақырып пен бірінші жолдан анықтаңыз — бұл қандай ақпарат күтуге болатынын айтады.",
      },
    },
  },
};

const a2ReviewQ2: QuestionSpec = {
  id: "a2-restaurant-review-1-q2",
  passageId: "a2-restaurant-review-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "environ vingt-cinq euros par personne sans les boissons",
  content: {
    en: {
      prompt: "How much does a meal cost per person, without drinks?",
      options: [
        { id: "opt-a", text: "15 euros" },
        { id: "opt-b", text: "20 euros" },
        { id: "opt-c", text: "25 euros" },
        { id: "opt-d", text: "30 euros" },
      ],
      hint: "The price appears written out in words, not digits — read the sentence about cost carefully.",
      explanation: {
        whereInText: "\"Les prix restent raisonnables... environ vingt-cinq euros par personne sans les boissons.\"",
        keywords: "vingt-cinq euros",
        whyCorrect: "\"Vingt-cinq euros\" is French for \"twenty-five euros\", stated as the per-person price excluding drinks.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "15 euros is never mentioned; it's a lower, invented distractor." },
          { optionId: "opt-b", reason: "20 euros doesn't appear in the text." },
          { optionId: "opt-d", reason: "30 euros is not stated anywhere — it's a higher, invented distractor close to the real number." },
        ],
        vocabulary: [{ term: "vingt-cinq", translation: "twenty-five" }],
        grammarPattern: "Numbers are sometimes spelled out in French prose (\"vingt-cinq\") rather than written as digits — recognizing number words is essential at this level.",
        strategy: "When prices or quantities are spelled out as words rather than digits, read that sentence slowly and convert it to a number in your head before answering.",
      },
    },
    ru: {
      prompt: "Сколько стоит ужин на человека, без напитков?",
      options: [
        { id: "opt-a", text: "15 евро" },
        { id: "opt-b", text: "20 евро" },
        { id: "opt-c", text: "25 евро" },
        { id: "opt-d", text: "30 евро" },
      ],
      hint: "Цена написана словами, а не цифрами — внимательно прочитайте предложение о стоимости.",
      explanation: {
        whereInText: "«Les prix restent raisonnables... environ vingt-cinq euros par personne sans les boissons.»",
        keywords: "vingt-cinq euros",
        whyCorrect: "«Vingt-cinq euros» по-французски значит «двадцать пять евро» — указано как цена на человека без напитков.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "15 евро нигде не упоминается; это заниженный, выдуманный вариант." },
          { optionId: "opt-b", reason: "20 евро в тексте не встречается." },
          { optionId: "opt-d", reason: "30 евро нигде не указано — это завышенный, выдуманный вариант, близкий к реальному числу." },
        ],
        vocabulary: [{ term: "vingt-cinq", translation: "двадцать пять" }],
        grammarPattern: "Числа во французском прозаическом тексте иногда пишутся словами («vingt-cinq»), а не цифрами — распознавание числительных важно на этом уровне.",
        strategy: "Когда цены или количества написаны словами, а не цифрами, читайте это предложение медленно и мысленно переводите его в число перед ответом.",
      },
    },
    kz: {
      prompt: "Бір адамға тамақ ішу қанша тұрады, сусынсыз?",
      options: [
        { id: "opt-a", text: "15 евро" },
        { id: "opt-b", text: "20 евро" },
        { id: "opt-c", text: "25 евро" },
        { id: "opt-d", text: "30 евро" },
      ],
      hint: "Баға цифрмен емес, сөзбен жазылған — құны туралы сөйлемді мұқият оқыңыз.",
      explanation: {
        whereInText: "«Les prix restent raisonnables... environ vingt-cinq euros par personne sans les boissons.»",
        keywords: "vingt-cinq euros",
        whyCorrect: "«Vingt-cinq euros» француз тілінде «жиырма бес евро» дегенді білдіреді — сусынсыз бір адамға баға ретінде көрсетілген.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "15 евро мәтінде мүлде айтылмайды; бұл төмендетілген, ойдан шығарылған нұсқа." },
          { optionId: "opt-b", reason: "20 евро мәтінде кездеспейді." },
          { optionId: "opt-d", reason: "30 евро ешбір жерде көрсетілмеген — бұл нақты санға жақын, жоғарылатылған ойдан шығарылған нұсқа." },
        ],
        vocabulary: [{ term: "vingt-cinq", translation: "жиырма бес" }],
        grammarPattern: "Француз тіліндегі мәтінде сандар кейде цифрмен емес, сөзбен жазылады («vingt-cinq») — бұл деңгейде сан сөздерін тану маңызды.",
        strategy: "Баға немесе саны цифрмен емес, сөзбен жазылғанда, сол сөйлемді жай ғана оқып, жауап бермес бұрын оны ойша санға айналдырыңыз.",
      },
    },
  },
};

const a2ReviewQ3: QuestionSpec = {
  id: "a2-restaurant-review-1-q3",
  passageId: "a2-restaurant-review-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "hard",
  skillTag: "inference",
  evidenceQuote: "la salle est bruyante quand il y a du monde... mais peut-être pas pour un repas romantique et tranquille",
  content: {
    en: {
      prompt: "According to the review, which of the following are real reasons this restaurant might NOT suit a quiet romantic dinner? (Select all that apply)",
      options: [
        { id: "opt-a", text: "The dining room gets noisy when busy" },
        { id: "opt-b", text: "The food is not tasty" },
        { id: "opt-c", text: "The writer directly says it's not ideal for a romantic meal" },
        { id: "opt-d", text: "The restaurant is too expensive" },
      ],
      hint: "Look at the last two sentences of the review together — one gives a reason, the other states a conclusion.",
      explanation: {
        whereInText: "\"Seul petit bémol : la salle est bruyante quand il y a du monde. Je recommande cet endroit pour un dîner entre amis, mais peut-être pas pour un repas romantique et tranquille.\"",
        keywords: "bruyante, pas pour un repas romantique et tranquille",
        whyCorrect: "The review explicitly names noise (\"bruyante\") as the one flaw, and directly concludes it may not suit a \"repas romantique et tranquille\" — both are stated, not implied.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The food is praised (\"délicieux et bien présenté\") except for one dish being slightly too salty — it's never called untasty overall." },
          { optionId: "opt-d", reason: "The review calls the prices \"raisonnables\" (reasonable) for the quality — cost is never given as a reason to avoid the place." },
        ],
        vocabulary: [
          { term: "bruyante", translation: "noisy" },
          { term: "bémol", translation: "downside / flaw" },
        ],
        grammarPattern: "\"Seul petit bémol\" (\"only small downside\") introduces the single criticism in an otherwise positive review — a common structure for balanced opinion writing.",
        strategy: "For \"select all that apply\" questions, check each option against the text one at a time instead of picking based on overall impression — some options will be true, some plausible-but-unstated.",
      },
    },
    ru: {
      prompt: "Согласно отзыву, какие из следующих причин реально указаны как то, почему ресторан может НЕ подойти для тихого романтического ужина? (Выберите все подходящие варианты)",
      options: [
        { id: "opt-a", text: "Зал становится шумным, когда много посетителей" },
        { id: "opt-b", text: "Еда невкусная" },
        { id: "opt-c", text: "Автор прямо говорит, что это не идеально для романтического ужина" },
        { id: "opt-d", text: "Ресторан слишком дорогой" },
      ],
      hint: "Посмотрите на последние два предложения отзыва вместе — одно даёт причину, другое — вывод.",
      explanation: {
        whereInText: "«Seul petit bémol : la salle est bruyante quand il y a du monde. Je recommande cet endroit pour un dîner entre amis, mais peut-être pas pour un repas romantique et tranquille.»",
        keywords: "bruyante, pas pour un repas romantique et tranquille",
        whyCorrect: "В отзыве прямо назван шум («bruyante») как единственный недостаток, и прямо сделан вывод, что место может не подойти для «repas romantique et tranquille» — оба факта названы явно, а не подразумеваются.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Еда хвалится («délicieux et bien présenté»), за исключением одного блюда, которое было слегка пересолено — в целом она нигде не названа невкусной." },
          { optionId: "opt-d", reason: "В отзыве цены названы «raisonnables» (разумными) за качество — стоимость нигде не указана как причина избегать этого места." },
        ],
        vocabulary: [
          { term: "bruyante", translation: "шумная" },
          { term: "bémol", translation: "недостаток / минус" },
        ],
        grammarPattern: "«Seul petit bémol» («единственный маленький минус») вводит единственную критику в целом положительном отзыве — обычная структура для сбалансированного мнения.",
        strategy: "Для вопросов «выберите все подходящие» проверяйте каждый вариант по тексту по отдельности, а не полагаясь на общее впечатление — некоторые варианты будут верными, некоторые — правдоподобными, но не указанными в тексте.",
      },
    },
    kz: {
      prompt: "Пікірге сәйкес, мейрамхана тыныш романтикалық кешкі асқа СӘЙКЕС КЕЛМЕУІ мүмкін екенінің нақты себептері қайсылар? (Барлық сәйкес нұсқаларды таңдаңыз)",
      options: [
        { id: "opt-a", text: "Адам көп болғанда зал шулы болады" },
        { id: "opt-b", text: "Тағам дәмсіз" },
        { id: "opt-c", text: "Автор оны романтикалық ас үшін идеалды емес деп тікелей айтады" },
        { id: "opt-d", text: "Мейрамхана тым қымбат" },
      ],
      hint: "Пікірдің соңғы екі сөйлемін бірге қараңыз — біреуі себеп береді, екіншісі қорытынды жасайды.",
      explanation: {
        whereInText: "«Seul petit bémol : la salle est bruyante quand il y a du monde. Je recommande cet endroit pour un dîner entre amis, mais peut-être pas pour un repas romantique et tranquille.»",
        keywords: "bruyante, pas pour un repas romantique et tranquille",
        whyCorrect: "Пікірде шу («bruyante») жалғыз кемшілік ретінде тікелей аталған, және орын «repas romantique et tranquille» үшін сәйкес келмеуі мүмкін деген қорытынды тікелей жасалған — екеуі де меңзелмей, тікелей айтылған.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Тағам мақталады («délicieux et bien présenté»), тек бір тағам сәл тым тұзды болғанын қоспағанда — жалпы алғанда ол ешбір жерде дәмсіз деп аталмайды." },
          { optionId: "opt-d", reason: "Пікірде бағалар сапасына сай «raisonnables» (орынды) деп аталады — құн ешбір жерде орыннан аулақ болу себебі ретінде көрсетілмейді." },
        ],
        vocabulary: [
          { term: "bruyante", translation: "шулы" },
          { term: "bémol", translation: "кемшілік" },
        ],
        grammarPattern: "«Seul petit bémol» («жалғыз кішкентай кемшілік») жалпы оң пікірде жалғыз сынды енгізеді — теңгерімді пікір жазуға тән құрылым.",
        strategy: "«Барлық сәйкес нұсқаларды таңдаңыз» сұрақтарында әр нұсқаны жалпы әсерге сүйенбей, мәтінмен жеке-жеке тексеріңіз — кейбір нұсқалар дұрыс, кейбіреулері сенімді көрінгенімен мәтінде айтылмаған болады.",
      },
    },
  },
};

const A2_RESTAURANT_VOCAB: VocabularySpec[] = [
  {
    term: "accueil",
    translation: { en: "welcome / reception", ru: "приём / встреча", kz: "қарсы алу" },
    definition: {
      en: "The way visitors are greeted somewhere.",
      ru: "То, как встречают посетителей в каком-либо месте.",
      kz: "Қонақтарды бір жерде қарсы алу тәсілі.",
    },
    exampleSentence: "L'accueil était chaleureux et le service rapide.",
  },
  {
    term: "chaleureux",
    translation: { en: "warm / friendly", ru: "тёплый / радушный", kz: "жылы шырайлы" },
    definition: {
      en: "Friendly and welcoming in manner.",
      ru: "Дружелюбный и радушный по манере.",
      kz: "Мінез-құлқы жылы және қонақжай.",
    },
    exampleSentence: "L'accueil était chaleureux et le service rapide.",
  },
  {
    term: "bruyante",
    translation: { en: "noisy", ru: "шумная", kz: "шулы" },
    definition: {
      en: "Full of loud sound.",
      ru: "Полная громких звуков.",
      kz: "Қатты дыбысқа толы.",
    },
    exampleSentence: "La salle est bruyante quand il y a du monde.",
  },
  {
    term: "bémol",
    translation: { en: "downside / minor flaw", ru: "недостаток / минус", kz: "кемшілік" },
    definition: {
      en: "A small negative point within an otherwise positive assessment.",
      ru: "Небольшой отрицательный момент в целом положительной оценке.",
      kz: "Жалпы оң бағада кездесетін кішкентай теріс сәт.",
    },
    exampleSentence: "Seul petit bémol : la salle est bruyante.",
  },
];

export const A2_PASSAGES: ReadingPassage[] = [A2_NICE_BLOG, A2_RESTAURANT_REVIEW];

export const A2_QUESTIONS_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingQuestion[]>> = {
  "a2-nice-blog-1": buildPassageQuestions(a2NiceQ1, a2NiceQ2, a2NiceQ3),
  "a2-restaurant-review-1": buildPassageQuestions(a2ReviewQ1, a2ReviewQ2, a2ReviewQ3),
};

export const A2_VOCABULARY_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingVocabularyItem[]>> = {
  "a2-nice-blog-1": buildVocabulary(A2_NICE_VOCAB),
  "a2-restaurant-review-1": buildVocabulary(A2_RESTAURANT_VOCAB),
};

// ---------------------------------------------------------------------------
// B1 — Seuil: information extraction & content analysis, ~200-260 words.
// ---------------------------------------------------------------------------

const B1_ENTREPRENEUR_INTERVIEW: ReadingPassage = {
  id: "b1-entrepreneur-interview-1",
  textType: "Interview",
  title: "Interview with a young entrepreneur",
  body: "Interview : Élise Fontaine, fondatrice d'une entreprise de vêtements recyclés\n\nJournaliste : Élise, pouvez-vous nous parler de votre parcours ?\n\nÉlise Fontaine : Bien sûr. J'ai étudié le design de mode, mais j'étais frustrée par le gaspillage dans cette industrie. Après mes études, j'ai travaillé trois ans pour une grande marque, avant de démissionner pour créer ma propre entreprise. Aujourd'hui, nous collectons des vêtements usagés, nous les transformons et nous les revendons à prix abordable.\n\nJournaliste : Quelles ont été les principales difficultés ?\n\nÉlise Fontaine : Au début, trouver des financements a été très compliqué, car les investisseurs n'avaient pas confiance dans un modèle si différent. Cependant, grâce à une campagne de financement participatif réussie, nous avons pu lancer notre premier atelier. Depuis, la demande ne cesse d'augmenter, notamment chez les jeunes consommateurs sensibles à l'écologie.\n\nJournaliste : Quels sont vos projets pour l'avenir ?\n\nÉlise Fontaine : Nous voulons ouvrir deux nouvelles boutiques l'année prochaine et lancer un programme de formation pour apprendre aux gens à réparer eux-mêmes leurs vêtements. Je pense que la mode durable n'est plus une simple tendance, mais un véritable changement de mentalité chez les consommateurs.",
  estimatedWordCount: 230,
};

const b1InterviewQ1: QuestionSpec = {
  id: "b1-entrepreneur-interview-1-q1",
  passageId: "b1-entrepreneur-interview-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "Élise Fontaine, fondatrice d'une entreprise de vêtements recyclés",
  content: {
    en: {
      prompt: "What is the main subject of this interview?",
      options: [
        { id: "opt-a", text: "An entrepreneur who founded a recycled-clothing company" },
        { id: "opt-b", text: "A journalist who writes about fashion week" },
        { id: "opt-c", text: "A designer who creates luxury clothes" },
        { id: "opt-d", text: "A teacher who trains fashion students" },
      ],
      hint: "The subtitle under \"Interview\" names exactly who Élise is and what she founded.",
      explanation: {
        whereInText: "The subtitle: \"Élise Fontaine, fondatrice d'une entreprise de vêtements recyclés.\"",
        keywords: "fondatrice, vêtements recyclés",
        whyCorrect: "\"Fondatrice\" (founder) of a \"entreprise de vêtements recyclés\" (recycled-clothing company) is stated directly as who Élise is.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Élise is the one being interviewed, not the journalist writing the piece." },
          { optionId: "opt-c", reason: "Her clothing is recycled/affordable, explicitly the opposite of a luxury brand." },
          { optionId: "opt-d", reason: "She mentions a future training program, but she is not currently a teacher — her main role is founder/entrepreneur." },
        ],
        vocabulary: [{ term: "fondatrice", translation: "founder (female)" }],
        grammarPattern: "The subtitle uses an appositive (\"Élise Fontaine, fondatrice de...\") to define a person by their role — a common way French texts introduce someone.",
        strategy: "In interviews, the subtitle or introduction line almost always identifies who the interviewee is and why they're being interviewed — read it before the Q&A.",
      },
    },
    ru: {
      prompt: "Какова главная тема этого интервью?",
      options: [
        { id: "opt-a", text: "Предпринимательница, основавшая компанию по переработке одежды" },
        { id: "opt-b", text: "Журналист, пишущий о неделе моды" },
        { id: "opt-c", text: "Дизайнер, создающий люксовую одежду" },
        { id: "opt-d", text: "Преподаватель, обучающий студентов моды" },
      ],
      hint: "Подзаголовок под словом «Interview» прямо называет, кто такая Элиз и что она основала.",
      explanation: {
        whereInText: "Подзаголовок: «Élise Fontaine, fondatrice d'une entreprise de vêtements recyclés.»",
        keywords: "fondatrice, vêtements recyclés",
        whyCorrect: "«Fondatrice» (основательница) компании «entreprise de vêtements recyclés» (по переработке одежды) прямо названа как то, кем является Элиз.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Элиз — та, у кого берут интервью, а не журналист, пишущий материал." },
          { optionId: "opt-c", reason: "Её одежда переработанная/доступная по цене, что прямо противоположно люксовому бренду." },
          { optionId: "opt-d", reason: "Она упоминает будущую программу обучения, но сейчас она не преподаватель — её основная роль — основательница/предприниматель." },
        ],
        vocabulary: [{ term: "fondatrice", translation: "основательница" }],
        grammarPattern: "В подзаголовке используется приложение («Élise Fontaine, fondatrice de...») для определения человека через его роль — распространённый способ представления во французских текстах.",
        strategy: "В интервью подзаголовок или вступительная строка почти всегда указывает, кто такой интервьюируемый и почему у него берут интервью — читайте это перед вопросами и ответами.",
      },
    },
    kz: {
      prompt: "Бұл сұхбаттың негізгі тақырыбы қандай?",
      options: [
        { id: "opt-a", text: "Қайта өңделген киім компаниясын құрған кәсіпкер" },
        { id: "opt-b", text: "Сән аптасы туралы жазатын журналист" },
        { id: "opt-c", text: "Люкс киім жасайтын дизайнер" },
        { id: "opt-d", text: "Сән студенттерін оқытатын мұғалім" },
      ],
      hint: "«Interview» сөзінің астындағы тақырыпша Элиздің кім екенін және не құрғанын тікелей атайды.",
      explanation: {
        whereInText: "Тақырыпша: «Élise Fontaine, fondatrice d'une entreprise de vêtements recyclés.»",
        keywords: "fondatrice, vêtements recyclés",
        whyCorrect: "«Entreprise de vêtements recyclés» (қайта өңделген киім компаниясы) «fondatrice»і (негізін қалаушы) ретінде Элиздің кім екені тікелей айтылған.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Элиз — сұхбат алынып жатқан адам, материал жазатын журналист емес." },
          { optionId: "opt-c", reason: "Оның киімі қайта өңделген/қолжетімді, бұл люкс бренд ұғымына тікелей қарама-қарсы." },
          { optionId: "opt-d", reason: "Ол болашақ оқыту бағдарламасын атайды, бірақ қазір мұғалім емес — оның негізгі рөлі — негізін қалаушы/кәсіпкер." },
        ],
        vocabulary: [{ term: "fondatrice", translation: "негізін қалаушы (әйел)" }],
        grammarPattern: "Тақырыпшада адамды рөлі арқылы анықтау үшін апозиция («Élise Fontaine, fondatrice de...») қолданылған — бұл француз мәтіндерінде адамды таныстырудың кең тараған тәсілі.",
        strategy: "Сұхбаттарда тақырыпша немесе кіріспе жол әдетте сұхбат берушінің кім екенін және неге сұхбат алынып жатқанын көрсетеді — сұрақ-жауапты оқымас бұрын соны оқыңыз.",
      },
    },
  },
};

const b1InterviewQ2: QuestionSpec = {
  id: "b1-entrepreneur-interview-1-q2",
  passageId: "b1-entrepreneur-interview-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "grâce à une campagne de financement participatif réussie, nous avons pu lancer notre premier atelier",
  content: {
    en: {
      prompt: "Élise's company launched its first workshop thanks to a successful crowdfunding campaign.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      hint: "Look in her answer about the main difficulties she faced.",
      explanation: {
        whereInText: "\"Cependant, grâce à une campagne de financement participatif réussie, nous avons pu lancer notre premier atelier.\"",
        keywords: "campagne de financement participatif",
        whyCorrect: "\"Financement participatif\" is French for crowdfunding, and the text says it directly enabled launching the first workshop (\"grâce à\" = thanks to).",
        whyIncorrect: [{ optionId: "opt-false", reason: "The sentence explicitly credits crowdfunding (\"grâce à une campagne de financement participatif réussie\") as the reason they could launch — this is stated fact, not a misreading." }],
        vocabulary: [{ term: "financement participatif", translation: "crowdfunding" }],
        grammarPattern: "\"Grâce à\" (thanks to) introduces a positive cause — different from \"à cause de\", which introduces a negative one.",
        strategy: "When a true/false statement names a specific method or cause, search the text for that exact term (here, a form of \"financement\") rather than the general topic.",
      },
    },
    ru: {
      prompt: "Компания Элиз запустила свою первую мастерскую благодаря успешной краудфандинговой кампании.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      hint: "Посмотрите в её ответе о главных трудностях, с которыми она столкнулась.",
      explanation: {
        whereInText: "«Cependant, grâce à une campagne de financement participatif réussie, nous avons pu lancer notre premier atelier.»",
        keywords: "campagne de financement participatif",
        whyCorrect: "«Financement participatif» по-французски значит краудфандинг, и в тексте прямо сказано, что именно он позволил запустить первую мастерскую («grâce à» = благодаря).",
        whyIncorrect: [{ optionId: "opt-false", reason: "Предложение прямо называет краудфандинг («grâce à une campagne de financement participatif réussie») причиной запуска — это явно указанный факт, а не неверное толкование." }],
        vocabulary: [{ term: "financement participatif", translation: "краудфандинг" }],
        grammarPattern: "«Grâce à» (благодаря) вводит положительную причину — в отличие от «à cause de», которое вводит отрицательную.",
        strategy: "Когда утверждение «верно/неверно» называет конкретный способ или причину, ищите в тексте именно этот термин (здесь — форму слова «financement»), а не общую тему.",
      },
    },
    kz: {
      prompt: "Элиздің компаниясы алғашқы шеберханасын сәтті краудфандинг науқанының арқасында ашты.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Дұрыс емес" },
      ],
      hint: "Оның кездескен басты қиындықтар туралы жауабына қараңыз.",
      explanation: {
        whereInText: "«Cependant, grâce à une campagne de financement participatif réussie, nous avons pu lancer notre premier atelier.»",
        keywords: "campagne de financement participatif",
        whyCorrect: "«Financement participatif» француз тілінде краудфандингті білдіреді, мәтінде ол алғашқы шеберхананы ашуға тікелей мүмкіндік бергені айтылған («grâce à» = арқасында).",
        whyIncorrect: [{ optionId: "opt-false", reason: "Сөйлемде краудфандинг («grâce à une campagne de financement participatif réussie») ашу себебі ретінде тікелей аталған — бұл қате түсіндіру емес, тікелей айтылған факт." }],
        vocabulary: [{ term: "financement participatif", translation: "краудфандинг" }],
        grammarPattern: "«Grâce à» (арқасында) оң себепті білдіреді — теріс себепті білдіретін «à cause de»-ден өзгеше.",
        strategy: "Дұрыс/дұрыс емес тұжырымы нақты әдіс немесе себепті атаса, мәтіннен жалпы тақырыпты емес, дәл сол терминді (мұнда — «financement» сөзінің түрін) іздеңіз.",
      },
    },
  },
};

const b1InterviewQ3: QuestionSpec = {
  id: "b1-entrepreneur-interview-1-q3",
  passageId: "b1-entrepreneur-interview-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "inference",
  evidenceQuote: "la demande ne cesse d'augmenter, notamment chez les jeunes consommateurs sensibles à l'écologie",
  content: {
    en: {
      prompt: "What can be inferred about who mainly buys from Élise's company?",
      options: [
        { id: "opt-a", text: "Mostly young, environmentally-conscious consumers" },
        { id: "opt-b", text: "Mostly luxury fashion collectors" },
        { id: "opt-c", text: "Mostly elderly customers" },
        { id: "opt-d", text: "Mostly large clothing retailers" },
      ],
      hint: "Look at the answer about difficulties for a clue about who is driving demand now.",
      explanation: {
        whereInText: "\"Depuis, la demande ne cesse d'augmenter, notamment chez les jeunes consommateurs sensibles à l'écologie.\"",
        keywords: "jeunes consommateurs sensibles à l'écologie",
        whyCorrect: "\"Notamment\" (\"in particular\") points directly at \"jeunes consommateurs sensibles à l'écologie\" (young, eco-conscious consumers) as the group driving rising demand.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The company sells affordable, recycled clothing — the opposite of luxury collecting." },
          { optionId: "opt-c", reason: "The text specifically names young consumers, not elderly ones, as the growing customer group." },
          { optionId: "opt-d", reason: "There's no mention of selling to other retailers — the interview describes selling to individual consumers." },
        ],
        vocabulary: [{ term: "notamment", translation: "in particular / notably" }],
        grammarPattern: "\"Notamment\" singles out a specific example within a larger group — here, it narrows \"la demande\" (demand in general) down to one specific customer segment.",
        strategy: "For inference questions, look for a word like \"notamment\" or \"en particulier\" that narrows a general statement to a specific detail — that detail is usually exactly what's being tested.",
      },
    },
    ru: {
      prompt: "Что можно предположить о том, кто в основном покупает продукцию компании Элиз?",
      options: [
        { id: "opt-a", text: "В основном молодые потребители, заботящиеся об экологии" },
        { id: "opt-b", text: "В основном коллекционеры люксовой моды" },
        { id: "opt-c", text: "В основном пожилые покупатели" },
        { id: "opt-d", text: "В основном крупные ритейлеры одежды" },
      ],
      hint: "Посмотрите на ответ о трудностях — там есть подсказка о том, кто сейчас формирует спрос.",
      explanation: {
        whereInText: "«Depuis, la demande ne cesse d'augmenter, notamment chez les jeunes consommateurs sensibles à l'écologie.»",
        keywords: "jeunes consommateurs sensibles à l'écologie",
        whyCorrect: "«Notamment» («в частности») прямо указывает на «jeunes consommateurs sensibles à l'écologie» (молодых, экологически сознательных потребителей) как на группу, формирующую растущий спрос.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Компания продаёт доступную переработанную одежду — это противоположность люксовому коллекционированию." },
          { optionId: "opt-c", reason: "В тексте конкретно названы молодые потребители, а не пожилые, как растущая группа клиентов." },
          { optionId: "opt-d", reason: "О продаже другим ритейлерам ничего не сказано — в интервью описывается продажа индивидуальным потребителям." },
        ],
        vocabulary: [{ term: "notamment", translation: "в частности" }],
        grammarPattern: "«Notamment» выделяет конкретный пример внутри более широкой группы — здесь оно сужает «la demande» (спрос в целом) до одного конкретного сегмента клиентов.",
        strategy: "Для вопросов на выводы ищите слово вроде «notamment» или «en particulier», которое сужает общее утверждение до конкретной детали — эта деталь обычно и является тем, что проверяется.",
      },
    },
    kz: {
      prompt: "Элиздің компаниясынан негізінен кімдер сатып алатыны туралы қандай қорытынды жасауға болады?",
      options: [
        { id: "opt-a", text: "Негізінен экологияға немқұрайлы қарамайтын жас тұтынушылар" },
        { id: "opt-b", text: "Негізінен люкс сән коллекционерлері" },
        { id: "opt-c", text: "Негізінен егде жастағы тұтынушылар" },
        { id: "opt-d", text: "Негізінен ірі киім сатушылары" },
      ],
      hint: "Қиындықтар туралы жауапқа қараңыз — қазір сұранысты кім арттырып жатқаны туралы белгі бар.",
      explanation: {
        whereInText: "«Depuis, la demande ne cesse d'augmenter, notamment chez les jeunes consommateurs sensibles à l'écologie.»",
        keywords: "jeunes consommateurs sensibles à l'écologie",
        whyCorrect: "«Notamment» («атап айтқанда») сұранысты арттырып жатқан топ ретінде «jeunes consommateurs sensibles à l'écologie» (экологияға немқұрайлы қарамайтын жас тұтынушылар) тікелей көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Компания қолжетімді, қайта өңделген киім сатады — бұл люкс коллекциялауға қарама-қарсы." },
          { optionId: "opt-c", reason: "Мәтінде өсіп келе жатқан тұтынушы тобы ретінде егде жастағылар емес, нақты жастар аталған." },
          { optionId: "opt-d", reason: "Басқа сатушыларға сату туралы айтылмайды — сұхбатта жеке тұтынушыларға сату сипатталған." },
        ],
        vocabulary: [{ term: "notamment", translation: "атап айтқанда" }],
        grammarPattern: "«Notamment» үлкен топтың ішінен нақты мысалды бөліп көрсетеді — мұнда ол «la demande» (жалпы сұраныс) дегенді бір нақты тұтынушы сегментіне дейін тарылтады.",
        strategy: "Қорытынды сұрақтары үшін жалпы тұжырымды нақты детальге дейін тарылтатын «notamment» немесе «en particulier» сияқты сөзді іздеңіз — сол деталь әдетте тексерілетін нәрсенің өзі болады.",
      },
    },
  },
};

const B1_ENTREPRENEUR_VOCAB: VocabularySpec[] = [
  {
    term: "gaspillage",
    translation: { en: "waste", ru: "расточительство / отходы", kz: "ысырап" },
    definition: {
      en: "The wasteful use of resources.",
      ru: "Расточительное использование ресурсов.",
      kz: "Ресурстарды ысыраппен пайдалану.",
    },
    exampleSentence: "J'étais frustrée par le gaspillage dans cette industrie.",
  },
  {
    term: "démissionner",
    translation: { en: "to resign", ru: "уволиться (по собственному желанию)", kz: "жұмыстан кету" },
    definition: {
      en: "To formally leave a job by one's own choice.",
      ru: "Официально покинуть работу по собственному желанию.",
      kz: "Өз еркімен жұмыстан ресми түрде кету.",
    },
    exampleSentence: "J'ai travaillé trois ans... avant de démissionner pour créer ma propre entreprise.",
  },
  {
    term: "financement participatif",
    translation: { en: "crowdfunding", ru: "краудфандинг", kz: "краудфандинг" },
    definition: {
      en: "Raising small amounts of money from many people, often online.",
      ru: "Сбор небольших сумм денег от многих людей, часто онлайн.",
      kz: "Көбіне онлайн арқылы көптеген адамдардан аз-аздап қаражат жинау.",
    },
    exampleSentence: "Grâce à une campagne de financement participatif réussie, nous avons pu lancer notre premier atelier.",
  },
  {
    term: "durable",
    translation: { en: "sustainable", ru: "устойчивый (об экологии)", kz: "тұрақты (экологиялық)" },
    definition: {
      en: "Designed not to harm the environment long-term.",
      ru: "Не наносящий вреда окружающей среде в долгосрочной перспективе.",
      kz: "Ұзақ мерзімде қоршаған ортаға зиян келтірмейтін.",
    },
    exampleSentence: "La mode durable n'est plus une simple tendance.",
  },
];

const B1_RECYCLING_ARTICLE: ReadingPassage = {
  id: "b1-recycling-article-1",
  textType: "Newspaper article",
  title: "A pioneering city in recycling",
  body: "Une ville pionnière dans le recyclage\n\nDepuis deux ans, la municipalité de Vertville a mis en place un système de tri sélectif obligatoire pour tous les habitants. Chaque foyer reçoit trois poubelles de couleurs différentes : verte pour le verre, jaune pour le plastique et le papier, et grise pour les déchets non recyclables. Les habitants qui ne respectent pas ce tri reçoivent d'abord un avertissement, puis une amende en cas de récidive.\n\nSelon le maire, cette politique stricte a permis de réduire les déchets envoyés en décharge de quarante pour cent en seulement deux ans. Toutefois, certains habitants se plaignent de la complexité du système et du temps supplémentaire nécessaire pour trier correctement leurs déchets. Malgré ces critiques, de nombreuses autres municipalités s'intéressent désormais au modèle de Vertville et envisagent de l'adopter à leur tour.\n\nLa mairie prévoit par ailleurs de construire un centre de compostage collectif d'ici la fin de l'année, afin de traiter également les déchets organiques.",
  estimatedWordCount: 200,
};

const b1RecyclingQ1: QuestionSpec = {
  id: "b1-recycling-article-1-q1",
  passageId: "b1-recycling-article-1",
  questionNumber: 1,
  type: "heading-matching",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  evidenceQuote: "la municipalité de Vertville a mis en place un système de tri sélectif obligatoire pour tous les habitants",
  content: {
    en: {
      prompt: "Which heading best fits this article?",
      options: [
        { id: "opt-a", text: "A city's mandatory recycling program" },
        { id: "opt-b", text: "A new traffic law" },
        { id: "opt-c", text: "A festival celebrating the environment" },
        { id: "opt-d", text: "A company that produces plastic" },
      ],
      hint: "The title and first sentence together describe a city-wide policy about sorting waste.",
      explanation: {
        whereInText: "\"Une ville pionnière dans le recyclage\" and \"la municipalité de Vertville a mis en place un système de tri sélectif obligatoire.\"",
        keywords: "tri sélectif obligatoire, recyclage",
        whyCorrect: "The whole article is structured around Vertville's mandatory waste-sorting system and its results — a recycling program, not any of the distractors.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Nothing about roads, traffic, or driving rules appears anywhere in the text." },
          { optionId: "opt-c", reason: "There's no festival, event, or celebration described — this is a policy report." },
          { optionId: "opt-d", reason: "The article is about a municipality's policy, not a private company's product." },
        ],
        vocabulary: [{ term: "tri sélectif", translation: "selective sorting (of waste)" }],
        grammarPattern: "\"Mettre en place\" (to set up/implement) is a common expression for describing a new policy being introduced.",
        strategy: "For heading questions, check that your choice matches the WHOLE article, not just one paragraph — a good heading covers everything that follows it.",
      },
    },
    ru: {
      prompt: "Какой заголовок лучше всего подходит к этой статье?",
      options: [
        { id: "opt-a", text: "Обязательная программа переработки отходов в городе" },
        { id: "opt-b", text: "Новый закон о дорожном движении" },
        { id: "opt-c", text: "Фестиваль в честь окружающей среды" },
        { id: "opt-d", text: "Компания, производящая пластик" },
      ],
      hint: "Заголовок и первое предложение вместе описывают общегородскую политику сортировки отходов.",
      explanation: {
        whereInText: "«Une ville pionnière dans le recyclage» и «la municipalité de Vertville a mis en place un système de tri sélectif obligatoire.»",
        keywords: "tri sélectif obligatoire, recyclage",
        whyCorrect: "Вся статья построена вокруг обязательной системы сортировки отходов в Вертвиле и её результатов — это программа переработки, а не что-либо из отвлекающих вариантов.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "О дорогах, движении или правилах вождения нигде в тексте не говорится." },
          { optionId: "opt-c", reason: "Никакой фестиваль, мероприятие или праздник не описаны — это отчёт о политике." },
          { optionId: "opt-d", reason: "Статья о политике муниципалитета, а не о продукции частной компании." },
        ],
        vocabulary: [{ term: "tri sélectif", translation: "раздельный сбор (отходов)" }],
        grammarPattern: "«Mettre en place» (внедрить/установить) — распространённое выражение для описания введения новой политики.",
        strategy: "Для вопросов о заголовке проверяйте, что ваш выбор соответствует ВСЕЙ статье, а не только одному абзацу — хороший заголовок охватывает всё, что следует за ним.",
      },
    },
    kz: {
      prompt: "Бұл мақалаға қандай тақырып ең жақсы сәйкес келеді?",
      options: [
        { id: "opt-a", text: "Қаланың міндетті қайта өңдеу бағдарламасы" },
        { id: "opt-b", text: "Жол қозғалысы туралы жаңа заң" },
        { id: "opt-c", text: "Қоршаған ортаны атап өтетін фестиваль" },
        { id: "opt-d", text: "Пластик өндіретін компания" },
      ],
      hint: "Тақырып пен бірінші сөйлем бірге қала бойынша қалдықты сұрыптау саясатын сипаттайды.",
      explanation: {
        whereInText: "«Une ville pionnière dans le recyclage» және «la municipalité de Vertville a mis en place un système de tri sélectif obligatoire.»",
        keywords: "tri sélectif obligatoire, recyclage",
        whyCorrect: "Бүкіл мақала Вертвильдің міндетті қалдық сұрыптау жүйесі мен оның нәтижелері төңірегінде құрылған — бұл қайта өңдеу бағдарламасы, басқа нұсқалардың бірі емес.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Жолдар, қозғалыс немесе жүргізу ережелері туралы мәтінде мүлде айтылмайды." },
          { optionId: "opt-c", reason: "Ешбір фестиваль, іс-шара немесе мереке сипатталмаған — бұл саясат туралы есеп." },
          { optionId: "opt-d", reason: "Мақала муниципалитеттің саясаты туралы, жеке компанияның өнімі туралы емес." },
        ],
        vocabulary: [{ term: "tri sélectif", translation: "қалдықты сұрыптап бөлу" }],
        grammarPattern: "«Mettre en place» (енгізу/орнату) жаңа саясатты енгізуді сипаттауда жиі қолданылатын өрнек.",
        strategy: "Тақырып сұрақтары үшін таңдауыңыздың бір абзацқа ғана емес, БҮКІЛ мақалаға сәйкес келетінін тексеріңіз — жақсы тақырып одан кейінгінің бәрін қамтиды.",
      },
    },
  },
};

const b1RecyclingQ2: QuestionSpec = {
  id: "b1-recycling-article-1-q2",
  passageId: "b1-recycling-article-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "reçoivent d'abord un avertissement, puis une amende en cas de récidive",
  content: {
    en: {
      prompt: "Residents who sort their waste incorrectly are fined immediately, with no warning first.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      hint: "Look for the sequence of two consequences, not just one.",
      explanation: {
        whereInText: "\"Les habitants qui ne respectent pas ce tri reçoivent d'abord un avertissement, puis une amende en cas de récidive.\"",
        keywords: "d'abord un avertissement, puis une amende",
        whyCorrect: "\"D'abord... puis...\" (\"first... then...\") shows a warning comes first, and a fine only follows a repeat offense — not an immediate fine.",
        whyIncorrect: [{ optionId: "opt-true", reason: "This ignores the sequence word \"d'abord\" (first): a warning always comes before any fine, which only applies to repeat offenders (\"récidive\")." }],
        vocabulary: [{ term: "avertissement", translation: "warning" }],
        grammarPattern: "\"D'abord... puis...\" explicitly orders two steps in time — always check for this pattern before assuming something happens immediately.",
        strategy: "Watch for sequencing words (\"d'abord\", \"ensuite\", \"puis\", \"enfin\") — they often reveal that a statement claiming something is immediate or automatic is actually false.",
      },
    },
    ru: {
      prompt: "Жители, неправильно сортирующие отходы, немедленно штрафуются, без предупреждения.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      hint: "Ищите последовательность из двух последствий, а не одно.",
      explanation: {
        whereInText: "«Les habitants qui ne respectent pas ce tri reçoivent d'abord un avertissement, puis une amende en cas de récidive.»",
        keywords: "d'abord un avertissement, puis une amende",
        whyCorrect: "«D'abord... puis...» («сначала... затем...») показывает, что сначала идёт предупреждение, а штраф следует только при повторном нарушении — а не сразу.",
        whyIncorrect: [{ optionId: "opt-true", reason: "Это игнорирует слово последовательности «d'abord» (сначала): предупреждение всегда предшествует штрафу, который применяется только к повторным нарушителям («récidive»)." }],
        vocabulary: [{ term: "avertissement", translation: "предупреждение" }],
        grammarPattern: "«D'abord... puis...» явно упорядочивает два шага во времени — всегда проверяйте этот паттерн, прежде чем считать, что что-то происходит немедленно.",
        strategy: "Обращайте внимание на слова последовательности («d'abord», «ensuite», «puis», «enfin») — они часто показывают, что утверждение о немедленности или автоматичности на самом деле неверно.",
      },
    },
    kz: {
      prompt: "Қалдықты дұрыс сұрыптамайтын тұрғындар ескертусіз, бірден айыппұл төлейді.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Дұрыс емес" },
      ],
      hint: "Бір емес, екі салдардың реттілігін іздеңіз.",
      explanation: {
        whereInText: "«Les habitants qui ne respectent pas ce tri reçoivent d'abord un avertissement, puis une amende en cas de récidive.»",
        keywords: "d'abord un avertissement, puis une amende",
        whyCorrect: "«D'abord... puis...» («алдымен... содан кейін...») алдымен ескерту берілетінін, ал айыппұл тек қайталанған бұзушылықта ғана салынатынын көрсетеді — бірден емес.",
        whyIncorrect: [{ optionId: "opt-true", reason: "Бұл «d'abord» (алдымен) реттілік сөзін елемейді: ескерту әрқашан айыппұлдан бұрын келеді, ол тек қайталанған бұзушыларға («récidive») ғана қолданылады." }],
        vocabulary: [{ term: "avertissement", translation: "ескерту" }],
        grammarPattern: "«D'abord... puis...» уақыт бойынша екі қадамды нақты ретке келтіреді — бірдеңе бірден болады деп есептемес бұрын әрқашан осы үлгіні тексеріңіз.",
        strategy: "Реттілік сөздеріне («d'abord», «ensuite», «puis», «enfin») назар аударыңыз — олар көбіне бірдеңенің бірден немесе автоматты түрде болатыны туралы тұжырымның шын мәнінде дұрыс еместігін көрсетеді.",
      },
    },
  },
};

const b1RecyclingQ3: QuestionSpec = {
  id: "b1-recycling-article-1-q3",
  passageId: "b1-recycling-article-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "vocabulary",
  evidenceQuote: "réduire les déchets envoyés en décharge de quarante pour cent",
  content: {
    en: {
      prompt: "In this text, the word \"décharge\" refers to...",
      options: [
        { id: "opt-a", text: "A landfill (a site where waste is dumped)" },
        { id: "opt-b", text: "A price discount" },
        { id: "opt-c", text: "An electric charge" },
        { id: "opt-d", text: "A water discharge/release" },
      ],
      hint: "Look at the words right around it: what kind of place would \"déchets\" (waste) be \"sent to\"?",
      explanation: {
        whereInText: "\"...a permis de réduire les déchets envoyés en décharge de quarante pour cent...\"",
        keywords: "déchets envoyés en décharge",
        whyCorrect: "\"Déchets envoyés en décharge\" (waste sent to a décharge) only makes sense if \"décharge\" means a landfill/dump site — the surrounding words about waste confirm this meaning.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "A price discount would be \"une réduction\" or \"un rabais\" in French, and makes no sense with \"déchets envoyés\" (waste sent)." },
          { optionId: "opt-c", reason: "An electric charge is unrelated to a sentence about waste management." },
          { optionId: "opt-d", reason: "A water discharge doesn't fit the context of waste being reduced in quantity at a site." },
        ],
        vocabulary: [{ term: "décharge", translation: "landfill / dump" }],
        grammarPattern: "\"Décharge\" is a good example of a word with multiple meanings in French — context (here, \"déchets\") always determines which meaning applies.",
        strategy: "For vocabulary-in-context questions, never translate the word alone — look at the words immediately before and after it to narrow down which meaning fits.",
      },
    },
    ru: {
      prompt: "В этом тексте слово «décharge» означает...",
      options: [
        { id: "opt-a", text: "Свалку (место, куда свозят отходы)" },
        { id: "opt-b", text: "Скидку на цену" },
        { id: "opt-c", text: "Электрический заряд" },
        { id: "opt-d", text: "Сброс/выпуск воды" },
      ],
      hint: "Посмотрите на слова рядом с ним: в какое место могли бы «отправлять» отходы («déchets»)?",
      explanation: {
        whereInText: "«...a permis de réduire les déchets envoyés en décharge de quarante pour cent...»",
        keywords: "déchets envoyés en décharge",
        whyCorrect: "«Déchets envoyés en décharge» (отходы, отправленные на décharge) имеет смысл только если «décharge» означает свалку — окружающие слова об отходах подтверждают это значение.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Скидка на цену по-французски будет «une réduction» или «un rabais», и не сочетается со словами «déchets envoyés» (отправленные отходы)." },
          { optionId: "opt-c", reason: "Электрический заряд не связан с предложением об управлении отходами." },
          { optionId: "opt-d", reason: "Сброс воды не подходит к контексту сокращения количества отходов на объекте." },
        ],
        vocabulary: [{ term: "décharge", translation: "свалка" }],
        grammarPattern: "«Décharge» — хороший пример слова с несколькими значениями во французском; контекст (здесь — «déchets») всегда определяет, какое значение применимо.",
        strategy: "Для вопросов о лексике в контексте никогда не переводите слово отдельно — смотрите на слова непосредственно до и после него, чтобы сузить подходящее значение.",
      },
    },
    kz: {
      prompt: "Бұл мәтінде «décharge» сөзі нені білдіреді...",
      options: [
        { id: "opt-a", text: "Қоқыс полигонын (қалдықтар тасталатын орын)" },
        { id: "opt-b", text: "Баға жеңілдігін" },
        { id: "opt-c", text: "Электр зарядын" },
        { id: "opt-d", text: "Су ағызуды" },
      ],
      hint: "Оның айналасындағы сөздерге қараңыз: «déchets» (қалдықтар) қандай орынға «жіберіледі»?",
      explanation: {
        whereInText: "«...a permis de réduire les déchets envoyés en décharge de quarante pour cent...»",
        keywords: "déchets envoyés en décharge",
        whyCorrect: "«Déchets envoyés en décharge» (décharge-ге жіберілген қалдықтар) тек «décharge» қоқыс полигонын білдіргенде ғана мағыналы болады — қалдықтар туралы айналадағы сөздер осы мағынаны растайды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Баға жеңілдігі француз тілінде «une réduction» немесе «un rabais» болар еді, және «déchets envoyés» (жіберілген қалдықтар) сөзімен мағынасы сәйкес келмейді." },
          { optionId: "opt-c", reason: "Электр заряды қалдықтарды басқару туралы сөйлеммен байланысты емес." },
          { optionId: "opt-d", reason: "Су ағызу орында қалдықтар санының азаюы контекстіне сәйкес келмейді." },
        ],
        vocabulary: [{ term: "décharge", translation: "қоқыс полигоны" }],
        grammarPattern: "«Décharge» — француз тілінде бірнеше мағынасы бар сөзге жақсы мысал; контекст (мұнда — «déchets») қандай мағына қолданылатынын әрқашан анықтайды.",
        strategy: "Контекстегі лексика сұрақтары үшін сөзді жалғыз аудармаңыз — қай мағына сәйкес келетінін тарылту үшін оның алды мен артындағы сөздерге қараңыз.",
      },
    },
  },
};

const B1_RECYCLING_VOCAB: VocabularySpec[] = [
  {
    term: "tri sélectif",
    translation: { en: "selective waste sorting", ru: "раздельный сбор отходов", kz: "қалдықты сұрыптап бөлу" },
    definition: {
      en: "Separating waste into categories (glass, plastic, etc.) for recycling.",
      ru: "Разделение отходов на категории (стекло, пластик и т.д.) для переработки.",
      kz: "Қайта өңдеу үшін қалдықтарды санаттарға (шыны, пластик және т.б.) бөлу.",
    },
    exampleSentence: "La municipalité a mis en place un système de tri sélectif obligatoire.",
  },
  {
    term: "avertissement",
    translation: { en: "warning", ru: "предупреждение", kz: "ескерту" },
    definition: {
      en: "A notice given before a stricter consequence follows.",
      ru: "Уведомление, даваемое перед более строгим последствием.",
      kz: "Қатаңырақ салдар алдында берілетін хабарлама.",
    },
    exampleSentence: "Les habitants reçoivent d'abord un avertissement.",
  },
  {
    term: "décharge",
    translation: { en: "landfill", ru: "свалка", kz: "қоқыс полигоны" },
    definition: {
      en: "A site where waste is dumped.",
      ru: "Место, куда свозят отходы.",
      kz: "Қалдықтар тасталатын орын.",
    },
    exampleSentence: "Réduire les déchets envoyés en décharge de quarante pour cent.",
  },
  {
    term: "compostage",
    translation: { en: "composting", ru: "компостирование", kz: "компосттау" },
    definition: {
      en: "Turning organic waste into fertilizer through natural decomposition.",
      ru: "Превращение органических отходов в удобрение путём естественного разложения.",
      kz: "Органикалық қалдықтарды табиғи ыдырау арқылы тыңайтқышқа айналдыру.",
    },
    exampleSentence: "La mairie prévoit de construire un centre de compostage collectif.",
  },
];

export const B1_PASSAGES: ReadingPassage[] = [B1_ENTREPRENEUR_INTERVIEW, B1_RECYCLING_ARTICLE];

export const B1_QUESTIONS_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingQuestion[]>> = {
  "b1-entrepreneur-interview-1": buildPassageQuestions(b1InterviewQ1, b1InterviewQ2, b1InterviewQ3),
  "b1-recycling-article-1": buildPassageQuestions(b1RecyclingQ1, b1RecyclingQ2, b1RecyclingQ3),
};

export const B1_VOCABULARY_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingVocabularyItem[]>> = {
  "b1-entrepreneur-interview-1": buildVocabulary(B1_ENTREPRENEUR_VOCAB),
  "b1-recycling-article-1": buildVocabulary(B1_RECYCLING_VOCAB),
};

// ---------------------------------------------------------------------------
// B2 — Avancé: argumentative/informational, long texts, ~250-350 words.
// ---------------------------------------------------------------------------

const B2_TELEWORK_ARTICLE: ReadingPassage = {
  id: "b2-telework-article-1",
  textType: "Argumentative article",
  title: "Remote work: progress or illusion?",
  body: "Télétravail : progrès ou illusion ?\n\nDepuis la généralisation du télétravail, de nombreuses entreprises vantent les bénéfices de cette organisation : moins de temps perdu dans les transports, plus grande autonomie, meilleur équilibre entre vie professionnelle et vie personnelle. Pourtant, une partie croissante des employés et des chercheurs commence à nuancer ce discours enthousiaste.\n\nD'un côté, les défenseurs du télétravail soulignent que la productivité individuelle augmente souvent lorsque les salariés travaillent dans un environnement calme, choisi par eux-mêmes. Ils rappellent également que la suppression des trajets quotidiens réduit le stress et libère du temps pour la famille ou les loisirs. Plusieurs études montrent par ailleurs une baisse de l'absentéisme chez les travailleurs à distance.\n\nD'un autre côté, certains experts en psychologie du travail alertent sur un isolement social grandissant. Sans les échanges informels du bureau, de nombreux salariés se sentent déconnectés de leurs collègues et de la culture de leur entreprise. De plus, la frontière entre vie privée et vie professionnelle devient parfois floue : plusieurs enquêtes révèlent que les télétravailleurs ont tendance à travailler plus d'heures, souvent sans compensation, simplement parce qu'ils n'arrivent plus à \"fermer la porte du bureau\".\n\nEnfin, cette organisation du travail n'est pas non plus égalitaire. Les salariés disposant d'un grand logement calme profitent pleinement du télétravail, tandis que ceux qui vivent dans un petit appartement partagé, parfois avec des enfants en bas âge, peinent à trouver un espace de travail adapté. Cette réalité crée une nouvelle forme d'inégalité entre collègues occupant pourtant le même poste.\n\nEn définitive, le télétravail ne doit sans doute être considéré ni comme une solution miracle, ni comme un problème en soi, mais plutôt comme un outil dont les effets dépendent largement des conditions matérielles et de l'organisation mise en place par chaque entreprise.",
  estimatedWordCount: 330,
};

const b2TeleworkQ1: QuestionSpec = {
  id: "b2-telework-article-1-q1",
  passageId: "b2-telework-article-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "mainIdea",
  evidenceQuote: "le télétravail ne doit sans doute être considéré ni comme une solution miracle, ni comme un problème en soi, mais plutôt comme un outil dont les effets dépendent largement des conditions matérielles",
  content: {
    en: {
      prompt: "What is the main argument of this article?",
      options: [
        { id: "opt-a", text: "Remote work's real effects depend heavily on individual circumstances — it's neither purely good nor bad" },
        { id: "opt-b", text: "Remote work is entirely positive with no meaningful downsides" },
        { id: "opt-c", text: "Remote work should be banned by all companies" },
        { id: "opt-d", text: "Remote work only affects large multinational companies" },
      ],
      hint: "The final paragraph sums up the writer's overall position — read the conclusion before choosing.",
      explanation: {
        whereInText: "The final paragraph: \"le télétravail ne doit sans doute être considéré ni comme une solution miracle, ni comme un problème en soi, mais plutôt comme un outil dont les effets dépendent largement des conditions matérielles...\"",
        keywords: "ni... ni..., dépendent largement des conditions matérielles",
        whyCorrect: "The conclusion explicitly rejects both extremes (\"ni... ni...\") and states the outcome depends on material conditions and each company's organization — a nuanced, conditional argument.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The article dedicates an entire paragraph to isolation, blurred work-life boundaries, and unpaid overtime — clear downsides, not \"no meaningful downsides\"." },
          { optionId: "opt-c", reason: "The conclusion explicitly says remote work should NOT be seen as \"un problème en soi\" (a problem in itself), which rules out a call for banning it." },
          { optionId: "opt-d", reason: "The article discusses individual employees' housing and living conditions, not company size — this scope isn't mentioned at all." },
        ],
        vocabulary: [{ term: "en définitive", translation: "ultimately / in the end" }],
        grammarPattern: "\"Ni... ni... mais plutôt\" (\"neither... nor... but rather\") is a structure for rejecting two opposite extremes in favor of a middle, nuanced position.",
        strategy: "For argumentative texts, always read the concluding paragraph closely — it usually states the writer's real position, which earlier paragraphs only present as competing viewpoints.",
      },
    },
    ru: {
      prompt: "Какова основная мысль этой статьи?",
      options: [
        { id: "opt-a", text: "Реальные эффекты удалённой работы сильно зависят от индивидуальных обстоятельств — она не является ни однозначно хорошей, ни плохой" },
        { id: "opt-b", text: "Удалённая работа полностью положительна и не имеет значимых недостатков" },
        { id: "opt-c", text: "Удалённую работу должны запретить все компании" },
        { id: "opt-d", text: "Удалённая работа затрагивает только крупные международные компании" },
      ],
      hint: "Последний абзац подытоживает общую позицию автора — прочитайте заключение перед выбором ответа.",
      explanation: {
        whereInText: "Последний абзац: «le télétravail ne doit sans doute être considéré ni comme une solution miracle, ni comme un problème en soi, mais plutôt comme un outil dont les effets dépendent largement des conditions matérielles...»",
        keywords: "ni... ni..., dépendent largement des conditions matérielles",
        whyCorrect: "Заключение явно отвергает обе крайности («ni... ni...») и утверждает, что результат зависит от материальных условий и организации в каждой компании — это взвешенный, условный аргумент.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Статья посвящает целый абзац изоляции, размытым границам работы и личной жизни, а также неоплачиваемым переработкам — это явные недостатки, а не «отсутствие значимых недостатков»." },
          { optionId: "opt-c", reason: "В заключении прямо сказано, что удалённую работу НЕ следует считать «un problème en soi» (проблемой самой по себе), что исключает призыв к запрету." },
          { optionId: "opt-d", reason: "Статья обсуждает жилищные условия отдельных сотрудников, а не размер компании — этот масштаб вообще не упоминается." },
        ],
        vocabulary: [{ term: "en définitive", translation: "в конечном счёте" }],
        grammarPattern: "«Ni... ni... mais plutôt» («ни... ни... а скорее») — структура для отклонения двух противоположных крайностей в пользу взвешенной средней позиции.",
        strategy: "Для аргументативных текстов всегда внимательно читайте заключительный абзац — он обычно излагает реальную позицию автора, тогда как более ранние абзацы лишь представляют конкурирующие точки зрения.",
      },
    },
    kz: {
      prompt: "Бұл мақаланың негізгі дәлелі қандай?",
      options: [
        { id: "opt-a", text: "Қашықтан жұмыс істеудің нақты әсері жеке жағдайларға байланысты — ол таза жақсы да, таза жаман да емес" },
        { id: "opt-b", text: "Қашықтан жұмыс толығымен оң, елеулі кемшіліктері жоқ" },
        { id: "opt-c", text: "Қашықтан жұмысты барлық компаниялар тыйым салуы керек" },
        { id: "opt-d", text: "Қашықтан жұмыс тек ірі халықаралық компанияларға әсер етеді" },
      ],
      hint: "Соңғы абзац автордың жалпы ұстанымын қорытады — жауап таңдамас бұрын қорытындыны оқыңыз.",
      explanation: {
        whereInText: "Соңғы абзац: «le télétravail ne doit sans doute être considéré ni comme une solution miracle, ni comme un problème en soi, mais plutôt comme un outil dont les effets dépendent largement des conditions matérielles...»",
        keywords: "ni... ni..., dépendent largement des conditions matérielles",
        whyCorrect: "Қорытынды екі шектен де («ni... ni...») бас тартады және нәтиже материалдық жағдайлар мен әр компанияның ұйымдастыруына байланысты екенін айтады — бұл теңгерімді, шартты дәлел.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мақала оқшаулануға, жұмыс пен жеке өмір шекарасының бұлдырлануына және төленбейтін қосымша жұмысқа тұтас абзац арнайды — бұл айқын кемшіліктер, «елеулі кемшіліктер жоқ» емес." },
          { optionId: "opt-c", reason: "Қорытындыда қашықтан жұмысты «un problème en soi» (өз алдына мәселе) деп санамау керек екені тікелей айтылған, бұл тыйым салуға шақыруды жоққа шығарады." },
          { optionId: "opt-d", reason: "Мақала жеке қызметкерлердің тұрғын үй жағдайын талқылайды, компания көлемін емес — бұл ауқым мүлде аталмайды." },
        ],
        vocabulary: [{ term: "en définitive", translation: "сайып келгенде" }],
        grammarPattern: "«Ni... ni... mais plutôt» («не... не... керісінше») екі қарама-қарсы шектен бас тартып, теңгерімді орта ұстанымды таңдау құрылымы.",
        strategy: "Дәйектеу мәтіндерінде әрқашан қорытынды абзацты мұқият оқыңыз — ол әдетте автордың нақты ұстанымын баяндайды, ал алдыңғы абзацтар тек қарама-қайшы көзқарастарды ұсынады.",
      },
    },
  },
};

const b2TeleworkQ2: QuestionSpec = {
  id: "b2-telework-article-1-q2",
  passageId: "b2-telework-article-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "detail",
  evidenceQuote: "une baisse de l'absentéisme chez les travailleurs à distance",
  content: {
    en: {
      prompt: "According to the article, studies show remote workers are absent from work more often than office workers.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      hint: "Check whether the studies mention a rise or a fall in absenteeism.",
      explanation: {
        whereInText: "\"Plusieurs études montrent par ailleurs une baisse de l'absentéisme chez les travailleurs à distance.\"",
        keywords: "baisse de l'absentéisme",
        whyCorrect: "\"Baisse\" means \"decrease/fall\", so the studies show LESS absenteeism among remote workers, the opposite of the statement.",
        whyIncorrect: [{ optionId: "opt-true", reason: "This reverses \"baisse\" (decrease) into an increase — the text states absenteeism goes down for remote workers, not up." }],
        vocabulary: [{ term: "baisse", translation: "decrease / drop" }],
        grammarPattern: "\"Une baisse de X\" always means X went down — don't confuse it with \"une hausse de X\" (a rise in X), which means the opposite.",
        strategy: "For statistics-based true/false questions, isolate the single word that carries direction (baisse/hausse, augmente/diminue) — that word alone often decides the answer.",
      },
    },
    ru: {
      prompt: "Согласно статье, исследования показывают, что удалённые работники отсутствуют на работе чаще, чем офисные.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      hint: "Проверьте, говорят ли исследования о росте или о снижении отсутствия на работе.",
      explanation: {
        whereInText: "«Plusieurs études montrent par ailleurs une baisse de l'absentéisme chez les travailleurs à distance.»",
        keywords: "baisse de l'absentéisme",
        whyCorrect: "«Baisse» значит «снижение/падение», то есть исследования показывают МЕНЬШЕ отсутствий у удалённых работников — противоположность утверждению.",
        whyIncorrect: [{ optionId: "opt-true", reason: "Это меняет «baisse» (снижение) на рост — в тексте сказано, что отсутствие на работе снижается у удалённых работников, а не растёт." }],
        vocabulary: [{ term: "baisse", translation: "снижение / падение" }],
        grammarPattern: "«Une baisse de X» всегда значит, что X снизился — не путайте с «une hausse de X» (рост X), что означает противоположное.",
        strategy: "Для вопросов «верно/неверно» на основе статистики выделяйте одно слово, несущее направление (baisse/hausse, augmente/diminue) — часто именно оно определяет ответ.",
      },
    },
    kz: {
      prompt: "Мақалаға сәйкес, зерттеулер қашықтан жұмыс істейтіндердің кеңседегілерге қарағанда жұмысқа жиірек келмейтінін көрсетеді.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Дұрыс емес" },
      ],
      hint: "Зерттеулер жұмысқа келмеу деңгейінің өсуі туралы ма, әлде төмендеуі туралы ма екенін тексеріңіз.",
      explanation: {
        whereInText: "«Plusieurs études montrent par ailleurs une baisse de l'absentéisme chez les travailleurs à distance.»",
        keywords: "baisse de l'absentéisme",
        whyCorrect: "«Baisse» «төмендеу/құлдырау» дегенді білдіреді, яғни зерттеулер қашықтан жұмыс істейтіндерде жұмысқа келмеу АЗАЙғанын көрсетеді — тұжырымға қарама-қарсы.",
        whyIncorrect: [{ optionId: "opt-true", reason: "Бұл «baisse» (төмендеу) сөзін өсу ретінде керісінше түсіндіреді — мәтінде қашықтан жұмыс істейтіндерде жұмысқа келмеу өсіп жатыр емес, төмендеп жатыр делінген." }],
        vocabulary: [{ term: "baisse", translation: "төмендеу" }],
        grammarPattern: "«Une baisse de X» әрқашан X төмендегенін білдіреді — оны керісінше мағынадағы «une hausse de X» (X өсуі) сөзімен шатастырмаңыз.",
        strategy: "Статистикаға негізделген дұрыс/дұрыс емес сұрақтары үшін бағытты білдіретін бір сөзді (baisse/hausse, augmente/diminue) бөліп алыңыз — көбіне жауапты дәл сол сөз шешеді.",
      },
    },
  },
};

const b2TeleworkQ3: QuestionSpec = {
  id: "b2-telework-article-1-q3",
  passageId: "b2-telework-article-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "inference",
  evidenceQuote: "ceux qui vivent dans un petit appartement partagé, parfois avec des enfants en bas âge, peinent à trouver un espace de travail adapté. Cette réalité crée une nouvelle forme d'inégalité",
  content: {
    en: {
      prompt: "What does the article suggest about employees living in small, shared housing?",
      options: [
        { id: "opt-a", text: "They are disadvantaged compared to colleagues with larger, quieter homes" },
        { id: "opt-b", text: "They are always more productive than others" },
        { id: "opt-c", text: "They generally prefer working from the office" },
        { id: "opt-d", text: "They receive extra pay to compensate for remote work" },
      ],
      hint: "Look at the paragraph about inequality — compare the two types of living situations it contrasts.",
      explanation: {
        whereInText: "\"Les salariés disposant d'un grand logement calme profitent pleinement du télétravail, tandis que ceux qui vivent dans un petit appartement partagé... peinent à trouver un espace de travail adapté. Cette réalité crée une nouvelle forme d'inégalité...\"",
        keywords: "tandis que, nouvelle forme d'inégalité",
        whyCorrect: "\"Tandis que\" (\"while/whereas\") contrasts those with large quiet homes (who benefit fully) against those in small shared apartments (who struggle) — the text then explicitly calls this a new form of inequality.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The opposite is implied: struggling to find adequate workspace would hurt, not help, productivity." },
          { optionId: "opt-c", reason: "The article never states a housing-based preference for office work — this isn't discussed at all." },
          { optionId: "opt-d", reason: "No compensation or extra pay is mentioned anywhere in this paragraph or the article." },
        ],
        vocabulary: [{ term: "inégalité", translation: "inequality" }],
        grammarPattern: "\"Tandis que\" introduces a contrast between two groups or situations — a strong signal that the following clause describes the opposite experience of the one before it.",
        strategy: "For inference questions built on contrast, find the connector (\"tandis que\", \"alors que\", \"en revanche\") and read both halves of the sentence as a pair, not in isolation.",
      },
    },
    ru: {
      prompt: "Что статья предполагает о сотрудниках, живущих в маленьком общем жилье?",
      options: [
        { id: "opt-a", text: "Они находятся в невыгодном положении по сравнению с коллегами с большими, тихими домами" },
        { id: "opt-b", text: "Они всегда более продуктивны, чем другие" },
        { id: "opt-c", text: "Они обычно предпочитают работать из офиса" },
        { id: "opt-d", text: "Они получают дополнительную оплату в качестве компенсации за удалённую работу" },
      ],
      hint: "Посмотрите на абзац о неравенстве — сравните два типа жилищных условий, которые там противопоставлены.",
      explanation: {
        whereInText: "«Les salariés disposant d'un grand logement calme profitent pleinement du télétravail, tandis que ceux qui vivent dans un petit appartement partagé... peinent à trouver un espace de travail adapté. Cette réalité crée une nouvelle forme d'inégalité...»",
        keywords: "tandis que, nouvelle forme d'inégalité",
        whyCorrect: "«Tandis que» («в то время как») противопоставляет тех, у кого большие тихие дома (они выигрывают полностью), тем, кто живёт в маленьких общих квартирах (им сложно) — далее текст прямо называет это новой формой неравенства.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Подразумевается обратное: трудности с поиском подходящего рабочего пространства скорее вредят продуктивности, чем помогают." },
          { optionId: "opt-c", reason: "Статья нигде не утверждает предпочтение офисной работы на основе жилищных условий — это вообще не обсуждается." },
          { optionId: "opt-d", reason: "Ни компенсация, ни дополнительная оплата нигде в этом абзаце или статье не упоминаются." },
        ],
        vocabulary: [{ term: "inégalité", translation: "неравенство" }],
        grammarPattern: "«Tandis que» вводит противопоставление между двумя группами или ситуациями — явный сигнал, что следующая часть описывает противоположный опыт по сравнению с предыдущей.",
        strategy: "Для вопросов на выводы, построенных на противопоставлении, найдите связку («tandis que», «alors que», «en revanche») и читайте обе половины предложения вместе, а не по отдельности.",
      },
    },
    kz: {
      prompt: "Мақала кішкентай, ортақ тұрғын үйде тұратын қызметкерлер туралы нені меңзейді?",
      options: [
        { id: "opt-a", text: "Олар үлкен, тыныш үйі бар әріптестерімен салыстырғанда тиімсіз жағдайда" },
        { id: "opt-b", text: "Олар әрдайым басқалардан өнімдірек" },
        { id: "opt-c", text: "Олар әдетте кеңседе жұмыс істеуді қалайды" },
        { id: "opt-d", text: "Олар қашықтан жұмыс үшін қосымша ақы алады" },
      ],
      hint: "Теңсіздік туралы абзацқа қараңыз — онда қарама-қарсы қойылған екі тұрғын үй жағдайын салыстырыңыз.",
      explanation: {
        whereInText: "«Les salariés disposant d'un grand logement calme profitent pleinement du télétravail, tandis que ceux qui vivent dans un petit appartement partagé... peinent à trouver un espace de travail adapté. Cette réalité crée une nouvelle forme d'inégalité...»",
        keywords: "tandis que, nouvelle forme d'inégalité",
        whyCorrect: "«Tandis que» («ал ... болса») үлкен тыныш үйі барларды (толық пайда көретіндер) кішкентай ортақ пәтерде тұратындармен (қиналатындар) қарама-қарсы қояды — мәтін мұны жаңа теңсіздік түрі деп тікелей атайды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Керісіншесі меңзеледі: лайықты жұмыс кеңістігін табу қиындығы өнімділікке көмектеспейді, керісінше зиян тигізеді." },
          { optionId: "opt-c", reason: "Мақалада тұрғын үй жағдайына байланысты кеңседе жұмыс істеуге басымдық беру туралы мүлде айтылмайды." },
          { optionId: "opt-d", reason: "Бұл абзацта немесе мақалада өтемақы немесе қосымша ақы туралы мүлде айтылмайды." },
        ],
        vocabulary: [{ term: "inégalité", translation: "теңсіздік" }],
        grammarPattern: "«Tandis que» екі топ немесе жағдай арасындағы қарама-қайшылықты енгізеді — келесі бөлік алдыңғысына қарама-қарсы тәжірибені сипаттайтынының айқын белгісі.",
        strategy: "Қарама-қайшылыққа құрылған қорытынды сұрақтары үшін жалғаулықты («tandis que», «alors que», «en revanche») тауып, сөйлемнің екі жартысын бөлек емес, бірге оқыңыз.",
      },
    },
  },
};

const B2_TELEWORK_VOCAB: VocabularySpec[] = [
  {
    term: "télétravail",
    translation: { en: "remote work / telework", ru: "удалённая работа", kz: "қашықтан жұмыс" },
    definition: {
      en: "Working from home or another location instead of an office.",
      ru: "Работа из дома или другого места вместо офиса.",
      kz: "Кеңседің орнына үйден немесе басқа жерден жұмыс істеу.",
    },
    exampleSentence: "Depuis la généralisation du télétravail...",
  },
  {
    term: "autonomie",
    translation: { en: "autonomy", ru: "автономия / самостоятельность", kz: "дербестік" },
    definition: {
      en: "The freedom to organize one's own work.",
      ru: "Свобода самостоятельно организовывать свою работу.",
      kz: "Өз жұмысын өзі ұйымдастыру еркіндігі.",
    },
    exampleSentence: "Plus grande autonomie, meilleur équilibre entre vie professionnelle et vie personnelle.",
  },
  {
    term: "isolement",
    translation: { en: "isolation", ru: "изоляция", kz: "оқшаулану" },
    definition: {
      en: "The state of being separated from social contact.",
      ru: "Состояние отделённости от социальных контактов.",
      kz: "Әлеуметтік байланыстан бөлектену жағдайы.",
    },
    exampleSentence: "Certains experts alertent sur un isolement social grandissant.",
  },
  {
    term: "inégalité",
    translation: { en: "inequality", ru: "неравенство", kz: "теңсіздік" },
    definition: {
      en: "An unfair difference in conditions between people.",
      ru: "Несправедливое различие в условиях между людьми.",
      kz: "Адамдар арасындағы жағдайлардағы әділетсіз айырмашылық.",
    },
    exampleSentence: "Cette réalité crée une nouvelle forme d'inégalité entre collègues.",
  },
];

const B2_SOCIAL_MEDIA_ARTICLE: ReadingPassage = {
  id: "b2-social-media-article-1",
  textType: "Magazine article",
  title: "Social media: the hidden price of \"free\"",
  body: "Réseaux sociaux : le prix caché de la gratuité\n\nLes plateformes de réseaux sociaux sont gratuites pour leurs utilisateurs, mais cette gratuité a un coût bien réel : celui des données personnelles. Chaque clic, chaque \"j'aime\", chaque minute passée à faire défiler un fil d'actualité est enregistré, analysé, puis utilisé pour construire un profil publicitaire extrêmement précis.\n\nCe modèle économique, souvent qualifié de \"capitalisme de surveillance\" par certains chercheurs, repose sur un principe simple : plus une plateforme retient longtemps l'attention de ses utilisateurs, plus elle collecte de données, et plus elle peut vendre cher ses espaces publicitaires. Les algorithmes sont donc conçus pour maximiser le temps passé sur l'application, parfois au détriment du bien-être des utilisateurs.\n\nPlusieurs études récentes établissent un lien entre l'usage intensif des réseaux sociaux et une hausse de l'anxiété, en particulier chez les adolescents. Face à ces constats, certains pays envisagent une réglementation plus stricte, notamment concernant la collecte de données des mineurs.\n\nCertains utilisateurs choisissent malgré tout de continuer à utiliser ces plateformes, estimant que les bénéfices sociaux (rester en contact avec des amis éloignés, par exemple) compensent les risques. D'autres, de plus en plus nombreux, décident de limiter volontairement leur temps d'écran ou de supprimer purement et simplement leurs comptes.\n\nQuoi qu'il en soit, la question centrale demeure : jusqu'à quel point sommes-nous prêts à échanger notre vie privée contre du divertissement gratuit ?",
  estimatedWordCount: 250,
};

const b2SocialMediaQ1: QuestionSpec = {
  id: "b2-social-media-article-1-q1",
  passageId: "b2-social-media-article-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "medium",
  skillTag: "mainIdea",
  evidenceQuote: "jusqu'à quel point sommes-nous prêts à échanger notre vie privée contre du divertissement gratuit ?",
  content: {
    en: {
      prompt: "What is the central question raised at the end of the article?",
      options: [
        { id: "opt-a", text: "How much privacy people are willing to trade for free entertainment" },
        { id: "opt-b", text: "Whether social media interfaces should be more colorful" },
        { id: "opt-c", text: "Whether smartphones should be banned in schools" },
        { id: "opt-d", text: "How much advertising costs on social media platforms" },
      ],
      hint: "The very last sentence of the article is phrased as a direct question — read it literally.",
      explanation: {
        whereInText: "\"Quoi qu'il en soit, la question centrale demeure : jusqu'à quel point sommes-nous prêts à échanger notre vie privée contre du divertissement gratuit ?\"",
        keywords: "jusqu'à quel point, vie privée, divertissement gratuit",
        whyCorrect: "The article's final sentence is explicitly framed as \"la question centrale\" (the central question) and asks exactly this trade-off between privacy and free entertainment.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Visual design/color of apps is never discussed anywhere in the article." },
          { optionId: "opt-c", reason: "Schools and smartphone bans are never mentioned — the article discusses data collection broadly, not a school policy." },
          { optionId: "opt-d", reason: "Specific advertising prices/costs aren't given; only the general mechanism of selling ad space is described." },
        ],
        vocabulary: [{ term: "vie privée", translation: "privacy / private life" }],
        grammarPattern: "\"Jusqu'à quel point\" (\"to what extent\") introduces an open rhetorical question — a common way French argumentative texts end without giving a firm final answer.",
        strategy: "The final sentence of an argumentative article, especially when phrased as a question, usually restates the article's central tension — always read it as a summary, not just an ending.",
      },
    },
    ru: {
      prompt: "Какой центральный вопрос поднимается в конце статьи?",
      options: [
        { id: "opt-a", text: "Насколько люди готовы жертвовать приватностью ради бесплатного развлечения" },
        { id: "opt-b", text: "Должны ли интерфейсы соцсетей быть более яркими" },
        { id: "opt-c", text: "Стоит ли запретить смартфоны в школах" },
        { id: "opt-d", text: "Сколько стоит реклама в социальных сетях" },
      ],
      hint: "Самое последнее предложение статьи сформулировано как прямой вопрос — прочитайте его буквально.",
      explanation: {
        whereInText: "«Quoi qu'il en soit, la question centrale demeure : jusqu'à quel point sommes-nous prêts à échanger notre vie privée contre du divertissement gratuit ?»",
        keywords: "jusqu'à quel point, vie privée, divertissement gratuit",
        whyCorrect: "Последнее предложение статьи явно названо «la question centrale» (центральный вопрос) и спрашивает именно об этом компромиссе между приватностью и бесплатным развлечением.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Визуальный дизайн/цвет приложений нигде в статье не обсуждается." },
          { optionId: "opt-c", reason: "Школы и запрет смартфонов нигде не упоминаются — статья обсуждает сбор данных в целом, а не школьную политику." },
          { optionId: "opt-d", reason: "Конкретные цены на рекламу не приводятся; описан только общий механизм продажи рекламных мест." },
        ],
        vocabulary: [{ term: "vie privée", translation: "частная жизнь / приватность" }],
        grammarPattern: "«Jusqu'à quel point» («до какой степени») вводит открытый риторический вопрос — распространённый способ завершения французских аргументативных текстов без окончательного ответа.",
        strategy: "Последнее предложение аргументативной статьи, особенно сформулированное как вопрос, обычно повторяет центральное противоречие статьи — всегда читайте его как резюме, а не просто как концовку.",
      },
    },
    kz: {
      prompt: "Мақаланың соңында қандай негізгі сұрақ көтеріледі?",
      options: [
        { id: "opt-a", text: "Адамдар тегін ойын-сауық үшін жеке өмірден қаншалықты бас тартуға дайын" },
        { id: "opt-b", text: "Әлеуметтік желі интерфейстері түрлі-түсті болуы керек пе" },
        { id: "opt-c", text: "Мектептерде смартфондарға тыйым салу керек пе" },
        { id: "opt-d", text: "Әлеуметтік желілердегі жарнама қанша тұрады" },
      ],
      hint: "Мақаланың ең соңғы сөйлемі тікелей сұрақ түрінде құрылған — оны сөзбе-сөз оқыңыз.",
      explanation: {
        whereInText: "«Quoi qu'il en soit, la question centrale demeure : jusqu'à quel point sommes-nous prêts à échanger notre vie privée contre du divertissement gratuit ?»",
        keywords: "jusqu'à quel point, vie privée, divertissement gratuit",
        whyCorrect: "Мақаланың соңғы сөйлемі нақты «la question centrale» (негізгі сұрақ) деп аталған және дәл осы жеке өмір мен тегін ойын-сауық арасындағы теңгерім туралы сұрайды.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Қосымшалардың визуалды дизайны/түсі мақалада мүлде талқыланбайды." },
          { optionId: "opt-c", reason: "Мектептер мен смартфонға тыйым салу туралы мүлде айтылмайды — мақала мектеп саясатын емес, деректерді жинауды жалпы талқылайды." },
          { optionId: "opt-d", reason: "Жарнаманың нақты бағасы берілмейді; тек жарнама орнын сату механизмі жалпы сипатталады." },
        ],
        vocabulary: [{ term: "vie privée", translation: "жеке өмір / жекелік" }],
        grammarPattern: "«Jusqu'à quel point» («қай дәрежеге дейін») ашық риторикалық сұрақты енгізеді — француз дәйектеу мәтіндерінің түпкілікті жауапсыз аяқталуының кең тараған тәсілі.",
        strategy: "Дәйектеу мақаласының соңғы сөйлемі, әсіресе сұрақ түрінде құрылса, әдетте мақаланың негізгі қайшылығын қайталайды — оны жай аяқтау емес, қорытынды ретінде оқыңыз.",
      },
    },
  },
};

const b2SocialMediaQ2: QuestionSpec = {
  id: "b2-social-media-article-1-q2",
  passageId: "b2-social-media-article-1",
  questionNumber: 2,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "hard",
  skillTag: "detail",
  evidenceQuote: "les bénéfices sociaux (rester en contact avec des amis éloignés, par exemple) compensent les risques",
  content: {
    en: {
      prompt: "According to the article, which of the following are real reasons some users keep using social media despite the risks? (Select all that apply)",
      options: [
        { id: "opt-a", text: "Staying in touch with friends who live far away" },
        { id: "opt-b", text: "Getting paid for the posts they publish" },
        { id: "opt-c", text: "Enjoying free entertainment" },
        { id: "opt-d", text: "Avoiding government surveillance" },
      ],
      hint: "One reason appears in the paragraph about who keeps using these platforms; the other appears in the very last sentence.",
      explanation: {
        whereInText: "\"...les bénéfices sociaux (rester en contact avec des amis éloignés, par exemple) compensent les risques\" and the closing line about trading privacy \"contre du divertissement gratuit\".",
        keywords: "rester en contact avec des amis éloignés, divertissement gratuit",
        whyCorrect: "The article explicitly names staying in touch with distant friends as a stated social benefit, and frames the whole trade-off around \"du divertissement gratuit\" (free entertainment) as what users get in exchange.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Being paid for posts is never mentioned — the article discusses users' data being monetized by platforms, not users earning money themselves." },
          { optionId: "opt-d", reason: "Government surveillance isn't discussed as a reason to use social media — if anything, the article discusses regulation, which is government oversight of the platforms, not something users are avoiding." },
        ],
        vocabulary: [
          { term: "bénéfices", translation: "benefits" },
          { term: "divertissement", translation: "entertainment" },
        ],
        grammarPattern: "Parentheses in French argumentative writing, like \"(rester en contact avec des amis éloignés, par exemple)\", often give a concrete example right after a general claim — read what's inside them carefully.",
        strategy: "For \"select all that apply\" on a longer text, the true options are often spread across different paragraphs — check the article's opening, middle, and closing sections separately rather than assuming they cluster together.",
      },
    },
    ru: {
      prompt: "Согласно статье, какие из следующих причин реально указаны как то, почему некоторые пользователи продолжают использовать соцсети несмотря на риски? (Выберите все подходящие варианты)",
      options: [
        { id: "opt-a", text: "Поддержание связи с друзьями, живущими далеко" },
        { id: "opt-b", text: "Получение оплаты за публикуемые посты" },
        { id: "opt-c", text: "Получение бесплатного развлечения" },
        { id: "opt-d", text: "Избегание государственной слежки" },
      ],
      hint: "Одна причина указана в абзаце о том, кто продолжает пользоваться платформами; другая — в самом последнем предложении.",
      explanation: {
        whereInText: "«...les bénéfices sociaux (rester en contact avec des amis éloignés, par exemple) compensent les risques» и заключительная строка об обмене приватности «contre du divertissement gratuit».",
        keywords: "rester en contact avec des amis éloignés, divertissement gratuit",
        whyCorrect: "Статья прямо называет поддержание связи с далёкими друзьями как указанное социальное преимущество, а весь компромисс формулирует вокруг «du divertissement gratuit» (бесплатного развлечения) как того, что получают пользователи взамен.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Оплата за посты нигде не упоминается — статья обсуждает монетизацию данных пользователей платформами, а не заработок самих пользователей." },
          { optionId: "opt-d", reason: "Государственная слежка не обсуждается как причина использования соцсетей — статья, скорее, обсуждает регулирование, то есть надзор государства за платформами, а не то, чего пользователи избегают." },
        ],
        vocabulary: [
          { term: "bénéfices", translation: "преимущества" },
          { term: "divertissement", translation: "развлечение" },
        ],
        grammarPattern: "Скобки во французских аргументативных текстах, как «(rester en contact avec des amis éloignés, par exemple)», часто дают конкретный пример сразу после общего утверждения — внимательно читайте их содержимое.",
        strategy: "Для вопросов «выберите все подходящие» на длинном тексте верные варианты часто разбросаны по разным абзацам — проверяйте начало, середину и конец статьи отдельно, а не предполагая, что они сгруппированы вместе.",
      },
    },
    kz: {
      prompt: "Мақалаға сәйкес, кейбір пайдаланушылардың тәуекелдерге қарамастан әлеуметтік желілерді пайдалануды жалғастыруының нақты себептері қайсылар? (Барлық сәйкес нұсқаларды таңдаңыз)",
      options: [
        { id: "opt-a", text: "Алыста тұратын достармен байланыста болу" },
        { id: "opt-b", text: "Жариялаған жазбалары үшін ақы алу" },
        { id: "opt-c", text: "Тегін ойын-сауыққа қол жеткізу" },
        { id: "opt-d", text: "Үкіметтік бақылаудан аулақ болу" },
      ],
      hint: "Бір себеп осы платформаларды пайдалануды жалғастыратындар туралы абзацта, ал екіншісі ең соңғы сөйлемде кездеседі.",
      explanation: {
        whereInText: "«...les bénéfices sociaux (rester en contact avec des amis éloignés, par exemple) compensent les risques» және жеке өмірді «contre du divertissement gratuit» дегенге айырбастау туралы қорытынды жол.",
        keywords: "rester en contact avec des amis éloignés, divertissement gratuit",
        whyCorrect: "Мақалада алыстағы достармен байланыста болу аталған әлеуметтік пайда ретінде тікелей көрсетілген, ал бүкіл теңгерім пайдаланушылар орнына алатын нәрсе ретінде «du divertissement gratuit» (тегін ойын-сауық) төңірегінде құрылған.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Жазбалар үшін ақы алу мүлде айтылмайды — мақала пайдаланушылардың ақшаны өздері табуын емес, олардың деректерінің платформалар арқылы ақшаға айналдырылуын талқылайды." },
          { optionId: "opt-d", reason: "Үкіметтік бақылау әлеуметтік желіні пайдалану себебі ретінде талқыланбайды — керісінше, мақала реттеу туралы айтады, бұл платформаларға деген үкіметтік қадағалау, пайдаланушылар аулақ болатын нәрсе емес." },
        ],
        vocabulary: [
          { term: "bénéfices", translation: "пайдалар" },
          { term: "divertissement", translation: "ойын-сауық" },
        ],
        grammarPattern: "Француз дәйектеу мәтініндегі жақшалар, мысалы «(rester en contact avec des amis éloignés, par exemple)», жалпы тұжырымнан кейін бірден нақты мысал береді — олардың ішіндегісін мұқият оқыңыз.",
        strategy: "Ұзақ мәтінде «барлық сәйкес нұсқаларды таңдаңыз» сұрақтары үшін дұрыс нұсқалар көбіне әр түрлі абзацтарға тарап жатады — олардың бірге топтасқанын болжамай, мақаланың басын, ортасын және соңын бөлек тексеріңіз.",
      },
    },
  },
};

const b2SocialMediaQ3: QuestionSpec = {
  id: "b2-social-media-article-1-q3",
  passageId: "b2-social-media-article-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "vocabulary",
  evidenceQuote: "Ce modèle économique, souvent qualifié de \"capitalisme de surveillance\" par certains chercheurs",
  content: {
    en: {
      prompt: "In this text, \"capitalisme de surveillance\" best refers to...",
      options: [
        { id: "opt-a", text: "A business model based on collecting and monetizing users' attention and data" },
        { id: "opt-b", text: "A government system for monitoring citizens' tax payments" },
        { id: "opt-c", text: "A type of banking regulation" },
        { id: "opt-d", text: "A method for protecting user privacy" },
      ],
      hint: "Read the sentence right after the term — it explains exactly how the model works.",
      explanation: {
        whereInText: "\"Ce modèle économique, souvent qualifié de \\\"capitalisme de surveillance\\\" par certains chercheurs, repose sur un principe simple : plus une plateforme retient longtemps l'attention de ses utilisateurs, plus elle collecte de données...\"",
        keywords: "capitalisme de surveillance, retient... l'attention, collecte de données",
        whyCorrect: "The sentence immediately defines the term: a model where platforms hold users' attention to collect data and sell advertising — an economic (capitalisme) model built on watching/tracking users (surveillance).",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Taxes and government monitoring of payments are never mentioned — this term is used only for private platforms' data practices." },
          { optionId: "opt-c", reason: "Banking and financial regulation don't appear anywhere in the article." },
          { optionId: "opt-d", reason: "This is the opposite of the term's real meaning — the model is about collecting data, not protecting privacy." },
        ],
        vocabulary: [{ term: "surveillance", translation: "surveillance / monitoring" }],
        grammarPattern: "\"Souvent qualifié de X\" (\"often referred to as X\") signals that a specialized term is about to be introduced and usually explained in the following clause.",
        strategy: "When an unfamiliar compound term appears in quotes, always read the sentence that follows it — French argumentative texts typically define specialized terms immediately after introducing them.",
      },
    },
    ru: {
      prompt: "В этом тексте «capitalisme de surveillance» лучше всего означает...",
      options: [
        { id: "opt-a", text: "Бизнес-модель, основанная на сборе и монетизации внимания и данных пользователей" },
        { id: "opt-b", text: "Государственную систему контроля за налоговыми платежами граждан" },
        { id: "opt-c", text: "Тип банковского регулирования" },
        { id: "opt-d", text: "Метод защиты приватности пользователей" },
      ],
      hint: "Прочитайте предложение сразу после термина — оно точно объясняет, как работает эта модель.",
      explanation: {
        whereInText: "«Ce modèle économique, souvent qualifié de \"capitalisme de surveillance\" par certains chercheurs, repose sur un principe simple : plus une plateforme retient longtemps l'attention de ses utilisateurs, plus elle collecte de données...»",
        keywords: "capitalisme de surveillance, retient... l'attention, collecte de données",
        whyCorrect: "Предложение сразу определяет термин: модель, при которой платформы удерживают внимание пользователей, чтобы собирать данные и продавать рекламу — экономическая модель (capitalisme), построенная на слежке за пользователями (surveillance).",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Налоги и государственный контроль платежей нигде не упоминаются — термин используется только для практик частных платформ по работе с данными." },
          { optionId: "opt-c", reason: "Банковское и финансовое регулирование нигде в статье не встречается." },
          { optionId: "opt-d", reason: "Это противоположность реальному значению термина — модель связана со сбором данных, а не с защитой приватности." },
        ],
        vocabulary: [{ term: "surveillance", translation: "слежка / наблюдение" }],
        grammarPattern: "«Souvent qualifié de X» («часто называемый X») сигнализирует, что сейчас будет введён специальный термин, обычно объясняемый в следующем предложении.",
        strategy: "Когда в кавычках появляется незнакомый составной термин, всегда читайте предложение сразу после него — французские аргументативные тексты обычно определяют специальные термины сразу после их введения.",
      },
    },
    kz: {
      prompt: "Бұл мәтінде «capitalisme de surveillance» ең дұрысы нені білдіреді...",
      options: [
        { id: "opt-a", text: "Пайдаланушылардың назары мен деректерін жинауға және ақшаға айналдыруға негізделген бизнес-модель" },
        { id: "opt-b", text: "Азаматтардың салық төлемдерін бақылайтын үкіметтік жүйе" },
        { id: "opt-c", text: "Банктік реттеудің бір түрі" },
        { id: "opt-d", text: "Пайдаланушы жекелігін қорғау әдісі" },
      ],
      hint: "Терминнен кейінгі сөйлемді оқыңыз — ол модельдің қалай жұмыс істейтінін дәл түсіндіреді.",
      explanation: {
        whereInText: "«Ce modèle économique, souvent qualifié de \"capitalisme de surveillance\" par certains chercheurs, repose sur un principe simple : plus une plateforme retient longtemps l'attention de ses utilisateurs, plus elle collecte de données...»",
        keywords: "capitalisme de surveillance, retient... l'attention, collecte de données",
        whyCorrect: "Сөйлем терминді бірден анықтайды: платформалар деректерді жинау және жарнама сату үшін пайдаланушылардың назарын ұстап тұратын модель — пайдаланушыларды бақылауға (surveillance) құрылған экономикалық (capitalisme) модель.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Салықтар мен үкіметтік төлем бақылауы мүлде айтылмайды — бұл термин тек жеке платформалардың деректермен жұмыс тәжірибесіне қолданылады." },
          { optionId: "opt-c", reason: "Банктік және қаржылық реттеу мақалада мүлде кездеспейді." },
          { optionId: "opt-d", reason: "Бұл терминнің нақты мағынасына қарама-қарсы — модель деректерді жинауға қатысты, жекелікті қорғауға емес." },
        ],
        vocabulary: [{ term: "surveillance", translation: "бақылау" }],
        grammarPattern: "«Souvent qualifié de X» («жиі X деп аталады») арнайы терминнің енгізіліп жатқанын және әдетте келесі бөлікте түсіндірілетінін білдіреді.",
        strategy: "Тырнақшада таныс емес құрама термин пайда болғанда, әрқашан одан кейінгі сөйлемді оқыңыз — француз дәйектеу мәтіндері әдетте арнайы терминдерді енгізген бойда анықтайды.",
      },
    },
  },
};

const B2_SOCIAL_MEDIA_VOCAB: VocabularySpec[] = [
  {
    term: "gratuité",
    translation: { en: "the fact of being free (of charge)", ru: "бесплатность", kz: "тегін болу" },
    definition: {
      en: "The quality of costing nothing.",
      ru: "Свойство не стоить денег.",
      kz: "Ешбір ақы төленбеу қасиеті.",
    },
    exampleSentence: "Réseaux sociaux : le prix caché de la gratuité.",
  },
  {
    term: "surveillance",
    translation: { en: "surveillance / monitoring", ru: "слежка / наблюдение", kz: "бақылау" },
    definition: {
      en: "Close observation, especially of behavior or data.",
      ru: "Пристальное наблюдение, особенно за поведением или данными.",
      kz: "Әсіресе мінез-құлық немесе деректерді мұқият бақылау.",
    },
    exampleSentence: "Le \"capitalisme de surveillance\" repose sur un principe simple.",
  },
  {
    term: "anxiété",
    translation: { en: "anxiety", ru: "тревожность", kz: "мазасыздық" },
    definition: {
      en: "A feeling of worry or nervousness.",
      ru: "Чувство беспокойства или нервозности.",
      kz: "Уайымдау немесе үрейлену сезімі.",
    },
    exampleSentence: "Une hausse de l'anxiété, en particulier chez les adolescents.",
  },
  {
    term: "réglementation",
    translation: { en: "regulation", ru: "регулирование", kz: "реттеу" },
    definition: {
      en: "A set of official rules controlling an activity.",
      ru: "Набор официальных правил, регулирующих деятельность.",
      kz: "Әрекетті бақылайтын ресми ережелер жиынтығы.",
    },
    exampleSentence: "Certains pays envisagent une réglementation plus stricte.",
  },
];

export const B2_PASSAGES: ReadingPassage[] = [B2_TELEWORK_ARTICLE, B2_SOCIAL_MEDIA_ARTICLE];

export const B2_QUESTIONS_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingQuestion[]>> = {
  "b2-telework-article-1": buildPassageQuestions(b2TeleworkQ1, b2TeleworkQ2, b2TeleworkQ3),
  "b2-social-media-article-1": buildPassageQuestions(b2SocialMediaQ1, b2SocialMediaQ2, b2SocialMediaQ3),
};

export const B2_VOCABULARY_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingVocabularyItem[]>> = {
  "b2-telework-article-1": buildVocabulary(B2_TELEWORK_VOCAB),
  "b2-social-media-article-1": buildVocabulary(B2_SOCIAL_MEDIA_VOCAB),
};

// ---------------------------------------------------------------------------
// Combined exports
// ---------------------------------------------------------------------------

export const READING_CONTENT_BANK: Record<DelfLevel, ReadingPassage[]> = {
  A1: A1_PASSAGES,
  A2: A2_PASSAGES,
  B1: B1_PASSAGES,
  B2: B2_PASSAGES,
};

export const READING_QUESTIONS_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingQuestion[]>> = {
  ...A1_QUESTIONS_BY_PASSAGE,
  ...A2_QUESTIONS_BY_PASSAGE,
  ...B1_QUESTIONS_BY_PASSAGE,
  ...B2_QUESTIONS_BY_PASSAGE,
};

export const READING_VOCABULARY_BY_PASSAGE: Record<string, Record<FeedbackLanguage, ReadingVocabularyItem[]>> = {
  ...A1_VOCABULARY_BY_PASSAGE,
  ...A2_VOCABULARY_BY_PASSAGE,
  ...B1_VOCABULARY_BY_PASSAGE,
  ...B2_VOCABULARY_BY_PASSAGE,
};
