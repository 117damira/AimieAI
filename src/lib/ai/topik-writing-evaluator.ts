import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type {
  FeedbackLanguage,
  TopikWritingEvaluation,
  TopikWritingLevel,
  TopikWritingTaskType,
} from "@/types/topik-writing";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { aggregateTopikWritingScore, TOPIK_TASK_MAX_POINTS } from "@/lib/topik/writing-scoring";
import { SPEAKING_EVAL_MODEL } from "./anthropic";

/**
 * Real Claude-based TOPIK II writing evaluation — used when
 * ANTHROPIC_API_KEY is configured (see anthropic.ts). Every score/note
 * comes from Claude reading the candidate's actual Korean response, never
 * randomized. Falls back to lib/mock/topik-writing-evaluation.ts if this
 * fails or no key is configured. Entirely independent from DELF's evaluator
 * (lib/ai/writing-evaluator.ts) — different rubric, different prompt,
 * never mixed.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const TASK_TYPE_NAMES: Record<TopikWritingTaskType, string> = {
  "short-answer": "short-answer practical writing (Q51/Q52-style)",
  "data-description": "data-description writing (Q53-style)",
  essay: "argumentative/opinion essay (Q54-style)",
};

const grammarErrorSchema = z.object({
  original: z.string(),
  correction: z.string(),
  explanation: z.string(),
  category: z.enum(["particle", "conjugation", "formality", "spacing", "sentence-structure", "other"]),
});

const evaluationSchema = z.object({
  taskCompletion: z.object({
    addressedTask: z.boolean(),
    respectedFormat: z.boolean(),
    notes: z.string(),
    missingElements: z.array(z.string()),
  }),
  organization: z.object({
    isWellOrganized: z.boolean(),
    matchesExpectedStructure: z.boolean(),
    notes: z.string(),
  }),
  coherence: z.object({
    isCoherent: z.boolean(),
    notes: z.string(),
  }),
  grammar: z.object({
    errors: z.array(grammarErrorSchema),
    summary: z.string(),
  }),
  vocabulary: z.object({
    wordChoice: z.string(),
    variety: z.string(),
    levelAppropriateness: z.string(),
  }),
  register: z.object({
    isAppropriate: z.boolean(),
    notes: z.string(),
  }),
  accuracy: z.object({
    isAccurate: z.boolean(),
    notes: z.string(),
  }),
  examReadiness: z.object({
    taskPoints: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    improvementTips: z.array(z.string()),
    scoreExplanation: z.string(),
  }),
  improvedVersion: z.string(),
});

export async function evaluateTopikWritingWithClaude(
  client: Anthropic,
  params: {
    level: TopikWritingLevel;
    taskType: TopikWritingTaskType;
    prompt: string;
    dataText: string | null;
    response: string;
    charCount: number;
    minChars: number;
    maxChars: number;
    language: FeedbackLanguage;
  }
): Promise<Omit<TopikWritingEvaluation, "level" | "taskType" | "charCount">> {
  const { level, taskType, prompt, dataText, response, charCount, minChars, maxChars, language } = params;
  const taskMaxPoints = TOPIK_TASK_MAX_POINTS[taskType];

  const system = `You are an experienced official TOPIK Korean examiner grading a candidate's written response, strictly against the real TOPIK II Writing (쓰기) rubric for a ${TASK_TYPE_NAMES[taskType]}, worth ${taskMaxPoints} of the exam's 100 total points. Base every judgment ONLY on the actual Korean text the candidate submitted — never invent details, figures, or opinions they didn't write, and never give generic or templated feedback. Never assume the response is correct or on-topic by default — actively compare it against the actual task (and, for a data-description task, the actual data given) before judging anything else. Never praise a response that doesn't genuinely address the task (e.g. gibberish, off-topic, or non-Korean text) — an unaddressed task means no real strengths to report.

Evaluate, in this order, applying the real TOPIK II Writing criteria:
1. Task completion / content: does the response genuinely address the actual task given (not just meet a character count)? Set "addressedTask" accordingly, and explain in "notes" — if it's off-topic, meaningless, or too short, say so plainly; if it's on-topic, confirm what it covers. List concrete missing pieces in "missingElements" (e.g. "the requested figures from the data", "a concluding sentence") — empty array if genuinely nothing is missing. "respectedFormat" reflects whether the character count (currently ${charCount}, target ${minChars}-${maxChars}자) is reasonably in range. Be strict: if the student did not actually answer what was asked, this must be reflected as a serious failure, not a minor deduction.
2. Organization / structure: does the response follow the structure expected for this task type — for an essay, a real introduction, developed body, and conclusion; for a data-description, a logically ordered description of the actual trends/comparisons; for a short-answer, a natural fit with the given context? Set "isWellOrganized" and "matchesExpectedStructure" strictly based on what is ACTUALLY present — never assume a structural element exists by default. Explain honestly in "notes".
3. Coherence: do ideas connect logically from sentence to sentence (real connectors like 그리고/하지만/그래서/따라서, real logical flow), as opposed to just being present (that's organization's job)? Never default to a high coherence rating — random, disconnected, or meaningless text must be rated low. Set "isCoherent" and explain in "notes".
4. Grammar / sentence structure: find EVERY genuine grammar mistake in the actual text — including incorrect particles (조사), verb/adjective conjugation errors, awkward or ungrammatical sentence structure, and (a real, TOPIK-specific requirement) any use of the conversational 해요체 register where the formal 격식체 register (-습니다/-ㅂ니다) is required throughout. Quote the exact wrong phrase in "original", the fix in "correction", categorize it ("particle" | "conjugation" | "formality" | "spacing" | "sentence-structure" | "other"), and explain what's wrong and why in "explanation". Never invent a mistake that isn't there, and never miss an obvious one; cap at a reasonable number if there are many. If there are truly none, return an empty "errors" array. Write a real "summary" reflecting what you actually found.
5. Vocabulary: assess real word choice, variety (repetition vs. range), and whether the register/formality fits formal written Korean at TOPIK II — specific to what was actually written, with concrete detail from the text, not generic praise.
6. Register (문어체/격식체 appropriateness): TOPIK Writing always requires the formal written register throughout. Set "isAppropriate" strictly based on whether the candidate maintained it, and explain in "notes".
7. Accuracy: ${
    taskType === "data-description"
      ? "for this data-description task, does the response accurately report the actual figures and trends given below — no invented, altered, or misreported numbers? Set \"isAccurate\" strictly and explain in \"notes\", naming any figure that was misreported or omitted."
      : "does the response's own content stay internally consistent with what was actually asked, without inventing unsupported claims? Set \"isAccurate\" and explain in \"notes\"."
  }
8. Exam readiness: compute "taskPoints" (out of ${taskMaxPoints}, this task's real point value within the 100-point TOPIK II Writing exam) from genuine, strict judgment of the above, following real TOPIK assessment standards — never a fixed baseline with jitter, and never generous by default. Meaningless, random, or completely off-topic writing must score close to 0, not a moderate/middling number. List 2-4 real "strengths" (empty if the task wasn't genuinely addressed), "weaknesses", and "improvementTips" specific to this response. Explain the score honestly in "scoreExplanation", including why points were lost.
9. Improved version: write "improvedVersion" — a genuinely unique rewrite generated fresh from THIS student's own writing: preserve their actual ideas, correct grammar and register (convert any 해요체 to 격식체), improve vocabulary and fluency where safe to do so without changing meaning, improve organization, and naturally expand on what they wrote. If something is missing (more content, a conclusion, the actual data figures), use a clearly bracketed placeholder telling the student what to add (e.g. "[결론을 요약하는 문장을 추가하세요]") rather than inventing it — vary your phrasing response to response rather than reusing the same fixed wording every time. Never invent personal facts, data figures, or opinions the candidate never wrote — only improve what they actually wrote and mark genuine gaps. Never output a generic template; this must read as specific to this exact submission.

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "taskCompletion": { "addressedTask": boolean, "respectedFormat": boolean, "notes": string, "missingElements": string[] }, "organization": { "isWellOrganized": boolean, "matchesExpectedStructure": boolean, "notes": string }, "coherence": { "isCoherent": boolean, "notes": string }, "grammar": { "errors": [{ "original": string, "correction": string, "explanation": string, "category": "particle" | "conjugation" | "formality" | "spacing" | "sentence-structure" | "other" }], "summary": string }, "vocabulary": { "wordChoice": string, "variety": string, "levelAppropriateness": string }, "register": { "isAppropriate": boolean, "notes": string }, "accuracy": { "isAccurate": boolean, "notes": string }, "examReadiness": { "taskPoints": number, "strengths": string[], "weaknesses": string[], "improvementTips": string[], "scoreExplanation": string }, "improvedVersion": string }

grammar.errors[].original/correction and improvedVersion are Korean. All other string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `TOPIK II level: ${level}
Task type: ${taskType}
Task instructions (Korean): ${prompt}${dataText ? `\nData given to describe (Korean):\n${dataText}` : ""}
Candidate's written response (Korean): "${response}"
Character count: ${charCount} (target range: ${minChars}-${maxChars}자)`;

  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, 1800);
  const result = evaluationSchema.parse(parsed);

  const ratio = taskMaxPoints > 0 ? result.examReadiness.taskPoints / taskMaxPoints : 0;
  const score = aggregateTopikWritingScore(taskType, ratio);

  return {
    taskCompletion: result.taskCompletion,
    organization: result.organization,
    coherence: result.coherence,
    grammar: result.grammar,
    vocabulary: result.vocabulary,
    register: result.register,
    accuracy: result.accuracy,
    examReadiness: {
      taskPoints: score.taskPoints,
      taskMaxPoints: score.taskMaxPoints,
      estimatedScore: score.estimatedScore,
      scoreOutOf: score.scoreOutOf,
      strengths: result.examReadiness.strengths,
      weaknesses: result.examReadiness.weaknesses,
      improvementTips: result.examReadiness.improvementTips,
      scoreExplanation: result.examReadiness.scoreExplanation,
    },
    improvedVersion: result.improvedVersion,
  };
}
