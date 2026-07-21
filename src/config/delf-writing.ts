import type { DelfLevel, DelfLevelConfig } from "@/types/writing-evaluation";

/**
 * DELF Production Écrite requirements per CEFR level. Task type, structure,
 * and word counts follow the official DELF exam format so the AI evaluator
 * grades against the same rubric a real examiner would use.
 *
 * `taskType` and `expectedStructure` describe the exercise in the app's UI
 * language (en/ru/kz) — only `samplePrompts[].*` is the actual French exam
 * content, which is never translated. Each level has a small pool of real
 * DELF-style prompts so a learner doesn't see the same topic every session
 * — see lib/writing/topicRotation.ts for how one is picked.
 */
export const DELF_LEVEL_ORDER: DelfLevel[] = ["A1", "A2", "B1", "B2"];

export const DELF_WRITING_LEVELS: Record<DelfLevel, DelfLevelConfig> = {
  A1: {
    level: "A1",
    label: "A1 · Découverte",
    taskType: {
      en: "Short message or form",
      ru: "Короткое сообщение или бланк",
      kz: "Қысқа хабарлама немесе бланк",
    },
    expectedStructure: {
      en: [
        "Greeting",
        "2–3 simple sentences conveying the required information",
        "Closing / sign-off",
      ],
      ru: [
        "Приветствие",
        "2–3 простых предложения с нужной информацией",
        "Прощание / подпись",
      ],
      kz: [
        "Сәлемдесу",
        "Қажетті ақпаратты жеткізетін 2–3 қарапайым сөйлем",
        "Қоштасу / қол қою",
      ],
    },
    minWords: 40,
    maxWords: 60,
    difficulty: "Beginner",
    evaluationCriteria: [
      "Conveys very basic personal information (name, age, address, likes)",
      "Uses simple present-tense sentences",
      "Uses everyday, high-frequency vocabulary",
      "Basic spelling and simple sentence punctuation",
    ],
    samplePrompts: [
      {
        id: "a1-club-sport",
        title: "Se présenter par message",
        delfExercise: "DELF A1 · Production Écrite",
        instructions:
          "Vous venez de vous inscrire dans un club de sport. Écrivez un message pour vous présenter : votre nom, votre âge, ce que vous aimez faire.",
      },
      {
        id: "a1-nouvel-ami",
        title: "Faire connaissance",
        delfExercise: "DELF A1 · Production Écrite",
        instructions:
          "Vous avez un nouvel ami francophone. Écrivez-lui un message pour vous présenter : votre nom, votre âge, où vous habitez et ce que vous aimez faire le week-end.",
      },
      {
        id: "a1-famille",
        title: "Parler de sa famille",
        delfExercise: "DELF A1 · Production Écrite",
        instructions:
          "Un correspondant français vous demande de parler de votre famille. Écrivez un message pour présenter les membres de votre famille et ce qu'ils aiment faire.",
      },
      {
        id: "a1-journee",
        title: "Décrire sa journée",
        delfExercise: "DELF A1 · Production Écrite",
        instructions:
          "Pour un blog d'échange scolaire, décrivez une journée typique : ce que vous faites le matin, l'après-midi et le soir.",
      },
    ],
  },
  A2: {
    level: "A2",
    label: "A2 · Survie",
    taskType: {
      en: "Informal letter or note describing an event",
      ru: "Неформальное письмо или записка с описанием события",
      kz: "Оқиғаны сипаттайтын бейресми хат немесе жазба",
    },
    expectedStructure: {
      en: [
        "Greeting and reason for writing",
        "1–2 short paragraphs describing the event or situation",
        "Closing with a friendly sign-off",
      ],
      ru: [
        "Приветствие и причина письма",
        "1–2 коротких абзаца с описанием события или ситуации",
        "Дружеское прощание",
      ],
      kz: [
        "Сәлемдесу және хат жазу себебі",
        "Оқиғаны немесе жағдайды сипаттайтын 1–2 қысқа абзац",
        "Достық қоштасу",
      ],
    },
    minWords: 60,
    maxWords: 80,
    difficulty: "Elementary",
    evaluationCriteria: [
      "Describes a recent or planned event using appropriate tenses",
      "Uses simple connectors (et, mais, parce que, alors)",
      "Vocabulary covers everyday topics (family, daily life, leisure)",
      "Reasonably accurate use of présent, passé composé, futur proche",
    ],
    samplePrompts: [
      {
        id: "a2-fete-famille",
        title: "Raconter un événement",
        delfExercise: "DELF A2 · Production Écrite",
        instructions:
          "Vous avez assisté à une fête de famille le week-end dernier. Écrivez un e-mail à un ami pour raconter cette journée et lui dire ce que vous avez prévu de faire le mois prochain.",
      },
      {
        id: "a2-vacances",
        title: "Raconter ses vacances",
        delfExercise: "DELF A2 · Production Écrite",
        instructions:
          "Vous revenez de vacances. Écrivez un e-mail à un ami pour raconter où vous êtes allé(e), ce que vous avez fait, et proposez-lui une prochaine sortie ensemble.",
      },
      {
        id: "a2-nouveau-travail",
        title: "Annoncer une nouvelle",
        delfExercise: "DELF A2 · Production Écrite",
        instructions:
          "Vous avez commencé un nouveau travail ou une nouvelle école. Écrivez un message à un ami pour lui raconter comment se passe cette nouvelle expérience.",
      },
      {
        id: "a2-invitation",
        title: "Inviter un ami",
        delfExercise: "DELF A2 · Production Écrite",
        instructions:
          "Vous organisez une fête pour votre anniversaire. Écrivez un e-mail à un ami pour l'inviter : la date, le lieu, et ce que vous avez prévu de faire.",
      },
    ],
  },
  B1: {
    level: "B1",
    label: "B1 · Seuil",
    taskType: {
      en: "Opinion essay or personal letter",
      ru: "Эссе-мнение или личное письмо",
      kz: "Пікір эссесі немесе жеке хат",
    },
    expectedStructure: {
      en: [
        "Introduction presenting the topic and your position",
        "Development with 2–3 arguments, each supported by an example",
        "Conclusion summarizing your opinion",
      ],
      ru: [
        "Введение с темой и вашей позицией",
        "Развитие с 2–3 аргументами, каждый с примером",
        "Заключение с кратким изложением вашего мнения",
      ],
      kz: [
        "Тақырып пен ұстанымыңызды таныстыратын кіріспе",
        "Әрқайсысы мысалмен расталған 2–3 дәлел",
        "Пікіріңізді қорытындылайтын қорытынды",
      ],
    },
    minWords: 160,
    maxWords: 180,
    difficulty: "Intermediate",
    evaluationCriteria: [
      "Task completion and respect of the requested format/length",
      "Coherence and cohesion using varied connectors (cependant, donc, en revanche)",
      "Lexical range appropriate for expressing opinions",
      "Grammatical accuracy across a variety of tenses and moods",
    ],
    samplePrompts: [
      {
        id: "b1-lettre-voyage",
        title: "Lettre informelle",
        delfExercise: "DELF B1 · Production Écrite",
        instructions:
          "Écrivez un e-mail à un ami pour lui raconter votre dernier voyage et lui donner des conseils pour son prochain séjour.",
      },
      {
        id: "b1-reseaux-sociaux",
        title: "Les réseaux sociaux",
        delfExercise: "DELF B1 · Production Écrite",
        instructions:
          "Certains pensent que les réseaux sociaux rapprochent les gens, d'autres pensent qu'ils les isolent. Donnez votre opinion avec des arguments et des exemples.",
      },
      {
        id: "b1-vie-en-ville",
        title: "Vivre en ville ou à la campagne",
        delfExercise: "DELF B1 · Production Écrite",
        instructions:
          "Un magazine vous demande votre avis : vaut-il mieux vivre en ville ou à la campagne ? Rédigez un texte donnant votre opinion, avec des arguments et des exemples.",
      },
      {
        id: "b1-lettre-demenagement",
        title: "Lettre à un ami",
        delfExercise: "DELF B1 · Production Écrite",
        instructions:
          "Vous venez de déménager dans une nouvelle ville. Écrivez une lettre à un ami pour lui raconter votre installation et lui donner envie de vous rendre visite.",
      },
    ],
  },
  B2: {
    level: "B2",
    label: "B2 · Avancé",
    taskType: {
      en: "Argumentative essay or formal letter",
      ru: "Аргументированное эссе или официальное письмо",
      kz: "Дәлелді эссе немесе ресми хат",
    },
    expectedStructure: {
      en: [
        "Introduction presenting the issue at stake",
        "Structured argumentation (thesis/antithesis or multiple arguments with counterpoints)",
        "Conclusion synthesizing the discussion and stating a personal position",
      ],
      ru: [
        "Введение с описанием проблемы",
        "Структурированная аргументация (тезис/антитезис или несколько аргументов с контраргументами)",
        "Заключение с итогами обсуждения и личной позицией",
      ],
      kz: [
        "Мәселені таныстыратын кіріспе",
        "Құрылымды дәлелдеу (тезис/антитезис немесе қарсы пікірлері бар бірнеше дәлел)",
        "Талқылауды қорытындылап, жеке ұстанымды білдіретін қорытынды",
      ],
    },
    minWords: 250,
    maxWords: 300,
    difficulty: "Upper-Intermediate",
    evaluationCriteria: [
      "Quality and depth of argumentation, with a clear position",
      "Coherence and cohesion using complex, nuanced connectors",
      "Precise, nuanced, and varied vocabulary",
      "Accurate use of complex sentence structures, subjunctive, and conditional",
    ],
    samplePrompts: [
      {
        id: "b2-teletravail",
        title: "Essai argumenté",
        delfExercise: "DELF B2 · Production Écrite",
        instructions:
          "Certaines entreprises imposent le télétravail à leurs employés. Rédigez un essai argumenté dans lequel vous exposez les avantages et les inconvénients de cette pratique, puis donnez votre opinion.",
      },
      {
        id: "b2-intelligence-artificielle",
        title: "L'intelligence artificielle",
        delfExercise: "DELF B2 · Production Écrite",
        instructions:
          "L'intelligence artificielle transforme le monde du travail. Rédigez un essai argumenté sur les opportunités et les risques de cette évolution, puis donnez votre opinion personnelle.",
      },
      {
        id: "b2-lettre-formelle",
        title: "Lettre formelle de réclamation",
        delfExercise: "DELF B2 · Production Écrite",
        instructions:
          "Vous avez été déçu(e) par un service (hôtel, transport, magasin). Rédigez une lettre formelle à la direction pour exposer le problème et demander réparation, avec des arguments précis.",
      },
      {
        id: "b2-environnement",
        title: "Écologie et mode de vie",
        delfExercise: "DELF B2 · Production Écrite",
        instructions:
          "Faut-il changer radicalement notre mode de vie pour protéger l'environnement ? Rédigez un essai argumenté présentant plusieurs points de vue, puis donnez votre opinion.",
      },
    ],
  },
};
