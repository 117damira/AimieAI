import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import type {
  CompletedTurn,
  SpeakingExaminerReport,
  SpeakingGrammarMistake,
  TurnFeedback,
} from "@/types/speaking-evaluation";

/**
 * Offline fallback DELF speaking evaluator, used by the API routes when no
 * ANTHROPIC_API_KEY is configured (see lib/ai/speaking-evaluator.ts for the
 * real Claude path, which returns the same TurnFeedback/SpeakingExaminerReport
 * shapes). analyzeTurn()/localizeTurnFeedback() evaluate one turn at a time;
 * synthesizeReportFromTurns() aggregates the real accumulated CompletedTurn
 * data (actual transcripts, scores, grammar errors) into a final report.
 *
 * Exam prompts and the student's own answers stay in French; only this
 * AI-generated feedback text is translated.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

interface GrammarErrorTemplate {
  id: string;
  original: string;
  correction: string;
  category: SpeakingGrammarMistake["category"];
  explanation: TranslatedText;
  /** A fresh, correct French example demonstrating the rule. */
  betterExample: string;
}

interface MockSpeakingLevelProfile {
  grammarPool: GrammarErrorTemplate[];
  pronunciationNotes: TranslatedText[];
  fluencyNotes: TranslatedText[];
  vocabularyRangeNotes: TranslatedText[];
  taskCompletionNotes: TranslatedText[];
  coherenceNotes: TranslatedText[];
  strengths: TranslatedText[];
  weaknesses: TranslatedText[];
  improvementTips: TranslatedText[];
  baseScore: number;
}

/** Generic, category-keyed "how to avoid this again" tips, reused across
 * every matching mistake rather than hand-authored per template. */
const HOW_TO_AVOID_BY_CATEGORY: Record<SpeakingGrammarMistake["category"], TranslatedText> = {
  verb: {
    en: "Drill this verb's conjugation pattern out loud a few times before your next practice session.",
    ru: "Перед следующей тренировкой несколько раз проговорите вслух спряжение этого глагола.",
    kz: "Келесі жаттығуға дейін осы етістіктің жіктелу үлгісін бірнеше рет дауыстап қайталаңыз.",
  },
  agreement: {
    en: "Pause briefly before nouns to check gender/number agreement — it becomes automatic with practice.",
    ru: "Делайте небольшую паузу перед существительными, чтобы проверить согласование по роду/числу — с практикой это станет автоматическим.",
    kz: "Зат есімнің алдында аздап кідіріп, тек/сан келісімін тексеріңіз — жаттығу арқылы бұл автоматты болады.",
  },
  "sentence-structure": {
    en: "Mentally say the full sentence slowly before speaking it aloud, checking the word order.",
    ru: "Перед тем как сказать вслух, медленно проговорите предложение целиком про себя, проверяя порядок слов.",
    kz: "Дауыстап айтпас бұрын, сөз тәртібін тексеріп, сөйлемді ішіңізден баяу қайталаңыз.",
  },
  other: {
    en: "Note this pattern down and review it before your next speaking practice.",
    ru: "Запишите эту особенность и повторите её перед следующей устной практикой.",
    kz: "Осы үлгіні жазып алып, келесі ауызша жаттығу алдында қайталаңыз.",
  },
};

function buildHowToFix(correction: string, language: FeedbackLanguage): string {
  const templates: TranslatedText = {
    en: `Use "${correction}" instead.`,
    ru: `Используйте «${correction}» вместо этого.`,
    kz: `Оның орнына «${correction}» қолданыңыз.`,
  };
  return templates[language];
}

const FILLER_WORDS = ["euh", "du coup", "genre", "en fait", "quoi", "voilà", "bah"];

const MOCK_SPEAKING_PROFILES: Record<DelfLevel, MockSpeakingLevelProfile> = {
  A1: {
    grammarPool: [
      {
        id: "a1s-etre-age",
        original: "je suis vingt ans",
        correction: "j'ai vingt ans",
        category: "verb",
        explanation: {
          en: "Age is expressed with \"avoir\" (avoir + age), not \"être\".",
          ru: "Возраст выражается с помощью глагола «avoir» (avoir + возраст), а не «être».",
          kz: "Жас мөлшері «avoir» етістігімен беріледі (avoir + жас), «être» емес.",
        },
        betterExample: "J'ai vingt ans et mon frère a dix-huit ans.",
      },
      {
        id: "a1s-gender-article",
        original: "j'habite dans un maison",
        correction: "j'habite dans une maison",
        category: "agreement",
        explanation: {
          en: "\"Maison\" is feminine, so it takes \"une\", not \"un\".",
          ru: "«Maison» — слово женского рода, поэтому употребляется с «une», а не «un».",
          kz: "«Maison» — әйел тегіндегі сөз, сондықтан «une» қолданылады, «un» емес.",
        },
        betterExample: "J'habite dans une maison avec un grand jardin.",
      },
      {
        id: "a1s-infinitive",
        original: "je aimer le sport",
        correction: "j'aime le sport",
        category: "sentence-structure",
        explanation: {
          en: "The verb must be conjugated (\"j'aime\"), not left in the infinitive.",
          ru: "Глагол нужно спрягать («j'aime»), а не оставлять в инфинитиве.",
          kz: "Етістік тұйық түрде қалмай, жіктелуі керек («j'aime»).",
        },
        betterExample: "J'aime le sport et je joue au football le week-end.",
      },
    ],
    pronunciationNotes: [
      {
        en: "Pronunciation is understandable overall, with a few vowel sounds that need refinement.",
        ru: "Произношение в целом понятное, но некоторые гласные звуки требуют доработки.",
        kz: "Айтылым жалпы түсінікті, бірақ кейбір дауысты дыбыстарды жетілдіру қажет.",
      },
      {
        en: "Some final consonants are dropped, which is common at this level.",
        ru: "Некоторые конечные согласные не произносятся, что типично для этого уровня.",
        kz: "Кейбір соңғы дауыссыз дыбыстар айтылмайды, бұл бұл деңгейге тән.",
      },
    ],
    fluencyNotes: [
      {
        en: "Speech is slow but steady, with pauses to search for basic words.",
        ru: "Речь медленная, но ровная, с паузами для поиска простых слов.",
        kz: "Сөйлеу баяу, бірақ тұрақты, қарапайым сөздерді іздеу үшін кідірістер бар.",
      },
      {
        en: "Short, simple sentences are delivered confidently.",
        ru: "Короткие простые предложения произносятся уверенно.",
        kz: "Қысқа, қарапайым сөйлемдер сенімді түрде айтылады.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Vocabulary is limited to common, high-frequency words — appropriate for A1.",
        ru: "Словарный запас ограничен распространёнными словами — уместно для уровня A1.",
        kz: "Сөздік қор жиі қолданылатын сөздермен шектелген — A1 деңгейіне сай.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Addressed the question directly with the basic information requested.",
        ru: "Прямо ответил(а) на вопрос, дав запрошенную базовую информацию.",
        kz: "Сұралған негізгі ақпаратты беріп, сұраққа тікелей жауап берді.",
      },
      {
        en: "Covered the main point of the question, though a couple of details were missing.",
        ru: "Раскрыл(а) основную суть вопроса, хотя некоторые детали отсутствовали.",
        kz: "Сұрақтың негізгі мәнін ашты, бірақ кейбір детальдар жетіспеді.",
      },
    ],
    coherenceNotes: [
      {
        en: "Ideas were presented in a simple, easy-to-follow order.",
        ru: "Мысли были изложены в простом, легко воспринимаемом порядке.",
        kz: "Ойлар қарапайым, оңай түсінілетін ретпен айтылды.",
      },
      {
        en: "The answer stayed on one clear idea without wandering off topic.",
        ru: "Ответ оставался в рамках одной чёткой мысли, не отклоняясь от темы.",
        kz: "Жауап тақырыптан ауытқымай, бір анық ойға негізделді.",
      },
    ],
    strengths: [
      {
        en: "Answers personal questions clearly and directly",
        ru: "Ясно и прямо отвечает на личные вопросы",
        kz: "Жеке сұрақтарға анық әрі тікелей жауап береді",
      },
      {
        en: "Stays on topic throughout each answer",
        ru: "Не отклоняется от темы на протяжении всего ответа",
        kz: "Жауап бойы тақырыптан ауытқымайды",
      },
      {
        en: "Good use of everyday vocabulary",
        ru: "Хорошее использование повседневной лексики",
        kz: "Күнделікті лексиканы жақсы қолданады",
      },
      {
        en: "Completes the simple role-play task",
        ru: "Успешно выполняет простое ролевое задание",
        kz: "Қарапайым рөлдік тапсырманы сәтті орындайды",
      },
    ],
    weaknesses: [
      {
        en: "A few basic agreement and conjugation mistakes",
        ru: "Несколько базовых ошибок в согласовании и спряжении",
        kz: "Бірнеше қарапайым келісім және жіктеу қателері бар",
      },
      {
        en: "Limited ability to elaborate beyond the direct question",
        ru: "Ограниченная способность развивать ответ за пределы прямого вопроса",
        kz: "Тікелей сұрақтан тыс жауапты дамыту мүмкіндігі шектеулі",
      },
      {
        en: "Noticeable filler words while searching for vocabulary",
        ru: "Заметны слова-паразиты во время поиска нужных слов",
        kz: "Сөз іздеу кезінде толықтырғыш сөздер байқалады",
      },
    ],
    improvementTips: [
      {
        en: "Practice conjugating common verbs in the present tense",
        ru: "Потренируйте спряжение распространённых глаголов в настоящем времени",
        kz: "Жиі қолданылатын етістіктерді осы шақта жіктеуді жаттығыңыз",
      },
      {
        en: "Review gender for common nouns (le/la, un/une)",
        ru: "Повторите род для распространённых существительных (le/la, un/une)",
        kz: "Жиі кездесетін зат есімдердің тегін қайталаңыз (le/la, un/une)",
      },
      {
        en: "Try short pauses instead of filler words like \"euh\"",
        ru: "Используйте короткие паузы вместо слов-паразитов вроде «euh»",
        kz: "«Euh» сияқты толықтырғыш сөздердің орнына қысқа кідірістерді қолданып көріңіз",
      },
      {
        en: "Add one extra detail to each answer to sound more natural",
        ru: "Добавляйте одну дополнительную деталь к каждому ответу для более естественного звучания",
        kz: "Табиғи естілу үшін әр жауапқа бір қосымша деталь қосыңыз",
      },
    ],
    baseScore: 17,
  },
  A2: {
    grammarPool: [
      {
        id: "a2s-passe-compose-aux",
        original: "j'ai allé à la piscine",
        correction: "je suis allé(e) à la piscine",
        category: "verb",
        explanation: {
          en: "\"Aller\" takes \"être\" as its auxiliary in the passé composé, not \"avoir\".",
          ru: "Глагол «aller» в passé composé спрягается с «être», а не с «avoir».",
          kz: "«Aller» етістігі passé composé-де «être» көмекші етістігімен тіркеседі, «avoir» емес.",
        },
        betterExample: "Hier, je suis allé(e) au cinéma avec des amis.",
      },
      {
        id: "a2s-preposition",
        original: "je pense de sortir ce soir",
        correction: "je pense sortir ce soir",
        category: "other",
        explanation: {
          en: "\"Penser\" + infinitive doesn't take \"de\" when expressing an intention.",
          ru: "«Penser» + инфинитив не требует предлога «de» при выражении намерения.",
          kz: "Ниетті білдіргенде «penser» + тұйық етістік «de» септеулігін қажет етпейді.",
        },
        betterExample: "Je pense sortir ce soir avec ma sœur.",
      },
      {
        id: "a2s-agreement-participle",
        original: "elle est allé au marché",
        correction: "elle est allée au marché",
        category: "agreement",
        explanation: {
          en: "With \"être\", the past participle agrees with the subject: \"allée\" for a feminine subject.",
          ru: "С «être» причастие прошедшего времени согласуется с подлежащим: «allée» для женского рода.",
          kz: "«Être»-мен есімше бастауышпен келіседі: әйелдік тегі үшін «allée».",
        },
        betterExample: "Elle est allée au marché ce matin.",
      },
    ],
    pronunciationNotes: [
      {
        en: "Pronunciation is clear enough to follow easily, with occasional stress on the wrong syllable.",
        ru: "Произношение достаточно чёткое для лёгкого понимания, иногда ударение падает не туда.",
        kz: "Айтылым жеңіл түсінуге жеткілікті анық, кейде екпін дұрыс емес буынға түседі.",
      },
      {
        en: "Nasal vowels are mostly accurate.",
        ru: "Носовые гласные в основном произносятся правильно.",
        kz: "Мұрын дауыстылары негізінен дұрыс айтылады.",
      },
    ],
    fluencyNotes: [
      {
        en: "Maintains a steady pace with only brief hesitations.",
        ru: "Сохраняет ровный темп речи с лишь краткими заминками.",
        kz: "Тек қысқа кідірістермен тұрақты қарқынды сақтайды.",
      },
      {
        en: "Can link two or three sentences together without long pauses.",
        ru: "Может связать два-три предложения без долгих пауз.",
        kz: "Ұзақ кідіріссіз екі-үш сөйлемді байланыстыра алады.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Vocabulary covers everyday topics well, with occasional repetition.",
        ru: "Лексика хорошо покрывает повседневные темы, с отдельными повторами.",
        kz: "Лексика күнделікті тақырыптарды жақсы қамтиды, кейде қайталанады.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Answered the question fully and added relevant supporting detail.",
        ru: "Полностью ответил(а) на вопрос и добавил(а) уместные дополнительные детали.",
        kz: "Сұраққа толық жауап беріп, орынды қосымша детальдар қосты.",
      },
      {
        en: "Addressed the main question, but the supporting detail was a little thin.",
        ru: "Ответил(а) на основной вопрос, но дополнительные детали были довольно скудными.",
        kz: "Негізгі сұраққа жауап берді, бірақ қосымша детальдар аздау болды.",
      },
    ],
    coherenceNotes: [
      {
        en: "The answer moved logically from one idea to the next.",
        ru: "Ответ логично переходил от одной мысли к другой.",
        kz: "Жауап бір ойдан екінші ойға логикалық түрде өтті.",
      },
      {
        en: "Ideas were connected with simple linking words, keeping the flow clear.",
        ru: "Мысли были связаны простыми связующими словами, что сохраняло ясность изложения.",
        kz: "Ойлар қарапайым жалғаулық сөздермен байланысып, түсінікті болды.",
      },
    ],
    strengths: [
      {
        en: "Narrates a past event with a mostly clear timeline",
        ru: "Описывает прошедшее событие с достаточно чёткой хронологией",
        kz: "Өткен оқиғаны негізінен анық хронологиямен баяндайды",
      },
      {
        en: "Sustains a short monologue without examiner prompting",
        ru: "Поддерживает короткий монолог без подсказок экзаменатора",
        kz: "Емтихан алушының көмегінсіз қысқа монологты жалғастырады",
      },
      {
        en: "Negotiates simple plans reasonably well in the role-play",
        ru: "Достаточно хорошо согласовывает простые планы в ролевой игре",
        kz: "Рөлдік ойында қарапайым жоспарларды жеткілікті жақсы келіседі",
      },
      {
        en: "Friendly, appropriate tone throughout",
        ru: "Дружелюбный, уместный тон на протяжении всего ответа",
        kz: "Жауап бойы достық, орынды стиль сақталады",
      },
    ],
    weaknesses: [
      {
        en: "Auxiliary verb choice (avoir vs être) is inconsistent in the passé composé",
        ru: "Выбор вспомогательного глагола (avoir или être) непоследователен в passé composé",
        kz: "Passé composé-де көмекші етістікті (avoir немесе être) таңдау тұрақты емес",
      },
      {
        en: "Occasional past-participle agreement errors",
        ru: "Иногда встречаются ошибки согласования причастия прошедшего времени",
        kz: "Кейде өткен шақ есімшесінің келісімінде қателер кездеседі",
      },
      {
        en: "Some hesitation when the topic shifts unexpectedly",
        ru: "Некоторая неуверенность при неожиданной смене темы",
        kz: "Тақырып күтпеген жерден өзгергенде біраз екіұдайлық байқалады",
      },
    ],
    improvementTips: [
      {
        en: "Review which common verbs take \"être\" in the passé composé",
        ru: "Повторите, какие распространённые глаголы спрягаются с «être» в passé composé",
        kz: "Passé composé-де қандай жиі етістіктер «être»-мен тіркесетінін қайталаңыз",
      },
      {
        en: "Practice past-participle agreement with être-verbs",
        ru: "Потренируйте согласование причастия с глаголами, спрягаемыми с être",
        kz: "Être-етістіктерімен есімшенің келісуін жаттығыңыз",
      },
      {
        en: "Record yourself narrating your weekend to build fluency",
        ru: "Запишите себя, рассказывая о своих выходных, чтобы развить беглость речи",
        kz: "Демалыс күндеріңіз туралы айтып, өзіңізді жазып алыңыз — бұл сөйлеу еркіндігін дамытады",
      },
      {
        en: "Practice quick transitions when the examiner changes topic",
        ru: "Потренируйте быстрый переход при смене темы экзаменатором",
        kz: "Емтихан алушы тақырыпты өзгерткенде жылдам ауысуды жаттығыңыз",
      },
    ],
    baseScore: 16,
  },
  B1: {
    grammarPool: [
      {
        id: "b1s-subjonctif",
        original: "il faut que je vais au rendez-vous",
        correction: "il faut que j'aille au rendez-vous",
        category: "verb",
        explanation: {
          en: "\"Il faut que\" requires the subjunctive: \"que j'aille\", not the indicative \"je vais\".",
          ru: "«Il faut que» требует сослагательного наклонения: «que j'aille», а не изъявительного «je vais».",
          kz: "«Il faut que» бағыныңқы райды талап етеді: «que j'aille», ашық рай «je vais» емес.",
        },
        betterExample: "Il faut que j'aille au rendez-vous avant midi.",
      },
      {
        id: "b1s-conditionnel",
        original: "si j'ai le temps, je viendrai",
        correction: "si j'ai le temps, je viendrai (correct) / si j'avais le temps, je viendrais",
        category: "sentence-structure",
        explanation: {
          en: "Keep the tense sequence consistent: \"si\" + présent goes with futur; \"si\" + imparfait goes with conditionnel.",
          ru: "Соблюдайте последовательность времён: «si» + présent сочетается с futur; «si» + imparfait — с conditionnel.",
          kz: "Шақ тізбегін сақтаңыз: «si» + présent — futur-мен, «si» + imparfait — conditionnel-мен қолданылады.",
        },
        betterExample: "Si j'avais le temps, je viendrais avec plaisir.",
      },
      {
        id: "b1s-anglicism",
        original: "je suis d'accord avec ça, définitivement",
        correction: "je suis tout à fait d'accord avec cela",
        category: "other",
        explanation: {
          en: "\"Définitivement\" is an anglicism here; \"tout à fait\" is the natural French equivalent.",
          ru: "«Définitivement» здесь — англицизм; естественный французский эквивалент — «tout à fait».",
          kz: "Бұл жерде «définitivement» — ағылшыншылдық; табиғи француз баламасы — «tout à fait».",
        },
        betterExample: "Je suis tout à fait d'accord avec cette proposition.",
      },
    ],
    pronunciationNotes: [
      {
        en: "Pronunciation is clear and generally accurate, supporting easy comprehension.",
        ru: "Произношение чёткое и в целом точное, что облегчает понимание.",
        kz: "Айтылым анық және негізінен дұрыс, түсінуді жеңілдетеді.",
      },
    ],
    fluencyNotes: [
      {
        en: "Speaks at a natural pace with only occasional self-correction.",
        ru: "Говорит в естественном темпе с лишь редкими самоисправлениями.",
        kz: "Тек сирек өзін-өзі түзетумен табиғи қарқында сөйлейді.",
      },
      {
        en: "Handles follow-up questions without losing the thread of the argument.",
        ru: "Отвечает на уточняющие вопросы, не теряя нить рассуждения.",
        kz: "Қосымша сұрақтарға дәлелдеу желісін жоғалтпай жауап береді.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Good range of connectors and opinion vocabulary, appropriate for B1.",
        ru: "Хороший диапазон союзов и лексики для выражения мнения, соответствующий уровню B1.",
        kz: "B1 деңгейіне сай жалғаулықтар мен пікір білдіру лексикасының жақсы ауқымы.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Fully addressed the task, including the negotiation/opinion component expected at this level.",
        ru: "Полностью выполнил(а) задание, включая ожидаемый на этом уровне элемент переговоров/мнения.",
        kz: "Тапсырманы толық орындады, осы деңгейде күтілетін келіссөз/пікір элементін қоса алғанда.",
      },
      {
        en: "Addressed the task overall, though it could have engaged more directly with the specific scenario.",
        ru: "В целом выполнил(а) задание, хотя мог(ла) бы более конкретно отреагировать на данную ситуацию.",
        kz: "Тапсырманы жалпы орындады, бірақ нақты жағдайға тікелей көбірек назар аударса болар еді.",
      },
    ],
    coherenceNotes: [
      {
        en: "Arguments were organized in a clear, logical sequence.",
        ru: "Аргументы были выстроены в чёткой, логичной последовательности.",
        kz: "Дәлелдер анық әрі логикалық ретпен құрылды.",
      },
      {
        en: "The response held together well, though a couple of transitions felt abrupt.",
        ru: "Ответ был в целом связным, хотя пара переходов ощущались резкими.",
        kz: "Жауап тұтастай жақсы құрылды, бірақ бірнеше өтулер кенеттен болды.",
      },
    ],
    strengths: [
      {
        en: "States a clear personal opinion and defends it",
        ru: "Формулирует чёткое личное мнение и отстаивает его",
        kz: "Жеке пікірін анық білдіріп, оны қорғайды",
      },
      {
        en: "Proposes and negotiates a compromise in the interactive exercise",
        ru: "Предлагает и согласовывает компромисс в интерактивном задании",
        kz: "Интерактивті тапсырмада ымыраны ұсынып, келіседі",
      },
      {
        en: "Uses a good range of tenses accurately",
        ru: "Точно использует широкий диапазон времён",
        kz: "Әртүрлі шақтарды дәл қолданады",
      },
      {
        en: "Supports arguments with relevant examples",
        ru: "Подкрепляет аргументы уместными примерами",
        kz: "Дәлелдерін орынды мысалдармен қуаттайды",
      },
    ],
    weaknesses: [
      {
        en: "Subjunctive mood is avoided or used incorrectly after \"il faut que\"",
        ru: "Сослагательное наклонение избегается или используется неверно после «il faut que»",
        kz: "«Il faut que»-ден кейін бағыныңқы рай қолданылмайды немесе қате қолданылады",
      },
      {
        en: "Occasional inconsistency in conditional tense sequences",
        ru: "Иногда встречается непоследовательность в условных временных конструкциях",
        kz: "Кейде шартты шақ тізбегінде тұрақсыздық байқалады",
      },
      {
        en: "A few anglicisms appear under time pressure",
        ru: "Под давлением времени встречаются отдельные англицизмы",
        kz: "Уақыт қысымында кейбір ағылшыншылдықтар кездеседі",
      },
    ],
    improvementTips: [
      {
        en: "Practice the subjunctive after common triggers: il faut que, bien que, pour que",
        ru: "Потренируйте сослагательное наклонение после распространённых триггеров: il faut que, bien que, pour que",
        kz: "Жиі кездесетін тіркестерден кейін бағыныңқы райды жаттығыңыз: il faut que, bien que, pour que",
      },
      {
        en: "Drill si-clause tense pairs until they feel automatic",
        ru: "Отработайте пары времён в предложениях с si до автоматизма",
        kz: "Si-сөйлемдердегі шақ жұптарын автоматты дәрежеге жеткенше жаттығыңыз",
      },
      {
        en: "Build a list of natural French equivalents for common anglicisms",
        ru: "Составьте список естественных французских эквивалентов распространённых англицизмов",
        kz: "Жиі кездесетін ағылшыншылдықтардың табиғи француз баламаларының тізімін жасаңыз",
      },
      {
        en: "Practice defending an opinion against a counter-argument out loud",
        ru: "Потренируйтесь вслух отстаивать мнение против контраргумента",
        kz: "Қарсы дәлелге қарсы пікіріңізді дауыстап қорғауды жаттығыңыз",
      },
    ],
    baseScore: 15,
  },
  B2: {
    grammarPool: [
      {
        id: "b2s-subjonctif-bien-que",
        original: "bien qu'il est difficile de changer, il faut essayer",
        correction: "bien qu'il soit difficile de changer, il faut essayer",
        category: "verb",
        explanation: {
          en: "\"Bien que\" always triggers the subjunctive: \"soit\", not the indicative \"est\".",
          ru: "«Bien que» всегда требует сослагательного наклонения: «soit», а не изъявительного «est».",
          kz: "«Bien que» әрқашан бағыныңқы райды талап етеді: «soit», ашық рай «est» емес.",
        },
        betterExample: "Bien qu'il soit difficile de changer ses habitudes, il faut essayer.",
      },
      {
        id: "b2s-nuance",
        original: "c'est totalement faux, je pense",
        correction: "cela me semble en grande partie inexact",
        category: "other",
        explanation: {
          en: "At B2, absolute statements (\"totalement faux\") benefit from more nuanced hedging language.",
          ru: "На уровне B2 категоричные утверждения («totalement faux») лучше смягчать более нюансированными формулировками.",
          kz: "B2 деңгейінде категориялық тұжырымдарды («totalement faux») нәзігірек тілмен жеткізген жөн.",
        },
        betterExample: "Cela me semble en grande partie inexact, à mon avis.",
      },
      {
        id: "b2s-stacked-connectors",
        original: "cependant, néanmoins, il faut dire que",
        correction: "cependant, il faut dire que",
        category: "sentence-structure",
        explanation: {
          en: "Avoid stacking two contrastive connectors in a row — pick one to keep the argument clear.",
          ru: "Избегайте нагромождения двух противительных союзов подряд — выберите один для ясности аргумента.",
          kz: "Екі қарсы мәнді жалғаулықты қатар қоймаңыз — дәлелдің анықтығы үшін біреуін таңдаңыз.",
        },
        betterExample: "Cependant, il faut reconnaître que la situation est complexe.",
      },
    ],
    pronunciationNotes: [
      {
        en: "Pronunciation is fluent and natural, with intonation supporting the argument's structure.",
        ru: "Произношение беглое и естественное, интонация поддерживает структуру аргументации.",
        kz: "Айтылым еркін әрі табиғи, интонация дәлелдеу құрылымын қолдайды.",
      },
    ],
    fluencyNotes: [
      {
        en: "Speaks fluidly at length, recovering smoothly from rare hesitations.",
        ru: "Говорит бегло и продолжительно, плавно справляясь с редкими заминками.",
        kz: "Ұзақ әрі еркін сөйлейді, сирек кідірістерден тегіс шығады.",
      },
      {
        en: "Handles challenging counter-questions without losing composure.",
        ru: "Справляется со сложными встречными вопросами, не теряя самообладания.",
        kz: "Қиын қарсы сұрақтарды сабырын жоғалтпай шешеді.",
      },
    ],
    vocabularyRangeNotes: [
      {
        en: "Wide-ranging, precise vocabulary suited to formal debate, with occasional B1-level simplification.",
        ru: "Широкий, точный словарный запас, подходящий для формальной дискуссии, с отдельными упрощениями уровня B1.",
        kz: "Формалды пікірталасқа сай кең, дәл сөздік қор, кейде B1 деңгейіндегі жеңілдетулер бар.",
      },
    ],
    taskCompletionNotes: [
      {
        en: "Thoroughly addressed the topic with a clear thesis and supporting reasoning.",
        ru: "Всесторонне раскрыл(а) тему с чётким тезисом и обоснованной аргументацией.",
        kz: "Тақырыпты анық тезис пен негізделген дәлелдеумен толық ашты.",
      },
      {
        en: "Addressed the topic well, though the counter-argument could have been engaged more directly.",
        ru: "Хорошо раскрыл(а) тему, хотя мог(ла) бы более прямо ответить на контраргумент.",
        kz: "Тақырыпты жақсы ашты, бірақ қарсы дәлелге тікелейірек жауап берсе болар еді.",
      },
    ],
    coherenceNotes: [
      {
        en: "The argument was structured with a clear line of reasoning from start to finish.",
        ru: "Аргументация была выстроена с чёткой логической линией от начала до конца.",
        kz: "Дәлелдеу басынан аяғына дейін анық логикалық желімен құрылды.",
      },
      {
        en: "Ideas were coherent overall, with sophisticated connectors linking each point.",
        ru: "Мысли были в целом связными, с продуманными союзами, соединяющими каждый пункт.",
        kz: "Ойлар жалпы тұтас болды, әр тармақты байланыстыратын күрделі жалғаулықтармен.",
      },
    ],
    strengths: [
      {
        en: "Presents a clear, well-structured argument with a defined thesis",
        ru: "Представляет чёткую, структурированную аргументацию с ясно сформулированным тезисом",
        kz: "Анық тезисі бар құрылымдалған дәлелдеме ұсынады",
      },
      {
        en: "Defends the position convincingly under counter-questioning",
        ru: "Убедительно отстаивает позицию при встречных вопросах",
        kz: "Қарсы сұрақтар кезінде позициясын сенімді қорғайды",
      },
      {
        en: "Uses complex sentence structures and nuanced connectors",
        ru: "Использует сложные синтаксические конструкции и нюансированные союзы",
        kz: "Күрделі сөйлем құрылымдарын және нәзік жалғаулықтарды қолданады",
      },
      {
        en: "Register is consistently appropriate for a formal debate",
        ru: "Стилистический регистр последовательно соответствует формальной дискуссии",
        kz: "Стилі формалды пікірталасқа тұрақты түрде сай келеді",
      },
    ],
    weaknesses: [
      {
        en: "Subjunctive after \"bien que\" is inconsistently applied",
        ru: "Сослагательное наклонение после «bien que» применяется непоследовательно",
        kz: "«Bien que»-ден кейінгі бағыныңқы рай тұрақты қолданылмаған",
      },
      {
        en: "Some absolute statements would benefit from more nuanced hedging",
        ru: "Некоторые категоричные утверждения выиграли бы от более нюансированных формулировок",
        kz: "Кейбір категориялық тұжырымдарды нәзігірек жеткізген жөн болар еді",
      },
      {
        en: "Occasional over-stacking of connectors weakens clarity",
        ru: "Иногда чрезмерное нагромождение союзов снижает ясность",
        kz: "Кейде жалғаулықтардың шамадан тыс қатар қолданылуы анықтықты төмендетеді",
      },
    ],
    improvementTips: [
      {
        en: "Review subjunctive triggers systematically (bien que, quoique, à moins que)",
        ru: "Системно повторите триггеры сослагательного наклонения (bien que, quoique, à moins que)",
        kz: "Бағыныңқы райды талап ететін тіркестерді жүйелі қайталаңыз (bien que, quoique, à moins que)",
      },
      {
        en: "Build a repertoire of hedging phrases (il me semble que, dans une certaine mesure)",
        ru: "Составьте набор смягчающих фраз (il me semble que, dans une certaine mesure)",
        kz: "Жұмсартатын тіркестер жинағын жасаңыз (il me semble que, dans une certaine mesure)",
      },
      {
        en: "Aim for one clear connector per sentence rather than stacking several",
        ru: "Стремитесь использовать один чёткий союз на предложение, а не нагромождать несколько",
        kz: "Бір сөйлемде бірнешеуін емес, бір анық жалғаулықты қолдануға тырысыңыз",
      },
      {
        en: "Practice timed debate simulations to sharpen argument structure under pressure",
        ru: "Практикуйте дебаты на время, чтобы отточить структуру аргументации под давлением",
        kz: "Қысым астында дәлелдеу құрылымын жетілдіру үшін уақыты шектелген пікірталас жаттығуларын өткізіңіз",
      },
    ],
    baseScore: 14,
  },
};

/** Language-neutral result of analyzing one spoken (typed) answer — safe
 * to accumulate in client state and send back for the session report. */
export interface TurnSelection {
  level: DelfLevel;
  partId: string;
  questionId: string;
  wordCount: number;
  relevant: boolean;
  selectedErrorIds: string[];
  fillerCount: number;
  turnScore: number;
}

function pickIndices(length: number, count: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).sort((a, b) => a - b);
}

function countFillerWords(text: string): number {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((total, word) => {
    const matches = lower.match(new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "g"));
    return total + (matches?.length ?? 0);
  }, 0);
}

export function analyzeTurn(
  level: DelfLevel,
  partId: string,
  questionId: string,
  responseText: string,
  wordCount: number
): TurnSelection {
  const profile = MOCK_SPEAKING_PROFILES[level];
  const relevant = wordCount >= 5;
  const fillerCount = countFillerWords(responseText);

  const errorCount = Math.min(1 + Math.floor(Math.random() * 2), profile.grammarPool.length);
  const selectedErrorIds = pickIndices(profile.grammarPool.length, errorCount).map(
    (i) => profile.grammarPool[i].id
  );

  const jitter = Math.floor(Math.random() * 3) - 1;
  const turnScore = Math.max(5, Math.min(25, profile.baseScore + jitter - Math.min(fillerCount, 3)));

  return {
    level,
    partId,
    questionId,
    wordCount,
    relevant,
    selectedErrorIds,
    fillerCount,
    turnScore,
  };
}

export function localizeTurnFeedback(
  selection: TurnSelection,
  language: FeedbackLanguage
): TurnFeedback {
  const profile = MOCK_SPEAKING_PROFILES[selection.level];
  const grammarErrors: SpeakingGrammarMistake[] = selection.selectedErrorIds.map((id) => {
    const template = profile.grammarPool.find((e) => e.id === id)!;
    return {
      original: template.original,
      correction: template.correction,
      category: template.category,
      whyWrong: template.explanation[language],
      howToFix: buildHowToFix(template.correction, language),
      betterExample: template.betterExample,
      howToAvoid: HOW_TO_AVOID_BY_CATEGORY[template.category][language],
    };
  });

  const fluencyNote =
    profile.fluencyNotes[Math.floor(Math.random() * profile.fluencyNotes.length)][language];
  const vocabularyNote =
    profile.vocabularyRangeNotes[
      Math.floor(Math.random() * profile.vocabularyRangeNotes.length)
    ][language];
  const pronunciationNote =
    profile.pronunciationNotes[
      Math.floor(Math.random() * profile.pronunciationNotes.length)
    ][language];
  const taskCompletionNote =
    profile.taskCompletionNotes[
      Math.floor(Math.random() * profile.taskCompletionNotes.length)
    ][language];
  const coherenceNote =
    profile.coherenceNotes[Math.floor(Math.random() * profile.coherenceNotes.length)][language];

  const encouragement: TranslatedText = selection.relevant
    ? {
        en: "Good answer — let's move on to the next question.",
        ru: "Хороший ответ — переходим к следующему вопросу.",
        kz: "Жақсы жауап — келесі сұраққа өтейік.",
      }
    : {
        en: "Try to develop your answer a bit more next time.",
        ru: "В следующий раз постарайтесь развить ответ немного подробнее.",
        kz: "Келесі жолы жауапты біраз толығырақ дамытуға тырысыңыз.",
      };

  return {
    relevance: selection.relevant,
    taskCompletionNote,
    coherenceNote,
    grammarErrors,
    vocabularyNote,
    fluencyNote,
    pronunciationNote,
    encouragement: encouragement[language],
    turnScore: selection.turnScore,
  };
}

/** Finds grammar mistakes that recurred across at least two turns —
 * grouped by category+original text since real per-turn feedback carries
 * full SpeakingGrammarMistake objects, not ids into a shared pool. */
function findRepeatedErrors(completedTurns: CompletedTurn[]): SpeakingGrammarMistake[] {
  const counts = new Map<string, { error: SpeakingGrammarMistake; count: number }>();
  for (const turn of completedTurns) {
    for (const error of turn.feedback.grammarErrors) {
      const key = `${error.category}:${error.original}`;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { error, count: 1 });
    }
  }
  return [...counts.values()].filter((v) => v.count >= 2).map((v) => v.error);
}

const TASK_COMPLETION_SUMMARY = {
  complete: (level: DelfLevel): TranslatedText => ({
    en: `All parts of the DELF ${level} speaking exam were completed.`,
    ru: `Все части устного экзамена DELF ${level} были выполнены.`,
    kz: `DELF ${level} ауызша емтиханының барлық бөлімдері орындалды.`,
  }),
};

const GRAMMAR_SUMMARY = {
  withErrors: (count: number, level: DelfLevel): TranslatedText => ({
    en: `Found ${count} recurring error pattern${count === 1 ? "" : "s"} typical of ${level} learners across the session.`,
    ru: `Обнаружено ${count} повторяющихся ошибок, типичных для уровня ${level}, за всю сессию.`,
    kz: `Сессия бойы ${level} деңгейіндегі оқушыларға тән ${count} қайталанатын қате анықталды.`,
  }),
  noErrors: {
    en: "No major recurring grammar patterns flagged across the session.",
    ru: "Существенных повторяющихся грамматических ошибок за сессию не обнаружено.",
    kz: "Сессия бойы елеулі қайталанатын грамматикалық қателер табылмады.",
  } as TranslatedText,
};

const SCORE_EXPLANATION = {
  strong: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A strong result — ${score}/${scoreOutOf} indicates this session would likely meet the DELF ${level} passing standard comfortably.`,
    ru: `Хороший результат — ${score}/${scoreOutOf} говорит о том, что эта сессия, скорее всего, уверенно соответствует проходному уровню DELF ${level}.`,
    kz: `Жақсы нәтиже — ${score}/${scoreOutOf} бұл сессияның DELF ${level} өту деңгейіне сенімді сай келетінін көрсетеді.`,
  }),
  borderline: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A borderline result — ${score}/${scoreOutOf} is close to the DELF ${level} passing standard but needs refinement.`,
    ru: `Пограничный результат — ${score}/${scoreOutOf} близок к проходному уровню DELF ${level}, но требует доработки.`,
    kz: `Шекаралық нәтиже — ${score}/${scoreOutOf} DELF ${level} өту деңгейіне жақын, бірақ жетілдіруді қажет етеді.`,
  }),
  weak: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `Below the target — ${score}/${scoreOutOf} suggests more practice is needed to reach the DELF ${level} passing standard.`,
    ru: `Ниже целевого уровня — ${score}/${scoreOutOf} говорит о необходимости дополнительной практики для достижения проходного уровня DELF ${level}.`,
    kz: `Мақсатты деңгейден төмен — ${score}/${scoreOutOf} DELF ${level} өту деңгейіне жету үшін қосымша жаттығу қажет екенін білдіреді.`,
  }),
};

/** Offline fallback (no ANTHROPIC_API_KEY configured) — unlike the old
 * random session synthesis, this aggregates the real accumulated per-turn
 * data (actual transcripts, actual scores, actual grammar errors already
 * produced per-turn) instead of re-rolling its own report independently. */
export function synthesizeReportFromTurns(
  completedTurns: CompletedTurn[],
  level: DelfLevel,
  language: FeedbackLanguage
): SpeakingExaminerReport {
  const profile = MOCK_SPEAKING_PROFILES[level];
  const levelConfig = DELF_SPEAKING_LEVELS[level];

  const commonErrors = findRepeatedErrors(completedTurns);

  const fullTranscript = completedTurns.map((t) => t.transcript).join(" ");
  const fillerTotal = countFillerWords(fullTranscript);
  const fillerExamples = FILLER_WORDS.filter((word) =>
    new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "i").test(fullTranscript)
  ).slice(0, 3);

  const completedPartIds = new Set(completedTurns.map((t) => t.partId));
  const partsCompleted = levelConfig.parts
    .filter((part) => completedPartIds.has(part.id))
    .map((part) => part.partLabel);

  const estimatedScore = Math.max(
    5,
    Math.min(
      25,
      Math.round(
        completedTurns.reduce((sum, t) => sum + t.feedback.turnScore, 0) /
          Math.max(1, completedTurns.length)
      )
    )
  );
  const scoreOutOf = 25;
  const ratio = estimatedScore / scoreOutOf;
  const tier = ratio >= 0.75 ? "strong" : ratio >= 0.5 ? "borderline" : "weak";

  return {
    level,
    totalQuestions: completedTurns.length,
    grammar: {
      summary:
        commonErrors.length > 0
          ? GRAMMAR_SUMMARY.withErrors(commonErrors.length, level)[language]
          : GRAMMAR_SUMMARY.noErrors[language],
      commonErrors,
    },
    vocabulary: {
      summary: profile.vocabularyRangeNotes[0][language],
      rangeNote: profile.vocabularyRangeNotes[
        Math.min(1, profile.vocabularyRangeNotes.length - 1)
      ][language],
    },
    pronunciation: {
      summary: profile.pronunciationNotes[0][language],
      note: profile.pronunciationNotes[
        Math.min(1, profile.pronunciationNotes.length - 1)
      ][language],
    },
    fluency: {
      summary: profile.fluencyNotes[0][language],
      pace: profile.fluencyNotes[Math.min(1, profile.fluencyNotes.length - 1)][language],
    },
    taskCompletion: {
      summary: TASK_COMPLETION_SUMMARY.complete(level)[language],
      partsCompleted,
    },
    repeatedMistakes: commonErrors.map((e) => `${e.original} → ${e.correction}`),
    fillerWords: {
      count: fillerTotal,
      examples: fillerExamples,
    },
    strengths: profile.strengths.slice(0, 3).map((s) => s[language]),
    weaknesses: profile.weaknesses.slice(0, Math.min(2, profile.weaknesses.length)).map((w) => w[language]),
    suggestions: profile.improvementTips.slice(0, 3).map((s) => s[language]),
    estimatedScore,
    scoreOutOf,
    scoreExplanation: SCORE_EXPLANATION[tier](level, estimatedScore, scoreOutOf)[language],
  };
}
