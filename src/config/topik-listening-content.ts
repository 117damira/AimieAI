import type {
  FeedbackLanguage,
  TopikLevel,
  TopikListeningDifficulty,
  TopikListeningQuestion,
  TopikListeningQuestionExplanation,
  TopikListeningQuestionOption,
  TopikListeningQuestionType,
  TopikListeningRecording,
  TopikListeningSkillTag,
} from "@/types/topik-listening";

/**
 * Offline fallback content bank for TOPIK Listening (듣기) — used whenever
 * no ANTHROPIC_API_KEY is configured, and ALWAYS for the Daily Challenge
 * regardless of API key (see app/api/topik/listening/generate/route.ts).
 * Two original recordings per level, three questions per recording, each
 * question fully localized in en/ru/kz (prompt, options, explanation).
 * Every scenario here is genuinely invented for this app — never a copy of
 * a real official TOPIK recording, and never a translation of DELF's
 * French content. Mirrors config/delf-listening-content.ts's structure and
 * helper functions exactly.
 *
 * `TOPIK_LISTENING_QUESTIONS_BY_RECORDING` is keyed by recording id, then
 * by FeedbackLanguage, because `TopikListeningQuestion.prompt`/`options[].text`
 * are plain strings (not `Record<FeedbackLanguage, string>`) — so each
 * language needs its own fully-formed question array. Option ids and
 * `correctOptionIds` stay identical across the three language variants of
 * the same question.
 */

const LANGS: FeedbackLanguage[] = ["en", "ru", "kz"];

interface QuestionContentSpec {
  prompt: string;
  options: TopikListeningQuestionOption[];
  explanation: TopikListeningQuestionExplanation;
}

interface QuestionSpec {
  id: string;
  recordingId: string;
  questionNumber: number;
  type: TopikListeningQuestionType;
  correctOptionIds: string[];
  difficulty: TopikListeningDifficulty;
  skillTag: TopikListeningSkillTag;
  content: Record<FeedbackLanguage, QuestionContentSpec>;
}

function buildQuestionSet(spec: QuestionSpec): Record<FeedbackLanguage, TopikListeningQuestion> {
  const out = {} as Record<FeedbackLanguage, TopikListeningQuestion>;
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
): Record<FeedbackLanguage, TopikListeningQuestion[]> {
  const built = specs.map(buildQuestionSet);
  return {
    en: built.map((b) => b.en),
    ru: built.map((b) => b.ru),
    kz: built.map((b) => b.kz),
  };
}

// ---------------------------------------------------------------------------
// Level 1 — 초급: bus stop announcement, café order. Present tense, very
// short sentences, everyday situations.
// ---------------------------------------------------------------------------

const L1_BUS_STOP: TopikListeningRecording = {
  id: "topik1-bus-stop-1",
  partLabel: "Recording 1",
  topic: "Bus stop announcement",
  transcript:
    "승객 여러분, 안녕하세요. 5번 버스가 3분 후에 도착합니다. 이 버스는 시청과 기차역으로 갑니다. 요금은 천오백 원입니다. 카드로 요금을 내시면 편리합니다. 버스를 기다려 주셔서 감사합니다.",
  estimatedDurationSeconds: 18,
};

const L1_CAFE_ORDER: TopikListeningRecording = {
  id: "topik1-cafe-order-1",
  partLabel: "Recording 2",
  topic: "Ordering at a café",
  transcript:
    "안녕하세요, 무엇을 드릴까요? 아메리카노 한 잔 주세요. 뜨거운 거요, 아니면 차가운 거요? 차가운 거요. 사이즈는요? 큰 걸로 주세요. 네, 사천 원입니다. 여기 있어요. 감사합니다, 맛있게 드세요.",
  estimatedDurationSeconds: 17,
};

const l1BusQ1: QuestionSpec = {
  id: "topik1-bus-stop-1-q1",
  recordingId: "topik1-bus-stop-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "numberDateLocation",
  content: {
    en: {
      prompt: "How many minutes until bus number 5 arrives?",
      options: [
        { id: "opt-a", text: "1 minute" },
        { id: "opt-b", text: "3 minutes" },
        { id: "opt-c", text: "5 minutes" },
        { id: "opt-d", text: "10 minutes" },
      ],
      explanation: {
        whereInRecording: '"5번 버스가 3분 후에 도착합니다" — this is stated right at the start of the announcement.',
        keywords: "5번 버스, 3분 후, 도착합니다",
        whyCorrect: "The announcer explicitly says bus 5 will arrive '3분 후' (in 3 minutes) — a direct, unambiguous number.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "1 minute is never mentioned anywhere in the announcement." },
          { optionId: "opt-c", reason: "5 minutes confuses the bus number (5번) with the arrival time — the '5' in the recording refers to which bus, not how long the wait is." },
          { optionId: "opt-d", reason: "10 minutes is never mentioned; the announcement gives a much shorter wait." },
        ],
        vocabulary: [
          { term: "도착하다", translation: "to arrive" },
          { term: "요금", translation: "fare" },
        ],
        grammarPattern: "'-후에' attaches to a time expression to mean 'after ___' — '3분 후에' = 'in 3 minutes / after 3 minutes'.",
        strategy: "When a recording opens with a number, write it down immediately — announcements often give the single most important number right away.",
      },
    },
    ru: {
      prompt: "Через сколько минут прибудет автобус номер 5?",
      options: [
        { id: "opt-a", text: "Через 1 минуту" },
        { id: "opt-b", text: "Через 3 минуты" },
        { id: "opt-c", text: "Через 5 минут" },
        { id: "opt-d", text: "Через 10 минут" },
      ],
      explanation: {
        whereInRecording: '"5번 버스가 3분 후에 도착합니다" — это сказано в самом начале объявления.',
        keywords: "5번 버스, 3분 후, 도착합니다",
        whyCorrect: "Диктор прямо говорит, что автобус 5 прибудет '3분 후' (через 3 минуты) — конкретное, однозначное число.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "1 минута нигде не упоминается в объявлении." },
          { optionId: "opt-c", reason: "5 минут путает номер автобуса (5번) со временем ожидания — цифра '5' в записи относится к номеру автобуса, а не ко времени." },
          { optionId: "opt-d", reason: "10 минут нигде не упоминается; в объявлении говорится о гораздо более коротком ожидании." },
        ],
        vocabulary: [
          { term: "도착하다", translation: "прибывать" },
          { term: "요금", translation: "плата за проезд" },
        ],
        grammarPattern: "Частица '-후에' присоединяется к выражению времени и означает 'через ___' — '3분 후에' = 'через 3 минуты'.",
        strategy: "Если запись начинается с числа, сразу записывайте его — в объявлениях самое важное число часто даётся в начале.",
      },
    },
    kz: {
      prompt: "5-ші автобус қанша минуттан кейін келеді?",
      options: [
        { id: "opt-a", text: "1 минуттан кейін" },
        { id: "opt-b", text: "3 минуттан кейін" },
        { id: "opt-c", text: "5 минуттан кейін" },
        { id: "opt-d", text: "10 минуттан кейін" },
      ],
      explanation: {
        whereInRecording: '"5번 버스가 3분 후에 도착합니다" — бұл хабарландырудың басында-ақ айтылады.',
        keywords: "5번 버스, 3분 후, 도착합니다",
        whyCorrect: "Хабарлаушы 5-ші автобустың '3분 후' (3 минуттан кейін) келетінін нақты айтады — тікелей, айқын сан.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "1 минут хабарландыруда мүлдем айтылмайды." },
          { optionId: "opt-c", reason: "5 минут автобус нөмірін (5번) күту уақытымен шатастырады — жазбадағы '5' саны автобус нөміріне қатысты, күту уақытына емес." },
          { optionId: "opt-d", reason: "10 минут ешқашан айтылмайды; хабарландыруда әлдеқайда қысқа күту уақыты берілген." },
        ],
        vocabulary: [
          { term: "도착하다", translation: "келу, жету" },
          { term: "요금", translation: "жол ақысы" },
        ],
        grammarPattern: "'-후에' жалғауы уақыт өрнегіне жалғанып 'арадан ___ кейін' дегенді білдіреді — '3분 후에' = '3 минуттан кейін'.",
        strategy: "Жазба саннан басталса, оны бірден жазып алыңыз — хабарландыруларда ең маңызды сан көбіне басында беріледі.",
      },
    },
  },
};

const l1BusQ2: QuestionSpec = {
  id: "topik1-bus-stop-1-q2",
  recordingId: "topik1-bus-stop-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "This bus goes to the train station.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"이 버스는 시청과 기차역으로 갑니다" names both destinations directly.',
        keywords: "시청, 기차역, 갑니다",
        whyCorrect: "The announcement lists the train station ('기차역') as one of the two destinations the bus serves.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "This ignores the explicit '기차역' (train station) mentioned as a destination." },
        ],
        vocabulary: [
          { term: "기차역", translation: "train station" },
          { term: "시청", translation: "city hall" },
        ],
        grammarPattern: "'-(으)로 가다' means 'to go to/toward ___' — the destination particle '-로' attaches to the place.",
        strategy: "When two destinations are listed with '과/와' (and), make sure you catch both before answering a true/false about either one.",
      },
    },
    ru: {
      prompt: "Этот автобус едет до железнодорожного вокзала.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"이 버스는 시청과 기차역으로 갑니다" прямо называет оба пункта назначения.',
        keywords: "시청, 기차역, 갑니다",
        whyCorrect: "В объявлении вокзал ('기차역') указан как один из двух пунктов назначения автобуса.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "Этот вариант игнорирует явное упоминание '기차역' (вокзал) как пункта назначения." },
        ],
        vocabulary: [
          { term: "기차역", translation: "железнодорожный вокзал" },
          { term: "시청", translation: "мэрия" },
        ],
        grammarPattern: "'-(으)로 가다' означает 'ехать к/в ___' — показатель направления '-로' присоединяется к месту.",
        strategy: "Когда перечислены два пункта назначения через '과/와' (и), убедитесь, что уловили оба, прежде чем отвечать верно/неверно.",
      },
    },
    kz: {
      prompt: "Бұл автобус теміржол вокзалына барады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"이 버스는 시청과 기차역으로 갑니다" екі бағытты да тікелей атайды.',
        keywords: "시청, 기차역, 갑니다",
        whyCorrect: "Хабарландыруда вокзал ('기차역') автобустың екі бағытының бірі ретінде көрсетілген.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "Бұл нұсқа '기차역' (вокзал) бағыт ретінде тікелей аталғанын елемейді." },
        ],
        vocabulary: [
          { term: "기차역", translation: "теміржол вокзалы" },
          { term: "시청", translation: "қала әкімшілігі" },
        ],
        grammarPattern: "'-(으)로 가다' '___-ға бару' дегенді білдіреді — бағыт жалғауы '-로' орынға жалғанады.",
        strategy: "Екі бағыт '과/와' (және) арқылы аталса, дұрыс/бұрыс сұраққа жауап бермес бұрын екеуін де ұстап қалыңыз.",
      },
    },
  },
};

const l1BusQ3: QuestionSpec = {
  id: "topik1-bus-stop-1-q3",
  recordingId: "topik1-bus-stop-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b"],
  difficulty: "medium",
  skillTag: "statementMatch",
  content: {
    en: {
      prompt: "Select every statement that is true about the bus.",
      options: [
        { id: "opt-a", text: "The fare is 1,500 won." },
        { id: "opt-b", text: "You can pay the fare by card." },
        { id: "opt-c", text: "It does not go to city hall." },
        { id: "opt-d", text: "It arrives in 10 minutes." },
      ],
      explanation: {
        whereInRecording: '"요금은 천오백 원입니다" and "카드로 요금을 내시면 편리합니다" confirm both true statements.',
        keywords: "천오백 원, 카드로, 편리합니다",
        whyCorrect: "The fare (1,500 won) and card payment are both stated directly and match options a and b exactly.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "The bus explicitly does go to city hall ('시청') — this option states the opposite of the recording." },
          { optionId: "opt-d", reason: "The announcement says 3 minutes, not 10 — this is the wrong number." },
        ],
        vocabulary: [
          { term: "요금", translation: "fare" },
          { term: "편리하다", translation: "to be convenient" },
        ],
        grammarPattern: "'-(으)면 편리하다' means 'it's convenient if ___' — a conditional recommendation pattern.",
        strategy: "For multi-select questions, check every option one by one against the transcript rather than picking the first one that sounds right.",
      },
    },
    ru: {
      prompt: "Выберите все верные утверждения об автобусе.",
      options: [
        { id: "opt-a", text: "Плата за проезд — 1500 вон." },
        { id: "opt-b", text: "Можно оплатить картой." },
        { id: "opt-c", text: "Он не едет до мэрии." },
        { id: "opt-d", text: "Он прибывает через 10 минут." },
      ],
      explanation: {
        whereInRecording: '"요금은 천오백 원입니다" и "카드로 요금을 내시면 편리합니다" подтверждают оба верных утверждения.',
        keywords: "천오백 원, 카드로, 편리합니다",
        whyCorrect: "Плата (1500 вон) и оплата картой прямо упомянуты и точно соответствуют вариантам a и b.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "Автобус действительно едет до мэрии ('시청') — этот вариант утверждает обратное тому, что в записи." },
          { optionId: "opt-d", reason: "В объявлении сказано 3 минуты, а не 10 — это неверное число." },
        ],
        vocabulary: [
          { term: "요금", translation: "плата за проезд" },
          { term: "편리하다", translation: "быть удобным" },
        ],
        grammarPattern: "'-(으)면 편리하다' означает 'удобно, если ___' — условная рекомендация.",
        strategy: "В вопросах с множественным выбором проверяйте каждый вариант по отдельности, сверяясь с текстом, а не выбирайте первый похожий на правду.",
      },
    },
    kz: {
      prompt: "Автобус туралы дұрыс мәлімдемелердің барлығын таңдаңыз.",
      options: [
        { id: "opt-a", text: "Жол ақысы 1500 вон." },
        { id: "opt-b", text: "Картамен төлеуге болады." },
        { id: "opt-c", text: "Ол қала әкімшілігіне бармайды." },
        { id: "opt-d", text: "Ол 10 минуттан кейін келеді." },
      ],
      explanation: {
        whereInRecording: '"요금은 천오백 원입니다" және "카드로 요금을 내시면 편리합니다" екі дұрыс мәлімдемені де растайды.',
        keywords: "천오백 원, 카드로, 편리합니다",
        whyCorrect: "Жол ақысы (1500 вон) және картамен төлеу тікелей айтылған және a, b нұсқаларына дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "Автобус қала әкімшілігіне ('시청') шынымен барады — бұл нұсқа жазбаға қарама-қарсы айтады." },
          { optionId: "opt-d", reason: "Хабарландыруда 10 емес, 3 минут делінген — бұл қате сан." },
        ],
        vocabulary: [
          { term: "요금", translation: "жол ақысы" },
          { term: "편리하다", translation: "ыңғайлы болу" },
        ],
        grammarPattern: "'-(으)면 편리하다' '___ болса, ыңғайлы' дегенді білдіреді — шартты ұсыныс құрылымы.",
        strategy: "Көп таңдау сұрақтарында алғаш дұрыс көрінген нұсқаны таңдамай, әр нұсқаны мәтінмен жеке салыстырыңыз.",
      },
    },
  },
};

const l1CafeQ1: QuestionSpec = {
  id: "topik1-cafe-order-1-q1",
  recordingId: "topik1-cafe-order-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What drink did the customer order?",
      options: [
        { id: "opt-a", text: "Café latte" },
        { id: "opt-b", text: "Americano" },
        { id: "opt-c", text: "Espresso" },
        { id: "opt-d", text: "Black tea" },
      ],
      explanation: {
        whereInRecording: '"아메리카노 한 잔 주세요" is the customer\'s order, stated right after the greeting.',
        keywords: "아메리카노, 한 잔, 주세요",
        whyCorrect: "The customer directly requests one Americano ('아메리카노 한 잔').",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Café latte is never mentioned in the conversation." },
          { optionId: "opt-c", reason: "Espresso is never mentioned; only Americano is ordered." },
          { optionId: "opt-d", reason: "Black tea is never mentioned in the conversation." },
        ],
        vocabulary: [
          { term: "주세요", translation: "please give me" },
          { term: "한 잔", translation: "one cup/glass" },
        ],
        grammarPattern: "'-(으)세요' after a noun + counter is a polite request pattern used for ordering.",
        strategy: "In ordering dialogues, the very first thing the customer names is usually the main item being tested — listen for it immediately.",
      },
    },
    ru: {
      prompt: "Какой напиток заказал посетитель?",
      options: [
        { id: "opt-a", text: "Кафе латте" },
        { id: "opt-b", text: "Американо" },
        { id: "opt-c", text: "Эспрессо" },
        { id: "opt-d", text: "Чёрный чай" },
      ],
      explanation: {
        whereInRecording: '"아메리카노 한 잔 주세요" — это заказ посетителя сразу после приветствия.',
        keywords: "아메리카노, 한 잔, 주세요",
        whyCorrect: "Посетитель прямо просит один американо ('아메리카노 한 잔').",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Кафе латте нигде не упоминается в разговоре." },
          { optionId: "opt-c", reason: "Эспрессо нигде не упоминается; заказан только американо." },
          { optionId: "opt-d", reason: "Чёрный чай нигде не упоминается в разговоре." },
        ],
        vocabulary: [
          { term: "주세요", translation: "дайте, пожалуйста" },
          { term: "한 잔", translation: "одна чашка/стакан" },
        ],
        grammarPattern: "'-(으)세요' после существительного + счётного слова — вежливая форма просьбы при заказе.",
        strategy: "В диалогах заказа то, что посетитель называет первым, обычно и есть проверяемый пункт — слушайте его сразу.",
      },
    },
    kz: {
      prompt: "Клиент қандай сусын тапсырыс берді?",
      options: [
        { id: "opt-a", text: "Кафе латте" },
        { id: "opt-b", text: "Американо" },
        { id: "opt-c", text: "Эспрессо" },
        { id: "opt-d", text: "Қара шай" },
      ],
      explanation: {
        whereInRecording: '"아메리카노 한 잔 주세요" — бұл сәлемдесуден кейін бірден айтылған клиенттің тапсырысы.',
        keywords: "아메리카노, 한 잔, 주세요",
        whyCorrect: "Клиент тікелей бір американо ('아메리카노 한 잔') сұрайды.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Кафе латте сөйлесуде мүлдем аталмайды." },
          { optionId: "opt-c", reason: "Эспрессо мүлдем аталмайды; тек американо тапсырыс берілді." },
          { optionId: "opt-d", reason: "Қара шай сөйлесуде мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "주세요", translation: "беріңізші" },
          { term: "한 잔", translation: "бір кесе" },
        ],
        grammarPattern: "Зат есім + санауыш сөзден кейінгі '-(으)세요' — тапсырыс беруде қолданылатын сыпайы өтініш үлгісі.",
        strategy: "Тапсырыс беру диалогтарында клиент бірінші атаған зат әдетте тексерілетін негізгі элемент болады — оны бірден тыңдаңыз.",
      },
    },
  },
};

const l1CafeQ2: QuestionSpec = {
  id: "topik1-cafe-order-1-q2",
  recordingId: "topik1-cafe-order-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "easy",
  skillTag: "numberDateLocation",
  content: {
    en: {
      prompt: "The drink was ordered hot.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"뜨거운 거요, 아니면 차가운 거요? 차가운 거요." — the customer directly chooses cold.',
        keywords: "차가운 거요",
        whyCorrect: "When asked hot or cold, the customer answers '차가운 거요' (the cold one) — the opposite of hot.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "This reverses the customer's actual answer — they chose cold, not hot." },
        ],
        vocabulary: [
          { term: "뜨겁다", translation: "to be hot" },
          { term: "차갑다", translation: "to be cold" },
        ],
        grammarPattern: "'-거요' here is a contraction of '것이요', meaning 'the [hot/cold] one' — a common spoken-Korean shortening.",
        strategy: "When a question offers a choice (A 아니면 B?), the answer given right after is the one to note — don't default to the first option mentioned.",
      },
    },
    ru: {
      prompt: "Напиток заказали горячим.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"뜨거운 거요, 아니면 차가운 거요? 차가운 거요." — посетитель прямо выбирает холодный.',
        keywords: "차가운 거요",
        whyCorrect: "На вопрос горячий или холодный посетитель отвечает '차가운 거요' (холодный) — противоположность горячему.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Это переворачивает реальный ответ посетителя — он выбрал холодный, а не горячий." },
        ],
        vocabulary: [
          { term: "뜨겁다", translation: "быть горячим" },
          { term: "차갑다", translation: "быть холодным" },
        ],
        grammarPattern: "'-거요' здесь — сокращение от '것이요', означает '[горячий/холодный] вариант' — обычное сокращение в разговорной речи.",
        strategy: "Когда вопрос предлагает выбор (A 아니면 B?), отмечайте ответ, данный сразу после — не выбирайте автоматически первый упомянутый вариант.",
      },
    },
    kz: {
      prompt: "Сусын ыстық етіп тапсырыс берілді.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"뜨거운 거요, 아니면 차가운 거요? 차가운 거요." — клиент тікелей суықты таңдайды.',
        keywords: "차가운 거요",
        whyCorrect: "Ыстық па, суық па деп сұрағанда, клиент '차가운 거요' (суық нұсқа) деп жауап береді — бұл ыстыққа қарама-қарсы.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Бұл клиенттің нақты жауабын керісінше көрсетеді — ол суықты таңдады, ыстықты емес." },
        ],
        vocabulary: [
          { term: "뜨겁다", translation: "ыстық болу" },
          { term: "차갑다", translation: "суық болу" },
        ],
        grammarPattern: "Мұндағы '-거요' '것이요'-ден қысқарған, '[ыстық/суық] нұсқа' дегенді білдіреді — ауызекі тілде жиі кездесетін қысқарту.",
        strategy: "Сұрақ таңдау ұсынғанда (A 아니면 B?), бірден кейін берілген жауапты белгілеңіз — бірінші аталған нұсқаны автоматты таңдамаңыз.",
      },
    },
  },
};

const l1CafeQ3: QuestionSpec = {
  id: "topik1-cafe-order-1-q3",
  recordingId: "topik1-cafe-order-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "numberDateLocation",
  content: {
    en: {
      prompt: "How much does the drink cost?",
      options: [
        { id: "opt-a", text: "2,000 won" },
        { id: "opt-b", text: "3,000 won" },
        { id: "opt-c", text: "4,000 won" },
        { id: "opt-d", text: "5,000 won" },
      ],
      explanation: {
        whereInRecording: '"네, 사천 원입니다" states the final price after the size is chosen.',
        keywords: "사천 원",
        whyCorrect: "The barista states the total price directly as '사천 원' (4,000 won).",
        whyIncorrect: [
          { optionId: "opt-a", reason: "2,000 won is never mentioned in the conversation." },
          { optionId: "opt-b", reason: "3,000 won is never mentioned in the conversation." },
          { optionId: "opt-d", reason: "5,000 won is never mentioned; it's higher than the stated price." },
        ],
        vocabulary: [
          { term: "사천 원", translation: "4,000 won" },
          { term: "사이즈", translation: "size" },
        ],
        grammarPattern: "Korean prices are read as pure numbers + '원' (won), e.g. '사천' = 4,000 using the Sino-Korean number system.",
        strategy: "Prices are usually confirmed once, right after payment details are settled — that single mention is the number to remember.",
      },
    },
    ru: {
      prompt: "Сколько стоит напиток?",
      options: [
        { id: "opt-a", text: "2000 вон" },
        { id: "opt-b", text: "3000 вон" },
        { id: "opt-c", text: "4000 вон" },
        { id: "opt-d", text: "5000 вон" },
      ],
      explanation: {
        whereInRecording: '"네, 사천 원입니다" называет итоговую цену после выбора размера.',
        keywords: "사천 원",
        whyCorrect: "Бариста прямо называет итоговую цену — '사천 원' (4000 вон).",
        whyIncorrect: [
          { optionId: "opt-a", reason: "2000 вон нигде не упоминается в разговоре." },
          { optionId: "opt-b", reason: "3000 вон нигде не упоминается в разговоре." },
          { optionId: "opt-d", reason: "5000 вон нигде не упоминается; это больше названной цены." },
        ],
        vocabulary: [
          { term: "사천 원", translation: "4000 вон" },
          { term: "사이즈", translation: "размер" },
        ],
        grammarPattern: "Корейские цены читаются как числа + '원' (вон), например '사천' = 4000 по китайско-корейской системе счёта.",
        strategy: "Цена обычно называется один раз, сразу после уточнения деталей оплаты — именно это число нужно запомнить.",
      },
    },
    kz: {
      prompt: "Сусынның бағасы қанша?",
      options: [
        { id: "opt-a", text: "2000 вон" },
        { id: "opt-b", text: "3000 вон" },
        { id: "opt-c", text: "4000 вон" },
        { id: "opt-d", text: "5000 вон" },
      ],
      explanation: {
        whereInRecording: '"네, 사천 원입니다" өлшемі таңдалғаннан кейінгі соңғы бағаны айтады.',
        keywords: "사천 원",
        whyCorrect: "Бариста жалпы бағаны тікелей '사천 원' (4000 вон) деп айтады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "2000 вон сөйлесуде мүлдем аталмайды." },
          { optionId: "opt-b", reason: "3000 вон сөйлесуде мүлдем аталмайды." },
          { optionId: "opt-d", reason: "5000 вон мүлдем аталмайды; бұл айтылған бағадан жоғары." },
        ],
        vocabulary: [
          { term: "사천 원", translation: "4000 вон" },
          { term: "사이즈", translation: "өлшем" },
        ],
        grammarPattern: "Корей бағалары сан + '원' (вон) түрінде оқылады, мысалы '사천' = 4000, қытай-корей сан жүйесі бойынша.",
        strategy: "Баға әдетте төлем егжей-тегжейі анықталғаннан кейін бір рет расталады — есте сақтайтын сан осы.",
      },
    },
  },
};

const L1_BUS_STOP_QUESTIONS = buildRecordingQuestions(l1BusQ1, l1BusQ2, l1BusQ3);
const L1_CAFE_ORDER_QUESTIONS = buildRecordingQuestions(l1CafeQ1, l1CafeQ2, l1CafeQ3);

// ---------------------------------------------------------------------------
// Level 2 — 초중급: phone call making plans, weather forecast. Slightly
// longer sentences, past/future tense, everyday-but-connected situations.
// ---------------------------------------------------------------------------

const L2_PHONE_PLANS: TopikListeningRecording = {
  id: "topik2-phone-plans-1",
  partLabel: "Recording 1",
  topic: "Making evening plans by phone",
  transcript:
    "여보세요? 응, 나야. 오늘 저녁에 시간 있어? 어, 있어. 왜? 같이 저녁 먹을래? 좋아! 몇 시에 만날까? 일곱 시 어때? 좋아, 그럼 지하철역 앞에서 만나자. 알겠어, 이따 봐!",
  estimatedDurationSeconds: 22,
};

const L2_WEATHER_FORECAST: TopikListeningRecording = {
  id: "topik2-weather-forecast-1",
  partLabel: "Recording 2",
  topic: "Daily weather forecast",
  transcript:
    "오늘의 날씨입니다. 오늘 오전에는 맑겠고 오후에는 구름이 많겠습니다. 기온은 어제보다 조금 낮겠습니다. 저녁에는 바람이 강하게 불겠으니 우산보다는 두꺼운 옷을 준비하시기 바랍니다. 내일은 전국에 비가 오겠습니다.",
  estimatedDurationSeconds: 24,
};

const l2PhoneQ1: QuestionSpec = {
  id: "topik2-phone-plans-1-q1",
  recordingId: "topik2-phone-plans-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "numberDateLocation",
  content: {
    en: {
      prompt: "What time did they agree to meet?",
      options: [
        { id: "opt-a", text: "6 o'clock" },
        { id: "opt-b", text: "7 o'clock" },
        { id: "opt-c", text: "8 o'clock" },
        { id: "opt-d", text: "9 o'clock" },
      ],
      explanation: {
        whereInRecording: '"일곱 시 어때? 좋아" — one speaker proposes 7 o\'clock and the other agrees.',
        keywords: "일곱 시, 어때, 좋아",
        whyCorrect: "'일곱 시' (seven o'clock) is proposed and immediately accepted with '좋아' (sounds good).",
        whyIncorrect: [
          { optionId: "opt-a", reason: "6 o'clock is never proposed in the call." },
          { optionId: "opt-c", reason: "8 o'clock is never mentioned; it's later than the agreed time." },
          { optionId: "opt-d", reason: "9 o'clock is never mentioned in the conversation." },
        ],
        vocabulary: [
          { term: "일곱 시", translation: "seven o'clock" },
          { term: "만나다", translation: "to meet" },
        ],
        grammarPattern: "'-이/가 어때?' is used to propose an idea casually, meaning 'how about ___?'.",
        strategy: "In planning dialogues, the time is usually proposed once and confirmed once — both mentions should match; write the number down the first time you hear it.",
      },
    },
    ru: {
      prompt: "На какое время они договорились встретиться?",
      options: [
        { id: "opt-a", text: "На 6 часов" },
        { id: "opt-b", text: "На 7 часов" },
        { id: "opt-c", text: "На 8 часов" },
        { id: "opt-d", text: "На 9 часов" },
      ],
      explanation: {
        whereInRecording: '"일곱 시 어때? 좋아" — один собеседник предлагает 7 часов, другой соглашается.',
        keywords: "일곱 시, 어때, 좋아",
        whyCorrect: "'일곱 시' (семь часов) предлагается и сразу принимается со словом '좋아' (хорошо).",
        whyIncorrect: [
          { optionId: "opt-a", reason: "6 часов в разговоре никогда не предлагается." },
          { optionId: "opt-c", reason: "8 часов нигде не упоминается; это позже согласованного времени." },
          { optionId: "opt-d", reason: "9 часов нигде не упоминается в разговоре." },
        ],
        vocabulary: [
          { term: "일곱 시", translation: "семь часов" },
          { term: "만나다", translation: "встречаться" },
        ],
        grammarPattern: "'-이/가 어때?' используется для непринуждённого предложения идеи, означает 'как насчёт ___?'.",
        strategy: "В диалогах о планах время обычно предлагается один раз и подтверждается один раз — оба упоминания должны совпадать; запишите число сразу, как услышите.",
      },
    },
    kz: {
      prompt: "Олар қай уақытта кездесуге келісті?",
      options: [
        { id: "opt-a", text: "Сағат 6-да" },
        { id: "opt-b", text: "Сағат 7-де" },
        { id: "opt-c", text: "Сағат 8-де" },
        { id: "opt-d", text: "Сағат 9-да" },
      ],
      explanation: {
        whereInRecording: '"일곱 시 어때? 좋아" — бір сөйлеуші сағат 7-ні ұсынады, екіншісі келіседі.',
        keywords: "일곱 시, 어때, 좋아",
        whyCorrect: "'일곱 시' (сағат жеті) ұсынылады және бірден '좋아' (жақсы) деп қабылданады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Сағат 6 қоңырауда ешқашан ұсынылмайды." },
          { optionId: "opt-c", reason: "Сағат 8 мүлдем аталмайды; бұл келісілген уақыттан кеш." },
          { optionId: "opt-d", reason: "Сағат 9 сөйлесуде мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "일곱 시", translation: "сағат жеті" },
          { term: "만나다", translation: "кездесу" },
        ],
        grammarPattern: "'-이/가 어때?' идеяны еркін ұсыну үшін қолданылады, '___ қалай?' дегенді білдіреді.",
        strategy: "Жоспарлау диалогтарында уақыт әдетте бір рет ұсынылып, бір рет расталады — екеуі де сәйкес болуы керек; санды алғаш естігенде жазып алыңыз.",
      },
    },
  },
};

const l2PhoneQ2: QuestionSpec = {
  id: "topik2-phone-plans-1-q2",
  recordingId: "topik2-phone-plans-1",
  questionNumber: 2,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "The two people agreed to meet at a café.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"그럼 지하철역 앞에서 만나자" names the actual meeting spot.',
        keywords: "지하철역 앞에서, 만나자",
        whyCorrect: "The agreed meeting place is explicitly '지하철역 앞' (in front of the subway station), not a café.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "A café is never mentioned anywhere in the call; only the subway station is named as the meeting point." },
        ],
        vocabulary: [
          { term: "지하철역", translation: "subway station" },
          { term: "앞에서", translation: "in front of" },
        ],
        grammarPattern: "'-자' is an informal proposal ending meaning 'let's ___', used here for '만나자' (let's meet).",
        strategy: "Don't assume a common location like 'café' just because the context is casual — always confirm the exact place named in the recording.",
      },
    },
    ru: {
      prompt: "Собеседники договорились встретиться в кафе.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"그럼 지하철역 앞에서 만나자" называет настоящее место встречи.',
        keywords: "지하철역 앞에서, 만나자",
        whyCorrect: "Согласованное место встречи прямо названо — '지하철역 앞' (перед станцией метро), а не кафе.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Кафе нигде не упоминается в разговоре; местом встречи названа только станция метро." },
        ],
        vocabulary: [
          { term: "지하철역", translation: "станция метро" },
          { term: "앞에서", translation: "перед, впереди" },
        ],
        grammarPattern: "'-자' — неформальное окончание предложения, означающее 'давай ___', здесь использовано в '만나자' (давай встретимся).",
        strategy: "Не предполагайте распространённое место вроде 'кафе' только потому, что контекст непринуждённый — всегда проверяйте точное место, названное в записи.",
      },
    },
    kz: {
      prompt: "Екеуі кафеде кездесуге келісті.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"그럼 지하철역 앞에서 만나자" нақты кездесу орнын атайды.',
        keywords: "지하철역 앞에서, 만나자",
        whyCorrect: "Келісілген кездесу орны нақты аталған — '지하철역 앞' (метро станциясының алдында), кафе емес.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Кафе қоңырауда мүлдем аталмайды; кездесу орны ретінде тек метро станциясы аталған." },
        ],
        vocabulary: [
          { term: "지하철역", translation: "метро станциясы" },
          { term: "앞에서", translation: "алдында" },
        ],
        grammarPattern: "'-자' — бейресми ұсыныс жалғауы, '___ айық' дегенді білдіреді, мұнда '만나자' (кездесейік) түрінде қолданылған.",
        strategy: "Контекст еркін болғандықтан 'кафе' сияқты кең тараған орынды болжамаңыз — әрқашан жазбада аталған нақты орынды тексеріңіз.",
      },
    },
  },
};

const l2PhoneQ3: QuestionSpec = {
  id: "topik2-phone-plans-1-q3",
  recordingId: "topik2-phone-plans-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "speakerIntention",
  content: {
    en: {
      prompt: "What is the purpose of this phone call?",
      options: [
        { id: "opt-a", text: "To apologize" },
        { id: "opt-b", text: "To arrange having dinner together" },
        { id: "opt-c", text: "To ask for directions" },
        { id: "opt-d", text: "To turn down a request" },
      ],
      explanation: {
        whereInRecording: '"같이 저녁 먹을래?" is the caller\'s reason for calling, followed by agreeing on a time and place.',
        keywords: "같이 저녁 먹을래, 몇 시에 만날까",
        whyCorrect: "The whole call is organized around proposing dinner together and then settling the time and place — a classic 'arranging plans' purpose.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "No apology language ('미안해', '죄송해요') appears anywhere in the call." },
          { optionId: "opt-c", reason: "No directions are asked for — the location is agreed on, not searched for." },
          { optionId: "opt-d", reason: "The invitation is accepted with '좋아!', not refused." },
        ],
        vocabulary: [
          { term: "저녁 먹다", translation: "to eat dinner" },
          { term: "만날까", translation: "shall we meet?" },
        ],
        grammarPattern: "'-(으)ㄹ래?' is a casual way to ask 'do you want to ___?', used to make an invitation.",
        strategy: "To identify a call's purpose, listen for the very first proposal or request — everything after it is usually just settling the details.",
      },
    },
    ru: {
      prompt: "Какова цель этого телефонного разговора?",
      options: [
        { id: "opt-a", text: "Извиниться" },
        { id: "opt-b", text: "Договориться поужинать вместе" },
        { id: "opt-c", text: "Спросить дорогу" },
        { id: "opt-d", text: "Отклонить просьбу" },
      ],
      explanation: {
        whereInRecording: '"같이 저녁 먹을래?" — причина звонка, после которой согласуются время и место.',
        keywords: "같이 저녁 먹을래, 몇 시에 만날까",
        whyCorrect: "Весь разговор построен вокруг предложения поужинать вместе и последующего согласования времени и места — классическая цель 'договориться о планах'.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Слов извинения ('미안해', '죄송해요') нигде в разговоре нет." },
          { optionId: "opt-c", reason: "Дорогу никто не спрашивает — место согласуется, а не разыскивается." },
          { optionId: "opt-d", reason: "Приглашение принимается со словом '좋아!', а не отклоняется." },
        ],
        vocabulary: [
          { term: "저녁 먹다", translation: "ужинать" },
          { term: "만날까", translation: "встретимся?" },
        ],
        grammarPattern: "'-(으)ㄹ래?' — неформальный способ спросить 'хочешь ли ты ___?', используется для приглашения.",
        strategy: "Чтобы определить цель звонка, слушайте самое первое предложение или просьбу — всё, что после, обычно лишь уточнение деталей.",
      },
    },
    kz: {
      prompt: "Бұл телефон қоңырауының мақсаты қандай?",
      options: [
        { id: "opt-a", text: "Кешірім сұрау" },
        { id: "opt-b", text: "Бірге кешкі ас ішуге келісу" },
        { id: "opt-c", text: "Жол сұрау" },
        { id: "opt-d", text: "Өтінішті қабылдамау" },
      ],
      explanation: {
        whereInRecording: '"같이 저녁 먹을래?" — қоңырау шалу себебі, содан кейін уақыт пен орын келісіледі.',
        keywords: "같이 저녁 먹을래, 몇 시에 만날까",
        whyCorrect: "Бүкіл қоңырау бірге кешкі ас ұсынудан және содан кейін уақыт пен орынды келісуден тұрады — бұл 'жоспарды келісу' мақсатының классикалық мысалы.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Қоңырауда кешірім сөздері ('미안해', '죄송해요') мүлдем жоқ." },
          { optionId: "opt-c", reason: "Жол сұралмайды — орын іздестірілмей, келісіледі." },
          { optionId: "opt-d", reason: "Шақыру '좋아!' деп қабылданады, қабылданбайды." },
        ],
        vocabulary: [
          { term: "저녁 먹다", translation: "кешкі ас ішу" },
          { term: "만날까", translation: "кездесейік пе?" },
        ],
        grammarPattern: "'-(으)ㄹ래?' '___ қалайсың ба?' деп еркін сұрау тәсілі, шақыру жасау үшін қолданылады.",
        strategy: "Қоңыраудың мақсатын анықтау үшін ең бірінші ұсыныс немесе өтінішті тыңдаңыз — одан кейінгінің бәрі әдетте тек егжей-тегжейді келісу.",
      },
    },
  },
};

const l2WeatherQ1: QuestionSpec = {
  id: "topik2-weather-forecast-1-q1",
  recordingId: "topik2-weather-forecast-1",
  questionNumber: 1,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "easy",
  skillTag: "detail",
  content: {
    en: {
      prompt: "It will rain this morning.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"오늘 오전에는 맑겠고" describes clear skies for the morning, not rain.',
        keywords: "오전에는 맑겠고",
        whyCorrect: "The forecast says the morning will be clear ('맑겠고'), which contradicts rain.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Rain is only mentioned for tomorrow, nationwide — not for this morning." },
        ],
        vocabulary: [
          { term: "맑다", translation: "to be clear (weather)" },
          { term: "오전", translation: "morning (AM)" },
        ],
        grammarPattern: "'-겠-' expresses a forecast/prediction, e.g. '맑겠고' = 'it will be clear, and...'.",
        strategy: "Weather reports often contrast morning vs. afternoon vs. tomorrow — keep each time period separate in your notes so you don't mix them up.",
      },
    },
    ru: {
      prompt: "Сегодня утром будет дождь.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"오늘 오전에는 맑겠고" описывает ясное небо утром, а не дождь.',
        keywords: "오전에는 맑겠고",
        whyCorrect: "В прогнозе говорится, что утро будет ясным ('맑겠고'), что противоречит дождю.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Дождь упоминается только на завтра, по всей стране — не на сегодняшнее утро." },
        ],
        vocabulary: [
          { term: "맑다", translation: "быть ясным (о погоде)" },
          { term: "오전", translation: "утро (до полудня)" },
        ],
        grammarPattern: "'-겠-' выражает прогноз/предсказание, например '맑겠고' = 'будет ясно, и...'.",
        strategy: "В прогнозах погоды часто противопоставляются утро, день и завтра — держите каждый период отдельно в заметках, чтобы не перепутать.",
      },
    },
    kz: {
      prompt: "Бүгін таңертең жаңбыр жауады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"오늘 오전에는 맑겠고" таңертеңгі ашық аспапты сипаттайды, жаңбырды емес.',
        keywords: "오전에는 맑겠고",
        whyCorrect: "Болжамда таңертең ашық болады ('맑겠고') делінген, бұл жаңбырға қайшы.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Жаңбыр тек ертеңге, бүкіл елге қатысты аталған — бүгінгі таңертеңге емес." },
        ],
        vocabulary: [
          { term: "맑다", translation: "ашық болу (ауа райы)" },
          { term: "오전", translation: "таңертең (түске дейін)" },
        ],
        grammarPattern: "'-겠-' болжам/күтуді білдіреді, мысалы '맑겠고' = 'ашық болады, және...'.",
        strategy: "Ауа райы болжамдарында көбіне таңертең, түстен кейін және ертеңгі күн салыстырылады — шатастырмау үшін әр кезеңді жеке жазып алыңыз.",
      },
    },
  },
};

const l2WeatherQ2: QuestionSpec = {
  id: "topik2-weather-forecast-1-q2",
  recordingId: "topik2-weather-forecast-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "medium",
  skillTag: "inference",
  content: {
    en: {
      prompt: "What should people prepare for the evening?",
      options: [
        { id: "opt-a", text: "An umbrella" },
        { id: "opt-b", text: "Sunglasses" },
        { id: "opt-c", text: "Warm clothes" },
        { id: "opt-d", text: "A hat" },
      ],
      explanation: {
        whereInRecording: '"저녁에는 바람이 강하게 불겠으니 우산보다는 두꺼운 옷을 준비하시기 바랍니다" gives the direct recommendation.',
        keywords: "두꺼운 옷을 준비하시기 바랍니다",
        whyCorrect: "The forecaster explicitly recommends warm/thick clothes ('두꺼운 옷') over an umbrella because of strong evening wind.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "An umbrella is mentioned only to say it's LESS needed than warm clothes — it's not the recommendation." },
          { optionId: "opt-b", reason: "Sunglasses are never mentioned in the forecast." },
          { optionId: "opt-d", reason: "A hat is never mentioned in the forecast." },
        ],
        vocabulary: [
          { term: "두껍다", translation: "to be thick" },
          { term: "준비하다", translation: "to prepare" },
        ],
        grammarPattern: "'-(으)니' connects a reason to a result: '바람이 불겠으니' = 'since it will be windy, ...'.",
        strategy: "Watch for comparison words like '보다는' ('rather than') — they signal the recommendation is the second item mentioned, not the first.",
      },
    },
    ru: {
      prompt: "Что нужно подготовить на вечер?",
      options: [
        { id: "opt-a", text: "Зонт" },
        { id: "opt-b", text: "Солнцезащитные очки" },
        { id: "opt-c", text: "Тёплую одежду" },
        { id: "opt-d", text: "Шапку" },
      ],
      explanation: {
        whereInRecording: '"저녁에는 바람이 강하게 불겠으니 우산보다는 두꺼운 옷을 준비하시기 바랍니다" даёт прямую рекомендацию.',
        keywords: "두꺼운 옷을 준비하시기 바랍니다",
        whyCorrect: "Синоптик прямо рекомендует тёплую/плотную одежду ('두꺼운 옷') вместо зонта из-за сильного вечернего ветра.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Зонт упоминается только для того, чтобы сказать, что он МЕНЕЕ нужен, чем тёплая одежда — это не рекомендация." },
          { optionId: "opt-b", reason: "Солнцезащитные очки нигде не упоминаются в прогнозе." },
          { optionId: "opt-d", reason: "Шапка нигде не упоминается в прогнозе." },
        ],
        vocabulary: [
          { term: "두껍다", translation: "быть плотным/толстым" },
          { term: "준비하다", translation: "готовить(ся)" },
        ],
        grammarPattern: "'-(으)니' связывает причину и результат: '바람이 불겠으니' = 'поскольку будет ветрено, ...'.",
        strategy: "Обращайте внимание на слова сравнения вроде '보다는' ('вместо, чем') — они указывают, что рекомендация — это второй упомянутый пункт, а не первый.",
      },
    },
    kz: {
      prompt: "Кешке не дайындау керек?",
      options: [
        { id: "opt-a", text: "Қолшатыр" },
        { id: "opt-b", text: "Күн көзілдірігі" },
        { id: "opt-c", text: "Жылы киім" },
        { id: "opt-d", text: "Бас киім" },
      ],
      explanation: {
        whereInRecording: '"저녁에는 바람이 강하게 불겠으니 우산보다는 두꺼운 옷을 준비하시기 바랍니다" тікелей ұсыныс береді.',
        keywords: "두꺼운 옷을 준비하시기 바랍니다",
        whyCorrect: "Метеоролог кешкі күшті желге байланысты қолшатыр орнына жылы/қалың киім ('두꺼운 옷') киюді тікелей ұсынады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Қолшатыр тек жылы киімнен АЗ қажет екенін айту үшін аталады — бұл ұсыныс емес." },
          { optionId: "opt-b", reason: "Күн көзілдірігі болжамда мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Бас киім болжамда мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "두껍다", translation: "қалың болу" },
          { term: "준비하다", translation: "дайындау" },
        ],
        grammarPattern: "'-(으)니' себеп пен нәтижені байланыстырады: '바람이 불겠으니' = 'жел соғатын болғандықтан, ...'.",
        strategy: "'보다는' ('қарағанда') сияқты салыстыру сөздеріне назар аударыңыз — олар ұсыныстың бірінші емес, екінші аталған зат екенін көрсетеді.",
      },
    },
  },
};

const l2WeatherQ3: QuestionSpec = {
  id: "topik2-weather-forecast-1-q3",
  recordingId: "topik2-weather-forecast-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-c"],
  difficulty: "easy",
  skillTag: "numberDateLocation",
  content: {
    en: {
      prompt: "What is tomorrow's weather like?",
      options: [
        { id: "opt-a", text: "Clear" },
        { id: "opt-b", text: "Snow" },
        { id: "opt-c", text: "Rain" },
        { id: "opt-d", text: "Wind" },
      ],
      explanation: {
        whereInRecording: '"내일은 전국에 비가 오겠습니다" is the final sentence of the forecast.',
        keywords: "내일은, 비가 오겠습니다",
        whyCorrect: "The forecast closes by stating rain ('비가 오겠습니다') nationwide for tomorrow.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Clear weather is described for this morning, not tomorrow." },
          { optionId: "opt-b", reason: "Snow is never mentioned anywhere in the forecast." },
          { optionId: "opt-d", reason: "Strong wind is described for this evening, not tomorrow." },
        ],
        vocabulary: [
          { term: "전국", translation: "the whole country, nationwide" },
          { term: "비가 오다", translation: "to rain" },
        ],
        grammarPattern: "'-겠습니다' is the formal predictive ending used throughout this broadcast-style forecast.",
        strategy: "The last sentence of a weather report is often about a different day (tomorrow) — don't let today's details bleed into your answer for tomorrow's question.",
      },
    },
    ru: {
      prompt: "Какая погода ожидается завтра?",
      options: [
        { id: "opt-a", text: "Ясно" },
        { id: "opt-b", text: "Снег" },
        { id: "opt-c", text: "Дождь" },
        { id: "opt-d", text: "Ветер" },
      ],
      explanation: {
        whereInRecording: '"내일은 전국에 비가 오겠습니다" — заключительное предложение прогноза.',
        keywords: "내일은, 비가 오겠습니다",
        whyCorrect: "Прогноз завершается сообщением о дожде ('비가 오겠습니다') по всей стране на завтра.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Ясная погода описана для сегодняшнего утра, а не для завтра." },
          { optionId: "opt-b", reason: "Снег нигде не упоминается в прогнозе." },
          { optionId: "opt-d", reason: "Сильный ветер описан для сегодняшнего вечера, а не для завтра." },
        ],
        vocabulary: [
          { term: "전국", translation: "вся страна, по всей стране" },
          { term: "비가 오다", translation: "идти (о дожде)" },
        ],
        grammarPattern: "'-겠습니다' — формальное окончание предсказания, используемое во всём этом прогнозе в стиле теле/радиовещания.",
        strategy: "Последнее предложение прогноза погоды часто относится к другому дню (завтра) — не путайте сегодняшние детали с ответом на вопрос о завтрашнем дне.",
      },
    },
    kz: {
      prompt: "Ертеңгі ауа райы қандай болады?",
      options: [
        { id: "opt-a", text: "Ашық" },
        { id: "opt-b", text: "Қар" },
        { id: "opt-c", text: "Жаңбыр" },
        { id: "opt-d", text: "Жел" },
      ],
      explanation: {
        whereInRecording: '"내일은 전국에 비가 오겠습니다" — болжамның соңғы сөйлемі.',
        keywords: "내일은, 비가 오겠습니다",
        whyCorrect: "Болжам ертеңге бүкіл елде жаңбыр ('비가 오겠습니다') болатынын хабарлаумен аяқталады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Ашық ауа райы бүгінгі таңертеңге қатысты сипатталған, ертеңге емес." },
          { optionId: "opt-b", reason: "Қар болжамда мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Күшті жел бүгінгі кешке қатысты сипатталған, ертеңге емес." },
        ],
        vocabulary: [
          { term: "전국", translation: "бүкіл ел бойынша" },
          { term: "비가 오다", translation: "жаңбыр жауу" },
        ],
        grammarPattern: "'-겠습니다' — осы хабар стиліндегі болжамда қолданылатын ресми болжам жалғауы.",
        strategy: "Ауа райы болжамының соңғы сөйлемі көбіне басқа күнге (ертеңге) қатысты болады — бүгінгі детальдарды ертеңгі сұрақтың жауабына араластырмаңыз.",
      },
    },
  },
};

const L2_PHONE_PLANS_QUESTIONS = buildRecordingQuestions(l2PhoneQ1, l2PhoneQ2, l2PhoneQ3);
const L2_WEATHER_FORECAST_QUESTIONS = buildRecordingQuestions(l2WeatherQ1, l2WeatherQ2, l2WeatherQ3);

// ---------------------------------------------------------------------------
// Level 3 — 중급: hobby interview, library announcement. Connected reasoning,
// past experience, polite formal register.
// ---------------------------------------------------------------------------

const L3_HOBBY_INTERVIEW: TopikListeningRecording = {
  id: "topik3-hobby-interview-1",
  partLabel: "Recording 1",
  topic: "Interview about a new hobby",
  transcript:
    "진행자: 요즘 어떤 취미를 즐기세요? 게스트: 저는 요즘 등산을 시작했어요. 주말마다 산에 가요. 진행자: 등산을 시작한 이유가 있나요? 게스트: 네, 작년에 건강 검진을 받았는데 운동이 부족하다는 말을 들었어요. 그래서 등산을 시작했는데, 생각보다 훨씬 재미있더라고요. 스트레스도 풀리고요. 진행자: 앞으로 계획이 있으신가요? 게스트: 네, 다음 달에는 더 높은 산에 도전해 보려고 해요.",
  estimatedDurationSeconds: 34,
};

const L3_LIBRARY_NOTICE: TopikListeningRecording = {
  id: "topik3-library-notice-1",
  partLabel: "Recording 2",
  topic: "Library facility inspection notice",
  transcript:
    "도서관을 이용하시는 여러분께 알려 드립니다. 다음 주 월요일부터 금요일까지 도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다. 대출과 반납은 정문 옆 임시 창구에서 가능합니다. 불편을 드려 죄송하며, 점검이 끝나는 대로 다시 안내해 드리겠습니다.",
  estimatedDurationSeconds: 26,
};

const l3HobbyQ1: QuestionSpec = {
  id: "topik3-hobby-interview-1-q1",
  recordingId: "topik3-hobby-interview-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is this interview mainly about?",
      options: [
        { id: "opt-a", text: "The results of a health checkup" },
        { id: "opt-b", text: "The guest's new hobby" },
        { id: "opt-c", text: "Buying hiking equipment" },
        { id: "opt-d", text: "Travel plans for next month" },
      ],
      explanation: {
        whereInRecording: "The whole exchange centers on '요즘 어떤 취미를 즐기세요?' and the guest's answer about starting hiking.",
        keywords: "취미, 등산을 시작했어요",
        whyCorrect: "The host opens by asking about a hobby, and every following turn expands on the guest's new hiking hobby — the health checkup and next month's plan are supporting details, not the main topic.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The checkup is mentioned only as the reason hiking started — it's a supporting detail, not the interview's main subject." },
          { optionId: "opt-c", reason: "Hiking equipment is never discussed in the interview." },
          { optionId: "opt-d", reason: "Next month's plan is a single closing detail, not the overall topic of the whole conversation." },
        ],
        vocabulary: [
          { term: "취미", translation: "hobby" },
          { term: "등산", translation: "hiking, mountain climbing" },
        ],
        grammarPattern: "'-더라고요' reports a personal realization/discovery, as in '재미있더라고요' = 'it turned out to be fun (I discovered)'.",
        strategy: "The host's opening question usually names the interview's main topic directly — answer main-idea questions using that opening line as your anchor.",
      },
    },
    ru: {
      prompt: "О чём в основном это интервью?",
      options: [
        { id: "opt-a", text: "О результатах медосмотра" },
        { id: "opt-b", text: "О новом увлечении гостя" },
        { id: "opt-c", text: "О покупке туристического снаряжения" },
        { id: "opt-d", text: "О планах поездки в следующем месяце" },
      ],
      explanation: {
        whereInRecording: "Весь разговор строится вокруг вопроса '요즘 어떤 취미를 즐기세요?' и ответа гостя о начале занятий пешим туризмом.",
        keywords: "취미, 등산을 시작했어요",
        whyCorrect: "Ведущий сразу спрашивает об увлечении, и каждая следующая реплика раскрывает новое увлечение гостя — медосмотр и план на следующий месяц лишь дополнительные детали, а не главная тема.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Медосмотр упомянут только как причина начала походов — это второстепенная деталь, а не главная тема интервью." },
          { optionId: "opt-c", reason: "Туристическое снаряжение в интервью вообще не обсуждается." },
          { optionId: "opt-d", reason: "План на следующий месяц — лишь одна заключительная деталь, а не тема всего разговора." },
        ],
        vocabulary: [
          { term: "취미", translation: "увлечение, хобби" },
          { term: "등산", translation: "поход в горы, треккинг" },
        ],
        grammarPattern: "'-더라고요' передаёт личное открытие/осознание, как в '재미있더라고요' = 'оказалось интересно (я обнаружил)'.",
        strategy: "Вступительный вопрос ведущего обычно прямо называет главную тему интервью — отвечая на вопрос об основной идее, опирайтесь именно на эту фразу.",
      },
    },
    kz: {
      prompt: "Бұл сұхбат негізінен не туралы?",
      options: [
        { id: "opt-a", text: "Денсаулық тексерісінің нәтижелері туралы" },
        { id: "opt-b", text: "Қонақтың жаңа хоббиі туралы" },
        { id: "opt-c", text: "Туристік жабдық сатып алу туралы" },
        { id: "opt-d", text: "Келесі айдағы саяхат жоспарлары туралы" },
      ],
      explanation: {
        whereInRecording: "Бүкіл сөйлесу '요즘 어떤 취미를 즐기세요?' сұрағы мен қонақтың тау серуенін бастау туралы жауабы төңірегінде өрбиді.",
        keywords: "취미, 등산을 시작했어요",
        whyCorrect: "Жүргізуші бірден хобби туралы сұрайды, ал әрбір келесі кезек қонақтың жаңа тау серуені хоббиін ашады — денсаулық тексерісі мен келесі айдағы жоспар қосымша детальдер, негізгі тақырып емес.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Денсаулық тексерісі тек тау серуенін бастау себебі ретінде аталады — бұл сұхбаттың негізгі тақырыбы емес, қосымша детал." },
          { optionId: "opt-c", reason: "Туристік жабдық сұхбатта мүлдем талқыланбайды." },
          { optionId: "opt-d", reason: "Келесі айдағы жоспар — тек бір қорытынды детал, бүкіл сөйлесудің тақырыбы емес." },
        ],
        vocabulary: [
          { term: "취미", translation: "хобби" },
          { term: "등산", translation: "тауға шығу, серуендеу" },
        ],
        grammarPattern: "'-더라고요' жеке байқауды/түсінуді жеткізеді, мысалы '재미있더라고요' = 'қызықты болып шықты (мен байқадым)'.",
        strategy: "Жүргізушінің бастапқы сұрағы әдетте сұхбаттың негізгі тақырыбын тікелей атайды — негізгі ой сұрақтарына осы бастапқы сөйлемге сүйеніп жауап беріңіз.",
      },
    },
  },
};

const l3HobbyQ2: QuestionSpec = {
  id: "topik3-hobby-interview-1-q2",
  recordingId: "topik3-hobby-interview-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Why did the guest start hiking?",
      options: [
        { id: "opt-a", text: "A friend recommended it" },
        { id: "opt-b", text: "A health checkup showed a lack of exercise" },
        { id: "opt-c", text: "They joined a company club" },
        { id: "opt-d", text: "To visit a relative who lives on a mountain" },
      ],
      explanation: {
        whereInRecording: '"작년에 건강 검진을 받았는데 운동이 부족하다는 말을 들었어요. 그래서 등산을 시작했는데" directly links the checkup to starting hiking.',
        keywords: "건강 검진, 운동이 부족하다, 그래서",
        whyCorrect: "The guest explains the checkup revealed insufficient exercise, and '그래서' (so/therefore) directly connects that finding to starting hiking.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "No friend or recommendation is mentioned anywhere in the interview." },
          { optionId: "opt-c", reason: "No company club is mentioned in the interview." },
          { optionId: "opt-d", reason: "No relative living on a mountain is mentioned in the interview." },
        ],
        vocabulary: [
          { term: "건강 검진", translation: "health checkup" },
          { term: "부족하다", translation: "to be insufficient/lacking" },
        ],
        grammarPattern: "'그래서' explicitly marks cause and effect between two clauses — a strong signal for 'why' questions.",
        strategy: "For 'why' questions, listen specifically for connector words like '그래서', '왜냐하면', or '-어서/아서' that link a cause to its result.",
      },
    },
    ru: {
      prompt: "Почему гость начал заниматься пешим туризмом?",
      options: [
        { id: "opt-a", text: "Это порекомендовал друг" },
        { id: "opt-b", text: "Медосмотр показал недостаток физической активности" },
        { id: "opt-c", text: "Он вступил в корпоративный клуб" },
        { id: "opt-d", text: "Чтобы навестить родственника, живущего в горах" },
      ],
      explanation: {
        whereInRecording: '"작년에 건강 검진을 받았는데 운동이 부족하다는 말을 들었어요. 그래서 등산을 시작했는데" напрямую связывает медосмотр с началом походов.',
        keywords: "건강 검진, 운동이 부족하다, 그래서",
        whyCorrect: "Гость объясняет, что медосмотр показал недостаток физической активности, и '그래서' (поэтому) прямо связывает это открытие с началом занятий походами.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "О друге или рекомендации нигде в интервью не упоминается." },
          { optionId: "opt-c", reason: "О корпоративном клубе в интервью не упоминается." },
          { optionId: "opt-d", reason: "О родственнике, живущем в горах, в интервью не упоминается." },
        ],
        vocabulary: [
          { term: "건강 검진", translation: "медицинский осмотр" },
          { term: "부족하다", translation: "быть недостаточным" },
        ],
        grammarPattern: "'그래서' явно обозначает причинно-следственную связь между двумя частями — сильный сигнал для вопросов 'почему'.",
        strategy: "Для вопросов 'почему' специально слушайте связующие слова вроде '그래서', '왜냐하면' или '-어서/아서', которые связывают причину с результатом.",
      },
    },
    kz: {
      prompt: "Қонақ неге тау серуенін бастады?",
      options: [
        { id: "opt-a", text: "Досы ұсынған" },
        { id: "opt-b", text: "Денсаулық тексерісі жаттығудың жетіспейтінін көрсеткен" },
        { id: "opt-c", text: "Компания клубына кірген" },
        { id: "opt-d", text: "Таста тұратын туысын көру үшін" },
      ],
      explanation: {
        whereInRecording: '"작년에 건강 검진을 받았는데 운동이 부족하다는 말을 들었어요. 그래서 등산을 시작했는데" денсаулық тексерісін тау серуенін бастаумен тікелей байланыстырады.',
        keywords: "건강 검진, 운동이 부족하다, 그래서",
        whyCorrect: "Қонақ тексеру жаттығудың жеткіліксіздігін көрсеткенін түсіндіреді, ал '그래서' (сондықтан) осы фактіні тау серуенін бастаумен тікелей байланыстырады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Дос немесе ұсыныс сұхбатта мүлдем аталмайды." },
          { optionId: "opt-c", reason: "Компания клубы сұхбатта аталмайды." },
          { optionId: "opt-d", reason: "Таста тұратын туыс сұхбатта аталмайды." },
        ],
        vocabulary: [
          { term: "건강 검진", translation: "денсаулық тексерісі" },
          { term: "부족하다", translation: "жеткіліксіз болу" },
        ],
        grammarPattern: "'그래서' екі сөйлем арасындағы себеп-салдар байланысын нақты көрсетеді — 'неге' сұрақтары үшін күшті белгі.",
        strategy: "'Неге' сұрақтары үшін себепті нәтижемен байланыстыратын '그래서', '왜냐하면' немесе '-어서/아서' сияқты жалғаушы сөздерді арнайы тыңдаңыз.",
      },
    },
  },
};

const l3HobbyQ3: QuestionSpec = {
  id: "topik3-hobby-interview-1-q3",
  recordingId: "topik3-hobby-interview-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "inference",
  content: {
    en: {
      prompt: "The guest plans to stop hiking next month.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"다음 달에는 더 높은 산에 도전해 보려고 해요" is the guest\'s stated plan.',
        keywords: "다음 달에는, 도전해 보려고 해요",
        whyCorrect: "The guest says they plan to challenge an even higher mountain next month — the opposite of stopping, showing continued commitment to the hobby.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Nothing in the interview suggests quitting; the guest's plan is explicitly to continue and go further, not stop." },
        ],
        vocabulary: [
          { term: "도전하다", translation: "to challenge oneself, to take on" },
          { term: "다음 달", translation: "next month" },
        ],
        grammarPattern: "'-아/어 보려고 하다' expresses an intention to try doing something, e.g. '도전해 보려고 해요' = 'I'm planning to try challenging (it)'.",
        strategy: "When a closing question asks about 'future plans', the answer is usually the guest's very last sentence — check it carefully instead of assuming based on earlier tone.",
      },
    },
    ru: {
      prompt: "Гость планирует прекратить заниматься пешим туризмом в следующем месяце.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"다음 달에는 더 높은 산에 도전해 보려고 해요" — это заявленный план гостя.',
        keywords: "다음 달에는, 도전해 보려고 해요",
        whyCorrect: "Гость говорит, что планирует в следующем месяце покорить ещё более высокую гору — это противоположно прекращению, показывает продолжающуюся приверженность увлечению.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Ничто в интервью не указывает на прекращение; план гостя явно состоит в продолжении и движении дальше, а не в остановке." },
        ],
        vocabulary: [
          { term: "도전하다", translation: "бросать вызов себе, пробовать" },
          { term: "다음 달", translation: "следующий месяц" },
        ],
        grammarPattern: "'-아/어 보려고 하다' выражает намерение попробовать что-то сделать, например '도전해 보려고 해요' = 'я планирую попробовать (это)'.",
        strategy: "Когда заключительный вопрос спрашивает о 'планах на будущее', ответ обычно содержится в самом последнем предложении гостя — проверяйте его внимательно, а не полагайтесь на общий тон ранее.",
      },
    },
    kz: {
      prompt: "Қонақ келесі айда тау серуенін тоқтатуды жоспарлайды.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"다음 달에는 더 높은 산에 도전해 보려고 해요" — қонақтың айтқан жоспары.',
        keywords: "다음 달에는, 도전해 보려고 해요",
        whyCorrect: "Қонақ келесі айда одан да биік тауға шығуды жоспарлайтынын айтады — бұл тоқтатуға қарама-қарсы, хоббиге деген жалғасып жатқан құштарлықты көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Сұхбатта тоқтату туралы ешнәрсе жоқ; қонақтың жоспары тоқтату емес, жалғастыру және алға жылжу болып тікелей айтылған." },
        ],
        vocabulary: [
          { term: "도전하다", translation: "өзіне сын тастау, талпыну" },
          { term: "다음 달", translation: "келесі ай" },
        ],
        grammarPattern: "'-아/어 보려고 하다' бір нәрсені байқап көру ниетін білдіреді, мысалы '도전해 보려고 해요' = 'мен байқап көруді жоспарлаймын'.",
        strategy: "Қорытынды сұрақ 'болашақ жоспарлар' туралы сұраса, жауап әдетте қонақтың ең соңғы сөйлемінде болады — бұрынғы дауыс ырғағына сүйенбей, оны мұқият тексеріңіз.",
      },
    },
  },
};

const l3LibraryQ1: QuestionSpec = {
  id: "topik3-library-notice-1-q1",
  recordingId: "topik3-library-notice-1",
  questionNumber: 1,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "The reading room will be unavailable for the entire next week (Monday to Friday).",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"다음 주 월요일부터 금요일까지 도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다" states the exact date range.',
        keywords: "월요일부터 금요일까지, 이용하실 수 없습니다",
        whyCorrect: "The notice explicitly closes the reading room from Monday through Friday of next week — the full workweek.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "This contradicts the explicit '월요일부터 금요일까지' (Monday through Friday) date range given in the notice." },
        ],
        vocabulary: [
          { term: "열람실", translation: "reading room" },
          { term: "시설 점검", translation: "facility inspection" },
        ],
        grammarPattern: "'-부터 -까지' marks a range 'from ___ to ___', here applied to a span of days.",
        strategy: "For date-range questions, note both the start word ('부터') and end word ('까지') — missing either one leads to an incomplete answer.",
      },
    },
    ru: {
      prompt: "Читальный зал будет недоступен всю следующую неделю (с понедельника по пятницу).",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"다음 주 월요일부터 금요일까지 도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다" указывает точный период.',
        keywords: "월요일부터 금요일까지, 이용하실 수 없습니다",
        whyCorrect: "В объявлении читальный зал прямо закрыт с понедельника по пятницу следующей недели — на всю рабочую неделю.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "Это противоречит явно указанному в объявлении периоду '월요일부터 금요일까지' (с понедельника по пятницу)." },
        ],
        vocabulary: [
          { term: "열람실", translation: "читальный зал" },
          { term: "시설 점검", translation: "проверка оборудования" },
        ],
        grammarPattern: "'-부터 -까지' обозначает диапазон 'с ___ по ___', здесь применён к периоду дней.",
        strategy: "Для вопросов о диапазоне дат отмечайте и начальное слово ('부터'), и конечное ('까지') — пропуск любого из них даёт неполный ответ.",
      },
    },
    kz: {
      prompt: "Оқу залы келесі аптаның бүкіл бойында (дүйсенбіден жұмаға дейін) жабық болады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"다음 주 월요일부터 금요일까지 도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다" нақты мерзімді көрсетеді.',
        keywords: "월요일부터 금요일까지, 이용하실 수 없습니다",
        whyCorrect: "Хабарландыруда оқу залы келесі аптаның дүйсенбісінен жұмасына дейін жабылатыны тікелей айтылған — бүкіл жұмыс аптасы бойы.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "Бұл хабарландырудағы нақты '월요일부터 금요일까지' (дүйсенбіден жұмаға дейін) мерзіміне қайшы келеді." },
        ],
        vocabulary: [
          { term: "열람실", translation: "оқу залы" },
          { term: "시설 점검", translation: "жабдықты тексеру" },
        ],
        grammarPattern: "'-부터 -까지' '___ бастап ___ дейін' аралығын білдіреді, мұнда күндер аралығына қолданылған.",
        strategy: "Мерзім аралығы туралы сұрақтарда бастау сөзін ('부터') де, аяқтау сөзін ('까지') де белгілеңіз — біреуін жіберіп алу толық емес жауапқа әкеледі.",
      },
    },
  },
};

const l3LibraryQ2: QuestionSpec = {
  id: "topik3-library-notice-1-q2",
  recordingId: "topik3-library-notice-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "easy",
  skillTag: "numberDateLocation",
  content: {
    en: {
      prompt: "Where can books be borrowed and returned during the inspection?",
      options: [
        { id: "opt-a", text: "In the reading room" },
        { id: "opt-b", text: "At the temporary desk beside the main entrance" },
        { id: "opt-c", text: "In the second-floor office" },
        { id: "opt-d", text: "Only online" },
      ],
      explanation: {
        whereInRecording: '"대출과 반납은 정문 옆 임시 창구에서 가능합니다" gives the exact location.',
        keywords: "정문 옆, 임시 창구",
        whyCorrect: "The notice states borrowing/returning happens at the '정문 옆 임시 창구' (temporary desk beside the main entrance) during the closure.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The reading room is exactly what is unavailable during this period — the opposite of the correct answer." },
          { optionId: "opt-c", reason: "A second-floor office is never mentioned in the notice." },
          { optionId: "opt-d", reason: "Online-only service is never mentioned; a physical temporary desk is named instead." },
        ],
        vocabulary: [
          { term: "정문", translation: "main entrance/gate" },
          { term: "임시", translation: "temporary" },
        ],
        grammarPattern: "'-에서 가능하다' means '___ is possible at ___', naming where an action can be carried out.",
        strategy: "Announcements about closures almost always pair the closed location with an alternate location — listen for the second location named right after the closure is mentioned.",
      },
    },
    ru: {
      prompt: "Где можно брать и сдавать книги во время проверки?",
      options: [
        { id: "opt-a", text: "В читальном зале" },
        { id: "opt-b", text: "У временной стойки рядом с главным входом" },
        { id: "opt-c", text: "В офисе на втором этаже" },
        { id: "opt-d", text: "Только онлайн" },
      ],
      explanation: {
        whereInRecording: '"대출과 반납은 정문 옆 임시 창구에서 가능합니다" указывает точное место.',
        keywords: "정문 옆, 임시 창구",
        whyCorrect: "В объявлении сказано, что выдача/возврат происходит у '정문 옆 임시 창구' (временной стойки рядом с главным входом) во время закрытия.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Читальный зал — как раз то, что недоступно в этот период — это противоположность правильному ответу." },
          { optionId: "opt-c", reason: "Офис на втором этаже нигде не упоминается в объявлении." },
          { optionId: "opt-d", reason: "Услуга только онлайн нигде не упоминается; вместо этого названа физическая временная стойка." },
        ],
        vocabulary: [
          { term: "정문", translation: "главный вход/ворота" },
          { term: "임시", translation: "временный" },
        ],
        grammarPattern: "'-에서 가능하다' означает '___ возможно в ___', указывая, где можно выполнить действие.",
        strategy: "Объявления о закрытии почти всегда сопровождаются альтернативным местом — слушайте второе место, названное сразу после упоминания закрытия.",
      },
    },
    kz: {
      prompt: "Тексеру кезінде кітаптарды қайдан алуға және қайтаруға болады?",
      options: [
        { id: "opt-a", text: "Оқу залында" },
        { id: "opt-b", text: "Негізгі кіреберістің жанындағы уақытша үстелде" },
        { id: "opt-c", text: "Екінші қабаттағы кеңседе" },
        { id: "opt-d", text: "Тек онлайн арқылы" },
      ],
      explanation: {
        whereInRecording: '"대출과 반납은 정문 옆 임시 창구에서 가능합니다" нақты орынды көрсетеді.',
        keywords: "정문 옆, 임시 창구",
        whyCorrect: "Хабарландыруда жабу кезінде алу/қайтару '정문 옆 임시 창구' (негізгі кіреберістің жанындағы уақытша үстел) арқылы жүзеге асатыны айтылған.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Оқу залы дәл осы кезеңде жабық болады — бұл дұрыс жауапқа қарама-қарсы." },
          { optionId: "opt-c", reason: "Екінші қабаттағы кеңсе хабарландыруда мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Тек онлайн қызмет мүлдем аталмайды; оның орнына нақты уақытша үстел аталған." },
        ],
        vocabulary: [
          { term: "정문", translation: "негізгі кіреберіс" },
          { term: "임시", translation: "уақытша" },
        ],
        grammarPattern: "'-에서 가능하다' '___ жерде ___ мүмкін' дегенді білдіреді, әрекетті орындауға болатын орынды атайды.",
        strategy: "Жабу туралы хабарландырулар әрдайым дерлік балама орынмен қатар келеді — жабу аталғаннан кейін бірден аталатын екінші орынды тыңдаңыз.",
      },
    },
  },
};

const l3LibraryQ3: QuestionSpec = {
  id: "topik3-library-notice-1-q3",
  recordingId: "topik3-library-notice-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-c"],
  difficulty: "hard",
  skillTag: "statementMatch",
  content: {
    en: {
      prompt: "Select every statement that matches the announcement.",
      options: [
        { id: "opt-a", text: "The reading room is closed because of facility inspection." },
        { id: "opt-b", text: "The inspection lasts for a whole month." },
        { id: "opt-c", text: "Borrowing is possible at the temporary desk." },
        { id: "opt-d", text: "There will be no further notice once the inspection ends." },
      ],
      explanation: {
        whereInRecording: '"도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다" and "대출과 반납은 정문 옆 임시 창구에서 가능합니다" confirm both true statements.',
        keywords: "시설 점검으로 인해, 임시 창구에서 가능합니다",
        whyCorrect: "The reason for closure (facility inspection) and the alternate borrowing location are both stated directly, matching options a and c exactly.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The notice gives a one-week range (Monday-Friday), not a month — this overstates the actual duration." },
          { optionId: "opt-d", reason: "The notice ends by promising a follow-up ('점검이 끝나는 대로 다시 안내해 드리겠습니다') — the opposite of 'no further notice'." },
        ],
        vocabulary: [
          { term: "대출", translation: "borrowing (a book)" },
          { term: "반납", translation: "returning (a book)" },
        ],
        grammarPattern: "'-(으)로 인해' means 'due to/because of ___', introducing a formal cause, common in official announcements.",
        strategy: "In formal announcements, check the ending sentence carefully — it often adds a promise or follow-up detail that a trap option contradicts.",
      },
    },
    ru: {
      prompt: "Выберите все утверждения, которые соответствуют объявлению.",
      options: [
        { id: "opt-a", text: "Читальный зал закрыт из-за проверки оборудования." },
        { id: "opt-b", text: "Проверка длится целый месяц." },
        { id: "opt-c", text: "Выдача книг возможна у временной стойки." },
        { id: "opt-d", text: "После окончания проверки дальнейших объявлений не будет." },
      ],
      explanation: {
        whereInRecording: '"도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다" и "대출과 반납은 정문 옆 임시 창구에서 가능합니다" подтверждают оба верных утверждения.',
        keywords: "시설 점검으로 인해, 임시 창구에서 가능합니다",
        whyCorrect: "Причина закрытия (проверка оборудования) и альтернативное место выдачи книг прямо названы, точно соответствуя вариантам a и c.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "В объявлении указан период в одну неделю (понедельник-пятница), а не месяц — это преувеличивает реальную продолжительность." },
          { optionId: "opt-d", reason: "Объявление заканчивается обещанием дальнейшего уведомления ('점검이 끝나는 대로 다시 안내해 드리겠습니다') — это противоположно 'без дальнейших объявлений'." },
        ],
        vocabulary: [
          { term: "대출", translation: "выдача (книги)" },
          { term: "반납", translation: "возврат (книги)" },
        ],
        grammarPattern: "'-(으)로 인해' означает 'из-за/вследствие ___', вводит формальную причину, часто встречается в официальных объявлениях.",
        strategy: "В официальных объявлениях внимательно проверяйте заключительное предложение — оно часто добавляет обещание или дополнительную деталь, которой противоречит вариант-ловушка.",
      },
    },
    kz: {
      prompt: "Хабарландыруға сәйкес келетін барлық мәлімдемені таңдаңыз.",
      options: [
        { id: "opt-a", text: "Оқу залы жабдықты тексеруге байланысты жабық." },
        { id: "opt-b", text: "Тексеру бір ай бойы жалғасады." },
        { id: "opt-c", text: "Кітап алу уақытша үстелде мүмкін." },
        { id: "opt-d", text: "Тексеру аяқталғаннан кейін қосымша хабарландыру болмайды." },
      ],
      explanation: {
        whereInRecording: '"도서관 시설 점검으로 인해 열람실을 이용하실 수 없습니다" және "대출과 반납은 정문 옆 임시 창구에서 가능합니다" екі дұрыс мәлімдемені де растайды.',
        keywords: "시설 점검으로 인해, 임시 창구에서 가능합니다",
        whyCorrect: "Жабу себебі (жабдықты тексеру) және балама алу орны тікелей айтылған, a және c нұсқаларына дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Хабарландыруда бір ай емес, бір апталық мерзім (дүйсенбі-жұма) көрсетілген — бұл нақты ұзақтықты асыра көрсетеді." },
          { optionId: "opt-d", reason: "Хабарландыру кейінгі хабарлама уәдесімен аяқталады ('점검이 끝나는 대로 다시 안내해 드리겠습니다') — бұл 'қосымша хабарландыру болмайды' дегенге қарама-қарсы." },
        ],
        vocabulary: [
          { term: "대출", translation: "кітап алу" },
          { term: "반납", translation: "кітапты қайтару" },
        ],
        grammarPattern: "'-(으)로 인해' '___ салдарынан/себебінен' дегенді білдіреді, ресми хабарландыруларда жиі кездесетін себепті енгізеді.",
        strategy: "Ресми хабарландыруларда соңғы сөйлемді мұқият тексеріңіз — онда көбіне аңдау нұсқасына қайшы келетін уәде немесе қосымша детал болады.",
      },
    },
  },
};

const L3_HOBBY_INTERVIEW_QUESTIONS = buildRecordingQuestions(l3HobbyQ1, l3HobbyQ2, l3HobbyQ3);
const L3_LIBRARY_NOTICE_QUESTIONS = buildRecordingQuestions(l3LibraryQ1, l3LibraryQ2, l3LibraryQ3);

// ---------------------------------------------------------------------------
// Level 4 — 중고급: workplace meeting discussion, environment news report.
// Opposing viewpoints, formal register, abstract reasoning.
// ---------------------------------------------------------------------------

const L4_MEETING_DISCUSSION: TopikListeningRecording = {
  id: "topik4-meeting-discussion-1",
  partLabel: "Recording 1",
  topic: "Workplace meeting about a tight project schedule",
  transcript:
    "팀장: 이번 프로젝트 일정이 촉박한데, 다들 의견 좀 주시겠어요? 직원 A: 저는 인력을 추가하는 게 낫다고 생각합니다. 지금 인원으로는 마감을 맞추기 어려워요. 직원 B: 저는 생각이 다릅니다. 인력을 늘리면 오히려 의사소통 비용이 늘어날 수 있어요. 차라리 일부 기능을 다음 버전으로 미루는 게 어떨까요? 팀장: 두 분 의견 모두 일리가 있네요. 일단 어떤 기능을 미룰 수 있을지 검토해 보고, 그래도 부족하면 인력 충원을 고려합시다.",
  estimatedDurationSeconds: 40,
};

const L4_ENVIRONMENT_NEWS: TopikListeningRecording = {
  id: "topik4-environment-news-1",
  partLabel: "Recording 2",
  topic: "News report on fine dust and city measures",
  transcript:
    "뉴스입니다. 최근 도심 내 미세먼지 농도가 증가하면서 시민들의 우려가 커지고 있습니다. 시 당국은 노후 경유차의 운행을 제한하고 대중교통 이용을 장려하는 대책을 발표했습니다. 전문가들은 이러한 조치가 단기적으로는 효과가 있겠지만, 장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다.",
  estimatedDurationSeconds: 32,
};

const l4MeetingQ1: QuestionSpec = {
  id: "topik4-meeting-discussion-1-q1",
  recordingId: "topik4-meeting-discussion-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is the main topic of this meeting?",
      options: [
        { id: "opt-a", text: "Criteria for hiring new employees" },
        { id: "opt-b", text: "How to respond to a tight project schedule" },
        { id: "opt-c", text: "News that the team lead was promoted" },
        { id: "opt-d", text: "A problem with booking the meeting room" },
      ],
      explanation: {
        whereInRecording: '"이번 프로젝트 일정이 촉박한데, 다들 의견 좀 주시겠어요?" opens the meeting and frames everything that follows.',
        keywords: "일정이 촉박한데, 의견",
        whyCorrect: "The team lead opens by naming the tight schedule as the problem, and both employees' entire contributions are proposed solutions to exactly that problem.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Hiring criteria are never discussed — only whether to add staff to THIS project is debated." },
          { optionId: "opt-c", reason: "No promotion is mentioned anywhere in the meeting." },
          { optionId: "opt-d", reason: "The meeting room is never a topic of discussion." },
        ],
        vocabulary: [
          { term: "촉박하다", translation: "to be tight/pressed (of time)" },
          { term: "일정", translation: "schedule" },
        ],
        grammarPattern: "'-는데' here softly introduces background before a request, connecting the problem to asking for opinions.",
        strategy: "In meeting recordings, the opening speaker's framing question almost always states the main topic — everything after is the discussion of that topic.",
      },
    },
    ru: {
      prompt: "Какова основная тема этого совещания?",
      options: [
        { id: "opt-a", text: "Критерии найма новых сотрудников" },
        { id: "opt-b", text: "Как реагировать на сжатый график проекта" },
        { id: "opt-c", text: "Новость о повышении руководителя" },
        { id: "opt-d", text: "Проблема с бронированием переговорной" },
      ],
      explanation: {
        whereInRecording: '"이번 프로젝트 일정이 촉박한데, 다들 의견 좀 주시겠어요?" открывает совещание и задаёт рамку всему последующему.',
        keywords: "일정이 촉박한데, 의견",
        whyCorrect: "Руководитель начинает с обозначения сжатого графика как проблемы, и оба сотрудника предлагают решения именно этой проблемы.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Критерии найма вообще не обсуждаются — речь только о том, добавлять ли персонал в ЭТОТ проект." },
          { optionId: "opt-c", reason: "О повышении нигде на совещании не упоминается." },
          { optionId: "opt-d", reason: "Переговорная комната никогда не является темой обсуждения." },
        ],
        vocabulary: [
          { term: "촉박하다", translation: "быть сжатым/поджимающим (о времени)" },
          { term: "일정", translation: "график, расписание" },
        ],
        grammarPattern: "'-는데' здесь мягко вводит контекст перед просьбой, связывая проблему с запросом мнений.",
        strategy: "На записях совещаний вопрос-рамка первого выступающего почти всегда обозначает главную тему — всё последующее является её обсуждением.",
      },
    },
    kz: {
      prompt: "Бұл жиналыстың негізгі тақырыбы қандай?",
      options: [
        { id: "opt-a", text: "Жаңа қызметкерлерді жалдау критерийлері" },
        { id: "opt-b", text: "Қатаң жоба кестесіне қалай жауап беру керек" },
        { id: "opt-c", text: "Топ жетекшісінің көтерілгені туралы жаңалық" },
        { id: "opt-d", text: "Жиналыс залын брондау мәселесі" },
      ],
      explanation: {
        whereInRecording: '"이번 프로젝트 일정이 촉박한데, 다들 의견 좀 주시겠어요?" жиналысты ашады және кейінгінің бәрін шеңберлейді.',
        keywords: "일정이 촉박한데, 의견",
        whyCorrect: "Топ жетекшісі қатаң кестені мәселе ретінде атаудан бастайды, ал екі қызметкердің де барлық ұсыныстары дәл осы мәселенің шешімдері болып табылады.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Жалдау критерийлері мүлдем талқыланбайды — тек ОСЫ жобаға қызметкер қосу керек пе деген талқыланады." },
          { optionId: "opt-c", reason: "Көтерілу туралы жиналыста мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Жиналыс залы ешқашан талқылау тақырыбы болмайды." },
        ],
        vocabulary: [
          { term: "촉박하다", translation: "қатаң/тар болу (уақыт туралы)" },
          { term: "일정", translation: "кесте, жоспар" },
        ],
        grammarPattern: "'-는데' мұнда өтініш алдында аясын жұмсақ түрде енгізеді, мәселені пікір сұраумен байланыстырады.",
        strategy: "Жиналыс жазбаларында бірінші сөйлеушінің шеңберлеуші сұрағы әдетте негізгі тақырыпты көрсетеді — одан кейінгінің бәрі сол тақырыпты талқылау.",
      },
    },
  },
};

const l4MeetingQ2: QuestionSpec = {
  id: "topik4-meeting-discussion-1-q2",
  recordingId: "topik4-meeting-discussion-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "relationship",
  content: {
    en: {
      prompt: "What is employee B's opinion?",
      options: [
        { id: "opt-a", text: "More staff should be added." },
        { id: "opt-b", text: "Some features should be postponed to the next version." },
        { id: "opt-c", text: "The project should be canceled." },
        { id: "opt-d", text: "The deadline should be extended." },
      ],
      explanation: {
        whereInRecording: '"차라리 일부 기능을 다음 버전으로 미루는 게 어떨까요?" is employee B\'s proposal, stated after disagreeing with employee A.',
        keywords: "차라리, 일부 기능을 다음 버전으로 미루는 게",
        whyCorrect: "Employee B explicitly proposes postponing some features to the next version instead of adding staff, directly matching option b.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "This is employee A's opinion, which employee B explicitly disagrees with ('저는 생각이 다릅니다')." },
          { optionId: "opt-c", reason: "Canceling the project is never proposed by anyone in the meeting." },
          { optionId: "opt-d", reason: "Extending the deadline is never mentioned by employee B or anyone else." },
        ],
        vocabulary: [
          { term: "미루다", translation: "to postpone, put off" },
          { term: "차라리", translation: "rather, would rather" },
        ],
        grammarPattern: "'-는 게 어떨까요?' is a polite way to suggest an alternative, meaning 'how about ___ instead?'.",
        strategy: "When two speakers disagree, attribute each opinion carefully to the correct speaker by tracking who says '저는 생각이 다릅니다' or similar disagreement markers.",
      },
    },
    ru: {
      prompt: "Каково мнение сотрудника B?",
      options: [
        { id: "opt-a", text: "Нужно добавить персонал." },
        { id: "opt-b", text: "Некоторые функции следует перенести на следующую версию." },
        { id: "opt-c", text: "Проект следует отменить." },
        { id: "opt-d", text: "Срок сдачи нужно продлить." },
      ],
      explanation: {
        whereInRecording: '"차라리 일부 기능을 다음 버전으로 미루는 게 어떨까요?" — предложение сотрудника B, высказанное после несогласия с сотрудником A.',
        keywords: "차라리, 일부 기능을 다음 버전으로 미루는 게",
        whyCorrect: "Сотрудник B прямо предлагает перенести некоторые функции на следующую версию вместо добавления персонала — это точно соответствует варианту b.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Это мнение сотрудника A, с которым сотрудник B прямо не соглашается ('저는 생각이 다릅니다')." },
          { optionId: "opt-c", reason: "Отмену проекта никто на совещании не предлагает." },
          { optionId: "opt-d", reason: "О продлении срока сотрудник B или кто-либо ещё не упоминает." },
        ],
        vocabulary: [
          { term: "미루다", translation: "откладывать, переносить" },
          { term: "차라리", translation: "скорее, лучше уж" },
        ],
        grammarPattern: "'-는 게 어떨까요?' — вежливый способ предложить альтернативу, означает 'как насчёт ___ вместо этого?'.",
        strategy: "Когда два собеседника не соглашаются, точно приписывайте каждое мнение нужному говорящему, отслеживая, кто говорит '저는 생각이 다릅니다' или похожие маркеры несогласия.",
      },
    },
    kz: {
      prompt: "B қызметкерінің пікірі қандай?",
      options: [
        { id: "opt-a", text: "Қызметкер саны көбейтілуі керек." },
        { id: "opt-b", text: "Кейбір функцияларды келесі нұсқаға ауыстыру керек." },
        { id: "opt-c", text: "Жобаны тоқтату керек." },
        { id: "opt-d", text: "Мерзімді ұзарту керек." },
      ],
      explanation: {
        whereInRecording: '"차라리 일부 기능을 다음 버전으로 미루는 게 어떨까요?" — A қызметкерімен келіспегеннен кейін айтылған B қызметкерінің ұсынысы.',
        keywords: "차라리, 일부 기능을 다음 버전으로 미루는 게",
        whyCorrect: "B қызметкері қызметкер қосу орнына кейбір функцияларды келесі нұсқаға ауыстыруды тікелей ұсынады, бұл b нұсқасына дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Бұл A қызметкерінің пікірі, оған B қызметкері тікелей келіспейді ('저는 생각이 다릅니다')." },
          { optionId: "opt-c", reason: "Жобаны тоқтатуды жиналыста ешкім ұсынбайды." },
          { optionId: "opt-d", reason: "Мерзімді ұзартуды B қызметкері де, басқа біреу де айтпайды." },
        ],
        vocabulary: [
          { term: "미루다", translation: "кейінге қалдыру" },
          { term: "차라리", translation: "оның орнына, жақсырақ" },
        ],
        grammarPattern: "'-는 게 어떨까요?' балама ұсынудың сыпайы тәсілі, 'оның орнына ___ қалай?' дегенді білдіреді.",
        strategy: "Екі сөйлеуші келіспегенде, әр пікірді '저는 생각이 다릅니다' немесе ұқсас келіспеушілік белгілерін айтқан адамға дәл жатқызыңыз.",
      },
    },
  },
};

const l4MeetingQ3: QuestionSpec = {
  id: "topik4-meeting-discussion-1-q3",
  recordingId: "topik4-meeting-discussion-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "hard",
  skillTag: "inference",
  content: {
    en: {
      prompt: "The team lead completely ruled out adding more staff.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"그래도 부족하면 인력 충원을 고려합시다" is the team lead\'s closing decision.',
        keywords: "그래도 부족하면, 인력 충원을 고려합시다",
        whyCorrect: "The team lead keeps staffing on the table as a fallback, explicitly saying they'll consider it if postponing features isn't enough — not a complete refusal.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "This contradicts the team lead's closing statement, which explicitly leaves staffing open as a later option, not a rejected one." },
        ],
        vocabulary: [
          { term: "충원", translation: "staffing up, filling a personnel gap" },
          { term: "고려하다", translation: "to consider" },
        ],
        grammarPattern: "'-(으)면' forms a conditional: '부족하면' = 'if it's not enough', setting up the fallback plan.",
        strategy: "A meeting's closing decision often combines two proposals into a staged plan ('try X first, then consider Y') — don't treat the first-mentioned option as fully rejected just because it's not chosen immediately.",
      },
    },
    ru: {
      prompt: "Руководитель полностью исключил добавление персонала.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"그래도 부족하면 인력 충원을 고려합시다" — заключительное решение руководителя.',
        keywords: "그래도 부족하면, 인력 충원을 고려합시다",
        whyCorrect: "Руководитель оставляет наём персонала как запасной вариант, прямо говоря, что рассмотрит его, если переноса функций окажется недостаточно — это не полный отказ.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Это противоречит заключительному заявлению руководителя, которое прямо оставляет наём персонала открытым вариантом на будущее, а не отклонённым." },
        ],
        vocabulary: [
          { term: "충원", translation: "пополнение штата" },
          { term: "고려하다", translation: "рассматривать" },
        ],
        grammarPattern: "'-(으)면' образует условие: '부족하면' = 'если недостаточно', задавая запасной план.",
        strategy: "Заключительное решение совещания часто объединяет два предложения в поэтапный план ('сначала попробуем X, потом рассмотрим Y') — не считайте первый упомянутый вариант полностью отклонённым только потому, что он не выбран сразу.",
      },
    },
    kz: {
      prompt: "Топ жетекшісі қызметкер қосуды толығымен жоққа шығарды.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"그래도 부족하면 인력 충원을 고려합시다" — топ жетекшісінің қорытынды шешімі.',
        keywords: "그래도 부족하면, 인력 충원을 고려합시다",
        whyCorrect: "Топ жетекшісі қызметкер қосуды қосымша нұсқа ретінде қалдырады, функцияларды кейінге қалдыру жеткіліксіз болса, оны қарастыратынын тікелей айтады — бұл толық бас тарту емес.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Бұл топ жетекшісінің қызметкер қосуды кейінгі нұсқа ретінде ашық қалдыратын, бас тартылмаған қорытынды мәлімдемесіне қайшы келеді." },
        ],
        vocabulary: [
          { term: "충원", translation: "қызметкер санын толықтыру" },
          { term: "고려하다", translation: "қарастыру" },
        ],
        grammarPattern: "'-(으)면' шартты құрайды: '부족하면' = 'жеткіліксіз болса', қосымша жоспарды белгілейді.",
        strategy: "Жиналыстың қорытынды шешімі көбіне екі ұсынысты сатылы жоспарға біріктіреді ('алдымен X-ті байқаймыз, содан кейін Y-ті қарастырамыз') — бірінші аталған нұсқаны бірден таңдалмады деп толық қабылданбады деп есептемеңіз.",
      },
    },
  },
};

const l4EnvironmentQ1: QuestionSpec = {
  id: "topik4-environment-news-1-q1",
  recordingId: "topik4-environment-news-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is this news report about?",
      options: [
        { id: "opt-a", text: "A rise in public transportation fares" },
        { id: "opt-b", text: "Rising fine dust and the city's response" },
        { id: "opt-c", text: "The launch of a new diesel car" },
        { id: "opt-d", text: "Expanded public health checkups" },
      ],
      explanation: {
        whereInRecording: '"최근 도심 내 미세먼지 농도가 증가하면서 시민들의 우려가 커지고 있습니다" opens the report, and the rest describes the city\'s response.',
        keywords: "미세먼지 농도가 증가, 대책을 발표했습니다",
        whyCorrect: "The report opens on rising fine dust and continues with the city's announced countermeasures — the report's full arc.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Fare increases are never mentioned; public transportation is only encouraged, not made more expensive." },
          { optionId: "opt-c", reason: "No new diesel car launch is mentioned — old diesel cars are restricted, which is the opposite of a launch." },
          { optionId: "opt-d", reason: "Health checkups are never mentioned in this report." },
        ],
        vocabulary: [
          { term: "미세먼지", translation: "fine dust (air pollution)" },
          { term: "농도", translation: "concentration" },
        ],
        grammarPattern: "'-(으)면서' links two things happening together, here linking rising dust with growing public concern.",
        strategy: "News reports typically open with the core problem and follow with the response — identify the opening problem first, since that's the topic being tested.",
      },
    },
    ru: {
      prompt: "О чём этот новостной репортаж?",
      options: [
        { id: "opt-a", text: "О повышении тарифов на общественный транспорт" },
        { id: "opt-b", text: "О росте мелкодисперсной пыли и мерах города" },
        { id: "opt-c", text: "О выпуске нового дизельного автомобиля" },
        { id: "opt-d", text: "О расширении программ медосмотра" },
      ],
      explanation: {
        whereInRecording: '"최근 도심 내 미세먼지 농도가 증가하면서 시민들의 우려가 커지고 있습니다" открывает репортаж, а далее описываются меры города.',
        keywords: "미세먼지 농도가 증가, 대책을 발표했습니다",
        whyCorrect: "Репортаж начинается с роста мелкодисперсной пыли и продолжается объявленными городом мерами — это вся суть репортажа.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "О повышении тарифов не упоминается; общественный транспорт лишь поощряется, а не дорожает." },
          { optionId: "opt-c", reason: "О выпуске нового дизельного автомобиля не упоминается — старые дизельные машины ограничиваются, что противоположно выпуску." },
          { optionId: "opt-d", reason: "О медосмотрах в этом репортаже вообще не упоминается." },
        ],
        vocabulary: [
          { term: "미세먼지", translation: "мелкодисперсная пыль (загрязнение воздуха)" },
          { term: "농도", translation: "концентрация" },
        ],
        grammarPattern: "'-(으)면서' связывает два одновременных явления, здесь — рост пыли и растущую обеспокоенность граждан.",
        strategy: "Новостные репортажи обычно начинаются с основной проблемы и продолжаются реакцией на неё — сначала определите начальную проблему, поскольку именно она проверяется.",
      },
    },
    kz: {
      prompt: "Бұл жаңалықтар репортажы не туралы?",
      options: [
        { id: "opt-a", text: "Қоғамдық көлік тарифтерінің көтерілуі туралы" },
        { id: "opt-b", text: "Ұсақ шаңның артуы және қаланың шаралары туралы" },
        { id: "opt-c", text: "Жаңа дизель көлігінің шығуы туралы" },
        { id: "opt-d", text: "Денсаулық тексерісінің кеңеюі туралы" },
      ],
      explanation: {
        whereInRecording: '"최근 도심 내 미세먼지 농도가 증가하면서 시민들의 우려가 커지고 있습니다" репортажды ашады, ал қалғаны қаланың шараларын сипаттайды.',
        keywords: "미세먼지 농도가 증가, 대책을 발표했습니다",
        whyCorrect: "Репортаж ұсақ шаңның артуынан басталып, қаланың жариялаған қарсы шараларымен жалғасады — бұл репортаждың толық желісі.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Тариф көтерілуі мүлдем аталмайды; қоғамдық көлікті пайдалану тек ынталандырылады, қымбаттамайды." },
          { optionId: "opt-c", reason: "Жаңа дизель көлігінің шығуы аталмайды — ескі дизель көліктері шектеледі, бұл шығуға қарама-қарсы." },
          { optionId: "opt-d", reason: "Денсаулық тексерісі бұл репортажда мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "미세먼지", translation: "ұсақ шаң (ауа ластануы)" },
          { term: "농도", translation: "концентрация" },
        ],
        grammarPattern: "'-(으)면서' бір мезгілде болатын екі нәрсені байланыстырады, мұнда шаңның артуын қоғамның алаңдаушылығымен байланыстырады.",
        strategy: "Жаңалықтар репортаждары әдетте негізгі мәселеден басталып, оған жауаппен жалғасады — алдымен бастапқы мәселені анықтаңыз, себебі тексерілетін тақырып осы.",
      },
    },
  },
};

const l4EnvironmentQ2: QuestionSpec = {
  id: "topik4-environment-news-1-q2",
  recordingId: "topik4-environment-news-1",
  questionNumber: 2,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b"],
  difficulty: "hard",
  skillTag: "statementMatch",
  content: {
    en: {
      prompt: "Select every statement that matches the news report.",
      options: [
        { id: "opt-a", text: "The city restricts old diesel vehicles." },
        { id: "opt-b", text: "Experts think long-term emission standards need strengthening." },
        { id: "opt-c", text: "Fine dust concentration is decreasing." },
        { id: "opt-d", text: "Public transportation use is being banned." },
      ],
      explanation: {
        whereInRecording: '"노후 경유차의 운행을 제한하고" and "장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다" confirm both true statements.',
        keywords: "노후 경유차의 운행을 제한, 배출 기준을 강화해야 한다",
        whyCorrect: "The restriction on old diesel vehicles and the experts' call for stronger long-term emission standards are both stated directly, matching options a and b.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "The report says concentration is INCREASING ('증가하면서'), the opposite of decreasing." },
          { optionId: "opt-d", reason: "Public transportation is encouraged ('장려하는'), not banned — this reverses the report's meaning." },
        ],
        vocabulary: [
          { term: "노후", translation: "old, aged" },
          { term: "배출 기준", translation: "emission standard" },
        ],
        grammarPattern: "'-아/어야 한다고 지적했다' reports someone else's claim that something 'must' happen — a common structure for citing expert opinion.",
        strategy: "Watch for opposite-meaning traps in statement-match questions — a wrong option often takes a real detail and flips its direction (increase→decrease, encourage→ban).",
      },
    },
    ru: {
      prompt: "Выберите все утверждения, которые соответствуют новостному репортажу.",
      options: [
        { id: "opt-a", text: "Город ограничивает старые дизельные автомобили." },
        { id: "opt-b", text: "Эксперты считают, что долгосрочные нормы выбросов нужно усилить." },
        { id: "opt-c", text: "Концентрация мелкодисперсной пыли снижается." },
        { id: "opt-d", text: "Использование общественного транспорта запрещается." },
      ],
      explanation: {
        whereInRecording: '"노후 경유차의 운행을 제한하고" и "장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다" подтверждают оба верных утверждения.',
        keywords: "노후 경유차의 운행을 제한, 배출 기준을 강화해야 한다",
        whyCorrect: "Ограничение старых дизельных автомобилей и призыв экспертов усилить долгосрочные нормы выбросов прямо названы, точно соответствуя вариантам a и b.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "В репортаже говорится, что концентрация РАСТЁТ ('증가하면서'), противоположно снижению." },
          { optionId: "opt-d", reason: "Общественный транспорт поощряется ('장려하는'), а не запрещается — это переворачивает смысл репортажа." },
        ],
        vocabulary: [
          { term: "노후", translation: "старый, устаревший" },
          { term: "배출 기준", translation: "норма выбросов" },
        ],
        grammarPattern: "'-아/어야 한다고 지적했다' передаёт чужое утверждение о том, что что-то 'должно' произойти — распространённая структура для цитирования мнения экспертов.",
        strategy: "Следите за ловушками с противоположным значением в вопросах на соответствие утверждений — неверный вариант часто берёт реальную деталь и переворачивает её направление (рост→снижение, поощрение→запрет).",
      },
    },
    kz: {
      prompt: "Жаңалықтар репортажына сәйкес келетін барлық мәлімдемені таңдаңыз.",
      options: [
        { id: "opt-a", text: "Қала ескі дизель көліктерін шектейді." },
        { id: "opt-b", text: "Сарапшылар ұзақ мерзімді шығарынды нормаларын күшейту керек деп санайды." },
        { id: "opt-c", text: "Ұсақ шаң концентрациясы төмендеп келеді." },
        { id: "opt-d", text: "Қоғамдық көлікті пайдалануға тыйым салынуда." },
      ],
      explanation: {
        whereInRecording: '"노후 경유차의 운행을 제한하고" және "장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다" екі дұрыс мәлімдемені де растайды.',
        keywords: "노후 경유차의 운행을 제한, 배출 기준을 강화해야 한다",
        whyCorrect: "Ескі дизель көліктерін шектеу және сарапшылардың ұзақ мерзімді шығарынды нормаларын күшейту талабы тікелей айтылған, a және b нұсқаларына дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "Репортажда концентрация АРТЫП КЕЛЕДІ ('증가하면서') делінген, бұл төмендеуге қарама-қарсы." },
          { optionId: "opt-d", reason: "Қоғамдық көлік тыйым салынбайды, керісінше ынталандырылады ('장려하는') — бұл репортаждың мағынасын керісінше бұрады." },
        ],
        vocabulary: [
          { term: "노후", translation: "ескі, тозған" },
          { term: "배출 기준", translation: "шығарынды нормасы" },
        ],
        grammarPattern: "'-아/어야 한다고 지적했다' басқа біреудің бір нәрсе 'болуы керек' деген пікірін жеткізеді — сарапшы пікірін келтіру үшін жиі қолданылатын құрылым.",
        strategy: "Мәлімдемеге сәйкестік сұрақтарында қарама-қарсы мағыналы аңдаушыларға назар аударыңыз — қате нұсқа көбіне нақты детальді алып, оның бағытын керісінше бұрады (артты→төмендеді, ынталандырды→тыйым салды).",
      },
    },
  },
};

const l4EnvironmentQ3: QuestionSpec = {
  id: "topik4-environment-news-1-q3",
  recordingId: "topik4-environment-news-1",
  questionNumber: 3,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "inference",
  content: {
    en: {
      prompt: "What can be inferred about the experts' attitude?",
      options: [
        { id: "opt-a", text: "The current measures alone are fully sufficient." },
        { id: "opt-b", text: "They acknowledge short-term value but want longer-term reinforcement." },
        { id: "opt-c", text: "They oppose all of the city's measures." },
        { id: "opt-d", text: "They see the issue as unrelated to diesel vehicles." },
      ],
      explanation: {
        whereInRecording: '"이러한 조치가 단기적으로는 효과가 있겠지만, 장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다" is the direct expert assessment.',
        keywords: "단기적으로는 효과가 있겠지만, 장기적으로는",
        whyCorrect: "'-지만' (but) shows the experts accept short-term effectiveness while still calling for something more — strengthened long-term standards.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The experts explicitly say more (long-term standard strengthening) is needed — the opposite of 'fully sufficient'." },
          { optionId: "opt-c", reason: "The experts acknowledge the measures have short-term effect, not full opposition." },
          { optionId: "opt-d", reason: "The report directly connects diesel vehicles to the pollution problem the experts are commenting on." },
        ],
        vocabulary: [
          { term: "단기적", translation: "short-term" },
          { term: "장기적", translation: "long-term" },
        ],
        grammarPattern: "'-겠지만' combines a prediction ('-겠-') with a contrast ('-지만'), meaning 'will ___, but ___'.",
        strategy: "For inference questions about attitude, find the connector ('-지만', '하지만', '그러나') that separates what's acknowledged from what's still demanded.",
      },
    },
    ru: {
      prompt: "Что можно сделать вывод об отношении экспертов?",
      options: [
        { id: "opt-a", text: "Нынешних мер вполне достаточно." },
        { id: "opt-b", text: "Они признают краткосрочную пользу, но хотят долгосрочного усиления." },
        { id: "opt-c", text: "Они выступают против всех мер города." },
        { id: "opt-d", text: "Они считают проблему не связанной с дизельными автомобилями." },
      ],
      explanation: {
        whereInRecording: '"이러한 조치가 단기적으로는 효과가 있겠지만, 장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다" — прямая оценка экспертов.',
        keywords: "단기적으로는 효과가 있겠지만, 장기적으로는",
        whyCorrect: "'-지만' (но) показывает, что эксперты признают краткосрочную эффективность, но всё же призывают к большему — усилению долгосрочных норм.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Эксперты прямо говорят, что нужно больше (усиление долгосрочных норм) — противоположно 'вполне достаточно'." },
          { optionId: "opt-c", reason: "Эксперты признают краткосрочный эффект мер, а не выступают полностью против." },
          { optionId: "opt-d", reason: "Репортаж прямо связывает дизельные автомобили с проблемой загрязнения, которую комментируют эксперты." },
        ],
        vocabulary: [
          { term: "단기적", translation: "краткосрочный" },
          { term: "장기적", translation: "долгосрочный" },
        ],
        grammarPattern: "'-겠지만' сочетает предсказание ('-겠-') с противопоставлением ('-지만'), означает 'будет ___, но ___'.",
        strategy: "Для вопросов на вывод об отношении находите связку ('-지만', '하지만', '그러나'), которая отделяет признанное от того, что всё ещё требуется.",
      },
    },
    kz: {
      prompt: "Сарапшылардың көзқарасы туралы не қорытынды жасауға болады?",
      options: [
        { id: "opt-a", text: "Қазіргі шаралар толықтай жеткілікті." },
        { id: "opt-b", text: "Олар қысқа мерзімді пайданы мойындайды, бірақ ұзақ мерзімді күшейтуді қалайды." },
        { id: "opt-c", text: "Олар қаланың барлық шараларына қарсы." },
        { id: "opt-d", text: "Олар мәселені дизель көліктерімен байланысты емес деп санайды." },
      ],
      explanation: {
        whereInRecording: '"이러한 조치가 단기적으로는 효과가 있겠지만, 장기적으로는 산업 전반의 배출 기준을 강화해야 한다고 지적했습니다" — сарапшылардың тікелей бағасы.',
        keywords: "단기적으로는 효과가 있겠지만, 장기적으로는",
        whyCorrect: "'-지만' (бірақ) сарапшылардың қысқа мерзімді тиімділікті мойындайтынын, бірақ бәрібір көбірек нәрсе — ұзақ мерзімді нормаларды күшейтуді талап ететінін көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Сарапшылар көбірек нәрсе (ұзақ мерзімді нормаларды күшейту) қажет екенін тікелей айтады — бұл 'толықтай жеткілікті' дегенге қарама-қарсы." },
          { optionId: "opt-c", reason: "Сарапшылар шаралардың қысқа мерзімді әсерін мойындайды, толық қарсы емес." },
          { optionId: "opt-d", reason: "Репортаж дизель көліктерін сарапшылар пікір білдіріп отырған ластану мәселесімен тікелей байланыстырады." },
        ],
        vocabulary: [
          { term: "단기적", translation: "қысқа мерзімді" },
          { term: "장기적", translation: "ұзақ мерзімді" },
        ],
        grammarPattern: "'-겠지만' болжамды ('-겠-') қарсы қоюмен ('-지만') біріктіреді, '___ болады, бірақ ___' дегенді білдіреді.",
        strategy: "Көзқарас туралы қорытынды сұрақтары үшін мойындалғанды әлі талап етілетінінен бөлетін жалғаушыны ('-지만', '하지만', '그러나') табыңыз.",
      },
    },
  },
};

const L4_MEETING_DISCUSSION_QUESTIONS = buildRecordingQuestions(l4MeetingQ1, l4MeetingQ2, l4MeetingQ3);
const L4_ENVIRONMENT_NEWS_QUESTIONS = buildRecordingQuestions(l4EnvironmentQ1, l4EnvironmentQ2, l4EnvironmentQ3);

// ---------------------------------------------------------------------------
// Level 5 — 고급: academic lecture on aging society, documentary on AI
// ethics. Abstract argumentation, formal lecture register.
// ---------------------------------------------------------------------------

const L5_AGING_LECTURE: TopikListeningRecording = {
  id: "topik5-aging-lecture-1",
  partLabel: "Recording 1",
  topic: "Lecture on the challenges of an aging society",
  transcript:
    "오늘은 고령화 사회의 문제에 대해 말씀드리겠습니다. 우리 사회는 빠르게 고령화되고 있으며, 이는 노동 인구 감소와 복지 비용 증가라는 두 가지 문제를 동시에 야기합니다. 일부에서는 정년 연장을 해결책으로 제시하지만, 이는 청년 고용 문제와 충돌할 수 있다는 우려도 있습니다. 결국 세대 간 갈등을 최소화하면서 지속 가능한 복지 체계를 설계하는 것이 핵심 과제라 할 수 있습니다.",
  estimatedDurationSeconds: 38,
};

const L5_AI_DOCUMENTARY: TopikListeningRecording = {
  id: "topik5-ai-documentary-1",
  partLabel: "Recording 2",
  topic: "Documentary on AI ethics and responsibility",
  transcript:
    "인공지능 기술은 이제 우리 일상 곳곳에 스며들어 있습니다. 그러나 기술의 발전 속도가 사회 제도의 변화 속도를 앞지르면서 여러 가지 윤리적 질문이 제기되고 있습니다. 예를 들어, 인공지능이 내린 결정에 대한 책임은 누구에게 있는가 하는 문제는 아직 명확한 답을 찾지 못했습니다. 전문가들은 기술 발전과 함께 관련 법과 제도의 정비가 병행되어야 한다고 강조합니다.",
  estimatedDurationSeconds: 36,
};

const l5AgingQ1: QuestionSpec = {
  id: "topik5-aging-lecture-1-q1",
  recordingId: "topik5-aging-lecture-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is the core topic of this lecture?",
      options: [
        { id: "opt-a", text: "Youth unemployment statistics" },
        { id: "opt-b", text: "The problems and challenges of an aging society" },
        { id: "opt-c", text: "The history of the retirement system" },
        { id: "opt-d", text: "Proposals to cut the welfare budget" },
      ],
      explanation: {
        whereInRecording: '"오늘은 고령화 사회의 문제에 대해 말씀드리겠습니다" is the lecturer\'s explicit opening topic statement.',
        keywords: "고령화 사회의 문제, 핵심 과제",
        whyCorrect: "The lecturer directly announces the topic as the problems of an aging society, and closes by naming the '핵심 과제' (key task) tied to that same topic.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Youth employment is mentioned only as a possible conflict with retirement extension, not as the lecture's statistics-based subject." },
          { optionId: "opt-c", reason: "No history of the retirement system is given — only a current proposal (extending it) is discussed." },
          { optionId: "opt-d", reason: "Cutting welfare budgets is never proposed; rising welfare cost is described as a problem, not something to be cut." },
        ],
        vocabulary: [
          { term: "고령화", translation: "aging (of a population)" },
          { term: "복지", translation: "welfare" },
        ],
        grammarPattern: "'-에 대해 말씀드리겠습니다' is a formal lecture-opening pattern meaning 'I will talk about ___'.",
        strategy: "Academic lecture recordings almost always state their topic explicitly in the first sentence — anchor main-idea answers to that opening line.",
      },
    },
    ru: {
      prompt: "Какова основная тема этой лекции?",
      options: [
        { id: "opt-a", text: "Статистика молодёжной безработицы" },
        { id: "opt-b", text: "Проблемы и вызовы стареющего общества" },
        { id: "opt-c", text: "История пенсионной системы" },
        { id: "opt-d", text: "Предложения по сокращению бюджета на соцобеспечение" },
      ],
      explanation: {
        whereInRecording: '"오늘은 고령화 사회의 문제에 대해 말씀드리겠습니다" — явное заявление лектора о теме в самом начале.',
        keywords: "고령화 사회의 문제, 핵심 과제",
        whyCorrect: "Лектор прямо объявляет тему как проблемы стареющего общества и завершает, называя '핵심 과제' (ключевую задачу), связанную с этой же темой.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Молодёжная занятость упоминается лишь как возможный конфликт с продлением пенсионного возраста, а не как статистическая тема лекции." },
          { optionId: "opt-c", reason: "История пенсионной системы не приводится — обсуждается только текущее предложение (продление)." },
          { optionId: "opt-d", reason: "Сокращение бюджета соцобеспечения нигде не предлагается; рост расходов на соцобеспечение описан как проблема, а не как то, что нужно сократить." },
        ],
        vocabulary: [
          { term: "고령화", translation: "старение (населения)" },
          { term: "복지", translation: "социальное обеспечение" },
        ],
        grammarPattern: "'-에 대해 말씀드리겠습니다' — формальная фраза начала лекции, означает 'я расскажу о ___'.",
        strategy: "Записи академических лекций почти всегда явно называют тему в первом предложении — опирайтесь на эту вступительную фразу при ответе на вопросы об основной идее.",
      },
    },
    kz: {
      prompt: "Бұл дәрістің негізгі тақырыбы қандай?",
      options: [
        { id: "opt-a", text: "Жастар жұмыссыздығының статистикасы" },
        { id: "opt-b", text: "Қартайған қоғамның мәселелері мен қиындықтары" },
        { id: "opt-c", text: "Зейнетке шығу жүйесінің тарихы" },
        { id: "opt-d", text: "Әлеуметтік қамсыздандыру бюджетін қысқарту ұсыныстары" },
      ],
      explanation: {
        whereInRecording: '"오늘은 고령화 사회의 문제에 대해 말씀드리겠습니다" — дәрісшінің тақырыпты нақты бастапқы мәлімдеуі.',
        keywords: "고령화 사회의 문제, 핵심 과제",
        whyCorrect: "Дәрісші тақырыпты қартайған қоғамның мәселелері ретінде тікелей жариялайды және сол тақырыпқа байланысты '핵심 과제' (негізгі міндетті) атаумен аяқтайды.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Жастар жұмыспен қамтылуы тек зейнет жасын ұзартумен мүмкін қайшылық ретінде аталады, дәрістің статистикалық тақырыбы емес." },
          { optionId: "opt-c", reason: "Зейнетке шығу жүйесінің тарихы берілмейді — тек қазіргі ұсыныс (ұзарту) талқыланады." },
          { optionId: "opt-d", reason: "Әлеуметтік қамсыздандыру бюджетін қысқарту ешқашан ұсынылмайды; шығынның артуы мәселе ретінде сипатталады, қысқартылатын нәрсе ретінде емес." },
        ],
        vocabulary: [
          { term: "고령화", translation: "қартаю (халықтың)" },
          { term: "복지", translation: "әлеуметтік қамсыздандыру" },
        ],
        grammarPattern: "'-에 대해 말씀드리겠습니다' — дәрісті бастаудың ресми үлгісі, '___ туралы айтамын' дегенді білдіреді.",
        strategy: "Академиялық дәріс жазбалары әдетте тақырыпты бірінші сөйлемде нақты айтады — негізгі ой жауаптарын осы бастапқы сөйлемге сүйеніп беріңіз.",
      },
    },
  },
};

const l5AgingQ2: QuestionSpec = {
  id: "topik5-aging-lecture-1-q2",
  recordingId: "topik5-aging-lecture-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "inference",
  content: {
    en: {
      prompt: "What is the lecturer's stance on extending the retirement age?",
      options: [
        { id: "opt-a", text: "Fully supportive, with no reservations" },
        { id: "opt-b", text: "A possible solution, but with concern about conflict with youth employment" },
        { id: "opt-c", text: "Completely ineffective" },
        { id: "opt-d", text: "Already implemented and successful" },
      ],
      explanation: {
        whereInRecording: '"일부에서는 정년 연장을 해결책으로 제시하지만, 이는 청년 고용 문제와 충돌할 수 있다는 우려도 있습니다" balances the proposal against a concern.',
        keywords: "해결책으로 제시하지만, 충돌할 수 있다는 우려",
        whyCorrect: "The lecturer presents retirement extension as a proposed solution ('해결책으로 제시') while immediately noting the concern that it could conflict with youth employment — a balanced, cautious stance, not full endorsement or rejection.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The lecturer immediately raises a concern right after mentioning the proposal — this isn't unreserved support." },
          { optionId: "opt-c", reason: "The lecturer never calls it ineffective; it's presented as A possible solution, just one with a tradeoff." },
          { optionId: "opt-d", reason: "Nothing in the lecture states the policy has already been implemented — it's discussed as a proposal, not a settled fact." },
        ],
        vocabulary: [
          { term: "정년 연장", translation: "extending the retirement age" },
          { term: "충돌하다", translation: "to conflict, clash" },
        ],
        grammarPattern: "'-지만' contrasts a proposal with a following concern, softening an otherwise flat endorsement.",
        strategy: "For attitude/inference questions in a lecture, look specifically at what follows '-지만' or '그러나' right after a proposal is introduced — that's usually where the real nuance is.",
      },
    },
    ru: {
      prompt: "Какова позиция лектора по поводу продления пенсионного возраста?",
      options: [
        { id: "opt-a", text: "Полная поддержка без оговорок" },
        { id: "opt-b", text: "Возможное решение, но с опасением конфликта с молодёжной занятостью" },
        { id: "opt-c", text: "Полностью неэффективно" },
        { id: "opt-d", text: "Уже реализовано и успешно" },
      ],
      explanation: {
        whereInRecording: '"일부에서는 정년 연장을 해결책으로 제시하지만, 이는 청년 고용 문제와 충돌할 수 있다는 우려도 있습니다" уравновешивает предложение опасением.',
        keywords: "해결책으로 제시하지만, 충돌할 수 있다는 우려",
        whyCorrect: "Лектор представляет продление пенсионного возраста как предлагаемое решение ('해결책으로 제시'), сразу отмечая опасение, что оно может конфликтовать с молодёжной занятостью — сбалансированная, осторожная позиция, а не полная поддержка или отказ.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Лектор сразу поднимает опасение сразу после упоминания предложения — это не безоговорочная поддержка." },
          { optionId: "opt-c", reason: "Лектор никогда не называет это неэффективным; это представлено как возможное решение с компромиссом." },
          { optionId: "opt-d", reason: "Ничто в лекции не говорит, что политика уже реализована — она обсуждается как предложение, а не как свершившийся факт." },
        ],
        vocabulary: [
          { term: "정년 연장", translation: "продление пенсионного возраста" },
          { term: "충돌하다", translation: "конфликтовать, сталкиваться" },
        ],
        grammarPattern: "'-지만' противопоставляет предложение последующему опасению, смягчая иначе однозначную поддержку.",
        strategy: "Для вопросов на отношение/вывод в лекции обращайте внимание именно на то, что следует после '-지만' или '그러나' сразу после введения предложения — обычно там и содержится реальный нюанс.",
      },
    },
    kz: {
      prompt: "Дәрісшінің зейнет жасын ұзартуға көзқарасы қандай?",
      options: [
        { id: "opt-a", text: "Ешбір ескертусіз толық қолдау" },
        { id: "opt-b", text: "Мүмкін шешім, бірақ жастар жұмыспен қамтылуымен қайшылық қаупі бар" },
        { id: "opt-c", text: "Толығымен тиімсіз" },
        { id: "opt-d", text: "Қазірдің өзінде іске асырылған және сәтті" },
      ],
      explanation: {
        whereInRecording: '"일부에서는 정년 연장을 해결책으로 제시하지만, 이는 청년 고용 문제와 충돌할 수 있다는 우려도 있습니다" ұсынысты алаңдаушылықпен теңестіреді.',
        keywords: "해결책으로 제시하지만, 충돌할 수 있다는 우려",
        whyCorrect: "Дәрісші зейнет жасын ұзартуды ұсынылған шешім ('해결책으로 제시') ретінде көрсетіп, бірден оның жастар жұмыспен қамтылуымен қайшы келуі мүмкін екеніне алаңдаушылық білдіреді — бұл толық қолдау немесе бас тарту емес, теңдестірілген, сақ көзқарас.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Дәрісші ұсынысты айтқаннан кейін бірден алаңдаушылық көтереді — бұл ешбір ескертусіз қолдау емес." },
          { optionId: "opt-c", reason: "Дәрісші оны ешқашан тиімсіз деп атамайды; ол ымыралы, бірақ мүмкін шешім ретінде ұсынылады." },
          { optionId: "opt-d", reason: "Дәрісте саясаттың қазірдің өзінде іске асырылғаны туралы ештеңе жоқ — ол шешілген факт емес, ұсыныс ретінде талқыланады." },
        ],
        vocabulary: [
          { term: "정년 연장", translation: "зейнет жасын ұзарту" },
          { term: "충돌하다", translation: "қайшы келу, соқтығысу" },
        ],
        grammarPattern: "'-지만' ұсынысты одан кейінгі алаңдаушылықпен қарсы қояды, әйтпесе тегіс қолдауды жұмсартады.",
        strategy: "Дәрістегі көзқарас/қорытынды сұрақтары үшін ұсыныс енгізілгеннен кейін бірден '-지만' немесе '그러나'-дан кейін не келетінін қараңыз — әдетте нақты нюанс сонда болады.",
      },
    },
  },
};

const l5AgingQ3: QuestionSpec = {
  id: "topik5-aging-lecture-1-q3",
  recordingId: "topik5-aging-lecture-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-true"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "Aging simultaneously causes a shrinking labor force and rising welfare costs.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"이는 노동 인구 감소와 복지 비용 증가라는 두 가지 문제를 동시에 야기합니다" states this exact pair of problems.',
        keywords: "노동 인구 감소, 복지 비용 증가, 동시에 야기합니다",
        whyCorrect: "The lecturer explicitly lists both problems and says they occur '동시에' (simultaneously) as a direct result of aging.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "This contradicts the lecture's explicit statement that both problems occur together, not separately or one at a time." },
        ],
        vocabulary: [
          { term: "노동 인구", translation: "labor force, working population" },
          { term: "야기하다", translation: "to cause, bring about" },
        ],
        grammarPattern: "'-(이)라는 두 가지 문제' means 'the two problems of ___', a formal way to name a paired list before elaborating.",
        strategy: "When a lecture names a pair of problems together with '두 가지' (two kinds), expect a question testing whether you caught both, not just one.",
      },
    },
    ru: {
      prompt: "Старение населения одновременно вызывает сокращение рабочей силы и рост расходов на соцобеспечение.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"이는 노동 인구 감소와 복지 비용 증가라는 두 가지 문제를 동시에 야기합니다" называет именно эту пару проблем.',
        keywords: "노동 인구 감소, 복지 비용 증가, 동시에 야기합니다",
        whyCorrect: "Лектор прямо перечисляет обе проблемы и говорит, что они возникают '동시에' (одновременно) как прямой результат старения населения.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "Это противоречит явному утверждению лекции о том, что обе проблемы возникают вместе, а не раздельно или по очереди." },
        ],
        vocabulary: [
          { term: "노동 인구", translation: "рабочая сила, трудоспособное население" },
          { term: "야기하다", translation: "вызывать, порождать" },
        ],
        grammarPattern: "'-(이)라는 두 가지 문제' означает 'две проблемы ___', формальный способ назвать парный список перед развёрнутым объяснением.",
        strategy: "Когда лекция называет пару проблем вместе со словом '두 가지' (два вида), ожидайте вопрос, проверяющий, уловили ли вы обе, а не только одну.",
      },
    },
    kz: {
      prompt: "Қартаю бір мезгілде еңбек ресурстарының азаюын және әлеуметтік қамсыздандыру шығынының артуын тудырады.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"이는 노동 인구 감소와 복지 비용 증가라는 두 가지 문제를 동시에 야기합니다" дәл осы екі мәселені атайды.',
        keywords: "노동 인구 감소, 복지 비용 증가, 동시에 야기합니다",
        whyCorrect: "Дәрісші екі мәселені де нақты атап, олардың қартаюдың тікелей нәтижесі ретінде '동시에' (бір мезгілде) болатынын айтады.",
        whyIncorrect: [
          { optionId: "opt-false", reason: "Бұл дәрістің екі мәселе бөлек емес, бірге пайда болатыны туралы нақты мәлімдемесіне қайшы келеді." },
        ],
        vocabulary: [
          { term: "노동 인구", translation: "еңбек ресурстары, жұмысшы халық" },
          { term: "야기하다", translation: "тудыру, әкелу" },
        ],
        grammarPattern: "'-(이)라는 두 가지 문제' '___ екі мәселе' дегенді білдіреді, егжей-тегжейлі түсіндіру алдында жұп тізімді атаудың ресми тәсілі.",
        strategy: "Дәріс '두 가지' (екі түрі) сөзімен бірге мәселелер жұбын атаса, тек біреуін емес, екеуін де ұстап қалғаныңызды тексеретін сұрақ күтіңіз.",
      },
    },
  },
};

const l5AiQ1: QuestionSpec = {
  id: "topik5-ai-documentary-1-q1",
  recordingId: "topik5-ai-documentary-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is the core issue this documentary addresses?",
      options: [
        { id: "opt-a", text: "AI marketing strategies" },
        { id: "opt-b", text: "The gap between the pace of technology and social systems" },
        { id: "opt-c", text: "AI developers' salaries" },
        { id: "opt-d", text: "The history of the robotics industry" },
      ],
      explanation: {
        whereInRecording: '"기술의 발전 속도가 사회 제도의 변화 속도를 앞지르면서 여러 가지 윤리적 질문이 제기되고 있습니다" is the central claim the rest of the documentary elaborates.',
        keywords: "발전 속도가, 앞지르면서, 윤리적 질문",
        whyCorrect: "The documentary's core issue is that technology is outpacing social systems, generating ethical questions — everything after (the responsibility example) illustrates this gap.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Marketing strategies are never discussed in the documentary." },
          { optionId: "opt-c", reason: "Developer salaries are never mentioned." },
          { optionId: "opt-d", reason: "No history of the robotics industry is given — the focus is on a present-day ethical gap." },
        ],
        vocabulary: [
          { term: "앞지르다", translation: "to outpace, overtake" },
          { term: "윤리적", translation: "ethical" },
        ],
        grammarPattern: "'-(으)면서' links two ongoing processes, here linking technology's advance with the rise of ethical questions.",
        strategy: "In documentaries, listen for a 'however' turn ('그러나') right after an opening statement — it usually introduces the documentary's real central tension.",
      },
    },
    ru: {
      prompt: "Какую ключевую проблему рассматривает этот документальный фильм?",
      options: [
        { id: "opt-a", text: "Маркетинговые стратегии ИИ" },
        { id: "opt-b", text: "Разрыв между темпами технологий и социальных систем" },
        { id: "opt-c", text: "Зарплаты разработчиков ИИ" },
        { id: "opt-d", text: "История индустрии робототехники" },
      ],
      explanation: {
        whereInRecording: '"기술의 발전 속도가 사회 제도의 변화 속도를 앞지르면서 여러 가지 윤리적 질문이 제기되고 있습니다" — центральное утверждение, которое раскрывает остальная часть фильма.',
        keywords: "발전 속도가, 앞지르면서, 윤리적 질문",
        whyCorrect: "Ключевая проблема фильма — то, что технологии опережают социальные системы, порождая этические вопросы — всё последующее (пример с ответственностью) иллюстрирует этот разрыв.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Маркетинговые стратегии в фильме вообще не обсуждаются." },
          { optionId: "opt-c", reason: "О зарплатах разработчиков не упоминается." },
          { optionId: "opt-d", reason: "История индустрии робототехники не приводится — фокус на современном этическом разрыве." },
        ],
        vocabulary: [
          { term: "앞지르다", translation: "опережать, обгонять" },
          { term: "윤리적", translation: "этический" },
        ],
        grammarPattern: "'-(으)면서' связывает два происходящих одновременно процесса, здесь — развитие технологий и рост этических вопросов.",
        strategy: "В документальных фильмах слушайте поворот 'однако' ('그러나') сразу после вступительного утверждения — он обычно вводит настоящий центральный конфликт фильма.",
      },
    },
    kz: {
      prompt: "Бұл деректі фильм қандай негізгі мәселені қарастырады?",
      options: [
        { id: "opt-a", text: "ЖИ маркетинг стратегиялары" },
        { id: "opt-b", text: "Технология қарқыны мен әлеуметтік жүйелер арасындағы алшақтық" },
        { id: "opt-c", text: "ЖИ әзірлеушілерінің жалақысы" },
        { id: "opt-d", text: "Робот өнеркәсібінің тарихы" },
      ],
      explanation: {
        whereInRecording: '"기술의 발전 속도가 사회 제도의 변화 속도를 앞지르면서 여러 가지 윤리적 질문이 제기되고 있습니다" — фильмнің қалған бөлігі ашатын негізгі мәлімдеме.',
        keywords: "발전 속도가, 앞지르면서, 윤리적 질문",
        whyCorrect: "Фильмнің негізгі мәселесі — технологияның әлеуметтік жүйелерден озып кетуі, этикалық сұрақтар туғызуы — одан кейінгінің бәрі (жауапкершілік мысалы) осы алшақтықты көрсетеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Маркетинг стратегиялары фильмде мүлдем талқыланбайды." },
          { optionId: "opt-c", reason: "Әзірлеушілердің жалақысы мүлдем аталмайды." },
          { optionId: "opt-d", reason: "Робот өнеркәсібінің тарихы берілмейді — назар қазіргі заманғы этикалық алшақтыққа аударылған." },
        ],
        vocabulary: [
          { term: "앞지르다", translation: "озып кету, басып озу" },
          { term: "윤리적", translation: "этикалық" },
        ],
        grammarPattern: "'-(으)면서' екі жалғасып жатқан процесті байланыстырады, мұнда технологияның дамуын этикалық сұрақтардың артуымен байланыстырады.",
        strategy: "Деректі фильмдерде бастапқы мәлімдемеден кейін бірден 'дегенмен' ('그러나') бетбұрысын тыңдаңыз — ол әдетте фильмнің нақты негізгі қайшылығын енгізеді.",
      },
    },
  },
};

const l5AiQ2: QuestionSpec = {
  id: "topik5-ai-documentary-1-q2",
  recordingId: "topik5-ai-documentary-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "medium",
  skillTag: "detail",
  content: {
    en: {
      prompt: "What question still has no clear answer, according to the documentary?",
      options: [
        { id: "opt-a", text: "The cost of developing AI" },
        { id: "opt-b", text: "Who bears responsibility for a decision made by AI" },
        { id: "opt-c", text: "The exact definition of AI" },
        { id: "opt-d", text: "The number of AI users" },
      ],
      explanation: {
        whereInRecording: '"인공지능이 내린 결정에 대한 책임은 누구에게 있는가 하는 문제는 아직 명확한 답을 찾지 못했습니다" states this directly.',
        keywords: "책임은 누구에게 있는가, 명확한 답을 찾지 못했습니다",
        whyCorrect: "The documentary explicitly names the unresolved question as who is responsible for AI's decisions.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Development cost is never mentioned in the documentary." },
          { optionId: "opt-c", reason: "A definition of AI is never discussed as an open question." },
          { optionId: "opt-d", reason: "The number of users is never mentioned in the documentary." },
        ],
        vocabulary: [
          { term: "책임", translation: "responsibility" },
          { term: "명확하다", translation: "to be clear, unambiguous" },
        ],
        grammarPattern: "'누구에게 있는가 하는 문제' embeds a question ('누구에게 있는가') inside a noun phrase ('문제') — a formal way to name an open question as a topic.",
        strategy: "When a recording poses a rhetorical question ('누구에게 있는가?'), that question itself is often exactly what a detail question will ask you to identify.",
      },
    },
    ru: {
      prompt: "На какой вопрос, согласно фильму, до сих пор нет чёткого ответа?",
      options: [
        { id: "opt-a", text: "Стоимость разработки ИИ" },
        { id: "opt-b", text: "Кто несёт ответственность за решение, принятое ИИ" },
        { id: "opt-c", text: "Точное определение ИИ" },
        { id: "opt-d", text: "Количество пользователей ИИ" },
      ],
      explanation: {
        whereInRecording: '"인공지능이 내린 결정에 대한 책임은 누구에게 있는가 하는 문제는 아직 명확한 답을 찾지 못했습니다" называет это прямо.',
        keywords: "책임은 누구에게 있는가, 명확한 답을 찾지 못했습니다",
        whyCorrect: "Фильм прямо называет нерешённым вопрос о том, кто несёт ответственность за решения ИИ.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Стоимость разработки в фильме не упоминается." },
          { optionId: "opt-c", reason: "Определение ИИ не обсуждается как открытый вопрос." },
          { optionId: "opt-d", reason: "Количество пользователей в фильме не упоминается." },
        ],
        vocabulary: [
          { term: "책임", translation: "ответственность" },
          { term: "명확하다", translation: "быть ясным, однозначным" },
        ],
        grammarPattern: "'누구에게 있는가 하는 문제' встраивает вопрос ('누구에게 있는가') внутрь именной группы ('문제') — формальный способ назвать открытый вопрос темой.",
        strategy: "Когда запись задаёт риторический вопрос ('누구에게 있는가?'), сам этот вопрос часто именно то, что нужно определить в вопросе на деталь.",
      },
    },
    kz: {
      prompt: "Фильм бойынша қандай сұраққа әлі нақты жауап жоқ?",
      options: [
        { id: "opt-a", text: "ЖИ әзірлеу құны" },
        { id: "opt-b", text: "ЖИ қабылдаған шешімге кім жауапты" },
        { id: "opt-c", text: "ЖИ-дың нақты анықтамасы" },
        { id: "opt-d", text: "ЖИ пайдаланушыларының саны" },
      ],
      explanation: {
        whereInRecording: '"인공지능이 내린 결정에 대한 책임은 누구에게 있는가 하는 문제는 아직 명확한 답을 찾지 못했습니다" мұны тікелей айтады.',
        keywords: "책임은 누구에게 있는가, 명확한 답을 찾지 못했습니다",
        whyCorrect: "Фильм ЖИ шешімдеріне кім жауапты екені туралы шешілмеген сұрақты нақты атайды.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Әзірлеу құны фильмде мүлдем аталмайды." },
          { optionId: "opt-c", reason: "ЖИ анықтамасы ашық сұрақ ретінде талқыланбайды." },
          { optionId: "opt-d", reason: "Пайдаланушылар саны фильмде мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "책임", translation: "жауапкершілік" },
          { term: "명확하다", translation: "анық, айқын болу" },
        ],
        grammarPattern: "'누구에게 있는가 하는 문제' сұрақты ('누구에게 있는가') зат есім тіркесінің ('문제') ішіне енгізеді — ашық сұрақты тақырып ретінде атаудың ресми тәсілі.",
        strategy: "Жазба риторикалық сұрақ қойғанда ('누구에게 있는가?'), сол сұрақтың өзі көбіне детал сұрағында анықтауды талап ететін нәрсе болады.",
      },
    },
  },
};

const l5AiQ3: QuestionSpec = {
  id: "topik5-ai-documentary-1-q3",
  recordingId: "topik5-ai-documentary-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "medium",
  skillTag: "inference",
  content: {
    en: {
      prompt: "The experts believe that improving laws and institutions is unnecessary.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"전문가들은 기술 발전과 함께 관련 법과 제도의 정비가 병행되어야 한다고 강조합니다" is the documentary\'s closing statement.',
        keywords: "법과 제도의 정비가 병행되어야 한다고 강조합니다",
        whyCorrect: "The experts explicitly emphasize ('강조합니다') that legal and institutional reform must proceed alongside technology — the opposite of calling it unnecessary.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "This directly contradicts the documentary's closing line, where experts stress that legal/institutional improvement IS necessary." },
        ],
        vocabulary: [
          { term: "제도", translation: "institution, system" },
          { term: "병행되다", translation: "to proceed in parallel" },
        ],
        grammarPattern: "'-아/어야 한다고 강조하다' means 'to emphasize that ___ must ___', a strong claim-reporting structure.",
        strategy: "A documentary's final sentence often carries the experts' overall recommendation — treat it as the most testable line in the whole recording.",
      },
    },
    ru: {
      prompt: "Эксперты считают, что совершенствование законов и институтов не нужно.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"전문가들은 기술 발전과 함께 관련 법과 제도의 정비가 병행되어야 한다고 강조합니다" — заключительное утверждение фильма.',
        keywords: "법과 제도의 정비가 병행되어야 한다고 강조합니다",
        whyCorrect: "Эксперты прямо подчёркивают ('강조합니다'), что правовая и институциональная реформа должна идти параллельно с технологией — это противоположно утверждению о ненужности.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Это прямо противоречит заключительной фразе фильма, где эксперты подчёркивают, что правовое/институциональное совершенствование НЕОБХОДИМО." },
        ],
        vocabulary: [
          { term: "제도", translation: "институт, система" },
          { term: "병행되다", translation: "происходить параллельно" },
        ],
        grammarPattern: "'-아/어야 한다고 강조하다' означает 'подчёркивать, что ___ должно ___', сильная структура передачи утверждения.",
        strategy: "Последнее предложение документального фильма часто несёт общую рекомендацию экспертов — считайте его самой проверяемой строкой во всей записи.",
      },
    },
    kz: {
      prompt: "Сарапшылар заңдар мен институттарды жетілдіру қажет емес деп санайды.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"전문가들은 기술 발전과 함께 관련 법과 제도의 정비가 병행되어야 한다고 강조합니다" — фильмнің қорытынды мәлімдемесі.',
        keywords: "법과 제도의 정비가 병행되어야 한다고 강조합니다",
        whyCorrect: "Сарапшылар құқықтық және институционалдық реформа технологиямен қатар жүруі КЕРЕК екенін тікелей баса айтады ('강조합니다') — бұл қажет емес дегенге қарама-қарсы.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Бұл фильмнің сарапшылар құқықтық/институционалдық жетілдіру ҚАЖЕТ екенін баса айтатын қорытынды жолына тікелей қайшы келеді." },
        ],
        vocabulary: [
          { term: "제도", translation: "институт, жүйе" },
          { term: "병행되다", translation: "қатар жүру" },
        ],
        grammarPattern: "'-아/어야 한다고 강조하다' '___ керек екенін баса айту' дегенді білдіреді, мәлімдемені жеткізудің күшті құрылымы.",
        strategy: "Деректі фильмнің соңғы сөйлемі көбіне сарапшылардың жалпы ұсынысын алып жүреді — оны бүкіл жазбадағы ең тексерілетін жол деп қараңыз.",
      },
    },
  },
};

const L5_AGING_LECTURE_QUESTIONS = buildRecordingQuestions(l5AgingQ1, l5AgingQ2, l5AgingQ3);
const L5_AI_DOCUMENTARY_QUESTIONS = buildRecordingQuestions(l5AiQ1, l5AiQ2, l5AiQ3);

// ---------------------------------------------------------------------------
// Level 6 — 최고급: expert interview on interest rates, formal debate on AI
// copyright. Native-adjacent pace, specialized vocabulary, dense reasoning.
// ---------------------------------------------------------------------------

const L6_ECONOMY_INTERVIEW: TopikListeningRecording = {
  id: "topik6-economy-interview-1",
  partLabel: "Recording 1",
  topic: "Expert interview on interest rate hikes and household finances",
  transcript:
    "진행자: 최근 금리 인상이 서민 경제에 미치는 영향에 대해 말씀해 주시겠습니까? 경제학자: 금리가 오르면 대출 이자 부담이 커져서 가계의 소비 여력이 줄어듭니다. 특히 변동 금리로 대출을 받은 가구는 즉각적인 타격을 받게 되죠. 다만 금리 인상은 물가 상승을 억제하기 위한 불가피한 조치이기도 합니다. 결국 정책 당국은 물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황입니다.",
  estimatedDurationSeconds: 42,
};

const L6_LEGAL_DEBATE: TopikListeningRecording = {
  id: "topik6-legal-debate-1",
  partLabel: "Recording 2",
  topic: "Formal debate on copyright for AI-generated works",
  transcript:
    "사회자: 오늘 토론 주제는 인공지능이 생성한 창작물의 저작권 인정 여부입니다. 찬성 측 토론자: 인공지능이 만든 결과물이라도 이를 활용한 사람의 창의적 기여가 인정된다면 저작권을 부여하는 것이 타당합니다. 반대 측 토론자: 그러나 현행법상 저작권은 인간의 창작 행위를 전제로 하기 때문에, 인공지능 산출물에 그대로 적용하는 것은 법 체계의 근본 전제를 흔들 수 있습니다. 사회자: 결국 이 문제는 기술과 법이 함께 풀어야 할 과제로 보입니다.",
  estimatedDurationSeconds: 40,
};

const l6EconomyQ1: QuestionSpec = {
  id: "topik6-economy-interview-1-q1",
  recordingId: "topik6-economy-interview-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-a"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is the core content of this interview?",
      options: [
        { id: "opt-a", text: "The effect of interest rate hikes on ordinary households and the resulting policy dilemma" },
        { id: "opt-b", text: "The stock market outlook" },
        { id: "opt-c", text: "An introduction to a new loan product" },
        { id: "opt-d", text: "Foreign exchange market fluctuations" },
      ],
      explanation: {
        whereInRecording: 'The host\'s opening question and the economist\'s full answer, closing with "물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황," frame the entire interview.',
        keywords: "금리 인상이 서민 경제에 미치는 영향, 상충하는 목표",
        whyCorrect: "The interview opens on rate hikes' effect on ordinary households and closes on the policy dilemma this creates — the interview's complete arc.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "The stock market is never mentioned anywhere in the interview." },
          { optionId: "opt-c", reason: "No specific loan product is introduced; loans are discussed only generally, as a category affected by rates." },
          { optionId: "opt-d", reason: "Foreign exchange is never mentioned in the interview." },
        ],
        vocabulary: [
          { term: "서민 경제", translation: "the economy of ordinary people/households" },
          { term: "상충하다", translation: "to conflict, be in tension" },
        ],
        grammarPattern: "'-라는 상충하는 목표 사이에서 균형을 찾다' is a dense formal noun-phrase pattern meaning 'to find balance between conflicting goals called ___'.",
        strategy: "In expert interviews, the host's opening question sets the topic and the expert's final sentence usually reveals the underlying tension — combine both to answer main-idea questions.",
      },
    },
    ru: {
      prompt: "Каково основное содержание этого интервью?",
      options: [
        { id: "opt-a", text: "Влияние повышения ставок на обычные домохозяйства и возникающая политическая дилемма" },
        { id: "opt-b", text: "Прогноз фондового рынка" },
        { id: "opt-c", text: "Представление нового кредитного продукта" },
        { id: "opt-d", text: "Колебания валютного рынка" },
      ],
      explanation: {
        whereInRecording: 'Вступительный вопрос ведущего и полный ответ экономиста, заканчивающийся словами "물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황," обрамляют всё интервью.',
        keywords: "금리 인상이 서민 경제에 미치는 영향, 상충하는 목표",
        whyCorrect: "Интервью начинается с влияния повышения ставок на обычные домохозяйства и заканчивается вытекающей из этого политической дилеммой — полная дуга интервью.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Фондовый рынок нигде в интервью не упоминается." },
          { optionId: "opt-c", reason: "Конкретный кредитный продукт не представляется; кредиты обсуждаются лишь в общем, как категория, затронутая ставками." },
          { optionId: "opt-d", reason: "Валютный рынок в интервью не упоминается." },
        ],
        vocabulary: [
          { term: "서민 경제", translation: "экономика простых людей/домохозяйств" },
          { term: "상충하다", translation: "конфликтовать, быть в напряжении" },
        ],
        grammarPattern: "'-라는 상충하는 목표 사이에서 균형을 찾다' — плотная формальная именная конструкция, означающая 'найти баланс между конфликтующими целями под названием ___'.",
        strategy: "В интервью с экспертами вступительный вопрос ведущего задаёт тему, а последнее предложение эксперта обычно раскрывает скрытое напряжение — сочетайте оба, отвечая на вопросы об основной идее.",
      },
    },
    kz: {
      prompt: "Бұл сұхбаттың негізгі мазмұны қандай?",
      options: [
        { id: "opt-a", text: "Мөлшерлеменің көтерілуінің қарапайым үй шаруашылықтарына әсері және туындайтын саяси дилемма" },
        { id: "opt-b", text: "Қор нарығының болжамы" },
        { id: "opt-c", text: "Жаңа несие өнімін таныстыру" },
        { id: "opt-d", text: "Валюта нарығының ауытқуы" },
      ],
      explanation: {
        whereInRecording: 'Жүргізушінің бастапқы сұрағы мен экономисттің "물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황" деп аяқталатын толық жауабы бүкіл сұхбатты шеңберлейді.',
        keywords: "금리 인상이 서민 경제에 미치는 영향, 상충하는 목표",
        whyCorrect: "Сұхбат мөлшерлеменің көтерілуінің қарапайым үй шаруашылықтарына әсерінен басталып, содан туындайтын саяси дилеммамен аяқталады — сұхбаттың толық желісі.",
        whyIncorrect: [
          { optionId: "opt-b", reason: "Қор нарығы сұхбатта мүлдем аталмайды." },
          { optionId: "opt-c", reason: "Нақты несие өнімі таныстырылмайды; несиелер тек мөлшерлемеге әсер ететін санат ретінде жалпы талқыланады." },
          { optionId: "opt-d", reason: "Валюта нарығы сұхбатта мүлдем аталмайды." },
        ],
        vocabulary: [
          { term: "서민 경제", translation: "қарапайым халықтың/үй шаруашылықтарының экономикасы" },
          { term: "상충하다", translation: "қайшы келу, шиеленісте болу" },
        ],
        grammarPattern: "'-라는 상충하는 목표 사이에서 균형을 찾다' — '___ деп аталатын қайшы мақсаттар арасында тепе-теңдік табу' дегенді білдіретін тығыз ресми зат есім тіркесі.",
        strategy: "Сарапшы сұхбаттарында жүргізушінің бастапқы сұрағы тақырыпты белгілейді, ал сарапшының соңғы сөйлемі әдетте астарлы қайшылықты ашады — негізгі ой сұрақтарына жауап беру үшін екеуін де біріктіріңіз.",
      },
    },
  },
};

const l6EconomyQ2: QuestionSpec = {
  id: "topik6-economy-interview-1-q2",
  recordingId: "topik6-economy-interview-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "relationship",
  content: {
    en: {
      prompt: "How are households with variable-rate loans affected by rate hikes?",
      options: [
        { id: "opt-a", text: "Not affected at all" },
        { id: "opt-b", text: "They are hit immediately" },
        { id: "opt-c", text: "They actually benefit" },
        { id: "opt-d", text: "They are only affected years later" },
      ],
      explanation: {
        whereInRecording: '"특히 변동 금리로 대출을 받은 가구는 즉각적인 타격을 받게 되죠" singles out this group specifically.',
        keywords: "변동 금리로 대출을 받은 가구, 즉각적인 타격",
        whyCorrect: "The economist specifically highlights variable-rate borrowers as receiving an '즉각적인 타격' (immediate hit) — the most direct and fastest impact described.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "This is the opposite of '즉각적인 타격' — the economist singles out this group as MORE affected, not unaffected." },
          { optionId: "opt-c", reason: "Higher interest costs are a burden, not a benefit — nothing suggests these households gain from rate hikes." },
          { optionId: "opt-d", reason: "'즉각적인' (immediate) is the opposite of a delayed, years-later effect." },
        ],
        vocabulary: [
          { term: "변동 금리", translation: "variable/floating interest rate" },
          { term: "즉각적", translation: "immediate" },
        ],
        grammarPattern: "'특히' singles out a specific case for extra emphasis within a broader statement — a common device for pointing to the group a detail question will ask about.",
        strategy: "When a speaker says '특히' (especially/in particular), that's almost always flagging the exact detail a comprehension question will later target.",
      },
    },
    ru: {
      prompt: "Как повышение ставок влияет на домохозяйства с плавающей ставкой по кредиту?",
      options: [
        { id: "opt-a", text: "Совсем не влияет" },
        { id: "opt-b", text: "Их затрагивает немедленно" },
        { id: "opt-c", text: "Они, наоборот, выигрывают" },
        { id: "opt-d", text: "На них влияет только спустя годы" },
      ],
      explanation: {
        whereInRecording: '"특히 변동 금리로 대출을 받은 가구는 즉각적인 타격을 받게 되죠" особо выделяет эту группу.',
        keywords: "변동 금리로 대출을 받은 가구, 즉각적인 타격",
        whyCorrect: "Экономист особо подчёркивает, что заёмщики с плавающей ставкой получают '즉각적인 타격' (немедленный удар) — самое прямое и быстрое из описанных воздействий.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Это противоположно '즉각적인 타격' — экономист выделяет эту группу как ЗАТРОНУТУЮ БОЛЬШЕ, а не незатронутую." },
          { optionId: "opt-c", reason: "Более высокие процентные расходы — это бремя, а не выгода; ничто не указывает на то, что эти домохозяйства выигрывают от повышения ставок." },
          { optionId: "opt-d", reason: "'즉각적인' (немедленный) — противоположность отложенному, спустя годы эффекту." },
        ],
        vocabulary: [
          { term: "변동 금리", translation: "плавающая процентная ставка" },
          { term: "즉각적", translation: "немедленный" },
        ],
        grammarPattern: "'특히' выделяет конкретный случай для дополнительного акцента внутри более широкого утверждения — распространённый приём, указывающий на группу, о которой позже спросит вопрос на деталь.",
        strategy: "Когда говорящий произносит '특히' (особенно/в частности), это почти всегда сигнал о точной детали, на которую позже нацелен вопрос на понимание.",
      },
    },
    kz: {
      prompt: "Мөлшерлеме көтерілуі айнымалы пайызбен несие алған үй шаруашылықтарына қалай әсер етеді?",
      options: [
        { id: "opt-a", text: "Мүлдем әсер етпейді" },
        { id: "opt-b", text: "Оларға бірден әсер етеді" },
        { id: "opt-c", text: "Керісінше, олар ұтады" },
        { id: "opt-d", text: "Тек бірнеше жылдан кейін ғана әсер етеді" },
      ],
      explanation: {
        whereInRecording: '"특히 변동 금리로 대출을 받은 가구는 즉각적인 타격을 받게 되죠" осы топты арнайы бөліп көрсетеді.',
        keywords: "변동 금리로 대출을 받은 가구, 즉각적인 타격",
        whyCorrect: "Экономист айнымалы пайызбен несие алушыларды '즉각적인 타격' (дереу соққы) алатынын арнайы атап көрсетеді — сипатталған ең тікелей және жылдам әсер.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Бұл '즉각적인 타격' дегенге қарама-қарсы — экономист бұл топты әсер етпейтін емес, КӨБІРЕК ӘСЕР ЕТЕТІН топ ретінде бөліп көрсетеді." },
          { optionId: "opt-c", reason: "Жоғары пайыздық шығын — пайда емес, ауыртпалық; бұл үй шаруашылықтарының мөлшерлеме көтерілуінен ұтатыны туралы ештеңе жоқ." },
          { optionId: "opt-d", reason: "'즉각적인' (дереу) кейінге қалдырылған, жылдар өткен соң болатын әсерге қарама-қарсы." },
        ],
        vocabulary: [
          { term: "변동 금리", translation: "айнымалы пайыздық мөлшерлеме" },
          { term: "즉각적", translation: "дереу" },
        ],
        grammarPattern: "'특히' кең мәлімдеме ішінде нақты жағдайды қосымша екпінмен бөліп көрсетеді — детал сұрағы кейін нысанаға алатын топты көрсетудің кең тараған тәсілі.",
        strategy: "Сөйлеуші '특히' (әсіресе/атап айтқанда) десе, бұл әрдайым дерлік түсіну сұрағы кейін нысанаға алатын нақты детальді белгілейді.",
      },
    },
  },
};

const l6EconomyQ3: QuestionSpec = {
  id: "topik6-economy-interview-1-q3",
  recordingId: "topik6-economy-interview-1",
  questionNumber: 3,
  type: "multi-select",
  correctOptionIds: ["opt-a", "opt-b"],
  difficulty: "hard",
  skillTag: "statementMatch",
  content: {
    en: {
      prompt: "Select every statement that matches the interview.",
      options: [
        { id: "opt-a", text: "Raising rates is a measure to curb rising prices." },
        { id: "opt-b", text: "Policy authorities must balance price stability against easing household burden." },
        { id: "opt-c", text: "Raising rates increases households' spending power." },
        { id: "opt-d", text: "Only fixed-rate borrowers are affected." },
      ],
      explanation: {
        whereInRecording: '"금리 인상은 물가 상승을 억제하기 위한 불가피한 조치이기도 합니다" and "정책 당국은 물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황입니다" confirm both true statements.',
        keywords: "물가 상승을 억제하기 위한 조치, 균형을 찾아야 하는 상황",
        whyCorrect: "Rate hikes as an inflation-curbing measure and the policy balancing act are both stated directly, matching options a and b.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "The interview says spending power DECREASES ('소비 여력이 줄어듭니다') due to higher rates — the opposite of increasing." },
          { optionId: "opt-d", reason: "The economist specifically highlights variable-rate borrowers as most affected, not fixed-rate borrowers exclusively." },
        ],
        vocabulary: [
          { term: "억제하다", translation: "to curb, suppress" },
          { term: "정책 당국", translation: "policy authorities" },
        ],
        grammarPattern: "'-기 위한' means '(a measure) for the purpose of ___', linking an action to its intended goal.",
        strategy: "In dense expert interviews, isolate each clause between commas or periods and check it independently against the options — density makes it easy to conflate two separate claims.",
      },
    },
    ru: {
      prompt: "Выберите все утверждения, которые соответствуют интервью.",
      options: [
        { id: "opt-a", text: "Повышение ставок — мера сдерживания роста цен." },
        { id: "opt-b", text: "Политические власти должны балансировать стабильность цен и облегчение нагрузки на домохозяйства." },
        { id: "opt-c", text: "Повышение ставок увеличивает покупательную способность домохозяйств." },
        { id: "opt-d", text: "Затронуты только заёмщики с фиксированной ставкой." },
      ],
      explanation: {
        whereInRecording: '"금리 인상은 물가 상승을 억제하기 위한 불가피한 조치이기도 합니다" и "정책 당국은 물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황입니다" подтверждают оба верных утверждения.',
        keywords: "물가 상승을 억제하기 위한 조치, 균형을 찾아야 하는 상황",
        whyCorrect: "Повышение ставок как мера сдерживания инфляции и балансирующая роль политики прямо названы, точно соответствуя вариантам a и b.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "В интервью говорится, что покупательная способность СНИЖАЕТСЯ ('소비 여력이 줄어듭니다') из-за более высоких ставок — противоположно увеличению." },
          { optionId: "opt-d", reason: "Экономист особо выделяет заёмщиков с плавающей ставкой как наиболее затронутых, а не исключительно заёмщиков с фиксированной ставкой." },
        ],
        vocabulary: [
          { term: "억제하다", translation: "сдерживать, подавлять" },
          { term: "정책 당국", translation: "политические власти" },
        ],
        grammarPattern: "'-기 위한' означает '(мера) с целью ___', связывая действие с его намеченной целью.",
        strategy: "В насыщенных интервью с экспертами разделяйте каждую часть между запятыми/точками и проверяйте её отдельно по вариантам — плотность текста легко приводит к смешению двух разных утверждений.",
      },
    },
    kz: {
      prompt: "Сұхбатқа сәйкес келетін барлық мәлімдемені таңдаңыз.",
      options: [
        { id: "opt-a", text: "Мөлшерлемені көтеру бағаның өсуін тежеу шарасы." },
        { id: "opt-b", text: "Саясат билігі баға тұрақтылығы мен үй шаруашылығының ауыртпалығын жеңілдету арасында тепе-теңдік табуы керек." },
        { id: "opt-c", text: "Мөлшерлемені көтеру үй шаруашылықтарының тұтыну қабілетін арттырады." },
        { id: "opt-d", text: "Тек тұрақты мөлшерлемедегі несие алушылар әсер етеді." },
      ],
      explanation: {
        whereInRecording: '"금리 인상은 물가 상승을 억제하기 위한 불가피한 조치이기도 합니다" және "정책 당국은 물가 안정과 가계 부담 완화라는 상충하는 목표 사이에서 균형을 찾아야 하는 상황입니다" екі дұрыс мәлімдемені де растайды.',
        keywords: "물가 상승을 억제하기 위한 조치, 균형을 찾아야 하는 상황",
        whyCorrect: "Мөлшерлемені көтеру инфляцияны тежеу шарасы ретінде және саясаттың тепе-теңдік табу қажеттілігі тікелей айтылған, a және b нұсқаларына дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-c", reason: "Сұхбатта жоғары мөлшерлемеге байланысты тұтыну қабілеті АЗАЯДЫ ('소비 여력이 줄어듭니다') делінген — бұл артуға қарама-қарсы." },
          { optionId: "opt-d", reason: "Экономист айнымалы мөлшерлемедегі несие алушыларды ең көп әсер етушілер ретінде арнайы атап көрсетеді, тек тұрақты мөлшерлемедегілерді емес." },
        ],
        vocabulary: [
          { term: "억제하다", translation: "тежеу, басу" },
          { term: "정책 당국", translation: "саясат билігі" },
        ],
        grammarPattern: "'-기 위한' '___ мақсатында (шара)' дегенді білдіреді, әрекетті оның мақсатымен байланыстырады.",
        strategy: "Тығыз сарапшы сұхбаттарында үтір/нүкте арасындағы әр сөйлемді бөліп алып, оны нұсқалармен жеке тексеріңіз — тығыздық екі бөлек мәлімдемені шатастыруды жеңілдетеді.",
      },
    },
  },
};

const l6LegalQ1: QuestionSpec = {
  id: "topik6-legal-debate-1-q1",
  recordingId: "topik6-legal-debate-1",
  questionNumber: 1,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "mainIdea",
  content: {
    en: {
      prompt: "What is the topic of this debate?",
      options: [
        { id: "opt-a", text: "The AI development budget" },
        { id: "opt-b", text: "Whether copyright should be recognized for AI-generated works" },
        { id: "opt-c", text: "The schedule for revising copyright law" },
        { id: "opt-d", text: "Establishing a new AI regulatory agency" },
      ],
      explanation: {
        whereInRecording: '"오늘 토론 주제는 인공지능이 생성한 창작물의 저작권 인정 여부입니다" is the moderator\'s explicit topic statement.',
        keywords: "토론 주제는, 저작권 인정 여부",
        whyCorrect: "The moderator directly names the debate topic as whether AI-generated creations should be granted copyright — both sides then argue exactly this question.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "A development budget is never mentioned in the debate." },
          { optionId: "opt-c", reason: "No revision schedule is discussed; the debate is about a legal principle, not a timeline." },
          { optionId: "opt-d", reason: "No new regulatory agency is proposed by either debater." },
        ],
        vocabulary: [
          { term: "창작물", translation: "a creative work" },
          { term: "저작권", translation: "copyright" },
        ],
        grammarPattern: "'-여부' attaches to a noun to mean 'whether or not ___', common in formal statements of a debate question.",
        strategy: "In formal debates, the moderator's opening line stating the '토론 주제' (debate topic) is the single most reliable source for a main-idea question.",
      },
    },
    ru: {
      prompt: "Какова тема этих дебатов?",
      options: [
        { id: "opt-a", text: "Бюджет на разработку ИИ" },
        { id: "opt-b", text: "Должно ли признаваться авторское право на произведения, созданные ИИ" },
        { id: "opt-c", text: "График пересмотра закона об авторском праве" },
        { id: "opt-d", text: "Создание нового регулирующего органа по ИИ" },
      ],
      explanation: {
        whereInRecording: '"오늘 토론 주제는 인공지능이 생성한 창작물의 저작권 인정 여부입니다" — явное заявление модератора о теме.',
        keywords: "토론 주제는, 저작권 인정 여부",
        whyCorrect: "Модератор прямо называет тему дебатов — признавать ли авторское право за произведениями, созданными ИИ — обе стороны затем спорят именно об этом.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Бюджет на разработку в дебатах не упоминается." },
          { optionId: "opt-c", reason: "График пересмотра не обсуждается; дебаты о правовом принципе, а не о сроках." },
          { optionId: "opt-d", reason: "Ни один из участников не предлагает создание нового регулирующего органа." },
        ],
        vocabulary: [
          { term: "창작물", translation: "творческое произведение" },
          { term: "저작권", translation: "авторское право" },
        ],
        grammarPattern: "'-여부' присоединяется к существительному и означает 'является ли ___ или нет', часто встречается в формальной постановке вопроса для дебатов.",
        strategy: "В формальных дебатах вступительная фраза модератора, называющая '토론 주제' (тему дебатов), — самый надёжный источник для вопроса об основной идее.",
      },
    },
    kz: {
      prompt: "Бұл пікірталастың тақырыбы қандай?",
      options: [
        { id: "opt-a", text: "ЖИ әзірлеу бюджеті" },
        { id: "opt-b", text: "ЖИ жасаған шығармаларға авторлық құқық танылуы керек пе" },
        { id: "opt-c", text: "Авторлық құқық заңын қайта қарау кестесі" },
        { id: "opt-d", text: "Жаңа ЖИ реттеуші органын құру" },
      ],
      explanation: {
        whereInRecording: '"오늘 토론 주제는 인공지능이 생성한 창작물의 저작권 인정 여부입니다" — жүргізушінің тақырыпты нақты мәлімдеуі.',
        keywords: "토론 주제는, 저작권 인정 여부",
        whyCorrect: "Жүргізуші пікірталас тақырыбын ЖИ жасаған туындыларға авторлық құқық берілуі керек пе деп тікелей атайды — екі жақ та дәл осы сұрақты талқылайды.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Әзірлеу бюджеті пікірталаста мүлдем аталмайды." },
          { optionId: "opt-c", reason: "Қайта қарау кестесі талқыланбайды; пікірталас мерзім туралы емес, құқықтық қағида туралы." },
          { optionId: "opt-d", reason: "Ешбір пікірсайысшы жаңа реттеуші орган құруды ұсынбайды." },
        ],
        vocabulary: [
          { term: "창작물", translation: "шығармашылық туынды" },
          { term: "저작권", translation: "авторлық құқық" },
        ],
        grammarPattern: "'-여부' зат есімге жалғанып '___ бола ма, жоқ па' дегенді білдіреді, пікірталас сұрағын ресми мәлімдеуде жиі кездеседі.",
        strategy: "Ресми пікірталастарда жүргізушінің '토론 주제' (пікірталас тақырыбын) атайтын бастапқы жолы негізгі ой сұрағы үшін ең сенімді дереккөз болып табылады.",
      },
    },
  },
};

const l6LegalQ2: QuestionSpec = {
  id: "topik6-legal-debate-1-q2",
  recordingId: "topik6-legal-debate-1",
  questionNumber: 2,
  type: "multiple-choice",
  correctOptionIds: ["opt-b"],
  difficulty: "hard",
  skillTag: "relationship",
  content: {
    en: {
      prompt: "What is the basis of the opposing debater's argument?",
      options: [
        { id: "opt-a", text: "AI has no creativity" },
        { id: "opt-b", text: "Current law presupposes human creative activity" },
        { id: "opt-c", text: "AI output is already copyrighted" },
        { id: "opt-d", text: "Copyright law does not need revision" },
      ],
      explanation: {
        whereInRecording: '"현행법상 저작권은 인간의 창작 행위를 전제로 하기 때문에" is the opposing debater\'s stated reasoning.',
        keywords: "현행법상, 인간의 창작 행위를 전제로",
        whyCorrect: "The opposing debater grounds their argument in the fact that current law is premised on human creative activity, directly matching option b.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "The debater never claims AI lacks creativity — their argument is about the legal premise, not AI's creative capacity." },
          { optionId: "opt-c", reason: "The debater never says AI output is already copyrighted — the whole debate is about whether it SHOULD be." },
          { optionId: "opt-d", reason: "The debater's concern (applying current law directly could shake its foundation) implies law is inadequate for this case, not that no revision is needed at all." },
        ],
        vocabulary: [
          { term: "현행법", translation: "current/existing law" },
          { term: "전제로 하다", translation: "to presuppose, be premised on" },
        ],
        grammarPattern: "'-기 때문에' explicitly marks the reason clause preceding a conclusion — central to identifying an argument's basis.",
        strategy: "In formal debates, each side's argument usually has one clear '때문에' or '-어서/아서' reason clause — isolate that clause specifically when asked for a debater's basis.",
      },
    },
    ru: {
      prompt: "На чём основан аргумент противоположной стороны?",
      options: [
        { id: "opt-a", text: "У ИИ нет творческих способностей" },
        { id: "opt-b", text: "Действующий закон предполагает человеческую творческую деятельность" },
        { id: "opt-c", text: "Результаты работы ИИ уже защищены авторским правом" },
        { id: "opt-d", text: "Закон об авторском праве не нуждается в пересмотре" },
      ],
      explanation: {
        whereInRecording: '"현행법상 저작권은 인간의 창작 행위를 전제로 하기 때문에" — заявленное обоснование противоположной стороны.',
        keywords: "현행법상, 인간의 창작 행위를 전제로",
        whyCorrect: "Противоположная сторона обосновывает аргумент тем, что действующий закон построен на предпосылке человеческой творческой деятельности — это точно соответствует варианту b.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Участник никогда не утверждает, что у ИИ нет творческих способностей — его аргумент о правовой предпосылке, а не о творческих возможностях ИИ." },
          { optionId: "opt-c", reason: "Участник никогда не говорит, что результаты ИИ уже защищены авторским правом — весь спор о том, ДОЛЖНЫ ЛИ они быть защищены." },
          { optionId: "opt-d", reason: "Опасение участника (прямое применение действующего закона может пошатнуть его основу) подразумевает неадекватность закона для этого случая, а не то, что пересмотр вообще не нужен." },
        ],
        vocabulary: [
          { term: "현행법", translation: "действующий закон" },
          { term: "전제로 하다", translation: "предполагать, основываться на предпосылке" },
        ],
        grammarPattern: "'-기 때문에' явно обозначает причинную часть перед выводом — ключевой элемент для определения основы аргумента.",
        strategy: "В формальных дебатах аргумент каждой стороны обычно имеет одну чёткую причинную часть с '때문에' или '-어서/아서' — выделяйте именно её, когда спрашивают об основании аргумента участника.",
      },
    },
    kz: {
      prompt: "Қарсы жақтың дәлелі неге негізделген?",
      options: [
        { id: "opt-a", text: "ЖИ-де шығармашылық жоқ" },
        { id: "opt-b", text: "Қолданыстағы заң адамның шығармашылық әрекетін алғышарт етеді" },
        { id: "opt-c", text: "ЖИ өнімі қазірдің өзінде авторлық құқықпен қорғалған" },
        { id: "opt-d", text: "Авторлық құқық заңын қайта қарау қажет емес" },
      ],
      explanation: {
        whereInRecording: '"현행법상 저작권은 인간의 창작 행위를 전제로 하기 때문에" — қарсы жақ пікірсайысшысының айтқан негіздемесі.',
        keywords: "현행법상, 인간의 창작 행위를 전제로",
        whyCorrect: "Қарсы жақ пікірсайысшысы дәлелін қолданыстағы заңның адамның шығармашылық әрекетін алғышарт ететініне негіздейді, бұл b нұсқасына дәл сәйкес келеді.",
        whyIncorrect: [
          { optionId: "opt-a", reason: "Пікірсайысшы ЖИ-де шығармашылық жоқ деп ешқашан айтпайды — оның дәлелі құқықтық алғышарт туралы, ЖИ-дың шығармашылық қабілеті туралы емес." },
          { optionId: "opt-c", reason: "Пікірсайысшы ЖИ өнімі қазірдің өзінде авторлық құқықпен қорғалған деп ешқашан айтпайды — бүкіл пікірталас ол ҚОРҒАЛУЫ КЕРЕК ПЕ деген туралы." },
          { optionId: "opt-d", reason: "Пікірсайысшының алаңдаушылығы (қолданыстағы заңды тікелей қолдану оның негізін шайқалтуы мүмкін) заңның бұл жағдайға жеткіліксіз екенін білдіреді, мүлдем қайта қарау қажет емес дегенді емес." },
        ],
        vocabulary: [
          { term: "현행법", translation: "қолданыстағы заң" },
          { term: "전제로 하다", translation: "алғышарт ету, негіздеу" },
        ],
        grammarPattern: "'-기 때문에' қорытындының алдындағы себеп бөлігін нақты белгілейді — пікірсайысшының негіздемесін анықтаудың негізгі элементі.",
        strategy: "Ресми пікірталастарда әр жақтың дәлелінде әдетте бір нақты '때문에' немесе '-어서/아서' себеп бөлігі болады — пікірсайысшының негіздемесі сұралғанда дәл сол бөлікті бөліп алыңыз.",
      },
    },
  },
};

const l6LegalQ3: QuestionSpec = {
  id: "topik6-legal-debate-1-q3",
  recordingId: "topik6-legal-debate-1",
  questionNumber: 3,
  type: "true-false",
  correctOptionIds: ["opt-false"],
  difficulty: "hard",
  skillTag: "inference",
  content: {
    en: {
      prompt: "The moderator states that this issue has already been resolved.",
      options: [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ],
      explanation: {
        whereInRecording: '"결국 이 문제는 기술과 법이 함께 풀어야 할 과제로 보입니다" is the moderator\'s closing remark.',
        keywords: "함께 풀어야 할 과제로 보입니다",
        whyCorrect: "The moderator explicitly frames the issue as a '과제' (task/challenge) still needing to be solved by both technology and law together — the opposite of already resolved.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "This contradicts the moderator's closing line, which frames the issue as something still to be solved, not something already settled." },
        ],
        vocabulary: [
          { term: "과제", translation: "task, challenge to be solved" },
          { term: "풀다", translation: "to solve, resolve" },
        ],
        grammarPattern: "'-아/어야 할 과제로 보이다' means 'to appear as a task that must be ___', a formal way to close on an open, unresolved issue.",
        strategy: "A debate moderator's closing line almost never declares a winner or a resolved answer — it typically restates the issue as still open, which is exactly what true/false questions about 'is this settled?' will test.",
      },
    },
    ru: {
      prompt: "Модератор заявляет, что этот вопрос уже решён.",
      options: [
        { id: "opt-true", text: "Верно" },
        { id: "opt-false", text: "Неверно" },
      ],
      explanation: {
        whereInRecording: '"결국 이 문제는 기술과 법이 함께 풀어야 할 과제로 보입니다" — заключительная реплика модератора.',
        keywords: "함께 풀어야 할 과제로 보입니다",
        whyCorrect: "Модератор прямо формулирует вопрос как '과제' (задачу), которую ещё предстоит решить технологиям и закону вместе — противоположность уже решённому вопросу.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Это противоречит заключительной реплике модератора, которая представляет вопрос как ещё не решённый, а не как уже урегулированный." },
        ],
        vocabulary: [
          { term: "과제", translation: "задача, вызов, требующий решения" },
          { term: "풀다", translation: "решать, разрешать" },
        ],
        grammarPattern: "'-아/어야 할 과제로 보이다' означает 'выглядеть как задача, которую нужно ___', формальный способ завершить обсуждение открытого, нерешённого вопроса.",
        strategy: "Заключительная реплика модератора дебатов почти никогда не объявляет победителя или решённый ответ — обычно она вновь формулирует вопрос как всё ещё открытый, что именно и проверяют вопросы верно/неверно о том, 'решён ли вопрос'.",
      },
    },
    kz: {
      prompt: "Жүргізуші бұл мәселе қазірдің өзінде шешілді деп мәлімдейді.",
      options: [
        { id: "opt-true", text: "Дұрыс" },
        { id: "opt-false", text: "Бұрыс" },
      ],
      explanation: {
        whereInRecording: '"결국 이 문제는 기술과 법이 함께 풀어야 할 과제로 보입니다" — жүргізушінің қорытынды сөзі.',
        keywords: "함께 풀어야 할 과제로 보입니다",
        whyCorrect: "Жүргізуші мәселені технология мен заң бірге шешуі керек '과제' (міндет) ретінде тікелей көрсетеді — бұл қазірдің өзінде шешілгенге қарама-қарсы.",
        whyIncorrect: [
          { optionId: "opt-true", reason: "Бұл жүргізушінің мәселені шешілген емес, әлі шешілуі керек нәрсе ретінде көрсететін қорытынды сөзіне қайшы келеді." },
        ],
        vocabulary: [
          { term: "과제", translation: "шешілуі керек міндет" },
          { term: "풀다", translation: "шешу" },
        ],
        grammarPattern: "'-아/어야 할 과제로 보이다' '___ керек міндет сияқты көрінеді' дегенді білдіреді, ашық, шешілмеген мәселені қорытындылаудың ресми тәсілі.",
        strategy: "Пікірталас жүргізушісінің қорытынды сөзі жеңімпазды немесе шешілген жауапты жариялайды дерлік ешқашан — ол әдетте мәселені әлі ашық деп қайта тұжырымдайды, бұл дәл 'бұл шешілді ме?' деген дұрыс/бұрыс сұрақтары тексеретін нәрсе.",
      },
    },
  },
};

const L6_ECONOMY_INTERVIEW_QUESTIONS = buildRecordingQuestions(l6EconomyQ1, l6EconomyQ2, l6EconomyQ3);
const L6_LEGAL_DEBATE_QUESTIONS = buildRecordingQuestions(l6LegalQ1, l6LegalQ2, l6LegalQ3);

// ---------------------------------------------------------------------------
// Assembled bank
// ---------------------------------------------------------------------------

export const TOPIK_LISTENING_CONTENT_BANK: Record<TopikLevel, TopikListeningRecording[]> = {
  "1": [L1_BUS_STOP, L1_CAFE_ORDER],
  "2": [L2_PHONE_PLANS, L2_WEATHER_FORECAST],
  "3": [L3_HOBBY_INTERVIEW, L3_LIBRARY_NOTICE],
  "4": [L4_MEETING_DISCUSSION, L4_ENVIRONMENT_NEWS],
  "5": [L5_AGING_LECTURE, L5_AI_DOCUMENTARY],
  "6": [L6_ECONOMY_INTERVIEW, L6_LEGAL_DEBATE],
};

export const TOPIK_LISTENING_QUESTIONS_BY_RECORDING: Record<
  string,
  Record<FeedbackLanguage, TopikListeningQuestion[]>
> = {
  [L1_BUS_STOP.id]: L1_BUS_STOP_QUESTIONS,
  [L1_CAFE_ORDER.id]: L1_CAFE_ORDER_QUESTIONS,
  [L2_PHONE_PLANS.id]: L2_PHONE_PLANS_QUESTIONS,
  [L2_WEATHER_FORECAST.id]: L2_WEATHER_FORECAST_QUESTIONS,
  [L3_HOBBY_INTERVIEW.id]: L3_HOBBY_INTERVIEW_QUESTIONS,
  [L3_LIBRARY_NOTICE.id]: L3_LIBRARY_NOTICE_QUESTIONS,
  [L4_MEETING_DISCUSSION.id]: L4_MEETING_DISCUSSION_QUESTIONS,
  [L4_ENVIRONMENT_NEWS.id]: L4_ENVIRONMENT_NEWS_QUESTIONS,
  [L5_AGING_LECTURE.id]: L5_AGING_LECTURE_QUESTIONS,
  [L5_AI_DOCUMENTARY.id]: L5_AI_DOCUMENTARY_QUESTIONS,
  [L6_ECONOMY_INTERVIEW.id]: L6_ECONOMY_INTERVIEW_QUESTIONS,
  [L6_LEGAL_DEBATE.id]: L6_LEGAL_DEBATE_QUESTIONS,
};
