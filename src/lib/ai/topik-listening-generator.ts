import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { SPEAKING_EVAL_MODEL } from "./anthropic";
import { TOPIK_LISTENING_LEVELS } from "@/config/topik-listening";
import type {
  FeedbackLanguage,
  TopikLevel,
  TopikListeningMode,
  TopikListeningSet,
} from "@/types/topik-listening";

/**
 * Real Claude-based TOPIK Listening generation — used for "practice-by-part"
 * and "full-exam" when ANTHROPIC_API_KEY is configured. The Daily
 * Challenge intentionally never calls this: it must be byte-identical for
 * every student at a level on a given day, which only the deterministic
 * offline bank can guarantee without a shared backend (see the API route).
 * Falls back to lib/mock/topik-listening-generator.ts on any failure.
 * Mirrors lib/ai/listening-generator.ts's system-prompt-construction
 * convention exactly, but for genuinely TOPIK-shaped Korean content —
 * never DELF, never a translation of DELF material.
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
  type: z.enum(["multiple-choice", "true-false", "multi-select"]),
  prompt: z.string(),
  options: z.array(optionSchema).min(2).max(5),
  correctOptionIds: z.array(z.string()).min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  skillTag: z.enum([
    "mainIdea",
    "speakerIntention",
    "detail",
    "statementMatch",
    "numberDateLocation",
    "relationship",
    "inference",
  ]),
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
}) satisfies z.ZodType<Pick<TopikListeningSet, "recordings" | "questions">>;

export async function generateTopikListeningSet(
  client: Anthropic,
  level: TopikLevel,
  mode: TopikListeningMode,
  language: FeedbackLanguage
): Promise<Pick<TopikListeningSet, "recordings" | "questions">> {
  const config = TOPIK_LISTENING_LEVELS[level];
  const recordingCount = mode === "practice-by-part" ? 1 : config.recordingCountMin;
  const topics = config.topics.en.join(", ");

  const system = `You are creating an ORIGINAL TOPIK Level ${level} (TOPIK ${config.track}) "듣기" (Listening comprehension) practice exercise. Never copy or closely paraphrase a real official TOPIK recording — invent entirely new, original scenarios that authentically match TOPIK Level ${level} difficulty, vocabulary, and grammar. Never reuse the same scenario, names, or numbers across recordings — each must feel genuinely fresh. Never mention or reference any other exam.

Generate exactly ${recordingCount} recording(s). For each recording:
- "id": a unique kebab-case slug. "partLabel": e.g. "Recording 1". "topic": a short label in ${FEEDBACK_LANGUAGE_NAMES[language]}.
- "transcript": natural spoken Korean (한국어) at TOPIK Level ${level} difficulty, on a topic drawn from: ${topics}. Keep it under ${config.maxRecordingMinutes} minutes when spoken aloud (~2.7 syllable-blocks/second equivalent, so roughly ${Math.round(config.maxRecordingMinutes * 60 * 2.7 * 0.7)}-${Math.round(config.maxRecordingMinutes * 60 * 2.7)} eojeol/words).
- "estimatedDurationSeconds": your real estimate for that transcript at natural TOPIK Level ${level} speaking pace.

For each recording, write exactly 3 questions, mixing question types for real variety — don't make every question the same type:
- "multiple-choice": 4 options, "correctOptionIds" is a single-element array with one option's "id" (e.g. "opt-a"/"opt-b"/"opt-c"/"opt-d").
- "true-false": exactly 2 options (true/false, phrased in the target language), "correctOptionIds" is a single-element array.
- "multi-select" ("select all that apply"): 4-5 options where more than one can be correct, "correctOptionIds" lists every correct option's id.
Use at least one "true-false" and, when it genuinely fits the recording's content, one "multi-select" per recording — never force a multi-select where only one answer is actually correct. Vary "skillTag" across mainIdea (main idea of the recording), speakerIntention (the speaker's purpose/intention), detail (a specific fact), statementMatch (which statement matches the recording), numberDateLocation (numbers/dates/locations/situations), relationship (relationship between the speakers), and inference (meaning not stated directly) — and vary "difficulty" (easy/medium/hard) across the set — don't repeat the same skillTag on every question.

For every question's "explanation", write real, specific, educational content grounded in THAT recording's actual transcript — never generic filler, never interchangeable between questions:
- "whereInRecording": quote or closely reference the actual transcript sentence(s) revealing the answer.
- "keywords": the specific Korean word(s)/expression(s) that signal the answer.
- "whyCorrect": 2-3 sentences on why the correct option(s) specifically match the recording.
- "whyIncorrect": for EVERY option that is NOT in "correctOptionIds", a specific reason grounded in what that option claims — never just "incorrect". Vary the trap type across options (wrong number, wrong person, opposite meaning, unmentioned detail, right-detail-wrong-question).
- "vocabulary": 2-3 real terms actually used in the transcript, each with a translation.
- "grammarPattern": one real grammar observation tied to a structure actually in the transcript (e.g. a specific Korean grammar pattern/ending).
- "strategy": a concrete listening-exam strategy specific to this question (what to listen for next time).

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "recordings": [{ "id": string, "partLabel": string, "topic": string, "transcript": string, "estimatedDurationSeconds": number }], "questions": [{ "id": string, "recordingId": string, "questionNumber": number, "type": "multiple-choice"|"true-false"|"multi-select", "prompt": string, "options": [{ "id": string, "text": string }], "correctOptionIds": string[], "difficulty": "easy"|"medium"|"hard", "skillTag": "mainIdea"|"speakerIntention"|"detail"|"statementMatch"|"numberDateLocation"|"relationship"|"inference", "explanation": { "whereInRecording": string, "keywords": string, "whyCorrect": string, "whyIncorrect": [{ "optionId": string, "reason": string }], "vocabulary": [{ "term": string, "translation": string }], "grammarPattern": string, "strategy": string } }] }

transcript, keywords, and vocabulary[].term are Korean. Every other string value must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `Generate a fresh, original TOPIK Level ${level} listening ${mode === "practice-by-part" ? "practice item" : "exam"} now — a specific, concrete, invented scenario, not a generic textbook example.`;

  const maxTokens = 1800 + recordingCount * 1800;
  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, maxTokens);
  return generatedSetSchema.parse(parsed);
}
