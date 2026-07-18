import { DELF_WRITING_LEVELS } from "@/config/delf-writing";
import type {
  DelfLevel,
  ExamReadinessFeedback,
  FeedbackLanguage,
  GrammarError,
  LanguageAccuracyFeedback,
  StructureFeedback,
  TaskCompletionFeedback,
  VocabularyFeedback,
  WritingEvaluation,
} from "@/types/writing-evaluation";

/**
 * Mock DELF writing evaluator for demos where no ANTHROPIC_API_KEY is
 * configured. Returns the exact WritingEvaluation shape a real Claude call
 * would produce, so the route handler can swap this for a live model call
 * later without touching the response contract or the UI.
 *
 * Split into two phases so the feedback LANGUAGE can be switched instantly
 * on the client without re-running the (randomized) analysis:
 *  - analyzeResponse(): decides which grammar errors/strengths/weaknesses
 *    apply and computes the score. Language-independent; has randomness.
 *  - localizeEvaluation(): pure and deterministic — turns a selection into
 *    display text in the requested language. Safe to call on the client
 *    for instant re-translation, no network round trip needed.
 *
 * The exam prompt and the student's own response always stay in French —
 * only this AI-generated feedback text is translated. Grammar "original"
 * and "correction" excerpts are always French too; only their explanation
 * is localized.
 *
 * To extend to DALF C1/C2: add "C1" | "C2" to the DelfLevel type, add
 * matching entries to DELF_WRITING_LEVELS, then add profiles below — the
 * functions here need no changes.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

interface GrammarErrorTemplate {
  id: string;
  original: string; // French — never translated
  correction: string; // French — never translated
  category: GrammarError["category"];
  explanation: TranslatedText;
}

interface MockLevelProfile {
  grammarPool: GrammarErrorTemplate[];
  vocabulary: {
    wordChoice: TranslatedText;
    variety: TranslatedText;
    levelAppropriateness: TranslatedText;
  };
  strengths: TranslatedText[];
  weaknesses: TranslatedText[];
  improvementTips: TranslatedText[];
  baseScore: number;
  conclusionRequired: boolean;
}

const MOCK_PROFILES: Record<DelfLevel, MockLevelProfile> = {
  A1: {
    grammarPool: [
      {
        id: "a1-avoir-age",
        original: "je suis 25 ans",
        correction: "j'ai 25 ans",
        category: "verb",
        explanation: {
          en: "Age is expressed with the verb avoir (avoir + age), not être.",
          ru: "Возраст выражается с помощью глагола avoir (avoir + возраст), а не être.",
          kz: "Жас мөлшері avoir етістігімен беріледі (avoir + жас), être емес.",
        },
      },
      {
        id: "a1-natation-gender",
        original: "j'aime le natation",
        correction: "j'aime la natation",
        category: "agreement",
        explanation: {
          en: "\"Natation\" is a feminine noun, so it takes the article \"la\", not \"le\".",
          ru: "«Natation» — существительное женского рода, поэтому употребляется с артиклем «la», а не «le».",
          kz: "«Natation» — әйел тегіндегі зат есім, сондықтан «la» артиклімен қолданылады, «le» емес.",
        },
      },
      {
        id: "a1-etre-habiter",
        original: "je suis habite à Lyon",
        correction: "j'habite à Lyon",
        category: "sentence-structure",
        explanation: {
          en: "Don't combine \"être\" with a conjugated verb — use \"habiter\" alone.",
          ru: "Не сочетайте «être» со спрягаемым глаголом — используйте только «habiter».",
          kz: "«Être»-ні тұлғаланған етістікпен қоса қолданбаңыз — жалғыз «habiter» етістігін пайдаланыңыз.",
        },
      },
      {
        id: "a1-accents",
        original: "a bientot",
        correction: "à bientôt",
        category: "other",
        explanation: {
          en: "Missing accents: \"à\" (preposition) and the circumflex in \"bientôt\".",
          ru: "Пропущены диакритические знаки: «à» (предлог) и циркумфлекс в слове «bientôt».",
          kz: "Диакритикалық белгілер жетіспейді: «à» (септеулік шылау) және «bientôt» сөзіндегі циркумфлекс.",
        },
      },
    ],
    vocabulary: {
      wordChoice: {
        en: "Vocabulary is limited to common, high-frequency words appropriate for A1 — a good choice for this level.",
        ru: "Словарный запас ограничен распространёнными, часто используемыми словами, подходящими для уровня A1 — хороший выбор для этого уровня.",
        kz: "Сөздік қор A1 деңгейіне сай жиі қолданылатын, қарапайым сөздермен шектелген — бұл деңгей үшін дұрыс таңдау.",
      },
      variety: {
        en: "Some repetition of basic connectors (et, et, et); try varying with \"aussi\" or \"puis\".",
        ru: "Наблюдается повторение простых союзов (et, et, et); попробуйте разнообразить их словами «aussi» или «puis».",
        kz: "Қарапайым жалғаулықтардың (et, et, et) қайталануы байқалады; «aussi» немесе «puis» сөздерімен әртараптандырып көріңіз.",
      },
      levelAppropriateness: {
        en: "Vocabulary matches the A1 descriptor well — simple, everyday words used correctly in context.",
        ru: "Словарный запас хорошо соответствует уровню A1 — простые повседневные слова использованы корректно в контексте.",
        kz: "Сөздік қор A1 деңгей талаптарына сай келеді — қарапайым, күнделікті сөздер контексте дұрыс қолданылған.",
      },
    },
    strengths: [
      {
        en: "Uses simple present tense correctly for most verbs",
        ru: "Правильно использует простое настоящее время (présent) для большинства глаголов",
        kz: "Көптеген етістіктер үшін жедел осы шақты (présent) дұрыс қолданады",
      },
      {
        en: "Successfully conveys basic personal information (name, age, likes)",
        ru: "Успешно передаёт базовую личную информацию (имя, возраст, увлечения)",
        kz: "Негізгі жеке ақпаратты (аты-жөні, жасы, қызығушылықтары) сәтті жеткізеді",
      },
      {
        en: "Message stays on topic and is easy to follow",
        ru: "Сообщение не отклоняется от темы и легко воспринимается",
        kz: "Хабарлама тақырыптан ауытқымайды және оқуға жеңіл",
      },
      {
        en: "Good use of everyday vocabulary related to daily life",
        ru: "Хорошее использование повседневной лексики, связанной с бытом",
        kz: "Күнделікті өмірге қатысты сөздік қорды жақсы пайдаланады",
      },
    ],
    weaknesses: [
      {
        en: "A few basic agreement and accent mistakes",
        ru: "Несколько базовых ошибок в согласовании и диакритических знаках",
        kz: "Бірнеше қарапайым келісім және диакритикалық белгі қателері бар",
      },
      {
        en: "Limited variety of connecting words",
        ru: "Ограниченное разнообразие соединительных слов",
        kz: "Жалғаулық сөздердің әртүрлілігі шектеулі",
      },
      {
        en: "Some verb forms need review (avoir vs être)",
        ru: "Некоторые формы глаголов требуют повторения (avoir против être)",
        kz: "Кейбір етістік формаларын қайталау қажет (avoir мен être)",
      },
    ],
    improvementTips: [
      {
        en: "Practice avoir-based expressions like \"j'ai ... ans\" for age",
        ru: "Потренируйте выражения с avoir, например «j'ai ... ans», для обозначения возраста",
        kz: "Жасты білдіру үшін avoir негізіндегі «j'ai ... ans» тәрізді сөз тіркестерін жаттығыңыз",
      },
      {
        en: "Review gender agreement for common nouns (le/la)",
        ru: "Повторите согласование рода для распространённых существительных (le/la)",
        kz: "Жиі кездесетін зат есімдердің тегін (le/la) қайталаңыз",
      },
      {
        en: "Add accents carefully — they can change word meaning",
        ru: "Ставьте диакритические знаки внимательно — они могут менять значение слова",
        kz: "Диакритикалық белгілерді мұқият қойыңыз — олар сөздің мағынасын өзгертуі мүмкін",
      },
      {
        en: "Try adding one more sentence to reach the target word count",
        ru: "Попробуйте добавить ещё одно предложение, чтобы достичь нужного объёма",
        kz: "Қажетті сөз санына жету үшін тағы бір сөйлем қосып көріңіз",
      },
    ],
    baseScore: 17,
    conclusionRequired: false,
  },
  A2: {
    grammarPool: [
      {
        id: "a2-aller-etre",
        original: "j'ai allé au parc",
        correction: "je suis allé(e) au parc",
        category: "verb",
        explanation: {
          en: "\"Aller\" takes \"être\" as its auxiliary in the passé composé, not \"avoir\".",
          ru: "Глагол «aller» в passé composé спрягается со вспомогательным глаголом «être», а не «avoir».",
          kz: "«Aller» етістігі passé composé шағында «avoir» емес, «être» көмекші етістігімен тіркеседі.",
        },
      },
      {
        id: "a2-pomme-gender",
        original: "elle a mangé un pomme",
        correction: "elle a mangé une pomme",
        category: "agreement",
        explanation: {
          en: "\"Pomme\" is feminine, so the article should be \"une\", not \"un\".",
          ru: "«Pomme» — слово женского рода, поэтому артикль должен быть «une», а не «un».",
          kz: "«Pomme» — әйел тегіндегі сөз, сондықтан артикль «un» емес, «une» болуы керек.",
        },
      },
      {
        id: "a2-visiter",
        original: "je vais visiter mes amis",
        correction: "je vais rendre visite à mes amis",
        category: "other",
        explanation: {
          en: "\"Visiter\" is generally used for places; for people, use \"rendre visite à\".",
          ru: "«Visiter» обычно используется по отношению к местам; для людей используйте «rendre visite à».",
          kz: "«Visiter» әдетте орындарға қатысты қолданылады; адамдарға қатысты «rendre visite à» тіркесін пайдаланыңыз.",
        },
      },
      {
        id: "a2-participle",
        original: "nous avons manger ensemble",
        correction: "nous avons mangé ensemble",
        category: "verb",
        explanation: {
          en: "The past participle of \"manger\" is \"mangé\", not the infinitive \"manger\".",
          ru: "Причастие прошедшего времени от «manger» — «mangé», а не инфинитив «manger».",
          kz: "«Manger» етістігінің өткен шақ есімшесі — «mangé», ал «manger» — тұйық етістік.",
        },
      },
    ],
    vocabulary: {
      wordChoice: {
        en: "Word choice fits everyday topics (family, daily life, leisure) expected at A2.",
        ru: "Выбор слов соответствует повседневным темам (семья, быт, досуг), ожидаемым на уровне A2.",
        kz: "Сөз таңдауы A2 деңгейіне тән күнделікті тақырыптарға (отбасы, тұрмыс, демалыс) сай келеді.",
      },
      variety: {
        en: "A reasonable range of vocabulary, though a few words are repeated across sentences.",
        ru: "Достаточно широкий словарный запас, хотя некоторые слова повторяются в разных предложениях.",
        kz: "Сөздік қор жеткілікті кең, дегенмен кейбір сөздер сөйлемдер бойында қайталанады.",
      },
      levelAppropriateness: {
        en: "Vocabulary is appropriate for A2, with only minor overreach into more advanced expressions.",
        ru: "Лексика соответствует уровню A2, с лишь незначительными попытками использовать более сложные выражения.",
        kz: "Сөздік қор A2 деңгейіне сай, тек біраз жерлерде күрделірек тіркестерді қолдануға талпыныс бар.",
      },
    },
    strengths: [
      {
        en: "Correctly narrates a past event using passé composé in several places",
        ru: "Правильно описывает прошедшее событие с использованием passé composé в нескольких местах",
        kz: "Бірнеше жерде passé composé шағын дұрыс қолданып, өткен оқиғаны баяндайды",
      },
      {
        en: "Message has a clear beginning, middle, and end",
        ru: "Сообщение имеет чёткое начало, середину и конец",
        kz: "Хабарламаның басы, ортасы және соңы анық көрсетілген",
      },
      {
        en: "Vocabulary is varied enough to describe everyday situations",
        ru: "Словарный запас достаточно разнообразен для описания повседневных ситуаций",
        kz: "Сөздік қор күнделікті жағдайларды сипаттауға жеткілікті әртүрлі",
      },
      {
        en: "Tone is appropriately friendly and informal",
        ru: "Тон уместно дружелюбный и неформальный",
        kz: "Стилі орынды түрде достық және бейресми",
      },
    ],
    weaknesses: [
      {
        en: "A few auxiliary verb errors in the passé composé (avoir vs être)",
        ru: "Несколько ошибок во вспомогательных глаголах в passé composé (avoir и être)",
        kz: "Passé composé-де көмекші етістіктерде (avoir мен être) бірнеше қате бар",
      },
      {
        en: "Occasional gender agreement mistakes with nouns",
        ru: "Иногда встречаются ошибки в согласовании рода существительных",
        kz: "Кейде зат есімдердің тегін келістіруде қателер кездеседі",
      },
      {
        en: "Sentence connectors could be more varied (mostly et/mais)",
        ru: "Соединительные слова можно было бы разнообразить (в основном используются et/mais)",
        kz: "Сөйлем жалғаулықтарын әртараптандыруға болады (негізінен et/mais қолданылған)",
      },
    ],
    improvementTips: [
      {
        en: "Review the list of être-verbs for the passé composé (aller, venir, partir...)",
        ru: "Повторите список глаголов, спрягаемых с être в passé composé (aller, venir, partir...)",
        kz: "Passé composé-де être-мен тіркесетін етістіктер тізімін қайталаңыз (aller, venir, partir...)",
      },
      {
        en: "Double-check noun genders before choosing an article",
        ru: "Проверяйте род существительного, прежде чем выбрать артикль",
        kz: "Артикльді таңдамас бұрын зат есімнің тегін қайта тексеріңіз",
      },
      {
        en: "Try connectors like \"ensuite\", \"après\", \"donc\" for smoother flow",
        ru: "Используйте такие союзы, как «ensuite», «après», «donc», для более плавного изложения",
        kz: "Мәтінді тегіс ету үшін «ensuite», «après», «donc» сияқты жалғаулықтарды қолданып көріңіз",
      },
      {
        en: "Reread your text once for verb agreement before submitting",
        ru: "Перечитайте текст ещё раз на согласование глаголов, прежде чем сдавать",
        kz: "Тапсырмас бұрын мәтінді етістіктердің келісімін тексеру үшін тағы бір рет оқыңыз",
      },
    ],
    baseScore: 16,
    conclusionRequired: false,
  },
  B1: {
    grammarPool: [
      {
        id: "b1-subjunctive-il-faut",
        original: "il faut que nous allons",
        correction: "il faut que nous allions",
        category: "verb",
        explanation: {
          en: "\"Il faut que\" requires the subjunctive mood: \"que nous allions\", not the indicative \"nous allons\".",
          ru: "Оборот «il faut que» требует сослагательного наклонения (subjonctif): «que nous allions», а не изъявительного «nous allons».",
          kz: "«Il faut que» тіркесі бағыныңқы райды (subjonctif) талап етеді: «que nous allions», ашық рай «nous allons» емес.",
        },
      },
      {
        id: "b1-participle-agreement",
        original: "les informations que j'ai reçu",
        correction: "les informations que j'ai reçues",
        category: "agreement",
        explanation: {
          en: "The direct object (\"informations\", feminine plural) comes before the verb, so the past participle must agree: \"reçues\".",
          ru: "Прямое дополнение («informations», женский род, множественное число) стоит перед глаголом, поэтому причастие прошедшего времени должно согласовываться: «reçues».",
          kz: "Тікелей толықтауыш («informations», әйел тегі, көпше түрде) етістіктен бұрын тұр, сондықтан өткен шақ есімшесі келісуі керек: «reçues».",
        },
      },
      {
        id: "b1-malgre-que",
        original: "malgré qu'il pleuvait",
        correction: "bien qu'il pleuve",
        category: "sentence-structure",
        explanation: {
          en: "\"Malgré que\" is considered incorrect in standard French; use \"bien que\" + subjunctive instead.",
          ru: "Оборот «malgré que» считается некорректным в стандартном французском языке; используйте «bien que» + subjonctif.",
          kz: "«Malgré que» тіркесі стандартты француз тілінде қате саналады; оның орнына «bien que» + subjonctif қолданыңыз.",
        },
      },
      {
        id: "b1-elision",
        original: "parce que il fait beau",
        correction: "parce qu'il fait beau",
        category: "other",
        explanation: {
          en: "\"Parce que\" elides to \"parce qu'\" before a vowel sound.",
          ru: "«Parce que» переходит в «parce qu'» перед гласным звуком (элизия).",
          kz: "«Parce que» дауысты дыбыстың алдында «parce qu'» түріне қысқарады (элизия).",
        },
      },
    ],
    vocabulary: {
      wordChoice: {
        en: "Vocabulary is generally well-suited to expressing opinions, with a few overly literal translations.",
        ru: "Лексика в целом хорошо подходит для выражения мнения, встречаются лишь отдельные слишком буквальные переводы.",
        kz: "Сөздік қор жалпы пікір білдіруге сай, тек кейбір жерлерде тым тура аудармалар кездеседі.",
      },
      variety: {
        en: "Good lexical range for B1, mixing some varied connectors (cependant, donc) with simpler ones.",
        ru: "Хороший лексический диапазон для уровня B1, сочетающий разнообразные союзы (cependant, donc) с более простыми.",
        kz: "B1 деңгейі үшін лексикалық диапазон жақсы, әртүрлі жалғаулықтар (cependant, donc) қарапайымдарымен ұштасады.",
      },
      levelAppropriateness: {
        en: "Mostly appropriate for B1, with occasional attempts at more advanced vocabulary not yet fully mastered.",
        ru: "В основном соответствует уровню B1, с отдельными попытками использовать более сложную лексику, ещё не полностью освоенную.",
        kz: "Негізінен B1 деңгейіне сай, кейде толық меңгерілмеген күрделірек лексиканы қолдануға талпыныс бар.",
      },
    },
    strengths: [
      {
        en: "Clear personal opinion stated early and maintained throughout",
        ru: "Чёткое личное мнение сформулировано в начале и последовательно выдержано",
        kz: "Жеке пікір басында анық айтылып, мәтін бойы сақталған",
      },
      {
        en: "Uses a range of tenses (présent, passé composé, futur) accurately",
        ru: "Точно использует различные времена (présent, passé composé, futur)",
        kz: "Әртүрлі шақтарды (présent, passé composé, futur) дәл қолданады",
      },
      {
        en: "Arguments are supported with relevant examples",
        ru: "Аргументы подкреплены уместными примерами",
        kz: "Дәлелдер орынды мысалдармен қуатталған",
      },
      {
        en: "Good use of contrastive connectors like \"cependant\" and \"en revanche\"",
        ru: "Хорошее использование противительных союзов, таких как «cependant» и «en revanche»",
        kz: "«Cependant» және «en revanche» сияқты қарсы мәнді жалғаулықтарды жақсы қолданады",
      },
    ],
    weaknesses: [
      {
        en: "Subjunctive mood is avoided or used incorrectly after \"il faut que\"",
        ru: "Сослагательное наклонение избегается или используется неверно после «il faut que»",
        kz: "«Il faut que»-ден кейін бағыныңқы рай қолданылмайды немесе қате қолданылады",
      },
      {
        en: "Some agreement errors with past participles preceded by a direct object",
        ru: "Встречаются ошибки согласования причастий, когда прямое дополнение стоит перед глаголом",
        kz: "Тікелей толықтауыш етістіктен бұрын тұрғанда есімшенің келісуінде қателер бар",
      },
      {
        en: "A couple of anglicisms in sentence structure",
        ru: "Несколько англицизмов в структуре предложений",
        kz: "Сөйлем құрылымында бірнеше ағылшыншылдық (англицизм) бар",
      },
    ],
    improvementTips: [
      {
        en: "Practice the subjunctive after common triggers: il faut que, bien que, pour que",
        ru: "Потренируйте сослагательное наклонение после распространённых триггеров: il faut que, bien que, pour que",
        kz: "Жиі кездесетін тіркестерден кейін бағыныңқы райды жаттығыңыз: il faut que, bien que, pour que",
      },
      {
        en: "Review past-participle agreement with avoir when the object comes first",
        ru: "Повторите согласование причастия с avoir, когда дополнение стоит перед глаголом",
        kz: "Толықтауыш бұрын тұрғанда avoir-мен есімшенің келісуін қайталаңыз",
      },
      {
        en: "Read authentic B1 letters and essays to internalize natural sentence structure",
        ru: "Читайте аутентичные письма и эссе уровня B1, чтобы усвоить естественную структуру предложений",
        kz: "Табиғи сөйлем құрылымын меңгеру үшін түпнұсқа B1 деңгейіндегі хаттар мен эсселерді оқыңыз",
      },
      {
        en: "Vary your connectors further: néanmoins, par ailleurs, de plus",
        ru: "Разнообразьте союзы ещё больше: néanmoins, par ailleurs, de plus",
        kz: "Жалғаулықтарды одан әрі әртараптандырыңыз: néanmoins, par ailleurs, de plus",
      },
    ],
    baseScore: 15,
    conclusionRequired: true,
  },
  B2: {
    grammarPool: [
      {
        id: "b2-si-clause",
        original: "si j'aurais su, je serais venu",
        correction: "si j'avais su, je serais venu",
        category: "verb",
        explanation: {
          en: "In a hypothetical past (\"si\" clause), use the plus-que-parfait (\"j'avais su\"), never the conditional, after \"si\".",
          ru: "В условном предложении о прошлом («si») после «si» используется plus-que-parfait («j'avais su»), а не условное наклонение.",
          kz: "«Si» бар шартты сөйлемде (өткен шақ туралы) «si»-дан кейін plus-que-parfait («j'avais su») қолданылады, шартты рай емес.",
        },
      },
      {
        id: "b2-ceci-agreement",
        original: "la plupart des gens pensent que ceci sont vrai",
        correction: "la plupart des gens pensent que ceci est vrai",
        category: "agreement",
        explanation: {
          en: "\"Ceci\" is singular, so the verb must agree in the singular: \"est\", not \"sont\".",
          ru: "«Ceci» — местоимение единственного числа, поэтому глагол должен согласовываться в единственном числе: «est», а не «sont».",
          kz: "«Ceci» — жекеше есімдік, сондықтан етістік жекеше түрде келісуі керек: «est», «sont» емес.",
        },
      },
      {
        id: "b2-bien-que",
        original: "bien qu'il est tard, nous continuons",
        correction: "bien qu'il soit tard, nous continuons",
        category: "verb",
        explanation: {
          en: "\"Bien que\" always triggers the subjunctive: \"soit\", not the indicative \"est\".",
          ru: "«Bien que» всегда требует сослагательного наклонения: «soit», а не изъявительного «est».",
          kz: "«Bien que» әрқашан бағыныңқы райды талап етеді: «soit», ашық рай «est» емес.",
        },
      },
      {
        id: "b2-stacked-connectors",
        original: "bien qu'on puisse argumenter que, cependant",
        correction: "bien qu'on puisse argumenter que cela soit discutable, cependant",
        category: "sentence-structure",
        explanation: {
          en: "Avoid stacking two contrastive connectors (\"bien que\" ... \"cependant\") in the same sentence — choose one to keep the argument clear.",
          ru: "Избегайте нагромождения двух противительных союзов («bien que» ... «cependant») в одном предложении — выберите один, чтобы аргумент оставался ясным.",
          kz: "Бір сөйлемде екі қарсы мәнді жалғаулықты («bien que» ... «cependant») қатар қолданбаңыз — дәлелдің анық болуы үшін біреуін таңдаңыз.",
        },
      },
    ],
    vocabulary: {
      wordChoice: {
        en: "Vocabulary is precise in places but occasionally imprecise for the nuanced argumentation expected at B2.",
        ru: "Лексика местами точна, но иногда недостаточно точна для нюансированной аргументации, ожидаемой на уровне B2.",
        kz: "Сөздік қор кейбір жерлерде дәл, бірақ B2 деңгейіне тән нәзік дәлелдеу үшін кейде жеткіліксіз дәл.",
      },
      variety: {
        en: "Good range of register and connectors, approaching the nuance expected at B2.",
        ru: "Хороший диапазон стилистических регистров и союзов, приближающийся к нюансировке, ожидаемой на уровне B2.",
        kz: "Стиль бен жалғаулықтардың ауқымы жақсы, B2 деңгейіне тән нәзіктікке жақындайды.",
      },
      levelAppropriateness: {
        en: "Mostly appropriate for B2; a few B1-level simplifications appear where more nuance was expected.",
        ru: "В основном соответствует уровню B2; в некоторых местах, где ожидалась большая нюансировка, встречаются упрощения уровня B1.",
        kz: "Негізінен B2 деңгейіне сай; кейбір жерлерде күрделірек ой күтілсе де, B1 деңгейіндегі жеңілдетулер кездеседі.",
      },
    },
    strengths: [
      {
        en: "Presents a clear, structured argument with a defined thesis",
        ru: "Представляет чёткую, структурированную аргументацию с ясно сформулированным тезисом",
        kz: "Анық тезисі бар құрылымдалған дәлелдеме ұсынады",
      },
      {
        en: "Uses complex sentence structures and a range of connectors",
        ru: "Использует сложные синтаксические конструкции и разнообразные союзы",
        kz: "Күрделі сөйлем құрылымдарын және әртүрлі жалғаулықтарды қолданады",
      },
      {
        en: "Engages with counterarguments before stating a personal position",
        ru: "Рассматривает контраргументы, прежде чем изложить личную позицию",
        kz: "Жеке көзқарасын білдірмес бұрын қарсы дәлелдерді қарастырады",
      },
      {
        en: "Register is consistently appropriate for a formal essay",
        ru: "Стилистический регистр последовательно соответствует формальному эссе",
        kz: "Стилі формалды эссеге сәйкес түрде тұрақты сақталған",
      },
    ],
    weaknesses: [
      {
        en: "Subjunctive after \"bien que\" is inconsistently applied",
        ru: "Сослагательное наклонение после «bien que» применяется непоследовательно",
        kz: "«Bien que»-ден кейінгі бағыныңқы рай тұрақты қолданылмаған",
      },
      {
        en: "Conditional/hypothetical structures (si-clauses) contain agreement errors",
        ru: "В условных/гипотетических конструкциях (предложения с si) встречаются ошибки согласования",
        kz: "Шартты/болжамды құрылымдарда (si-сөйлемдер) келісім қателері бар",
      },
      {
        en: "A few sentences stack too many connectors, weakening clarity",
        ru: "В некоторых предложениях нагромождено слишком много союзов, что снижает ясность",
        kz: "Кейбір сөйлемдерде тым көп жалғаулық қатар қолданылған, бұл анықтықты төмендетеді",
      },
    ],
    improvementTips: [
      {
        en: "Drill the si-clause tense sequences: si + imparfait → conditionnel; si + plus-que-parfait → conditionnel passé",
        ru: "Отработайте последовательность времён в предложениях с si: si + imparfait → conditionnel; si + plus-que-parfait → conditionnel passé",
        kz: "Si-сөйлемдердегі шақ тізбегін жаттығыңыз: si + imparfait → conditionnel; si + plus-que-parfait → conditionnel passé",
      },
      {
        en: "Review subjunctive triggers systematically (bien que, quoique, à moins que)",
        ru: "Системно повторите триггеры сослагательного наклонения (bien que, quoique, à moins que)",
        kz: "Бағыныңқы райды талап ететін тіркестерді жүйелі түрде қайталаңыз (bien que, quoique, à moins que)",
      },
      {
        en: "Aim for one clear connector per sentence rather than stacking several",
        ru: "Стремитесь использовать один чёткий союз на предложение, а не нагромождать несколько",
        kz: "Бір сөйлемде бірнешеуін емес, бір анық жалғаулықты қолдануға тырысыңыз",
      },
      {
        en: "Practice timed essays to sharpen argument structure under exam conditions",
        ru: "Практикуйте написание эссе на время, чтобы отточить структуру аргументации в условиях экзамена",
        kz: "Емтихан жағдайында дәлелдеу құрылымын жетілдіру үшін уақыты шектелген эссе жаттығуларын орындаңыз",
      },
    ],
    baseScore: 14,
    conclusionRequired: true,
  },
};

/** Selection produced by the (randomized) analysis step. Language-neutral
 * — safe to keep in client state and re-localize instantly. */
export interface EvaluationSelection {
  level: DelfLevel;
  wordCount: number;
  addressedPrompt: boolean;
  respectedFormat: boolean;
  hasIntroduction: boolean;
  hasMainIdeas: boolean;
  hasConclusion: boolean;
  conclusionRequired: boolean;
  selectedErrorIds: string[];
  strengthIndices: number[];
  weaknessIndices: number[];
  tipIndices: number[];
  estimatedScore: number;
  scoreOutOf: number;
}

const GREETING_PATTERN = /\b(bonjour|cher|ch[eè]re|salut|madame|monsieur)\b/i;
const CLOSING_PATTERN =
  /\b(cordialement|bisous|[aà] bient[oô]t|bien [aà] vous|salutations|amicalement)\b/i;

function pickIndices(length: number, count: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const shuffled = indices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).sort((a, b) => a - b);
}

export function analyzeResponse(
  level: DelfLevel,
  responseText: string,
  wordCount: number
): EvaluationSelection {
  const profile = MOCK_PROFILES[level];
  const config = DELF_WRITING_LEVELS[level];

  const hasIntroduction = GREETING_PATTERN.test(responseText) || wordCount > 5;
  const hasConclusion = CLOSING_PATTERN.test(responseText);
  const hasMainIdeas = wordCount >= config.minWords * 0.5;
  const inRange = wordCount >= config.minWords * 0.8 && wordCount <= config.maxWords * 1.3;
  const addressedPrompt = wordCount >= Math.max(10, config.minWords * 0.4);

  const errorCount = Math.min(3, profile.grammarPool.length);
  const selectedErrorIds = pickIndices(profile.grammarPool.length, errorCount).map(
    (i) => profile.grammarPool[i].id
  );

  const scoreJitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  const rangeAdjustment = inRange ? 1 : -2;
  const estimatedScore = Math.max(
    5,
    Math.min(25, profile.baseScore + rangeAdjustment + scoreJitter)
  );

  return {
    level,
    wordCount,
    addressedPrompt,
    respectedFormat: inRange,
    hasIntroduction,
    hasMainIdeas,
    hasConclusion,
    conclusionRequired: profile.conclusionRequired,
    selectedErrorIds,
    strengthIndices: pickIndices(profile.strengths.length, 3),
    weaknessIndices: pickIndices(
      profile.weaknesses.length,
      Math.min(errorCount + 1, profile.weaknesses.length)
    ),
    tipIndices: pickIndices(profile.improvementTips.length, 3),
    estimatedScore,
    scoreOutOf: 25,
  };
}

const TASK_NOTES = {
  short: (level: DelfLevel, wordCount: number): TranslatedText => ({
    en: `The response is too short (${wordCount} words) to fully develop the task expected at ${level}.`,
    ru: `Ответ слишком короткий (${wordCount} слов), чтобы полностью раскрыть задание уровня ${level}.`,
    kz: `Жауап тым қысқа (${wordCount} сөз) — бұл ${level} деңгейіне тән тапсырманы толық аша алмайды.`,
  }),
  inRange: (level: DelfLevel, min: number, max: number): TranslatedText => ({
    en: `The response engages with the prompt and stays close to the expected ${min}-${max} word range for ${level}.`,
    ru: `Ответ раскрывает тему и укладывается в ожидаемый диапазон ${min}-${max} слов для уровня ${level}.`,
    kz: `Жауап тақырыпты ашады және ${level} деңгейі үшін күтілетін ${min}-${max} сөз аралығына сай келеді.`,
  }),
  outOfRange: (level: DelfLevel, wordCount: number, min: number, max: number): TranslatedText => ({
    en: `The response engages with the prompt, but at ${wordCount} words it falls outside the expected ${min}-${max} word range for ${level} — aim to match the target length more closely.`,
    ru: `Ответ раскрывает тему, но при объёме в ${wordCount} слов выходит за пределы ожидаемого диапазона ${min}-${max} слов для уровня ${level} — постарайтесь точнее соблюдать нужный объём.`,
    kz: `Жауап тақырыпты ашады, бірақ ${wordCount} сөз ${level} деңгейі үшін күтілетін ${min}-${max} сөз аралығынан тыс — көлемді мақсатты аралыққа жақындатуға тырысыңыз.`,
  }),
};

const PARAGRAPH_ORGANIZATION: { withMainIdeas: TranslatedText; without: TranslatedText } = {
  withMainIdeas: {
    en: "Ideas are organized into readable segments, though transitions between them could be smoother.",
    ru: "Идеи организованы в читаемые смысловые блоки, однако переходы между ними можно сделать более плавными.",
    kz: "Ойлар оқуға ыңғайлы бөліктерге бөлінген, дегенмен олардың арасындағы байланыс тегісірек болуы мүмкін еді.",
  },
  without: {
    en: "The response would benefit from clearer paragraph breaks separating each idea.",
    ru: "Ответу не хватает чётких абзацев, разделяющих отдельные идеи.",
    kz: "Жауапта әрбір ойды бөлек көрсететін анық абзацтар жетіспейді.",
  },
};

const LANGUAGE_SUMMARY = {
  withErrors: (count: number, level: DelfLevel): TranslatedText => ({
    en: `Found ${count} recurring error pattern${count === 1 ? "" : "s"} typical of ${level} learners — see the corrections below.`,
    ru: `Обнаружено ${count} повторяющихся грамматических ошибок, типичных для уровня ${level} — см. исправления ниже.`,
    kz: `${level} деңгейіндегі оқушыларға тән ${count} қайталанатын қате анықталды — түзетулерді төменнен қараңыз.`,
  }),
  noErrors: {
    en: "No major recurring grammar patterns flagged for this response.",
    ru: "Существенных повторяющихся грамматических ошибок в этом ответе не обнаружено.",
    kz: "Бұл жауапта елеулі қайталанатын грамматикалық қателер табылмады.",
  } as TranslatedText,
};

const SCORE_EXPLANATION = {
  strong: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A strong result — ${score}/${scoreOutOf} indicates this response would likely meet the DELF ${level} passing standard comfortably.`,
    ru: `Хороший результат — ${score}/${scoreOutOf} говорит о том, что этот ответ, скорее всего, уверенно соответствует проходному уровню DELF ${level}.`,
    kz: `Жақсы нәтиже — ${score}/${scoreOutOf} бұл жауаптың DELF ${level} өту деңгейіне сенімді түрде сай келетінін көрсетеді.`,
  }),
  borderline: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `A borderline result — ${score}/${scoreOutOf} suggests this response is close to the DELF ${level} passing standard but needs refinement to be reliable on exam day.`,
    ru: `Пограничный результат — ${score}/${scoreOutOf} означает, что ответ близок к проходному уровню DELF ${level}, но нуждается в доработке для уверенной сдачи экзамена.`,
    kz: `Шекаралық нәтиже — ${score}/${scoreOutOf} бұл жауаптың DELF ${level} өту деңгейіне жақын екенін, бірақ емтихан күні сенімді болу үшін жетілдіруді қажет ететінін білдіреді.`,
  }),
  weak: (level: DelfLevel, score: number, scoreOutOf: number): TranslatedText => ({
    en: `Below the target — ${score}/${scoreOutOf} indicates this response would likely fall short of the DELF ${level} passing standard without further practice.`,
    ru: `Ниже целевого уровня — ${score}/${scoreOutOf} означает, что без дополнительной практики этот ответ, скорее всего, не дотянет до проходного уровня DELF ${level}.`,
    kz: `Мақсатты деңгейден төмен — ${score}/${scoreOutOf} қосымша жаттығусыз бұл жауаптың DELF ${level} өту деңгейіне жетпей қалуы мүмкін екенін көрсетеді.`,
  }),
};

/** Pure and deterministic — turns a language-neutral selection into
 * display text in the requested language. No randomness, safe to call
 * on the client for instant re-translation. */
export function localizeEvaluation(
  selection: EvaluationSelection,
  language: FeedbackLanguage
): Omit<WritingEvaluation, "level" | "wordCount"> {
  const profile = MOCK_PROFILES[selection.level];
  const config = DELF_WRITING_LEVELS[selection.level];

  const taskCompletion: TaskCompletionFeedback = {
    addressedPrompt: selection.addressedPrompt,
    respectedFormat: selection.respectedFormat,
    notes: !selection.addressedPrompt
      ? TASK_NOTES.short(selection.level, selection.wordCount)[language]
      : selection.respectedFormat
        ? TASK_NOTES.inRange(selection.level, config.minWords, config.maxWords)[language]
        : TASK_NOTES.outOfRange(
            selection.level,
            selection.wordCount,
            config.minWords,
            config.maxWords
          )[language],
  };

  const structure: StructureFeedback = {
    hasIntroduction: selection.hasIntroduction,
    hasMainIdeas: selection.hasMainIdeas,
    hasConclusion: selection.hasConclusion,
    conclusionRequired: selection.conclusionRequired,
    paragraphOrganization: (selection.hasMainIdeas
      ? PARAGRAPH_ORGANIZATION.withMainIdeas
      : PARAGRAPH_ORGANIZATION.without)[language],
  };

  const errors: GrammarError[] = selection.selectedErrorIds.map((id) => {
    const template = profile.grammarPool.find((e) => e.id === id)!;
    return {
      original: template.original,
      correction: template.correction,
      category: template.category,
      explanation: template.explanation[language],
    };
  });

  const languageAccuracy: LanguageAccuracyFeedback = {
    errors,
    summary:
      errors.length > 0
        ? LANGUAGE_SUMMARY.withErrors(errors.length, selection.level)[language]
        : LANGUAGE_SUMMARY.noErrors[language],
  };

  const vocabulary: VocabularyFeedback = {
    wordChoice: profile.vocabulary.wordChoice[language],
    variety: profile.vocabulary.variety[language],
    levelAppropriateness: profile.vocabulary.levelAppropriateness[language],
  };

  const ratio = selection.estimatedScore / selection.scoreOutOf;
  const tier = ratio >= 0.75 ? "strong" : ratio >= 0.5 ? "borderline" : "weak";

  const examReadiness: ExamReadinessFeedback = {
    estimatedScore: selection.estimatedScore,
    scoreOutOf: selection.scoreOutOf,
    strengths: selection.strengthIndices.map((i) => profile.strengths[i][language]),
    weaknesses: selection.weaknessIndices.map((i) => profile.weaknesses[i][language]),
    improvementTips: selection.tipIndices.map((i) => profile.improvementTips[i][language]),
    scoreExplanation: SCORE_EXPLANATION[tier](
      selection.level,
      selection.estimatedScore,
      selection.scoreOutOf
    )[language],
  };

  return { taskCompletion, structure, languageAccuracy, vocabulary, examReadiness };
}
