import type { DelfLevel, DelfLevelConfig } from "@/types/writing-evaluation";

/**
 * DELF Production Écrite requirements per CEFR level. Task type, structure,
 * and word counts follow the official DELF exam format so the AI evaluator
 * grades against the same rubric a real examiner would use.
 */
export const DELF_LEVEL_ORDER: DelfLevel[] = ["A1", "A2", "B1", "B2"];

export const DELF_WRITING_LEVELS: Record<DelfLevel, DelfLevelConfig> = {
  A1: {
    level: "A1",
    label: "A1 · Découverte",
    taskType: "Short message or form",
    expectedStructure: [
      "Greeting",
      "2–3 simple sentences conveying the required information",
      "Closing / sign-off",
    ],
    minWords: 40,
    maxWords: 60,
    difficulty: "Beginner",
    evaluationCriteria: [
      "Conveys very basic personal information (name, age, address, likes)",
      "Uses simple present-tense sentences",
      "Uses everyday, high-frequency vocabulary",
      "Basic spelling and simple sentence punctuation",
    ],
    samplePrompt: {
      title: "Se présenter par message",
      delfExercise: "DELF A1 · Production Écrite",
      instructions:
        "Vous venez de vous inscrire dans un club de sport. Écrivez un message pour vous présenter : votre nom, votre âge, ce que vous aimez faire.",
    },
  },
  A2: {
    level: "A2",
    label: "A2 · Survie",
    taskType: "Informal letter or note describing an event",
    expectedStructure: [
      "Greeting and reason for writing",
      "1–2 short paragraphs describing the event or situation",
      "Closing with a friendly sign-off",
    ],
    minWords: 60,
    maxWords: 80,
    difficulty: "Elementary",
    evaluationCriteria: [
      "Describes a recent or planned event using appropriate tenses",
      "Uses simple connectors (et, mais, parce que, alors)",
      "Vocabulary covers everyday topics (family, daily life, leisure)",
      "Reasonably accurate use of présent, passé composé, futur proche",
    ],
    samplePrompt: {
      title: "Raconter un événement",
      delfExercise: "DELF A2 · Production Écrite",
      instructions:
        "Vous avez assisté à une fête de famille le week-end dernier. Écrivez un e-mail à un ami pour raconter cette journée et lui dire ce que vous avez prévu de faire le mois prochain.",
    },
  },
  B1: {
    level: "B1",
    label: "B1 · Seuil",
    taskType: "Opinion essay or personal letter",
    expectedStructure: [
      "Introduction presenting the topic and your position",
      "Development with 2–3 arguments, each supported by an example",
      "Conclusion summarizing your opinion",
    ],
    minWords: 160,
    maxWords: 180,
    difficulty: "Intermediate",
    evaluationCriteria: [
      "Task completion and respect of the requested format/length",
      "Coherence and cohesion using varied connectors (cependant, donc, en revanche)",
      "Lexical range appropriate for expressing opinions",
      "Grammatical accuracy across a variety of tenses and moods",
    ],
    samplePrompt: {
      title: "Lettre informelle",
      delfExercise: "DELF B1 · Production Écrite",
      instructions:
        "Écrivez un e-mail à un ami pour lui raconter votre dernier voyage et lui donner des conseils pour son prochain séjour.",
    },
  },
  B2: {
    level: "B2",
    label: "B2 · Avancé",
    taskType: "Argumentative essay or formal letter",
    expectedStructure: [
      "Introduction presenting the issue at stake",
      "Structured argumentation (thesis/antithesis or multiple arguments with counterpoints)",
      "Conclusion synthesizing the discussion and stating a personal position",
    ],
    minWords: 250,
    maxWords: 300,
    difficulty: "Upper-Intermediate",
    evaluationCriteria: [
      "Quality and depth of argumentation, with a clear position",
      "Coherence and cohesion using complex, nuanced connectors",
      "Precise, nuanced, and varied vocabulary",
      "Accurate use of complex sentence structures, subjunctive, and conditional",
    ],
    samplePrompt: {
      title: "Essai argumenté",
      delfExercise: "DELF B2 · Production Écrite",
      instructions:
        "Certaines entreprises imposent le télétravail à leurs employés. Rédigez un essai argumenté dans lequel vous exposez les avantages et les inconvénients de cette pratique, puis donnez votre opinion.",
    },
  },
};
