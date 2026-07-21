import type {
  DelfLevel,
  FeedbackLanguage,
  ListeningDifficulty,
  ListeningQuestion,
  ListeningQuestionExplanation,
  ListeningQuestionOption,
  ListeningQuestionType,
  ListeningRecording,
  ListeningSkillTag,
} from "@/types/listening";

/**
 * Offline fallback content bank for DELF Listening (Compréhension de l'Oral)
 * — used whenever no ANTHROPIC_API_KEY is configured. Five original
 * recordings per level, three questions per recording, each question fully
 * localized in en/ru/kz (prompt, options, explanation). Never copies real
 * DELF recordings; every explanation is grounded in the transcript actually
 * written for that recording.
 *
 * `LISTENING_QUESTIONS_BY_RECORDING` is keyed by recording id, then by
 * FeedbackLanguage, because `ListeningQuestion.prompt`/`options[].text` are
 * plain strings (not `Record<FeedbackLanguage, string>`) — so each language
 * needs its own fully-formed question array. Option ids and `correctOptionIds`
 * stay identical across the three language variants of the same question.
 */

const LANGS: FeedbackLanguage[] = ["en", "ru", "kz"];

interface QuestionContentSpec {
  prompt: string;
  options: ListeningQuestionOption[];
  explanation: ListeningQuestionExplanation;
}

interface QuestionSpec {
  id: string;
  recordingId: string;
  questionNumber: number;
  type: ListeningQuestionType;
  correctOptionIds: string[];
  difficulty: ListeningDifficulty;
  skillTag: ListeningSkillTag;
  content: Record<FeedbackLanguage, QuestionContentSpec>;
}

function buildQuestionSet(spec: QuestionSpec): Record<FeedbackLanguage, ListeningQuestion> {
  const out = {} as Record<FeedbackLanguage, ListeningQuestion>;
  for (const lang of LANGS) {
    const content = spec.content[lang];
    out[lang] = {
      id: spec.id,
      recordingId: spec.recordingId,
      questionNumber: spec.questionNumber,
      type: spec.type,
      prompt: content.prompt,
      options: content.options,
      correctOptionIds: spec.correctOptionIds,
      difficulty: spec.difficulty,
      skillTag: spec.skillTag,
      explanation: content.explanation,
    };
  }
  return out;
}

function buildRecordingQuestions(
  ...specs: QuestionSpec[]
): Record<FeedbackLanguage, ListeningQuestion[]> {
  const built = specs.map(buildQuestionSet);
  return {
    en: built.map((b) => b.en),
    ru: built.map((b) => b.ru),
    kz: built.map((b) => b.kz),
  };
}

// ---------------------------------------------------------------------------
// A1 — Découverte: public announcements, cafés, school, family. Present
// tense, very short sentences, ~40-70 words.
// ---------------------------------------------------------------------------

const A1_TRAIN_STATION: ListeningRecording = {
  id: "a1-train-station-1",
  partLabel: "Document 1",
  topic: "Train station announcement",
  transcript:
    "Attention, mesdames et messieurs. Le train numéro 8452 à destination de Lyon partira du quai numéro trois dans dix minutes. Attention, le quai a changé : ce n'est plus le quai un, c'est le quai trois. Les voyageurs pour Lyon doivent monter maintenant. Bon voyage à tous !",
  estimatedDurationSeconds: 20,
};

const A1_CAFE_ORDER: ListeningRecording = {
  id: "a1-cafe-order-1",
  partLabel: "Document 2",
  topic: "Ordering at a café",
  transcript:
    "Bonjour monsieur, qu'est-ce que vous voulez boire ? Je voudrais un café, s'il vous plaît. Et avec ça ? Vous avez des croissants ? Oui, nous avons des croissants et des pains au chocolat. Alors, un croissant aussi, merci. Très bien, ça fait quatre euros cinquante. Voilà, merci beaucoup. Bonne journée !",
  estimatedDurationSeconds: 21,
};

const A1_SCHOOL_TIMETABLE: ListeningRecording = {
  id: "a1-school-timetable-1",
  partLabel: "Document 3",
  topic: "A child describes his school timetable",
  transcript:
    "Bonjour, je m'appelle Lucas et j'ai neuf ans. Le lundi, j'ai mathématiques à huit heures et sport à dix heures. Le mercredi, je n'ai pas classe l'après-midi. Ma maîtresse s'appelle madame Petit, elle enseigne le français. J'aime beaucoup l'école !",
  estimatedDurationSeconds: 19,
};

const A1_FAMILY_INTRODUCTION: ListeningRecording = {
  id: "a1-family-introduction-1",
  partLabel: "Document 4",
  topic: "A child introduces her family",
  transcript:
    "Bonjour, je m'appelle Léa. Dans ma famille, nous sommes quatre : mon père, ma mère, mon frère et moi. Mon frère s'appelle Paul, il a douze ans, et il aime le football. Moi, j'ai dix ans et j'aime la musique. Le dimanche, toute la famille mange ensemble chez ma grand-mère.",
  estimatedDurationSeconds: 20,
};

const A1_SHOPPING_MARKET: ListeningRecording = {
  id: "a1-shopping-market-1",
  partLabel: "Document 5",
  topic: "Buying fruit at a market stall",
  transcript:
    "Bonjour madame, vous désirez ? Bonjour, je voudrais un kilo de pommes, s'il vous plaît. Voilà, un kilo de pommes. Vous avez aussi des bananes ? Oui, elles sont à deux euros le kilo. Alors, un kilo de bananes aussi, s'il vous plaît. Ça fait cinq euros pour les pommes et les bananes. Tenez, cinq euros. Merci beaucoup, bonne journée !",
  estimatedDurationSeconds: 24,
};

const a1TrainQ1: QuestionSpec = {
  id: "a1-train-station-1-q1",
  recordingId: "a1-train-station-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "number",
  content: {
    en: {
      prompt: "Which platform will the Lyon train leave from?",
      options: [
        { id: "opt-a", text: "Platform 1" },
        { id: "opt-b", text: "Platform 2" },
        { id: "opt-c", text: "Platform 3" },
        { id: "opt-d", text: "Platform 8452" },
      ],
      explanation: {
        whereInRecording:
          'The announcer corrects herself midway through: "Attention, le quai a changé : ce n\'est plus le quai un, c\'est le quai trois" — this is exactly where the real platform is confirmed.',
        keywords: "quai numéro trois, le quai a changé, ce n'est plus le quai un",
        whyCorrect:
          'The announcement first states the train will leave from "quai numéro trois," then explicitly repeats and confirms this by correcting the earlier platform. Platform three is stated twice, which removes any doubt.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Platform 1 was the original platform, but the announcer explicitly cancels it: "ce n\'est plus le quai un" (it is no longer platform one).',
          },
          {
            optionId: "opt-b",
            reason:
              'Platform 2 is never mentioned anywhere in the announcement — no number "deux" appears in the recording.',
          },
          {
            optionId: "opt-d",
            reason:
              '8452 is the train\'s number ("le train numéro 8452"), not a platform — the announcer gives the platform separately as "quai numéro trois."',
          },
        ],
        vocabulary: [
          { term: "le quai", translation: "platform (at a train station)" },
          { term: "à destination de", translation: "heading to / bound for" },
          { term: "les voyageurs", translation: "the passengers / travelers" },
        ],
        grammarPattern:
          'The future tense "partira" (will leave) shows the departure hasn\'t happened yet, while "a changé" (has changed) uses the passé composé to mark a completed change to the original plan — listen for this shift in tense to catch corrections in announcements.',
        strategy:
          "Station announcements often give information, then correct or update it a moment later. If you hear a number early on, keep listening — it may be revised before the announcement ends.",
      },
    },
    ru: {
      prompt: "С какой платформы отправится поезд на Лион?",
      options: [
        { id: "opt-a", text: "Платформа 1" },
        { id: "opt-b", text: "Платформа 2" },
        { id: "opt-c", text: "Платформа 3" },
        { id: "opt-d", text: "Платформа 8452" },
      ],
      explanation: {
        whereInRecording:
          'Диктор сама себя поправляет в середине объявления: «Attention, le quai a changé : ce n\'est plus le quai un, c\'est le quai trois» — именно здесь подтверждается настоящая платформа.',
        keywords: "quai numéro trois, le quai a changé, ce n'est plus le quai un",
        whyCorrect:
          'В объявлении сначала говорится, что поезд отправится с «quai numéro trois», а затем это явно повторяется и подтверждается через исправление ранее названной платформы. Платформа три упоминается дважды, что снимает все сомнения.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Платформа 1 была первоначальной, но диктор прямо её отменяет: «ce n\'est plus le quai un» (это больше не платформа один).',
          },
          {
            optionId: "opt-b",
            reason:
              'Платформа 2 вообще не упоминается в объявлении — числительное «deux» не встречается в записи.',
          },
          {
            optionId: "opt-d",
            reason:
              '8452 — это номер поезда («le train numéro 8452»), а не платформа — номер платформы диктор называет отдельно: «quai numéro trois».',
          },
        ],
        vocabulary: [
          { term: "le quai", translation: "платформа (на вокзале)" },
          { term: "à destination de", translation: "направляющийся в / следующий до" },
          { term: "les voyageurs", translation: "пассажиры" },
        ],
        grammarPattern:
          'Будущее время «partira» (отправится) показывает, что отправление ещё не произошло, а фраза «a changé» (изменилась) использует passé composé, чтобы отметить завершившееся изменение первоначального плана — прислушивайтесь к такой смене времени, чтобы уловить исправления в объявлениях.',
        strategy:
          "В вокзальных объявлениях информация часто даётся, а затем через мгновение исправляется или уточняется. Если вы услышали число в начале, продолжайте слушать — оно может быть изменено до конца объявления.",
      },
    },
    kz: {
      prompt: "Лион пойызы қай платформадан аттанады?",
      options: [
        { id: "opt-a", text: "1-платформа" },
        { id: "opt-b", text: "2-платформа" },
        { id: "opt-c", text: "3-платформа" },
        { id: "opt-d", text: "8452-платформа" },
      ],
      explanation: {
        whereInRecording:
          'Хабарлаушы хабарландыру ортасында өзін түзетеді: «Attention, le quai a changé : ce n\'est plus le quai un, c\'est le quai trois» — нақты платформа дәл осы жерде расталады.',
        keywords: "quai numéro trois, le quai a changé, ce n'est plus le quai un",
        whyCorrect:
          'Хабарландыруда алдымен пойыз «quai numéro trois»-тен аттанатыны айтылады, содан кейін бұрын аталған платформаны түзету арқылы бұл нақты қайталанып расталады. Үшінші платформа екі рет аталады, бұл кез келген күмәнді жояды.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '1-платформа бастапқы платформа болған, бірақ хабарлаушы оны тікелей жояды: «ce n\'est plus le quai un» (бұл енді бірінші платформа емес).',
          },
          {
            optionId: "opt-b",
            reason:
              '2-платформа хабарландыруда мүлдем аталмайды — жазбада «deux» деген сан мүлдем кездеспейді.',
          },
          {
            optionId: "opt-d",
            reason:
              '8452 — бұл пойыздың нөмірі («le train numéro 8452»), платформа емес — платформа нөмірін хабарлаушы бөлек айтады: «quai numéro trois».',
          },
        ],
        vocabulary: [
          { term: "le quai", translation: "платформа (теміржол вокзалында)" },
          { term: "à destination de", translation: "бағыты ... / ...-ға бара жатқан" },
          { term: "les voyageurs", translation: "жолаушылар" },
        ],
        grammarPattern:
          'Болашақ шақ «partira» (кетеді) әлі болмағанын көрсетеді, ал «a changé» (өзгерді) тіркесі passé composé арқылы бастапқы жоспарға енгізілген аяқталған өзгерісті білдіреді — хабарландырулардағы түзетулерді байқау үшін осы шақ ауысуына құлақ түріңіз.',
        strategy:
          "Вокзал хабарландыруларында ақпарат көбіне алдымен беріледі, содан кейін бірден түзетіледі немесе нақтыланады. Егер басында бір санды естісеңіз, тыңдауды жалғастырыңыз — хабарландыру аяқталғанша ол өзгертілуі мүмкін.",
      },
    },
  },
};

const a1TrainQ2: QuestionSpec = {
  id: "a1-train-station-1-q2",
  recordingId: "a1-train-station-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What are the passengers traveling to Lyon asked to do now?",
      options: [
        { id: "opt-a", text: "Wait another ten minutes" },
        { id: "opt-b", text: "Go to platform one" },
        { id: "opt-c", text: "Board the train now" },
        { id: "opt-d", text: "Buy a ticket at the counter" },
      ],
      explanation: {
        whereInRecording:
          'The final instruction is direct: "Les voyageurs pour Lyon doivent monter maintenant" (passengers for Lyon must board now) — this comes right after the platform correction.',
        keywords: "doivent monter maintenant",
        whyCorrect:
          'The announcement\'s last sentence directly tells Lyon passengers to board immediately, using "maintenant" (now) rather than describing any waiting period.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Ten minutes was mentioned earlier as the time before departure ("partira ... dans dix minutes"), not as a waiting period before boarding — passengers are told to board right away, not wait.',
          },
          {
            optionId: "opt-b",
            reason:
              "Platform one is the platform that was cancelled and corrected earlier in the announcement, not an instruction for what to do now.",
          },
          {
            optionId: "opt-d",
            reason:
              "Buying a ticket is never mentioned anywhere in this announcement — it only covers the platform and boarding.",
          },
        ],
        vocabulary: [
          { term: "monter", translation: "to board / get on (a train)" },
          { term: "maintenant", translation: "now" },
        ],
        grammarPattern:
          '"Doivent monter" combines "devoir" + infinitive to express an obligation — a common structure for instructions and rules in French announcements.',
        strategy:
          "The last sentence of a short announcement is often the actual instruction to act on — pay special attention to what comes right at the end, even if the middle contains background details like times or corrections.",
      },
    },
    ru: {
      prompt: "Что просят сделать сейчас пассажиров, едущих в Лион?",
      options: [
        { id: "opt-a", text: "Подождать ещё десять минут" },
        { id: "opt-b", text: "Пройти на платформу один" },
        { id: "opt-c", text: "Сесть в поезд прямо сейчас" },
        { id: "opt-d", text: "Купить билет в кассе" },
      ],
      explanation: {
        whereInRecording:
          'Последняя инструкция звучит прямо: «Les voyageurs pour Lyon doivent monter maintenant» (пассажиры, едущие в Лион, должны сесть в поезд прямо сейчас) — это следует сразу после исправления номера платформы.',
        keywords: "doivent monter maintenant",
        whyCorrect:
          'Последнее предложение объявления прямо велит пассажирам в Лион сесть в поезд немедленно, со словом «maintenant» (сейчас), а не с указанием времени ожидания.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Десять минут упоминались раньше как время до отправления («partira ... dans dix minutes»), а не как время ожидания перед посадкой — пассажирам говорят садиться сразу, а не ждать.',
          },
          {
            optionId: "opt-b",
            reason:
              "Платформа один — это платформа, которая была отменена и исправлена ранее в объявлении, а не инструкция о том, что делать сейчас.",
          },
          {
            optionId: "opt-d",
            reason:
              "Покупка билета вообще не упоминается в этом объявлении — оно касается только платформы и посадки.",
          },
        ],
        vocabulary: [
          { term: "monter", translation: "сесть (в поезд) / подняться" },
          { term: "maintenant", translation: "сейчас" },
        ],
        grammarPattern:
          '«Doivent monter» сочетает «devoir» + инфинитив для выражения долженствования — это типичная конструкция для инструкций и правил во французских объявлениях.',
        strategy:
          "Последнее предложение короткого объявления часто содержит саму инструкцию к действию — обращайте особое внимание на то, что звучит в самом конце, даже если в середине есть второстепенные детали, такие как время или исправления.",
      },
    },
    kz: {
      prompt: "Лионға бара жатқан жолаушылардан қазір не істеу сұралады?",
      options: [
        { id: "opt-a", text: "Тағы он минут күту" },
        { id: "opt-b", text: "Бірінші платформаға бару" },
        { id: "opt-c", text: "Қазір пойызға отыру" },
        { id: "opt-d", text: "Кассадан билет сатып алу" },
      ],
      explanation: {
        whereInRecording:
          'Соңғы нұсқау тікелей айтылады: «Les voyageurs pour Lyon doivent monter maintenant» (Лионға бара жатқан жолаушылар қазір пойызға отыруы керек) — бұл платформа нөмірі түзетілгеннен кейін бірден келеді.',
        keywords: "doivent monter maintenant",
        whyCorrect:
          'Хабарландырудың соңғы сөйлемі Лионға бара жатқан жолаушыларға дереу пойызға отыруды тікелей бұйырады, «maintenant» (қазір) сөзімен, күту уақыты туралы емес.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Он минут бұрын жөнелу уақытына дейінгі уақыт ретінде аталған («partira ... dans dix minutes»), отыруға дейінгі күту уақыты емес — жолаушыларға күтпей, дереу отыру керек делінген.',
          },
          {
            optionId: "opt-b",
            reason:
              "Бірінші платформа — хабарландыруда бұрын жойылып, түзетілген платформа, қазір не істеу керектігі туралы нұсқау емес.",
          },
          {
            optionId: "opt-d",
            reason:
              "Билет сатып алу туралы бұл хабарландыруда мүлдем айтылмайды — онда тек платформа мен отыру туралы айтылады.",
          },
        ],
        vocabulary: [
          { term: "monter", translation: "пойызға отыру / көтерілу" },
          { term: "maintenant", translation: "қазір" },
        ],
        grammarPattern:
          '«Doivent monter» — «devoir» етістігі + инфинитив тіркесі, міндеттілікті білдіреді — бұл француз хабарландыруларындағы нұсқаулар мен ережелерге тән құрылым.',
        strategy:
          "Қысқа хабарландырудың соңғы сөйлемінде көбіне нақты әрекет ету нұсқауы болады — ортасында уақыт немесе түзету сияқты қосымша мәліметтер болса да, соңында айтылғанға ерекше назар аударыңыз.",
      },
    },
  },
};

const a1TrainQ3: QuestionSpec = {
  id: "a1-train-station-1-q3",
  recordingId: "a1-train-station-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "True or false: The Lyon train leaves from platform 1.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'The announcer corrects this directly: "ce n\'est plus le quai un, c\'est le quai trois" (it is no longer platform one, it is platform three).',
        keywords: "ce n'est plus le quai un, c'est le quai trois",
        whyCorrect:
          'This is false: platform one was the original plan, but the announcement explicitly cancels it and replaces it with platform three — "ce n\'est plus le quai un."',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'This would only be true if the platform hadn\'t changed — but the recording specifically announces a correction away from platform one.',
          },
        ],
        vocabulary: [
          { term: "ce n'est plus", translation: "it is no longer" },
          { term: "le quai", translation: "the platform" },
        ],
        grammarPattern:
          '"Ce n\'est plus" (negation + "plus") marks something that used to be true but no longer is — distinct from "ne ... jamais" (never), which would mean it was never platform one at all.',
        strategy:
          "For true/false questions built on a correction, listen for the exact word that got cancelled versus the word that replaced it — the statement will usually test whether you caught which one is now correct.",
      },
    },
    ru: {
      prompt: "Верно или неверно: поезд на Лион отправляется с платформы 1.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Диктор прямо это исправляет: «ce n\'est plus le quai un, c\'est le quai trois» (это больше не платформа один, это платформа три).',
        keywords: "ce n'est plus le quai un, c'est le quai trois",
        whyCorrect:
          'Это неверно: платформа один была первоначальным планом, но в объявлении она прямо отменяется и заменяется платформой три — «ce n\'est plus le quai un».',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'Это было бы верно, только если бы платформа не менялась — но в записи объявляется именно исправление от платформы один.',
          },
        ],
        vocabulary: [
          { term: "ce n'est plus", translation: "это больше не" },
          { term: "le quai", translation: "платформа" },
        ],
        grammarPattern:
          '«Ce n\'est plus» (отрицание + «plus») отмечает то, что раньше было верным, но уже не является таковым — в отличие от «ne ... jamais» (никогда), что означало бы, что это никогда не было платформой один.',
        strategy:
          "В вопросах верно/неверно, построенных на исправлении, слушайте точное слово, которое было отменено, и слово, которое его заменило — утверждение обычно проверяет, уловили ли вы, какое из них верно сейчас.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: Лион пойызы 1-платформадан аттанады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Хабарлаушы мұны тікелей түзетеді: «ce n\'est plus le quai un, c\'est le quai trois» (бұл енді бірінші платформа емес, бұл үшінші платформа).',
        keywords: "ce n'est plus le quai un, c'est le quai trois",
        whyCorrect:
          'Бұл бұрыс: бірінші платформа бастапқы жоспар болған, бірақ хабарландыруда ол нақты жойылып, үшінші платформамен ауыстырылады — «ce n\'est plus le quai un».',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              "Бұл тек платформа өзгермеген жағдайда ғана дұрыс болар еді — бірақ жазбада нақ бірінші платформадан бас тарту жарияланады.",
          },
        ],
        vocabulary: [
          { term: "ce n'est plus", translation: "бұл енді ... емес" },
          { term: "le quai", translation: "платформа" },
        ],
        grammarPattern:
          '«Ce n\'est plus» (болымсыздық + «plus») бұрын шындық болған, бірақ енді олай емес нәрсені білдіреді — бұл «ne ... jamais» (ешқашан) дегеннен өзгеше, ол ешқашан бірінші платформа болмағанын білдірер еді.',
        strategy:
          "Түзетуге негізделген дұрыс/бұрыс сұрақтарында жойылған сөз бен оны алмастырған сөзге мұқият құлақ түріңіз — тұжырым әдетте қазір қайсысы дұрыс екенін байқағаныңызды тексереді.",
      },
    },
  },
};

const a1CafeQ1: QuestionSpec = {
  id: "a1-cafe-order-1-q1",
  recordingId: "a1-cafe-order-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What drink does the customer order?",
      options: [
        { id: "opt-a", text: "Tea" },
        { id: "opt-b", text: "Coffee" },
        { id: "opt-c", text: "Hot chocolate" },
        { id: "opt-d", text: "Orange juice" },
      ],
      explanation: {
        whereInRecording:
          'When asked what he wants to drink, the customer replies directly: "Je voudrais un café, s\'il vous plaît."',
        keywords: "Je voudrais un café",
        whyCorrect:
          'The customer\'s own words name the drink directly — "un café" (a coffee) — with no ambiguity, right after the waiter\'s question "qu\'est-ce que vous voulez boire ?"',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Tea is never mentioned anywhere in this conversation." },
          {
            optionId: "opt-c",
            reason: "Hot chocolate doesn't appear in the dialogue at all — only coffee is ordered as a drink.",
          },
          {
            optionId: "opt-d",
            reason: "Orange juice is not mentioned; the only drink in the whole conversation is coffee.",
          },
        ],
        vocabulary: [
          { term: "je voudrais", translation: "I would like" },
          { term: "boire", translation: "to drink" },
          { term: "s'il vous plaît", translation: "please" },
        ],
        grammarPattern:
          '"Je voudrais" is the conditional of "vouloir," used to make a polite request — much softer than "je veux" (I want), and standard for ordering in cafés and restaurants.',
        strategy:
          'In ordering dialogues, the requested item is almost always stated right after a polite phrase like "je voudrais" — listen for that phrase and the noun that follows it.',
      },
    },
    ru: {
      prompt: "Какой напиток заказывает клиент?",
      options: [
        { id: "opt-a", text: "Чай" },
        { id: "opt-b", text: "Кофе" },
        { id: "opt-c", text: "Горячий шоколад" },
        { id: "opt-d", text: "Апельсиновый сок" },
      ],
      explanation: {
        whereInRecording:
          'На вопрос, что он хочет выпить, клиент отвечает прямо: «Je voudrais un café, s\'il vous plaît».',
        keywords: "Je voudrais un café",
        whyCorrect:
          'Сам клиент прямо называет напиток — «un café» (кофе) — без всякой двусмысленности, сразу после вопроса официанта «qu\'est-ce que vous voulez boire?».',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Чай вообще не упоминается в этом разговоре." },
          {
            optionId: "opt-c",
            reason: "Горячий шоколад в диалоге не встречается — единственный заказанный напиток — кофе.",
          },
          {
            optionId: "opt-d",
            reason: "Апельсиновый сок не упоминается; единственный напиток во всём разговоре — кофе.",
          },
        ],
        vocabulary: [
          { term: "je voudrais", translation: "я хотел(а) бы" },
          { term: "boire", translation: "пить" },
          { term: "s'il vous plaît", translation: "пожалуйста" },
        ],
        grammarPattern:
          '«Je voudrais» — это условное наклонение глагола «vouloir», используемое для вежливой просьбы — гораздо мягче, чем «je veux» (я хочу), и является стандартной формой заказа в кафе и ресторанах.',
        strategy:
          "В диалогах о заказе нужный предмет почти всегда называется сразу после вежливой фразы вроде «je voudrais» — прислушивайтесь к этой фразе и к существительному, которое следует за ней.",
      },
    },
    kz: {
      prompt: "Клиент қандай сусын тапсырыс береді?",
      options: [
        { id: "opt-a", text: "Шай" },
        { id: "opt-b", text: "Кофе" },
        { id: "opt-c", text: "Ыстық шоколад" },
        { id: "opt-d", text: "Апельсин шырыны" },
      ],
      explanation: {
        whereInRecording:
          'Не ішкісі келетінін сұрағанда, клиент тікелей жауап береді: «Je voudrais un café, s\'il vous plaît».',
        keywords: "Je voudrais un café",
        whyCorrect:
          'Клиенттің өз сөзінде сусын тікелей аталады — «un café» (кофе) — даяршының «qu\'est-ce que vous voulez boire?» деген сұрағынан кейін бірден, ешбір күмәнсіз.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Шай бұл әңгімеде мүлдем аталмайды." },
          {
            optionId: "opt-c",
            reason: "Ыстық шоколад диалогта мүлдем кездеспейді — тапсырыс берілген жалғыз сусын — кофе.",
          },
          {
            optionId: "opt-d",
            reason: "Апельсин шырыны аталмайды; бүкіл әңгімедегі жалғыз сусын — кофе.",
          },
        ],
        vocabulary: [
          { term: "je voudrais", translation: "мен қалар едім" },
          { term: "boire", translation: "ішу" },
          { term: "s'il vous plaît", translation: "өтінемін" },
        ],
        grammarPattern:
          '«Je voudrais» — «vouloir» етістігінің шартты райы, сыпайы өтініш білдіру үшін қолданылады — «je veux» (мен қалаймын) дегеннен әлдеқайда жұмсақ және кафе мен мейрамханада тапсырыс берудің стандартты түрі.',
        strategy:
          "Тапсырыс беру диалогтарында қажет зат «je voudrais» сияқты сыпайы тіркестен кейін бірден аталады — осы тіркеске және одан кейінгі зат есімге құлақ түріңіз.",
      },
    },
  },
};

const a1CafeQ2: QuestionSpec = {
  id: "a1-cafe-order-1-q2",
  recordingId: "a1-cafe-order-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "How much does the total order cost?",
      options: [
        { id: "opt-a", text: "4 euros" },
        { id: "opt-b", text: "4.50 euros" },
        { id: "opt-c", text: "5.50 euros" },
        { id: "opt-d", text: "14.50 euros" },
      ],
      explanation: {
        whereInRecording:
          'The waiter states the total clearly: "ça fait quatre euros cinquante" (that comes to four euros fifty).',
        keywords: "quatre euros cinquante",
        whyCorrect:
          'The waiter directly states the price as "quatre euros cinquante" — four euros and fifty cents — right after confirming the order of a coffee and a croissant.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'This drops the "cinquante" (fifty cents) that follows "quatre euros" — the full price includes those fifty cents.',
          },
          {
            optionId: "opt-c",
            reason:
              'This swaps the two numbers around: the waiter says "quatre euros cinquante" (four euros fifty), not "cinq euros cinquante" (five euros fifty).',
          },
          {
            optionId: "opt-d",
            reason:
              'This mishears "quatre" (four) as "quatorze" (fourteen) — the actual price is four euros fifty, not fourteen fifty.',
          },
        ],
        vocabulary: [
          { term: "ça fait", translation: "that comes to / that makes (a price)" },
          { term: "euros", translation: "euros" },
        ],
        grammarPattern:
          '"Ça fait" + a price is a fixed everyday expression for stating a total cost, very common in shops and cafés — worth memorizing as a set phrase rather than translating word for word.',
        strategy:
          'Numbers that sound alike in French ("quatre" vs. "quatorze", "quatre" vs. "cinq") are common exam traps — focus on syllable count and stress, and don\'t assume the first number you catch is correct without confirming the rest of the phrase.',
      },
    },
    ru: {
      prompt: "Сколько стоит весь заказ?",
      options: [
        { id: "opt-a", text: "4 евро" },
        { id: "opt-b", text: "4,50 евро" },
        { id: "opt-c", text: "5,50 евро" },
        { id: "opt-d", text: "14,50 евро" },
      ],
      explanation: {
        whereInRecording:
          'Официант чётко называет сумму: «ça fait quatre euros cinquante» (это выходит четыре евро пятьдесят).',
        keywords: "quatre euros cinquante",
        whyCorrect:
          'Официант прямо называет цену «quatre euros cinquante» — четыре евро и пятьдесят центов — сразу после подтверждения заказа кофе и круассана.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Здесь пропущено «cinquante» (пятьдесят центов), которое следует за «quatre euros» — полная цена включает эти пятьдесят центов.',
          },
          {
            optionId: "opt-c",
            reason:
              'Здесь переставлены местами цифры: официант говорит «quatre euros cinquante» (четыре евро пятьдесят), а не «cinq euros cinquante» (пять евро пятьдесят).',
          },
          {
            optionId: "opt-d",
            reason:
              'Здесь «quatre» (четыре) спутано с «quatorze» (четырнадцать) — настоящая цена — четыре евро пятьдесят, а не четырнадцать пятьдесят.',
          },
        ],
        vocabulary: [
          { term: "ça fait", translation: "это составляет / это выходит (о цене)" },
          { term: "euros", translation: "евро" },
        ],
        grammarPattern:
          '«Ça fait» + цена — это устойчивое повседневное выражение для называния итоговой стоимости, очень распространённое в магазинах и кафе — его стоит запомнить как цельную фразу, а не переводить дословно.',
        strategy:
          "Числа, похожие по звучанию во французском («quatre» и «quatorze», «quatre» и «cinq»), — частая ловушка на экзамене: обращайте внимание на количество слогов и ударение и не считайте первое услышанное число окончательным, не проверив остальную часть фразы.",
      },
    },
    kz: {
      prompt: "Барлық тапсырыс қанша тұрады?",
      options: [
        { id: "opt-a", text: "4 евро" },
        { id: "opt-b", text: "4,50 евро" },
        { id: "opt-c", text: "5,50 евро" },
        { id: "opt-d", text: "14,50 евро" },
      ],
      explanation: {
        whereInRecording:
          'Даяршы соманы анық айтады: «ça fait quatre euros cinquante» (бұл төрт евро елу цент болады).',
        keywords: "quatre euros cinquante",
        whyCorrect:
          'Даяршы кофе мен круассанның тапсырысын растағаннан кейін бірден бағаны тікелей айтады: «quatre euros cinquante» — төрт евро елу цент.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Мұнда «quatre euros»-тан кейін келетін «cinquante» (елу цент) түсіп қалған — толық баға осы елу центті қамтиды.',
          },
          {
            optionId: "opt-c",
            reason:
              'Мұнда сандар ауыстырылған: даяршы «quatre euros cinquante» (төрт евро елу) дейді, «cinq euros cinquante» (бес евро елу) емес.',
          },
          {
            optionId: "opt-d",
            reason:
              'Мұнда «quatre» (төрт) «quatorze» (он төрт) деп қате естілген — нақты баға он төрт елу емес, төрт евро елу.',
          },
        ],
        vocabulary: [
          { term: "ça fait", translation: "бұл ... болады (баға туралы)" },
          { term: "euros", translation: "еуро" },
        ],
        grammarPattern:
          '«Ça fait» + баға — жалпы сомманы айту үшін қолданылатын тұрақты күнделікті тіркес, дүкендер мен кафелерде жиі кездеседі — оны сөзбе-сөз аудармай, тұтас тіркес ретінде жаттап алған жөн.',
        strategy:
          "Француз тілінде естілуі ұқсас сандар («quatre» мен «quatorze», «quatre» мен «cinq») емтиханда жиі тұзаққа түсіреді — буын санына және екпінге назар аударыңыз және тіркестің қалған бөлігін тексермей, алғаш естіген санды дұрыс деп есептемеңіз.",
      },
    },
  },
};

const a1CafeQ3: QuestionSpec = {
  id: "a1-cafe-order-1-q3",
  recordingId: "a1-cafe-order-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which items does the customer actually order? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "A coffee" },
        { id: "opt-b", text: "A pain au chocolat" },
        { id: "opt-c", text: "A croissant" },
        { id: "opt-d", text: "A tea" },
      ],
      explanation: {
        whereInRecording:
          'The customer orders a coffee first ("Je voudrais un café, s\'il vous plaît"), then adds a croissant after the waiter mentions it has one ("Alors, un croissant aussi, merci").',
        keywords: "Je voudrais un café; un croissant aussi",
        whyCorrect:
          'The customer names exactly two items across the conversation — "un café" for the drink, and "un croissant" once he confirms the café has some — nothing else is added to the order.',
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'The waiter mentions "des pains au chocolat" as another option available, but the customer never orders one — he only asks for and orders a croissant.',
          },
          {
            optionId: "opt-d",
            reason: "Tea is never mentioned anywhere in this conversation.",
          },
        ],
        vocabulary: [
          { term: "aussi", translation: "also / too" },
          { term: "avec ça", translation: "with that / anything else" },
        ],
        grammarPattern:
          '"Alors, un croissant aussi" drops the verb entirely — a very common shortcut in spoken French ordering, where the noun alone stands in for "je voudrais un croissant aussi."',
        strategy:
          'For "select all that apply" questions, list every item actually named by the customer as it\'s ordered, and separately note items merely mentioned as available by the waiter — only the former count as part of the order.',
      },
    },
    ru: {
      prompt: "Что из перечисленного клиент действительно заказывает? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Кофе" },
        { id: "opt-b", text: "Пан-о-шоколя" },
        { id: "opt-c", text: "Круассан" },
        { id: "opt-d", text: "Чай" },
      ],
      explanation: {
        whereInRecording:
          'Клиент сначала заказывает кофе («Je voudrais un café, s\'il vous plaît»), а затем добавляет круассан, после того как официант упоминает, что он есть («Alors, un croissant aussi, merci»).',
        keywords: "Je voudrais un café; un croissant aussi",
        whyCorrect:
          'Клиент называет ровно два предмета за весь разговор — «un café» для напитка и «un croissant», как только он узнаёт, что круассаны есть, — ничего больше в заказ не добавляется.',
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'Официант упоминает «des pains au chocolat» как ещё один доступный вариант, но клиент его так и не заказывает — он просит и заказывает только круассан.',
          },
          {
            optionId: "opt-d",
            reason: "Чай вообще не упоминается в этом разговоре.",
          },
        ],
        vocabulary: [
          { term: "aussi", translation: "также / тоже" },
          { term: "avec ça", translation: "с этим / что-нибудь ещё" },
        ],
        grammarPattern:
          '«Alors, un croissant aussi» полностью опускает глагол — очень распространённое сокращение в разговорном французском при заказе, когда одно существительное заменяет «je voudrais un croissant aussi».',
        strategy:
          "В вопросах «выберите все подходящие варианты» перечисляйте каждый предмет, который клиент реально называет при заказе, и отдельно отмечайте предметы, которые официант лишь упоминает как имеющиеся в наличии — в заказ входят только первые.",
      },
    },
    kz: {
      prompt: "Клиент нақты нені тапсырыс береді? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Кофе" },
        { id: "opt-b", text: "Шоколадты тоқаш (pain au chocolat)" },
        { id: "opt-c", text: "Круассан" },
        { id: "opt-d", text: "Шай" },
      ],
      explanation: {
        whereInRecording:
          'Клиент алдымен кофе тапсырыс береді («Je voudrais un café, s\'il vous plaît»), содан кейін даяршы круассан бар екенін айтқаннан кейін оны да қосады («Alors, un croissant aussi, merci»).',
        keywords: "Je voudrais un café; un croissant aussi",
        whyCorrect:
          'Клиент бүкіл әңгіме бойы дәл екі затты атайды — сусын үшін «un café» және круассан бар екенін білгеннен кейін «un croissant» — тапсырысқа басқа ешнәрсе қосылмайды.',
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'Даяршы «des pains au chocolat» дегенді тағы бір қолжетімді нұсқа ретінде айтады, бірақ клиент оны тапсырыс бермейді — ол тек круассан сұрайды әрі тапсырыс береді.',
          },
          {
            optionId: "opt-d",
            reason: "Шай бұл әңгімеде мүлдем аталмайды.",
          },
        ],
        vocabulary: [
          { term: "aussi", translation: "сонымен қатар / да" },
          { term: "avec ça", translation: "онымен бірге / тағы басқа" },
        ],
        grammarPattern:
          '«Alors, un croissant aussi» етістікті мүлдем түсіріп тастайды — бұл ауызша француз тілінде тапсырыс беру кезінде өте жиі кездесетін қысқарту, мұнда жалғыз зат есім «je voudrais un croissant aussi» дегенді алмастырады.',
        strategy:
          "«Барлық сәйкес нұсқаларды таңдаңыз» сұрақтарында клиент тапсырыс беру кезінде нақты атаған әрбір затты тізіп, даяршы тек қолжетімді деп атаған заттарды бөлек белгілеңіз — тек біріншілері тапсырыс құрамына кіреді.",
      },
    },
  },
};

const a1SchoolQ1: QuestionSpec = {
  id: "a1-school-timetable-1-q1",
  recordingId: "a1-school-timetable-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What subject does Lucas have at eight o'clock on Monday?",
      options: [
        { id: "opt-a", text: "Mathematics" },
        { id: "opt-b", text: "Sport" },
        { id: "opt-c", text: "French" },
        { id: "opt-d", text: "Art" },
      ],
      explanation: {
        whereInRecording:
          'Lucas states his Monday schedule directly: "Le lundi, j\'ai mathématiques à huit heures et sport à dix heures."',
        keywords: "j'ai mathématiques à huit heures",
        whyCorrect:
          'Lucas names mathematics as the subject at eight o\'clock — "mathématiques à huit heures" — with sport following later at ten.',
        whyIncorrect: [
          { optionId: "opt-b", reason: "Sport is at ten o'clock according to Lucas, not eight." },
          { optionId: "opt-c", reason: "French is the subject Madame Petit teaches, not something scheduled at eight o'clock." },
          { optionId: "opt-d", reason: "Art is never mentioned anywhere in the recording." },
        ],
        vocabulary: [
          { term: "les mathématiques", translation: "mathematics" },
          { term: "le lundi", translation: "on Mondays" },
        ],
        grammarPattern:
          '"Le lundi" (with the definite article, no preposition) means "on Mondays" as a repeated habit, unlike "lundi" alone, which would mean "this Monday" specifically.',
        strategy:
          "When a short monologue lists two subjects with two different times, attach each subject to its time as you hear it — the exam often swaps which subject goes with which hour.",
      },
    },
    ru: {
      prompt: "Какой предмет у Люка в понедельник в восемь часов?",
      options: [
        { id: "opt-a", text: "Математика" },
        { id: "opt-b", text: "Спорт" },
        { id: "opt-c", text: "Французский язык" },
        { id: "opt-d", text: "Рисование" },
      ],
      explanation: {
        whereInRecording:
          'Люка прямо называет своё расписание на понедельник: «Le lundi, j\'ai mathématiques à huit heures et sport à dix heures».',
        keywords: "j'ai mathématiques à huit heures",
        whyCorrect:
          'Люка называет математику предметом в восемь часов — «mathématiques à huit heures», а спорт идёт позже, в десять.',
        whyIncorrect: [
          { optionId: "opt-b", reason: "Спорт у Люка в десять часов, а не в восемь." },
          { optionId: "opt-c", reason: "Французский — предмет, который преподаёт мадам Пти, а не то, что стоит в расписании на восемь часов." },
          { optionId: "opt-d", reason: "Рисование вообще не упоминается в записи." },
        ],
        vocabulary: [
          { term: "les mathématiques", translation: "математика" },
          { term: "le lundi", translation: "по понедельникам" },
        ],
        grammarPattern:
          '«Le lundi» (с определённым артиклем, без предлога) означает «по понедельникам» как повторяющуюся привычку, в отличие от просто «lundi», что означало бы именно «в этот понедельник».',
        strategy:
          "Когда в коротком монологе перечисляются два предмета с двумя разными временами, связывайте каждый предмет с его временем сразу, как только услышите — экзамен часто меняет местами, какой предмет идёт с каким часом.",
      },
    },
    kz: {
      prompt: "Дүйсенбіде сағат сегізде Люканың қандай сабағы бар?",
      options: [
        { id: "opt-a", text: "Математика" },
        { id: "opt-b", text: "Дене шынықтыру" },
        { id: "opt-c", text: "Француз тілі" },
        { id: "opt-d", text: "Сурет салу" },
      ],
      explanation: {
        whereInRecording:
          'Люка дүйсенбілік кестесін тікелей айтады: «Le lundi, j\'ai mathématiques à huit heures et sport à dix heures».',
        keywords: "j'ai mathématiques à huit heures",
        whyCorrect:
          'Люка сағат сегіздегі сабақ ретінде математиканы атайды — «mathématiques à huit heures», ал дене шынықтыру кейінірек, сағат онда.',
        whyIncorrect: [
          { optionId: "opt-b", reason: "Дене шынықтыру Люкада сағат онда, сегізде емес." },
          { optionId: "opt-c", reason: "Француз тілі — мадам Пти оқытатын сабақ, сегіз сағатқа қойылған сабақ емес." },
          { optionId: "opt-d", reason: "Сурет салу жазбада мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "les mathématiques", translation: "математика" },
          { term: "le lundi", translation: "дүйсенбі сайын" },
        ],
        grammarPattern:
          '«Le lundi» (белгілі артикльмен, предлогсыз) «дүйсенбі сайын» деген қайталанатын әдетті білдіреді, ал жалаң «lundi» нақты «осы дүйсенбіні» білдірер еді.',
        strategy:
          "Қысқа монологта екі түрлі уақыты бар екі сабақ аталғанда, естіген сайын әр сабақты өз уақытымен байланыстырыңыз — емтихан көбіне қай сабақ қай сағатқа сәйкес келетінін ауыстырып жібереді.",
      },
    },
  },
};

const a1SchoolQ2: QuestionSpec = {
  id: "a1-school-timetable-1-q2",
  recordingId: "a1-school-timetable-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "easy",
  skillTag: "date",
  content: {
    en: {
      prompt: "True or false: Lucas has no afternoon class on Wednesdays.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'Lucas states this directly: "Le mercredi, je n\'ai pas classe l\'après-midi."',
        keywords: "Le mercredi, je n'ai pas classe l'après-midi",
        whyCorrect:
          'This is true: Lucas says exactly "je n\'ai pas classe l\'après-midi" (I have no class in the afternoon) about Wednesday.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason: 'This contradicts Lucas\'s own statement, where he clearly says he has no class on Wednesday afternoon.',
          },
        ],
        vocabulary: [
          { term: "l'après-midi", translation: "the afternoon" },
          { term: "je n'ai pas classe", translation: "I don't have class" },
        ],
        grammarPattern:
          '"Je n\'ai pas classe" drops the article before "classe" in this fixed expression — French often omits the article in set phrases about school ("avoir classe," "avoir cours").',
        strategy:
          "For true/false questions about a schedule, match the day named in the statement to the exact day named in the recording — don't assume a nearby day (like Monday or Friday) carries the same detail.",
      },
    },
    ru: {
      prompt: "Верно или неверно: по средам после обеда у Люка нет уроков.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Люка прямо это говорит: «Le mercredi, je n\'ai pas classe l\'après-midi».',
        keywords: "Le mercredi, je n'ai pas classe l'après-midi",
        whyCorrect:
          'Это верно: Люка говорит именно «je n\'ai pas classe l\'après-midi» (у меня нет уроков после обеда) о среде.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason: "Это противоречит собственным словам Люка, который чётко говорит, что в среду после обеда у него нет уроков.",
          },
        ],
        vocabulary: [
          { term: "l'après-midi", translation: "после обеда / во второй половине дня" },
          { term: "je n'ai pas classe", translation: "у меня нет уроков" },
        ],
        grammarPattern:
          '«Je n\'ai pas classe» опускает артикль перед «classe» в этом устойчивом выражении — французский часто опускает артикль в фиксированных фразах о школе («avoir classe», «avoir cours»).',
        strategy:
          "В вопросах верно/неверно о расписании сопоставляйте день, названный в утверждении, с точным днём, названным в записи — не считайте, что соседний день (например, понедельник или пятница) имеет ту же деталь.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: сәрсенбіде түстен кейін Люканың сабағы жоқ.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Люка мұны тікелей айтады: «Le mercredi, je n\'ai pas classe l\'après-midi».',
        keywords: "Le mercredi, je n'ai pas classe l'après-midi",
        whyCorrect:
          'Бұл дұрыс: Люка сәрсенбі туралы дәл «je n\'ai pas classe l\'après-midi» (түстен кейін сабағым жоқ) дейді.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason: "Бұл Люканың сәрсенбі түстен кейін сабағы жоқ екенін анық айтқан өз сөзіне қайшы келеді.",
          },
        ],
        vocabulary: [
          { term: "l'après-midi", translation: "түстен кейін" },
          { term: "je n'ai pas classe", translation: "менің сабағым жоқ" },
        ],
        grammarPattern:
          '«Je n\'ai pas classe» осы тұрақты тіркесте «classe» алдындағы артикльді түсіреді — француз тілінде мектеп туралы тұрақты тіркестерде артикль жиі түсіріледі («avoir classe», «avoir cours»).',
        strategy:
          "Кесте туралы дұрыс/бұрыс сұрақтарында тұжырымда аталған күнді жазбада нақты аталған күнмен салыстырыңыз — көрші күннің (мысалы, дүйсенбі немесе жұма) да сол детальді қамтитынын болжамаңыз.",
      },
    },
  },
};

const a1SchoolQ3: QuestionSpec = {
  id: "a1-school-timetable-1-q3",
  recordingId: "a1-school-timetable-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "vocabulary",
  content: {
    en: {
      prompt: "What subject does Lucas's teacher, Madame Petit, teach?",
      options: [
        { id: "opt-a", text: "Mathematics" },
        { id: "opt-b", text: "French" },
        { id: "opt-c", text: "Sport" },
        { id: "opt-d", text: "English" },
      ],
      explanation: {
        whereInRecording:
          'Lucas names both his teacher and her subject in one sentence: "Ma maîtresse s\'appelle madame Petit, elle enseigne le français."',
        keywords: "elle enseigne le français",
        whyCorrect:
          'Lucas directly states "elle enseigne le français" (she teaches French) right after naming his teacher as Madame Petit.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Mathematics is a subject Lucas has, but the recording never says Madame Petit teaches it." },
          { optionId: "opt-c", reason: "Sport is also on Lucas's schedule, but it isn't linked to Madame Petit in the recording." },
          { optionId: "opt-d", reason: "English is never mentioned anywhere in this recording." },
        ],
        vocabulary: [
          { term: "la maîtresse", translation: "the (female) teacher (primary school)" },
          { term: "enseigner", translation: "to teach" },
        ],
        grammarPattern:
          '"Elle enseigne le français" uses the simple present to state a fact about someone\'s profession or role — very common in short descriptive monologues at this level.',
        strategy:
          "When a name and a fact are given back to back in the same sentence, treat them as directly linked — the exam may separate an unrelated subject mentioned earlier and attach it to that name as a wrong-answer trap.",
      },
    },
    ru: {
      prompt: "Какой предмет преподаёт учительница Люка, мадам Пти?",
      options: [
        { id: "opt-a", text: "Математику" },
        { id: "opt-b", text: "Французский язык" },
        { id: "opt-c", text: "Спорт" },
        { id: "opt-d", text: "Английский язык" },
      ],
      explanation: {
        whereInRecording:
          'Люка называет и учительницу, и её предмет в одном предложении: «Ma maîtresse s\'appelle madame Petit, elle enseigne le français».',
        keywords: "elle enseigne le français",
        whyCorrect:
          'Люка прямо говорит «elle enseigne le français» (она преподаёт французский) сразу после того, как называет свою учительницу мадам Пти.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Математика — предмет, который есть у Люка, но в записи не сказано, что его преподаёт мадам Пти." },
          { optionId: "opt-c", reason: "Спорт тоже есть в расписании Люка, но в записи он не связан с мадам Пти." },
          { optionId: "opt-d", reason: "Английский язык вообще не упоминается в этой записи." },
        ],
        vocabulary: [
          { term: "la maîtresse", translation: "учительница (начальная школа)" },
          { term: "enseigner", translation: "преподавать" },
        ],
        grammarPattern:
          '«Elle enseigne le français» использует настоящее простое время, чтобы констатировать факт о чьей-то профессии или роли — очень типично для коротких описательных монологов на этом уровне.',
        strategy:
          "Когда имя и факт даются подряд в одном предложении, считайте их напрямую связанными — экзамен может взять несвязанный предмет, упомянутый ранее, и приписать его этому имени как ловушку неправильного ответа.",
      },
    },
    kz: {
      prompt: "Люканың мұғалімі мадам Пти қандай пәнді оқытады?",
      options: [
        { id: "opt-a", text: "Математиканы" },
        { id: "opt-b", text: "Француз тілін" },
        { id: "opt-c", text: "Дене шынықтыруды" },
        { id: "opt-d", text: "Ағылшын тілін" },
      ],
      explanation: {
        whereInRecording:
          'Люка мұғалімін де, оның пәнін де бір сөйлемде атайды: «Ma maîtresse s\'appelle madame Petit, elle enseigne le français».',
        keywords: "elle enseigne le français",
        whyCorrect:
          'Люка мұғалімін мадам Пти деп атағаннан кейін бірден «elle enseigne le français» (ол француз тілін оқытады) деп тікелей айтады.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Математика — Люканың сабағы, бірақ жазбада оны мадам Пти оқытады деп айтылмайды." },
          { optionId: "opt-c", reason: "Дене шынықтыру да Люканың кестесінде бар, бірақ жазбада ол мадам Птиге байланыстырылмаған." },
          { optionId: "opt-d", reason: "Ағылшын тілі бұл жазбада мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "la maîtresse", translation: "мұғалім (бастауыш мектеп, әйел)" },
          { term: "enseigner", translation: "оқыту" },
        ],
        grammarPattern:
          '«Elle enseigne le français» біреудің кәсібі немесе рөлі туралы факт беру үшін жай осы шақты қолданады — бұл деңгейдегі қысқа сипаттама монологтарда өте жиі кездеседі.',
        strategy:
          "Есім мен факт бір сөйлемде қатар берілгенде, оларды тікелей байланысты деп қараңыз — емтихан бұрын аталған қатыссыз пәнді осы есіммен байланыстырып, қате жауап тұзағын жасауы мүмкін.",
      },
    },
  },
};

const a1FamilyQ1: QuestionSpec = {
  id: "a1-family-introduction-1-q1",
  recordingId: "a1-family-introduction-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "number",
  content: {
    en: {
      prompt: "How many people are in Léa's family?",
      options: [
        { id: "opt-a", text: "Two" },
        { id: "opt-b", text: "Three" },
        { id: "opt-c", text: "Four" },
        { id: "opt-d", text: "Five" },
      ],
      explanation: {
        whereInRecording:
          'Léa states this directly: "Dans ma famille, nous sommes quatre : mon père, ma mère, mon frère et moi."',
        keywords: "nous sommes quatre",
        whyCorrect:
          'Léa says "nous sommes quatre" (there are four of us) and then lists exactly four people: father, mother, brother, and herself.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Two is far fewer than the four family members Léa actually lists." },
          { optionId: "opt-b", reason: "Three would leave out one of the four people Léa names — she lists her father, mother, brother, and herself." },
          { optionId: "opt-d", reason: "Five is one more than Léa states; her grandmother, mentioned later, doesn't live in the same household." },
        ],
        vocabulary: [
          { term: "la famille", translation: "the family" },
          { term: "le frère", translation: "the brother" },
        ],
        grammarPattern:
          '"Nous sommes quatre" uses "être" + a number to state a group\'s size — a simple, very common structure for counting people in French.',
        strategy:
          "When a speaker gives a total number and then lists names, count the listed names as a check — the exam may test a number that doesn't match a list given right after it.",
      },
    },
    ru: {
      prompt: "Сколько человек в семье Леа?",
      options: [
        { id: "opt-a", text: "Двое" },
        { id: "opt-b", text: "Трое" },
        { id: "opt-c", text: "Четверо" },
        { id: "opt-d", text: "Пятеро" },
      ],
      explanation: {
        whereInRecording:
          'Леа прямо говорит: «Dans ma famille, nous sommes quatre : mon père, ma mère, mon frère et moi».',
        keywords: "nous sommes quatre",
        whyCorrect:
          'Леа говорит «nous sommes quatre» (нас четверо), а затем перечисляет ровно четырёх человек: отца, мать, брата и себя.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Двое — это гораздо меньше, чем четыре члена семьи, которых на самом деле перечисляет Леа." },
          { optionId: "opt-b", reason: "Трое не учитывало бы одного из четырёх названных Леа человек — она называет отца, мать, брата и себя." },
          { optionId: "opt-d", reason: "Пятеро — на одного больше, чем говорит Леа; её бабушка, упомянутая позже, не живёт в этой же семье." },
        ],
        vocabulary: [
          { term: "la famille", translation: "семья" },
          { term: "le frère", translation: "брат" },
        ],
        grammarPattern:
          '«Nous sommes quatre» использует «être» + число для указания размера группы — простая и очень распространённая конструкция для подсчёта людей во французском.',
        strategy:
          "Когда говорящий называет общее число, а затем перечисляет имена, посчитайте перечисленные имена в качестве проверки — экзамен может проверить число, не совпадающее со списком, данным сразу после него.",
      },
    },
    kz: {
      prompt: "Леаның отбасында неше адам бар?",
      options: [
        { id: "opt-a", text: "Екеу" },
        { id: "opt-b", text: "Үшеу" },
        { id: "opt-c", text: "Төртеу" },
        { id: "opt-d", text: "Бесеу" },
      ],
      explanation: {
        whereInRecording:
          'Леа мұны тікелей айтады: «Dans ma famille, nous sommes quatre : mon père, ma mère, mon frère et moi».',
        keywords: "nous sommes quatre",
        whyCorrect:
          'Леа «nous sommes quatre» (біз төртеуміз) дейді, содан кейін нақ төрт адамды тізеді: әкесі, анасы, ағасы және өзі.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Екеу деген Леа нақты тізген төрт отбасы мүшесінен әлдеқайда аз." },
          { optionId: "opt-b", reason: "Үшеу Леа атаған төрт адамның бірін қалдырып кетер еді — ол әкесін, анасын, ағасын және өзін атайды." },
          { optionId: "opt-d", reason: "Бесеу Леа айтқаннан бір артық; кейінірек аталған әжесі бір үйде тұрмайды." },
        ],
        vocabulary: [
          { term: "la famille", translation: "отбасы" },
          { term: "le frère", translation: "аға / іні" },
        ],
        grammarPattern:
          '«Nous sommes quatre» топтың санын білдіру үшін «être» + санды қолданады — адамдарды санаудың қарапайым әрі кең тараған француз тіліндегі құрылымы.',
        strategy:
          "Сөйлеуші жалпы санды айтып, содан кейін есімдерді тізгенде, тексеру үшін тізілген есімдерді санаңыз — емтихан содан кейін берілген тізіммен сәйкес келмейтін санды тексеруі мүмкін.",
      },
    },
  },
};

const a1FamilyQ2: QuestionSpec = {
  id: "a1-family-introduction-1-q2",
  recordingId: "a1-family-introduction-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What does Léa's brother Paul like?",
      options: [
        { id: "opt-a", text: "Football" },
        { id: "opt-b", text: "Music" },
        { id: "opt-c", text: "Cooking" },
        { id: "opt-d", text: "Reading" },
      ],
      explanation: {
        whereInRecording:
          'Léa states this directly: "Mon frère s\'appelle Paul, il a douze ans, et il aime le football."',
        keywords: "il aime le football",
        whyCorrect:
          'Léa says "il aime le football" (he likes football) right after naming her brother Paul and his age.',
        whyIncorrect: [
          { optionId: "opt-b", reason: "Music is what Léa herself likes, not her brother Paul — she says this about herself in the next sentence." },
          { optionId: "opt-c", reason: "Cooking is never mentioned anywhere in the recording." },
          { optionId: "opt-d", reason: "Reading is never mentioned anywhere in the recording." },
        ],
        vocabulary: [
          { term: "aimer", translation: "to like / to love" },
          { term: "le football", translation: "football / soccer" },
        ],
        grammarPattern:
          '"Il aime le football" uses "aimer" + a definite article + noun to express liking something in general — French keeps the article here, unlike English "he likes football."',
        strategy:
          "When a monologue describes several family members in a row, each one is usually given exactly one distinguishing preference — don't let the sibling's detail and the speaker's own detail blend together.",
      },
    },
    ru: {
      prompt: "Что любит брат Леа, Поль?",
      options: [
        { id: "opt-a", text: "Футбол" },
        { id: "opt-b", text: "Музыку" },
        { id: "opt-c", text: "Готовку" },
        { id: "opt-d", text: "Чтение" },
      ],
      explanation: {
        whereInRecording:
          'Леа прямо говорит: «Mon frère s\'appelle Paul, il a douze ans, et il aime le football».',
        keywords: "il aime le football",
        whyCorrect:
          'Леа говорит «il aime le football» (он любит футбол) сразу после того, как называет своего брата Поля и его возраст.',
        whyIncorrect: [
          { optionId: "opt-b", reason: "Музыку любит сама Леа, а не её брат Поль — об этом она говорит о себе в следующем предложении." },
          { optionId: "opt-c", reason: "Готовка вообще не упоминается в записи." },
          { optionId: "opt-d", reason: "Чтение вообще не упоминается в записи." },
        ],
        vocabulary: [
          { term: "aimer", translation: "любить" },
          { term: "le football", translation: "футбол" },
        ],
        grammarPattern:
          '«Il aime le football» использует «aimer» + определённый артикль + существительное, чтобы выразить общую симпатию к чему-либо — французский сохраняет здесь артикль, в отличие от русского «он любит футбол».',
        strategy:
          "Когда в монологе подряд описываются несколько членов семьи, каждому обычно даётся ровно одна отличительная деталь-предпочтение — не путайте деталь о брате с деталью о самой говорящей.",
      },
    },
    kz: {
      prompt: "Леаның ағасы Поль нені жақсы көреді?",
      options: [
        { id: "opt-a", text: "Футболды" },
        { id: "opt-b", text: "Музыканы" },
        { id: "opt-c", text: "Тамақ пісіруді" },
        { id: "opt-d", text: "Кітап оқуды" },
      ],
      explanation: {
        whereInRecording:
          'Леа мұны тікелей айтады: «Mon frère s\'appelle Paul, il a douze ans, et il aime le football».',
        keywords: "il aime le football",
        whyCorrect:
          'Леа ағасы Польды және оның жасын атағаннан кейін бірден «il aime le football» (ол футболды жақсы көреді) дейді.',
        whyIncorrect: [
          { optionId: "opt-b", reason: "Музыканы Леаның өзі жақсы көреді, ағасы Поль емес — ол мұны келесі сөйлемде өзі туралы айтады." },
          { optionId: "opt-c", reason: "Тамақ пісіру жазбада мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Кітап оқу жазбада мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "aimer", translation: "жақсы көру" },
          { term: "le football", translation: "футбол" },
        ],
        grammarPattern:
          '«Il aime le football» жалпы бір нәрсені жақсы көруді білдіру үшін «aimer» + белгілі артикль + зат есімді қолданады — француз тілінде мұнда артикль сақталады.',
        strategy:
          "Монологта қатарынан бірнеше отбасы мүшесі сипатталғанда, әрқайсысына әдетте бір ғана ерекшелейтін қалау беріледі — бауырластың деталін сөйлеушінің өз деталімен шатастырмаңыз.",
      },
    },
  },
};

const a1FamilyQ3: QuestionSpec = {
  id: "a1-family-introduction-1-q3",
  recordingId: "a1-family-introduction-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-d"],
  difficulty: "medium",
  skillTag: "date",
  content: {
    en: {
      prompt: "When does the whole family eat together, according to Léa?",
      options: [
        { id: "opt-a", text: "Every evening" },
        { id: "opt-b", text: "On Wednesdays" },
        { id: "opt-c", text: "On Saturdays" },
        { id: "opt-d", text: "On Sundays" },
      ],
      explanation: {
        whereInRecording:
          'Léa ends her description with: "Le dimanche, toute la famille mange ensemble chez ma grand-mère."',
        keywords: "Le dimanche, toute la famille mange ensemble",
        whyCorrect:
          'Léa clearly states "le dimanche" (on Sundays) as the day the whole family eats together at her grandmother\'s.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Léa specifies one particular day, not every evening — the recording never mentions a daily gathering." },
          { optionId: "opt-b", reason: "Wednesday is never mentioned anywhere in this recording." },
          { optionId: "opt-c", reason: "Saturday is never mentioned anywhere in this recording." },
        ],
        vocabulary: [
          { term: "toute la famille", translation: "the whole family" },
          { term: "ensemble", translation: "together" },
        ],
        grammarPattern:
          '"Le dimanche" (definite article + day, no preposition) expresses a weekly habit — "every Sunday" — the same pattern seen with "le lundi" in other recordings.',
        strategy:
          "The last sentence of a short family description often adds a new detail (here, a weekly ritual) that isn't covered by the earlier sentences — don't stop listening once the family members have all been introduced.",
      },
    },
    ru: {
      prompt: "Когда, по словам Леа, вся семья ест вместе?",
      options: [
        { id: "opt-a", text: "Каждый вечер" },
        { id: "opt-b", text: "По средам" },
        { id: "opt-c", text: "По субботам" },
        { id: "opt-d", text: "По воскресеньям" },
      ],
      explanation: {
        whereInRecording:
          'Леа завершает свой рассказ словами: «Le dimanche, toute la famille mange ensemble chez ma grand-mère».',
        keywords: "Le dimanche, toute la famille mange ensemble",
        whyCorrect:
          'Леа чётко называет «le dimanche» (по воскресеньям) как день, когда вся семья ест вместе у бабушки.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Леа называет один конкретный день, а не каждый вечер — в записи ни разу не упоминается ежедневный сбор." },
          { optionId: "opt-b", reason: "Среда вообще не упоминается в этой записи." },
          { optionId: "opt-c", reason: "Суббота вообще не упоминается в этой записи." },
        ],
        vocabulary: [
          { term: "toute la famille", translation: "вся семья" },
          { term: "ensemble", translation: "вместе" },
        ],
        grammarPattern:
          '«Le dimanche» (определённый артикль + день, без предлога) выражает еженедельную привычку — «каждое воскресенье» — та же модель, что и «le lundi» в других записях.',
        strategy:
          "Последнее предложение короткого описания семьи часто добавляет новую деталь (здесь — еженедельный ритуал), которая не была упомянута раньше, — не переставайте слушать, как только все члены семьи представлены.",
      },
    },
    kz: {
      prompt: "Леаның айтуынша, бүкіл отбасы қашан бірге тамақтанады?",
      options: [
        { id: "opt-a", text: "Күн сайын кешке" },
        { id: "opt-b", text: "Сәрсенбі сайын" },
        { id: "opt-c", text: "Сенбі сайын" },
        { id: "opt-d", text: "Жексенбі сайын" },
      ],
      explanation: {
        whereInRecording:
          'Леа сипаттамасын мынамен аяқтайды: «Le dimanche, toute la famille mange ensemble chez ma grand-mère».',
        keywords: "Le dimanche, toute la famille mange ensemble",
        whyCorrect:
          'Леа бүкіл отбасы әжесінде бірге тамақтанатын күн ретінде «le dimanche» (жексенбі сайын) дейді.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Леа күн сайын емес, нақты бір күнді атайды — жазбада күнделікті жиналу мүлдем аталмайды." },
          { optionId: "opt-b", reason: "Сәрсенбі бұл жазбада мүлдем аталмайды." },
          { optionId: "opt-c", reason: "Сенбі бұл жазбада мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "toute la famille", translation: "бүкіл отбасы" },
          { term: "ensemble", translation: "бірге" },
        ],
        grammarPattern:
          '«Le dimanche» (белгілі артикль + күн, предлогсыз) апта сайынғы әдетті білдіреді — «жексенбі сайын» — басқа жазбалардағы «le lundi» үлгісімен бірдей.',
        strategy:
          "Отбасы туралы қысқа сипаттаманың соңғы сөйлемі көбіне жаңа деталь қосады (мұнда — апта сайынғы дәстүр) — барлық отбасы мүшелері таныстырылғаннан кейін тыңдауды тоқтатпаңыз.",
      },
    },
  },
};

const a1ShoppingQ1: QuestionSpec = {
  id: "a1-shopping-market-1-q1",
  recordingId: "a1-shopping-market-1",
  questionNumber: 1,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which fruits does the customer buy? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Apples" },
        { id: "opt-b", text: "Oranges" },
        { id: "opt-c", text: "Bananas" },
        { id: "opt-d", text: "Strawberries" },
      ],
      explanation: {
        whereInRecording:
          'The customer asks for "un kilo de pommes" first, then adds "un kilo de bananes aussi" after checking they\'re available.',
        keywords: "un kilo de pommes; un kilo de bananes aussi",
        whyCorrect:
          "The customer names exactly two fruits over the course of the conversation — apples first, then bananas once she confirms the stall has them.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Oranges are never mentioned anywhere in this conversation." },
          { optionId: "opt-d", reason: "Strawberries are never mentioned anywhere in this conversation." },
        ],
        vocabulary: [
          { term: "un kilo de", translation: "a kilo of" },
          { term: "aussi", translation: "also / too" },
        ],
        grammarPattern:
          '"Un kilo de pommes" uses "de" (not "des") after a quantity expression — a standard rule for expressing amounts of something in French.',
        strategy:
          'For "select all" questions at a market stall, track each item the customer explicitly requests using "je voudrais" — items the seller merely has in stock but the customer never asks for don\'t count.',
      },
    },
    ru: {
      prompt: "Какие фрукты покупает клиентка? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Яблоки" },
        { id: "opt-b", text: "Апельсины" },
        { id: "opt-c", text: "Бананы" },
        { id: "opt-d", text: "Клубнику" },
      ],
      explanation: {
        whereInRecording:
          'Клиентка сначала просит «un kilo de pommes», а затем добавляет «un kilo de bananes aussi», убедившись, что они есть в наличии.',
        keywords: "un kilo de pommes; un kilo de bananes aussi",
        whyCorrect:
          "Клиентка называет ровно два фрукта за весь разговор — сначала яблоки, а затем бананы, когда узнаёт, что они есть на прилавке.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Апельсины вообще не упоминаются в этом разговоре." },
          { optionId: "opt-d", reason: "Клубника вообще не упоминается в этом разговоре." },
        ],
        vocabulary: [
          { term: "un kilo de", translation: "килограмм (чего-либо)" },
          { term: "aussi", translation: "также / тоже" },
        ],
        grammarPattern:
          '«Un kilo de pommes» использует «de» (не «des») после выражения количества — стандартное правило для выражения количества чего-либо во французском.',
        strategy:
          "В вопросах «выберите все» на рыночном прилавке отслеживайте каждый предмет, который клиентка прямо запрашивает словами «je voudrais» — товары, которые просто есть у продавца, но клиентка их не просит, не считаются.",
      },
    },
    kz: {
      prompt: "Клиент қандай жемістерді сатып алады? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Алма" },
        { id: "opt-b", text: "Апельсин" },
        { id: "opt-c", text: "Банан" },
        { id: "opt-d", text: "Құлпынай" },
      ],
      explanation: {
        whereInRecording:
          'Клиент алдымен «un kilo de pommes» сұрайды, содан кейін олар бар екенін білгеннен кейін «un kilo de bananes aussi» деп қосады.',
        keywords: "un kilo de pommes; un kilo de bananes aussi",
        whyCorrect:
          "Клиент бүкіл әңгіме бойы дәл екі жемісті атайды — алдымен алма, содан кейін сатушыда бар екенін білгеннен соң банан.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Апельсин бұл әңгімеде мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Құлпынай бұл әңгімеде мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "un kilo de", translation: "бір келі" },
          { term: "aussi", translation: "сонымен қатар / да" },
        ],
        grammarPattern:
          '«Un kilo de pommes» мөлшер тіркесінен кейін «des» емес, «de» қолданады — бұл француз тілінде мөлшерді білдірудің стандартты ережесі.',
        strategy:
          "Базар дүкенінде «барлығын таңда» сұрақтарында клиент «je voudrais» деп нақты сұраған әрбір затты бақылаңыз — сатушыда бар, бірақ клиент сұрамаған заттар есептелмейді.",
      },
    },
  },
};

const a1ShoppingQ2: QuestionSpec = {
  id: "a1-shopping-market-1-q2",
  recordingId: "a1-shopping-market-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "How much do the apples and bananas cost together?",
      options: [
        { id: "opt-a", text: "2 euros" },
        { id: "opt-b", text: "5 euros" },
        { id: "opt-c", text: "7 euros" },
        { id: "opt-d", text: "10 euros" },
      ],
      explanation: {
        whereInRecording:
          'The seller states the total clearly: "Ça fait cinq euros pour les pommes et les bananes."',
        keywords: "Ça fait cinq euros pour les pommes et les bananes",
        whyCorrect:
          'The seller directly states the combined total as "cinq euros" (five euros) for both fruits together.',
        whyIncorrect: [
          { optionId: "opt-a", reason: '2 euros is the price per kilo of bananas alone ("elles sont à deux euros le kilo"), not the total for both fruits.' },
          { optionId: "opt-c", reason: "7 euros is never mentioned anywhere in this conversation." },
          { optionId: "opt-d", reason: "10 euros is never mentioned anywhere in this conversation." },
        ],
        vocabulary: [
          { term: "ça fait", translation: "that comes to (a price)" },
          { term: "le kilo", translation: "the kilo" },
        ],
        grammarPattern:
          '"Ça fait cinq euros" is the same fixed pricing expression seen elsewhere in this content bank — worth recognizing as a set phrase for stating totals.',
        strategy:
          "Don't confuse a price given per kilo for a single item with the total price for everything combined — listen for whether a number is attached to \"le kilo\" or introduced by \"ça fait\" for the full amount.",
      },
    },
    ru: {
      prompt: "Сколько вместе стоят яблоки и бананы?",
      options: [
        { id: "opt-a", text: "2 евро" },
        { id: "opt-b", text: "5 евро" },
        { id: "opt-c", text: "7 евро" },
        { id: "opt-d", text: "10 евро" },
      ],
      explanation: {
        whereInRecording:
          'Продавщица чётко называет итог: «Ça fait cinq euros pour les pommes et les bananes».',
        keywords: "Ça fait cinq euros pour les pommes et les bananes",
        whyCorrect:
          'Продавщица прямо называет общую сумму «cinq euros» (пять евро) за оба фрукта вместе.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "2 евро — это цена за килограмм одних только бананов («elles sont à deux euros le kilo»), а не итог за оба фрукта." },
          { optionId: "opt-c", reason: "7 евро вообще не упоминается в этом разговоре." },
          { optionId: "opt-d", reason: "10 евро вообще не упоминается в этом разговоре." },
        ],
        vocabulary: [
          { term: "ça fait", translation: "это составляет (о цене)" },
          { term: "le kilo", translation: "килограмм" },
        ],
        grammarPattern:
          '«Ça fait cinq euros» — то же устойчивое выражение для называния цены, что встречается и в других записях этого банка — стоит запомнить как фиксированную фразу для итоговых сумм.',
        strategy:
          "Не путайте цену за килограмм одного товара с итоговой суммой за всё вместе — обращайте внимание, привязано ли число к «le kilo» или введено словами «ça fait» для полной суммы.",
      },
    },
    kz: {
      prompt: "Алма мен банан бірге қанша тұрады?",
      options: [
        { id: "opt-a", text: "2 евро" },
        { id: "opt-b", text: "5 евро" },
        { id: "opt-c", text: "7 евро" },
        { id: "opt-d", text: "10 евро" },
      ],
      explanation: {
        whereInRecording:
          'Сатушы жалпы соманы анық айтады: «Ça fait cinq euros pour les pommes et les bananes».',
        keywords: "Ça fait cinq euros pour les pommes et les bananes",
        whyCorrect:
          'Сатушы екі жеміс үшін жалпы соманы «cinq euros» (бес евро) деп тікелей айтады.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "2 евро — тек банан үшін килограмм бағасы («elles sont à deux euros le kilo»), екі жеміс үшін жалпы сома емес." },
          { optionId: "opt-c", reason: "7 евро бұл әңгімеде мүлдем аталмайды." },
          { optionId: "opt-d", reason: "10 евро бұл әңгімеде мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "ça fait", translation: "бұл ... болады (баға туралы)" },
          { term: "le kilo", translation: "келі" },
        ],
        grammarPattern:
          '«Ça fait cinq euros» — бұл банктегі басқа жазбаларда да кездесетін баға атаудың тұрақты тіркесі — жалпы соманы білдіретін тұрақты тіркес ретінде есте сақтаған жөн.',
        strategy:
          "Бір тауардың килограмм бағасын бәрінің жалпы бағасымен шатастырмаңыз — санның «le kilo»-ға тіркелгенін немесе толық сома үшін «ça fait» арқылы енгізілгенін тыңдаңыз.",
      },
    },
  },
};

const a1ShoppingQ3: QuestionSpec = {
  id: "a1-shopping-market-1-q3",
  recordingId: "a1-shopping-market-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "easy",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "Where does this conversation take place?",
      options: [
        { id: "opt-a", text: "At a fruit stall in a market" },
        { id: "opt-b", text: "In a restaurant" },
        { id: "opt-c", text: "At a bakery" },
        { id: "opt-d", text: "At a train station" },
      ],
      explanation: {
        whereInRecording:
          'The whole exchange revolves around buying fruit by weight — "un kilo de pommes," "un kilo de bananes" — typical of a market stall interaction, with the seller greeting the customer as "madame."',
        keywords: "vous désirez, un kilo de pommes, un kilo de bananes",
        whyCorrect:
          "The entire conversation is about buying fruit by the kilo directly from a seller — a scene typical of an outdoor market or fruit stall, not a seated meal or a different type of shop.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "There is no ordering of prepared food or sitting down to eat — only fruit is bought by weight, unlike a restaurant scene." },
          { optionId: "opt-c", reason: "No bread or pastries are mentioned anywhere — only apples and bananas are discussed." },
          { optionId: "opt-d", reason: "There is no mention of trains, platforms, or travel — the conversation is entirely about buying fruit." },
        ],
        vocabulary: [
          { term: "vous désirez ?", translation: "what would you like? (formal, said by a seller)" },
          { term: "tenez", translation: "here you go (handing something over)" },
        ],
        grammarPattern:
          '"Vous désirez ?" is a polite, slightly formal way sellers greet customers in French shops and markets — a useful cue phrase for identifying the setting of a dialogue.',
        strategy:
          "For 'where does this take place' questions, listen for the greeting phrase and the type of items being discussed rather than any single word — the combination of a market-style greeting and fruit sold by the kilo together confirm the setting.",
      },
    },
    ru: {
      prompt: "Где происходит этот разговор?",
      options: [
        { id: "opt-a", text: "На фруктовом прилавке на рынке" },
        { id: "opt-b", text: "В ресторане" },
        { id: "opt-c", text: "В булочной" },
        { id: "opt-d", text: "На вокзале" },
      ],
      explanation: {
        whereInRecording:
          'Весь разговор строится вокруг покупки фруктов на вес — «un kilo de pommes», «un kilo de bananes» — типично для рыночного прилавка, продавщица обращается к клиентке «madame».',
        keywords: "vous désirez, un kilo de pommes, un kilo de bananes",
        whyCorrect:
          "Весь разговор посвящён покупке фруктов на килограммы прямо у продавца — сцена, типичная для уличного рынка или фруктового прилавка, а не для сидячего приёма пищи или другого типа магазина.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Здесь нет заказа готовой еды или сидения за столом — покупаются только фрукты на вес, в отличие от сцены в ресторане." },
          { optionId: "opt-c", reason: "Хлеб или выпечка нигде не упоминаются — обсуждаются только яблоки и бананы." },
          { optionId: "opt-d", reason: "Нет упоминаний поездов, платформ или поездок — разговор целиком о покупке фруктов." },
        ],
        vocabulary: [
          { term: "vous désirez ?", translation: "что желаете? (вежливо, говорит продавец)" },
          { term: "tenez", translation: "вот, пожалуйста (при передаче чего-либо)" },
        ],
        grammarPattern:
          '«Vous désirez ?» — вежливый, слегка формальный способ, которым продавцы во французских магазинах и на рынках приветствуют покупателей — полезная фраза-подсказка для определения места действия диалога.',
        strategy:
          "В вопросах «где это происходит» слушайте фразу приветствия и тип обсуждаемых товаров, а не отдельное слово — сочетание рыночного приветствия и фруктов, продаваемых на килограммы, вместе подтверждают место действия.",
      },
    },
    kz: {
      prompt: "Бұл әңгіме қай жерде өтеді?",
      options: [
        { id: "opt-a", text: "Базардағы жеміс сатылатын дүкенде" },
        { id: "opt-b", text: "Мейрамханада" },
        { id: "opt-c", text: "Наубайханада" },
        { id: "opt-d", text: "Теміржол вокзалында" },
      ],
      explanation: {
        whereInRecording:
          'Бүкіл әңгіме жемісті салмағымен сатып алу төңірегінде өтеді — «un kilo de pommes», «un kilo de bananes» — бұл базар дүкеніне тән жағдай, сатушы клиентке «madame» деп жүгінеді.',
        keywords: "vous désirez, un kilo de pommes, un kilo de bananes",
        whyCorrect:
          "Бүкіл әңгіме сатушыдан тікелей жемісті келімен сатып алу туралы — бұл далалық базарға немесе жеміс дүкеніне тән көрініс, отырып тамақтану немесе басқа дүкен түрі емес.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Мұнда дайын тағамға тапсырыс беру немесе отырып тамақтану жоқ — тек жеміс салмағымен сатып алынады, мейрамхана көрінісінен өзгеше." },
          { optionId: "opt-c", reason: "Нан немесе тоқаш өнімдері мүлдем аталмайды — тек алма мен банан талқыланады." },
          { optionId: "opt-d", reason: "Пойыз, платформа немесе саяхат туралы ешбір сөз жоқ — әңгіме толығымен жеміс сатып алу туралы." },
        ],
        vocabulary: [
          { term: "vous désirez ?", translation: "не қалайсыз? (сыпайы, сатушы айтады)" },
          { term: "tenez", translation: "мінеки (бір нәрсені беру кезінде)" },
        ],
        grammarPattern:
          '«Vous désirez ?» — француз дүкендері мен базарларында сатушылардың клиенттерді сыпайы, сәл ресми түрде қарсы алу тәсілі — диалог өтетін жерді анықтауға көмектесетін пайдалы белгі тіркесі.',
        strategy:
          "«Бұл қай жерде өтеді» сұрақтарында жалғыз сөзге емес, сәлемдесу тіркесі мен талқыланатын заттардың түріне құлақ түріңіз — базарлық сәлемдесу мен келімен сатылатын жеміс бірге орынды растайды.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// A2 — Survie: travel, phone calls, work, everyday situations. Simple
// past/future, ~70-120 words.
// ---------------------------------------------------------------------------

const A2_DOCTOR_APPOINTMENT: ListeningRecording = {
  id: "a2-doctor-appointment-1",
  partLabel: "Document 1",
  topic: "Booking a doctor's appointment by phone",
  transcript:
    "Allô, cabinet du docteur Lambert, bonjour. Bonjour madame, je voudrais prendre rendez-vous, s'il vous plaît. J'ai mal à la gorge depuis trois jours. D'accord, le docteur peut vous recevoir demain après-midi, à quinze heures trente. Est-ce que c'est possible le matin plutôt ? Je travaille l'après-midi. Alors, j'ai une place à neuf heures, jeudi matin. Très bien, je viendrai jeudi à neuf heures. Pouvez-vous me donner votre nom et votre numéro de téléphone ? Oui, je m'appelle Sophie Martin, et mon numéro est le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit. Parfait, à jeudi, madame Martin. Merci beaucoup, au revoir !",
  estimatedDurationSeconds: 42,
};

const A2_WORK_SHIFT_SWAP: ListeningRecording = {
  id: "a2-work-shift-swap-1",
  partLabel: "Document 2",
  topic: "Arranging a work shift swap",
  transcript:
    "Salut Karim, j'ai un problème pour vendredi. Je dois emmener ma fille chez le dentiste à quatorze heures, mais je travaille jusqu'à dix-huit heures ce jour-là. Est-ce que tu pourrais échanger ton service avec moi ? Tu travailles samedi matin, non ? Oui, c'est ça, samedi de huit heures à midi. Si tu veux, je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin. Ça marche pour moi ! Merci beaucoup, tu me sauves la vie. Je vais prévenir le responsable de ce changement demain. Parfait, à demain alors !",
  estimatedDurationSeconds: 39,
};

const A2_TRAIN_TICKET_EXCHANGE: ListeningRecording = {
  id: "a2-train-ticket-exchange-1",
  partLabel: "Document 3",
  topic: "Exchanging a train ticket at the counter",
  transcript:
    "Bonjour, j'ai un billet pour le train de quatorze heures, mais je suis en retard. Est-ce qu'il y a un autre train pour Marseille aujourd'hui ? Oui, il y a un train à seize heures trente, mais il n'y a plus de places assises, seulement des places debout. Ah non, c'est un long voyage, je préfère être assis. Alors je peux vous proposer le train de dix-huit heures, il reste encore de la place. Très bien, je prends celui de dix-huit heures. Ça coûte combien pour changer mon billet ? Il y a des frais de cinq euros. D'accord, voici ma carte bancaire. Merci, bon voyage !",
  estimatedDurationSeconds: 47,
};

const A2_HOTEL_RESERVATION_CALL: ListeningRecording = {
  id: "a2-hotel-reservation-call-1",
  partLabel: "Document 4",
  topic: "Booking a hotel room by phone",
  transcript:
    "Allô, Hôtel des Voyageurs, bonjour. Bonjour, je voudrais réserver une chambre pour deux personnes, du douze au quinze juillet. Très bien, il nous reste une chambre avec un grand lit, ou une chambre avec deux lits simples. Nous préférons deux lits simples. D'accord, cette chambre coûte soixante-quinze euros la nuit, petit-déjeuner compris. Est-ce qu'il y a un parking ? Oui, le parking est gratuit pour les clients de l'hôtel. Parfait, je réserve alors. Pouvez-vous me donner votre nom ? Oui, c'est monsieur Rivière. Merci monsieur Rivière, nous vous attendons le douze juillet.",
  estimatedDurationSeconds: 46,
};

const A2_HAIRDRESSER_APPOINTMENT: ListeningRecording = {
  id: "a2-hairdresser-appointment-1",
  partLabel: "Document 5",
  topic: "Booking a hairdresser's appointment by phone",
  transcript:
    "Salon Coiffure Élégance, bonjour. Bonjour, je voudrais prendre rendez-vous pour une coupe de cheveux. Pour quel jour ? Je suis libre mercredi ou vendredi. Mercredi, nous avons de la place à dix heures ou à seize heures. Dix heures, c'est un peu tôt pour moi, je travaille le matin. Alors je vous propose seize heures. Ça me va très bien. Vous voulez aussi une coloration ? Non merci, juste la coupe. D'accord, ça prendra environ trente minutes. Très bien, à mercredi seize heures alors. Merci, au revoir !",
  estimatedDurationSeconds: 42,
};

const a2DoctorQ1: QuestionSpec = {
  id: "a2-doctor-appointment-1-q1",
  recordingId: "a2-doctor-appointment-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "date",
  content: {
    en: {
      prompt: "What day and time is Sophie's appointment finally scheduled for?",
      options: [
        { id: "opt-a", text: "Tomorrow at 3:30 PM" },
        { id: "opt-b", text: "Thursday at 3:30 PM" },
        { id: "opt-c", text: "Thursday at 9 AM" },
        { id: "opt-d", text: "Friday at 9 AM" },
      ],
      explanation: {
        whereInRecording:
          'After Sophie asks for a morning slot, the receptionist offers a new time: "j\'ai une place à neuf heures, jeudi matin," and Sophie confirms it herself: "je viendrai jeudi à neuf heures."',
        keywords: "jeudi matin, neuf heures, je viendrai jeudi à neuf heures",
        whyCorrect:
          'Sophie explicitly confirms the final appointment in her own words — "je viendrai jeudi à neuf heures" (I\'ll come Thursday at nine) — right after the receptionist offers that exact slot.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '"Tomorrow at 3:30 PM" was the receptionist\'s first offer, which Sophie turned down because she works in the afternoon.',
          },
          {
            optionId: "opt-b",
            reason:
              "This mixes the correct day (Thursday) with the earlier, rejected time (3:30 PM) — the confirmed time is 9 AM, not 3:30 PM.",
          },
          {
            optionId: "opt-d",
            reason:
              'Friday is never mentioned anywhere in the phone call — only "demain" (tomorrow) and "jeudi" (Thursday) are discussed.',
          },
        ],
        vocabulary: [
          { term: "prendre rendez-vous", translation: "to make an appointment" },
          { term: "jeudi matin", translation: "Thursday morning" },
          { term: "plutôt", translation: "rather / instead" },
        ],
        grammarPattern:
          '"Je viendrai" is the futur simple of "venir," used here for a firm commitment to a future action — a natural tense for confirming plans and appointments.',
        strategy:
          "When a call involves negotiating a time, the first time offered is often rejected and replaced — always wait for the final confirmation, usually repeated by the caller themselves, rather than trusting the first number you hear.",
      },
    },
    ru: {
      prompt: "На какой день и время в итоге назначена встреча Софи?",
      options: [
        { id: "opt-a", text: "Завтра в 15:30" },
        { id: "opt-b", text: "В четверг в 15:30" },
        { id: "opt-c", text: "В четверг в 9:00" },
        { id: "opt-d", text: "В пятницу в 9:00" },
      ],
      explanation: {
        whereInRecording:
          'После того как Софи просит утреннее время, администратор предлагает новое: «j\'ai une place à neuf heures, jeudi matin», и Софи сама подтверждает это: «je viendrai jeudi à neuf heures».',
        keywords: "jeudi matin, neuf heures, je viendrai jeudi à neuf heures",
        whyCorrect:
          'Софи сама чётко подтверждает итоговую встречу словами «je viendrai jeudi à neuf heures» (я приду в четверг в девять) сразу после того, как администратор предлагает именно это время.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '«Завтра в 15:30» — это первое предложение администратора, от которого Софи отказалась, потому что работает во второй половине дня.',
          },
          {
            optionId: "opt-b",
            reason:
              "Здесь смешаны правильный день (четверг) и более раннее, отклонённое время (15:30) — подтверждённое время — 9:00, а не 15:30.",
          },
          {
            optionId: "opt-d",
            reason:
              'Пятница вообще не упоминается в разговоре — обсуждаются только «demain» (завтра) и «jeudi» (четверг).',
          },
        ],
        vocabulary: [
          { term: "prendre rendez-vous", translation: "записаться на приём" },
          { term: "jeudi matin", translation: "четверг утром" },
          { term: "plutôt", translation: "скорее / вместо этого" },
        ],
        grammarPattern:
          '«Je viendrai» — это futur simple от глагола «venir», используемый здесь для твёрдого обязательства о будущем действии — естественное время для подтверждения планов и встреч.',
        strategy:
          "Когда в разговоре обсуждается время встречи, первое предложенное время часто отклоняется и заменяется — всегда дожидайтесь окончательного подтверждения, обычно повторяемого самим звонящим, а не доверяйте первому услышанному числу.",
      },
    },
    kz: {
      prompt: "Софидің кездесуі соңында қай күнге және қай уақытқа тағайындалды?",
      options: [
        { id: "opt-a", text: "Ертең сағат 15:30-да" },
        { id: "opt-b", text: "Бейсенбіде сағат 15:30-да" },
        { id: "opt-c", text: "Бейсенбіде сағат 9:00-де" },
        { id: "opt-d", text: "Жұмада сағат 9:00-де" },
      ],
      explanation: {
        whereInRecording:
          'Софи таңертеңгі уақыт сұрағаннан кейін, қабылдау бөлмесі жаңа уақыт ұсынады: «j\'ai une place à neuf heures, jeudi matin», және Софи мұны өзі растайды: «je viendrai jeudi à neuf heures».',
        keywords: "jeudi matin, neuf heures, je viendrai jeudi à neuf heures",
        whyCorrect:
          'Софи соңғы кездесуді өз сөзімен нақты растайды — «je viendrai jeudi à neuf heures» (мен бейсенбіде сағат тоғызда келемін) — дәл осы уақыт ұсынылғаннан кейін бірден.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '«Ертең сағат 15:30» — бұл қабылдау бөлмесінің бірінші ұсынысы, Софи одан бас тартты, себебі түстен кейін жұмыс істейді.',
          },
          {
            optionId: "opt-b",
            reason:
              "Мұнда дұрыс күн (бейсенбі) бұрынғы, қабылданбаған уақытпен (15:30) араласқан — расталған уақыт 9:00, 15:30 емес.",
          },
          {
            optionId: "opt-d",
            reason:
              'Жұма күні әңгімеде мүлдем аталмайды — тек «demain» (ертең) және «jeudi» (бейсенбі) талқыланады.',
          },
        ],
        vocabulary: [
          { term: "prendre rendez-vous", translation: "қабылдауға жазылу" },
          { term: "jeudi matin", translation: "бейсенбі таңертең" },
          { term: "plutôt", translation: "оның орнына / гөрі" },
        ],
        grammarPattern:
          '«Je viendrai» — «venir» етістігінің futur simple түрі, мұнда болашақ әрекетке қатысты нақты уәдені білдіру үшін қолданылған — жоспарлар мен кездесулерді растаудың табиғи шағы.',
        strategy:
          "Әңгімеде кездесу уақыты талқыланғанда, алғаш ұсынылған уақыт жиі қабылданбай, өзгертіледі — бірінші естіген санға сенбей, әдетте қоңырау шалушының өзі қайталайтын соңғы растауды күтіңіз.",
      },
    },
  },
};

const a2DoctorQ2: QuestionSpec = {
  id: "a2-doctor-appointment-1-q2",
  recordingId: "a2-doctor-appointment-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "hard",
  skillTag: "number",
  content: {
    en: {
      prompt: "What is Sophie's phone number?",
      options: [
        { id: "opt-a", text: "06 12 34 65 78" },
        { id: "opt-b", text: "06 21 34 56 78" },
        { id: "opt-c", text: "06 12 34 56 78" },
        { id: "opt-d", text: "05 12 34 56 78" },
      ],
      explanation: {
        whereInRecording:
          'Sophie spells out her number clearly at the end of the call: "mon numéro est le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit."',
        keywords: "zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit",
        whyCorrect:
          "Sophie states each pair of digits in order — zéro six (06), douze (12), trente-quatre (34), cinquante-six (56), soixante-dix-huit (78) — which matches this option exactly.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'This swaps the last two digits of the fourth pair: Sophie says "cinquante-six" (56), not "soixante-cinq" (65).',
          },
          {
            optionId: "opt-b",
            reason: 'This changes the second pair: Sophie says "douze" (12), not "vingt-et-un" (21).',
          },
          {
            optionId: "opt-d",
            reason: 'This changes the opening digits: Sophie begins with "zéro six" (06), not "zéro cinq" (05).',
          },
        ],
        vocabulary: [
          { term: "mon numéro", translation: "my number" },
          { term: "zéro", translation: "zero" },
        ],
        grammarPattern:
          'French phone numbers are grouped and read in pairs of two digits (e.g. "cinquante-six" for 56), not digit by digit — recognizing these two-digit number words is essential for catching phone numbers correctly.',
        strategy:
          "For phone numbers, write down each pair as you hear it rather than trying to remember the whole sequence at once — French two-digit numbers (especially 60-99, built from soixante and quatre-vingt) are a common source of exam mistakes.",
      },
    },
    ru: {
      prompt: "Какой номер телефона у Софи?",
      options: [
        { id: "opt-a", text: "06 12 34 65 78" },
        { id: "opt-b", text: "06 21 34 56 78" },
        { id: "opt-c", text: "06 12 34 56 78" },
        { id: "opt-d", text: "05 12 34 56 78" },
      ],
      explanation: {
        whereInRecording:
          'В конце разговора Софи чётко диктует свой номер: «mon numéro est le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit».',
        keywords: "zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit",
        whyCorrect:
          "Софи называет каждую пару цифр по порядку — zéro six (06), douze (12), trente-quatre (34), cinquante-six (56), soixante-dix-huit (78) — что точно соответствует этому варианту.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Здесь переставлены последние две цифры четвёртой пары: Софи говорит «cinquante-six» (56), а не «soixante-cinq» (65).',
          },
          {
            optionId: "opt-b",
            reason: 'Здесь изменена вторая пара: Софи говорит «douze» (12), а не «vingt-et-un» (21).',
          },
          {
            optionId: "opt-d",
            reason: 'Здесь изменены первые цифры: Софи начинает с «zéro six» (06), а не «zéro cinq» (05).',
          },
        ],
        vocabulary: [
          { term: "mon numéro", translation: "мой номер" },
          { term: "zéro", translation: "ноль" },
        ],
        grammarPattern:
          'Французские номера телефонов группируются и произносятся парами цифр (например, «cinquante-six» для 56), а не по одной цифре — распознавание этих двузначных числительных необходимо для правильного восприятия номеров телефонов.',
        strategy:
          "Записывайте каждую пару цифр по мере того, как слышите её, а не пытайтесь запомнить всю последовательность сразу — французские двузначные числа (особенно от 60 до 99, образованные от soixante и quatre-vingt) — частый источник ошибок на экзамене.",
      },
    },
    kz: {
      prompt: "Софидің телефон нөмірі қандай?",
      options: [
        { id: "opt-a", text: "06 12 34 65 78" },
        { id: "opt-b", text: "06 21 34 56 78" },
        { id: "opt-c", text: "06 12 34 56 78" },
        { id: "opt-d", text: "05 12 34 56 78" },
      ],
      explanation: {
        whereInRecording:
          'Әңгіме соңында Софи өз нөмірін анық айтады: «mon numéro est le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit».',
        keywords: "zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit",
        whyCorrect:
          "Софи әр цифр жұбын ретімен айтады — zéro six (06), douze (12), trente-quatre (34), cinquante-six (56), soixante-dix-huit (78) — бұл осы нұсқаға дәл сәйкес келеді.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Мұнда төртінші жұптың соңғы екі цифры ауыстырылған: Софи «cinquante-six» (56) дейді, «soixante-cinq» (65) емес.',
          },
          {
            optionId: "opt-b",
            reason: 'Мұнда екінші жұп өзгертілген: Софи «douze» (12) дейді, «vingt-et-un» (21) емес.',
          },
          {
            optionId: "opt-d",
            reason: 'Мұнда бастапқы цифрлар өзгертілген: Софи «zéro six» (06)-дан бастайды, «zéro cinq» (05) емес.',
          },
        ],
        vocabulary: [
          { term: "mon numéro", translation: "менің нөмірім" },
          { term: "zéro", translation: "нөл" },
        ],
        grammarPattern:
          'Француз телефон нөмірлері цифрлап емес, жұппен топталып айтылады (мысалы, 56 үшін «cinquante-six») — осы екі таңбалы сан атауларын тану телефон нөмірлерін дұрыс қабылдау үшін өте маңызды.',
        strategy:
          "Бүкіл тізбекті бірден есте сақтауға тырыспай, естіген сайын әр жұпты жазып алыңыз — француз тіліндегі екі таңбалы сандар (әсіресе soixante және quatre-vingt-тен құралатын 60-99 аралығы) емтиханда жиі қате жіберетін тұс.",
      },
    },
  },
};

const a2DoctorQ3: QuestionSpec = {
  id: "a2-doctor-appointment-1-q3",
  recordingId: "a2-doctor-appointment-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "True or false: Sophie has had a sore throat for three days.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'Sophie states this herself when explaining why she needs an appointment: "J\'ai mal à la gorge depuis trois jours."',
        keywords: "J'ai mal à la gorge depuis trois jours",
        whyCorrect:
          'Sophie directly says "j\'ai mal à la gorge depuis trois jours" (I\'ve had a sore throat for three days) as her reason for calling — this matches the statement exactly.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason:
              'This contradicts Sophie\'s own words — she explicitly gives "trois jours" as the duration of her sore throat, not a different number or symptom.',
          },
        ],
        vocabulary: [
          { term: "avoir mal à", translation: "to have a pain in / to hurt (a body part)" },
          { term: "la gorge", translation: "the throat" },
          { term: "depuis", translation: "since / for (a duration)" },
        ],
        grammarPattern:
          '"Depuis trois jours" with a present-tense verb ("j\'ai mal") expresses an ongoing state that started in the past and continues now — French uses the present tense here, unlike English\'s "have had."',
        strategy:
          'When a caller explains a medical reason at the start of a call, that opening detail (symptom + duration) is often tested directly — listen closely to the very first exchange, not just the scheduling details that follow.',
      },
    },
    ru: {
      prompt: "Верно или неверно: у Софи болит горло уже три дня.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Софи сама говорит об этом, объясняя, зачем ей нужна запись: «J\'ai mal à la gorge depuis trois jours».',
        keywords: "J'ai mal à la gorge depuis trois jours",
        whyCorrect:
          'Софи прямо говорит «j\'ai mal à la gorge depuis trois jours» (у меня болит горло уже три дня) как причину своего звонка — это точно совпадает с утверждением.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason:
              'Это противоречит собственным словам Софи — она прямо называет «trois jours» как продолжительность боли в горле, а не другое число или симптом.',
          },
        ],
        vocabulary: [
          { term: "avoir mal à", translation: "испытывать боль в (какой-то части тела)" },
          { term: "la gorge", translation: "горло" },
          { term: "depuis", translation: "с / уже (о длительности)" },
        ],
        grammarPattern:
          '«Depuis trois jours» с глаголом в настоящем времени («j\'ai mal») выражает продолжающееся состояние, начавшееся в прошлом и длящееся сейчас — во французском здесь используется настоящее время, в отличие от английского «have had».',
        strategy:
          "Когда звонящий в начале разговора объясняет медицинскую причину, эта вводная деталь (симптом + продолжительность) часто проверяется напрямую — внимательно слушайте самый первый обмен репликами, а не только детали записи, которые следуют дальше.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: Софидің тамағы үш күннен бері ауырады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Софи қабылдауға жазылу себебін түсіндіргенде мұны өзі айтады: «J\'ai mal à la gorge depuis trois jours».',
        keywords: "J'ai mal à la gorge depuis trois jours",
        whyCorrect:
          'Софи қоңырау шалу себебі ретінде «j\'ai mal à la gorge depuis trois jours» (тамағым үш күннен бері ауырады) деп тікелей айтады — бұл тұжырымға дәл сәйкес келеді.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason:
              "Бұл Софидің өз сөздеріне қайшы келеді — ол тамағының ауыруының ұзақтығы ретінде нақты «trois jours» дейді, басқа сан немесе симптом емес.",
          },
        ],
        vocabulary: [
          { term: "avoir mal à", translation: "дене мүшесі ауыру" },
          { term: "la gorge", translation: "тамақ" },
          { term: "depuis", translation: "бері / -дан бастап" },
        ],
        grammarPattern:
          '«Depuis trois jours» осы шақтағы етістікпен («j\'ai mal») бірге өткенде басталып, қазірге дейін жалғасып жатқан жағдайды білдіреді — француз тілінде мұнда осы шақ қолданылады, ағылшын тіліндегі «have had»-тан өзгеше.',
        strategy:
          "Қоңырау шалушы әңгіме басында медициналық себепті түсіндіргенде, осы кіріспе деталь (симптом + ұзақтық) көбіне тікелей тексеріледі — кейін келетін жазылу мәліметтеріне ғана емес, ең бірінші алмасуға мұқият құлақ түріңіз.",
      },
    },
  },
};

const a2ShiftQ1: QuestionSpec = {
  id: "a2-work-shift-swap-1-q1",
  recordingId: "a2-work-shift-swap-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What does the speaker ask Karim to do?",
      options: [
        { id: "opt-a", text: "Take her Saturday shift for free, with nothing in return" },
        { id: "opt-b", text: "Cancel her dentist appointment for her" },
        { id: "opt-c", text: "Swap his Friday shift for her Saturday morning shift" },
        { id: "opt-d", text: "Ask the manager for a day off on her behalf" },
      ],
      explanation: {
        whereInRecording:
          'She proposes a direct exchange: "je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin" (I can take your Friday afternoon, and you\'ll take my Saturday morning).',
        keywords: "échanger ton service, je peux prendre ton vendredi après-midi, tu prendras mon samedi matin",
        whyCorrect:
          "She clearly proposes trading shifts: she'll take Karim's Friday afternoon shift, and he'll take her Saturday morning shift — an even exchange, not a one-sided favor.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "This isn't a free favor — she explicitly offers to take Karim's Friday shift in exchange for him taking her Saturday shift.",
          },
          {
            optionId: "opt-b",
            reason:
              'She needs the dentist appointment to happen for her daughter ("je dois emmener ma fille chez le dentiste") — she isn\'t asking anyone to cancel it.',
          },
          {
            optionId: "opt-d",
            reason:
              'She says she\'ll inform the manager about the change herself, tomorrow ("je vais prévenir le responsable") — she isn\'t asking Karim to request time off for her.',
          },
        ],
        vocabulary: [
          { term: "échanger", translation: "to swap / exchange" },
          { term: "le service", translation: "the shift (work schedule)" },
          { term: "emmener", translation: "to take (someone somewhere)" },
        ],
        grammarPattern:
          '"Tu prendras" uses the futur simple to describe what will happen once the swap is agreed — future tense is common when proposing and confirming plans.',
        strategy:
          'In negotiation dialogues, listen for the structure "je fais X, et toi tu fais Y" — this signals a two-way exchange, which the exam may test by offering a distractor where only one side benefits.',
      },
    },
    ru: {
      prompt: "О чём говорящая просит Карима?",
      options: [
        { id: "opt-a", text: "Взять её субботнюю смену бесплатно, ничего не получая взамен" },
        { id: "opt-b", text: "Отменить за неё визит к стоматологу" },
        { id: "opt-c", text: "Поменяться сменами: его пятница на её субботнее утро" },
        { id: "opt-d", text: "Попросить у руководителя выходной за неё" },
      ],
      explanation: {
        whereInRecording:
          'Она предлагает прямой обмен: «je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin» (я могу взять твою пятницу после обеда, а ты возьмёшь моё субботнее утро).',
        keywords: "échanger ton service, je peux prendre ton vendredi après-midi, tu prendras mon samedi matin",
        whyCorrect:
          "Она чётко предлагает обменяться сменами: она возьмёт пятничную смену Карима после обеда, а он возьмёт её субботнюю утреннюю смену — равноценный обмен, а не односторонняя услуга.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Это не бесплатная услуга — она прямо предлагает взять пятничную смену Карима взамен на то, что он возьмёт её субботнюю смену.",
          },
          {
            optionId: "opt-b",
            reason:
              'Ей нужно, чтобы визит к стоматологу состоялся ради дочери («je dois emmener ma fille chez le dentiste») — она никого не просит его отменить.',
          },
          {
            optionId: "opt-d",
            reason:
              'Она говорит, что сама сообщит руководителю об изменении завтра («je vais prévenir le responsable») — она не просит Карима просить за неё выходной.',
          },
        ],
        vocabulary: [
          { term: "échanger", translation: "меняться / обмениваться" },
          { term: "le service", translation: "смена (рабочий график)" },
          { term: "emmener", translation: "отвезти / отвести (кого-то куда-то)" },
        ],
        grammarPattern:
          '«Tu prendras» использует futur simple для описания того, что произойдёт после согласования обмена — будущее время часто используется при предложении и подтверждении планов.',
        strategy:
          "В диалогах о переговорах прислушивайтесь к конструкции «я делаю X, а ты делаешь Y» — это сигнализирует о двустороннем обмене, что экзамен может проверять, предлагая вариант, где выгоду получает только одна сторона.",
      },
    },
    kz: {
      prompt: "Сөйлеуші Каримнен не істеуін сұрайды?",
      options: [
        { id: "opt-a", text: "Оның сенбілік ауысымын тегін алу, ешнәрсе алмастырмай" },
        { id: "opt-b", text: "Оның орнына стоматологқа баруды тоқтату" },
        { id: "opt-c", text: "Ауысымдарды алмастыру: оның жұмасын оның сенбі таңымен" },
        { id: "opt-d", text: "Оның атынан менеджерден демалыс сұрау" },
      ],
      explanation: {
        whereInRecording:
          'Ол тікелей айырбас ұсынады: «je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin» (мен сенің жұма түстен кейінгі ауысымыңды алам, ал сен менің сенбі таңғы ауысымымды аласың).',
        keywords: "échanger ton service, je peux prendre ton vendredi après-midi, tu prendras mon samedi matin",
        whyCorrect:
          "Ол ауысымдармен алмасуды нақты ұсынады: ол Каримнің жұма түстен кейінгі ауысымын алады, ал ол оның сенбі таңғы ауысымын алады — бір жақты қызмет емес, тең айырбас.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Бұл тегін қызмет емес — ол Каримнің жұма ауысымын алуды, оның орнына ол сенбі ауысымын алатынын нақты ұсынады.",
          },
          {
            optionId: "opt-b",
            reason:
              'Оған қызының стоматологқа баруы қажет («je dois emmener ma fille chez le dentiste») — ол ешкімнен оны тоқтатуды сұрамайды.',
          },
          {
            optionId: "opt-d",
            reason:
              'Ол өзгеріс туралы менеджерге ертең өзі хабарлайтынын айтады («je vais prévenir le responsable») — ол Каримнен өзі үшін демалыс сұрауды өтінбейді.',
          },
        ],
        vocabulary: [
          { term: "échanger", translation: "алмасу" },
          { term: "le service", translation: "ауысым (жұмыс кестесі)" },
          { term: "emmener", translation: "біреуді бір жерге апару" },
        ],
        grammarPattern:
          '«Tu prendras» futur simple шағын қолданып, алмасуға келісілгеннен кейін не болатынын сипаттайды — жоспарды ұсыну және растау кезінде болашақ шақ жиі қолданылады.',
        strategy:
          "Келіссөз диалогтарында «мен X істеймін, ал сен Y істейсің» құрылымына құлақ түріңіз — бұл екі жақты алмасуды білдіреді, емтихан мұны тек бір жақ пайда көретін жауап нұсқасын ұсыну арқылы тексеруі мүмкін.",
      },
    },
  },
};

const a2ShiftQ2: QuestionSpec = {
  id: "a2-work-shift-swap-1-q2",
  recordingId: "a2-work-shift-swap-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What time is the daughter's dentist appointment?",
      options: [
        { id: "opt-a", text: "6 PM" },
        { id: "opt-b", text: "8 AM" },
        { id: "opt-c", text: "2 PM" },
        { id: "opt-d", text: "Noon" },
      ],
      explanation: {
        whereInRecording:
          'She states the reason for her request directly: "Je dois emmener ma fille chez le dentiste à quatorze heures."',
        keywords: "chez le dentiste à quatorze heures",
        whyCorrect:
          'The appointment time is stated plainly at the start: "à quatorze heures" — 2 PM — which is why she needs someone to cover the rest of her Friday shift.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: '6 PM ("dix-huit heures") is when her normal Friday shift ends, not the appointment time.',
          },
          {
            optionId: "opt-b",
            reason:
              "8 AM (\"huit heures\") is when Karim's Saturday shift begins, mentioned later in a different part of the conversation.",
          },
          {
            optionId: "opt-d",
            reason: 'Noon ("midi") is when Karim\'s Saturday shift ends, not the dentist appointment time.',
          },
        ],
        vocabulary: [
          { term: "chez le dentiste", translation: "at the dentist's" },
          { term: "quatorze heures", translation: "2 PM (14:00)" },
        ],
        grammarPattern:
          'French uses the 24-hour clock in formal/scheduling contexts ("quatorze heures" = 2 PM) — recognizing numbers above twelve as afternoon/evening times is essential for time-related listening questions.',
        strategy:
          "When a dialogue mentions several different times for different purposes (an appointment, a shift start, a shift end), jot each one down next to what it refers to — the exam often reuses these numbers as distractors for each other.",
      },
    },
    ru: {
      prompt: "На какое время назначен визит дочери к стоматологу?",
      options: [
        { id: "opt-a", text: "18:00" },
        { id: "opt-b", text: "8:00" },
        { id: "opt-c", text: "14:00" },
        { id: "opt-d", text: "Полдень" },
      ],
      explanation: {
        whereInRecording:
          'Она прямо называет причину своей просьбы: «Je dois emmener ma fille chez le dentiste à quatorze heures».',
        keywords: "chez le dentiste à quatorze heures",
        whyCorrect:
          'Время визита названо прямо в начале: «à quatorze heures» — 14:00 (2 часа дня) — именно поэтому ей нужно, чтобы кто-то подменил её на оставшуюся часть пятничной смены.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: '18:00 («dix-huit heures») — это время окончания её обычной пятничной смены, а не время визита.',
          },
          {
            optionId: "opt-b",
            reason:
              '8:00 («huit heures») — это время начала субботней смены Карима, упомянутое позже в другой части разговора.',
          },
          {
            optionId: "opt-d",
            reason: 'Полдень («midi») — это время окончания субботней смены Карима, а не время визита к стоматологу.',
          },
        ],
        vocabulary: [
          { term: "chez le dentiste", translation: "у стоматолога" },
          { term: "quatorze heures", translation: "14:00 (2 часа дня)" },
        ],
        grammarPattern:
          'Во французском в официальных контекстах и расписаниях используется 24-часовой формат («quatorze heures» = 14:00) — распознавание чисел больше двенадцати как дневного/вечернего времени важно для вопросов на понимание времени на слух.',
        strategy:
          "Когда в диалоге упоминается несколько разных времён для разных целей (визит, начало смены, конец смены), записывайте каждое рядом с тем, к чему оно относится — экзамен часто использует эти числа как отвлекающие варианты друг для друга.",
      },
    },
    kz: {
      prompt: "Қызының стоматологқа баратын уақыты нешеде?",
      options: [
        { id: "opt-a", text: "18:00-де" },
        { id: "opt-b", text: "8:00-де" },
        { id: "opt-c", text: "14:00-де" },
        { id: "opt-d", text: "Түскі уақытта" },
      ],
      explanation: {
        whereInRecording:
          'Ол өз өтінішінің себебін тікелей айтады: «Je dois emmener ma fille chez le dentiste à quatorze heures».',
        keywords: "chez le dentiste à quatorze heures",
        whyCorrect:
          'Кездесу уақыты басында тікелей аталады: «à quatorze heures» — сағат 14:00 (түстен кейін 2) — сондықтан оған жұма ауысымының қалған бөлігін біреудің алмастыруы қажет.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: '18:00 («dix-huit heures») — оның әдеттегі жұма ауысымының аяқталу уақыты, кездесу уақыты емес.',
          },
          {
            optionId: "opt-b",
            reason:
              '8:00 («huit heures») — Каримнің сенбілік ауысымының басталу уақыты, әңгіменің кейінгі бөлігінде аталады.',
          },
          {
            optionId: "opt-d",
            reason: 'Түскі уақыт («midi») — Каримнің сенбілік ауысымының аяқталу уақыты, стоматологқа бару уақыты емес.',
          },
        ],
        vocabulary: [
          { term: "chez le dentiste", translation: "стоматологта" },
          { term: "quatorze heures", translation: "сағат 14:00 (түстен кейін 2)" },
        ],
        grammarPattern:
          'Француз тілінде ресми/кесте контексттерінде 24-сағаттық формат қолданылады («quatorze heures» = 14:00) — оннан екіден жоғары сандарды түстен кейінгі/кешкі уақыт ретінде тану уақытты тыңдап түсіну сұрақтары үшін маңызды.',
        strategy:
          "Диалогта әртүрлі мақсаттар үшін бірнеше түрлі уақыт аталғанда (кездесу, ауысым басы, ауысым соңы), әрқайсысын нені білдіретінімен қоса жазып алыңыз — емтихан бұл сандарды бір-біріне қарсы алаңдатушы нұсқа ретінде жиі қолданады.",
      },
    },
  },
};

const a2ShiftQ3: QuestionSpec = {
  id: "a2-work-shift-swap-1-q3",
  recordingId: "a2-work-shift-swap-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b", "opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which of the following are true about the arrangement the two colleagues make? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "She will work Karim's Friday afternoon shift" },
        { id: "opt-b", text: "Karim will work her Saturday morning shift" },
        { id: "opt-c", text: "She will tell the manager about the change tomorrow" },
        { id: "opt-d", text: "Karim needs to take his own child to the dentist" },
      ],
      explanation: {
        whereInRecording:
          'The swap and its follow-up are laid out in sequence: "je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin," followed by "je vais prévenir le responsable de ce changement demain."',
        keywords:
          "je peux prendre ton vendredi après-midi, tu prendras mon samedi matin, je vais prévenir le responsable demain",
        whyCorrect:
          "All three of these are confirmed directly: she takes Karim's Friday afternoon, he takes her Saturday morning, and she personally will inform the manager tomorrow — three separate facts, all stated in the dialogue.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'The dentist appointment is for her own daughter ("je dois emmener ma fille chez le dentiste"), not for a child of Karim\'s — Karim is never described as having children.',
          },
        ],
        vocabulary: [
          { term: "prévenir", translation: "to inform / to give advance notice to" },
          { term: "le responsable", translation: "the manager / person in charge" },
        ],
        grammarPattern:
          '"Je vais prévenir" uses the futur proche ("aller" + infinitive) for a near-future action she\'s already decided on — distinct from the futur simple used for the shift-swap agreement itself ("tu prendras").',
        strategy:
          "For select-all questions built on a multi-step arrangement, break the dialogue into separate facts (who does what, and what happens afterward) and check each option against just one fact at a time.",
      },
    },
    ru: {
      prompt: "Что из перечисленного верно о договорённости двух коллег? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Она возьмёт пятничную смену Карима после обеда" },
        { id: "opt-b", text: "Карим возьмёт её субботнюю утреннюю смену" },
        { id: "opt-c", text: "Она сообщит руководителю об изменении завтра" },
        { id: "opt-d", text: "Кариму нужно отвезти своего ребёнка к стоматологу" },
      ],
      explanation: {
        whereInRecording:
          'Обмен и последующие шаги излагаются по порядку: «je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin», затем «je vais prévenir le responsable de ce changement demain».',
        keywords:
          "je peux prendre ton vendredi après-midi, tu prendras mon samedi matin, je vais prévenir le responsable demain",
        whyCorrect:
          "Все три утверждения подтверждаются напрямую: она берёт пятницу Карима после обеда, он берёт её субботнее утро, и она лично сообщит руководителю завтра — три отдельных факта, все они звучат в диалоге.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'Визит к стоматологу — для её собственной дочери («je dois emmener ma fille chez le dentiste»), а не для ребёнка Карима — о детях Карима вообще не упоминается.',
          },
        ],
        vocabulary: [
          { term: "prévenir", translation: "предупреждать / заранее сообщать" },
          { term: "le responsable", translation: "руководитель / ответственное лицо" },
        ],
        grammarPattern:
          '«Je vais prévenir» использует futur proche («aller» + инфинитив) для действия в ближайшем будущем, которое она уже решила совершить — в отличие от futur simple, используемого для самой договорённости об обмене сменами («tu prendras»).',
        strategy:
          "Для вопросов «выберите все подходящие» на основе многошаговой договорённости разбивайте диалог на отдельные факты (кто что делает и что происходит потом) и проверяйте каждый вариант по одному факту за раз.",
      },
    },
    kz: {
      prompt: "Екі әріптестің келісімі туралы төмендегілердің қайсысы дұрыс? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Ол Каримнің жұма түстен кейінгі ауысымын алады" },
        { id: "opt-b", text: "Карим оның сенбі таңғы ауысымын алады" },
        { id: "opt-c", text: "Ол өзгеріс туралы менеджерге ертең айтады" },
        { id: "opt-d", text: "Каримге өз баласын стоматологқа апару керек" },
      ],
      explanation: {
        whereInRecording:
          'Алмасу мен одан кейінгі қадамдар ретімен баяндалады: «je peux prendre ton vendredi après-midi, et toi tu prendras mon samedi matin», содан кейін «je vais prévenir le responsable de ce changement demain».',
        keywords:
          "je peux prendre ton vendredi après-midi, tu prendras mon samedi matin, je vais prévenir le responsable demain",
        whyCorrect:
          "Осы үш тұжырымның барлығы тікелей расталады: ол Каримнің жұма түстен кейінгі ауысымын алады, ол оның сенбі таңғы ауысымын алады, әрі ол менеджерге ертең өзі хабарлайды — диалогта аталған үш бөлек факт.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'Стоматологқа бару — оның өз қызы үшін («je dois emmener ma fille chez le dentiste»), Каримнің баласы үшін емес — Каримнің балалары туралы мүлдем айтылмайды.',
          },
        ],
        vocabulary: [
          { term: "prévenir", translation: "алдын ала хабарлау / ескерту" },
          { term: "le responsable", translation: "жауапты адам / менеджер" },
        ],
        grammarPattern:
          '«Je vais prévenir» futur proche («aller» + инфинитив) түрін ол шешіп қойған жақын болашақ әрекет үшін қолданады — бұл ауысым алмасу келісімінің өзі үшін қолданылған futur simple-ден («tu prendras») ерекшеленеді.',
        strategy:
          "Көп қадамды келісімге негізделген «барлық сәйкесін таңда» сұрақтарында диалогты бөлек фактілерге бөліңіз (кім не істейді және кейін не болады) және әр нұсқаны бір фактімен ғана салыстырыңыз.",
      },
    },
  },
};

const a2TicketQ1: QuestionSpec = {
  id: "a2-train-ticket-exchange-1-q1",
  recordingId: "a2-train-ticket-exchange-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which train does the passenger finally choose?",
      options: [
        { id: "opt-a", text: "The 2 PM train" },
        { id: "opt-b", text: "The 4:30 PM train" },
        { id: "opt-c", text: "The 6 PM train" },
        { id: "opt-d", text: "The next morning's train" },
      ],
      explanation: {
        whereInRecording:
          'After rejecting the standing-only option, the passenger confirms directly: "Très bien, je prends celui de dix-huit heures" (very well, I\'ll take the six o\'clock one).',
        keywords: "je prends celui de dix-huit heures",
        whyCorrect:
          'The passenger explicitly states "je prends celui de dix-huit heures" — dix-huit heures being 6 PM — right after the agent offers it as an option with available seats.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "The 2 PM train (\"quatorze heures\") is the original train the passenger missed, not the one finally chosen.",
          },
          {
            optionId: "opt-b",
            reason: 'The 4:30 PM train only has standing room, which the passenger rejects: "je préfère être assis" (I prefer to sit).',
          },
          {
            optionId: "opt-d",
            reason: "No train the next morning is ever mentioned — all three trains discussed happen the same day.",
          },
        ],
        vocabulary: [
          { term: "une place assise", translation: "a seat (sitting place)" },
          { term: "être en retard", translation: "to be late" },
        ],
        grammarPattern:
          '"Celui de dix-huit heures" uses the pronoun "celui" to mean "the one [train]," avoiding repeating "le train" — a common way to refer back to something already mentioned.',
        strategy:
          "When a dialogue discusses three different options before settling on one, track why each earlier option was rejected (missed train, no seats) — the final choice is usually confirmed explicitly near the end.",
      },
    },
    ru: {
      prompt: "Какой поезд в итоге выбирает пассажир?",
      options: [
        { id: "opt-a", text: "Поезд в 14:00" },
        { id: "opt-b", text: "Поезд в 16:30" },
        { id: "opt-c", text: "Поезд в 18:00" },
        { id: "opt-d", text: "Поезд следующим утром" },
      ],
      explanation: {
        whereInRecording:
          'Отклонив вариант только с местами стоя, пассажир прямо подтверждает: «Très bien, je prends celui de dix-huit heures» (хорошо, я возьму тот, что в восемнадцать часов).',
        keywords: "je prends celui de dix-huit heures",
        whyCorrect:
          'Пассажир прямо говорит «je prends celui de dix-huit heures» — dix-huit heures означает 18:00 — сразу после того, как агент предлагает этот вариант со свободными местами.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Поезд в 14:00 («quatorze heures») — это первоначальный поезд, на который пассажир опоздал, а не окончательно выбранный.",
          },
          {
            optionId: "opt-b",
            reason: 'В поезде на 16:30 есть только места стоя, от которых пассажир отказывается: «je préfère être assis» (я предпочитаю сидеть).',
          },
          {
            optionId: "opt-d",
            reason: "Поезд на следующее утро вообще не упоминается — все три обсуждаемых поезда идут в тот же день.",
          },
        ],
        vocabulary: [
          { term: "une place assise", translation: "сидячее место" },
          { term: "être en retard", translation: "опаздывать" },
        ],
        grammarPattern:
          '«Celui de dix-huit heures» использует местоимение «celui», означающее «тот [поезд]», чтобы не повторять «le train» — распространённый способ ссылаться на уже упомянутое.',
        strategy:
          "Когда в диалоге обсуждаются три разных варианта, прежде чем остановиться на одном, отслеживайте, почему каждый более ранний вариант был отклонён (опоздание, отсутствие мест) — окончательный выбор обычно явно подтверждается ближе к концу.",
      },
    },
    kz: {
      prompt: "Жолаушы соңында қай пойызды таңдайды?",
      options: [
        { id: "opt-a", text: "Сағат 14:00-дегі пойызды" },
        { id: "opt-b", text: "Сағат 16:30-дағы пойызды" },
        { id: "opt-c", text: "Сағат 18:00-дегі пойызды" },
        { id: "opt-d", text: "Келесі таңғы пойызды" },
      ],
      explanation: {
        whereInRecording:
          'Тек тұрып баратын орынды қабылдамағаннан кейін, жолаушы тікелей растайды: «Très bien, je prends celui de dix-huit heures» (жарайды, мен он сегіздегісін аламын).',
        keywords: "je prends celui de dix-huit heures",
        whyCorrect:
          'Жолаушы агент бос орындары бар нұсқа ретінде ұсынғаннан кейін бірден «je prends celui de dix-huit heures» дейді — dix-huit heures сағат 18:00 дегенді білдіреді.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Сағат 14:00-дегі («quatorze heures») пойыз — жолаушы қалып қойған бастапқы пойыз, соңында таңдалғаны емес.",
          },
          {
            optionId: "opt-b",
            reason: '16:30-дағы пойызда тек тұрып баратын орын бар, жолаушы одан бас тартады: «je préfère être assis» (мен отырып барғанды қалаймын).',
          },
          {
            optionId: "opt-d",
            reason: "Келесі таңғы пойыз туралы мүлдем айтылмайды — талқыланған үш пойыз да сол күні жүреді.",
          },
        ],
        vocabulary: [
          { term: "une place assise", translation: "отыратын орын" },
          { term: "être en retard", translation: "кешігу" },
        ],
        grammarPattern:
          '«Celui de dix-huit heures» «le train»-ды қайталамау үшін «тиесілі [пойыз]» дегенді білдіретін «celui» есімдігін қолданады — бұрын аталған нәрсеге сілтеме жасаудың кең тараған тәсілі.',
        strategy:
          "Диалогта бір нұсқаға тоқтамас бұрын үш түрлі нұсқа талқыланғанда, әр алдыңғы нұсқадан неге бас тартылғанын бақылаңыз (кешігу, орынның жоқтығы) — соңғы таңдау әдетте соңына жақын жерде нақты расталады.",
      },
    },
  },
};

const a2TicketQ2: QuestionSpec = {
  id: "a2-train-ticket-exchange-1-q2",
  recordingId: "a2-train-ticket-exchange-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "True or false: Changing the ticket costs 5 euros.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'The agent states this directly: "Il y a des frais de cinq euros" (there is a fee of five euros).',
        keywords: "des frais de cinq euros",
        whyCorrect:
          'This is true: the agent clearly states "cinq euros" as the fee for changing the ticket, right after the passenger asks how much it costs.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason: 'This contradicts the agent\'s own words — she states the fee as exactly "cinq euros," not a different amount.',
          },
        ],
        vocabulary: [
          { term: "des frais", translation: "a fee / charges" },
          { term: "changer un billet", translation: "to change a ticket" },
        ],
        grammarPattern:
          '"Il y a des frais de cinq euros" uses "il y a" to introduce an existing charge — a common impersonal construction for stating fees or costs.',
        strategy:
          "When a transaction involves both a fare and a separate fee, listen for which number is attached to which word (\"frais\" for the fee, versus prices attached to \"la nuit\" or \"le billet\") to avoid mixing them up.",
      },
    },
    ru: {
      prompt: "Верно или неверно: замена билета стоит 5 евро.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Сотрудница прямо говорит: «Il y a des frais de cinq euros» (есть сбор в пять евро).',
        keywords: "des frais de cinq euros",
        whyCorrect:
          'Это верно: сотрудница чётко называет «cinq euros» как сбор за замену билета сразу после того, как пассажир спрашивает, сколько это стоит.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason: "Это противоречит собственным словам сотрудницы — она называет сбор ровно в «cinq euros», а не другую сумму.",
          },
        ],
        vocabulary: [
          { term: "des frais", translation: "сбор / плата" },
          { term: "changer un billet", translation: "поменять билет" },
        ],
        grammarPattern:
          '«Il y a des frais de cinq euros» использует «il y a», чтобы ввести существующий сбор — распространённая безличная конструкция для указания платы или стоимости.',
        strategy:
          "Когда сделка включает и стоимость проезда, и отдельный сбор, обращайте внимание, к какому слову привязано какое число («frais» для сбора, в отличие от цен, привязанных к «la nuit» или «le billet»), чтобы не перепутать их.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: билетті ауыстыру 5 еуро тұрады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Қызметкер мұны тікелей айтады: «Il y a des frais de cinq euros» (бес еуро алым бар).',
        keywords: "des frais de cinq euros",
        whyCorrect:
          'Бұл дұрыс: қызметкер жолаушы бағаны сұрағаннан кейін бірден «cinq euros» деп алымды нақты айтады.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason: "Бұл қызметкердің өз сөзіне қайшы келеді — ол алымды нақты «cinq euros» деп атайды, басқа сома емес.",
          },
        ],
        vocabulary: [
          { term: "des frais", translation: "алым / төлем" },
          { term: "changer un billet", translation: "билетті ауыстыру" },
        ],
        grammarPattern:
          '«Il y a des frais de cinq euros» бар алымды енгізу үшін «il y a» қолданады — алым немесе құнды білдірудің кең тараған тұлғасыз құрылымы.',
        strategy:
          "Мәміле жол ақысын да, бөлек алымды да қамтығанда, қай санның қай сөзге тіркелгеніне назар аударыңыз («frais» алым үшін, «la nuit» немесе «le billet»-ге тіркелген бағалардан айырмашылығы) — оларды шатастырмау үшін.",
      },
    },
  },
};

const a2TicketQ3: QuestionSpec = {
  id: "a2-train-ticket-exchange-1-q3",
  recordingId: "a2-train-ticket-exchange-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "Why does the passenger reject the 4:30 PM train?",
      options: [
        { id: "opt-a", text: "It doesn't go to Marseille" },
        { id: "opt-b", text: "It only has standing room left, and the trip is long" },
        { id: "opt-c", text: "It costs too much" },
        { id: "opt-d", text: "It leaves from a different station" },
      ],
      explanation: {
        whereInRecording:
          'The agent warns "il n\'y a plus de places assises, seulement des places debout," and the passenger responds: "Ah non, c\'est un long voyage, je préfère être assis."',
        keywords: "seulement des places debout; c'est un long voyage, je préfère être assis",
        whyCorrect:
          "The passenger explicitly rejects this train because only standing spots remain and the journey is long, making standing impractical for the whole trip.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Both trains discussed go to Marseille — the destination is never the issue in this exchange.",
          },
          {
            optionId: "opt-c",
            reason: "No price for the 4:30 PM train itself is ever mentioned — only a separate five-euro exchange fee is discussed, and cost isn't the passenger's stated reason.",
          },
          {
            optionId: "opt-d",
            reason: "No different station is ever mentioned — the conversation only discusses different departure times from the same counter.",
          },
        ],
        vocabulary: [
          { term: "une place debout", translation: "a standing spot" },
          { term: "un long voyage", translation: "a long trip" },
        ],
        grammarPattern:
          '"Je préfère être assis" uses "préférer" + infinitive to state a personal preference — a natural structure for explaining why one option was turned down in favor of another.',
        strategy:
          "For 'why' questions, listen for the passenger's own reaction right after new information is given — a rejection is usually followed immediately by the specific reason, often introduced by \"parce que\" or, as here, simply stated back to back.",
      },
    },
    ru: {
      prompt: "Почему пассажир отказывается от поезда в 16:30?",
      options: [
        { id: "opt-a", text: "Он не идёт в Марсель" },
        { id: "opt-b", text: "В нём остались только места стоя, а поездка длинная" },
        { id: "opt-c", text: "Он стоит слишком дорого" },
        { id: "opt-d", text: "Он отправляется с другого вокзала" },
      ],
      explanation: {
        whereInRecording:
          'Сотрудница предупреждает: «il n\'y a plus de places assises, seulement des places debout», и пассажир отвечает: «Ah non, c\'est un long voyage, je préfère être assis».',
        keywords: "seulement des places debout; c'est un long voyage, je préfère être assis",
        whyCorrect:
          "Пассажир прямо отказывается от этого поезда, потому что остались только места стоя, а поездка длинная, что делает стояние всю дорогу непрактичным.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Оба обсуждаемых поезда идут в Марсель — пункт назначения никогда не является проблемой в этом разговоре.",
          },
          {
            optionId: "opt-c",
            reason: "Цена самого поезда в 16:30 нигде не упоминается — обсуждается только отдельный сбор за обмен в пять евро, и стоимость не является указанной причиной пассажира.",
          },
          {
            optionId: "opt-d",
            reason: "Другой вокзал вообще не упоминается — в разговоре обсуждаются только разные времена отправления с одной и той же кассы.",
          },
        ],
        vocabulary: [
          { term: "une place debout", translation: "место стоя" },
          { term: "un long voyage", translation: "долгая поездка" },
        ],
        grammarPattern:
          '«Je préfère être assis» использует «préférer» + инфинитив, чтобы выразить личное предпочтение — естественная конструкция для объяснения, почему один вариант был отклонён в пользу другого.',
        strategy:
          "В вопросах «почему» слушайте собственную реакцию пассажира сразу после сообщения новой информации — отказ обычно сразу сопровождается конкретной причиной, часто вводимой словом «parce que» или, как здесь, просто произнесённой следом.",
      },
    },
    kz: {
      prompt: "Жолаушы неге 16:30-дағы пойыздан бас тартады?",
      options: [
        { id: "opt-a", text: "Ол Марсельге бармайды" },
        { id: "opt-b", text: "Онда тек тұрып баратын орын қалған, ал жол ұзақ" },
        { id: "opt-c", text: "Ол тым қымбат тұрады" },
        { id: "opt-d", text: "Ол басқа вокзалдан аттанады" },
      ],
      explanation: {
        whereInRecording:
          'Қызметкер ескертеді: «il n\'y a plus de places assises, seulement des places debout», ал жолаушы жауап береді: «Ah non, c\'est un long voyage, je préfère être assis».',
        keywords: "seulement des places debout; c'est un long voyage, je préfère être assis",
        whyCorrect:
          "Жолаушы бұл пойыздан тікелей бас тартады, себебі тек тұрып баратын орын қалған, ал жол ұзақ, бұл бүкіл жол бойы тұруды ыңғайсыз етеді.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Талқыланған екі пойыз да Марсельге барады — бұл әңгімеде бағыт мәселе болмайды.",
          },
          {
            optionId: "opt-c",
            reason: "16:30-дағы пойыздың өз бағасы мүлдем аталмайды — тек бес еуролық бөлек ауыстыру алымы талқыланады, және баға жолаушының көрсеткен себебі емес.",
          },
          {
            optionId: "opt-d",
            reason: "Басқа вокзал туралы мүлдем айтылмайды — әңгімеде тек сол кассадан аттанатын әртүрлі уақыттар талқыланады.",
          },
        ],
        vocabulary: [
          { term: "une place debout", translation: "тұрып баратын орын" },
          { term: "un long voyage", translation: "ұзақ сапар" },
        ],
        grammarPattern:
          '«Je préfère être assis» жеке қалауды білдіру үшін «préférer» + инфинитивті қолданады — бір нұсқадан бас тартып, екіншісін таңдау себебін түсіндірудің табиғи құрылымы.',
        strategy:
          "«Неге» деген сұрақтарда жаңа ақпарат берілгеннен кейін жолаушының өз реакциясына құлақ түріңіз — бас тарту әдетте бірден нақты себеппен жалғасады, көбіне «parce que» арқылы енгізіледі немесе, мұндағыдай, жай қатарынан айтылады.",
      },
    },
  },
};

const a2HotelQ1: QuestionSpec = {
  id: "a2-hotel-reservation-call-1-q1",
  recordingId: "a2-hotel-reservation-call-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "date",
  content: {
    en: {
      prompt: "For which dates does the caller book the room?",
      options: [
        { id: "opt-a", text: "July 12 only" },
        { id: "opt-b", text: "July 12 to July 15" },
        { id: "opt-c", text: "July 15 to July 20" },
        { id: "opt-d", text: "July 2 to July 5" },
      ],
      explanation: {
        whereInRecording:
          'The caller states this directly: "je voudrais réserver une chambre pour deux personnes, du douze au quinze juillet."',
        keywords: "du douze au quinze juillet",
        whyCorrect:
          'The caller clearly gives the date range as "du douze au quinze juillet" — from the 12th to the 15th of July — matching this option exactly.',
        whyIncorrect: [
          { optionId: "opt-a", reason: 'July 12th is only the start date — "au quinze juillet" shows the stay continues through the 15th, not a single day.' },
          { optionId: "opt-c", reason: 'This shifts both dates forward — the caller says "douze" (12th) as the start, not "quinze" (15th).' },
          { optionId: "opt-d", reason: 'This mishears "douze" (twelve) as "deux" (two) — the dates are July 12 to 15, not July 2 to 5.' },
        ],
        vocabulary: [
          { term: "réserver", translation: "to book / reserve" },
          { term: "du ... au ...", translation: "from ... to ... (a date range)" },
        ],
        grammarPattern:
          '"Du douze au quinze juillet" uses "du ... au ..." to express a date range — a standard structure for stating a period of time in French.',
        strategy:
          "For date-range questions, write down both the start and end number as you hear them — French numbers like \"douze\" (12) and \"deux\" (2), or \"douze\" and \"quinze\" (15), can sound similar to an untrained ear.",
      },
    },
    ru: {
      prompt: "На какие даты звонящий бронирует номер?",
      options: [
        { id: "opt-a", text: "Только на 12 июля" },
        { id: "opt-b", text: "С 12 по 15 июля" },
        { id: "opt-c", text: "С 15 по 20 июля" },
        { id: "opt-d", text: "С 2 по 5 июля" },
      ],
      explanation: {
        whereInRecording:
          'Звонящий прямо говорит: «je voudrais réserver une chambre pour deux personnes, du douze au quinze juillet».',
        keywords: "du douze au quinze juillet",
        whyCorrect:
          'Звонящий чётко называет диапазон дат «du douze au quinze juillet» — с 12 по 15 июля — что точно соответствует этому варианту.',
        whyIncorrect: [
          { optionId: "opt-a", reason: '12 июля — это только начальная дата; «au quinze juillet» показывает, что проживание продолжается до 15-го, а не один день.' },
          { optionId: "opt-c", reason: 'Здесь обе даты сдвинуты вперёд — звонящий называет «douze» (12) как начало, а не «quinze» (15).' },
          { optionId: "opt-d", reason: 'Здесь «douze» (двенадцать) спутано с «deux» (два) — даты с 12 по 15 июля, а не со 2 по 5.' },
        ],
        vocabulary: [
          { term: "réserver", translation: "бронировать" },
          { term: "du ... au ...", translation: "с ... по ... (диапазон дат)" },
        ],
        grammarPattern:
          '«Du douze au quinze juillet» использует «du ... au ...» для выражения диапазона дат — стандартная конструкция для указания периода времени во французском.',
        strategy:
          "В вопросах о диапазоне дат записывайте и начальное, и конечное число сразу, как только услышите — французские числа вроде «douze» (12) и «deux» (2) или «douze» и «quinze» (15) могут звучать похоже для неопытного слуха.",
      },
    },
    kz: {
      prompt: "Қоңырау шалушы бөлмені қай күндерге брондайды?",
      options: [
        { id: "opt-a", text: "Тек 12 шілдеге" },
        { id: "opt-b", text: "12-ден 15 шілдеге дейін" },
        { id: "opt-c", text: "15-тен 20 шілдеге дейін" },
        { id: "opt-d", text: "2-ден 5 шілдеге дейін" },
      ],
      explanation: {
        whereInRecording:
          'Қоңырау шалушы мұны тікелей айтады: «je voudrais réserver une chambre pour deux personnes, du douze au quinze juillet».',
        keywords: "du douze au quinze juillet",
        whyCorrect:
          'Қоңырау шалушы күндер аралығын «du douze au quinze juillet» деп нақты айтады — 12-ден 15 шілдеге дейін — бұл осы нұсқаға дәл сәйкес келеді.',
        whyIncorrect: [
          { optionId: "opt-a", reason: '12 шілде тек басталу күні — «au quinze juillet» тұруы 15-ке дейін жалғасатынын көрсетеді, бір күн емес.' },
          { optionId: "opt-c", reason: 'Мұнда екі күн де алға жылжытылған — қоңырау шалушы басталуы ретінде «quinze» (15) емес, «douze» (12) дейді.' },
          { optionId: "opt-d", reason: 'Мұнда «douze» (он екі) «deux» (екі) деп қате естілген — күндер 2-ден 5-ке дейін емес, 12-ден 15 шілдеге дейін.' },
        ],
        vocabulary: [
          { term: "réserver", translation: "брондау" },
          { term: "du ... au ...", translation: "...-ден ...-ге дейін (күндер аралығы)" },
        ],
        grammarPattern:
          '«Du douze au quinze juillet» күндер аралығын білдіру үшін «du ... au ...» құрылымын қолданады — француз тілінде уақыт кезеңін көрсетудің стандартты құрылымы.',
        strategy:
          "Күндер аралығы туралы сұрақтарда естіген сайын бастапқы және соңғы санды жазып алыңыз — «douze» (12) мен «deux» (2) немесе «douze» мен «quinze» (15) сияқты француз сандары дағдыланбаған құлаққа ұқсас естілуі мүмкін.",
      },
    },
  },
};

const a2HotelQ2: QuestionSpec = {
  id: "a2-hotel-reservation-call-1-q2",
  recordingId: "a2-hotel-reservation-call-1",
  questionNumber: 2,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which of the following are true about the room and hotel? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Breakfast is included in the price" },
        { id: "opt-b", text: "The room has one large bed" },
        { id: "opt-c", text: "Parking is free for hotel guests" },
        { id: "opt-d", text: "The price is 75 euros for the whole stay" },
      ],
      explanation: {
        whereInRecording:
          'The receptionist states both facts directly: "cette chambre coûte soixante-quinze euros la nuit, petit-déjeuner compris," and "le parking est gratuit pour les clients de l\'hôtel."',
        keywords: "petit-déjeuner compris; le parking est gratuit pour les clients de l'hôtel",
        whyCorrect:
          "Both statements are confirmed directly: breakfast is included in the room price, and parking is free specifically for hotel guests — two separate facts stated by the receptionist.",
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'The caller specifically chooses "deux lits simples" (two single beds) after being offered a choice — the room with one large bed is the option they turn down, not the one they book.',
          },
          {
            optionId: "opt-d",
            reason:
              '"Soixante-quinze euros la nuit" (75 euros) is the price per night, not for the entire three-night stay — the total would be higher.',
          },
        ],
        vocabulary: [
          { term: "compris(e)", translation: "included" },
          { term: "gratuit(e)", translation: "free (of charge)" },
        ],
        grammarPattern:
          '"Petit-déjeuner compris" is a fixed phrase meaning "breakfast included," placed after the price without a verb — a common shorthand in hotel and pricing contexts.',
        strategy:
          "When two similar-sounding numbers appear close together (a nightly rate and a total, or two room options), attach each number to the specific noun it modifies (\"la nuit\" vs. the full stay) rather than assuming the first number covers everything.",
      },
    },
    ru: {
      prompt: "Что из перечисленного верно про номер и отель? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Завтрак включён в стоимость" },
        { id: "opt-b", text: "В номере одна большая кровать" },
        { id: "opt-c", text: "Парковка бесплатна для гостей отеля" },
        { id: "opt-d", text: "Цена составляет 75 евро за всё проживание" },
      ],
      explanation: {
        whereInRecording:
          'Администратор прямо называет оба факта: «cette chambre coûte soixante-quinze euros la nuit, petit-déjeuner compris», и «le parking est gratuit pour les clients de l\'hôtel».',
        keywords: "petit-déjeuner compris; le parking est gratuit pour les clients de l'hôtel",
        whyCorrect:
          "Оба утверждения подтверждаются напрямую: завтрак включён в стоимость номера, а парковка бесплатна именно для гостей отеля — два отдельных факта, названных администратором.",
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'Звонящий, когда ему предлагают выбор, конкретно выбирает «deux lits simples» (две отдельные кровати) — номер с одной большой кроватью это тот вариант, от которого он отказывается, а не тот, что бронирует.',
          },
          {
            optionId: "opt-d",
            reason:
              '«Soixante-quinze euros la nuit» (75 евро) — это цена за одну ночь, а не за всё трёхдневное проживание — итоговая сумма была бы выше.',
          },
        ],
        vocabulary: [
          { term: "compris(e)", translation: "включён(а)" },
          { term: "gratuit(e)", translation: "бесплатный(ая)" },
        ],
        grammarPattern:
          '«Petit-déjeuner compris» — устойчивая фраза «завтрак включён», стоящая после цены без глагола — распространённое сокращение в контекстах отелей и ценообразования.',
        strategy:
          "Когда рядом встречаются два похожих по звучанию числа (цена за ночь и итог, или два варианта номера), связывайте каждое число с существительным, к которому оно относится («la nuit» против всего проживания), а не считайте, что первое число покрывает всё.",
      },
    },
    kz: {
      prompt: "Бөлме мен қонақүй туралы төмендегілердің қайсысы дұрыс? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Таңғы ас бағаға кіреді" },
        { id: "opt-b", text: "Бөлмеде бір үлкен төсек бар" },
        { id: "opt-c", text: "Тұрақ қонақүй қонақтары үшін тегін" },
        { id: "opt-d", text: "Баға бүкіл тұруға 75 еуро құрайды" },
      ],
      explanation: {
        whereInRecording:
          'Қабылдаушы екі фактіні де тікелей айтады: «cette chambre coûte soixante-quinze euros la nuit, petit-déjeuner compris», және «le parking est gratuit pour les clients de l\'hôtel».',
        keywords: "petit-déjeuner compris; le parking est gratuit pour les clients de l'hôtel",
        whyCorrect:
          "Екі тұжырым да тікелей расталады: таңғы ас бөлме бағасына кіреді, ал тұрақ нақты қонақүй қонақтары үшін тегін — қабылдаушы айтқан екі бөлек факт.",
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'Қоңырау шалушыға таңдау ұсынылғанда ол нақты «deux lits simples» (екі жеке төсек) таңдайды — бір үлкен төсегі бар бөлме — олар бас тартқан нұсқа, брондаған емес.',
          },
          {
            optionId: "opt-d",
            reason:
              '«Soixante-quinze euros la nuit» (75 еуро) — бір түнге арналған баға, үш түндік тұруға емес — жалпы сома жоғарырақ болар еді.',
          },
        ],
        vocabulary: [
          { term: "compris(e)", translation: "кіреді / қосылған" },
          { term: "gratuit(e)", translation: "тегін" },
        ],
        grammarPattern:
          '«Petit-déjeuner compris» — «таңғы ас кіреді» дегенді білдіретін тұрақты тіркес, бағадан кейін етістіксіз қойылады — қонақүй мен баға контекстерінде кең тараған қысқарту.',
        strategy:
          "Жанында ұқсас естілетін екі сан кездескенде (түнгі баға мен жалпы сома немесе екі бөлме нұсқасы), әр санды өзі қатысты зат есіммен байланыстырыңыз («la nuit» бүкіл тұрумен салыстырғанда) — бірінші санды бәрін қамтиды деп есептемеңіз.",
      },
    },
  },
};

const a2HotelQ3: QuestionSpec = {
  id: "a2-hotel-reservation-call-1-q3",
  recordingId: "a2-hotel-reservation-call-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "name",
  content: {
    en: {
      prompt: "What name does the caller give for the reservation?",
      options: [
        { id: "opt-a", text: "Monsieur Petit" },
        { id: "opt-b", text: "Monsieur Martin" },
        { id: "opt-c", text: "Monsieur Rivière" },
        { id: "opt-d", text: "Monsieur Lambert" },
      ],
      explanation: {
        whereInRecording:
          'When asked for his name, the caller answers directly: "Oui, c\'est monsieur Rivière," and the receptionist repeats it to confirm: "Merci monsieur Rivière."',
        keywords: "c'est monsieur Rivière",
        whyCorrect:
          'The caller states his name as "monsieur Rivière," and the receptionist immediately repeats the same name back to confirm the booking.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Monsieur Petit is never mentioned anywhere in this call." },
          { optionId: "opt-b", reason: "Monsieur Martin is never mentioned anywhere in this call." },
          { optionId: "opt-d", reason: "Monsieur Lambert is never mentioned anywhere in this call." },
        ],
        vocabulary: [
          { term: "pouvez-vous me donner", translation: "can you give me" },
          { term: "nous vous attendons", translation: "we're expecting you / we'll be waiting for you" },
        ],
        grammarPattern:
          'The receptionist repeats the name back ("Merci monsieur Rivière") as a natural confirmation strategy in phone bookings — listen for this repetition, since it usually confirms a detail correctly.',
        strategy:
          "When a name is given once and then repeated back by the other speaker, that repetition is a strong confirmation signal — trust the name that gets echoed rather than a similar-sounding name from elsewhere in your memory of French names.",
      },
    },
    ru: {
      prompt: "Какое имя называет звонящий для брони?",
      options: [
        { id: "opt-a", text: "Господин Пти" },
        { id: "opt-b", text: "Господин Мартен" },
        { id: "opt-c", text: "Господин Ривьер" },
        { id: "opt-d", text: "Господин Ламбер" },
      ],
      explanation: {
        whereInRecording:
          'На вопрос об имени звонящий прямо отвечает: «Oui, c\'est monsieur Rivière», и администратор повторяет это для подтверждения: «Merci monsieur Rivière».',
        keywords: "c'est monsieur Rivière",
        whyCorrect:
          'Звонящий называет своё имя «monsieur Rivière», и администратор сразу повторяет то же имя, чтобы подтвердить бронь.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Господин Пти вообще не упоминается в этом звонке." },
          { optionId: "opt-b", reason: "Господин Мартен вообще не упоминается в этом звонке." },
          { optionId: "opt-d", reason: "Господин Ламбер вообще не упоминается в этом звонке." },
        ],
        vocabulary: [
          { term: "pouvez-vous me donner", translation: "не могли бы вы дать мне" },
          { term: "nous vous attendons", translation: "мы вас ждём" },
        ],
        grammarPattern:
          'Администратор повторяет имя («Merci monsieur Rivière») в качестве естественной стратегии подтверждения при телефонных бронированиях — прислушивайтесь к этому повтору, так как он обычно подтверждает деталь правильно.',
        strategy:
          "Когда имя называется один раз, а затем повторяется собеседником, этот повтор — сильный сигнал подтверждения — доверяйте имени, которое повторили, а не похожему по звучанию имени из своей памяти о французских именах.",
      },
    },
    kz: {
      prompt: "Қоңырау шалушы брон үшін қандай есім атайды?",
      options: [
        { id: "opt-a", text: "Мсье Пти" },
        { id: "opt-b", text: "Мсье Мартен" },
        { id: "opt-c", text: "Мсье Ривьер" },
        { id: "opt-d", text: "Мсье Ламбер" },
      ],
      explanation: {
        whereInRecording:
          'Есімі сұралғанда, қоңырау шалушы тікелей жауап береді: «Oui, c\'est monsieur Rivière», ал қабылдаушы растау үшін оны қайталайды: «Merci monsieur Rivière».',
        keywords: "c'est monsieur Rivière",
        whyCorrect:
          'Қоңырау шалушы өз есімін «monsieur Rivière» деп атайды, ал қабылдаушы бронды растау үшін дереу сол есімді қайталайды.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Мсье Пти бұл қоңырауда мүлдем аталмайды." },
          { optionId: "opt-b", reason: "Мсье Мартен бұл қоңырауда мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Мсье Ламбер бұл қоңырауда мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "pouvez-vous me donner", translation: "маған бере аласыз ба" },
          { term: "nous vous attendons", translation: "біз сізді күтеміз" },
        ],
        grammarPattern:
          'Қабылдаушы есімді қайталайды («Merci monsieur Rivière») — бұл телефон арқылы брондауда табиғи растау тәсілі — осы қайталауға құлақ түріңіз, себебі ол әдетте детальді дұрыс растайды.',
        strategy:
          "Есім бір рет аталып, содан кейін екінші сөйлеуші оны қайталағанда, бұл қайталау мықты растау белгісі — есте сақтаған ұқсас естілетін француз есіміне емес, қайталанған есімге сеніңіз.",
      },
    },
  },
};

const a2HairdresserQ1: QuestionSpec = {
  id: "a2-hairdresser-appointment-1-q1",
  recordingId: "a2-hairdresser-appointment-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "date",
  content: {
    en: {
      prompt: "What day and time is the haircut finally booked for?",
      options: [
        { id: "opt-a", text: "Wednesday at 10 AM" },
        { id: "opt-b", text: "Friday at 4 PM" },
        { id: "opt-c", text: "Wednesday at 4 PM" },
        { id: "opt-d", text: "Friday at 10 AM" },
      ],
      explanation: {
        whereInRecording:
          'After rejecting the morning slot, the client accepts the alternative directly: "Alors je vous propose seize heures. Ça me va très bien," confirming the day stays Wednesday.',
        keywords: "seize heures, ça me va très bien",
        whyCorrect:
          'The appointment is booked for Wednesday, and the client accepts "seize heures" (4 PM) after rejecting the 10 AM slot, confirming with "ça me va très bien."',
        whyIncorrect: [
          { optionId: "opt-a", reason: '10 AM was the first Wednesday option offered, but the client rejects it: "c\'est un peu tôt pour moi."' },
          { optionId: "opt-b", reason: "Friday was mentioned as an alternative available day, but the appointment is ultimately booked for Wednesday, not Friday." },
          { optionId: "opt-d", reason: "Friday is never combined with 10 AM in the recording — 10 AM was only offered for Wednesday." },
        ],
        vocabulary: [
          { term: "ça me va", translation: "that works for me" },
          { term: "un peu tôt", translation: "a bit early" },
        ],
        grammarPattern:
          '"Ça me va très bien" is a fixed idiomatic expression for accepting a proposal — literally "that suits me very well," commonly used to confirm appointments and arrangements.',
        strategy:
          "When a caller is offered a choice between two days and two times, don't assume the final answer combines the first-mentioned day with the first-mentioned time — track which specific time is accepted for the specific day under discussion.",
      },
    },
    ru: {
      prompt: "На какой день и время в итоге записана стрижка?",
      options: [
        { id: "opt-a", text: "Среда, 10:00" },
        { id: "opt-b", text: "Пятница, 16:00" },
        { id: "opt-c", text: "Среда, 16:00" },
        { id: "opt-d", text: "Пятница, 10:00" },
      ],
      explanation: {
        whereInRecording:
          'Отклонив утреннее время, клиентка прямо принимает альтернативу: «Alors je vous propose seize heures. Ça me va très bien», подтверждая, что день остаётся среда.',
        keywords: "seize heures, ça me va très bien",
        whyCorrect:
          'Запись сделана на среду, и клиентка принимает «seize heures» (16:00) после отказа от времени в 10:00, подтверждая словами «ça me va très bien».',
        whyIncorrect: [
          { optionId: "opt-a", reason: '10:00 было первым предложенным вариантом на среду, но клиентка отказывается: «c\'est un peu tôt pour moi».' },
          { optionId: "opt-b", reason: "Пятница упоминалась как альтернативный доступный день, но запись в итоге сделана на среду, а не на пятницу." },
          { optionId: "opt-d", reason: "Пятница нигде в записи не сочетается с 10:00 — 10:00 предлагалось только для среды." },
        ],
        vocabulary: [
          { term: "ça me va", translation: "мне подходит" },
          { term: "un peu tôt", translation: "немного рано" },
        ],
        grammarPattern:
          '«Ça me va très bien» — устойчивое идиоматическое выражение для принятия предложения, буквально «это мне очень подходит», часто используется для подтверждения записей и договорённостей.',
        strategy:
          "Когда звонящему предлагают выбор из двух дней и двух времён, не считайте, что окончательный ответ сочетает первый упомянутый день с первым упомянутым временем — отслеживайте, какое конкретное время принято для конкретного обсуждаемого дня.",
      },
    },
    kz: {
      prompt: "Шаш қию соңында қай күнге және қай уақытқа жазылды?",
      options: [
        { id: "opt-a", text: "Сәрсенбі, 10:00" },
        { id: "opt-b", text: "Жұма, 16:00" },
        { id: "opt-c", text: "Сәрсенбі, 16:00" },
        { id: "opt-d", text: "Жұма, 10:00" },
      ],
      explanation: {
        whereInRecording:
          'Таңғы уақыттан бас тартқаннан кейін, клиент баламаны тікелей қабылдайды: «Alors je vous propose seize heures. Ça me va très bien», бұл күннің сәрсенбі болып қалғанын растайды.',
        keywords: "seize heures, ça me va très bien",
        whyCorrect:
          'Жазылым сәрсенбіге жасалды, клиент 10:00-ден бас тартқаннан кейін «seize heures»-ті (16:00) қабылдайды, «ça me va très bien» деп растайды.',
        whyIncorrect: [
          { optionId: "opt-a", reason: '10:00 сәрсенбіге ұсынылған бірінші нұсқа болды, бірақ клиент одан бас тартады: «c\'est un peu tôt pour moi».' },
          { optionId: "opt-b", reason: "Жұма балама қолжетімді күн ретінде аталды, бірақ жазылым сайып келгенде жұмаға емес, сәрсенбіге жасалды." },
          { optionId: "opt-d", reason: "Жазбада жұма ешқашан 10:00-мен біріктірілмейді — 10:00 тек сәрсенбіге ұсынылды." },
        ],
        vocabulary: [
          { term: "ça me va", translation: "маған сәйкес келеді" },
          { term: "un peu tôt", translation: "сәл ерте" },
        ],
        grammarPattern:
          '«Ça me va très bien» — ұсынысты қабылдаудың тұрақты идиомалық тіркесі, сөзбе-сөз «бұл маған өте сәйкес келеді», кездесулер мен келісімдерді растау үшін жиі қолданылады.',
        strategy:
          "Қоңырау шалушыға екі күн мен екі уақыттан таңдау ұсынылғанда, соңғы жауап бірінші аталған күнді бірінші аталған уақытпен біріктіреді деп есептемеңіз — талқыланып жатқан нақты күн үшін қай нақты уақыт қабылданғанын бақылаңыз.",
      },
    },
  },
};

const a2HairdresserQ2: QuestionSpec = {
  id: "a2-hairdresser-appointment-1-q2",
  recordingId: "a2-hairdresser-appointment-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "True or false: The client also books a hair coloring, in addition to the haircut.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'When offered a coloring, the client declines clearly: "Non merci, juste la coupe" (no thank you, just the cut).',
        keywords: "Non merci, juste la coupe",
        whyCorrect:
          'This is false: the client explicitly says "non merci, juste la coupe" when asked about a coloring — only a haircut is booked.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason: 'This contradicts the client\'s direct refusal — she says "non merci" specifically to the coloring, keeping the appointment to just the haircut.',
          },
        ],
        vocabulary: [
          { term: "une coloration", translation: "a hair coloring" },
          { term: "juste", translation: "just / only" },
        ],
        grammarPattern:
          '"Juste la coupe" drops the verb entirely, using the noun alone to mean "just the cut" — a common shorthand in spoken French when confirming a limited choice.',
        strategy:
          "When a salon or service call offers an add-on, listen carefully for the client's direct yes/no response to that specific offer — it's a common spot for a true/false trap testing whether you caught the refusal.",
      },
    },
    ru: {
      prompt: "Верно или неверно: клиентка также записывается на окрашивание, помимо стрижки.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Когда ей предлагают окрашивание, клиентка чётко отказывается: «Non merci, juste la coupe» (нет спасибо, только стрижку).',
        keywords: "Non merci, juste la coupe",
        whyCorrect:
          'Это неверно: клиентка прямо говорит «non merci, juste la coupe», когда её спрашивают об окрашивании, — записывается только стрижка.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason: 'Это противоречит прямому отказу клиентки — она говорит «non merci» именно про окрашивание, оставляя в записи только стрижку.',
          },
        ],
        vocabulary: [
          { term: "une coloration", translation: "окрашивание волос" },
          { term: "juste", translation: "только / просто" },
        ],
        grammarPattern:
          '«Juste la coupe» полностью опускает глагол, используя одно существительное для значения «только стрижка» — распространённое сокращение в разговорном французском при подтверждении ограниченного выбора.',
        strategy:
          "Когда в звонке в салон или сервисной службе предлагается дополнительная услуга, внимательно слушайте прямой ответ клиента да/нет на это конкретное предложение — это частое место для ловушки верно/неверно, проверяющей, уловили ли вы отказ.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: клиент шаш қиюмен қатар бояуға да жазылады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Оған бояу ұсынылғанда, клиент анық бас тартады: «Non merci, juste la coupe» (жоқ, рахмет, тек қию).',
        keywords: "Non merci, juste la coupe",
        whyCorrect:
          'Бұл бұрыс: клиент бояу туралы сұралғанда «non merci, juste la coupe» деп тікелей айтады — тек шаш қию жазылады.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason: "Бұл клиенттің тікелей бас тартуына қайшы келеді — ол нақты бояуға «non merci» дейді, жазылымда тек шаш қию қалады.",
          },
        ],
        vocabulary: [
          { term: "une coloration", translation: "шашты бояу" },
          { term: "juste", translation: "тек қана" },
        ],
        grammarPattern:
          '«Juste la coupe» етістікті мүлдем түсіріп, «тек қию» дегенді білдіру үшін жалғыз зат есімді қолданады — шектеулі таңдауды растау кезінде ауызша француз тілінде кең тараған қысқарту.',
        strategy:
          "Салон немесе қызмет көрсету қоңырауында қосымша қызмет ұсынылғанда, клиенттің осы нақты ұсынысқа тікелей иә/жоқ жауабына мұқият құлақ түріңіз — бұл бас тартуды байқағаныңызды тексеретін дұрыс/бұрыс тұзағының жиі кездесетін тұсы.",
      },
    },
  },
};

const a2HairdresserQ3: QuestionSpec = {
  id: "a2-hairdresser-appointment-1-q3",
  recordingId: "a2-hairdresser-appointment-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "Why does the client turn down the 10 AM slot?",
      options: [
        { id: "opt-a", text: "She is on vacation that day" },
        { id: "opt-b", text: "She works in the morning" },
        { id: "opt-c", text: "The salon is closed at that time" },
        { id: "opt-d", text: "She has another appointment at 10 AM" },
      ],
      explanation: {
        whereInRecording:
          'The client explains directly: "Dix heures, c\'est un peu tôt pour moi, je travaille le matin" (ten o\'clock is a bit early for me, I work in the morning).',
        keywords: "je travaille le matin",
        whyCorrect:
          'The client\'s own words give the reason: she works in the mornings, which is why a ten o\'clock slot doesn\'t work for her schedule.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Vacation is never mentioned anywhere in this call — her stated reason is her work schedule, not being away." },
          { optionId: "opt-c", reason: 'The salon offers 10 AM as an available slot ("nous avons de la place à dix heures") — it is open, just inconvenient for the client.' },
          { optionId: "opt-d", reason: "No other appointment is ever mentioned — the client's reason is specifically about her regular work hours." },
        ],
        vocabulary: [
          { term: "un peu tôt", translation: "a bit early" },
          { term: "le matin", translation: "in the morning" },
        ],
        grammarPattern:
          '"Je travaille le matin" uses the present tense to describe a habitual routine — the definite article "le matin" (without a preposition) means "in the mornings" as a general pattern, not one specific morning.',
        strategy:
          "For 'why' questions about a scheduling conflict, the reason is usually given in the very next clause after the client turns an option down — listen for the short explanation that directly follows a polite refusal.",
      },
    },
    ru: {
      prompt: "Почему клиентка отказывается от времени в 10:00?",
      options: [
        { id: "opt-a", text: "В этот день она в отпуске" },
        { id: "opt-b", text: "Она работает по утрам" },
        { id: "opt-c", text: "В это время салон закрыт" },
        { id: "opt-d", text: "У неё уже есть другая встреча в 10:00" },
      ],
      explanation: {
        whereInRecording:
          'Клиентка прямо объясняет: «Dix heures, c\'est un peu tôt pour moi, je travaille le matin» (десять часов немного рано для меня, я работаю по утрам).',
        keywords: "je travaille le matin",
        whyCorrect:
          'Собственные слова клиентки дают причину: она работает по утрам, поэтому время в десять часов не подходит под её расписание.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Отпуск вообще не упоминается в этом звонке — указанная ею причина — её рабочий график, а не отсутствие." },
          { optionId: "opt-c", reason: 'Салон предлагает 10:00 как доступное время («nous avons de la place à dix heures») — он открыт, просто это неудобно клиентке.' },
          { optionId: "opt-d", reason: "Другая встреча вообще не упоминается — причина клиентки конкретно связана с её обычными рабочими часами." },
        ],
        vocabulary: [
          { term: "un peu tôt", translation: "немного рано" },
          { term: "le matin", translation: "утром" },
        ],
        grammarPattern:
          '«Je travaille le matin» использует настоящее время для описания привычного распорядка — определённый артикль «le matin» (без предлога) означает «по утрам» как общую закономерность, а не одно конкретное утро.',
        strategy:
          "В вопросах «почему» о конфликте расписания причина обычно даётся в следующем же предложении после того, как клиентка отклоняет вариант — слушайте короткое объяснение, которое сразу следует за вежливым отказом.",
      },
    },
    kz: {
      prompt: "Клиент неге сағат 10:00-ден бас тартады?",
      options: [
        { id: "opt-a", text: "Ол сол күні демалыста" },
        { id: "opt-b", text: "Ол таңертең жұмыс істейді" },
        { id: "opt-c", text: "Салон сол уақытта жабық" },
        { id: "opt-d", text: "Оның сағат 10:00-де басқа кездесуі бар" },
      ],
      explanation: {
        whereInRecording:
          'Клиент тікелей түсіндіреді: «Dix heures, c\'est un peu tôt pour moi, je travaille le matin» (он сағат маған сәл ерте, мен таңертең жұмыс істеймін).',
        keywords: "je travaille le matin",
        whyCorrect:
          'Клиенттің өз сөзі себепті береді: ол таңертең жұмыс істейді, сондықтан сағат оннан кестесіне сәйкес келмейді.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Демалыс бұл қоңырауда мүлдем аталмайды — оның көрсеткен себебі жұмыс кестесі, жоқтығы емес." },
          { optionId: "opt-c", reason: 'Салон 10:00-ді қолжетімді уақыт ретінде ұсынады («nous avons de la place à dix heures») — ол ашық, тек клиентке ыңғайсыз.' },
          { optionId: "opt-d", reason: "Басқа кездесу туралы мүлдем айтылмайды — клиенттің себебі нақты оның әдеттегі жұмыс сағаттарына қатысты." },
        ],
        vocabulary: [
          { term: "un peu tôt", translation: "сәл ерте" },
          { term: "le matin", translation: "таңертең" },
        ],
        grammarPattern:
          '«Je travaille le matin» әдеттегі тәртіпті сипаттау үшін осы шақты қолданады — белгілі артикль «le matin» (предлогсыз) бір нақты таңды емес, жалпы заңдылық ретінде «таңертең сайын» дегенді білдіреді.',
        strategy:
          "Кесте қайшылығы туралы «неге» сұрақтарында себеп әдетте клиент нұсқадан бас тартқаннан кейінгі сөйлемде беріледі — сыпайы бас тартудан кейін бірден келетін қысқа түсіндірмеге құлақ түріңіз.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// B1 — Seuil: interviews, news, discussions. Varied tenses, opinions,
// ~120-200 words.
// ---------------------------------------------------------------------------

const B1_STUDY_ABROAD_INTERVIEW: ListeningRecording = {
  id: "b1-study-abroad-interview-1",
  partLabel: "Document 1",
  topic: "Radio interview about studying abroad",
  transcript:
    "Journaliste : Bonjour et bienvenue dans notre émission. Aujourd'hui, nous recevons Camille Dubois, qui a passé une année à étudier au Canada. Camille, pourquoi avez-vous choisi de partir si loin ? Camille : En fait, j'avais envie de découvrir une autre façon de vivre et d'améliorer mon anglais. Au début, ça n'a pas été facile : je ne connaissais personne, et le climat était très différent de celui de la France. Journaliste : Et comment avez-vous surmonté ces difficultés ? Camille : Je me suis inscrite à des activités organisées par l'université, ce qui m'a permis de rencontrer d'autres étudiants internationaux. Petit à petit, je me suis fait des amis, et j'ai commencé à me sentir chez moi. Journaliste : Est-ce que vous conseilleriez cette expérience à d'autres jeunes ? Camille : Absolument, même si ce n'est pas toujours simple au départ. Je pense que vivre à l'étranger nous rend plus indépendants et plus ouverts aux autres cultures. Si c'était à refaire, je repartirais sans hésiter. Journaliste : Merci, Camille, pour ce témoignage inspirant.",
  estimatedDurationSeconds: 71,
};

const B1_BIKE_SHARE_NEWS: ListeningRecording = {
  id: "b1-bike-share-news-1",
  partLabel: "Document 2",
  topic: "News report about a city bike-sharing scheme",
  transcript:
    "Depuis le mois dernier, la ville de Rennes a mis en place un nouveau système de vélos en libre-service. Plus de trois cents vélos électriques sont maintenant disponibles dans une quarantaine de stations réparties dans toute la ville. Selon la mairie, cette initiative vise à réduire la circulation automobile dans le centre-ville et à encourager les habitants à adopter des modes de transport plus écologiques. Les premiers résultats sont encourageants : le nombre de trajets a augmenté de vingt pour cent en seulement quatre semaines. Cependant, certains habitants se plaignent du prix de l'abonnement, qu'ils jugent trop élevé pour les étudiants. La mairie a annoncé qu'elle étudierait la possibilité de proposer un tarif réduit pour les moins de vingt-cinq ans dès la rentrée prochaine. En attendant, les vélos rencontrent déjà un franc succès auprès des touristes, qui apprécient de pouvoir découvrir la ville autrement.",
  estimatedDurationSeconds: 62,
};

const B1_VOLUNTEER_INTERVIEW: ListeningRecording = {
  id: "b1-volunteer-interview-1",
  partLabel: "Document 3",
  topic: "Radio interview about volunteering at an animal shelter",
  transcript:
    "Journaliste : Bonjour et merci d'être avec nous. Vous êtes bénévole depuis deux ans dans un refuge pour animaux. Qu'est-ce qui vous a poussé à commencer ? Thomas : En fait, j'ai adopté mon chien dans ce refuge, et j'ai été tellement touché par le travail des bénévoles que j'ai décidé de m'engager moi-même. Journaliste : Concrètement, que faites-vous là-bas ? Thomas : Je m'occupe surtout de promener les chiens et de nettoyer leurs espaces, mais je participe aussi aux journées portes ouvertes pour aider les visiteurs à trouver l'animal qui leur correspond. Journaliste : Est-ce que ce travail est parfois difficile émotionnellement ? Thomas : Oui, honnêtement, dire au revoir aux animaux qu'on a pris le temps de connaître, quand ils partent vers une nouvelle famille, c'est un mélange de tristesse et de joie. Mais voir un animal enfin adopté après des mois d'attente, ça vaut tous les efforts. Journaliste : Que diriez-vous à quelqu'un qui hésite à devenir bénévole ? Thomas : Je lui dirais de ne pas trop réfléchir et de simplement essayer une fois : on ne repart jamais indifférent.",
  estimatedDurationSeconds: 82,
};

const B1_REMOTE_WORK_DISCUSSION: ListeningRecording = {
  id: "b1-remote-work-discussion-1",
  partLabel: "Document 4",
  topic: "Radio segment discussing the rise of remote work",
  transcript:
    "De plus en plus d'entreprises françaises proposent désormais le télétravail plusieurs jours par semaine, et cette tendance continue de diviser les salariés. D'après un sondage récent, environ soixante pour cent des employés interrogés affirment préférer travailler au moins deux jours par semaine depuis leur domicile, principalement pour éviter les longs trajets et mieux organiser leur vie personnelle. Cependant, certains responsables d'entreprise s'inquiètent d'une baisse possible de la collaboration entre collègues et redoutent que les nouveaux employés aient plus de mal à s'intégrer à l'équipe. Pour répondre à ces préoccupations, plusieurs sociétés ont mis en place des journées obligatoires de présence au bureau, généralement le mardi et le jeudi, afin de conserver des moments d'échange en personne. Les salariés semblent globalement satisfaits de ce compromis, même si certains regrettent de ne plus pouvoir choisir librement leurs jours de télétravail. Les experts s'accordent à dire que ce modèle hybride, ni entièrement à distance ni entièrement au bureau, deviendra probablement la norme dans les années à venir.",
  estimatedDurationSeconds: 68,
};

const B1_LOCAL_FESTIVAL_NEWS: ListeningRecording = {
  id: "b1-local-festival-news-1",
  partLabel: "Document 5",
  topic: "News report about a city's annual music festival",
  transcript:
    "La ville d'Annecy célébrera ce week-end la vingtième édition de son festival de musique en plein air, un événement qui attire chaque année davantage de visiteurs. Cette année, plus de quinze mille personnes sont attendues sur les trois jours, contre environ dix mille lors de l'édition précédente. Au programme : des concerts gratuits sur la place principale, mais aussi des ateliers de musique pour les enfants et un marché artisanal local. Les organisateurs ont annoncé que, pour la première fois, un groupe international se produira samedi soir, ce qui explique en partie l'augmentation attendue de la fréquentation. La mairie a mis en place des navettes gratuites depuis les parkings situés à l'extérieur du centre-ville, afin de limiter la circulation pendant l'événement. Les commerçants locaux se réjouissent de cette affluence, qui représente une part importante de leur chiffre d'affaires annuel. Le festival se terminera dimanche soir par un grand feu d'artifice au bord du lac.",
  estimatedDurationSeconds: 65,
};

const b1InterviewQ1: QuestionSpec = {
  id: "b1-study-abroad-interview-1-q1",
  recordingId: "b1-study-abroad-interview-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is Camille's overall opinion of her experience studying in Canada?",
      options: [
        { id: "opt-a", text: "She regrets going and would not repeat it" },
        { id: "opt-b", text: "She found the whole experience easy from the very beginning" },
        { id: "opt-c", text: "It was hard at first, but she would do it again without hesitation" },
        { id: "opt-d", text: "It only improved her English, nothing else" },
      ],
      explanation: {
        whereInRecording:
          'Camille closes the interview with a clear statement: "Si c\'était à refaire, je repartirais sans hésiter" (if I had to do it again, I\'d leave without hesitating), right after admitting "Au début, ça n\'a pas été facile."',
        keywords: "Au début, ça n'a pas été facile; je repartirais sans hésiter",
        whyCorrect:
          "Camille openly admits the beginning was difficult, but her closing statement makes clear she would repeat the experience without hesitation — a positive verdict despite the rough start.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'This directly contradicts her final statement — "je repartirais sans hésiter" shows she does NOT regret it and would go again.',
          },
          {
            optionId: "opt-b",
            reason:
              'This contradicts her own words: "Au début, ça n\'a pas été facile" (in the beginning it wasn\'t easy) — she explicitly says it was difficult at first.',
          },
          {
            optionId: "opt-d",
            reason:
              'She says living abroad makes people "plus indépendants et plus ouverts aux autres cultures" — broader personal growth, not just language improvement.',
          },
        ],
        vocabulary: [
          { term: "sans hésiter", translation: "without hesitating" },
          { term: "au début", translation: "at the beginning" },
          { term: "surmonter", translation: "to overcome" },
        ],
        grammarPattern:
          '"Je repartirais" is the conditional mood, used here with "si c\'était à refaire" (if it were to be redone) to express a hypothetical — this conditional + imperfect "si" clause structure signals a hypothetical judgment about the past.',
        strategy:
          "For opinion questions, don't stop listening at the first negative detail (like early difficulties) — the speaker's true overall judgment is often revealed only in their closing remarks.",
      },
    },
    ru: {
      prompt: "Каково общее мнение Камиль о её опыте учёбы в Канаде?",
      options: [
        { id: "opt-a", text: "Она сожалеет о поездке и не повторила бы её" },
        { id: "opt-b", text: "Весь опыт с самого начала дался ей легко" },
        { id: "opt-c", text: "Сначала было трудно, но она без колебаний повторила бы это" },
        { id: "opt-d", text: "Это улучшило только её английский, и больше ничего" },
      ],
      explanation: {
        whereInRecording:
          'Камиль завершает интервью чёткой фразой: «Si c\'était à refaire, je repartirais sans hésiter» (если бы пришлось делать это снова, я бы уехала без колебаний), сразу после признания «Au début, ça n\'a pas été facile».',
        keywords: "Au début, ça n'a pas été facile; je repartirais sans hésiter",
        whyCorrect:
          "Камиль открыто признаёт, что начало было трудным, но её заключительная фраза ясно показывает, что она без колебаний повторила бы этот опыт — положительный итог, несмотря на сложное начало.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Это прямо противоречит её заключительной фразе — «je repartirais sans hésiter» показывает, что она НЕ сожалеет и снова поехала бы.',
          },
          {
            optionId: "opt-b",
            reason:
              'Это противоречит её собственным словам: «Au début, ça n\'a pas été facile» (в начале было нелегко) — она прямо говорит, что вначале было трудно.',
          },
          {
            optionId: "opt-d",
            reason:
              'Она говорит, что жизнь за границей делает людей «plus indépendants et plus ouverts aux autres cultures» — это более широкое личностное развитие, а не только улучшение языка.',
          },
        ],
        vocabulary: [
          { term: "sans hésiter", translation: "без колебаний" },
          { term: "au début", translation: "в начале" },
          { term: "surmonter", translation: "преодолевать" },
        ],
        grammarPattern:
          '«Je repartirais» — условное наклонение, используемое здесь с «si c\'était à refaire» (если бы пришлось повторить) для выражения гипотезы — эта структура «условное + imparfait в придаточном si» указывает на гипотетическую оценку прошлого.',
        strategy:
          "В вопросах о мнении не останавливайтесь на первой негативной детали (например, о ранних трудностях) — истинная общая оценка говорящего часто раскрывается только в заключительных словах.",
      },
    },
    kz: {
      prompt: "Камильдің Канадада оқу тәжірибесі туралы жалпы пікірі қандай?",
      options: [
        { id: "opt-a", text: "Ол барғанына өкінеді және қайталамас еді" },
        { id: "opt-b", text: "Барлық тәжірибе оған басынан бастап жеңіл болды" },
        { id: "opt-c", text: "Басында қиын болды, бірақ ол екіленбей қайталар еді" },
        { id: "opt-d", text: "Бұл тек оның ағылшын тілін жақсартты, басқа ешнәрсе жоқ" },
      ],
      explanation: {
        whereInRecording:
          'Камиль сұхбатты нақты сөйлеммен аяқтайды: «Si c\'était à refaire, je repartirais sans hésiter» (қайта жасау керек болса, мен екіленбей кетер едім), «Au début, ça n\'a pas été facile» деп мойындағаннан кейін бірден.',
        keywords: "Au début, ça n'a pas été facile; je repartirais sans hésiter",
        whyCorrect:
          "Камиль басы қиын болғанын ашық мойындайды, бірақ оның қорытынды сөзі оның бұл тәжірибені екіленбей қайталайтынын анық көрсетеді — қиын басталуына қарамастан оң қорытынды.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              'Бұл оның соңғы сөзіне тікелей қайшы келеді — «je repartirais sans hésiter» оның ӨКІНБЕЙТІНІН және қайта баратынын көрсетеді.',
          },
          {
            optionId: "opt-b",
            reason:
              'Бұл оның өз сөздеріне қайшы келеді: «Au début, ça n\'a pas été facile» (басында оңай болмады) — ол басында қиын болғанын тікелей айтады.',
          },
          {
            optionId: "opt-d",
            reason:
              'Ол шетелде өмір сүру адамдарды «plus indépendants et plus ouverts aux autres cultures» (тәуелсіздеу және басқа мәдениеттерге ашықтау) ететінін айтады — бұл тілдің жақсаруынан гөрі кеңірек жеке даму.',
          },
        ],
        vocabulary: [
          { term: "sans hésiter", translation: "екіленбей" },
          { term: "au début", translation: "басында" },
          { term: "surmonter", translation: "жеңу / еңсеру" },
        ],
        grammarPattern:
          '«Je repartirais» — шартты рай, мұнда «si c\'était à refaire» (қайта жасау керек болса) тіркесімен гипотезаны білдіру үшін қолданылған — бұл «шартты рай + si-тармағындағы imparfait» құрылымы өткенге қатысты гипотетикалық бағаны білдіреді.',
        strategy:
          "Пікір туралы сұрақтарда бірінші теріс детальде (мысалы, алғашқы қиындықтар туралы) тоқтап қалмаңыз — сөйлеушінің шынайы жалпы бағасы көбіне тек қорытынды сөздерінде ашылады.",
      },
    },
  },
};

const b1InterviewQ2: QuestionSpec = {
  id: "b1-study-abroad-interview-1-q2",
  recordingId: "b1-study-abroad-interview-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "How did Camille overcome her early difficulties, according to the interview?",
      options: [
        { id: "opt-a", text: "By returning home for a while before going back" },
        { id: "opt-b", text: "By hiring a private tutor" },
        { id: "opt-c", text: "By joining activities organized by the university" },
        { id: "opt-d", text: "By joining a local sports club" },
      ],
      explanation: {
        whereInRecording:
          'She explains directly: "Je me suis inscrite à des activités organisées par l\'université, ce qui m\'a permis de rencontrer d\'autres étudiants internationaux."',
        keywords: "activités organisées par l'université, rencontrer d'autres étudiants internationaux",
        whyCorrect:
          "Camille specifically credits university-organized activities with helping her meet other international students, which is how she gradually made friends and started feeling at home.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Returning home is never mentioned — Camille stayed in Canada and adapted there, rather than leaving and coming back.",
          },
          {
            optionId: "opt-b",
            reason: "A private tutor is never mentioned anywhere in the interview.",
          },
          {
            optionId: "opt-d",
            reason:
              "A sports club is a specific detail that isn't stated — the interview only mentions general university-organized activities, not sports specifically.",
          },
        ],
        vocabulary: [
          { term: "s'inscrire à", translation: "to sign up for / enroll in" },
          { term: "petit à petit", translation: "little by little" },
          { term: "se sentir chez soi", translation: "to feel at home" },
        ],
        grammarPattern:
          '"Ce qui m\'a permis de" uses a relative pronoun ("ce qui") to link the activity to its result — a useful structure for expressing cause and consequence in spoken French.',
        strategy:
          'When a question asks "how," listen for the specific method or means mentioned, often introduced by a verb like "s\'inscrire à" or "participer à" — avoid selecting a plausible-sounding option that simply isn\'t in the recording at all.',
      },
    },
    ru: {
      prompt: "Как, согласно интервью, Камиль преодолела свои первые трудности?",
      options: [
        { id: "opt-a", text: "Ненадолго вернувшись домой перед тем, как поехать обратно" },
        { id: "opt-b", text: "Наняв частного репетитора" },
        { id: "opt-c", text: "Записавшись на мероприятия, организованные университетом" },
        { id: "opt-d", text: "Вступив в местный спортивный клуб" },
      ],
      explanation: {
        whereInRecording:
          'Она объясняет прямо: «Je me suis inscrite à des activités organisées par l\'université, ce qui m\'a permis de rencontrer d\'autres étudiants internationaux».',
        keywords: "activités organisées par l'université, rencontrer d'autres étudiants internationaux",
        whyCorrect:
          "Камиль конкретно указывает, что именно мероприятия, организованные университетом, помогли ей познакомиться с другими иностранными студентами, благодаря чему она постепенно завела друзей и начала чувствовать себя как дома.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Возвращение домой вообще не упоминается — Камиль осталась в Канаде и адаптировалась там, а не уезжала и возвращалась.",
          },
          {
            optionId: "opt-b",
            reason: "Частный репетитор вообще не упоминается в интервью.",
          },
          {
            optionId: "opt-d",
            reason:
              "Спортивный клуб — это конкретная деталь, которая не указана; в интервью упоминаются только общие мероприятия, организованные университетом, а не именно спорт.",
          },
        ],
        vocabulary: [
          { term: "s'inscrire à", translation: "записаться на" },
          { term: "petit à petit", translation: "мало-помалу" },
          { term: "se sentir chez soi", translation: "чувствовать себя как дома" },
        ],
        grammarPattern:
          '«Ce qui m\'a permis de» использует относительное местоимение («ce qui»), связывающее действие с его результатом — полезная конструкция для выражения причины и следствия в устной французской речи.',
        strategy:
          "Когда в вопросе спрашивается «как», прислушивайтесь к конкретному способу или средству, часто вводимому глаголом вроде «s'inscrire à» или «participer à» — избегайте выбора правдоподобно звучащего варианта, которого просто нет в записи.",
      },
    },
    kz: {
      prompt: "Сұхбат бойынша, Камиль алғашқы қиындықтарын қалай жеңді?",
      options: [
        { id: "opt-a", text: "Қайта баруға дейін біраз уақыт үйіне қайту арқылы" },
        { id: "opt-b", text: "Жеке репетитор жалдау арқылы" },
        { id: "opt-c", text: "Университет ұйымдастырған іс-шараларға қатысу арқылы" },
        { id: "opt-d", text: "Жергілікті спорт клубына мүше болу арқылы" },
      ],
      explanation: {
        whereInRecording:
          'Ол тікелей түсіндіреді: «Je me suis inscrite à des activités organisées par l\'université, ce qui m\'a permis de rencontrer d\'autres étudiants internationaux».',
        keywords: "activités organisées par l'université, rencontrer d'autres étudiants internationaux",
        whyCorrect:
          "Камиль нақты университет ұйымдастырған іс-шаралардың оған басқа шетелдік студенттермен танысуға көмектескенін айтады, осылайша ол бірте-бірте достар тауып, өзін үйдегідей сезіне бастады.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Үйге қайту туралы мүлдем айтылмайды — Камиль Канадада қалып, сол жерде бейімделді, кетіп қайтпады.",
          },
          {
            optionId: "opt-b",
            reason: "Жеке репетитор туралы сұхбатта мүлдем айтылмайды.",
          },
          {
            optionId: "opt-d",
            reason:
              "Спорт клубы — сұхбатта аталмаған нақты деталь; сұхбатта тек университет ұйымдастырған жалпы іс-шаралар туралы айтылады, спорт туралы нақты емес.",
          },
        ],
        vocabulary: [
          { term: "s'inscrire à", translation: "жазылу / қатысу" },
          { term: "petit à petit", translation: "бірте-бірте" },
          { term: "se sentir chez soi", translation: "өзін үйдегідей сезіну" },
        ],
        grammarPattern:
          '«Ce qui m\'a permis de» тіркесі салыстырмалы есімдікті («ce qui») әрекетті оның нәтижесімен байланыстыру үшін қолданады — бұл ауызша француз тілінде себеп пен салдарды білдірудің пайдалы құрылымы.',
        strategy:
          "Сұрақ «қалай» деп қойылғанда, көбіне «s'inscrire à» немесе «participer à» сияқты етістікпен енгізілетін нақты әдіс немесе құралға құлақ түріңіз — жазбада мүлдем жоқ, бірақ шындыққа ұқсас естілетін нұсқаны таңдамаңыз.",
      },
    },
  },
};

const b1InterviewQ3: QuestionSpec = {
  id: "b1-study-abroad-interview-1-q3",
  recordingId: "b1-study-abroad-interview-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "True or false: Camille found the Canadian climate very similar to the climate in France.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'Camille lists this among her early struggles: "le climat était très différent de celui de la France" (the climate was very different from that of France).',
        keywords: "le climat était très différent de celui de la France",
        whyCorrect:
          'This is false: Camille explicitly says the climate was "très différent" (very different) from France\'s, not similar — it\'s one of the two difficulties she names at the start of her answer, alongside knowing no one.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'This is the opposite of what Camille says — she uses "différent," not a word suggesting similarity, to describe the Canadian climate compared to France\'s.',
          },
        ],
        vocabulary: [
          { term: "le climat", translation: "the climate" },
          { term: "différent(e) de", translation: "different from" },
        ],
        grammarPattern:
          '"Celui de la France" uses the pronoun "celui" to avoid repeating "le climat" — a common way in French to compare two things of the same noun without restating it.',
        strategy:
          "When a speaker lists several early difficulties in a row, each one can become the basis of its own true/false statement — keep a mental checklist of every difficulty mentioned, not just the first one.",
      },
    },
    ru: {
      prompt: "Верно или неверно: Камиль сочла канадский климат очень похожим на климат Франции.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Камиль упоминает это среди своих первых трудностей: «le climat était très différent de celui de la France» (климат сильно отличался от французского).',
        keywords: "le climat était très différent de celui de la France",
        whyCorrect:
          'Это неверно: Камиль прямо говорит, что климат был «très différent» (очень отличался) от французского, а не похож на него — это одна из двух трудностей, которые она называет в начале ответа, наряду с тем, что никого не знала.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'Это противоположно тому, что говорит Камиль — она использует слово «différent», а не слово, подразумевающее сходство, описывая канадский климат по сравнению с французским.',
          },
        ],
        vocabulary: [
          { term: "le climat", translation: "климат" },
          { term: "différent(e) de", translation: "отличающийся от" },
        ],
        grammarPattern:
          '«Celui de la France» использует местоимение «celui», чтобы не повторять «le climat», — распространённый способ во французском языке сравнить два предмета, обозначенных одним и тем же существительным, не повторяя его.',
        strategy:
          "Когда говорящий перечисляет подряд несколько ранних трудностей, каждая из них может стать основой отдельного утверждения верно/неверно — держите в уме список всех упомянутых трудностей, а не только первую.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: Камиль Канада климатын Франция климатына өте ұқсас деп тапты.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Камиль мұны алғашқы қиындықтарының арасында атайды: «le climat était très différent de celui de la France» (климат Франциядағыдан мүлдем өзгеше болды).',
        keywords: "le climat était très différent de celui de la France",
        whyCorrect:
          'Бұл бұрыс: Камиль климаттың Франциядағыдан «très différent» (мүлдем өзгеше) болғанын тікелей айтады, ұқсас емес — бұл ол жауабының басында атаған, ешкімді танымауымен қатар, екі қиындықтың бірі.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              "Бұл Камильдің айтқанына қарама-қарсы — ол Канада климатын Франциямен салыстырғанда ұқсастықты білдіретін сөзді емес, «différent» сөзін қолданады.",
          },
        ],
        vocabulary: [
          { term: "le climat", translation: "климат" },
          { term: "différent(e) de", translation: "-ден өзгеше" },
        ],
        grammarPattern:
          '«Celui de la France» «le climat»-ты қайталамау үшін «celui» есімдігін қолданады — бұл француз тілінде бір зат есіммен белгіленген екі затты қайталамай салыстырудың кең тараған тәсілі.',
        strategy:
          "Сөйлеуші қатарынан бірнеше алғашқы қиындықты атағанда, әрқайсысы жеке дұрыс/бұрыс тұжырымының негізі бола алады — тек біріншісін емес, аталған барлық қиындықтың тізімін есте сақтаңыз.",
      },
    },
  },
};

const b1BikeShareQ1: QuestionSpec = {
  id: "b1-bike-share-news-1-q1",
  recordingId: "b1-bike-share-news-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "According to the report, by how much did the number of bike trips increase, and over what period?",
      options: [
        { id: "opt-a", text: "25%, over four weeks" },
        { id: "opt-b", text: "20%, over four months" },
        { id: "opt-c", text: "20%, over four weeks" },
        { id: "opt-d", text: "30%, over four weeks" },
      ],
      explanation: {
        whereInRecording:
          'The report states this precisely: "le nombre de trajets a augmenté de vingt pour cent en seulement quatre semaines."',
        keywords: "augmenté de vingt pour cent, en seulement quatre semaines",
        whyCorrect:
          "The report gives both figures together in one sentence: a twenty percent increase, and a period of only four weeks — matching this option exactly.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '25% confuses the trip increase with a completely different figure mentioned later — the age limit "les moins de vingt-cinq ans" (people under 25) for the proposed discount, which has nothing to do with trip numbers.',
          },
          {
            optionId: "opt-b",
            reason:
              'This mishears "quatre semaines" (four weeks) as four months — the report specifies weeks, a much shorter period.',
          },
          {
            optionId: "opt-d",
            reason: 'This states the wrong percentage — the report says "vingt pour cent" (twenty percent), not thirty.',
          },
        ],
        vocabulary: [
          { term: "un trajet", translation: "a trip / a ride" },
          { term: "augmenter", translation: "to increase" },
          { term: "en libre-service", translation: "self-service (here: available for public use)" },
        ],
        grammarPattern:
          '"A augmenté" is passé composé, marking a completed change with a measurable result — common in news reports that state statistics about something that has already happened.',
        strategy:
          "News reports often pack two numbers into a single sentence (a percentage and a time period) — make sure you attach the right number to the right unit, since exam options frequently swap them.",
      },
    },
    ru: {
      prompt: "Согласно репортажу, на сколько увеличилось количество поездок на велосипедах и за какой период?",
      options: [
        { id: "opt-a", text: "На 25%, за четыре недели" },
        { id: "opt-b", text: "На 20%, за четыре месяца" },
        { id: "opt-c", text: "На 20%, за четыре недели" },
        { id: "opt-d", text: "На 30%, за четыре недели" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже это указано точно: «le nombre de trajets a augmenté de vingt pour cent en seulement quatre semaines».',
        keywords: "augmenté de vingt pour cent, en seulement quatre semaines",
        whyCorrect:
          "В репортаже обе цифры даны вместе, в одном предложении: увеличение на двадцать процентов за период всего в четыре недели — это точно соответствует данному варианту.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '25% путают с совершенно другой цифрой, упомянутой позже — возрастным порогом «les moins de vingt-cinq ans» (моложе 25 лет) для предлагаемой скидки, который не имеет отношения к числу поездок.',
          },
          {
            optionId: "opt-b",
            reason:
              'Здесь «quatre semaines» (четыре недели) ошибочно услышано как четыре месяца — в репортаже указаны именно недели, гораздо более короткий период.',
          },
          {
            optionId: "opt-d",
            reason: 'Здесь указан неверный процент — в репортаже говорится «vingt pour cent» (двадцать процентов), а не тридцать.',
          },
        ],
        vocabulary: [
          { term: "un trajet", translation: "поездка" },
          { term: "augmenter", translation: "увеличиваться" },
          { term: "en libre-service", translation: "самообслуживание (здесь: доступно для свободного пользования)" },
        ],
        grammarPattern:
          '«A augmenté» — это passé composé, обозначающее завершившееся изменение с измеримым результатом — типично для новостных репортажей, сообщающих статистику о уже произошедшем событии.',
        strategy:
          "В новостных репортажах часто в одном предложении сочетаются два числа (процент и период времени) — убедитесь, что вы правильно связываете нужное число с нужной единицей измерения, так как варианты ответов на экзамене часто их переставляют местами.",
      },
    },
    kz: {
      prompt: "Репортаж бойынша, велосипед сапарларының саны қаншаға артты және қандай кезеңде?",
      options: [
        { id: "opt-a", text: "25%-ға, төрт аптада" },
        { id: "opt-b", text: "20%-ға, төрт айда" },
        { id: "opt-c", text: "20%-ға, төрт аптада" },
        { id: "opt-d", text: "30%-ға, төрт аптада" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда бұл нақты айтылады: «le nombre de trajets a augmenté de vingt pour cent en seulement quatre semaines».',
        keywords: "augmenté de vingt pour cent, en seulement quatre semaines",
        whyCorrect:
          "Репортажда екі сан да бір сөйлемде бірге беріледі: жиырма пайызға артуы, небәрі төрт апта ішінде — бұл дәл осы нұсқаға сәйкес келеді.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '25% кейінірек аталған мүлдем басқа санмен шатастырылған — ұсынылатын жеңілдікке арналған «les moins de vingt-cinq ans» (25 жасқа дейінгілер) жас шегі, бұл сапарлар санына қатысы жоқ.',
          },
          {
            optionId: "opt-b",
            reason:
              'Мұнда «quatre semaines» (төрт апта) қате түрде төрт ай деп естілген — репортажда нақты апта туралы, әлдеқайда қысқа кезең туралы айтылады.',
          },
          {
            optionId: "opt-d",
            reason: 'Мұнда қате пайыз көрсетілген — репортажда «vingt pour cent» (жиырма пайыз) делінген, отыз емес.',
          },
        ],
        vocabulary: [
          { term: "un trajet", translation: "сапар / жол жүру" },
          { term: "augmenter", translation: "артуы / көбеюі" },
          { term: "en libre-service", translation: "өзіндік қызмет көрсету (мұнда: жалпыға қолжетімді)" },
        ],
        grammarPattern:
          '«A augmenté» — passé composé, өлшенетін нәтижесі бар аяқталған өзгерісті білдіреді — бұл болған оқиға туралы статистика беретін жаңалықтар репортаждарына тән.',
        strategy:
          "Жаңалықтар репортаждарында көбіне бір сөйлемде екі сан біріктіріледі (пайыз және уақыт кезеңі) — дұрыс санды дұрыс өлшем бірлігімен байланыстырғаныңызға көз жеткізіңіз, себебі емтихан нұсқалары оларды жиі ауыстырып қояды.",
      },
    },
  },
};

const b1BikeShareQ2: QuestionSpec = {
  id: "b1-bike-share-news-1-q2",
  recordingId: "b1-bike-share-news-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "vocabulary",
  content: {
    en: {
      prompt: 'In the report, what does the city\'s proposed "tarif réduit" refer to?',
      options: [
        { id: "opt-a", text: "Free bikes for absolutely everyone" },
        { id: "opt-b", text: "A discount reserved only for tourists" },
        { id: "opt-c", text: "A lower subscription price for people under 25" },
        { id: "opt-d", text: "A higher price during peak hours" },
      ],
      explanation: {
        whereInRecording:
          'The report explains: "La mairie a annoncé qu\'elle étudierait la possibilité de proposer un tarif réduit pour les moins de vingt-cinq ans dès la rentrée prochaine."',
        keywords: "tarif réduit, pour les moins de vingt-cinq ans",
        whyCorrect:
          'The report specifies exactly who the reduced rate would target: "pour les moins de vingt-cinq ans" — people under 25 — not a general discount for all users.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Free bikes for everyone overstates the proposal — the city is only studying a reduced (not free) price, and only for a specific age group.",
          },
          {
            optionId: "opt-b",
            reason:
              "Tourists are mentioned separately in the report as already enjoying the bikes, but the reduced rate under discussion is aimed at people under 25, not tourists.",
          },
          {
            optionId: "opt-d",
            reason:
              '"Réduit" means reduced/lower, the opposite of a higher price — this option contradicts the basic meaning of the word.',
          },
        ],
        vocabulary: [
          { term: "tarif réduit", translation: "reduced rate / discounted price" },
          { term: "la rentrée", translation: "the start of the new school/academic year" },
          { term: "un abonnement", translation: "a subscription" },
        ],
        grammarPattern:
          '"Étudierait" is the conditional of "étudier," used here to express a plan that is only being considered, not yet decided — a useful cue that something is proposed rather than confirmed.',
        strategy:
          "When a question asks about a specific French word or phrase, listen for exactly who or what it's said to apply to in the recording — reduced-price offers are almost always tied to a specific group, which the exam likes to test.",
      },
    },
    ru: {
      prompt: "Что в репортаже означает предлагаемый мэрией «tarif réduit»?",
      options: [
        { id: "opt-a", text: "Бесплатные велосипеды абсолютно для всех" },
        { id: "opt-b", text: "Скидка только для туристов" },
        { id: "opt-c", text: "Более низкая цена подписки для людей младше 25 лет" },
        { id: "opt-d", text: "Более высокая цена в часы пик" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже объясняется: «La mairie a annoncé qu\'elle étudierait la possibilité de proposer un tarif réduit pour les moins de vingt-cinq ans dès la rentrée prochaine».',
        keywords: "tarif réduit, pour les moins de vingt-cinq ans",
        whyCorrect:
          'В репортаже точно указано, для кого предназначен льготный тариф: «pour les moins de vingt-cinq ans» — для людей младше 25 лет, а не общая скидка для всех пользователей.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Бесплатные велосипеды для всех — это преувеличение предложения: город лишь рассматривает возможность сниженной (не бесплатной) цены, и только для определённой возрастной группы.",
          },
          {
            optionId: "opt-b",
            reason:
              "Туристы упоминаются отдельно в репортаже как уже пользующиеся велосипедами, но обсуждаемый льготный тариф предназначен для людей младше 25 лет, а не для туристов.",
          },
          {
            optionId: "opt-d",
            reason: '«Réduit» означает «сниженный», то есть противоположность более высокой цене — этот вариант противоречит самому значению слова.',
          },
        ],
        vocabulary: [
          { term: "tarif réduit", translation: "льготный тариф / сниженная цена" },
          { term: "la rentrée", translation: "начало учебного года" },
          { term: "un abonnement", translation: "подписка / абонемент" },
        ],
        grammarPattern:
          '«Étudierait» — это условное наклонение глагола «étudier», используемое здесь, чтобы выразить план, который только рассматривается, а не решён окончательно — полезный сигнал того, что нечто предлагается, а не подтверждено.',
        strategy:
          "Когда вопрос касается конкретного французского слова или выражения, прислушивайтесь к тому, к кому или к чему именно оно применяется в записи — предложения со сниженной ценой почти всегда привязаны к конкретной группе, что экзамен любит проверять.",
      },
    },
    kz: {
      prompt: "Репортажда қала әкімшілігі ұсынған «tarif réduit» нені білдіреді?",
      options: [
        { id: "opt-a", text: "Барлығына арналған тегін велосипедтер" },
        { id: "opt-b", text: "Тек туристерге арналған жеңілдік" },
        { id: "opt-c", text: "25 жасқа дейінгілерге арналған төменірек жазылым бағасы" },
        { id: "opt-d", text: "Шыңдалған сағаттарда жоғарырақ баға" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда түсіндіріледі: «La mairie a annoncé qu\'elle étudierait la possibilité de proposer un tarif réduit pour les moins de vingt-cinq ans dès la rentrée prochaine».',
        keywords: "tarif réduit, pour les moins de vingt-cinq ans",
        whyCorrect:
          'Репортажда жеңілдікті нақты кімге арналғаны көрсетілген: «pour les moins de vingt-cinq ans» — 25 жасқа дейінгілерге, барлық пайдаланушыларға арналған жалпы жеңілдік емес.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Барлығына тегін велосипедтер — бұл ұсынысты асыра айту: қала әкімшілігі тек төмендетілген (тегін емес) бағаны, тек белгілі бір жас тобы үшін қарастыруда.",
          },
          {
            optionId: "opt-b",
            reason:
              "Туристер репортажда велосипедтерді әлдеқашан пайдаланып жүргендер ретінде бөлек аталады, ал талқыланып жатқан жеңілдікті тариф 25 жасқа дейінгілерге арналған, туристерге емес.",
          },
          {
            optionId: "opt-d",
            reason: '«Réduit» — «төмендетілген» дегенді білдіреді, бұл жоғары бағаға қарама-қарсы — бұл нұсқа сөздің негізгі мағынасына қайшы келеді.',
          },
        ],
        vocabulary: [
          { term: "tarif réduit", translation: "жеңілдетілген тариф / төмендетілген баға" },
          { term: "la rentrée", translation: "оқу жылының басталуы" },
          { term: "un abonnement", translation: "жазылым / абонемент" },
        ],
        grammarPattern:
          '«Étudierait» — «étudier» етістігінің шартты рай түрі, мұнда әлі шешілмеген, тек қарастырылып жатқан жоспарды білдіру үшін қолданылған — бұл бір нәрсе расталған емес, тек ұсынылғанын білдіретін пайдалы белгі.',
        strategy:
          "Сұрақ белгілі бір француз сөзі немесе тіркесі туралы болғанда, оның жазбада нақты кімге немесе неге қатысты айтылғанына құлақ түріңіз — жеңілдетілген баға ұсыныстары әдетте белгілі бір топпен байланысты болады, емтихан мұны тексергенді ұнатады.",
      },
    },
  },
};

const b1BikeShareQ3: QuestionSpec = {
  id: "b1-bike-share-news-1-q3",
  recordingId: "b1-bike-share-news-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b", "opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which of the following does the report state about the bike-share scheme? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "More than 300 electric bikes are available" },
        { id: "opt-b", text: "There are around 40 stations across the city" },
        { id: "opt-c", text: "The scheme aims to reduce car traffic downtown" },
        { id: "opt-d", text: "The subscription is currently free for everyone" },
      ],
      explanation: {
        whereInRecording:
          'The report states all three directly: "Plus de trois cents vélos électriques sont maintenant disponibles dans une quarantaine de stations," and "cette initiative vise à réduire la circulation automobile dans le centre-ville."',
        keywords: "plus de trois cents vélos électriques, une quarantaine de stations, réduire la circulation automobile",
        whyCorrect:
          "The report confirms all three facts in its opening sentences: over 300 electric bikes, about forty stations citywide, and a stated goal of reducing car traffic downtown — each stated plainly, not implied.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'The report says the opposite: residents complain the subscription price ("le prix de l\'abonnement") is too high for students — it is not free for anyone.',
          },
        ],
        vocabulary: [
          { term: "une quarantaine de", translation: "about forty" },
          { term: "viser à", translation: "to aim to" },
        ],
        grammarPattern:
          '"Une quarantaine de" (with the suffix "-aine") means "about forty," an approximation — similar to "une dizaine" (about ten) — useful for recognizing rounded figures in news reports.',
        strategy:
          "News reports often open with several factual statistics in quick succession before moving to opinions or complaints later — separate the opening 'what is true' facts from the 'what people are unhappy about' section that usually follows.",
      },
    },
    ru: {
      prompt: "Что из перечисленного сообщается в репортаже о системе проката велосипедов? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Доступно более 300 электровелосипедов" },
        { id: "opt-b", text: "По городу расположено около 40 станций" },
        { id: "opt-c", text: "Цель системы — снизить автомобильное движение в центре города" },
        { id: "opt-d", text: "Подписка сейчас бесплатна для всех" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже все три факта названы прямо: «Plus de trois cents vélos électriques sont maintenant disponibles dans une quarantaine de stations», и «cette initiative vise à réduire la circulation automobile dans le centre-ville».',
        keywords: "plus de trois cents vélos électriques, une quarantaine de stations, réduire la circulation automobile",
        whyCorrect:
          "Репортаж подтверждает все три факта в первых предложениях: более 300 электровелосипедов, около сорока станций по городу и заявленная цель снизить автомобильное движение в центре — каждый факт назван прямо, а не подразумевается.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'В репортаже говорится обратное: жители жалуются, что цена подписки («le prix de l\'abonnement») слишком высока для студентов — она не бесплатна ни для кого.',
          },
        ],
        vocabulary: [
          { term: "une quarantaine de", translation: "около сорока" },
          { term: "viser à", translation: "стремиться к / иметь целью" },
        ],
        grammarPattern:
          '«Une quarantaine de» (с суффиксом «-aine») означает «около сорока» — приблизительное число, похожее на «une dizaine» (около десяти) — полезно для распознавания округлённых цифр в новостных репортажах.',
        strategy:
          "Новостные репортажи часто начинаются с нескольких фактических статистических данных подряд, прежде чем перейти к мнениям или жалобам далее — отделяйте начальные факты «что верно» от следующего за ними раздела «чем люди недовольны».",
      },
    },
    kz: {
      prompt: "Репортажда велосипед прокаты жүйесі туралы төмендегілердің қайсысы айтылады? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "300-ден астам электровелосипед қолжетімді" },
        { id: "opt-b", text: "Қала бойынша шамамен 40 стансa бар" },
        { id: "opt-c", text: "Жүйенің мақсаты — қала орталығындағы көлік ағынын азайту" },
        { id: "opt-d", text: "Жазылым қазір бәріне тегін" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда үш факт те тікелей аталады: «Plus de trois cents vélos électriques sont maintenant disponibles dans une quarantaine de stations» және «cette initiative vise à réduire la circulation automobile dans le centre-ville».',
        keywords: "plus de trois cents vélos électriques, une quarantaine de stations, réduire la circulation automobile",
        whyCorrect:
          "Репортаж бастапқы сөйлемдерінде үш фактіні де растайды: 300-ден астам электровелосипед, қала бойынша шамамен қырық стансa және қала орталығындағы көлік қозғалысын азайту мақсаты — әрқайсысы жанама емес, тікелей айтылған.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'Репортажда керісінше айтылады: тұрғындар жазылым бағасының («le prix de l\'abonnement») студенттер үшін тым жоғары екеніне шағымданады — ол ешкім үшін тегін емес.',
          },
        ],
        vocabulary: [
          { term: "une quarantaine de", translation: "шамамен қырық" },
          { term: "viser à", translation: "мақсат ету" },
        ],
        grammarPattern:
          '«Une quarantaine de» («-aine» жұрнағымен) «шамамен қырық» дегенді білдіреді — «une dizaine» (шамамен он) сияқты жуықтау — бұл жаңалықтар репортаждарындағы дөңгелектенген сандарды тану үшін пайдалы.',
        strategy:
          "Жаңалықтар репортаждары көбіне бірнеше нақты статистикалық деректен басталып, кейін пікірлерге немесе шағымдарға көшеді — бастапқы «не рас» фактілерін кейін келетін «адамдар неге риза емес» бөлімінен бөліп қараңыз.",
      },
    },
  },
};

const b1VolunteerQ1: QuestionSpec = {
  id: "b1-volunteer-interview-1-q1",
  recordingId: "b1-volunteer-interview-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What motivated Thomas to start volunteering at the shelter?",
      options: [
        { id: "opt-a", text: "A friend convinced him to sign up" },
        { id: "opt-b", text: "He adopted his dog there and was moved by the volunteers' work" },
        { id: "opt-c", text: "He needed volunteer hours for a school program" },
        { id: "opt-d", text: "He lost his job and had free time" },
      ],
      explanation: {
        whereInRecording:
          'Thomas explains directly: "j\'ai adopté mon chien dans ce refuge, et j\'ai été tellement touché par le travail des bénévoles que j\'ai décidé de m\'engager moi-même."',
        keywords: "j'ai adopté mon chien dans ce refuge, tellement touché par le travail des bénévoles",
        whyCorrect:
          "Thomas explicitly links two things as his motivation: adopting his dog at the shelter, and being deeply moved by watching the volunteers work — which together led him to join himself.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "No friend is mentioned anywhere in the interview — Thomas describes his own experience adopting his dog as the trigger." },
          { optionId: "opt-c", reason: "A school program or required hours is never mentioned — Thomas frames this entirely as a personal choice." },
          { optionId: "opt-d", reason: "Losing a job is never mentioned anywhere in the interview." },
        ],
        vocabulary: [
          { term: "toucher (quelqu'un)", translation: "to move / touch (someone) emotionally" },
          { term: "s'engager", translation: "to commit / get involved" },
        ],
        grammarPattern:
          '"J\'ai été tellement touché que j\'ai décidé" uses "tellement ... que" (so ... that) to link a cause and its consequence — a common structure for explaining what pushed someone to act.',
        strategy:
          "For 'what motivated' questions, listen for a cause-and-effect structure like \"tellement ... que\" — the reason usually comes right before the connector, and the resulting decision right after it.",
      },
    },
    ru: {
      prompt: "Что побудило Тома начать волонтёрствовать в приюте?",
      options: [
        { id: "opt-a", text: "Друг убедил его записаться" },
        { id: "opt-b", text: "Он взял там свою собаку и был тронут работой волонтёров" },
        { id: "opt-c", text: "Ему нужны были волонтёрские часы для школьной программы" },
        { id: "opt-d", text: "Он потерял работу, и у него появилось свободное время" },
      ],
      explanation: {
        whereInRecording:
          'Том прямо объясняет: «j\'ai adopté mon chien dans ce refuge, et j\'ai été tellement touché par le travail des bénévoles que j\'ai décidé de m\'engager moi-même».',
        keywords: "j'ai adopté mon chien dans ce refuge, tellement touché par le travail des bénévoles",
        whyCorrect:
          "Том прямо связывает две вещи как свою мотивацию: то, что он взял собаку в этом приюте, и то, что он был глубоко тронут, наблюдая за работой волонтёров, — вместе это привело его к тому, чтобы присоединиться самому.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Друг вообще не упоминается в интервью — Том описывает собственный опыт усыновления собаки как толчок." },
          { optionId: "opt-c", reason: "Школьная программа или обязательные часы вообще не упоминаются — Том представляет это целиком как личный выбор." },
          { optionId: "opt-d", reason: "Потеря работы вообще не упоминается в интервью." },
        ],
        vocabulary: [
          { term: "toucher (quelqu'un)", translation: "трогать / волновать (кого-то) эмоционально" },
          { term: "s'engager", translation: "включаться / брать на себя обязательство" },
        ],
        grammarPattern:
          '«J\'ai été tellement touché que j\'ai décidé» использует «tellement ... que» (настолько ... что), чтобы связать причину и следствие — распространённая конструкция для объяснения того, что подтолкнуло кого-то к действию.',
        strategy:
          "В вопросах «что побудило» слушайте конструкцию причины и следствия вроде «tellement ... que» — причина обычно идёт прямо перед союзом, а итоговое решение — сразу после него.",
      },
    },
    kz: {
      prompt: "Томасты панада еріктілік етуге не итермеледі?",
      options: [
        { id: "opt-a", text: "Досы оны жазылуға көндірді" },
        { id: "opt-b", text: "Ол итін сол жерден алды және еріктілердің жұмысына қатты әсерленді" },
        { id: "opt-c", text: "Оған мектеп бағдарламасы үшін еріктілік сағаттары керек болды" },
        { id: "opt-d", text: "Ол жұмысынан айырылып, бос уақыты пайда болды" },
      ],
      explanation: {
        whereInRecording:
          'Томас тікелей түсіндіреді: «j\'ai adopté mon chien dans ce refuge, et j\'ai été tellement touché par le travail des bénévoles que j\'ai décidé de m\'engager moi-même».',
        keywords: "j'ai adopté mon chien dans ce refuge, tellement touché par le travail des bénévoles",
        whyCorrect:
          "Томас өз түрткісі ретінде екі нәрсені нақты байланыстырады: итін осы панадан алғанын және еріктілердің жұмысын көріп қатты әсерленгенін — бұлар бірге оны өзінің де қосылуына әкелді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Дос сұхбатта мүлдем аталмайды — Томас итін алу тәжірибесін өзінің түрткісі ретінде сипаттайды." },
          { optionId: "opt-c", reason: "Мектеп бағдарламасы немесе міндетті сағаттар мүлдем аталмайды — Томас мұны толығымен жеке таңдау ретінде көрсетеді." },
          { optionId: "opt-d", reason: "Жұмысынан айырылу сұхбатта мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "toucher (quelqu'un)", translation: "біреуді эмоционалды түрде толғандыру" },
          { term: "s'engager", translation: "міндеттену / қатысу" },
        ],
        grammarPattern:
          '«J\'ai été tellement touché que j\'ai décidé» себеп пен салдарды байланыстыру үшін «tellement ... que» (сонша ... ки) құрылымын қолданады — біреуді әрекетке итермелеген нәрсені түсіндірудің кең тараған құрылымы.',
        strategy:
          "«Не итермеледі» деген сұрақтарда «tellement ... que» сияқты себеп-салдар құрылымына құлақ түріңіз — себеп әдетте жалғаулықтың алдында, ал нәтижелі шешім одан кейін бірден келеді.",
      },
    },
  },
};

const b1VolunteerQ2: QuestionSpec = {
  id: "b1-volunteer-interview-1-q2",
  recordingId: "b1-volunteer-interview-1",
  questionNumber: 2,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "According to Thomas, what does he actually do at the shelter? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Walking the dogs and cleaning their spaces" },
        { id: "opt-b", text: "Giving veterinary medical care" },
        { id: "opt-c", text: "Helping visitors on open house days find a matching animal" },
        { id: "opt-d", text: "Managing the shelter's finances" },
      ],
      explanation: {
        whereInRecording:
          'Thomas describes his tasks directly: "Je m\'occupe surtout de promener les chiens et de nettoyer leurs espaces, mais je participe aussi aux journées portes ouvertes pour aider les visiteurs à trouver l\'animal qui leur correspond."',
        keywords: "promener les chiens et nettoyer leurs espaces; aider les visiteurs à trouver l'animal qui leur correspond",
        whyCorrect:
          "Thomas names exactly two categories of tasks: walking dogs and cleaning their spaces, plus helping visitors find a matching animal during open house days — both stated directly as his own activities.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Veterinary care is never mentioned anywhere in the interview — Thomas describes only practical and visitor-facing tasks, not medical ones." },
          { optionId: "opt-d", reason: "Finances or administration are never mentioned anywhere in the interview." },
        ],
        vocabulary: [
          { term: "promener", translation: "to walk (an animal)" },
          { term: "une journée portes ouvertes", translation: "an open house day" },
        ],
        grammarPattern:
          '"Je m\'occupe surtout de" + infinitive introduces his main responsibilities, and "je participe aussi" adds a secondary one — "surtout" (mainly) and "aussi" (also) signal a primary task versus an additional one.',
        strategy:
          "When a speaker uses \"surtout\" for a main task and \"aussi\" for an additional one, both count as things they genuinely do — for select-all questions, make sure to capture both the primary and secondary activities, not just the first one mentioned.",
      },
    },
    ru: {
      prompt: "По словам Тома, чем он на самом деле занимается в приюте? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Выгуливает собак и убирает их вольеры" },
        { id: "opt-b", text: "Оказывает ветеринарную помощь" },
        { id: "opt-c", text: "Помогает посетителям в дни открытых дверей найти подходящее животное" },
        { id: "opt-d", text: "Занимается финансами приюта" },
      ],
      explanation: {
        whereInRecording:
          'Том прямо описывает свои задачи: «Je m\'occupe surtout de promener les chiens et de nettoyer leurs espaces, mais je participe aussi aux journées portes ouvertes pour aider les visiteurs à trouver l\'animal qui leur correspond».',
        keywords: "promener les chiens et nettoyer leurs espaces; aider les visiteurs à trouver l'animal qui leur correspond",
        whyCorrect:
          "Том называет ровно две категории задач: выгул собак и уборка их вольеров, а также помощь посетителям в поиске подходящего животного в дни открытых дверей — обе прямо названы как его собственные занятия.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Ветеринарная помощь вообще не упоминается в интервью — Том описывает только практические задачи и работу с посетителями, а не медицинские." },
          { optionId: "opt-d", reason: "Финансы или администрирование вообще не упоминаются в интервью." },
        ],
        vocabulary: [
          { term: "promener", translation: "выгуливать (животное)" },
          { term: "une journée portes ouvertes", translation: "день открытых дверей" },
        ],
        grammarPattern:
          '«Je m\'occupe surtout de» + инфинитив вводит его основные обязанности, а «je participe aussi» добавляет второстепенную — «surtout» (главным образом) и «aussi» (также) сигнализируют об основной задаче в противовес дополнительной.',
        strategy:
          "Когда говорящий использует «surtout» для основной задачи и «aussi» для дополнительной, обе считаются тем, чем он действительно занимается — в вопросах «выберите все» обязательно фиксируйте и основную, и второстепенную деятельность, а не только первую упомянутую.",
      },
    },
    kz: {
      prompt: "Томастың айтуынша, ол панада нақты немен айналысады? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Иттерді серуендетеді және олардың орындарын тазалайды" },
        { id: "opt-b", text: "Ветеринарлық көмек көрсетеді" },
        { id: "opt-c", text: "Ашық есік күндерінде келушілерге сәйкес жануар табуға көмектеседі" },
        { id: "opt-d", text: "Панадағы қаржыны басқарады" },
      ],
      explanation: {
        whereInRecording:
          'Томас өз тапсырмаларын тікелей сипаттайды: «Je m\'occupe surtout de promener les chiens et de nettoyer leurs espaces, mais je participe aussi aux journées portes ouvertes pour aider les visiteurs à trouver l\'animal qui leur correspond».',
        keywords: "promener les chiens et nettoyer leurs espaces; aider les visiteurs à trouver l'animal qui leur correspond",
        whyCorrect:
          "Томас дәл екі санат тапсырманы атайды: иттерді серуендету және олардың орындарын тазалау, сондай-ақ ашық есік күндерінде келушілерге сәйкес жануар табуға көмектесу — екеуі де оның өз әрекеттері ретінде тікелей аталады.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Ветеринарлық көмек сұхбатта мүлдем аталмайды — Томас тек практикалық және келушілермен жұмысты сипаттайды, медициналықты емес." },
          { optionId: "opt-d", reason: "Қаржы немесе әкімшілік мәселелер сұхбатта мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "promener", translation: "серуендету (жануарды)" },
          { term: "une journée portes ouvertes", translation: "ашық есік күні" },
        ],
        grammarPattern:
          '«Je m\'occupe surtout de» + инфинитив оның негізгі міндеттерін енгізеді, ал «je participe aussi» қосымша міндетті қосады — «surtout» (негізінен) және «aussi» (сонымен қатар) негізгі тапсырманы қосымшадан ажыратады.',
        strategy:
          "Сөйлеуші негізгі тапсырма үшін «surtout», қосымша үшін «aussi» қолданғанда, екеуі де оның нақты істейтін ісі болып саналады — «барлығын таңда» сұрақтарында тек біріншісін емес, негізгі және қосымша әрекеттің екеуін де қамтығаныңызға көз жеткізіңіз.",
      },
    },
  },
};

const b1VolunteerQ3: QuestionSpec = {
  id: "b1-volunteer-interview-1-q3",
  recordingId: "b1-volunteer-interview-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "True or false: Thomas says this work is always purely joyful, with no difficult moments.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'Thomas admits directly: "dire au revoir aux animaux ... c\'est un mélange de tristesse et de joie" (saying goodbye to the animals ... is a mix of sadness and joy).',
        keywords: "un mélange de tristesse et de joie",
        whyCorrect:
          'This is false: Thomas explicitly describes his emotional experience as "un mélange de tristesse et de joie" (a mix of sadness and joy), not purely positive.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'This contradicts Thomas\'s own answer to the journalist\'s question about emotional difficulty — he says "oui, honnêtement" it can be hard, and describes a genuine mix of emotions, not constant joy.',
          },
        ],
        vocabulary: [
          { term: "un mélange", translation: "a mix / blend" },
          { term: "la tristesse", translation: "sadness" },
        ],
        grammarPattern:
          '"Un mélange de tristesse et de joie" links two contrasting nouns with "et" to express a complex, mixed emotion — a useful structure for describing nuanced feelings in French.',
        strategy:
          "When a speaker is asked directly whether something is difficult, expect a nuanced answer rather than a flat yes or no — true/false statements often oversimplify this kind of nuanced response into an absolute claim.",
      },
    },
    ru: {
      prompt: "Верно или неверно: Том говорит, что эта работа всегда приносит только радость, без трудных моментов.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Том прямо признаётся: «dire au revoir aux animaux ... c\'est un mélange de tristesse et de joie» (прощаться с животными ... это смесь грусти и радости).',
        keywords: "un mélange de tristesse et de joie",
        whyCorrect:
          'Это неверно: Том прямо описывает своё эмоциональное переживание как «un mélange de tristesse et de joie» (смесь грусти и радости), а не как исключительно положительное.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'Это противоречит собственному ответу Тома на вопрос журналиста об эмоциональных трудностях — он говорит «oui, honnêtement», что это может быть тяжело, и описывает настоящую смесь эмоций, а не постоянную радость.',
          },
        ],
        vocabulary: [
          { term: "un mélange", translation: "смесь" },
          { term: "la tristesse", translation: "грусть" },
        ],
        grammarPattern:
          '«Un mélange de tristesse et de joie» связывает два противоположных существительных союзом «et», выражая сложное, смешанное чувство — полезная конструкция для описания нюансированных эмоций во французском.',
        strategy:
          "Когда говорящего прямо спрашивают, трудно ли что-то, ожидайте нюансированный ответ, а не однозначное да или нет — утверждения верно/неверно часто упрощают такой нюансированный ответ до абсолютного заявления.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: Томас бұл жұмыс әрқашан таза қуаныш әкеледі, қиын сәттер жоқ дейді.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Томас тікелей мойындайды: «dire au revoir aux animaux ... c\'est un mélange de tristesse et de joie» (жануарлармен қоштасу ... бұл қайғы мен қуаныштың қоспасы).',
        keywords: "un mélange de tristesse et de joie",
        whyCorrect:
          'Бұл бұрыс: Томас өз эмоционалды тәжірибесін таза оң емес, «un mélange de tristesse et de joie» (қайғы мен қуаныштың қоспасы) деп нақты сипаттайды.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'Бұл Томастың журналистің эмоционалды қиындық туралы сұрағына өз жауабына қайшы келеді — ол «oui, honnêtement» деп бұл қиын болуы мүмкін дейді және шынайы эмоциялар қоспасын сипаттайды, тұрақты қуанышты емес.',
          },
        ],
        vocabulary: [
          { term: "un mélange", translation: "қоспа" },
          { term: "la tristesse", translation: "қайғы" },
        ],
        grammarPattern:
          '«Un mélange de tristesse et de joie» «et» жалғаулығымен екі қарама-қарсы зат есімді байланыстырып, күрделі, аралас сезімді білдіреді — француз тілінде нәзік сезімдерді сипаттаудың пайдалы құрылымы.',
        strategy:
          "Сөйлеушіден бір нәрсе қиын ба деп тікелей сұрағанда, тегіс иә немесе жоқ жауабын емес, нәзік жауапты күтіңіз — дұрыс/бұрыс тұжырымдар көбіне мұндай нәзік жауапты абсолютті мәлімдемеге дейін жеңілдетеді.",
      },
    },
  },
};

const b1RemoteWorkQ1: QuestionSpec = {
  id: "b1-remote-work-discussion-1-q1",
  recordingId: "b1-remote-work-discussion-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "According to the recent survey mentioned, what percentage of employees prefer at least two remote days per week?",
      options: [
        { id: "opt-a", text: "About 20%" },
        { id: "opt-b", text: "About 40%" },
        { id: "opt-c", text: "About 60%" },
        { id: "opt-d", text: "About 80%" },
      ],
      explanation: {
        whereInRecording:
          'The report states this precisely: "environ soixante pour cent des employés interrogés affirment préférer travailler au moins deux jours par semaine depuis leur domicile."',
        keywords: "environ soixante pour cent des employés interrogés",
        whyCorrect:
          'The report directly cites "soixante pour cent" (sixty percent) as the share of surveyed employees preferring at least two remote days a week.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "20% is never stated anywhere in the report — this figure doesn't appear in the recording." },
          { optionId: "opt-b", reason: '40% is never stated anywhere in the report — the actual figure given is sixty, not forty, percent.' },
          { optionId: "opt-d", reason: "80% is never stated anywhere in the report — this figure doesn't appear in the recording." },
        ],
        vocabulary: [
          { term: "un sondage", translation: "a survey / poll" },
          { term: "le domicile", translation: "one's home / residence" },
        ],
        grammarPattern:
          '"Affirment préférer" uses "affirmer" + infinitive to report what survey respondents claim — a formal way of citing a stated preference without full direct quotation.',
        strategy:
          "News and survey reports frequently open with a single key percentage — make sure you catch it clearly the first time it's stated, since it typically isn't repeated later in the report.",
      },
    },
    ru: {
      prompt: "Согласно упомянутому недавнему опросу, какой процент сотрудников предпочитает минимум два дня удалённой работы в неделю?",
      options: [
        { id: "opt-a", text: "Около 20%" },
        { id: "opt-b", text: "Около 40%" },
        { id: "opt-c", text: "Около 60%" },
        { id: "opt-d", text: "Около 80%" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже это указано точно: «environ soixante pour cent des employés interrogés affirment préférer travailler au moins deux jours par semaine depuis leur domicile».',
        keywords: "environ soixante pour cent des employés interrogés",
        whyCorrect:
          'В репортаже прямо приводится «soixante pour cent» (шестьдесят процентов) как доля опрошенных сотрудников, предпочитающих минимум два удалённых дня в неделю.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "20% нигде в репортаже не упоминаются — эта цифра не появляется в записи." },
          { optionId: "opt-b", reason: "40% нигде в репортаже не упоминаются — фактически указанная цифра — шестьдесят, а не сорок процентов." },
          { optionId: "opt-d", reason: "80% нигде в репортаже не упоминаются — эта цифра не появляется в записи." },
        ],
        vocabulary: [
          { term: "un sondage", translation: "опрос" },
          { term: "le domicile", translation: "место жительства / дом" },
        ],
        grammarPattern:
          '«Affirment préférer» использует «affirmer» + инфинитив, чтобы передать то, что заявляют участники опроса — формальный способ цитировать заявленное предпочтение без полной прямой цитаты.',
        strategy:
          "Новостные и опросные репортажи часто начинаются с одного ключевого процента — убедитесь, что вы чётко уловили его при первом упоминании, поскольку обычно он не повторяется позже в репортаже.",
      },
    },
    kz: {
      prompt: "Аталған соңғы сауалнама бойынша, қызметкерлердің қанша пайызы аптасына кемінде екі күн қашықтан жұмыс істеуді қалайды?",
      options: [
        { id: "opt-a", text: "Шамамен 20%" },
        { id: "opt-b", text: "Шамамен 40%" },
        { id: "opt-c", text: "Шамамен 60%" },
        { id: "opt-d", text: "Шамамен 80%" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда бұл нақты айтылады: «environ soixante pour cent des employés interrogés affirment préférer travailler au moins deux jours par semaine depuis leur domicile».',
        keywords: "environ soixante pour cent des employés interrogés",
        whyCorrect:
          'Репортажда сауалнамаға қатысқан қызметкерлердің аптасына кемінде екі күн қашықтан жұмыс істеуді қалайтын үлесі ретінде «soixante pour cent» (алпыс пайыз) тікелей келтіріледі.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "20% репортажда мүлдем аталмайды — бұл сан жазбада кездеспейді." },
          { optionId: "opt-b", reason: "40% репортажда мүлдем аталмайды — нақты көрсетілген сан қырық емес, алпыс пайыз." },
          { optionId: "opt-d", reason: "80% репортажда мүлдем аталмайды — бұл сан жазбада кездеспейді." },
        ],
        vocabulary: [
          { term: "un sondage", translation: "сауалнама" },
          { term: "le domicile", translation: "тұрғылықты жер / үй" },
        ],
        grammarPattern:
          '«Affirment préférer» сауалнамаға қатысушылардың мәлімдегенін жеткізу үшін «affirmer» + инфинитивті қолданады — толық тікелей дәйексөзсіз айтылған қалауды келтірудің ресми тәсілі.',
        strategy:
          "Жаңалықтар мен сауалнама репортаждары көбіне бір негізгі пайыздан басталады — оны бірінші айтылған кезде анық ұстап қалыңыз, себебі әдетте ол репортаждың кейінгі бөлігінде қайталанбайды.",
      },
    },
  },
};

const b1RemoteWorkQ2: QuestionSpec = {
  id: "b1-remote-work-discussion-1-q2",
  recordingId: "b1-remote-work-discussion-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What solution have several companies put in place to address managers' concerns?",
      options: [
        { id: "opt-a", text: "Banning remote work entirely" },
        { id: "opt-b", text: "Requiring in-office presence on specific days, like Tuesday and Thursday" },
        { id: "opt-c", text: "Paying a bonus to employees who come to the office" },
        { id: "opt-d", text: "Reducing the length of the work week for everyone" },
      ],
      explanation: {
        whereInRecording:
          'The report explains: "plusieurs sociétés ont mis en place des journées obligatoires de présence au bureau, généralement le mardi et le jeudi, afin de conserver des moments d\'échange en personne."',
        keywords: "journées obligatoires de présence au bureau, généralement le mardi et le jeudi",
        whyCorrect:
          "The report directly names this compromise: mandatory in-office days, typically Tuesday and Thursday, introduced specifically to preserve in-person collaboration time.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "A full ban on remote work is never mentioned — companies keep remote work but add mandatory office days, rather than eliminating it." },
          { optionId: "opt-c", reason: "A financial bonus is never mentioned anywhere in the report as the solution used." },
          { optionId: "opt-d", reason: "Reducing the work week is never mentioned — the report is entirely about where work happens, not how many hours are worked." },
        ],
        vocabulary: [
          { term: "mettre en place", translation: "to put in place / implement" },
          { term: "obligatoire", translation: "mandatory" },
        ],
        grammarPattern:
          '"Afin de conserver" uses "afin de" + infinitive to express purpose — a more formal equivalent of "pour," common in news and analytical reports.',
        strategy:
          "When a report describes a problem (managers' concerns) followed by a company response, expect the response to directly address that specific problem — check that the option you pick actually solves the stated concern, not just any workplace policy.",
      },
    },
    ru: {
      prompt: "Какое решение внедрили некоторые компании, чтобы учесть опасения руководителей?",
      options: [
        { id: "opt-a", text: "Полностью запретили удалённую работу" },
        { id: "opt-b", text: "Ввели обязательное присутствие в офисе в определённые дни, например, во вторник и четверг" },
        { id: "opt-c", text: "Стали платить бонус сотрудникам, приходящим в офис" },
        { id: "opt-d", text: "Сократили длительность рабочей недели для всех" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже объясняется: «plusieurs sociétés ont mis en place des journées obligatoires de présence au bureau, généralement le mardi et le jeudi, afin de conserver des moments d\'échange en personne».',
        keywords: "journées obligatoires de présence au bureau, généralement le mardi et le jeudi",
        whyCorrect:
          "В репортаже прямо называется этот компромисс: обязательные офисные дни, как правило вторник и четверг, введённые специально для сохранения времени личного общения.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Полный запрет удалённой работы вообще не упоминается — компании сохраняют удалённую работу, но добавляют обязательные офисные дни, а не отменяют её." },
          { optionId: "opt-c", reason: "Финансовый бонус нигде в репортаже не упоминается как использованное решение." },
          { optionId: "opt-d", reason: "Сокращение рабочей недели вообще не упоминается — репортаж целиком о том, где работа выполняется, а не о количестве отработанных часов." },
        ],
        vocabulary: [
          { term: "mettre en place", translation: "внедрять / вводить в действие" },
          { term: "obligatoire", translation: "обязательный" },
        ],
        grammarPattern:
          '«Afin de conserver» использует «afin de» + инфинитив для выражения цели — более формальный эквивалент «pour», распространённый в новостных и аналитических репортажах.',
        strategy:
          "Когда в репортаже описывается проблема (опасения руководителей), за которой следует реакция компании, ожидайте, что реакция напрямую решает именно эту проблему — проверьте, действительно ли выбранный вами вариант решает указанное опасение, а не просто является какой-то рабочей политикой.",
      },
    },
    kz: {
      prompt: "Бірнеше компания менеджерлердің алаңдаушылығын шешу үшін қандай шешім қолданды?",
      options: [
        { id: "opt-a", text: "Қашықтан жұмысты толығымен тыйым салды" },
        { id: "opt-b", text: "Белгілі бір күндерде, мысалы сейсенбі мен бейсенбіде, кеңседе болуды міндеттеді" },
        { id: "opt-c", text: "Кеңсеге келетін қызметкерлерге сыйақы төлей бастады" },
        { id: "opt-d", text: "Барлығы үшін жұмыс аптасының ұзақтығын қысқартты" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда түсіндіріледі: «plusieurs sociétés ont mis en place des journées obligatoires de présence au bureau, généralement le mardi et le jeudi, afin de conserver des moments d\'échange en personne».',
        keywords: "journées obligatoires de présence au bureau, généralement le mardi et le jeudi",
        whyCorrect:
          "Репортажда бұл ымыраны тікелей атайды: кеңседе болу міндетті күндер, әдетте сейсенбі мен бейсенбі, тікелей адами қарым-қатынас уақытын сақтау үшін енгізілген.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Қашықтан жұмысқа толық тыйым салу мүлдем аталмайды — компаниялар қашықтан жұмысты сақтайды, бірақ оны жойып жіберудің орнына міндетті кеңсе күндерін қосады." },
          { optionId: "opt-c", reason: "Қаржылық сыйақы қолданылған шешім ретінде репортажда мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Жұмыс аптасын қысқарту мүлдем аталмайды — репортаж толығымен жұмыстың қай жерде орындалатыны туралы, сағат саны туралы емес." },
        ],
        vocabulary: [
          { term: "mettre en place", translation: "енгізу / қолданысқа енгізу" },
          { term: "obligatoire", translation: "міндетті" },
        ],
        grammarPattern:
          '«Afin de conserver» мақсатты білдіру үшін «afin de» + инфинитивті қолданады — жаңалықтар мен талдамалық репортаждарда кең тараған «pour»-дың неғұрлым ресми баламасы.',
        strategy:
          "Репортажда мәселе (менеджерлердің алаңдаушылығы) сипатталып, одан кейін компанияның реакциясы келгенде, реакция дәл сол мәселені шешеді деп күтіңіз — таңдаған нұсқаңыз жай ғана жұмыс саясаты емес, көрсетілген алаңдаушылықты нақты шешетінін тексеріңіз.",
      },
    },
  },
};

const b1RemoteWorkQ3: QuestionSpec = {
  id: "b1-remote-work-discussion-1-q3",
  recordingId: "b1-remote-work-discussion-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What do experts predict about the future of this hybrid model, according to the report?",
      options: [
        { id: "opt-a", text: "It will disappear within a year" },
        { id: "opt-b", text: "Companies will return to fully in-office work" },
        { id: "opt-c", text: "It will likely become the standard in the years ahead" },
        { id: "opt-d", text: "It will only ever suit a small number of large companies" },
      ],
      explanation: {
        whereInRecording:
          'The report closes with this prediction: "Les experts s\'accordent à dire que ce modèle hybride ... deviendra probablement la norme dans les années à venir."',
        keywords: "deviendra probablement la norme dans les années à venir",
        whyCorrect:
          'Experts are described as agreeing that the hybrid model "deviendra probablement la norme" (will probably become the norm) in the coming years — a clear, shared prediction of growth, not decline.',
        whyIncorrect: [
          { optionId: "opt-a", reason: 'This is the opposite of the prediction — experts foresee the model becoming the norm, not disappearing, and no specific one-year timeframe is given.' },
          { optionId: "opt-b", reason: "A full return to the office is never predicted — the report describes a hybrid model persisting, not a reversal to fully in-person work." },
          { optionId: "opt-d", reason: "The report never limits this prediction to large companies specifically — the trend is described broadly across French companies." },
        ],
        vocabulary: [
          { term: "s'accorder à dire", translation: "to agree in saying / to be in agreement that" },
          { term: "la norme", translation: "the norm / the standard" },
        ],
        grammarPattern:
          '"Deviendra probablement" combines the futur simple with "probablement" (probably) to express a confident but not absolute prediction — a common way to close a balanced news report.',
        strategy:
          "For 'what do experts predict' questions at the end of a report, focus on the final sentence — reports often save the overall outlook or conclusion for last, after walking through the current situation and various reactions.",
      },
    },
    ru: {
      prompt: "Что, согласно репортажу, эксперты предсказывают о будущем этой гибридной модели?",
      options: [
        { id: "opt-a", text: "Она исчезнет в течение года" },
        { id: "opt-b", text: "Компании вернутся к полностью офисной работе" },
        { id: "opt-c", text: "Она, вероятно, станет нормой в ближайшие годы" },
        { id: "opt-d", text: "Она подойдёт только небольшому числу крупных компаний" },
      ],
      explanation: {
        whereInRecording:
          'Репортаж завершается этим прогнозом: «Les experts s\'accordent à dire que ce modèle hybride ... deviendra probablement la norme dans les années à venir».',
        keywords: "deviendra probablement la norme dans les années à venir",
        whyCorrect:
          'Эксперты описаны как согласные в том, что гибридная модель «deviendra probablement la norme» (вероятно, станет нормой) в ближайшие годы — чёткий, общий прогноз роста, а не спада.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Это противоположно прогнозу — эксперты предвидят, что модель станет нормой, а не исчезнет, и никакой конкретный годичный срок не указан." },
          { optionId: "opt-b", reason: "Полное возвращение в офис нигде не предсказывается — в репортаже описывается сохранение гибридной модели, а не возврат к полностью очной работе." },
          { optionId: "opt-d", reason: "Репортаж никогда не ограничивает этот прогноз только крупными компаниями — тенденция описывается широко, применительно ко всем французским компаниям." },
        ],
        vocabulary: [
          { term: "s'accorder à dire", translation: "сходиться во мнении / быть согласными в том, что" },
          { term: "la norme", translation: "норма / стандарт" },
        ],
        grammarPattern:
          '«Deviendra probablement» сочетает futur simple с «probablement» (вероятно), чтобы выразить уверенный, но не абсолютный прогноз — распространённый способ завершить сбалансированный новостной репортаж.',
        strategy:
          "В вопросах «что предсказывают эксперты» в конце репортажа сосредоточьтесь на последнем предложении — репортажи часто оставляют общий вывод или прогноз напоследок, после описания текущей ситуации и различных реакций.",
      },
    },
    kz: {
      prompt: "Репортаж бойынша, сарапшылар осы аралас модельдің болашағы туралы не болжайды?",
      options: [
        { id: "opt-a", text: "Ол бір жыл ішінде жоғалады" },
        { id: "opt-b", text: "Компаниялар толығымен кеңседегі жұмысқа қайта оралады" },
        { id: "opt-c", text: "Ол алдағы жылдары норма болуы ықтимал" },
        { id: "opt-d", text: "Ол тек аз ғана ірі компанияларға сай болады" },
      ],
      explanation: {
        whereInRecording:
          'Репортаж мына болжаммен аяқталады: «Les experts s\'accordent à dire que ce modèle hybride ... deviendra probablement la norme dans les années à venir».',
        keywords: "deviendra probablement la norme dans les années à venir",
        whyCorrect:
          'Сарапшылар аралас модель алдағы жылдары «deviendra probablement la norme» (норма болуы ықтимал) дегенге келіседі деп сипатталады — бұл құлдырау емес, өсудің нақты, ортақ болжамы.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Бұл болжамға қарама-қарсы — сарапшылар модельдің жоғалуын емес, норма болуын болжайды, әрі нақты бір жылдық мерзім берілмейді." },
          { optionId: "opt-b", reason: "Кеңсеге толық оралу мүлдем болжанбайды — репортажда аралас модельдің сақталуы сипатталады, толық жеке кездесуге қайта оралу емес." },
          { optionId: "opt-d", reason: "Репортаж бұл болжамды тек ірі компаниялармен шектемейді — тенденция барлық француз компанияларына қатысты кеңінен сипатталады." },
        ],
        vocabulary: [
          { term: "s'accorder à dire", translation: "бір пікірде болу" },
          { term: "la norme", translation: "норма / стандарт" },
        ],
        grammarPattern:
          '«Deviendra probablement» futur simple шағын «probablement» (ықтимал) сөзімен біріктіріп, сенімді, бірақ абсолютті емес болжамды білдіреді — теңдестірілген жаңалықтар репортажын аяқтаудың кең тараған тәсілі.',
        strategy:
          "Репортаж соңындағы «сарапшылар не болжайды» сұрақтарында соңғы сөйлемге назар аударыңыз — репортаждар көбіне қазіргі жағдай мен әртүрлі реакцияларды сипаттағаннан кейін жалпы болжамды немесе қорытындыны соңына қалдырады.",
      },
    },
  },
};

const b1FestivalQ1: QuestionSpec = {
  id: "b1-local-festival-news-1-q1",
  recordingId: "b1-local-festival-news-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "How many visitors are expected this year, compared to the previous edition?",
      options: [
        { id: "opt-a", text: "10,000 this year, up from 15,000 last time" },
        { id: "opt-b", text: "20,000 this year, up from 15,000 last time" },
        { id: "opt-c", text: "15,000 this year, up from 10,000 last time" },
        { id: "opt-d", text: "15,000 this year, the same as last time" },
      ],
      explanation: {
        whereInRecording:
          'The report states this directly: "plus de quinze mille personnes sont attendues sur les trois jours, contre environ dix mille lors de l\'édition précédente."',
        keywords: "plus de quinze mille personnes ... contre environ dix mille lors de l'édition précédente",
        whyCorrect:
          "The report gives both figures in one sentence: over fifteen thousand expected this year, compared to about ten thousand at the previous edition — a clear increase.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "This reverses the two numbers — the report says fifteen thousand is this year's figure, and ten thousand was the previous one, not the other way around." },
          { optionId: "opt-b", reason: "20,000 is never mentioned anywhere in the report — this figure doesn't appear." },
          { optionId: "opt-d", reason: 'This ignores the comparison entirely — the report explicitly contrasts this year\'s figure with a lower number from the previous edition, not an unchanged figure.' },
        ],
        vocabulary: [
          { term: "attendu(e)", translation: "expected" },
          { term: "contre", translation: "compared to / versus" },
        ],
        grammarPattern:
          '"Contre" is used here to mean "compared to" when contrasting two figures — a common way in French reports to introduce a comparison point right after a statistic.',
        strategy:
          "When a report compares two similar numbers for two different time periods, note which number belongs to \"cette année\" (this year) and which to \"l'édition précédente\" (the previous edition) — the exam often swaps the two.",
      },
    },
    ru: {
      prompt: "Сколько посетителей ожидается в этом году по сравнению с прошлым фестивалем?",
      options: [
        { id: "opt-a", text: "10 000 в этом году, по сравнению с 15 000 в прошлый раз" },
        { id: "opt-b", text: "20 000 в этом году, по сравнению с 15 000 в прошлый раз" },
        { id: "opt-c", text: "15 000 в этом году, по сравнению с 10 000 в прошлый раз" },
        { id: "opt-d", text: "15 000 в этом году, столько же, сколько и в прошлый раз" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже это указано прямо: «plus de quinze mille personnes sont attendues sur les trois jours, contre environ dix mille lors de l\'édition précédente».',
        keywords: "plus de quinze mille personnes ... contre environ dix mille lors de l'édition précédente",
        whyCorrect:
          "В репортаже даны обе цифры в одном предложении: более пятнадцати тысяч ожидается в этом году, по сравнению с около десяти тысячами на прошлом фестивале — явный рост.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Здесь цифры переставлены местами — в репортаже пятнадцать тысяч относится к этому году, а десять тысяч — к предыдущему, а не наоборот." },
          { optionId: "opt-b", reason: "20 000 нигде в репортаже не упоминаются — эта цифра не встречается." },
          { optionId: "opt-d", reason: "Здесь полностью игнорируется сравнение — в репортаже прямо противопоставляется цифра этого года более низкой цифре прошлого фестиваля, а не неизменное значение." },
        ],
        vocabulary: [
          { term: "attendu(e)", translation: "ожидаемый(ая)" },
          { term: "contre", translation: "по сравнению с" },
        ],
        grammarPattern:
          '«Contre» здесь используется в значении «по сравнению с» при противопоставлении двух цифр — распространённый способ во французских репортажах вводить точку сравнения сразу после статистики.',
        strategy:
          "Когда в репортаже сравниваются два похожих числа за два разных периода, отмечайте, какое число относится к «cette année» (этому году), а какое — к «l'édition précédente» (предыдущему изданию) — экзамен часто меняет их местами.",
      },
    },
    kz: {
      prompt: "Биыл алдыңғы фестивальмен салыстырғанда неше келуші күтіледі?",
      options: [
        { id: "opt-a", text: "Биыл 10 000, өткен жолы 15 000 болған" },
        { id: "opt-b", text: "Биыл 20 000, өткен жолы 15 000 болған" },
        { id: "opt-c", text: "Биыл 15 000, өткен жолы 10 000 болған" },
        { id: "opt-d", text: "Биыл 15 000, өткен жолмен бірдей" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда бұл тікелей айтылады: «plus de quinze mille personnes sont attendues sur les trois jours, contre environ dix mille lors de l\'édition précédente».',
        keywords: "plus de quinze mille personnes ... contre environ dix mille lors de l'édition précédente",
        whyCorrect:
          "Репортажда екі сан да бір сөйлемде беріледі: биыл он бес мыңнан астам күтіледі, өткен фестивальде шамамен он мың болған — бұл нақты өсім.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Мұнда екі сан орын ауыстырған — репортажда он бес мың биылғы сан, ал он мың өткен фестивальдікі, керісінше емес." },
          { optionId: "opt-b", reason: "20 000 репортажда мүлдем аталмайды — бұл сан кездеспейді." },
          { optionId: "opt-d", reason: "Бұл салыстыруды мүлдем елемейді — репортажда биылғы сан өткен фестивальдің төменірек санымен нақты салыстырылады, өзгермеген сан емес." },
        ],
        vocabulary: [
          { term: "attendu(e)", translation: "күтілетін" },
          { term: "contre", translation: "салыстырғанда" },
        ],
        grammarPattern:
          '«Contre» мұнда екі санды салыстырғанда «салыстырғанда» дегенді білдіру үшін қолданылады — француз репортаждарында статистикадан кейін бірден салыстыру нүктесін енгізудің кең тараған тәсілі.',
        strategy:
          "Репортажда екі түрлі кезеңге арналған ұқсас екі сан салыстырылғанда, қай сан «cette année» (биылғы), қай сан «l'édition précédente»-ге (өткен фестивальге) тиесілі екенін белгілеп алыңыз — емтихан оларды жиі ауыстырып жібереді.",
      },
    },
  },
};

const b1FestivalQ2: QuestionSpec = {
  id: "b1-local-festival-news-1-q2",
  recordingId: "b1-local-festival-news-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What does the report give as one reason for the expected rise in attendance?",
      options: [
        { id: "opt-a", text: "Ticket prices have been lowered" },
        { id: "opt-b", text: "An international group will perform for the first time" },
        { id: "opt-c", text: "The festival has been extended to five days" },
        { id: "opt-d", text: "A new metro line now serves the festival grounds" },
      ],
      explanation: {
        whereInRecording:
          'The report explains: "un groupe international se produira samedi soir, ce qui explique en partie l\'augmentation attendue de la fréquentation."',
        keywords: "un groupe international se produira, ce qui explique en partie l'augmentation attendue",
        whyCorrect:
          'The report directly connects the two facts with "ce qui explique en partie" (which partly explains) — the first-time appearance of an international group is given as a reason for the expected rise in visitors.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Ticket prices are never mentioned — the report states the concerts are free, but doesn't compare this to a previous, higher price." },
          { optionId: "opt-c", reason: 'The festival remains three days long ("sur les trois jours") — it is never described as being extended.' },
          { optionId: "opt-d", reason: "No metro line is ever mentioned — the report only discusses free shuttle buses from parking areas outside downtown." },
        ],
        vocabulary: [
          { term: "se produire", translation: "to perform (on stage)" },
          { term: "la fréquentation", translation: "attendance / footfall" },
        ],
        grammarPattern:
          '"Ce qui explique en partie" uses "ce qui" to refer back to the whole previous clause, then "en partie" (partly) softens the claim — signaling this is one contributing factor, not the sole cause.',
        strategy:
          "When a report explicitly links two facts with a phrase like \"ce qui explique,\" that connector is the exam's clearest signal of cause and effect — treat the fact right before it as the answer to a 'why' or 'reason' question.",
      },
    },
    ru: {
      prompt: "Что репортаж называет одной из причин ожидаемого роста посещаемости?",
      options: [
        { id: "opt-a", text: "Цены на билеты снизили" },
        { id: "opt-b", text: "Впервые выступит международная группа" },
        { id: "opt-c", text: "Фестиваль продлили до пяти дней" },
        { id: "opt-d", text: "К территории фестиваля теперь ходит новая линия метро" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже объясняется: «un groupe international se produira samedi soir, ce qui explique en partie l\'augmentation attendue de la fréquentation».',
        keywords: "un groupe international se produira, ce qui explique en partie l'augmentation attendue",
        whyCorrect:
          'Репортаж прямо связывает эти два факта фразой «ce qui explique en partie» (что частично объясняет) — первое выступление международной группы называется причиной ожидаемого роста числа посетителей.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Цены на билеты вообще не упоминаются — в репортаже говорится, что концерты бесплатны, но это не сравнивается с прежней, более высокой ценой." },
          { optionId: "opt-c", reason: 'Фестиваль остаётся трёхдневным («sur les trois jours») — нигде не сказано о его продлении.' },
          { optionId: "opt-d", reason: "Линия метро вообще не упоминается — в репортаже говорится только о бесплатных автобусах-шаттлах от парковок за пределами центра города." },
        ],
        vocabulary: [
          { term: "se produire", translation: "выступать (на сцене)" },
          { term: "la fréquentation", translation: "посещаемость" },
        ],
        grammarPattern:
          '«Ce qui explique en partie» использует «ce qui», чтобы отсылать ко всему предыдущему предложению, а «en partie» (частично) смягчает утверждение — сигнализируя, что это один из способствующих факторов, а не единственная причина.',
        strategy:
          "Когда в репортаже два факта прямо связаны фразой вроде «ce qui explique», этот союз — самый чёткий сигнал причины и следствия для экзамена — считайте факт непосредственно перед ним ответом на вопрос «почему» или «причина».",
      },
    },
    kz: {
      prompt: "Репортаж келушілер санының өсуін күтудің бір себебі ретінде нені атайды?",
      options: [
        { id: "opt-a", text: "Билет бағасы төмендетілді" },
        { id: "opt-b", text: "Алғаш рет халықаралық топ өнер көрсетеді" },
        { id: "opt-c", text: "Фестиваль бес күнге ұзартылды" },
        { id: "opt-d", text: "Фестиваль аумағына жаңа метро желісі жүреді" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда түсіндіріледі: «un groupe international se produira samedi soir, ce qui explique en partie l\'augmentation attendue de la fréquentation».',
        keywords: "un groupe international se produira, ce qui explique en partie l'augmentation attendue",
        whyCorrect:
          'Репортаж екі фактіні «ce qui explique en partie» (бұл ішінара түсіндіреді) деген тіркеспен тікелей байланыстырады — халықаралық топтың алғаш рет өнер көрсетуі күтілетін келушілер санының өсу себебі ретінде беріледі.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Билет бағасы мүлдем аталмайды — репортажда концерттердің тегін екені айтылады, бірақ бұл бұрынғы жоғарырақ бағамен салыстырылмайды." },
          { optionId: "opt-c", reason: 'Фестиваль үш күн болып қалады («sur les trois jours») — оның ұзартылғаны туралы ешбір жерде айтылмайды.' },
          { optionId: "opt-d", reason: "Метро желісі мүлдем аталмайды — репортажда тек қала орталығынан тыс тұрақтардан жүретін тегін шатл автобустар туралы айтылады." },
        ],
        vocabulary: [
          { term: "se produire", translation: "өнер көрсету (сахнада)" },
          { term: "la fréquentation", translation: "келушілер саны" },
        ],
        grammarPattern:
          '«Ce qui explique en partie» алдыңғы бүкіл тармаққа сілтеме жасау үшін «ce qui» қолданады, ал «en partie» (ішінара) тұжырымды жұмсартады — бұл жалғыз себеп емес, ықпал етуші факторлардың бірі екенін білдіреді.',
        strategy:
          "Репортажда екі факт «ce qui explique» сияқты тіркеспен тікелей байланыстырылғанда, бұл жалғаулық емтихандағы себеп-салдардың ең анық белгісі — оның алдындағы фактіні «неге» немесе «себеп» сұрағының жауабы деп қараңыз.",
      },
    },
  },
};

const b1FestivalQ3: QuestionSpec = {
  id: "b1-local-festival-news-1-q3",
  recordingId: "b1-local-festival-news-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b", "opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which of the following does the report mention as part of the festival? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Free concerts on the main square" },
        { id: "opt-b", text: "Music workshops for children" },
        { id: "opt-c", text: "A local craft market" },
        { id: "opt-d", text: "A paid boat tour of the lake" },
      ],
      explanation: {
        whereInRecording:
          'The report lists these directly: "des concerts gratuits sur la place principale, mais aussi des ateliers de musique pour les enfants et un marché artisanal local."',
        keywords: "des concerts gratuits sur la place principale, des ateliers de musique pour les enfants, un marché artisanal local",
        whyCorrect:
          "The report names exactly three festival features in one sentence: free concerts on the main square, music workshops for children, and a local craft market — all part of the program.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              'A boat tour is never mentioned — the lake is only referenced at the very end, as the location of the closing fireworks display, not a paid activity.',
          },
        ],
        vocabulary: [
          { term: "un atelier", translation: "a workshop" },
          { term: "artisanal(e)", translation: "handcrafted / artisanal" },
        ],
        grammarPattern:
          '"Mais aussi" links a second and third item to a first ("des concerts gratuits ... mais aussi des ateliers ... et un marché") — a common way to list multiple program features without repeating "il y a" each time.',
        strategy:
          "For select-all questions about a festival program, listen for the full list introduced by \"au programme\" and connected with \"mais aussi\" and \"et\" — items mentioned elsewhere in the report for a different purpose (like the lake for fireworks) don't count as program activities.",
      },
    },
    ru: {
      prompt: "Что из перечисленного репортаж упоминает как часть фестиваля? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Бесплатные концерты на главной площади" },
        { id: "opt-b", text: "Музыкальные мастер-классы для детей" },
        { id: "opt-c", text: "Местный ремесленный рынок" },
        { id: "opt-d", text: "Платная лодочная экскурсия по озеру" },
      ],
      explanation: {
        whereInRecording:
          'Репортаж прямо перечисляет это: «des concerts gratuits sur la place principale, mais aussi des ateliers de musique pour les enfants et un marché artisanal local».',
        keywords: "des concerts gratuits sur la place principale, des ateliers de musique pour les enfants, un marché artisanal local",
        whyCorrect:
          "Репортаж называет ровно три элемента программы фестиваля в одном предложении: бесплатные концерты на главной площади, музыкальные мастер-классы для детей и местный ремесленный рынок — всё это часть программы.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason:
              "Лодочная экскурсия вообще не упоминается — озеро упоминается только в самом конце как место проведения заключительного фейерверка, а не как платное мероприятие.",
          },
        ],
        vocabulary: [
          { term: "un atelier", translation: "мастер-класс" },
          { term: "artisanal(e)", translation: "ремесленный" },
        ],
        grammarPattern:
          '«Mais aussi» связывает второй и третий элемент с первым («des concerts gratuits ... mais aussi des ateliers ... et un marché») — распространённый способ перечислить несколько элементов программы, не повторяя «il y a» каждый раз.',
        strategy:
          "В вопросах «выберите все» о программе фестиваля слушайте полный список, вводимый словами «au programme» и связанный «mais aussi» и «et» — элементы, упомянутые в другом месте репортажа для другой цели (например, озеро для фейерверка), не считаются частью программы.",
      },
    },
    kz: {
      prompt: "Репортаж фестивальдің құрамдас бөлігі ретінде төмендегілердің қайсысын атайды? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Басты алаңдағы тегін концерттер" },
        { id: "opt-b", text: "Балаларға арналған музыка шеберханалары" },
        { id: "opt-c", text: "Жергілікті қолөнер базары" },
        { id: "opt-d", text: "Көлдегі ақылы қайық серуені" },
      ],
      explanation: {
        whereInRecording:
          'Репортаж мұны тікелей тізеді: «des concerts gratuits sur la place principale, mais aussi des ateliers de musique pour les enfants et un marché artisanal local».',
        keywords: "des concerts gratuits sur la place principale, des ateliers de musique pour les enfants, un marché artisanal local",
        whyCorrect:
          "Репортаж бір сөйлемде дәл үш фестиваль элементін атайды: басты алаңдағы тегін концерттер, балаларға арналған музыка шеберханалары және жергілікті қолөнер базары — барлығы бағдарламаның бөлігі.",
        whyIncorrect: [
          {
            optionId: "opt-d",
            reason: "Қайық серуені мүлдем аталмайды — көл тек соңында қорытынды отшашу өтетін орын ретінде аталады, ақылы іс-шара емес.",
          },
        ],
        vocabulary: [
          { term: "un atelier", translation: "шеберхана" },
          { term: "artisanal(e)", translation: "қолөнер" },
        ],
        grammarPattern:
          '«Mais aussi» екінші және үшінші элементті біріншісімен байланыстырады («des concerts gratuits ... mais aussi des ateliers ... et un marché») — әр жолы «il y a» дегенді қайталамай, бірнеше бағдарлама элементін тізудің кең тараған тәсілі.',
        strategy:
          "Фестиваль бағдарламасы туралы «барлығын таңда» сұрақтарында «au programme» деп енгізілген, «mais aussi» мен «et» арқылы байланысқан толық тізімге құлақ түріңіз — репортажда басқа мақсатпен аталған элементтер (мысалы, отшашу үшін көл) бағдарлама іс-шарасы болып саналмайды.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// B2 — Avancé: documentaries, debates, radio. Nuanced, formal register,
// ~200-320 words.
// ---------------------------------------------------------------------------

const B2_AI_DOCUMENTARY: ListeningRecording = {
  id: "b2-ai-employment-documentary-1",
  partLabel: "Document 1",
  topic: "Documentary excerpt on AI and employment",
  transcript:
    "Depuis quelques années, l'intelligence artificielle transforme profondément le monde du travail, et les avis sur cette évolution restent partagés. D'un côté, certains experts affirment que l'automatisation va supprimer des millions d'emplois, notamment dans les secteurs administratifs et industriels, où les tâches répétitives peuvent facilement être confiées à des algorithmes. D'un autre côté, d'autres chercheurs soutiennent que chaque révolution technologique a toujours fini par créer davantage d'emplois qu'elle n'en a détruits, à condition que les travailleurs puissent se former à de nouvelles compétences. Selon une étude récente publiée par un institut européen, près de quarante pour cent des tâches actuellement effectuées par des employés pourraient être automatisées d'ici quinze ans. Toutefois, les auteurs de cette étude nuancent leurs conclusions : ils précisent que l'impact variera énormément selon les secteurs et les pays, et que les métiers exigeant de la créativité, de l'empathie ou une prise de décision complexe resteront difficiles à remplacer. Face à ces bouleversements, plusieurs gouvernements ont commencé à investir massivement dans la formation continue, afin d'aider les travailleurs à s'adapter plutôt que d'être remplacés. Certains syndicats, en revanche, dénoncent ce qu'ils considèrent comme une réponse insuffisante, et réclament une régulation plus stricte de l'utilisation de l'intelligence artificielle dans les entreprises. Quoi qu'il en soit, une chose semble faire consensus parmi les spécialistes interrogés : ignorer cette transformation serait une erreur, tant elle est déjà en train de redéfinir la nature même du travail.",
  estimatedDurationSeconds: 101,
};

const B2_URBAN_MOBILITY_DEBATE: ListeningRecording = {
  id: "b2-urban-mobility-debate-1",
  partLabel: "Document 2",
  topic: "Radio debate on banning cars from city centers",
  transcript:
    "Animateur : Ce soir, nous débattons d'une question qui divise : faut-il interdire complètement les voitures dans les centres-villes ? Nous accueillons Élise Rocher, urbaniste, et Marc Ferrand, représentant d'une association de commerçants. Élise, commençons par vous. Élise : Je suis convaincue que la réduction de la circulation automobile est indispensable. La pollution de l'air cause chaque année des milliers de décès prématurés, et les villes qui ont déjà limité l'accès aux voitures, comme certaines villes du nord de l'Europe, ont vu la qualité de vie de leurs habitants s'améliorer considérablement : moins de bruit, moins de pollution, et davantage d'espace pour les piétons et les cyclistes. Animateur : Marc, vous n'êtes pas de cet avis. Marc : Non, pas entièrement. Je comprends les arguments écologiques, mais il faut aussi penser aux conséquences économiques. Beaucoup de commerçants dépendent des clients qui viennent en voiture, en particulier les personnes âgées ou celles qui habitent en périphérie. Si on interdit brutalement l'accès aux véhicules, certains commerces risquent de fermer. Élise : Je ne propose pas une interdiction brutale, mais une transition progressive, accompagnée par exemple de transports en commun gratuits ou de parkings relais à l'entrée des villes. Marc : Sur ce point, nous sommes d'accord : si la transition est bien accompagnée, avec de vraies alternatives, elle sera beaucoup mieux acceptée par la population. Animateur : Merci à tous les deux pour cet échange stimulant. Nous continuerons ce débat la semaine prochaine avec de nouveaux invités.",
  estimatedDurationSeconds: 102,
};

const B2_CLIMATE_MIGRATION_DOCUMENTARY: ListeningRecording = {
  id: "b2-climate-migration-documentary-1",
  partLabel: "Document 3",
  topic: "Documentary excerpt on climate-driven migration",
  transcript:
    "Le changement climatique ne bouleverse pas seulement les écosystèmes : il redessine également la carte des migrations humaines à l'échelle mondiale. Selon les projections des Nations Unies, plusieurs dizaines de millions de personnes pourraient être contraintes de quitter leur région d'ici le milieu du siècle, en raison de la montée du niveau des mers, de la désertification ou de la multiplication des catastrophes naturelles. Certaines zones côtières d'Asie du Sud-Est sont déjà particulièrement touchées : des villages entiers ont dû être déplacés après que la mer a englouti une partie de leurs terres cultivables. Face à cette réalité, la communauté internationale peine encore à trouver un cadre juridique adapté : contrairement aux réfugiés fuyant un conflit armé, les personnes déplacées pour des raisons climatiques ne bénéficient d'aucun statut international clairement défini, ce qui complique considérablement leur accès à une protection légale. Certains pays, comme la Nouvelle-Zélande, ont commencé à explorer des dispositifs spécifiques, sans toutefois parvenir à un accord global. Par ailleurs, les experts soulignent que ce phénomène ne touchera pas uniquement les pays pauvres : des régions côtières de pays riches, y compris certaines zones du littoral européen, devront elles aussi envisager des déplacements de population dans les décennies à venir. Ainsi, loin d'être un problème lointain, la question des migrations climatiques concerne, à des degrés divers, l'ensemble de la planète, et appelle une réponse coordonnée que la communauté internationale n'a pour l'instant pas su apporter.",
  estimatedDurationSeconds: 108,
};

const B2_SOCIAL_MEDIA_DEBATE: ListeningRecording = {
  id: "b2-social-media-debate-1",
  partLabel: "Document 4",
  topic: "Radio debate on restricting social media access for minors",
  transcript:
    "Animatrice : Faut-il interdire l'accès aux réseaux sociaux aux moins de quinze ans ? C'est la question que nous posons ce soir à nos deux invités, la psychologue Nadia Belkacem et le sociologue Julien Roussel. Nadia, votre position ? Nadia : Je suis clairement favorable à une restriction stricte. Les études que nous menons montrent une corrélation inquiétante entre l'usage intensif des réseaux sociaux chez les adolescents et l'augmentation des troubles anxieux, ainsi que des problèmes liés à l'image corporelle. Retarder l'accès permettrait aux jeunes de développer leur identité sans cette pression constante. Animatrice : Julien, vous semblez plus réservé sur cette idée. Julien : Je comprends les inquiétudes de Nadia, mais je crains qu'une interdiction pure et simple soit inapplicable et même contre-productive. Les adolescents trouveront toujours des moyens de contourner ces restrictions, et cela risque surtout de couper le dialogue entre parents et enfants sur ce sujet. Je pense qu'il vaudrait mieux investir dans l'éducation aux médias dès l'école primaire. Nadia : Je ne suis pas opposée à l'éducation aux médias, mais je pense qu'elle doit venir en complément d'une régulation plus stricte, pas la remplacer. Julien : Sur ce point précis, je vous rejoins : les deux approches ne sont pas incompatibles, à condition que la régulation reste réaliste et applicable. Animatrice : Merci à tous les deux pour ce débat passionnant.",
  estimatedDurationSeconds: 106,
};

const B2_FOUR_DAY_WEEK_RADIO: ListeningRecording = {
  id: "b2-four-day-week-radio-1",
  partLabel: "Document 5",
  topic: "Radio segment on a company's four-day work week trial",
  transcript:
    "Depuis six mois, une entreprise lyonnaise de taille moyenne expérimente la semaine de quatre jours, sans réduction de salaire pour ses employés. Le principal résultat, selon la direction, est une baisse notable de l'absentéisme, qui a chuté de près de trente pour cent depuis le début de l'essai. La productivité, quant à elle, serait restée stable, voire aurait légèrement progressé dans certains services, notamment grâce à une meilleure concentration des employés sur des journées de travail plus intenses. Cependant, tous les secteurs de l'entreprise ne vivent pas cette transition de la même façon. Dans le service client, par exemple, certains employés se plaignent d'une charge de travail plus lourde à répartir sur seulement quatre jours, ce qui génère parfois davantage de stress en fin de semaine de travail. La direction a annoncé qu'elle prolongerait l'expérimentation encore six mois avant de décider si ce nouveau rythme sera adopté définitivement pour l'ensemble des services. D'autres entreprises françaises observent attentivement cette expérience : si les résultats se confirment sur la durée, plusieurs d'entre elles envisagent de tester à leur tour cette organisation du travail, qui reste pour l'instant minoritaire en France par rapport à d'autres pays européens.",
  estimatedDurationSeconds: 98,
};

const b2AiQ1: QuestionSpec = {
  id: "b2-ai-employment-documentary-1-q1",
  recordingId: "b2-ai-employment-documentary-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is the documentary's overall stance on AI's impact on employment?",
      options: [
        { id: "opt-a", text: "AI will inevitably destroy far more jobs than it creates" },
        { id: "opt-b", text: "The impact will be the same everywhere, regardless of sector or country" },
        {
          id: "opt-c",
          text: "Views are divided, and the real impact will vary by sector — but the change can't be ignored",
        },
        { id: "opt-d", text: "Experts unanimously agree that AI's effect on jobs will be positive" },
      ],
      explanation: {
        whereInRecording:
          'The documentary closes with a balanced summary: "une chose semble faire consensus parmi les spécialistes interrogés : ignorer cette transformation serait une erreur," after presenting both optimistic and pessimistic views and noting "l\'impact variera énormément selon les secteurs et les pays."',
        keywords: "l'impact variera énormément selon les secteurs et les pays; ignorer cette transformation serait une erreur",
        whyCorrect:
          "The documentary deliberately presents two opposing camps of experts, cites a study that stresses the impact will vary by sector and country, and ends by noting only that ignoring the change would be a mistake — a nuanced, not one-sided, conclusion.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "This ignores the counter-argument presented by other researchers, who argue that each technological revolution has ultimately created more jobs than it destroyed, provided workers retrain.",
          },
          {
            optionId: "opt-b",
            reason:
              'This directly contradicts the cited study\'s authors, who "nuancent leurs conclusions" by stating "l\'impact variera énormément selon les secteurs et les pays" (the impact will vary enormously by sector and country).',
          },
          {
            optionId: "opt-d",
            reason:
              'This ignores the clear disagreement the documentary presents from the start ("D\'un côté ... d\'un autre côté") as well as unions\' criticism — there is no unanimity described anywhere.',
          },
        ],
        vocabulary: [
          { term: "nuancer", translation: "to qualify / add nuance to (a statement)" },
          { term: "faire consensus", translation: "to be a point of agreement / consensus" },
          { term: "davantage", translation: "more" },
        ],
        grammarPattern:
          '"Ignorer cette transformation serait une erreur" uses the conditional ("serait") to express a hypothetical judgment — a common structure for stating a cautious conclusion without an absolute claim.',
        strategy:
          "For a 'main idea' question on a balanced documentary, resist picking the most extreme-sounding option — nuanced reports often deliberately avoid a one-sided conclusion, and the correct answer usually reflects that balance.",
      },
    },
    ru: {
      prompt: "Какова общая позиция документального фильма по поводу влияния ИИ на занятость?",
      options: [
        { id: "opt-a", text: "ИИ неизбежно уничтожит гораздо больше рабочих мест, чем создаст" },
        { id: "opt-b", text: "Влияние будет одинаковым везде, независимо от сектора или страны" },
        {
          id: "opt-c",
          text: "Мнения разделились, и реальное влияние будет различаться по секторам — но эти изменения нельзя игнорировать",
        },
        { id: "opt-d", text: "Эксперты единогласно считают, что влияние ИИ на рабочие места будет положительным" },
      ],
      explanation: {
        whereInRecording:
          'Фильм завершается сбалансированным выводом: «une chose semble faire consensus parmi les spécialistes interrogés : ignorer cette transformation serait une erreur» — после представления и оптимистичных, и пессимистичных взглядов, а также отметив, что «l\'impact variera énormément selon les secteurs et les pays».',
        keywords: "l'impact variera énormément selon les secteurs et les pays; ignorer cette transformation serait une erreur",
        whyCorrect:
          "Фильм намеренно представляет два противоположных лагеря экспертов, ссылается на исследование, подчёркивающее, что влияние будет различаться по секторам и странам, и завершается лишь замечанием, что игнорировать эти изменения было бы ошибкой — взвешенный, а не однобокий вывод.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Это игнорирует контраргумент других исследователей, утверждающих, что каждая технологическая революция в итоге создавала больше рабочих мест, чем уничтожала, при условии переобучения работников.",
          },
          {
            optionId: "opt-b",
            reason:
              'Это прямо противоречит авторам цитируемого исследования, которые «nuancent leurs conclusions», заявляя, что «l\'impact variera énormément selon les secteurs et les pays» (влияние будет значительно различаться в зависимости от сектора и страны).',
          },
          {
            optionId: "opt-d",
            reason:
              'Это игнорирует явное расхождение мнений, представленное в фильме с самого начала («D\'un côté ... d\'un autre côté»), а также критику со стороны профсоюзов — нигде не описывается единодушие.',
          },
        ],
        vocabulary: [
          { term: "nuancer", translation: "уточнять / вносить нюансы (в утверждение)" },
          { term: "faire consensus", translation: "быть предметом согласия / консенсуса" },
          { term: "davantage", translation: "больше" },
        ],
        grammarPattern:
          '«Ignorer cette transformation serait une erreur» использует условное наклонение («serait») для выражения гипотетического суждения — типичная конструкция для осторожного вывода без абсолютного утверждения.',
        strategy:
          "В вопросах на «главную мысль» по сбалансированному репортажу не выбирайте вариант, звучащий наиболее радикально — взвешенные репортажи часто намеренно избегают однобокого вывода, и правильный ответ обычно отражает этот баланс.",
      },
    },
    kz: {
      prompt: "Деректі фильмнің жасанды интеллекттің жұмыспен қамтуға әсері туралы жалпы ұстанымы қандай?",
      options: [
        { id: "opt-a", text: "ЖИ сөзсіз жұмыс орындарын құрғаннан гөрі әлдеқайда көбірек жояды" },
        { id: "opt-b", text: "Әсер бәрінде бірдей болады, сектор мен елге қарамастан" },
        {
          id: "opt-c",
          text: "Пікірлер бөлінген, нақты әсер секторға қарай әртүрлі болады — бірақ бұл өзгерісті елемеуге болмайды",
        },
        { id: "opt-d", text: "Сарапшылар ЖИ-дің жұмыс орындарына әсері оң болатынына бірауыздан келіседі" },
      ],
      explanation: {
        whereInRecording:
          'Фильм теңдестірілген қорытындымен аяқталады: «une chose semble faire consensus parmi les spécialistes interrogés : ignorer cette transformation serait une erreur» — оптимистік те, пессимистік те көзқарастар ұсынылып, «l\'impact variera énormément selon les secteurs et les pays» деп атап өткеннен кейін.',
        keywords: "l'impact variera énormément selon les secteurs et les pays; ignorer cette transformation serait une erreur",
        whyCorrect:
          "Фильм әдейі сарапшылардың екі қарама-қарсы тобын ұсынады, әсер сектор мен елге қарай айтарлықтай өзгеретінін атап өткен зерттеуге сілтеме жасайды және тек осы өзгерісті елемеу қателік болатынын айтумен аяқталады — бұл біржақты емес, ойлы қорытынды.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Бұл басқа зерттеушілердің қарсы дәлелін елемейді, олар әр технологиялық революция, жұмысшылар қайта дайындалған жағдайда, түбінде жойғанынан көбірек жұмыс орнын құрғанын айтады.",
          },
          {
            optionId: "opt-b",
            reason:
              'Бұл келтірілген зерттеу авторларына тікелей қайшы келеді, олар «l\'impact variera énormément selon les secteurs et les pays» (әсер сектор мен елге қарай айтарлықтай өзгереді) деп «nuancent leurs conclusions» (қорытындыларын нақтылайды).',
          },
          {
            optionId: "opt-d",
            reason:
              'Бұл фильмде басынан-ақ ұсынылған айқын келіспеушілікті («D\'un côté ... d\'un autre côté»), сондай-ақ кәсіподақтардың сынын елемейді — ешбір жерде бірауыздылық сипатталмаған.',
          },
        ],
        vocabulary: [
          { term: "nuancer", translation: "нақтылау / реңк қосу (пікірге)" },
          { term: "faire consensus", translation: "келісім/консенсус болу" },
          { term: "davantage", translation: "көбірек" },
        ],
        grammarPattern:
          '«Ignorer cette transformation serait une erreur» гипотетикалық пікірді білдіру үшін шартты райды («serait») қолданады — бұл абсолютті мәлімдемесіз сақтықпен қорытынды жасаудың кең тараған құрылымы.',
        strategy:
          "Теңдестірілген деректі фильм бойынша «басты идея» сұрағында ең радикалды естілетін нұсқаны таңдамаңыз — ойлы репортаждар көбіне біржақты қорытындыдан әдейі аулақ болады, дұрыс жауап әдетте осы теңгерімді көрсетеді.",
      },
    },
  },
};

const b2AiQ2: QuestionSpec = {
  id: "b2-ai-employment-documentary-1-q2",
  recordingId: "b2-ai-employment-documentary-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "According to the study cited, what percentage of current tasks could be automated within fifteen years?",
      options: [
        { id: "opt-a", text: "15%" },
        { id: "opt-b", text: "60%" },
        { id: "opt-c", text: "Nearly 40%" },
        { id: "opt-d", text: "40%, but within five years" },
      ],
      explanation: {
        whereInRecording:
          'The narrator cites the figure precisely: "près de quarante pour cent des tâches actuellement effectuées par des employés pourraient être automatisées d\'ici quinze ans."',
        keywords: "près de quarante pour cent, d'ici quinze ans",
        whyCorrect:
          "The study's figure is stated directly — nearly 40% of current tasks could be automated — matching this option exactly.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '15% confuses the percentage with the number of years in the timeframe — the study says "d\'ici quinze ans" (within fifteen years), not fifteen percent of tasks.',
          },
          {
            optionId: "opt-b",
            reason: "60% is simply a different figure that is never stated anywhere in the recording.",
          },
          {
            optionId: "opt-d",
            reason: "This gets the percentage right but the timeframe wrong — the study specifies fifteen years, not five.",
          },
        ],
        vocabulary: [
          { term: "une tâche", translation: "a task" },
          { term: "automatiser", translation: "to automate" },
          { term: "d'ici quinze ans", translation: "within fifteen years / by fifteen years from now" },
        ],
        grammarPattern:
          '"Pourraient être automatisées" combines the conditional of "pouvoir" with a passive infinitive to express a cautious possibility, not a certainty — note this softer tone compared to a flat prediction.',
        strategy:
          "When a report gives both a percentage and a number of years in the same sentence, write them down separately as you hear them — exam distractors commonly swap a percentage for a year count, or vice versa.",
      },
    },
    ru: {
      prompt: "Согласно цитируемому исследованию, какой процент текущих задач может быть автоматизирован в течение пятнадцати лет?",
      options: [
        { id: "opt-a", text: "15%" },
        { id: "opt-b", text: "60%" },
        { id: "opt-c", text: "Почти 40%" },
        { id: "opt-d", text: "40%, но в течение пяти лет" },
      ],
      explanation: {
        whereInRecording:
          'Рассказчик точно приводит цифру: «près de quarante pour cent des tâches actuellement effectuées par des employés pourraient être automatisées d\'ici quinze ans».',
        keywords: "près de quarante pour cent, d'ici quinze ans",
        whyCorrect:
          "Цифра исследования названа прямо — почти 40% текущих задач могут быть автоматизированы — что точно соответствует этому варианту.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '15% путают с числом лет в указанном сроке — исследование говорит «d\'ici quinze ans» (в течение пятнадцати лет), а не о пятнадцати процентах задач.',
          },
          {
            optionId: "opt-b",
            reason: "60% — это просто другая цифра, которая нигде в записи не упоминается.",
          },
          {
            optionId: "opt-d",
            reason: "Здесь верно указан процент, но неверен срок — исследование указывает пятнадцать лет, а не пять.",
          },
        ],
        vocabulary: [
          { term: "une tâche", translation: "задача" },
          { term: "automatiser", translation: "автоматизировать" },
          { term: "d'ici quinze ans", translation: "в течение пятнадцати лет / к сроку через пятнадцать лет" },
        ],
        grammarPattern:
          '«Pourraient être automatisées» сочетает условное наклонение глагола «pouvoir» со страдательным инфинитивом, выражая осторожную возможность, а не уверенность — обратите внимание на этот более мягкий тон по сравнению с категоричным прогнозом.',
        strategy:
          "Когда в репортаже в одном предложении указаны и процент, и число лет, записывайте их отдельно по мере того, как слышите — отвлекающие варианты на экзамене часто меняют местами процент и число лет.",
      },
    },
    kz: {
      prompt: "Келтірілген зерттеу бойынша, қазіргі тапсырмалардың қанша пайызы он бес жыл ішінде автоматтандырылуы мүмкін?",
      options: [
        { id: "opt-a", text: "15%" },
        { id: "opt-b", text: "60%" },
        { id: "opt-c", text: "Шамамен 40%" },
        { id: "opt-d", text: "40%, бірақ бес жыл ішінде" },
      ],
      explanation: {
        whereInRecording:
          'Дикторлар санды нақты келтіреді: «près de quarante pour cent des tâches actuellement effectuées par des employés pourraient être automatisées d\'ici quinze ans».',
        keywords: "près de quarante pour cent, d'ici quinze ans",
        whyCorrect:
          "Зерттеудің саны тікелей аталады — қазіргі тапсырмалардың шамамен 40%-ы автоматтандырылуы мүмкін — бұл дәл осы нұсқаға сәйкес келеді.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              '15% пайызды мерзімдегі жыл санымен шатастырады — зерттеу «d\'ici quinze ans» (он бес жыл ішінде) дейді, тапсырмалардың он бес пайызы туралы емес.',
          },
          {
            optionId: "opt-b",
            reason: "60% — жазбада мүлдем аталмаған басқа сан ғана.",
          },
          {
            optionId: "opt-d",
            reason: "Мұнда пайыз дұрыс, бірақ мерзім қате көрсетілген — зерттеу бес емес, он бес жылды көрсетеді.",
          },
        ],
        vocabulary: [
          { term: "une tâche", translation: "тапсырма" },
          { term: "automatiser", translation: "автоматтандыру" },
          { term: "d'ici quinze ans", translation: "он бес жыл ішінде / осыдан он бес жылдан кейінге дейін" },
        ],
        grammarPattern:
          '«Pourraient être automatisées» «pouvoir» етістігінің шартты райын страдательный инфинитивпен біріктіріп, нақты сенімділікті емес, сақтықпен айтылған мүмкіндікті білдіреді — мұны қатаң болжаммен салыстырғанда жұмсақтау реңкіне назар аударыңыз.',
        strategy:
          "Репортажда бір сөйлемде пайыз бен жыл саны бірге берілгенде, естіген сайын оларды бөлек жазып алыңыз — емтихандағы алаңдатушы нұсқалар пайыз бен жыл санын жиі ауыстырып қояды.",
      },
    },
  },
};

const b2AiQ3: QuestionSpec = {
  id: "b2-ai-employment-documentary-1-q3",
  recordingId: "b2-ai-employment-documentary-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "True or false: The unions mentioned in the documentary consider the government response to AI's impact sufficient.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'The documentary states the opposite: "Certains syndicats, en revanche, dénoncent ce qu\'ils considèrent comme une réponse insuffisante, et réclament une régulation plus stricte."',
        keywords: "dénoncent ce qu'ils considèrent comme une réponse insuffisante",
        whyCorrect:
          'This is false: the unions are described as denouncing the response as "insuffisante" (insufficient) and demanding stricter regulation — the direct opposite of finding it sufficient.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'This reverses the documentary\'s statement — "en revanche" (on the other hand) signals the unions\' view directly contrasts with the governments\' investment efforts described just before, which they see as inadequate.',
          },
        ],
        vocabulary: [
          { term: "dénoncer", translation: "to denounce / to publicly criticize" },
          { term: "insuffisant(e)", translation: "insufficient" },
          { term: "réclamer", translation: "to demand" },
        ],
        grammarPattern:
          '"En revanche" (on the other hand / whereas) signals a contrast with the previous sentence — recognizing this connector helps predict that the following opinion will oppose what was just said.',
        strategy:
          "When a report presents one group's action (here, governments investing in training) followed by 'en revanche' and another group's reaction, expect the second group to disagree — this contrast is often the basis of a true/false trap.",
      },
    },
    ru: {
      prompt: "Верно или неверно: упомянутые в фильме профсоюзы считают ответ правительств на влияние ИИ достаточным.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'В фильме говорится обратное: «Certains syndicats, en revanche, dénoncent ce qu\'ils considèrent comme une réponse insuffisante, et réclament une régulation plus stricte».',
        keywords: "dénoncent ce qu'ils considèrent comme une réponse insuffisante",
        whyCorrect:
          'Это неверно: профсоюзы описаны как осуждающие ответ как «insuffisante» (недостаточный) и требующие более строгого регулирования — это прямая противоположность признанию его достаточным.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'Это переворачивает утверждение фильма — «en revanche» (с другой стороны) сигнализирует, что мнение профсоюзов прямо противоречит усилиям правительств по инвестициям, описанным чуть раньше, которые профсоюзы считают недостаточными.',
          },
        ],
        vocabulary: [
          { term: "dénoncer", translation: "осуждать / публично критиковать" },
          { term: "insuffisant(e)", translation: "недостаточный" },
          { term: "réclamer", translation: "требовать" },
        ],
        grammarPattern:
          '«En revanche» (с другой стороны / тогда как) сигнализирует контраст с предыдущим предложением — распознавание этого союза помогает предсказать, что следующее мнение будет противоположным только что сказанному.',
        strategy:
          "Когда в репортаже сначала описывается действие одной группы (здесь — инвестиции правительств в обучение), а затем «en revanche» и реакция другой группы, ожидайте, что вторая группа не согласится — этот контраст часто становится основой ловушки в вопросе верно/неверно.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: фильмде аталған кәсіподақтар үкіметтердің ЖИ әсеріне жауабын жеткілікті деп санайды.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Фильмде керісінше айтылады: «Certains syndicats, en revanche, dénoncent ce qu\'ils considèrent comme une réponse insuffisante, et réclament une régulation plus stricte».',
        keywords: "dénoncent ce qu'ils considèrent comme une réponse insuffisante",
        whyCorrect:
          'Бұл бұрыс: кәсіподақтар жауапты «insuffisante» (жеткіліксіз) деп айыптап, қатаңырақ реттеуді талап етеді деп сипатталады — бұл оны жеткілікті деп табудың тікелей қарама-қарсысы.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'Бұл фильмнің тұжырымын теріске шығарады — «en revanche» (екінші жағынан) кәсіподақтардың көзқарасы жоғарыда сипатталған үкіметтердің оқытуға инвестиция салу әрекетіне тікелей қайшы келетінін білдіреді, оны олар жеткіліксіз деп санайды.',
          },
        ],
        vocabulary: [
          { term: "dénoncer", translation: "айыптау / жария сынау" },
          { term: "insuffisant(e)", translation: "жеткіліксіз" },
          { term: "réclamer", translation: "талап ету" },
        ],
        grammarPattern:
          '«En revanche» (екінші жағынан) алдыңғы сөйлеммен қарама-қайшылықты білдіреді — бұл жалғаулықты тану келесі пікірдің жаңа айтылғанға қарсы болатынын болжауға көмектеседі.',
        strategy:
          "Репортажда алдымен бір топтың әрекеті (мұнда — үкіметтердің оқытуға инвестициясы) сипатталып, содан кейін «en revanche» және басқа топтың реакциясы келгенде, екінші топтың келіспейтінін күтіңіз — бұл қайшылық көбіне дұрыс/бұрыс тұзағының негізі болады.",
      },
    },
  },
};

const b2DebateQ1: QuestionSpec = {
  id: "b2-urban-mobility-debate-1-q1",
  recordingId: "b2-urban-mobility-debate-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "According to Marc, who would be most affected by a sudden ban on cars in city centers?",
      options: [
        { id: "opt-a", text: "Young students who get around by bike" },
        { id: "opt-b", text: "Tourists visiting for a short stay" },
        { id: "opt-c", text: "Elderly people and those living on the outskirts" },
        { id: "opt-d", text: "Local government employees" },
      ],
      explanation: {
        whereInRecording:
          'Marc raises this concern directly: "Beaucoup de commerçants dépendent des clients qui viennent en voiture, en particulier les personnes âgées ou celles qui habitent en périphérie."',
        keywords: "les personnes âgées ou celles qui habitent en périphérie",
        whyCorrect:
          "Marc specifically names two groups who depend on cars to reach shops — elderly people and residents living on the outskirts — as the ones most likely to be hurt by a sudden ban.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Young students who get around by bike are never mentioned by Marc — cyclists are mentioned by Élise as people who would benefit from less traffic, not as a group placed at risk.",
          },
          {
            optionId: "opt-b",
            reason:
              "Tourists are never mentioned anywhere in this debate — Marc's argument concerns local shoppers, specifically the elderly and those living on the outskirts, not visitors.",
          },
          {
            optionId: "opt-d",
            reason: "Local government employees are never discussed anywhere in the debate.",
          },
        ],
        vocabulary: [
          { term: "dépendre de", translation: "to depend on" },
          { term: "la périphérie", translation: "the outskirts / the edge of a city" },
          { term: "les personnes âgées", translation: "elderly people" },
        ],
        grammarPattern:
          '"Celles qui habitent" uses the relative pronoun "qui" with the feminine plural "celles" (referring back to "personnes") — a common way to define a group by what they do, here their place of residence.',
        strategy:
          "In a debate with two speakers, keep track of which argument belongs to which person — a detail correctly stated by one speaker can be turned into a wrong-answer trap by attributing it to the other speaker or to an unrelated group.",
      },
    },
    ru: {
      prompt: "По словам Марка, кто больше всего пострадает от внезапного запрета автомобилей в центрах городов?",
      options: [
        { id: "opt-a", text: "Молодые студенты, передвигающиеся на велосипедах" },
        { id: "opt-b", text: "Туристы, приехавшие ненадолго" },
        { id: "opt-c", text: "Пожилые люди и жители окраин" },
        { id: "opt-d", text: "Сотрудники местной администрации" },
      ],
      explanation: {
        whereInRecording:
          'Марк прямо поднимает эту проблему: «Beaucoup de commerçants dépendent des clients qui viennent en voiture, en particulier les personnes âgées ou celles qui habitent en périphérie».',
        keywords: "les personnes âgées ou celles qui habitent en périphérie",
        whyCorrect:
          "Марк конкретно называет две группы, зависящие от машин, чтобы добраться до магазинов, — пожилых людей и жителей окраин — как тех, кто больше всего пострадает от внезапного запрета.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Молодые студенты на велосипедах Марком вообще не упоминаются — о велосипедистах говорит Элиз, как о людях, которые выиграют от снижения трафика, а не как о группе риска.",
          },
          {
            optionId: "opt-b",
            reason:
              "Туристы вообще не упоминаются в этих дебатах — аргумент Марка касается местных покупателей, конкретно пожилых людей и жителей окраин, а не приезжих.",
          },
          {
            optionId: "opt-d",
            reason: "Сотрудники местной администрации нигде в дебатах не обсуждаются.",
          },
        ],
        vocabulary: [
          { term: "dépendre de", translation: "зависеть от" },
          { term: "la périphérie", translation: "окраина / край города" },
          { term: "les personnes âgées", translation: "пожилые люди" },
        ],
        grammarPattern:
          '«Celles qui habitent» использует относительное местоимение «qui» с формой женского рода множественного числа «celles» (отсылающей к «personnes») — распространённый способ определить группу по тому, что она делает, здесь — по месту проживания.',
        strategy:
          "В дебатах с двумя участниками следите за тем, какой аргумент принадлежит какому человеку — деталь, верно сказанная одним говорящим, может стать ловушкой неправильного ответа, если её приписать другому говорящему или не связанной с ним группе.",
      },
    },
    kz: {
      prompt: "Марктың айтуынша, қала орталықтарында көліктерге кенеттен тыйым салынса, ең көп зардап шегетін кім?",
      options: [
        { id: "opt-a", text: "Велосипедпен жүретін жас студенттер" },
        { id: "opt-b", text: "Қысқа мерзімге келген туристер" },
        { id: "opt-c", text: "Қарттар және қала шетінде тұратындар" },
        { id: "opt-d", text: "Жергілікті әкімшілік қызметкерлері" },
      ],
      explanation: {
        whereInRecording:
          'Марк бұл мәселені тікелей көтереді: «Beaucoup de commerçants dépendent des clients qui viennent en voiture, en particulier les personnes âgées ou celles qui habitent en périphérie».',
        keywords: "les personnes âgées ou celles qui habitent en périphérie",
        whyCorrect:
          "Марк дүкендерге жету үшін көлікке тәуелді екі топты нақты атайды — қарттар мен қала шетінде тұратындарды — кенеттен тыйым салынса, ең көп зардап шегетіндер ретінде.",
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Велосипедпен жүретін жас студенттер туралы Марк мүлдем айтпайды — велосипедшілер туралы Элиз көлік ағынының азаюынан пайда көретіндер ретінде айтады, қауіп тобы ретінде емес.",
          },
          {
            optionId: "opt-b",
            reason:
              "Туристер бұл пікірталаста мүлдем аталмайды — Марктың дәлелі жергілікті сатып алушыларға, нақты айтқанда қарттар мен қала шетіндегілерге қатысты, келушілерге емес.",
          },
          {
            optionId: "opt-d",
            reason: "Жергілікті әкімшілік қызметкерлері пікірталаста ешбір жерде талқыланбайды.",
          },
        ],
        vocabulary: [
          { term: "dépendre de", translation: "тәуелді болу" },
          { term: "la périphérie", translation: "қала шеті / шет аймақ" },
          { term: "les personnes âgées", translation: "қарт адамдар" },
        ],
        grammarPattern:
          '«Celles qui habitent» салыстырмалы есімдік «qui»-ді әйел жынысындағы көпше «celles» түрімен қолданады («personnes»-ке қатысты) — топты оның не істейтінімен, мұнда тұратын жерімен анықтаудың кең тараған тәсілі.',
        strategy:
          "Екі сөйлеушісі бар пікірталаста қай дәлел кімге тиесілі екенін бақылап отырыңыз — бір сөйлеуші дұрыс айтқан деталь оны басқа сөйлеушіге немесе қатыссыз топқа телу арқылы қате жауап тұзағына айналуы мүмкін.",
      },
    },
  },
};

const b2DebateQ2: QuestionSpec = {
  id: "b2-urban-mobility-debate-1-q2",
  recordingId: "b2-urban-mobility-debate-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "By the end of the debate, what do Élise and Marc ultimately agree on?",
      options: [
        { id: "opt-a", text: "That cars should never be restricted in city centers" },
        { id: "opt-b", text: "That local commerce should move entirely online" },
        {
          id: "opt-c",
          text: "That a gradual transition with real alternatives would be much better accepted than a sudden ban",
        },
        { id: "opt-d", text: "That public transport should stay paid to fund road maintenance" },
      ],
      explanation: {
        whereInRecording:
          'Marc\'s closing line confirms the agreement: "Sur ce point, nous sommes d\'accord : si la transition est bien accompagnée, avec de vraies alternatives, elle sera beaucoup mieux acceptée par la population," responding to Élise\'s proposal of "une transition progressive, accompagnée par exemple de transports en commun gratuits."',
        keywords: "nous sommes d'accord; une transition progressive; transports en commun gratuits",
        whyCorrect:
          'Marc explicitly states "nous sommes d\'accord" (we agree) right after Élise proposes a gradual transition supported by real alternatives such as free public transport — this is the specific point of agreement reached.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "This contradicts the whole debate — both speakers accept some level of change; Marc objects only to a brutal, sudden ban, not to any restriction at all.",
          },
          {
            optionId: "opt-b",
            reason:
              "Moving commerce online is never proposed by either speaker — their entire disagreement and eventual agreement concerns transport policy, not e-commerce.",
          },
          {
            optionId: "opt-d",
            reason:
              'This contradicts Élise\'s specific proposal of "transports en commun gratuits" (free public transport) as part of the transition, which Marc does not object to.',
          },
        ],
        vocabulary: [
          { term: "être d'accord", translation: "to agree" },
          { term: "une transition progressive", translation: "a gradual transition" },
          { term: "accompagnée", translation: "supported / accompanied" },
        ],
        grammarPattern:
          '"Elle sera beaucoup mieux acceptée" uses the futur simple passive to make a prediction about public reaction — a formal, argumentative register typical of B2-level debates.',
        strategy:
          'In a debate that ends in partial agreement, the shared conclusion is usually stated explicitly near the very end by one of the speakers ("nous sommes d\'accord") — listen for that exact phrase to locate the point of consensus rather than assuming the two sides never meet.',
      },
    },
    ru: {
      prompt: "К концу дебатов, в чём в итоге соглашаются Элиз и Марк?",
      options: [
        { id: "opt-a", text: "В том, что автомобили никогда не следует ограничивать в центрах городов" },
        { id: "opt-b", text: "В том, что местная торговля должна полностью перейти в онлайн" },
        {
          id: "opt-c",
          text: "В том, что постепенный переход с реальными альтернативами будет воспринят гораздо лучше, чем резкий запрет",
        },
        { id: "opt-d", text: "В том, что общественный транспорт должен оставаться платным для финансирования содержания дорог" },
      ],
      explanation: {
        whereInRecording:
          'Заключительная фраза Марка подтверждает согласие: «Sur ce point, nous sommes d\'accord : si la transition est bien accompagnée, avec de vraies alternatives, elle sera beaucoup mieux acceptée par la population» — в ответ на предложение Элиз о «une transition progressive, accompagnée par exemple de transports en commun gratuits».',
        keywords: "nous sommes d'accord; une transition progressive; transports en commun gratuits",
        whyCorrect:
          'Марк прямо говорит «nous sommes d\'accord» (мы согласны) сразу после того, как Элиз предлагает постепенный переход, подкреплённый реальными альтернативами, такими как бесплатный общественный транспорт, — это и есть конкретный пункт достигнутого согласия.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Это противоречит всей дискуссии — оба собеседника признают необходимость определённых изменений; Марк возражает лишь против резкого, внезапного запрета, а не против ограничений вообще.",
          },
          {
            optionId: "opt-b",
            reason:
              "Перевод торговли в онлайн ни один из собеседников не предлагает — весь их спор и последующее согласие касаются транспортной политики, а не электронной коммерции.",
          },
          {
            optionId: "opt-d",
            reason:
              'Это противоречит конкретному предложению Элиз о «transports en commun gratuits» (бесплатном общественном транспорте) как части перехода, против чего Марк не возражает.',
          },
        ],
        vocabulary: [
          { term: "être d'accord", translation: "соглашаться" },
          { term: "une transition progressive", translation: "постепенный переход" },
          { term: "accompagnée", translation: "сопровождаемая / подкреплённая" },
        ],
        grammarPattern:
          '«Elle sera beaucoup mieux acceptée» использует пассивный futur simple, чтобы сделать прогноз о реакции общества, — формальный, аргументативный регистр, типичный для дебатов уровня B2.',
        strategy:
          "В дебатах, заканчивающихся частичным согласием, общий вывод обычно явно формулируется ближе к самому концу одним из собеседников («nous sommes d'accord») — прислушивайтесь именно к этой фразе, чтобы найти момент консенсуса, а не предполагайте, что стороны никогда не сойдутся.",
      },
    },
    kz: {
      prompt: "Пікірталас соңында Элиз бен Марк соңында неге келіседі?",
      options: [
        { id: "opt-a", text: "Қала орталықтарында көліктерге ешқашан шектеу қойылмауы керек екеніне" },
        { id: "opt-b", text: "Жергілікті сауда толығымен онлайнға көшуі керек екеніне" },
        {
          id: "opt-c",
          text: "Нақты баламалары бар біртіндеп өту кенеттен тыйым салудан әлдеқайда жақсы қабылданатынына",
        },
        { id: "opt-d", text: "Жол жөндеуін қаржыландыру үшін қоғамдық көлік ақылы болып қалуы керек екеніне" },
      ],
      explanation: {
        whereInRecording:
          'Марктың қорытынды сөзі келісімді растайды: «Sur ce point, nous sommes d\'accord : si la transition est bien accompagnée, avec de vraies alternatives, elle sera beaucoup mieux acceptée par la population» — бұл Элиздің «une transition progressive, accompagnée par exemple de transports en commun gratuits» деген ұсынысына жауап ретінде айтылады.',
        keywords: "nous sommes d'accord; une transition progressive; transports en commun gratuits",
        whyCorrect:
          'Марк Элиз тегін қоғамдық көлік сияқты нақты балама шаралармен қолдалатын біртіндеп өтуді ұсынғаннан кейін бірден «nous sommes d\'accord» (біз келісеміз) деп нақты айтады — бұл қол жеткізілген нақты келісім тұсы.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason:
              "Бұл бүкіл пікірталасқа қайшы келеді — екі сөйлеуші де белгілі бір деңгейдегі өзгерісті қабылдайды; Марк тек кенеттен, қатал тыйым салуға қарсы, жалпы шектеуге емес.",
          },
          {
            optionId: "opt-b",
            reason:
              "Сауданы онлайнға көшіруді екі сөйлеуші де ұсынбайды — олардың бүкіл келіспеушілігі мен кейінгі келісімі көлік саясатына қатысты, электрондық коммерцияға емес.",
          },
          {
            optionId: "opt-d",
            reason:
              'Бұл Элиздің біртіндеп өтудің бір бөлігі ретінде ұсынған «transports en commun gratuits» (тегін қоғамдық көлік) деген нақты ұсынысына қайшы келеді, Марк бұған қарсы емес.',
          },
        ],
        vocabulary: [
          { term: "être d'accord", translation: "келісу" },
          { term: "une transition progressive", translation: "біртіндеп өту" },
          { term: "accompagnée", translation: "қолдалатын / сүйемелденетін" },
        ],
        grammarPattern:
          '«Elle sera beaucoup mieux acceptée» қоғамдық реакция туралы болжам жасау үшін futur simple страдательный түрін қолданады — B2 деңгейіндегі пікірталастарға тән ресми, дәлелдеу регистрі.',
        strategy:
          "Ішінара келісіммен аяқталатын пікірталаста ортақ қорытынды әдетте соңына жақын жерде сөйлеушілердің бірі арқылы нақты айтылады («nous sommes d'accord») — тараптар ешқашан келіспейді деп болжамай, дәл осы тіркеске құлақ түріп, консенсус тұсын табыңыз.",
      },
    },
  },
};

const b2DebateQ3: QuestionSpec = {
  id: "b2-urban-mobility-debate-1-q3",
  recordingId: "b2-urban-mobility-debate-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b", "opt-d"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which arguments does Élise use to support reducing car traffic? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Air pollution causes thousands of premature deaths every year" },
        { id: "opt-b", text: "Cities that already limited car access saw quality of life improve" },
        { id: "opt-c", text: "Shop owners will earn significantly more money" },
        { id: "opt-d", text: "There would be more space for pedestrians and cyclists" },
      ],
      explanation: {
        whereInRecording:
          'Élise lists these directly in her opening argument: "La pollution de l\'air cause chaque année des milliers de décès prématurés," and describes cities that limited cars as gaining "moins de bruit, moins de pollution, et davantage d\'espace pour les piétons et les cyclistes."',
        keywords: "des milliers de décès prématurés, la qualité de vie ... s'améliorer, davantage d'espace pour les piétons et les cyclistes",
        whyCorrect:
          "Élise names all three points in her first turn: pollution-related deaths, improved quality of life in cities that already restricted cars, and more space for pedestrians and cyclists — all offered as reasons to reduce traffic.",
        whyIncorrect: [
          {
            optionId: "opt-c",
            reason:
              "Higher earnings for shop owners is Marc's counter-argument in reverse — he actually warns that shops could suffer economically, which is why Élise is the one arguing for change, not for merchants' profits.",
          },
        ],
        vocabulary: [
          { term: "un décès prématuré", translation: "a premature death" },
          { term: "un piéton", translation: "a pedestrian" },
          { term: "un cycliste", translation: "a cyclist" },
        ],
        grammarPattern:
          '"Ont vu la qualité de vie ... s\'améliorer" uses "voir" + infinitive to describe a change that was directly observed — a natural structure for reporting a documented result rather than a hypothesis.',
        strategy:
          "When a debate has two speakers with opposing views, attribute each argument to the speaker who actually said it before selecting it — a true statement said by the wrong speaker (or the opposite of what they said) is a common distractor.",
      },
    },
    ru: {
      prompt: "Какие аргументы приводит Элиз в поддержку снижения автомобильного движения? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Загрязнение воздуха ежегодно вызывает тысячи преждевременных смертей" },
        { id: "opt-b", text: "В городах, уже ограничивших доступ автомобилей, качество жизни улучшилось" },
        { id: "opt-c", text: "Владельцы магазинов будут зарабатывать значительно больше" },
        { id: "opt-d", text: "Появится больше места для пешеходов и велосипедистов" },
      ],
      explanation: {
        whereInRecording:
          'Элиз прямо перечисляет это в своём первом выступлении: «La pollution de l\'air cause chaque année des milliers de décès prématurés», и описывает города, ограничившие автомобили, как получившие «moins de bruit, moins de pollution, et davantage d\'espace pour les piétons et les cyclistes».',
        keywords: "des milliers de décès prématurés, la qualité de vie ... s'améliorer, davantage d'espace pour les piétons et les cyclistes",
        whyCorrect:
          "Элиз называет все три пункта в своей первой реплике: смерти, связанные с загрязнением, улучшение качества жизни в городах, уже ограничивших машины, и больше места для пешеходов и велосипедистов — всё это приводится как причины для снижения трафика.",
        whyIncorrect: [
          {
            optionId: "opt-c",
            reason:
              "Более высокий заработок владельцев магазинов — это контраргумент Марка в обратную сторону: он предупреждает, что магазины могут пострадать экономически, поэтому именно Элиз выступает за изменения, а не за прибыль торговцев.",
          },
        ],
        vocabulary: [
          { term: "un décès prématuré", translation: "преждевременная смерть" },
          { term: "un piéton", translation: "пешеход" },
          { term: "un cycliste", translation: "велосипедист" },
        ],
        grammarPattern:
          '«Ont vu la qualité de vie ... s\'améliorer» использует «voir» + инфинитив, чтобы описать непосредственно наблюдаемое изменение — естественная конструкция для сообщения о задокументированном результате, а не гипотезе.',
        strategy:
          "Когда в дебатах участвуют два оппонента, сначала соотнесите каждый аргумент с говорящим, который его действительно произнёс, прежде чем выбирать его — верное утверждение, приписанное не тому говорящему (или его противоположность), — частая ловушка.",
      },
    },
    kz: {
      prompt: "Элиз көлік қозғалысын азайтуды қолдау үшін қандай дәлелдер келтіреді? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Ауа ластануы жыл сайын мыңдаған уақытынан бұрынғы өлімге әкеледі" },
        { id: "opt-b", text: "Көлікке қолжетімділікті шектеген қалаларда өмір сүру сапасы жақсарды" },
        { id: "opt-c", text: "Дүкен иелері айтарлықтай көбірек табыс табады" },
        { id: "opt-d", text: "Жаяу жүргіншілер мен велосипедшілерге көбірек орын болады" },
      ],
      explanation: {
        whereInRecording:
          'Элиз мұны бірінші сөзінде тікелей тізіп өтеді: «La pollution de l\'air cause chaque année des milliers de décès prématurés», және көлікке шектеу қойған қалаларды «moins de bruit, moins de pollution, et davantage d\'espace pour les piétons et les cyclistes» алғаны ретінде сипаттайды.',
        keywords: "des milliers de décès prématurés, la qualité de vie ... s'améliorer, davantage d'espace pour les piétons et les cyclistes",
        whyCorrect:
          "Элиз бірінші сөзінде үш тармақты да атайды: ластанумен байланысты өлімдер, көлікке қазірдің өзінде шектеу қойған қалалардағы өмір сапасының жақсаруы, жаяу жүргіншілер мен велосипедшілерге көбірек орын — барлығы қозғалысты азайтудың себебі ретінде ұсынылады.",
        whyIncorrect: [
          {
            optionId: "opt-c",
            reason:
              "Дүкен иелерінің көбірек табыс табуы — бұл Марктың кері дәлелі: ол дүкендердің экономикалық зардап шегуі мүмкін екенін ескертеді, сондықтан дәл Элиз саудагерлердің пайдасы үшін емес, өзгеріс үшін дәлел келтіреді.",
          },
        ],
        vocabulary: [
          { term: "un décès prématuré", translation: "уақытынан бұрынғы өлім" },
          { term: "un piéton", translation: "жаяу жүргінші" },
          { term: "un cycliste", translation: "велосипедші" },
        ],
        grammarPattern:
          '«Ont vu la qualité de vie ... s\'améliorer» тікелей байқалған өзгерісті сипаттау үшін «voir» + инфинитив құрылымын қолданады — бұл болжамды емес, құжатталған нәтижені хабарлаудың табиғи құрылымы.',
        strategy:
          "Екі қарама-қарсы көзқарасты сөйлеуші қатысатын пікірталаста, әр дәлелді таңдамас бұрын оны нақты айтқан сөйлеушіге телу керек — дұрыс тұжырымды дұрыс емес сөйлеушіге теру (немесе оның қарама-қарсысы) жиі кездесетін тұзақ.",
      },
    },
  },
};

const b2ClimateQ1: QuestionSpec = {
  id: "b2-climate-migration-documentary-1-q1",
  recordingId: "b2-climate-migration-documentary-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "According to the documentary, what makes climate migrants' legal situation different from that of war refugees?",
      options: [
        { id: "opt-a", text: "Climate migrants are always allowed to settle permanently, unlike war refugees" },
        { id: "opt-b", text: "Climate migrants have no clearly defined international status, unlike war refugees" },
        { id: "opt-c", text: "Climate migrants receive more international funding than war refugees" },
        { id: "opt-d", text: "Climate migrants are only found in wealthy countries, unlike war refugees" },
      ],
      explanation: {
        whereInRecording:
          'The documentary states this directly: "contrairement aux réfugiés fuyant un conflit armé, les personnes déplacées pour des raisons climatiques ne bénéficient d\'aucun statut international clairement défini."',
        keywords: "contrairement aux réfugiés fuyant un conflit armé, ne bénéficient d'aucun statut international clairement défini",
        whyCorrect:
          'The documentary explicitly contrasts the two groups: unlike war refugees, people displaced for climate reasons have "aucun statut international clairement défini" (no clearly defined international status), which complicates their legal protection.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "This is the opposite of what's stated — the documentary describes climate migrants as lacking legal protection precisely because no clear status exists for them, not as being guaranteed permanent settlement.",
          },
          {
            optionId: "opt-c",
            reason: "Funding levels for either group are never compared or even mentioned anywhere in the documentary.",
          },
          {
            optionId: "opt-d",
            reason: 'This contradicts the documentary\'s later point that wealthy countries\' coastal regions, including parts of Europe, "devront elles aussi envisager des déplacements de population" — climate migration isn\'t limited to poor countries.',
          },
        ],
        vocabulary: [
          { term: "un statut", translation: "a status (legal category)" },
          { term: "un cadre juridique", translation: "a legal framework" },
          { term: "bénéficier de", translation: "to benefit from / have access to" },
        ],
        grammarPattern:
          '"Contrairement à" + noun introduces an explicit contrast between two groups — a common formal connector for comparisons in documentaries and analytical reports.',
        strategy:
          "When a documentary explicitly compares two groups using \"contrairement à,\" the key difference stated right after that phrase is often the basis of a detail question — isolate exactly what is said to differ, rather than assuming other unstated differences.",
      },
    },
    ru: {
      prompt: "Согласно документальному фильму, чем правовое положение климатических мигрантов отличается от положения беженцев войны?",
      options: [
        { id: "opt-a", text: "Климатическим мигрантам всегда разрешено селиться навсегда, в отличие от беженцев войны" },
        { id: "opt-b", text: "У климатических мигрантов нет чётко определённого международного статуса, в отличие от беженцев войны" },
        { id: "opt-c", text: "Климатические мигранты получают больше международного финансирования, чем беженцы войны" },
        { id: "opt-d", text: "Климатические мигранты встречаются только в богатых странах, в отличие от беженцев войны" },
      ],
      explanation: {
        whereInRecording:
          'Фильм прямо заявляет об этом: «contrairement aux réfugiés fuyant un conflit armé, les personnes déplacées pour des raisons climatiques ne bénéficient d\'aucun statut international clairement défini».',
        keywords: "contrairement aux réfugiés fuyant un conflit armé, ne bénéficient d'aucun statut international clairement défini",
        whyCorrect:
          'Фильм прямо противопоставляет две группы: в отличие от беженцев войны, у людей, перемещённых по климатическим причинам, «aucun statut international clairement défini» (нет чётко определённого международного статуса), что осложняет их правовую защиту.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Это противоположно сказанному — фильм описывает климатических мигрантов как лишённых правовой защиты именно потому, что для них не существует чёткого статуса, а не как имеющих гарантированное постоянное поселение.",
          },
          {
            optionId: "opt-c",
            reason: "Уровни финансирования для каждой из групп нигде не сравниваются и даже не упоминаются в фильме.",
          },
          {
            optionId: "opt-d",
            reason: 'Это противоречит более позднему утверждению фильма о том, что прибрежные регионы богатых стран, включая часть Европы, «devront elles aussi envisager des déplacements de population» — климатическая миграция не ограничена бедными странами.',
          },
        ],
        vocabulary: [
          { term: "un statut", translation: "статус (правовая категория)" },
          { term: "un cadre juridique", translation: "правовая база" },
          { term: "bénéficier de", translation: "пользоваться / иметь доступ к" },
        ],
        grammarPattern:
          '«Contrairement à» + существительное вводит явное противопоставление двух групп — распространённый формальный союз для сравнений в документальных фильмах и аналитических репортажах.',
        strategy:
          "Когда фильм явно сравнивает две группы с помощью «contrairement à», ключевое различие, названное сразу после этой фразы, часто становится основой вопроса на деталь — выделяйте именно то, что названо отличающимся, а не предполагайте другие неназванные различия.",
      },
    },
    kz: {
      prompt: "Деректі фильм бойынша, климаттық мигранттардың құқықтық жағдайы соғыс босқындарынан немен ерекшеленеді?",
      options: [
        { id: "opt-a", text: "Климаттық мигранттарға соғыс босқындарынан айырмашылығы, әрқашан тұрақты қоныстануға рұқсат етіледі" },
        { id: "opt-b", text: "Соғыс босқындарынан айырмашылығы, климаттық мигранттардың нақты анықталған халықаралық мәртебесі жоқ" },
        { id: "opt-c", text: "Климаттық мигранттар соғыс босқындарынан көбірек халықаралық қаржыландыру алады" },
        { id: "opt-d", text: "Климаттық мигранттар соғыс босқындарынан айырмашылығы, тек бай елдерде кездеседі" },
      ],
      explanation: {
        whereInRecording:
          'Фильм мұны тікелей мәлімдейді: «contrairement aux réfugiés fuyant un conflit armé, les personnes déplacées pour des raisons climatiques ne bénéficient d\'aucun statut international clairement défini».',
        keywords: "contrairement aux réfugiés fuyant un conflit armé, ne bénéficient d'aucun statut international clairement défini",
        whyCorrect:
          'Фильм екі топты тікелей қарама-қарсы қояды: соғыс босқындарынан айырмашылығы, климаттық себептермен қоныс аударған адамдардың «aucun statut international clairement défini» (нақты анықталған халықаралық мәртебесі жоқ), бұл олардың құқықтық қорғалуын айтарлықтай қиындатады.',
        whyIncorrect: [
          {
            optionId: "opt-a",
            reason: "Бұл айтылғанға қарама-қарсы — фильм климаттық мигранттарды дәл нақты мәртебенің жоқтығынан құқықтық қорғаудан айырылған деп сипаттайды, тұрақты қоныстану кепілдігі бар деп емес.",
          },
          {
            optionId: "opt-c",
            reason: "Екі топтың қаржыландыру деңгейлері фильмде ешбір жерде салыстырылмайды және тіпті аталмайды да.",
          },
          {
            optionId: "opt-d",
            reason: 'Бұл фильмнің кейінгі тұжырымына қайшы келеді, онда бай елдердің жағалау аймақтары, оның ішінде Еуропаның бір бөлігі, «devront elles aussi envisager des déplacements de population» дейді — климаттық көші-қон кедей елдермен шектелмейді.',
          },
        ],
        vocabulary: [
          { term: "un statut", translation: "мәртебе (құқықтық санат)" },
          { term: "un cadre juridique", translation: "құқықтық негіз" },
          { term: "bénéficier de", translation: "пайдалану / қолжетімділігі болу" },
        ],
        grammarPattern:
          '«Contrairement à» + зат есім екі топтың арасындағы нақты қарама-қайшылықты енгізеді — деректі фильмдер мен талдамалық репортаждарда салыстыру үшін кең тараған ресми жалғаулық.',
        strategy:
          "Фильм екі топты «contrairement à» арқылы нақты салыстырғанда, осы тіркестен кейін бірден аталған негізгі айырмашылық көбіне деталь сұрағының негізі болады — басқа аталмаған айырмашылықтарды болжамай, нақты не ерекшеленетінін бөліп алыңыз.",
      },
    },
  },
};

const b2ClimateQ2: QuestionSpec = {
  id: "b2-climate-migration-documentary-1-q2",
  recordingId: "b2-climate-migration-documentary-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "True or false: According to the documentary, climate migration will only ever affect poor countries.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'The documentary directly rejects this idea: "ce phénomène ne touchera pas uniquement les pays pauvres : des régions côtières de pays riches ... devront elles aussi envisager des déplacements de population."',
        keywords: "ne touchera pas uniquement les pays pauvres; des régions côtières de pays riches",
        whyCorrect:
          'This is false: the documentary explicitly states the phenomenon "ne touchera pas uniquement les pays pauvres" (will not affect only poor countries), citing wealthy countries\' coastal regions, including parts of Europe, as also at risk.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              'This directly contradicts the documentary\'s explicit statement that wealthy countries\' coastal areas will also need to consider population displacement in coming decades — the effect is described as global, not limited to poor countries.',
          },
        ],
        vocabulary: [
          { term: "uniquement", translation: "only / solely" },
          { term: "le littoral", translation: "the coastline" },
        ],
        grammarPattern:
          '"Ne ... pas uniquement" negates an exclusive claim without denying the fact entirely — meaning "not only," which leaves room for the phenomenon to affect other groups too, as the documentary goes on to explain.',
        strategy:
          "Watch for negation combined with 'uniquement' or 'seulement' — 'ne ... pas uniquement' is a softer, partial negation than a full 'never,' and is often used to broaden a claim rather than reject it outright, which can trip up true/false questions.",
      },
    },
    ru: {
      prompt: "Верно или неверно: согласно документальному фильму, климатическая миграция затронет только бедные страны.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Фильм прямо отвергает эту мысль: «ce phénomène ne touchera pas uniquement les pays pauvres : des régions côtières de pays riches ... devront elles aussi envisager des déplacements de population».',
        keywords: "ne touchera pas uniquement les pays pauvres; des régions côtières de pays riches",
        whyCorrect:
          'Это неверно: фильм прямо заявляет, что явление «ne touchera pas uniquement les pays pauvres» (затронет не только бедные страны), приводя в пример прибрежные регионы богатых стран, включая часть Европы, тоже находящиеся под угрозой.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              "Это прямо противоречит явному заявлению фильма о том, что прибрежным районам богатых стран тоже придётся рассматривать перемещение населения в ближайшие десятилетия — явление описывается как глобальное, а не ограниченное бедными странами.",
          },
        ],
        vocabulary: [
          { term: "uniquement", translation: "только / исключительно" },
          { term: "le littoral", translation: "побережье" },
        ],
        grammarPattern:
          '«Ne ... pas uniquement» отрицает исключительность утверждения, не отрицая факт полностью — означает «не только», оставляя место для того, чтобы явление затронуло и другие группы, что фильм далее и поясняет.',
        strategy:
          "Обращайте внимание на отрицание в сочетании с «uniquement» или «seulement» — «ne ... pas uniquement» является более мягким, частичным отрицанием, чем полное «никогда», и часто используется, чтобы расширить утверждение, а не полностью его отвергнуть, что может запутать в вопросах верно/неверно.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: деректі фильм бойынша, климаттық көші-қон тек кедей елдерге ғана әсер етеді.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Фильм бұл пікірді тікелей жоққа шығарады: «ce phénomène ne touchera pas uniquement les pays pauvres : des régions côtières de pays riches ... devront elles aussi envisager des déplacements de population».',
        keywords: "ne touchera pas uniquement les pays pauvres; des régions côtières de pays riches",
        whyCorrect:
          'Бұл бұрыс: фильм құбылыстың «ne touchera pas uniquement les pays pauvres» (тек кедей елдерге ғана емес) әсер ететінін тікелей мәлімдейді, бай елдердің жағалау аймақтарын, оның ішінде Еуропаның бір бөлігін де қауіп астында деп келтіреді.',
        whyIncorrect: [
          {
            optionId: "opt-true",
            reason:
              "Бұл бай елдердің жағалау аймақтарының да алдағы онжылдықтарда халықтың қоныс аударуын қарастыруы керек екені туралы фильмнің нақты мәлімдемесіне тікелей қайшы келеді — құбылыс жаһандық деп сипатталады, кедей елдермен шектелмейді.",
          },
        ],
        vocabulary: [
          { term: "uniquement", translation: "тек қана" },
          { term: "le littoral", translation: "жағалау" },
        ],
        grammarPattern:
          '«Ne ... pas uniquement» фактіні толық жоққа шығармай, айрықшалықты теріске шығарады — «тек қана емес» дегенді білдіреді, бұл құбылыстың басқа топтарға да әсер етуіне орын қалдырады, фильм мұны әрі қарай түсіндіреді.',
        strategy:
          "«Uniquement» немесе «seulement» мен біріккен болымсыздыққа назар аударыңыз — «ne ... pas uniquement» толық «ешқашанға» қарағанда жұмсақ, ішінара болымсыздық, көбіне тұжырымды толық жоққа шығармай, оны кеңейту үшін қолданылады, бұл дұрыс/бұрыс сұрақтарында шатастыруы мүмкін.",
      },
    },
  },
};

const b2ClimateQ3: QuestionSpec = {
  id: "b2-climate-migration-documentary-1-q3",
  recordingId: "b2-climate-migration-documentary-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which causes of climate-driven displacement does the documentary mention? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Rising sea levels" },
        { id: "opt-b", text: "Volcanic eruptions" },
        { id: "opt-c", text: "Increasingly frequent natural disasters" },
        { id: "opt-d", text: "Armed conflict over water resources" },
      ],
      explanation: {
        whereInRecording:
          'The documentary lists the causes directly: "en raison de la montée du niveau des mers, de la désertification ou de la multiplication des catastrophes naturelles."',
        keywords: "la montée du niveau des mers, la multiplication des catastrophes naturelles",
        whyCorrect:
          "The documentary names three causes in one sentence: rising sea levels, desertification, and an increasing frequency of natural disasters — rising seas and more frequent disasters are both explicitly listed here.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Volcanic eruptions are never mentioned anywhere in the documentary as a specific cause." },
          {
            optionId: "opt-d",
            reason:
              "Armed conflict is mentioned only as a contrast to climate displacement (\"contrairement aux réfugiés fuyant un conflit armé\") — it is explicitly separated from climate causes, not listed as one of them.",
          },
        ],
        vocabulary: [
          { term: "la désertification", translation: "desertification" },
          { term: "une catastrophe naturelle", translation: "a natural disaster" },
        ],
        grammarPattern:
          '"En raison de" + noun introduces a cause — a formal equivalent of "à cause de," frequently used in documentaries to list several contributing factors in a row.',
        strategy:
          "When a documentary lists multiple causes with \"en raison de ... ou de ... ou de,\" treat each item after \"de\" as a separate valid cause for a select-all question — but stay alert for a term (like armed conflict here) that appears elsewhere in the recording for a contrasting purpose, not as a cause.",
      },
    },
    ru: {
      prompt: "Какие причины климатического перемещения населения упоминает фильм? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Повышение уровня моря" },
        { id: "opt-b", text: "Извержения вулканов" },
        { id: "opt-c", text: "Учащение природных катастроф" },
        { id: "opt-d", text: "Вооружённый конфликт из-за водных ресурсов" },
      ],
      explanation: {
        whereInRecording:
          'Фильм прямо перечисляет причины: «en raison de la montée du niveau des mers, de la désertification ou de la multiplication des catastrophes naturelles».',
        keywords: "la montée du niveau des mers, la multiplication des catastrophes naturelles",
        whyCorrect:
          "Фильм называет три причины в одном предложении: повышение уровня моря, опустынивание и учащение природных катастроф — повышение уровня моря и учащение катастроф оба явно перечислены здесь.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Извержения вулканов нигде в фильме не упоминаются как конкретная причина." },
          {
            optionId: "opt-d",
            reason:
              "Вооружённый конфликт упоминается только как противопоставление климатическому перемещению («contrairement aux réfugiés fuyant un conflit armé») — он явно отделён от климатических причин, а не перечислен как одна из них.",
          },
        ],
        vocabulary: [
          { term: "la désertification", translation: "опустынивание" },
          { term: "une catastrophe naturelle", translation: "природная катастрофа" },
        ],
        grammarPattern:
          '«En raison de» + существительное вводит причину — формальный эквивалент «à cause de», часто используемый в документальных фильмах для перечисления нескольких способствующих факторов подряд.',
        strategy:
          "Когда фильм перечисляет несколько причин через «en raison de ... ou de ... ou de», считайте каждый пункт после «de» отдельной действительной причиной для вопроса «выберите все» — но будьте внимательны к термину (например, вооружённый конфликт здесь), который появляется в записи в другом месте с противопоставительной целью, а не как причина.",
      },
    },
    kz: {
      prompt: "Фильм климаттық қоныс аударудың қандай себептерін атайды? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Теңіз деңгейінің көтерілуі" },
        { id: "opt-b", text: "Жанартау атқылауы" },
        { id: "opt-c", text: "Табиғи апаттардың жиілеуі" },
        { id: "opt-d", text: "Су ресурстары үшін қарулы қақтығыс" },
      ],
      explanation: {
        whereInRecording:
          'Фильм себептерді тікелей тізеді: «en raison de la montée du niveau des mers, de la désertification ou de la multiplication des catastrophes naturelles».',
        keywords: "la montée du niveau des mers, la multiplication des catastrophes naturelles",
        whyCorrect:
          "Фильм бір сөйлемде үш себепті атайды: теңіз деңгейінің көтерілуі, шөлейттену және табиғи апаттардың жиілеуі — теңіз деңгейінің көтерілуі мен апаттардың жиілеуі екеуі де осында нақты тізілген.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Жанартау атқылауы фильмде нақты себеп ретінде ешбір жерде аталмайды." },
          {
            optionId: "opt-d",
            reason:
              "Қарулы қақтығыс тек климаттық қоныс аударуға қарама-қарсы ретінде аталады («contrairement aux réfugiés fuyant un conflit armé») — ол климаттық себептерден нақты бөлінген, олардың бірі ретінде тізілмеген.",
          },
        ],
        vocabulary: [
          { term: "la désertification", translation: "шөлейттену" },
          { term: "une catastrophe naturelle", translation: "табиғи апат" },
        ],
        grammarPattern:
          '«En raison de» + зат есім себепті енгізеді — «à cause de»-нің ресми баламасы, деректі фильмдерде қатарынан бірнеше ықпал етуші факторды тізу үшін жиі қолданылады.',
        strategy:
          "Фильм «en raison de ... ou de ... ou de» арқылы бірнеше себепті тізгенде, «барлығын таңда» сұрағы үшін «de»-ден кейінгі әр тармақты жеке дұрыс себеп деп қараңыз — бірақ жазбада басқа жерде қарама-қарсы мақсатпен пайда болатын терминге (мұндағы қарулы қақтығыс сияқты) сақ болыңыз, ол себеп емес.",
      },
    },
  },
};

const b2SocialMediaQ1: QuestionSpec = {
  id: "b2-social-media-debate-1-q1",
  recordingId: "b2-social-media-debate-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is Nadia's main argument for restricting social media access for minors?",
      options: [
        { id: "opt-a", text: "Social media companies don't pay enough taxes" },
        { id: "opt-b", text: "Her studies link heavy use to increased anxiety and body-image issues in teens" },
        { id: "opt-c", text: "Teenagers spend too much money on social media" },
        { id: "opt-d", text: "Schools have asked for this restriction" },
      ],
      explanation: {
        whereInRecording:
          'Nadia states this directly: "Les études que nous menons montrent une corrélation inquiétante entre l\'usage intensif des réseaux sociaux chez les adolescents et l\'augmentation des troubles anxieux, ainsi que des problèmes liés à l\'image corporelle."',
        keywords: "une corrélation inquiétante, l'augmentation des troubles anxieux, l'image corporelle",
        whyCorrect:
          "Nadia grounds her position in research findings: her own studies show a worrying link between heavy social media use in teens and both anxiety disorders and body-image problems.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Taxes are never mentioned anywhere in this debate — Nadia's argument is based on psychological research, not company finances." },
          { optionId: "opt-c", reason: "Money or spending is never mentioned anywhere in this debate." },
          { optionId: "opt-d", reason: "Schools requesting this are never mentioned — Nadia cites her own research studies as the basis for her position, not a request from schools." },
        ],
        vocabulary: [
          { term: "une corrélation", translation: "a correlation" },
          { term: "un trouble anxieux", translation: "an anxiety disorder" },
          { term: "l'image corporelle", translation: "body image" },
        ],
        grammarPattern:
          '"Les études que nous menons" uses "mener" (to conduct/lead) with a relative clause to specify research she is personally involved in — establishing her authority as a psychologist citing her own work.',
        strategy:
          "When a speaker in a debate is introduced by profession (here, a psychologist), expect their argument to be grounded in evidence from their field — listen for how they justify their position, not just the position itself.",
      },
    },
    ru: {
      prompt: "Какой главный аргумент Надии в пользу ограничения доступа к соцсетям для несовершеннолетних?",
      options: [
        { id: "opt-a", text: "Компании соцсетей платят недостаточно налогов" },
        { id: "opt-b", text: "Её исследования связывают интенсивное использование с ростом тревожности и проблем с образом тела у подростков" },
        { id: "opt-c", text: "Подростки тратят слишком много денег в соцсетях" },
        { id: "opt-d", text: "Школы попросили об этом ограничении" },
      ],
      explanation: {
        whereInRecording:
          'Надия прямо заявляет: «Les études que nous menons montrent une corrélation inquiétante entre l\'usage intensif des réseaux sociaux chez les adolescents et l\'augmentation des troubles anxieux, ainsi que des problèmes liés à l\'image corporelle».',
        keywords: "une corrélation inquiétante, l'augmentation des troubles anxieux, l'image corporelle",
        whyCorrect:
          "Надия обосновывает свою позицию результатами исследований: её собственные исследования показывают тревожную связь между интенсивным использованием соцсетей подростками и как тревожными расстройствами, так и проблемами с образом тела.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Налоги вообще не упоминаются в этих дебатах — аргумент Надии основан на психологических исследованиях, а не на финансах компаний." },
          { optionId: "opt-c", reason: "Деньги или траты вообще не упоминаются в этих дебатах." },
          { optionId: "opt-d", reason: "Запрос школ вообще не упоминается — Надия ссылается на собственные исследования как основу своей позиции, а не на просьбу школ." },
        ],
        vocabulary: [
          { term: "une corrélation", translation: "корреляция / связь" },
          { term: "un trouble anxieux", translation: "тревожное расстройство" },
          { term: "l'image corporelle", translation: "образ тела" },
        ],
        grammarPattern:
          '«Les études que nous menons» использует «mener» (проводить/вести) с относительным придаточным, чтобы уточнить, что это исследование, в котором она лично участвует, — это подчёркивает её авторитет как психолога, ссылающегося на собственную работу.',
        strategy:
          "Когда говорящего в дебатах представляют по профессии (здесь — психолог), ожидайте, что его аргумент будет основан на данных из его области — слушайте, как именно он обосновывает свою позицию, а не только саму позицию.",
      },
    },
    kz: {
      prompt: "Надияның кәмелетке толмағандардың әлеуметтік желілерге қолжетімділігін шектеу туралы негізгі дәлелі қандай?",
      options: [
        { id: "opt-a", text: "Әлеуметтік желі компаниялары жеткіліксіз салық төлейді" },
        { id: "opt-b", text: "Оның зерттеулері қарқынды пайдалануды жасөспірімдердегі мазасыздық пен дене бейнесі мәселелерінің артуымен байланыстырады" },
        { id: "opt-c", text: "Жасөспірімдер әлеуметтік желіде тым көп ақша жұмсайды" },
        { id: "opt-d", text: "Мектептер осы шектеуді сұраған" },
      ],
      explanation: {
        whereInRecording:
          'Надия мұны тікелей мәлімдейді: «Les études que nous menons montrent une corrélation inquiétante entre l\'usage intensif des réseaux sociaux chez les adolescents et l\'augmentation des troubles anxieux, ainsi que des problèmes liés à l\'image corporelle».',
        keywords: "une corrélation inquiétante, l'augmentation des troubles anxieux, l'image corporelle",
        whyCorrect:
          "Надия өз ұстанымын зерттеу нәтижелеріне негіздейді: оның зерттеулері жасөспірімдердің әлеуметтік желіні қарқынды пайдалануы мен мазасыздық бұзылыстары және дене бейнесіне қатысты мәселелердің артуы арасында алаңдатарлық байланыс бар екенін көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Салықтар бұл пікірталаста мүлдем аталмайды — Надияның дәлелі психологиялық зерттеулерге негізделген, компания қаржысына емес." },
          { optionId: "opt-c", reason: "Ақша немесе шығын бұл пікірталаста мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Мектептердің сұрағаны туралы мүлдем айтылмайды — Надия өз ұстанымының негізі ретінде мектептердің өтінішіне емес, өз зерттеулеріне сілтеме жасайды." },
        ],
        vocabulary: [
          { term: "une corrélation", translation: "корреляция / байланыс" },
          { term: "un trouble anxieux", translation: "мазасыздық бұзылысы" },
          { term: "l'image corporelle", translation: "дене бейнесі" },
        ],
        grammarPattern:
          '«Les études que nous menons» «mener» (жүргізу) етістігін салыстырмалы тармақпен қолданып, оның өзі қатысатын зерттеу екенін нақтылайды — бұл оның өз жұмысына сілтеме жасайтын психолог ретіндегі беделін көрсетеді.',
        strategy:
          "Пікірталаста сөйлеуші кәсібі бойынша таныстырылғанда (мұнда — психолог), оның дәлелі өз саласындағы деректерге негізделеді деп күтіңіз — тек ұстанымның өзіне емес, оны қалай негіздейтініне құлақ түріңіз.",
      },
    },
  },
};

const b2SocialMediaQ2: QuestionSpec = {
  id: "b2-social-media-debate-1-q2",
  recordingId: "b2-social-media-debate-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What is Julien's main concern about a strict ban?",
      options: [
        { id: "opt-a", text: "It would be too expensive for the government to enforce" },
        { id: "opt-b", text: "It would violate teenagers' fundamental rights" },
        { id: "opt-c", text: "It would be unenforceable and could cut off dialogue between parents and children" },
        { id: "opt-d", text: "It would only affect wealthy families" },
      ],
      explanation: {
        whereInRecording:
          'Julien states this directly: "je crains qu\'une interdiction pure et simple soit inapplicable et même contre-productive ... cela risque surtout de couper le dialogue entre parents et enfants sur ce sujet."',
        keywords: "inapplicable et même contre-productive, couper le dialogue entre parents et enfants",
        whyCorrect:
          "Julien names two specific concerns: teens would simply find ways around a ban, making it unenforceable, and the ban risks cutting off communication between parents and children on the topic.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Cost or government spending is never mentioned anywhere in the debate." },
          { optionId: "opt-b", reason: "Fundamental rights are never mentioned as an argument — Julien's objection is practical (enforceability and family dialogue), not framed in terms of rights." },
          { optionId: "opt-d", reason: "Wealthy families specifically are never mentioned anywhere in this debate." },
        ],
        vocabulary: [
          { term: "inapplicable", translation: "unenforceable / impossible to apply" },
          { term: "contourner", translation: "to get around / circumvent" },
        ],
        grammarPattern:
          '"Je crains que" + subjunctive ("soit") expresses a feared possibility — the subjunctive here signals Julien\'s concern is about a potential consequence, not a stated fact.',
        strategy:
          "When a speaker uses \"je crains que\" to voice an objection, expect the sentence to list one or more specific, practical risks right after — track each one separately, since exam options often isolate just one of several concerns mentioned together.",
      },
    },
    ru: {
      prompt: "В чём заключается главное опасение Жюльена относительно строгого запрета?",
      options: [
        { id: "opt-a", text: "Это было бы слишком дорого для государства обеспечивать" },
        { id: "opt-b", text: "Это нарушило бы фундаментальные права подростков" },
        { id: "opt-c", text: "Это неисполнимо и может прервать диалог между родителями и детьми" },
        { id: "opt-d", text: "Это затронуло бы только богатые семьи" },
      ],
      explanation: {
        whereInRecording:
          'Жюльен прямо заявляет: «je crains qu\'une interdiction pure et simple soit inapplicable et même contre-productive ... cela risque surtout de couper le dialogue entre parents et enfants sur ce sujet».',
        keywords: "inapplicable et même contre-productive, couper le dialogue entre parents et enfants",
        whyCorrect:
          "Жюльен называет два конкретных опасения: подростки просто найдут способы обойти запрет, что делает его неисполнимым, и запрет рискует прервать общение между родителями и детьми на эту тему.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Затраты или государственные расходы вообще не упоминаются в дебатах." },
          { optionId: "opt-b", reason: "Фундаментальные права вообще не упоминаются как аргумент — возражение Жюльена практическое (исполнимость и семейный диалог), а не сформулированное в терминах прав." },
          { optionId: "opt-d", reason: "Богатые семьи конкретно вообще не упоминаются в этих дебатах." },
        ],
        vocabulary: [
          { term: "inapplicable", translation: "неисполнимый / невозможный к применению" },
          { term: "contourner", translation: "обходить / обойти" },
        ],
        grammarPattern:
          '«Je crains que» + сослагательное наклонение («soit») выражает опасаемую возможность — сослагательное наклонение здесь показывает, что опасение Жюльена касается потенциального последствия, а не заявленного факта.',
        strategy:
          "Когда говорящий использует «je crains que», чтобы выразить возражение, ожидайте, что предложение перечислит один или несколько конкретных практических рисков сразу после — отслеживайте каждый отдельно, поскольку варианты на экзамене часто выделяют только одно из нескольких названных вместе опасений.",
      },
    },
    kz: {
      prompt: "Жюльеннің қатаң тыйым туралы негізгі алаңдаушылығы неде?",
      options: [
        { id: "opt-a", text: "Үкіметке оны қадағалау тым қымбатқа түседі" },
        { id: "opt-b", text: "Бұл жасөспірімдердің негізгі құқықтарын бұзады" },
        { id: "opt-c", text: "Бұл орындалмайды және ата-ана мен балалар арасындағы диалогты үзуі мүмкін" },
        { id: "opt-d", text: "Бұл тек бай отбасыларға әсер етеді" },
      ],
      explanation: {
        whereInRecording:
          'Жюльен мұны тікелей мәлімдейді: «je crains qu\'une interdiction pure et simple soit inapplicable et même contre-productive ... cela risque surtout de couper le dialogue entre parents et enfants sur ce sujet».',
        keywords: "inapplicable et même contre-productive, couper le dialogue entre parents et enfants",
        whyCorrect:
          "Жюльен екі нақты алаңдаушылықты атайды: жасөспірімдер тыйымнан айналып өтудің жолын табады, бұл оны орындалмайтын етеді, әрі тыйым осы тақырып бойынша ата-ана мен балалар арасындағы қарым-қатынасты үзу қаупін тудырады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Шығын немесе мемлекеттік қаржы пікірталаста мүлдем аталмайды." },
          { optionId: "opt-b", reason: "Негізгі құқықтар дәлел ретінде мүлдем аталмайды — Жюльеннің қарсылығы практикалық (орындалуы және отбасылық диалог), құқық тұрғысынан емес." },
          { optionId: "opt-d", reason: "Бай отбасылар нақты бұл пікірталаста мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "inapplicable", translation: "орындалмайтын / қолдануға болмайтын" },
          { term: "contourner", translation: "айналып өту" },
        ],
        grammarPattern:
          '«Je crains que» + бағыныңқы рай («soit») қауіп-қатер туралы алаңдаушылықты білдіреді — мұндағы бағыныңқы рай Жюльеннің алаңдаушылығы мәлімделген факт емес, ықтимал салдар туралы екенін көрсетеді.',
        strategy:
          "Сөйлеуші қарсылық білдіру үшін «je crains que» қолданғанда, сөйлемнің одан кейін бірден бір немесе бірнеше нақты, практикалық қауіпті тізетінін күтіңіз — әрқайсысын бөлек бақылаңыз, себебі емтихан нұсқалары көбіне бірге аталған бірнеше алаңдаушылықтың тек біреуін бөліп алады.",
      },
    },
  },
};

const b2SocialMediaQ3: QuestionSpec = {
  id: "b2-social-media-debate-1-q3",
  recordingId: "b2-social-media-debate-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "True or false: By the end of the debate, Julien agrees that media education and stricter regulation are not mutually exclusive.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording:
          'Julien\'s closing line confirms this: "Sur ce point précis, je vous rejoins : les deux approches ne sont pas incompatibles, à condition que la régulation reste réaliste et applicable."',
        keywords: "les deux approches ne sont pas incompatibles",
        whyCorrect:
          'This is true: Julien explicitly says "je vous rejoins" (I agree with you) and states the two approaches — media education and regulation — "ne sont pas incompatibles" (are not incompatible), provided regulation stays realistic.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason:
              'This contradicts Julien\'s own closing statement, where he explicitly agrees with Nadia on this specific point, moving from his earlier, more skeptical position on strict regulation.',
          },
        ],
        vocabulary: [
          { term: "rejoindre (une opinion)", translation: "to come to agree with (an opinion)" },
          { term: "incompatible", translation: "incompatible / mutually exclusive" },
        ],
        grammarPattern:
          '"À condition que" + subjunctive introduces a necessary condition for the agreement to hold — Julien\'s agreement isn\'t unconditional, it depends on the regulation remaining "réaliste et applicable."',
        strategy:
          "In a debate where two speakers start with different positions, listen for a late shift signaled by phrases like \"je vous rejoins\" — the final point of agreement is often narrower and more conditional than a full agreement on everything discussed.",
      },
    },
    ru: {
      prompt: "Верно или неверно: к концу дебатов Жюльен соглашается, что медиаобразование и более строгое регулирование не исключают друг друга.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording:
          'Заключительная реплика Жюльена подтверждает это: «Sur ce point précis, je vous rejoins : les deux approches ne sont pas incompatibles, à condition que la régulation reste réaliste et applicable».',
        keywords: "les deux approches ne sont pas incompatibles",
        whyCorrect:
          'Это верно: Жюльен прямо говорит «je vous rejoins» (я согласен с вами) и заявляет, что два подхода — медиаобразование и регулирование — «ne sont pas incompatibles» (не исключают друг друга), при условии, что регулирование остаётся реалистичным.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason:
              "Это противоречит собственному заключительному заявлению Жюльена, где он прямо соглашается с Надией по этому конкретному пункту, отходя от своей более ранней, скептической позиции по строгому регулированию.",
          },
        ],
        vocabulary: [
          { term: "rejoindre (une opinion)", translation: "присоединяться к мнению / соглашаться" },
          { term: "incompatible", translation: "несовместимый / взаимоисключающий" },
        ],
        grammarPattern:
          '«À condition que» + сослагательное наклонение вводит необходимое условие для сохранения согласия — согласие Жюльена не безусловно, оно зависит от того, останется ли регулирование «réaliste et applicable».',
        strategy:
          "В дебатах, где два участника начинают с разных позиций, слушайте позднее смещение, сигнализируемое такими фразами, как «je vous rejoins», — финальная точка согласия часто более узкая и условная, чем полное согласие по всему обсуждённому.",
      },
    },
    kz: {
      prompt: "Дұрыс па, бұрыс па: пікірталас соңында Жюльен медиабілім мен қатаңырақ реттеу бір-бірін жоққа шығармайды деп келіседі.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording:
          'Жюльеннің қорытынды сөзі мұны растайды: «Sur ce point précis, je vous rejoins : les deux approches ne sont pas incompatibles, à condition que la régulation reste réaliste et applicable».',
        keywords: "les deux approches ne sont pas incompatibles",
        whyCorrect:
          'Бұл дұрыс: Жюльен «je vous rejoins» (мен сізбен келісемін) деп нақты айтады және екі тәсіл — медиабілім мен реттеу — «ne sont pas incompatibles» (бір-бірін жоққа шығармайды) дейді, реттеу шынайы болған жағдайда.',
        whyIncorrect: [
          {
            optionId: "opt-false",
            reason:
              "Бұл Жюльеннің осы нақты тұста Надиямен нақты келісіп, қатаң реттеуге қатысты бұрынғы, күмәнданшыл ұстанымынан ауытқыған өз қорытынды мәлімдемесіне қайшы келеді.",
          },
        ],
        vocabulary: [
          { term: "rejoindre (une opinion)", translation: "пікірге қосылу / келісу" },
          { term: "incompatible", translation: "үйлеспейтін / бір-бірін жоққа шығаратын" },
        ],
        grammarPattern:
          '«À condition que» + бағыныңқы рай келісімнің сақталуы үшін қажетті шартты енгізеді — Жюльеннің келісімі сөзсіз емес, ол реттеудің «réaliste et applicable» болып қалуына байланысты.',
        strategy:
          "Екі сөйлеуші әртүрлі ұстанымнан бастайтын пікірталаста, «je vous rejoins» сияқты тіркестермен белгіленетін кейінгі ауысуға құлақ түріңіз — соңғы келісім тұсы көбіне талқыланған барлық нәрсеге толық келісімнен гөрі тар және шартты болады.",
      },
    },
  },
};

const b2FourDayWeekQ1: QuestionSpec = {
  id: "b2-four-day-week-radio-1-q1",
  recordingId: "b2-four-day-week-radio-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "number",
  content: {
    en: {
      prompt: "By how much has absenteeism dropped since the trial began?",
      options: [
        { id: "opt-a", text: "About 10%" },
        { id: "opt-b", text: "About 20%" },
        { id: "opt-c", text: "About 30%" },
        { id: "opt-d", text: "About 50%" },
      ],
      explanation: {
        whereInRecording:
          'The report states this precisely: "une baisse notable de l\'absentéisme, qui a chuté de près de trente pour cent depuis le début de l\'essai."',
        keywords: "chuté de près de trente pour cent depuis le début de l'essai",
        whyCorrect:
          'The report directly gives the figure as "près de trente pour cent" (nearly thirty percent) as the drop in absenteeism since the trial started.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "10% is never stated anywhere in the report — this figure doesn't appear." },
          { optionId: "opt-b", reason: "20% is never stated anywhere in the report — the actual figure given is close to thirty, not twenty, percent." },
          { optionId: "opt-d", reason: "50% is never stated anywhere in the report — this figure doesn't appear." },
        ],
        vocabulary: [
          { term: "l'absentéisme", translation: "absenteeism" },
          { term: "chuter", translation: "to drop sharply / plummet" },
        ],
        grammarPattern:
          '"A chuté de près de trente pour cent" uses the passé composé to report a completed, measured change — "chuter" (to plummet) is stronger than "baisser" (to decrease), emphasizing a sharp drop.',
        strategy:
          "For a single key statistic given early in a report, note the exact word used to describe the change (\"chuter\" vs. a milder verb) alongside the number — this can help you distinguish it from other, smaller percentage changes mentioned later.",
      },
    },
    ru: {
      prompt: "На сколько снизился абсентеизм с начала эксперимента?",
      options: [
        { id: "opt-a", text: "Примерно на 10%" },
        { id: "opt-b", text: "Примерно на 20%" },
        { id: "opt-c", text: "Примерно на 30%" },
        { id: "opt-d", text: "Примерно на 50%" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже это указано точно: «une baisse notable de l\'absentéisme, qui a chuté de près de trente pour cent depuis le début de l\'essai».',
        keywords: "chuté de près de trente pour cent depuis le début de l'essai",
        whyCorrect:
          'В репортаже прямо указывается цифра «près de trente pour cent» (почти тридцать процентов) как снижение абсентеизма с начала эксперимента.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "10% нигде в репортаже не упоминаются — эта цифра не встречается." },
          { optionId: "opt-b", reason: "20% нигде в репортаже не упоминаются — фактически указанная цифра близка к тридцати, а не к двадцати процентам." },
          { optionId: "opt-d", reason: "50% нигде в репортаже не упоминаются — эта цифра не встречается." },
        ],
        vocabulary: [
          { term: "l'absentéisme", translation: "абсентеизм / прогулы" },
          { term: "chuter", translation: "резко падать / обваливаться" },
        ],
        grammarPattern:
          '«A chuté de près de trente pour cent» использует passé composé для сообщения о завершённом, измеренном изменении — «chuter» (резко падать) сильнее, чем «baisser» (снижаться), подчёркивая резкое падение.',
        strategy:
          "Для одной ключевой статистики, приведённой в начале репортажа, отмечайте точное слово, использованное для описания изменения («chuter» против более мягкого глагола), вместе с числом — это поможет отличить её от других, меньших процентных изменений, упомянутых позже.",
      },
    },
    kz: {
      prompt: "Сынақ басталғаннан бері жұмысқа келмеу қаншаға төмендеді?",
      options: [
        { id: "opt-a", text: "Шамамен 10%-ға" },
        { id: "opt-b", text: "Шамамен 20%-ға" },
        { id: "opt-c", text: "Шамамен 30%-ға" },
        { id: "opt-d", text: "Шамамен 50%-ға" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда бұл нақты айтылады: «une baisse notable de l\'absentéisme, qui a chuté de près de trente pour cent depuis le début de l\'essai».',
        keywords: "chuté de près de trente pour cent depuis le début de l'essai",
        whyCorrect:
          'Репортажда сынақ басталғаннан бергі жұмысқа келмеудің төмендеуі ретінде «près de trente pour cent» (шамамен отыз пайыз) саны тікелей келтіріледі.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "10% репортажда мүлдем аталмайды — бұл сан кездеспейді." },
          { optionId: "opt-b", reason: "20% репортажда мүлдем аталмайды — нақты көрсетілген сан жиырмаға емес, отызға жақын." },
          { optionId: "opt-d", reason: "50% репортажда мүлдем аталмайды — бұл сан кездеспейді." },
        ],
        vocabulary: [
          { term: "l'absentéisme", translation: "жұмысқа келмеу" },
          { term: "chuter", translation: "күрт төмендеу" },
        ],
        grammarPattern:
          '«A chuté de près de trente pour cent» аяқталған, өлшенген өзгерісті хабарлау үшін passé composé қолданады — «chuter» (күрт құлау) «baisser»-ден (төмендеу) күштірек, күрт құлдырауды атап көрсетеді.',
        strategy:
          "Репортаждың басында берілген бір негізгі статистика үшін өзгерісті сипаттау үшін қолданылған нақты сөзге («chuter» жұмсағырақ етістікпен салыстырғанда) санмен бірге назар аударыңыз — бұл оны кейінірек аталған басқа, кішірек пайыздық өзгерістерден ажыратуға көмектеседі.",
      },
    },
  },
};

const b2FourDayWeekQ2: QuestionSpec = {
  id: "b2-four-day-week-radio-1-q2",
  recordingId: "b2-four-day-week-radio-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which department is described as struggling more with the new four-day schedule?",
      options: [
        { id: "opt-a", text: "Human resources" },
        { id: "opt-b", text: "Customer service" },
        { id: "opt-c", text: "Marketing" },
        { id: "opt-d", text: "Finance" },
      ],
      explanation: {
        whereInRecording:
          'The report specifies this directly: "Dans le service client, par exemple, certains employés se plaignent d\'une charge de travail plus lourde à répartir sur seulement quatre jours."',
        keywords: "Dans le service client, une charge de travail plus lourde",
        whyCorrect:
          'The report names "le service client" (customer service) specifically as the department where employees complain about a heavier workload spread over only four days.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Human resources is never mentioned anywhere in this report." },
          { optionId: "opt-c", reason: "Marketing is never mentioned anywhere in this report." },
          { optionId: "opt-d", reason: "Finance is never mentioned anywhere in this report." },
        ],
        vocabulary: [
          { term: "le service client", translation: "the customer service department" },
          { term: "une charge de travail", translation: "a workload" },
        ],
        grammarPattern:
          '"Par exemple" signals that a specific case is being used to illustrate a broader point made just before it ("tous les secteurs ... ne vivent pas cette transition de la même façon") — a common structure for moving from a general statement to a concrete detail.',
        strategy:
          "When a report makes a general claim (not all departments experience this the same way) and then says \"par exemple,\" the specific example that follows is often exactly what a detail question will ask about — treat it as the key fact to remember.",
      },
    },
    ru: {
      prompt: "Какой отдел описывается как испытывающий больше трудностей с новым четырёхдневным графиком?",
      options: [
        { id: "opt-a", text: "Отдел кадров" },
        { id: "opt-b", text: "Служба поддержки клиентов" },
        { id: "opt-c", text: "Маркетинг" },
        { id: "opt-d", text: "Финансовый отдел" },
      ],
      explanation: {
        whereInRecording:
          'В репортаже это прямо указывается: «Dans le service client, par exemple, certains employés se plaignent d\'une charge de travail plus lourde à répartir sur seulement quatre jours».',
        keywords: "Dans le service client, une charge de travail plus lourde",
        whyCorrect:
          'В репортаже конкретно называется «le service client» (служба поддержки клиентов) как отдел, где сотрудники жалуются на более тяжёлую нагрузку, распределённую всего на четыре дня.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Отдел кадров вообще не упоминается в этом репортаже." },
          { optionId: "opt-c", reason: "Маркетинг вообще не упоминается в этом репортаже." },
          { optionId: "opt-d", reason: "Финансовый отдел вообще не упоминается в этом репортаже." },
        ],
        vocabulary: [
          { term: "le service client", translation: "служба поддержки клиентов" },
          { term: "une charge de travail", translation: "рабочая нагрузка" },
        ],
        grammarPattern:
          '«Par exemple» сигнализирует, что используется конкретный случай для иллюстрации более общего утверждения, сделанного прямо перед этим («tous les secteurs ... ne vivent pas cette transition de la même façon») — распространённая конструкция для перехода от общего утверждения к конкретной детали.',
        strategy:
          "Когда в репортаже делается общее утверждение (не все отделы переживают это одинаково), а затем говорится «par exemple», конкретный пример, следующий далее, часто является именно тем, о чём спросит вопрос на деталь — считайте его ключевым фактом для запоминания.",
      },
    },
    kz: {
      prompt: "Жаңа төрт күндік кестемен қиынырақ бетпе-бет келеді деп сипатталатын бөлім қайсы?",
      options: [
        { id: "opt-a", text: "Кадрлар бөлімі" },
        { id: "opt-b", text: "Клиенттерге қызмет көрсету бөлімі" },
        { id: "opt-c", text: "Маркетинг" },
        { id: "opt-d", text: "Қаржы бөлімі" },
      ],
      explanation: {
        whereInRecording:
          'Репортажда бұл тікелей көрсетіледі: «Dans le service client, par exemple, certains employés se plaignent d\'une charge de travail plus lourde à répartir sur seulement quatre jours».',
        keywords: "Dans le service client, une charge de travail plus lourde",
        whyCorrect:
          'Репортаж «le service client» (клиенттерге қызмет көрсету бөлімі) деп нақты атайды, онда қызметкерлер тек төрт күнге бөлінген ауыр жұмыс жүктемесіне шағымданады.',
        whyIncorrect: [
          { optionId: "opt-a", reason: "Кадрлар бөлімі бұл репортажда мүлдем аталмайды." },
          { optionId: "opt-c", reason: "Маркетинг бұл репортажда мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Қаржы бөлімі бұл репортажда мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "le service client", translation: "клиенттерге қызмет көрсету бөлімі" },
          { term: "une charge de travail", translation: "жұмыс жүктемесі" },
        ],
        grammarPattern:
          '«Par exemple» алдында айтылған жалпы тұжырымды («tous les secteurs ... ne vivent pas cette transition de la même façon») суреттеу үшін нақты жағдай қолданылып жатқанын білдіреді — жалпы тұжырымнан нақты детальге көшудің кең тараған құрылымы.',
        strategy:
          "Репортаж жалпы тұжырым жасап (барлық бөлімдер мұны бірдей сезінбейді), содан кейін «par exemple» дегенде, одан кейін келетін нақты мысал көбіне деталь сұрағының нақ өзі сұрайтын нәрсе болады — оны есте сақтайтын негізгі факт ретінде қараңыз.",
      },
    },
  },
};

const b2FourDayWeekQ3: QuestionSpec = {
  id: "b2-four-day-week-radio-1-q3",
  recordingId: "b2-four-day-week-radio-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "hard",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Which of the following are true about the four-day week trial? (Select all that apply.)",
      options: [
        { id: "opt-a", text: "Employees kept the same salary despite working one less day" },
        { id: "opt-b", text: "The company has already made the change permanent" },
        { id: "opt-c", text: "Management plans to extend the trial for another six months" },
        { id: "opt-d", text: "Every department has reported the exact same results" },
      ],
      explanation: {
        whereInRecording:
          'The report confirms both facts: "sans réduction de salaire pour ses employés," and "La direction a annoncé qu\'elle prolongerait l\'expérimentation encore six mois avant de décider."',
        keywords: "sans réduction de salaire; prolongerait l'expérimentation encore six mois",
        whyCorrect:
          "Both statements are directly confirmed: the trial involves no salary reduction, and management announced it would extend the trial for six more months before making a final decision.",
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'The report explicitly says a final decision hasn\'t been made — management "prolongerait l\'expérimentation ... avant de décider si ce nouveau rythme sera adopté définitivement," meaning it is not yet permanent.',
          },
          {
            optionId: "opt-d",
            reason:
              'The report explicitly contrasts departments: "tous les secteurs de l\'entreprise ne vivent pas cette transition de la même façon," with customer service reporting more difficulty than others.',
          },
        ],
        vocabulary: [
          { term: "prolonger", translation: "to extend / prolong" },
          { term: "définitivement", translation: "permanently / for good" },
        ],
        grammarPattern:
          '"Prolongerait" is the conditional of "prolonger," used here in reported speech to describe management\'s announced (but not yet finalized) plan — a common way to report an intention without stating it as a certainty.',
        strategy:
          "For select-all questions about a trial or experiment, separate what has already happened (confirmed facts, like the salary policy) from what is only planned or being considered (like extending the trial) — both can be true statements, but for different reasons.",
      },
    },
    ru: {
      prompt: "Что из перечисленного верно об эксперименте с четырёхдневной неделей? (Выберите все подходящие варианты.)",
      options: [
        { id: "opt-a", text: "Сотрудники сохранили ту же зарплату, несмотря на работу на один день меньше" },
        { id: "opt-b", text: "Компания уже сделала это изменение постоянным" },
        { id: "opt-c", text: "Руководство планирует продлить эксперимент ещё на шесть месяцев" },
        { id: "opt-d", text: "Все отделы сообщили абсолютно одинаковые результаты" },
      ],
      explanation: {
        whereInRecording:
          'Репортаж подтверждает оба факта: «sans réduction de salaire pour ses employés» и «La direction a annoncé qu\'elle prolongerait l\'expérimentation encore six mois avant de décider».',
        keywords: "sans réduction de salaire; prolongerait l'expérimentation encore six mois",
        whyCorrect:
          "Оба утверждения подтверждаются напрямую: эксперимент не подразумевает снижения зарплаты, а руководство объявило, что продлит эксперимент ещё на шесть месяцев, прежде чем принять окончательное решение.",
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'В репортаже прямо говорится, что окончательное решение ещё не принято — руководство «prolongerait l\'expérimentation ... avant de décider si ce nouveau rythme sera adopté définitivement», то есть изменение ещё не постоянное.',
          },
          {
            optionId: "opt-d",
            reason:
              'Репортаж прямо противопоставляет отделы: «tous les secteurs de l\'entreprise ne vivent pas cette transition de la même façon», при этом служба поддержки клиентов сообщает о больших трудностях, чем другие.',
          },
        ],
        vocabulary: [
          { term: "prolonger", translation: "продлевать" },
          { term: "définitivement", translation: "окончательно / навсегда" },
        ],
        grammarPattern:
          '«Prolongerait» — условное наклонение от «prolonger», используемое здесь в косвенной речи для описания объявленного (но ещё не окончательного) плана руководства — распространённый способ передать намерение, не утверждая его как безусловный факт.',
        strategy:
          "В вопросах «выберите все» об эксперименте или испытании отделяйте то, что уже произошло (подтверждённые факты, например, зарплатная политика), от того, что только планируется или рассматривается (например, продление эксперимента) — оба могут быть верными утверждениями, но по разным причинам.",
      },
    },
    kz: {
      prompt: "Төрт күндік апта сынағы туралы төмендегілердің қайсысы дұрыс? (Барлық сәйкес нұсқаларды таңдаңыз.)",
      options: [
        { id: "opt-a", text: "Қызметкерлер бір күн аз жұмыс істесе де, бірдей жалақыны сақтады" },
        { id: "opt-b", text: "Компания бұл өзгерісті бұрыннан тұрақты етті" },
        { id: "opt-c", text: "Басшылық сынақты тағы алты айға ұзартуды жоспарлап отыр" },
        { id: "opt-d", text: "Барлық бөлімдер дәл бірдей нәтиже хабарлады" },
      ],
      explanation: {
        whereInRecording:
          'Репортаж екі фактіні де растайды: «sans réduction de salaire pour ses employés» және «La direction a annoncé qu\'elle prolongerait l\'expérimentation encore six mois avant de décider».',
        keywords: "sans réduction de salaire; prolongerait l'expérimentation encore six mois",
        whyCorrect:
          "Екі тұжырым да тікелей расталады: сынақ жалақыны төмендетуді қамтымайды, әрі басшылық түпкілікті шешім қабылдамас бұрын сынақты тағы алты айға ұзартатынын жариялады.",
        whyIncorrect: [
          {
            optionId: "opt-b",
            reason:
              'Репортажда түпкілікті шешім әлі қабылданбағаны нақты айтылады — басшылық «prolongerait l\'expérimentation ... avant de décider si ce nouveau rythme sera adopté définitivement» дейді, яғни бұл әлі тұрақты емес.',
          },
          {
            optionId: "opt-d",
            reason:
              'Репортаж бөлімдерді нақты қарама-қарсы қояды: «tous les secteurs de l\'entreprise ne vivent pas cette transition de la même façon», клиенттерге қызмет көрсету бөлімі басқаларға қарағанда көбірек қиындық хабарлайды.',
          },
        ],
        vocabulary: [
          { term: "prolonger", translation: "ұзарту" },
          { term: "définitivement", translation: "түпкілікті / біржолата" },
        ],
        grammarPattern:
          '«Prolongerait» — «prolonger» етістігінің шартты рай түрі, мұнда жанама сөйлеуде басшылықтың жарияланған (бірақ әлі түпкіліктелмеген) жоспарын сипаттау үшін қолданылған — ниетті сенімді факт ретінде емес, хабарлаудың кең тараған тәсілі.',
        strategy:
          "Сынақ немесе тәжірибе туралы «барлығын таңда» сұрақтарында бұрыннан болған нәрсені (расталған фактілер, мысалы жалақы саясаты) тек жоспарланған немесе қарастырылып жатқан нәрседен (мысалы, сынақты ұзарту) бөліңіз — екеуі де дұрыс тұжырым болуы мүмкін, бірақ әртүрлі себептермен.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export const LISTENING_CONTENT_BANK: Record<DelfLevel, ListeningRecording[]> = {
  A1: [A1_TRAIN_STATION, A1_CAFE_ORDER, A1_SCHOOL_TIMETABLE, A1_FAMILY_INTRODUCTION, A1_SHOPPING_MARKET],
  A2: [A2_DOCTOR_APPOINTMENT, A2_WORK_SHIFT_SWAP, A2_TRAIN_TICKET_EXCHANGE, A2_HOTEL_RESERVATION_CALL, A2_HAIRDRESSER_APPOINTMENT],
  B1: [B1_STUDY_ABROAD_INTERVIEW, B1_BIKE_SHARE_NEWS, B1_VOLUNTEER_INTERVIEW, B1_REMOTE_WORK_DISCUSSION, B1_LOCAL_FESTIVAL_NEWS],
  B2: [B2_AI_DOCUMENTARY, B2_URBAN_MOBILITY_DEBATE, B2_CLIMATE_MIGRATION_DOCUMENTARY, B2_SOCIAL_MEDIA_DEBATE, B2_FOUR_DAY_WEEK_RADIO],
};

export const LISTENING_QUESTIONS_BY_RECORDING: Record<string, Record<FeedbackLanguage, ListeningQuestion[]>> = {
  [A1_TRAIN_STATION.id]: buildRecordingQuestions(a1TrainQ1, a1TrainQ2, a1TrainQ3),
  [A1_CAFE_ORDER.id]: buildRecordingQuestions(a1CafeQ1, a1CafeQ2, a1CafeQ3),
  [A1_SCHOOL_TIMETABLE.id]: buildRecordingQuestions(a1SchoolQ1, a1SchoolQ2, a1SchoolQ3),
  [A1_FAMILY_INTRODUCTION.id]: buildRecordingQuestions(a1FamilyQ1, a1FamilyQ2, a1FamilyQ3),
  [A1_SHOPPING_MARKET.id]: buildRecordingQuestions(a1ShoppingQ1, a1ShoppingQ2, a1ShoppingQ3),
  [A2_DOCTOR_APPOINTMENT.id]: buildRecordingQuestions(a2DoctorQ1, a2DoctorQ2, a2DoctorQ3),
  [A2_WORK_SHIFT_SWAP.id]: buildRecordingQuestions(a2ShiftQ1, a2ShiftQ2, a2ShiftQ3),
  [A2_TRAIN_TICKET_EXCHANGE.id]: buildRecordingQuestions(a2TicketQ1, a2TicketQ2, a2TicketQ3),
  [A2_HOTEL_RESERVATION_CALL.id]: buildRecordingQuestions(a2HotelQ1, a2HotelQ2, a2HotelQ3),
  [A2_HAIRDRESSER_APPOINTMENT.id]: buildRecordingQuestions(a2HairdresserQ1, a2HairdresserQ2, a2HairdresserQ3),
  [B1_STUDY_ABROAD_INTERVIEW.id]: buildRecordingQuestions(b1InterviewQ1, b1InterviewQ2, b1InterviewQ3),
  [B1_BIKE_SHARE_NEWS.id]: buildRecordingQuestions(b1BikeShareQ1, b1BikeShareQ2, b1BikeShareQ3),
  [B1_VOLUNTEER_INTERVIEW.id]: buildRecordingQuestions(b1VolunteerQ1, b1VolunteerQ2, b1VolunteerQ3),
  [B1_REMOTE_WORK_DISCUSSION.id]: buildRecordingQuestions(b1RemoteWorkQ1, b1RemoteWorkQ2, b1RemoteWorkQ3),
  [B1_LOCAL_FESTIVAL_NEWS.id]: buildRecordingQuestions(b1FestivalQ1, b1FestivalQ2, b1FestivalQ3),
  [B2_AI_DOCUMENTARY.id]: buildRecordingQuestions(b2AiQ1, b2AiQ2, b2AiQ3),
  [B2_URBAN_MOBILITY_DEBATE.id]: buildRecordingQuestions(b2DebateQ1, b2DebateQ2, b2DebateQ3),
  [B2_CLIMATE_MIGRATION_DOCUMENTARY.id]: buildRecordingQuestions(b2ClimateQ1, b2ClimateQ2, b2ClimateQ3),
  [B2_SOCIAL_MEDIA_DEBATE.id]: buildRecordingQuestions(b2SocialMediaQ1, b2SocialMediaQ2, b2SocialMediaQ3),
  [B2_FOUR_DAY_WEEK_RADIO.id]: buildRecordingQuestions(b2FourDayWeekQ1, b2FourDayWeekQ2, b2FourDayWeekQ3),
};
