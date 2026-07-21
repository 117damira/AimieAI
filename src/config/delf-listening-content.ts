import type {
  DelfLevel,
  FeedbackLanguage,
  ListeningDifficulty,
  ListeningQuestion,
  ListeningQuestionExplanation,
  ListeningQuestionOption,
  ListeningRecording,
  ListeningSkillTag,
} from "@/types/listening";

/**
 * Offline fallback content bank for DELF Listening (Compréhension de l'Oral)
 * — used whenever no ANTHROPIC_API_KEY is configured. Two original
 * recordings per level, two questions per recording, each question fully
 * localized in en/ru/kz (prompt, options, explanation). Never copies real
 * DELF recordings; every explanation is grounded in the transcript actually
 * written for that recording.
 *
 * `LISTENING_QUESTIONS_BY_RECORDING` is keyed by recording id, then by
 * FeedbackLanguage, because `ListeningQuestion.prompt`/`options[].text` are
 * plain strings (not `Record<FeedbackLanguage, string>`) — so each language
 * needs its own fully-formed question array. Option ids and `correctOptionId`
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
  correctOptionId: string;
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
      prompt: content.prompt,
      options: content.options,
      correctOptionId: spec.correctOptionId,
      difficulty: spec.difficulty,
      skillTag: spec.skillTag,
      explanation: content.explanation,
    };
  }
  return out;
}

function buildRecordingQuestions(
  q1: QuestionSpec,
  q2: QuestionSpec
): Record<FeedbackLanguage, ListeningQuestion[]> {
  const built1 = buildQuestionSet(q1);
  const built2 = buildQuestionSet(q2);
  return {
    en: [built1.en, built2.en],
    ru: [built1.ru, built2.ru],
    kz: [built1.kz, built2.kz],
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

const a1TrainQ1: QuestionSpec = {
  id: "a1-train-station-1-q1",
  recordingId: "a1-train-station-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

const a1CafeQ1: QuestionSpec = {
  id: "a1-cafe-order-1-q1",
  recordingId: "a1-cafe-order-1",
  questionNumber: 1,
  correctOptionId: "opt-b",
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
  correctOptionId: "opt-b",
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

const a2DoctorQ1: QuestionSpec = {
  id: "a2-doctor-appointment-1-q1",
  recordingId: "a2-doctor-appointment-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

const a2ShiftQ1: QuestionSpec = {
  id: "a2-work-shift-swap-1-q1",
  recordingId: "a2-work-shift-swap-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

const b1InterviewQ1: QuestionSpec = {
  id: "b1-study-abroad-interview-1-q1",
  recordingId: "b1-study-abroad-interview-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

const b1BikeShareQ1: QuestionSpec = {
  id: "b1-bike-share-news-1-q1",
  recordingId: "b1-bike-share-news-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

const b2AiQ1: QuestionSpec = {
  id: "b2-ai-employment-documentary-1-q1",
  recordingId: "b2-ai-employment-documentary-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

const b2DebateQ1: QuestionSpec = {
  id: "b2-urban-mobility-debate-1-q1",
  recordingId: "b2-urban-mobility-debate-1",
  questionNumber: 1,
  correctOptionId: "opt-c",
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
  correctOptionId: "opt-c",
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

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export const LISTENING_CONTENT_BANK: Record<DelfLevel, ListeningRecording[]> = {
  A1: [A1_TRAIN_STATION, A1_CAFE_ORDER],
  A2: [A2_DOCTOR_APPOINTMENT, A2_WORK_SHIFT_SWAP],
  B1: [B1_STUDY_ABROAD_INTERVIEW, B1_BIKE_SHARE_NEWS],
  B2: [B2_AI_DOCUMENTARY, B2_URBAN_MOBILITY_DEBATE],
};

export const LISTENING_QUESTIONS_BY_RECORDING: Record<string, Record<FeedbackLanguage, ListeningQuestion[]>> = {
  [A1_TRAIN_STATION.id]: buildRecordingQuestions(a1TrainQ1, a1TrainQ2),
  [A1_CAFE_ORDER.id]: buildRecordingQuestions(a1CafeQ1, a1CafeQ2),
  [A2_DOCTOR_APPOINTMENT.id]: buildRecordingQuestions(a2DoctorQ1, a2DoctorQ2),
  [A2_WORK_SHIFT_SWAP.id]: buildRecordingQuestions(a2ShiftQ1, a2ShiftQ2),
  [B1_STUDY_ABROAD_INTERVIEW.id]: buildRecordingQuestions(b1InterviewQ1, b1InterviewQ2),
  [B1_BIKE_SHARE_NEWS.id]: buildRecordingQuestions(b1BikeShareQ1, b1BikeShareQ2),
  [B2_AI_DOCUMENTARY.id]: buildRecordingQuestions(b2AiQ1, b2AiQ2),
  [B2_URBAN_MOBILITY_DEBATE.id]: buildRecordingQuestions(b2DebateQ1, b2DebateQ2),
};
