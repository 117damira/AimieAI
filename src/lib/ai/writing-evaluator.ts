import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { DelfLevel, FeedbackLanguage, WritingEvaluation } from "@/types/writing-evaluation";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { SPEAKING_EVAL_MODEL } from "./anthropic";

/**
 * Real Claude-based DELF writing evaluation — used when ANTHROPIC_API_KEY
 * is configured (see anthropic.ts). Previously this feature had no real AI
 * path at all (the route was permanently "DEMO MODE"); this is the first
 * genuine implementation. Every score/note comes from Claude reading the
 * candidate's actual essay, never randomized. Falls back to
 * lib/mock/writing-evaluation.ts if this fails or no key is configured.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const grammarErrorSchema = z.object({
  original: z.string(),
  correction: z.string(),
  explanation: z.string(),
  category: z.enum(["verb", "agreement", "sentence-structure", "other"]),
});

const evaluationSchema = z.object({
  taskCompletion: z.object({
    addressedPrompt: z.boolean(),
    respectedFormat: z.boolean(),
    notes: z.string(),
  }),
  structure: z.object({
    hasIntroduction: z.boolean(),
    hasMainIdeas: z.boolean(),
    hasConclusion: z.boolean(),
    conclusionRequired: z.boolean(),
    paragraphOrganization: z.string(),
  }),
  languageAccuracy: z.object({
    errors: z.array(grammarErrorSchema),
    summary: z.string(),
  }),
  vocabulary: z.object({
    wordChoice: z.string(),
    variety: z.string(),
    levelAppropriateness: z.string(),
  }),
  examReadiness: z.object({
    estimatedScore: z.number(),
    scoreOutOf: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    improvementTips: z.array(z.string()),
    scoreExplanation: z.string(),
  }),
}) satisfies z.ZodType<Omit<WritingEvaluation, "level" | "wordCount">>;

export async function evaluateWritingWithClaude(
  client: Anthropic,
  params: {
    level: DelfLevel;
    prompt: string;
    response: string;
    wordCount: number;
    minWords: number;
    maxWords: number;
    conclusionRequired: boolean;
    language: FeedbackLanguage;
  }
): Promise<Omit<WritingEvaluation, "level" | "wordCount">> {
  const { level, prompt, response, wordCount, minWords, maxWords, conclusionRequired, language } = params;

  const system = `You are an experienced official DELF French examiner grading a candidate's written response, strictly against the real DELF ${level} "Production Écrite" rubric. Base every judgment ONLY on the actual essay text provided — never invent details the candidate didn't write, and never give generic or templated feedback. Never assume the response is correct or on-topic by default — actively compare it against the actual prompt before judging anything else.

Evaluate, in this order:
1. Task completion: does the essay genuinely address the actual prompt given (not just meet a word count)? Set "addressedPrompt" accordingly, and explain in "notes" — if it's off-topic or too short, say so plainly and explain what's missing; if it's on-topic, confirm what it covers. "respectedFormat" reflects whether the word count (currently ${wordCount}, target ${minWords}-${maxWords}) is reasonably in range.
2. Structure: does it have an appropriate introduction, clearly organized main ideas, and (since this level ${conclusionRequired ? "requires" : "does not require"} one) a conclusion? Set "hasIntroduction"/"hasMainIdeas"/"hasConclusion"/"conclusionRequired" (${conclusionRequired}) accordingly, and describe the paragraph organization honestly in "paragraphOrganization".
3. Grammar: find EVERY genuine grammar mistake in the actual text — quote the exact wrong phrase in "original", the fix in "correction", and explain what's wrong/why/which rule in "explanation". Never invent a mistake that isn't there, and never miss an obvious one; cap at a reasonable number if there are many. If there are truly none, return an empty "errors" array. Write a real "summary" reflecting what you actually found.
4. Vocabulary: assess real word choice, variety (repetition vs. range), and whether the register fits ${level} — specific to what was actually written, with concrete detail from the text, not generic praise.
5. Exam readiness: compute "estimatedScore" (out of 25, "scoreOutOf": 25) from genuine judgment of the above — never a fixed baseline with jitter. List 2-4 real "strengths" and "weaknesses" and "improvementTips" specific to this essay. Explain the score honestly in "scoreExplanation", including why points were lost.

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "taskCompletion": { "addressedPrompt": boolean, "respectedFormat": boolean, "notes": string }, "structure": { "hasIntroduction": boolean, "hasMainIdeas": boolean, "hasConclusion": boolean, "conclusionRequired": boolean, "paragraphOrganization": string }, "languageAccuracy": { "errors": [{ "original": string, "correction": string, "explanation": string, "category": "verb" | "agreement" | "sentence-structure" | "other" }], "summary": string }, "vocabulary": { "wordChoice": string, "variety": string, "levelAppropriateness": string }, "examReadiness": { "estimatedScore": number, "scoreOutOf": 25, "strengths": string[], "weaknesses": string[], "improvementTips": string[], "scoreExplanation": string } }

languageAccuracy.errors[].original/correction are French. All other string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `DELF level: ${level}
Prompt (French): ${prompt}
Candidate's written response (French): "${response}"
Word count: ${wordCount} (target range: ${minWords}-${maxWords})`;

  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, 1800);
  return evaluationSchema.parse(parsed);
}
