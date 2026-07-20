import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * DELF Production Orale structure per CEFR level, following the official
 * exam format so the mock evaluator grades against the same rubric a real
 * examiner would use. Mirrors the shape of config/delf-writing.ts.
 *
 * Only A1-B2 are defined — see lib/utils/level.ts for how the "Beginner"
 * onboarding level is clamped onto this set.
 *
 * `structureDescription` and each part's `instructions` describe the
 * exercise in the app's UI language (en/ru/kz) — `partLabel` and `prompt`
 * are the actual French exam content and are never translated.
 */

export interface SpeakingQuestionAlternate {
  prompt: string; // French
  translation: Record<FeedbackLanguage, string>;
}

export interface SpeakingQuestionSpec {
  id: string;
  prompt: string; // French — the actual exam prompt, never translated
  /** Shown only when the learner taps "Show translation" — the French
   * prompt itself is never auto-translated. */
  translation: Record<FeedbackLanguage, string>;
  suggestedDurationSeconds: number;
  /** Alternate curated phrasings for this same slot — the offline static
   * fallback randomly picks among the base prompt and these each session,
   * so two consecutive no-API-key sessions aren't always identical. */
  alternates?: SpeakingQuestionAlternate[];
}

export interface SpeakingExercisePart {
  id: string;
  partLabel: string; // official DELF exercise name, e.g. "Entretien dirigé"
  instructions: Record<FeedbackLanguage, string>;
  questions: SpeakingQuestionSpec[];
}

export interface SpeakingTopicChoice {
  title: string; // French
  translation: Record<FeedbackLanguage, string>;
}

export interface DelfSpeakingLevelConfig {
  level: DelfLevel;
  label: string;
  structureDescription: Record<FeedbackLanguage, string>;
  parts: SpeakingExercisePart[];
  evaluationCriteria: string[];
  /** Official DELF preparation time before speaking begins. */
  prepTimeMinutes: number;
  /** Official estimated total speaking-time range. */
  estimatedSpeakingMinutes: { min: number; max: number };
  /** B2 only — the two static fallback topics offered when no
   * ANTHROPIC_API_KEY is configured to generate fresh ones. */
  topicChoices?: SpeakingTopicChoice[];
}

export const DELF_SPEAKING_LEVELS: Record<DelfLevel, DelfSpeakingLevelConfig> = {
  A1: {
    level: "A1",
    label: "A1 · Découverte",
    structureDescription: {
      en: "Three short parts: a guided interview, an information exchange, and a simple role-play.",
      ru: "Три коротких части: направленное интервью, обмен информацией и простая ролевая игра.",
      kz: "Үш қысқа бөлім: бағытталған сұхбат, ақпарат алмасу және қарапайым рөлдік ойын.",
    },
    parts: [
      {
        id: "a1-entretien-dirige",
        partLabel: "Entretien dirigé",
        instructions: {
          en: "Answer the examiner's questions about yourself, simply and directly.",
          ru: "Ответьте на вопросы экзаменатора о себе просто и прямо.",
          kz: "Емтихан алушының өзіңіз туралы сұрақтарына қарапайым әрі тікелей жауап беріңіз.",
        },
        questions: [
          {
            id: "a1-ed-1",
            prompt:
              "Bonjour ! Pouvez-vous vous présenter : comment vous vous appelez, quel âge vous avez et où vous habitez ?",
            translation: {
              en: "Hello! Can you introduce yourself: what's your name, how old are you, and where do you live?",
              ru: "Здравствуйте! Не могли бы вы представиться: как вас зовут, сколько вам лет и где вы живёте?",
              kz: "Сәлеметсіз бе! Өзіңізді таныстыра аласыз ба: атыңыз кім, жасыңыз нешеде және қай жерде тұрасыз?",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Bonjour ! Comment vous appelez-vous, quel âge avez-vous, et dans quelle ville habitez-vous ?",
                translation: {
                  en: "Hello! What's your name, how old are you, and which city do you live in?",
                  ru: "Здравствуйте! Как вас зовут, сколько вам лет и в каком городе вы живёте?",
                  kz: "Сәлеметсіз бе! Атыңыз кім, жасыңыз нешеде және қай қалада тұрасыз?",
                },
              },
            ],
          },
          {
            id: "a1-ed-2",
            prompt: "Qu'est-ce que vous aimez faire pendant votre temps libre ?",
            translation: {
              en: "What do you like to do in your free time?",
              ru: "Что вы любите делать в свободное время?",
              kz: "Бос уақытыңызда не істегенді ұнатасыз?",
            },
            suggestedDurationSeconds: 30,
            alternates: [
              {
                prompt: "Qu'aimez-vous faire le week-end ?",
                translation: {
                  en: "What do you like to do on weekends?",
                  ru: "Что вы любите делать по выходным?",
                  kz: "Демалыс күндері не істегенді ұнатасыз?",
                },
              },
            ],
          },
          {
            id: "a1-ed-3",
            prompt:
              "Est-ce que vous avez des frères et sœurs ? Parlez-moi un peu de votre famille.",
            translation: {
              en: "Do you have any brothers or sisters? Tell me a little about your family.",
              ru: "У вас есть братья или сёстры? Расскажите немного о своей семье.",
              kz: "Сізде аға-іні, апа-қарындас бар ма? Отбасыңыз туралы азырақ айтып беріңізші.",
            },
            suggestedDurationSeconds: 30,
            alternates: [
              {
                prompt: "Combien de personnes y a-t-il dans votre famille ? Parlez-moi d'elles.",
                translation: {
                  en: "How many people are in your family? Tell me about them.",
                  ru: "Сколько человек в вашей семье? Расскажите о них.",
                  kz: "Отбасыңызда неше адам бар? Олар туралы айтып беріңіз.",
                },
              },
            ],
          },
        ],
      },
      {
        id: "a1-echange-informations",
        partLabel: "Échange d'informations",
        instructions: {
          en: "Using the topic given, formulate two or three simple questions as if asking the examiner.",
          ru: "Используя заданную тему, сформулируйте два-три простых вопроса, как будто вы спрашиваете экзаменатора.",
          kz: "Берілген тақырыпты пайдаланып, емтихан алушыдан сұрағандай екі-үш қарапайым сұрақ құрастырыңыз.",
        },
        questions: [
          {
            id: "a1-ei-1",
            prompt:
              "Voici un mot clé : LES VACANCES. Posez-moi trois questions sur ce sujet (par exemple : où, quand, avec qui).",
            translation: {
              en: "Here is a keyword: HOLIDAYS. Ask me three questions on this topic (for example: where, when, with whom).",
              ru: "Вот ключевое слово: КАНИКУЛЫ. Задайте мне три вопроса по этой теме (например: где, когда, с кем).",
              kz: "Міне, түйінді сөз: ДЕМАЛЫС. Осы тақырып бойынша маған үш сұрақ қойыңыз (мысалы: қайда, қашан, кіммен).",
            },
            suggestedDurationSeconds: 60,
            alternates: [
              {
                prompt: "Voici un mot clé : LE SPORT. Posez-moi trois questions sur ce sujet.",
                translation: {
                  en: "Here is a keyword: SPORT. Ask me three questions on this topic.",
                  ru: "Вот ключевое слово: СПОРТ. Задайте мне три вопроса по этой теме.",
                  kz: "Міне, түйінді сөз: СПОРТ. Осы тақырып бойынша маған үш сұрақ қойыңыз.",
                },
              },
            ],
          },
        ],
      },
      {
        id: "a1-dialogue-simule",
        partLabel: "Dialogue simulé",
        instructions: {
          en: "Play the role described and respond as you would in a real everyday situation.",
          ru: "Сыграйте описанную роль и отвечайте так, как в реальной повседневной ситуации.",
          kz: "Сипатталған рөлді ойнап, нақты күнделікті жағдайдағыдай жауап беріңіз.",
        },
        questions: [
          {
            id: "a1-ds-1",
            prompt:
              "Vous êtes dans un magasin et vous voulez acheter un cadeau pour un ami. Demandez de l'aide au vendeur.",
            translation: {
              en: "You are in a shop and want to buy a gift for a friend. Ask the shop assistant for help.",
              ru: "Вы находитесь в магазине и хотите купить подарок другу. Попросите продавца о помощи.",
              kz: "Сіз дүкенде тұрсыз және досыңызға сыйлық сатып алғыңыз келеді. Сатушыдан көмек сұраңыз.",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Vous êtes au restaurant et vous voulez commander un repas. Demandez de l'aide au serveur.",
                translation: {
                  en: "You are at a restaurant and want to order a meal. Ask the waiter for help.",
                  ru: "Вы в ресторане и хотите заказать еду. Попросите официанта о помощи.",
                  kz: "Сіз мейрамханадасыз және тамақ тапсырыс бергіңіз келеді. Даяршыдан көмек сұраңыз.",
                },
              },
            ],
          },
          {
            id: "a1-ds-2",
            prompt: "Le vendeur vous propose deux objets : lequel choisissez-vous, et pourquoi ?",
            translation: {
              en: "The shop assistant offers you two items: which one do you choose, and why?",
              ru: "Продавец предлагает вам два товара: какой вы выберете и почему?",
              kz: "Сатушы сізге екі зат ұсынады: қайсысын таңдайсыз және неге?",
            },
            suggestedDurationSeconds: 30,
            alternates: [
              {
                prompt: "Le serveur vous propose deux plats : lequel choisissez-vous, et pourquoi ?",
                translation: {
                  en: "The waiter offers you two dishes: which one do you choose, and why?",
                  ru: "Официант предлагает вам два блюда: какое вы выберете и почему?",
                  kz: "Даяршы сізге екі тағам ұсынады: қайсысын таңдайсыз және неге?",
                },
              },
            ],
          },
        ],
      },
    ],
    evaluationCriteria: [
      "Conveys very basic personal information clearly",
      "Asks simple, understandable questions",
      "Handles a short everyday transaction",
      "Uses simple present-tense sentences with basic vocabulary",
    ],
    prepTimeMinutes: 0,
    estimatedSpeakingMinutes: { min: 5, max: 7 },
  },
  A2: {
    level: "A2",
    label: "A2 · Survie",
    structureDescription: {
      en: "Three parts: a guided interview, a short prepared talk, and a role-play in an everyday situation.",
      ru: "Три части: направленное интервью, короткое подготовленное выступление и ролевая игра в повседневной ситуации.",
      kz: "Үш бөлім: бағытталған сұхбат, қысқа дайындалған сөз және күнделікті жағдайдағы рөлдік ойын.",
    },
    parts: [
      {
        id: "a2-entretien-dirige",
        partLabel: "Entretien dirigé",
        instructions: {
          en: "Present yourself, then answer a couple of follow-up questions.",
          ru: "Представьтесь, затем ответьте на пару дополнительных вопросов.",
          kz: "Өзіңізді таныстырып, содан кейін бірнеше қосымша сұраққа жауап беріңіз.",
        },
        questions: [
          {
            id: "a2-ed-1",
            prompt:
              "Présentez-vous : votre nom, votre travail ou vos études, et votre ville.",
            translation: {
              en: "Introduce yourself: your name, your job or studies, and your city.",
              ru: "Представьтесь: ваше имя, работа или учёба и город.",
              kz: "Өзіңізді таныстырыңыз: атыңыз, жұмысыңыз немесе оқуыңыз және қалаңыз.",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Comment vous appelez-vous, que faites-vous dans la vie, et où habitez-vous ?",
                translation: {
                  en: "What's your name, what do you do for a living, and where do you live?",
                  ru: "Как вас зовут, чем вы занимаетесь и где вы живёте?",
                  kz: "Атыңыз кім, немен айналысасыз және қай жерде тұрасыз?",
                },
              },
            ],
          },
          {
            id: "a2-ed-2",
            prompt: "Qu'est-ce que vous avez fait le week-end dernier ?",
            translation: {
              en: "What did you do last weekend?",
              ru: "Что вы делали в прошлые выходные?",
              kz: "Өткен демалыс күндері не істедіңіз?",
            },
            suggestedDurationSeconds: 30,
            alternates: [
              {
                prompt: "Qu'est-ce que vous avez fait pendant vos dernières vacances ?",
                translation: {
                  en: "What did you do during your last vacation?",
                  ru: "Что вы делали во время последнего отпуска?",
                  kz: "Соңғы демалысыңызда не істедіңіз?",
                },
              },
            ],
          },
        ],
      },
      {
        id: "a2-monologue-suivi",
        partLabel: "Monologue suivi",
        instructions: {
          en: "Speak for about a minute on the topic below, without being interrupted.",
          ru: "Говорите около минуты на тему ниже, не прерываясь.",
          kz: "Төмендегі тақырыпта үзілместен шамамен бір минут сөйлеңіз.",
        },
        questions: [
          {
            id: "a2-ms-1",
            prompt: "Parlez-moi de votre ville ou de votre village natal.",
            translation: {
              en: "Tell me about your hometown or native village.",
              ru: "Расскажите мне о своём родном городе или селе.",
              kz: "Маған туған қалаңыз немесе ауылыңыз туралы айтып беріңіз.",
            },
            suggestedDurationSeconds: 60,
            alternates: [
              {
                prompt: "Décrivez votre quartier ou votre maison.",
                translation: {
                  en: "Describe your neighborhood or your house.",
                  ru: "Опишите свой район или свой дом.",
                  kz: "Ауданыңызды немесе үйіңізді сипаттаңыз.",
                },
              },
            ],
          },
        ],
      },
      {
        id: "a2-dialogue-simule",
        partLabel: "Dialogue simulé",
        instructions: {
          en: "Handle the everyday situation as naturally as you can.",
          ru: "Разыграйте повседневную ситуацию как можно естественнее.",
          kz: "Күнделікті жағдайды мүмкіндігінше табиғи түрде шешіңіз.",
        },
        questions: [
          {
            id: "a2-ds-1",
            prompt:
              "Vous appelez un ami pour organiser une sortie ce week-end. Proposez une activité et un horaire.",
            translation: {
              en: "You call a friend to plan an outing this weekend. Suggest an activity and a time.",
              ru: "Вы звоните другу, чтобы организовать прогулку в эти выходные. Предложите занятие и время.",
              kz: "Сіз досыңызға қоңырау шалып, осы демалыс күндері серуенге шығуды ұсынасыз. Іс-шара мен уақытты ұсыныңыз.",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Vous invitez un ami à dîner chez vous ce week-end. Proposez un jour et une heure.",
                translation: {
                  en: "You invite a friend to dinner at your place this weekend. Suggest a day and a time.",
                  ru: "Вы приглашаете друга на ужин к себе в эти выходные. Предложите день и время.",
                  kz: "Сіз досыңызды осы демалыс күндері үйіңізге кешкі асқа шақырасыз. Күн мен уақытты ұсыныңыз.",
                },
              },
            ],
          },
          {
            id: "a2-ds-2",
            prompt: "Votre ami ne peut pas ce jour-là : proposez une autre solution.",
            translation: {
              en: "Your friend can't make it that day: suggest another solution.",
              ru: "Ваш друг не может в этот день: предложите другое решение.",
              kz: "Досыңыз сол күні бос емес: басқа шешім ұсыныңыз.",
            },
            suggestedDurationSeconds: 30,
            alternates: [
              {
                prompt: "Votre ami propose de changer le lieu du dîner : que répondez-vous ?",
                translation: {
                  en: "Your friend suggests changing the location of the dinner: how do you respond?",
                  ru: "Ваш друг предлагает изменить место ужина: что вы ответите?",
                  kz: "Досыңыз кешкі ас өтетін жерді өзгертуді ұсынады: сіз не деп жауап бересіз?",
                },
              },
            ],
          },
        ],
      },
    ],
    evaluationCriteria: [
      "Narrates a recent event using appropriate past tense",
      "Sustains a short monologue on a familiar topic",
      "Negotiates simple plans in a role-play",
      "Vocabulary covers everyday topics (family, daily life, leisure)",
    ],
    prepTimeMinutes: 0,
    estimatedSpeakingMinutes: { min: 6, max: 8 },
  },
  B1: {
    level: "B1",
    label: "B1 · Seuil",
    structureDescription: {
      en: "Three parts: a brief personal presentation, an interactive role-play, and a viewpoint discussion based on a short document.",
      ru: "Три части: краткая презентация себя, интерактивная ролевая игра и обсуждение точки зрения по короткому документу.",
      kz: "Үш бөлім: қысқа жеке таныстыру, интерактивті рөлдік ойын және қысқа құжат негізіндегі көзқарасты талқылау.",
    },
    parts: [
      {
        id: "b1-entretien-dirige",
        partLabel: "Entretien dirigé",
        instructions: {
          en: "Briefly present yourself and your motivations.",
          ru: "Кратко представьтесь и расскажите о своей мотивации.",
          kz: "Өзіңізді және ниетіңізді қысқаша таныстырыңыз.",
        },
        questions: [
          {
            id: "b1-ed-1",
            prompt:
              "Présentez-vous brièvement : qui êtes-vous, et pourquoi apprenez-vous le français ?",
            translation: {
              en: "Briefly introduce yourself: who are you, and why are you learning French?",
              ru: "Кратко представьтесь: кто вы и почему вы изучаете французский язык?",
              kz: "Өзіңізді қысқаша таныстырыңыз: сіз кімсіз және неге француз тілін үйреніп жатырсыз?",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Qui êtes-vous et quels sont vos projets pour l'avenir ?",
                translation: {
                  en: "Who are you and what are your plans for the future?",
                  ru: "Кто вы и какие у вас планы на будущее?",
                  kz: "Сіз кімсіз және болашаққа қандай жоспарларыңыз бар?",
                },
              },
            ],
          },
        ],
      },
      {
        id: "b1-exercice-interaction",
        partLabel: "Exercice en interaction",
        instructions: {
          en: "Negotiate a solution to the everyday situation described, as if speaking with the examiner.",
          ru: "Договоритесь о решении описанной повседневной ситуации, как будто разговариваете с экзаменатором.",
          kz: "Емтихан алушымен сөйлескендей, сипатталған күнделікті жағдайға шешім табыңыз.",
        },
        questions: [
          {
            id: "b1-ei-1",
            prompt:
              "Vous partez en voyage avec des amis, mais vous n'êtes pas d'accord sur le budget. Expliquez votre point de vue et proposez un compromis.",
            translation: {
              en: "You're going on a trip with friends, but you disagree about the budget. Explain your point of view and propose a compromise.",
              ru: "Вы отправляетесь в путешествие с друзьями, но не согласны насчёт бюджета. Объясните свою точку зрения и предложите компромисс.",
              kz: "Сіз достарыңызбен саяхатқа шығасыз, бірақ бюджет туралы келісе алмай жатырсыздар. Көзқарасыңызды түсіндіріп, ымыраға келу жолын ұсыныңыз.",
            },
            suggestedDurationSeconds: 60,
            alternates: [
              {
                prompt: "Vous organisez un voyage avec des amis, mais vous n'êtes pas d'accord sur le logement. Expliquez votre point de vue et proposez un compromis.",
                translation: {
                  en: "You're organizing a trip with friends, but you disagree about accommodation. Explain your point of view and propose a compromise.",
                  ru: "Вы организуете поездку с друзьями, но не согласны насчёт жилья. Объясните свою точку зрения и предложите компромисс.",
                  kz: "Сіз достарыңызбен саяхат ұйымдастырасыз, бірақ тұрғын үй туралы келісе алмайсыздар. Көзқарасыңызды түсіндіріп, ымыраға келу жолын ұсыныңыз.",
                },
              },
            ],
          },
          {
            id: "b1-ei-2",
            prompt: "Votre ami propose de réduire le nombre de nuits d'hôtel : qu'en pensez-vous ?",
            translation: {
              en: "Your friend suggests reducing the number of hotel nights: what do you think about that?",
              ru: "Ваш друг предлагает сократить количество ночей в отеле: что вы об этом думаете?",
              kz: "Досыңыз қонақүйде түнейтін түндер санын азайтуды ұсынады: сіз бұл туралы не ойлайсыз?",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Votre ami propose de changer complètement de destination : qu'en pensez-vous ?",
                translation: {
                  en: "Your friend suggests changing the destination completely: what do you think?",
                  ru: "Ваш друг предлагает полностью изменить место назначения: что вы об этом думаете?",
                  kz: "Досыңыз бару жерін мүлдем өзгертуді ұсынады: сіз бұл туралы не ойлайсыз?",
                },
              },
            ],
          },
        ],
      },
      {
        id: "b1-point-de-vue",
        partLabel: "Expression d'un point de vue à partir d'un document déclencheur",
        instructions: {
          en: "Give your opinion on the short prompt below, then be ready to discuss it further.",
          ru: "Выскажите своё мнение по короткому заданию ниже, а затем будьте готовы обсудить его подробнее.",
          kz: "Төмендегі қысқа тапсырма туралы пікіріңізді айтыңыз, содан кейін оны әрі қарай талқылауға дайын болыңыз.",
        },
        questions: [
          {
            id: "b1-pv-1",
            prompt:
              "Document : « De plus en plus de salariés travaillent depuis chez eux. » Qu'en pensez-vous ? Est-ce une bonne chose ?",
            translation: {
              en: "Document: \"More and more employees are working from home.\" What do you think? Is this a good thing?",
              ru: "Документ: «Всё больше сотрудников работают из дома». Что вы об этом думаете? Это хорошо?",
              kz: "Құжат: «Көбірек қызметкерлер үйден жұмыс істейді». Сіз бұл туралы не ойлайсыз? Бұл жақсы нәрсе ме?",
            },
            suggestedDurationSeconds: 75,
            alternates: [
              {
                prompt: "Document : « De plus en plus de gens font leurs achats en ligne plutôt qu'en magasin. » Qu'en pensez-vous ? Est-ce une bonne évolution ?",
                translation: {
                  en: "Document: \"More and more people shop online rather than in stores.\" What do you think? Is this a good development?",
                  ru: "Документ: «Всё больше людей делают покупки онлайн, а не в магазинах». Что вы об этом думаете? Это хорошая тенденция?",
                  kz: "Құжат: «Көбірек адамдар дүкенде емес, онлайн сатып алады». Сіз бұл туралы не ойлайсыз? Бұл жақсы үрдіс пе?",
                },
              },
            ],
          },
          {
            id: "b1-pv-2",
            prompt: "Quels sont les inconvénients du télétravail selon vous ?",
            translation: {
              en: "What are the disadvantages of remote work, in your opinion?",
              ru: "Какие, по вашему мнению, недостатки удалённой работы?",
              kz: "Сіздің ойыңызша, қашықтан жұмыс істеудің кемшіліктері қандай?",
            },
            suggestedDurationSeconds: 45,
            alternates: [
              {
                prompt: "Quels sont les inconvénients des achats en ligne selon vous ?",
                translation: {
                  en: "What are the disadvantages of online shopping, in your opinion?",
                  ru: "Какие, по вашему мнению, недостатки покупок онлайн?",
                  kz: "Сіздің ойыңызша, онлайн сатып алудың кемшіліктері қандай?",
                },
              },
            ],
          },
        ],
      },
    ],
    evaluationCriteria: [
      "States and maintains a clear personal opinion",
      "Negotiates and proposes compromises in interaction",
      "Supports a viewpoint with examples and reasons",
      "Uses a range of tenses and connectors accurately",
    ],
    prepTimeMinutes: 10,
    estimatedSpeakingMinutes: { min: 15, max: 15 },
  },
  B2: {
    level: "B2",
    label: "B2 · Avancé",
    structureDescription: {
      en: "A single extended task: present a structured argument from a document, then defend it under examiner questioning.",
      ru: "Одна расширенная задача: представить структурированный аргумент по документу, а затем защитить его, отвечая на вопросы экзаменатора.",
      kz: "Бір ұзартылған тапсырма: құжат негізінде құрылымды дәлел ұсынып, содан кейін емтихан алушының сұрақтарына жауап беру арқылы оны қорғау.",
    },
    parts: [
      {
        id: "b2-point-de-vue",
        partLabel: "Présentation et défense d'un point de vue",
        instructions: {
          en: "Present a structured argument on the document below, then respond to follow-up challenges.",
          ru: "Представьте структурированный аргумент по документу ниже, а затем ответьте на дополнительные возражения.",
          kz: "Төмендегі құжат бойынша құрылымды дәлел ұсыныңыз, содан кейін қосымша қарсылықтарға жауап беріңіз.",
        },
        questions: [
          {
            id: "b2-pv-1",
            prompt:
              "Document : « Les réseaux sociaux ont-ils un effet positif ou négatif sur les jeunes ? » Présentez votre point de vue de façon structurée.",
            translation: {
              en: "Document: \"Do social media have a positive or negative effect on young people?\" Present your point of view in a structured way.",
              ru: "Документ: «Оказывают ли социальные сети положительное или отрицательное влияние на молодёжь?» Изложите свою точку зрения структурированно.",
              kz: "Құжат: «Әлеуметтік желілер жастарға оң немесе теріс әсер ете ме?» Көзқарасыңызды құрылымды түрде ұсыныңыз.",
            },
            suggestedDurationSeconds: 120,
            alternates: [
              {
                prompt: "Document : « Le télétravail va-t-il devenir la norme pour tous les métiers ? » Présentez votre point de vue de façon structurée.",
                translation: {
                  en: "Document: \"Will remote work become the norm for all professions?\" Present your point of view in a structured way.",
                  ru: "Документ: «Станет ли удалённая работа нормой для всех профессий?» Изложите свою точку зрения структурированно.",
                  kz: "Құжат: «Қашықтан жұмыс барлық мамандықтар үшін норма бола ма?» Көзқарасыңызды құрылымды түрде ұсыныңыз.",
                },
              },
            ],
          },
          {
            id: "b2-pv-2",
            prompt:
              "Certains disent que les réseaux sociaux favorisent l'isolement plutôt que le lien social. Que répondez-vous à cet argument ?",
            translation: {
              en: "Some say social media promotes isolation rather than social connection. How do you respond to this argument?",
              ru: "Некоторые говорят, что социальные сети способствуют изоляции, а не социальным связям. Что вы ответите на этот аргумент?",
              kz: "Кейбіреулер әлеуметтік желілер әлеуметтік байланыстан гөрі оқшаулануға ықпал етеді дейді. Бұл дәлелге қалай жауап бересіз?",
            },
            suggestedDurationSeconds: 60,
            alternates: [
              {
                prompt: "Certains disent que le télétravail réduit la productivité plutôt que de l'améliorer. Que répondez-vous à cet argument ?",
                translation: {
                  en: "Some say remote work reduces productivity rather than improving it. How do you respond to this argument?",
                  ru: "Некоторые говорят, что удалённая работа снижает продуктивность, а не повышает её. Что вы ответите на этот аргумент?",
                  kz: "Кейбіреулер қашықтан жұмыс өнімділікті арттырудың орнына төмендетеді дейді. Бұл дәлелге қалай жауап бересіз?",
                },
              },
            ],
          },
          {
            id: "b2-pv-3",
            prompt: "Quelles solutions proposeriez-vous pour limiter les effets négatifs ?",
            translation: {
              en: "What solutions would you propose to limit the negative effects?",
              ru: "Какие решения вы предложили бы, чтобы ограничить негативные последствия?",
              kz: "Теріс әсерлерді шектеу үшін қандай шешімдер ұсынар едіңіз?",
            },
            suggestedDurationSeconds: 60,
            alternates: [
              {
                prompt: "Quelles solutions proposeriez-vous pour que le télétravail profite à la fois aux employés et aux entreprises ?",
                translation: {
                  en: "What solutions would you propose so that remote work benefits both employees and companies?",
                  ru: "Какие решения вы предложили бы, чтобы удалённая работа приносила пользу и сотрудникам, и компаниям?",
                  kz: "Қашықтан жұмыс қызметкерлерге де, компанияларға да пайда әкелуі үшін қандай шешімдер ұсынар едіңіз?",
                },
              },
            ],
          },
        ],
      },
    ],
    evaluationCriteria: [
      "Presents a clear, well-structured argument with a defined thesis",
      "Defends the position convincingly under counter-questioning",
      "Uses complex sentence structures and nuanced connectors",
      "Register is consistently appropriate for a formal debate",
    ],
    prepTimeMinutes: 30,
    estimatedSpeakingMinutes: { min: 20, max: 20 },
    topicChoices: [
      {
        title: "Les réseaux sociaux ont-ils un effet positif ou négatif sur les jeunes ?",
        translation: {
          en: "Do social media have a positive or negative effect on young people?",
          ru: "Оказывают ли социальные сети положительное или отрицательное влияние на молодёжь?",
          kz: "Әлеуметтік желілер жастарға оң немесе теріс әсер ете ме?",
        },
      },
      {
        title: "L'intelligence artificielle à l'école : une bonne idée ?",
        translation: {
          en: "Artificial intelligence in schools: a good idea?",
          ru: "Искусственный интеллект в школе: хорошая идея?",
          kz: "Мектептегі жасанды интеллект: жақсы идея ма?",
        },
      },
    ],
  },
};

export interface FlatSpeakingQuestion {
  partId: string;
  partLabel: string;
  questionId: string;
  prompt: string;
  translation: Record<FeedbackLanguage, string>;
  suggestedDurationSeconds: number;
}

/** Flattens a level's parts/questions into a single ordered queue for
 * driving a speaking session one question at a time. Randomly picks
 * between each question's base prompt and its curated `alternates` (if
 * any) so two consecutive offline (no-API-key) sessions at the same level
 * aren't always identical — every option is still hand-verified DELF-style
 * content, never generated on the fly. */
export function flattenSpeakingParts(
  config: DelfSpeakingLevelConfig
): FlatSpeakingQuestion[] {
  return config.parts.flatMap((part) =>
    part.questions.map((question) => {
      const options = [
        { prompt: question.prompt, translation: question.translation },
        ...(question.alternates ?? []),
      ];
      const chosen = options[Math.floor(Math.random() * options.length)];
      return {
        partId: part.id,
        partLabel: part.partLabel,
        questionId: question.id,
        prompt: chosen.prompt,
        translation: chosen.translation,
        suggestedDurationSeconds: question.suggestedDurationSeconds,
      };
    })
  );
}
