import type { DelfLevel } from "@/types/writing-evaluation";

/**
 * DELF Production Orale structure per CEFR level, following the official
 * exam format so the mock evaluator grades against the same rubric a real
 * examiner would use. Mirrors the shape of config/delf-writing.ts.
 *
 * Only A1-B2 are defined — see lib/utils/level.ts for how "Beginner"/"C1"/
 * "C2" onboarding levels are clamped onto this set.
 */

export interface SpeakingQuestionSpec {
  id: string;
  prompt: string; // French — the actual exam prompt, never translated
  suggestedDurationSeconds: number;
}

export interface SpeakingExercisePart {
  id: string;
  partLabel: string; // official DELF exercise name, e.g. "Entretien dirigé"
  instructions: string;
  questions: SpeakingQuestionSpec[];
}

export interface DelfSpeakingLevelConfig {
  level: DelfLevel;
  label: string;
  structureDescription: string;
  parts: SpeakingExercisePart[];
  evaluationCriteria: string[];
}

export const DELF_SPEAKING_LEVELS: Record<DelfLevel, DelfSpeakingLevelConfig> = {
  A1: {
    level: "A1",
    label: "A1 · Découverte",
    structureDescription:
      "Three short parts: a guided interview, an information exchange, and a simple role-play.",
    parts: [
      {
        id: "a1-entretien-dirige",
        partLabel: "Entretien dirigé",
        instructions:
          "Answer the examiner's questions about yourself, simply and directly.",
        questions: [
          {
            id: "a1-ed-1",
            prompt:
              "Bonjour ! Pouvez-vous vous présenter : comment vous vous appelez, quel âge vous avez et où vous habitez ?",
            suggestedDurationSeconds: 45,
          },
          {
            id: "a1-ed-2",
            prompt: "Qu'est-ce que vous aimez faire pendant votre temps libre ?",
            suggestedDurationSeconds: 30,
          },
          {
            id: "a1-ed-3",
            prompt:
              "Est-ce que vous avez des frères et sœurs ? Parlez-moi un peu de votre famille.",
            suggestedDurationSeconds: 30,
          },
        ],
      },
      {
        id: "a1-echange-informations",
        partLabel: "Échange d'informations",
        instructions:
          "Using the topic given, formulate two or three simple questions as if asking the examiner.",
        questions: [
          {
            id: "a1-ei-1",
            prompt:
              "Voici un mot clé : LES VACANCES. Posez-moi trois questions sur ce sujet (par exemple : où, quand, avec qui).",
            suggestedDurationSeconds: 60,
          },
        ],
      },
      {
        id: "a1-dialogue-simule",
        partLabel: "Dialogue simulé",
        instructions:
          "Play the role described and respond as you would in a real everyday situation.",
        questions: [
          {
            id: "a1-ds-1",
            prompt:
              "Vous êtes dans un magasin et vous voulez acheter un cadeau pour un ami. Demandez de l'aide au vendeur.",
            suggestedDurationSeconds: 45,
          },
          {
            id: "a1-ds-2",
            prompt: "Le vendeur vous propose deux objets : lequel choisissez-vous, et pourquoi ?",
            suggestedDurationSeconds: 30,
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
  },
  A2: {
    level: "A2",
    label: "A2 · Survie",
    structureDescription:
      "Three parts: a guided interview, a short prepared talk, and a role-play in an everyday situation.",
    parts: [
      {
        id: "a2-entretien-dirige",
        partLabel: "Entretien dirigé",
        instructions: "Present yourself, then answer a couple of follow-up questions.",
        questions: [
          {
            id: "a2-ed-1",
            prompt:
              "Présentez-vous : votre nom, votre travail ou vos études, et votre ville.",
            suggestedDurationSeconds: 45,
          },
          {
            id: "a2-ed-2",
            prompt: "Qu'est-ce que vous avez fait le week-end dernier ?",
            suggestedDurationSeconds: 30,
          },
        ],
      },
      {
        id: "a2-monologue-suivi",
        partLabel: "Monologue suivi",
        instructions: "Speak for about a minute on the topic below, without being interrupted.",
        questions: [
          {
            id: "a2-ms-1",
            prompt: "Parlez-moi de votre ville ou de votre village natal.",
            suggestedDurationSeconds: 60,
          },
        ],
      },
      {
        id: "a2-dialogue-simule",
        partLabel: "Dialogue simulé",
        instructions: "Handle the everyday situation as naturally as you can.",
        questions: [
          {
            id: "a2-ds-1",
            prompt:
              "Vous appelez un ami pour organiser une sortie ce week-end. Proposez une activité et un horaire.",
            suggestedDurationSeconds: 45,
          },
          {
            id: "a2-ds-2",
            prompt: "Votre ami ne peut pas ce jour-là : proposez une autre solution.",
            suggestedDurationSeconds: 30,
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
  },
  B1: {
    level: "B1",
    label: "B1 · Seuil",
    structureDescription:
      "Three parts: a brief personal presentation, an interactive role-play, and a viewpoint discussion based on a short document.",
    parts: [
      {
        id: "b1-entretien-dirige",
        partLabel: "Entretien dirigé",
        instructions: "Briefly present yourself and your motivations.",
        questions: [
          {
            id: "b1-ed-1",
            prompt:
              "Présentez-vous brièvement : qui êtes-vous, et pourquoi apprenez-vous le français ?",
            suggestedDurationSeconds: 45,
          },
        ],
      },
      {
        id: "b1-exercice-interaction",
        partLabel: "Exercice en interaction",
        instructions:
          "Negotiate a solution to the everyday situation described, as if speaking with the examiner.",
        questions: [
          {
            id: "b1-ei-1",
            prompt:
              "Vous partez en voyage avec des amis, mais vous n'êtes pas d'accord sur le budget. Expliquez votre point de vue et proposez un compromis.",
            suggestedDurationSeconds: 60,
          },
          {
            id: "b1-ei-2",
            prompt: "Votre ami propose de réduire le nombre de nuits d'hôtel : qu'en pensez-vous ?",
            suggestedDurationSeconds: 45,
          },
        ],
      },
      {
        id: "b1-point-de-vue",
        partLabel: "Expression d'un point de vue à partir d'un document déclencheur",
        instructions:
          "Give your opinion on the short prompt below, then be ready to discuss it further.",
        questions: [
          {
            id: "b1-pv-1",
            prompt:
              "Document : « De plus en plus de salariés travaillent depuis chez eux. » Qu'en pensez-vous ? Est-ce une bonne chose ?",
            suggestedDurationSeconds: 75,
          },
          {
            id: "b1-pv-2",
            prompt: "Quels sont les inconvénients du télétravail selon vous ?",
            suggestedDurationSeconds: 45,
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
  },
  B2: {
    level: "B2",
    label: "B2 · Avancé",
    structureDescription:
      "A single extended task: present a structured argument from a document, then defend it under examiner questioning.",
    parts: [
      {
        id: "b2-point-de-vue",
        partLabel: "Présentation et défense d'un point de vue",
        instructions:
          "Present a structured argument on the document below, then respond to follow-up challenges.",
        questions: [
          {
            id: "b2-pv-1",
            prompt:
              "Document : « Les réseaux sociaux ont-ils un effet positif ou négatif sur les jeunes ? » Présentez votre point de vue de façon structurée.",
            suggestedDurationSeconds: 120,
          },
          {
            id: "b2-pv-2",
            prompt:
              "Certains disent que les réseaux sociaux favorisent l'isolement plutôt que le lien social. Que répondez-vous à cet argument ?",
            suggestedDurationSeconds: 60,
          },
          {
            id: "b2-pv-3",
            prompt: "Quelles solutions proposeriez-vous pour limiter les effets négatifs ?",
            suggestedDurationSeconds: 60,
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
  },
};

export interface FlatSpeakingQuestion {
  partId: string;
  partLabel: string;
  questionId: string;
  prompt: string;
  suggestedDurationSeconds: number;
}

/** Flattens a level's parts/questions into a single ordered queue for
 * driving a speaking session one question at a time. */
export function flattenSpeakingParts(
  config: DelfSpeakingLevelConfig
): FlatSpeakingQuestion[] {
  return config.parts.flatMap((part) =>
    part.questions.map((question) => ({
      partId: part.id,
      partLabel: part.partLabel,
      questionId: question.id,
      prompt: question.prompt,
      suggestedDurationSeconds: question.suggestedDurationSeconds,
    }))
  );
}
