import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { CompletedTurn, SpeakingExaminerReport, TurnFeedback } from "@/types/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import { SPEAKING_EVAL_MODEL } from "./anthropic";

/**
 * Real Claude-based DELF speaking evaluation — used when ANTHROPIC_API_KEY
 * is configured (see anthropic.ts). Every score/note comes from Claude
 * reading the candidate's actual transcript, never randomized. Responses
 * are validated against these zod schemas; a malformed response throws, and
 * the calling API route falls back to the deterministic mock rather than
 * surface broken data.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const grammarErrorSchema = z.object({
  original: z.string(),
  correction: z.string(),
  category: z.enum(["verb", "agreement", "sentence-structure", "other"]),
  explanation: z.string(),
});

const turnFeedbackSchema = z.object({
  relevance: z.boolean(),
  grammarErrors: z.array(grammarErrorSchema),
  vocabularyNote: z.string(),
  fluencyNote: z.string(),
  pronunciationNote: z.string(),
  encouragement: z.string(),
  turnScore: z.number().min(0).max(25),
}) satisfies z.ZodType<TurnFeedback>;

const reportSchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2"]),
  totalQuestions: z.number(),
  grammar: z.object({ summary: z.string(), commonErrors: z.array(grammarErrorSchema) }),
  vocabulary: z.object({ summary: z.string(), rangeNote: z.string() }),
  pronunciation: z.object({ summary: z.string(), note: z.string() }),
  fluency: z.object({ summary: z.string(), pace: z.string() }),
  taskCompletion: z.object({ summary: z.string(), partsCompleted: z.array(z.string()) }),
  repeatedMistakes: z.array(z.string()),
  fillerWords: z.object({ count: z.number(), examples: z.array(z.string()) }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  estimatedScore: z.number(),
  scoreOutOf: z.number(),
  scoreExplanation: z.string(),
}) satisfies z.ZodType<SpeakingExaminerReport>;

function extractJson(text: string): unknown {
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : text.trim());
}

async function callClaudeForJson(
  client: Anthropic,
  system: string,
  userPrompt: string
): Promise<unknown> {
  const response = await client.messages.create({
    model: SPEAKING_EVAL_MODEL,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!block) throw new Error("Claude response had no text content");
  return extractJson(block.text);
}

export async function evaluateTurnWithClaude(
  client: Anthropic,
  params: {
    level: DelfLevel;
    partLabel: string;
    prompt: string;
    transcript: string;
    wordCount: number;
    recognitionConfidence: number | null;
    language: FeedbackLanguage;
  }
): Promise<TurnFeedback> {
  const { level, partLabel, prompt, transcript, wordCount, recognitionConfidence, language } = params;

  const system = `You are an official DELF French oral examiner evaluating a candidate's spoken answer, transcribed by speech recognition. Grade strictly against the real DELF ${level} "Production Orale" rubric for the "${partLabel}" exercise. Base every judgment ONLY on the transcript provided — never invent details the candidate didn't say, and explain WHY points were lost. Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape: { "relevance": boolean, "grammarErrors": [{ "original": string, "correction": string, "category": "verb" | "agreement" | "sentence-structure" | "other", "explanation": string }], "vocabularyNote": string, "fluencyNote": string, "pronunciationNote": string, "encouragement": string, "turnScore": number (0-25) }. All string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}, except grammarErrors[].original/correction which quote the candidate's actual French. The transcript comes from browser speech recognition, not audio, so you cannot hear pronunciation directly — base "pronunciationNote" on disfluencies, hesitations, and the provided recognition confidence score as a proxy, and say so plainly rather than claiming certainty you don't have.`;

  const userPrompt = `DELF level: ${level}
Exercise part: ${partLabel}
Question (French): ${prompt}
Candidate's transcribed spoken answer (French): "${transcript}"
Word count: ${wordCount}
Speech recognition confidence: ${recognitionConfidence !== null ? recognitionConfidence.toFixed(2) : "unavailable"}`;

  const parsed = await callClaudeForJson(client, system, userPrompt);
  return turnFeedbackSchema.parse(parsed);
}

export async function synthesizeReportWithClaude(
  client: Anthropic,
  params: {
    level: DelfLevel;
    language: FeedbackLanguage;
    completedTurns: CompletedTurn[];
  }
): Promise<SpeakingExaminerReport> {
  const { level, language, completedTurns } = params;

  const system = `You are an official DELF French oral examiner writing a final "Production Orale" report after a full practice session at level ${level}. Base every judgment ONLY on the transcripts and per-turn feedback provided below — synthesize genuine patterns across turns (e.g. a grammar mistake that recurred more than once), never invent new ones. Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape: { "level": "${level}", "totalQuestions": number, "grammar": { "summary": string, "commonErrors": [{ "original": string, "correction": string, "category": "verb" | "agreement" | "sentence-structure" | "other", "explanation": string }] }, "vocabulary": { "summary": string, "rangeNote": string }, "pronunciation": { "summary": string, "note": string }, "fluency": { "summary": string, "pace": string }, "taskCompletion": { "summary": string, "partsCompleted": string[] }, "repeatedMistakes": string[], "fillerWords": { "count": number, "examples": string[] }, "strengths": string[], "weaknesses": string[], "suggestions": string[], "estimatedScore": number, "scoreOutOf": 25, "scoreExplanation": string }. All string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}, except quoted French inside grammar.commonErrors. Explain WHY points were lost in scoreExplanation, and make every suggestion concrete and actionable.`;

  const userPrompt = completedTurns
    .map(
      (turn, i) =>
        `Turn ${i + 1} (part: ${turn.partId}): transcript="${turn.transcript}", turnScore=${turn.feedback.turnScore}/25, relevant=${turn.feedback.relevance}, grammarErrors=${JSON.stringify(turn.feedback.grammarErrors)}, vocabularyNote="${turn.feedback.vocabularyNote}", fluencyNote="${turn.feedback.fluencyNote}", pronunciationNote="${turn.feedback.pronunciationNote}"`
    )
    .join("\n");

  const parsed = await callClaudeForJson(client, system, userPrompt);
  return reportSchema.parse(parsed);
}
