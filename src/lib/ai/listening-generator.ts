import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { SPEAKING_EVAL_MODEL } from "./anthropic";
import { DELF_LISTENING_LEVELS } from "@/config/delf-listening";
import type { DelfLevel, FeedbackLanguage, ListeningMode, ListeningSet } from "@/types/listening";

/**
 * Real Claude-based DELF Listening generation — used for "practice-by-part"
 * and "full-exam" when ANTHROPIC_API_KEY is configured. The Daily
 * Challenge intentionally never calls this: it must be byte-identical for
 * every student at a level on a given day, which only the deterministic
 * offline bank can guarantee without a shared backend (see the API route).
 * Falls back to lib/mock/listening-generator.ts on any failure.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const optionSchema = z.object({ id: z.string(), text: z.string() });

const explanationSchema = z.object({
  whereInRecording: z.string(),
  keywords: z.string(),
  whyCorrect: z.string(),
  whyIncorrect: z.array(z.object({ optionId: z.string(), reason: z.string() })),
  vocabulary: z.array(z.object({ term: z.string(), translation: z.string() })),
  grammarPattern: z.string(),
  strategy: z.string(),
});

const questionSchema = z.object({
  id: z.string(),
  recordingId: z.string(),
  questionNumber: z.number(),
  prompt: z.string(),
  options: z.array(optionSchema).min(3).max(5),
  correctOptionId: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  skillTag: z.enum(["mainIdea", "detail", "number", "name", "date", "vocabulary"]),
  explanation: explanationSchema,
});

const recordingSchema = z.object({
  id: z.string(),
  partLabel: z.string(),
  topic: z.string(),
  transcript: z.string(),
  estimatedDurationSeconds: z.number(),
});

const generatedSetSchema = z.object({
  recordings: z.array(recordingSchema).min(1),
  questions: z.array(questionSchema).min(1),
}) satisfies z.ZodType<Pick<ListeningSet, "recordings" | "questions">>;

export async function generateListeningSet(
  client: Anthropic,
  level: DelfLevel,
  mode: ListeningMode,
  language: FeedbackLanguage
): Promise<Pick<ListeningSet, "recordings" | "questions">> {
  const config = DELF_LISTENING_LEVELS[level];
  const recordingCount = mode === "practice-by-part" ? 1 : config.recordingCountMin;
  const topics = config.topics.en.join(", ");

  const system = `You are creating an ORIGINAL DELF ${level} "Compréhension de l'Oral" (listening comprehension) practice exercise. Never copy or closely paraphrase a real official DELF recording — invent entirely new, original scenarios that authentically match DELF ${level} difficulty, vocabulary, and structure. Never reuse the same scenario, names, or numbers across recordings — each must feel genuinely fresh.

Generate exactly ${recordingCount} recording(s). For each recording:
- "id": a unique kebab-case slug. "partLabel": e.g. "Document 1". "topic": a short label in ${FEEDBACK_LANGUAGE_NAMES[language]}.
- "transcript": natural spoken French at DELF ${level} difficulty, on a topic drawn from: ${topics}. Keep it under ${config.maxRecordingMinutes} minutes when spoken aloud (~2.3 words/second, so roughly ${Math.round(config.maxRecordingMinutes * 60 * 2.3 * 0.7)}-${Math.round(config.maxRecordingMinutes * 60 * 2.3)} words).
- "estimatedDurationSeconds": your real estimate for that transcript at ~2.3 words/second.

For each recording, write exactly 2 multiple-choice questions (4 options each, "correctOptionId" matching one option's "id", e.g. "opt-a"/"opt-b"/"opt-c"/"opt-d"). Vary "skillTag" (mainIdea/detail/number/name/date/vocabulary) and "difficulty" (easy/medium/hard) across the set — don't repeat the same skillTag on every question.

For every question's "explanation", write real, specific, educational content grounded in THAT recording's actual transcript — never generic filler, never interchangeable between questions:
- "whereInRecording": quote or closely reference the actual transcript sentence(s) revealing the answer.
- "keywords": the specific French word(s)/expression(s) that signal the answer.
- "whyCorrect": 2-3 sentences on why the correct option specifically matches the recording.
- "whyIncorrect": for EVERY wrong option (all 3), a specific reason grounded in what that option claims — never just "incorrect". Vary the trap type across options (wrong number, wrong person, opposite meaning, unmentioned detail, right-detail-wrong-question).
- "vocabulary": 2-3 real terms actually used in the transcript, each with a translation.
- "grammarPattern": one real grammar observation tied to a structure actually in the transcript.
- "strategy": a concrete listening-exam strategy specific to this question (what to listen for next time).

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "recordings": [{ "id": string, "partLabel": string, "topic": string, "transcript": string, "estimatedDurationSeconds": number }], "questions": [{ "id": string, "recordingId": string, "questionNumber": number, "prompt": string, "options": [{ "id": string, "text": string }], "correctOptionId": string, "difficulty": "easy"|"medium"|"hard", "skillTag": "mainIdea"|"detail"|"number"|"name"|"date"|"vocabulary", "explanation": { "whereInRecording": string, "keywords": string, "whyCorrect": string, "whyIncorrect": [{ "optionId": string, "reason": string }], "vocabulary": [{ "term": string, "translation": string }], "grammarPattern": string, "strategy": string } }] }

transcript, keywords, and vocabulary[].term are French. Every other string value must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `Generate a fresh, original DELF ${level} listening ${mode === "practice-by-part" ? "practice item" : "exam"} now — a specific, concrete, invented scenario, not a generic textbook example.`;

  const maxTokens = 1800 + recordingCount * 1800;
  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, maxTokens);
  return generatedSetSchema.parse(parsed);
}
