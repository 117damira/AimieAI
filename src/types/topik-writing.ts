/** TOPIK II is the only track with a Writing section (Levels 3-6) — TOPIK I
 * (Levels 1-2) has no Writing at all. This mirrors the shape of
 * writing-evaluation.ts (DELF) but is otherwise fully independent: TOPIK
 * writing is graded against the real TOPIK II rubric, never DELF's. */
export type TopikWritingLevel = "3" | "4" | "5" | "6";

/** Language the AI evaluation feedback is written in. The exam prompt and
 * the student's own response always stay in Korean — this only controls
 * the language of the generated feedback text. */
export type FeedbackLanguage = "en" | "ru" | "kz";

/** The three real TOPIK II Writing question types: Q51/Q52 (short-answer,
 * 10 pts each), Q53 (data-description, 30 pts), Q54 (essay, 50 pts) — 100
 * points total across the real exam. One practice session grades a single
 * task at a time. */
export type TopikWritingTaskType = "short-answer" | "data-description" | "essay";

export interface TopikWritingPrompt {
  /** Stable id, unique within a level — used to track topic rotation
   * history so the same prompt isn't shown twice in a row. */
  id: string;
  title: string;
  taskType: TopikWritingTaskType;
  /** Real TOPIK II Writing exercise label shown as a badge in the UI
   * (e.g. "TOPIK II 쓰기 · 53번 유형") — not translated, describes the
   * official question-number convention, not copied exam content. */
  topikTask: string;
  /** Korean instructions given to the student. */
  instructions: string;
  /** For data-description prompts only: a short, structured Korean
   * text/table summary of the "data" the student must describe — since a
   * real chart can't be rendered here. Null for short-answer/essay
   * prompts. */
  dataText: string | null;
  minChars: number;
  maxChars: number;
}

export interface TopikWritingLevelConfig {
  level: TopikWritingLevel;
  label: string;
  /** Which task type(s) this level's prompt pool draws from. Levels 3-4
   * lean on short-answer/data-description; levels 5-6 add the full essay
   * task, per the real TOPIK II Writing structure. */
  taskTypes: TopikWritingTaskType[];
  evaluationCriteria: string[];
  /** A pool of original TOPIK-style prompts for this level — rotated so a
   * learner doesn't see the same topic every session (see
   * lib/topik/writing-rotation.ts). */
  samplePrompts: TopikWritingPrompt[];
}

export interface TaskCompletionFeedback {
  addressedTask: boolean;
  respectedFormat: boolean;
  notes: string;
  /** Concrete, itemized list of what's missing from the response (e.g.
   * "the requested figures from the data", "a conclusion sentence") —
   * never a vague restatement of addressedTask. */
  missingElements: string[];
}

export interface OrganizationFeedback {
  isWellOrganized: boolean;
  /** Whether the task-appropriate structure is present — an essay's
   * intro/body/conclusion, a data-description's logical trend
   * progression, or a short-answer's natural fit with its given context. */
  matchesExpectedStructure: boolean;
  notes: string;
}

export interface CoherenceFeedback {
  /** Whether ideas connect logically (via connectors, sentence-to-sentence
   * flow) rather than just being present (that's organization's job). */
  isCoherent: boolean;
  notes: string;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
  category: "particle" | "conjugation" | "formality" | "spacing" | "sentence-structure" | "other";
}

export interface GrammarFeedback {
  errors: GrammarError[];
  summary: string;
}

export interface VocabularyFeedback {
  wordChoice: string;
  variety: string;
  levelAppropriateness: string;
}

export interface RegisterFeedback {
  /** TOPIK Writing requires the formal 격식체 register (-습니다/-ㅂ니다)
   * throughout — conversational 해요체 or 반말 is a real, gradable error. */
  isAppropriate: boolean;
  notes: string;
}

export interface AccuracyFeedback {
  /** For data-description tasks: whether the response accurately reflects
   * the actual figures/trends given (never invented or misreported). For
   * other task types: whether the response's own claims are internally
   * consistent with what was asked. */
  isAccurate: boolean;
  notes: string;
}

export interface ExamReadinessFeedback {
  /** Points actually earned on this one task, out of taskMaxPoints. */
  taskPoints: number;
  /** This task's real point ceiling within the 100-point TOPIK II Writing
   * exam: 10 (short-answer), 30 (data-description), or 50 (essay). */
  taskMaxPoints: number;
  /** taskPoints expressed on the full 100-point TOPIK Writing scale — since
   * each task's point value already is its real share of that total, this
   * equals taskPoints (see lib/topik/writing-scoring.ts). */
  estimatedScore: number;
  /** Always 100 — the real TOPIK II Writing exam's total point scale. */
  scoreOutOf: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  scoreExplanation: string;
}

export interface TopikWritingEvaluation {
  level: TopikWritingLevel;
  taskType: TopikWritingTaskType;
  charCount: number;
  taskCompletion: TaskCompletionFeedback;
  organization: OrganizationFeedback;
  coherence: CoherenceFeedback;
  grammar: GrammarFeedback;
  vocabulary: VocabularyFeedback;
  register: RegisterFeedback;
  accuracy: AccuracyFeedback;
  examReadiness: ExamReadinessFeedback;
  /** A corrected/lightly-expanded version of the student's OWN response —
   * real grammar/register fixes applied, plus bracketed placeholders for
   * missing required content. Never invents personal facts or data the
   * student didn't provide. */
  improvedVersion: string;
}

export interface TopikWritingEvaluationRequest {
  level: TopikWritingLevel;
  taskType: TopikWritingTaskType;
  prompt: string;
  dataText: string | null;
  response: string;
  language: FeedbackLanguage;
}
