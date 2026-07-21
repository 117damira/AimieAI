import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { SPEAKING_EVAL_MODEL } from "./anthropic";
import { DELF_READING_LEVELS } from "@/config/delf-reading";
import type { DelfLevel, FeedbackLanguage, ReadingMode, ReadingSet } from "@/types/reading";

/**
 * Real Claude-based DELF Reading generation — used for "practice-by-text"
 * and "full-exam" when ANTHROPIC_API_KEY is configured. This is what
 * actually delivers unlimited, never-repeating content — the Daily
 * Challenge intentionally never calls this: it must be byte-identical for
 * every student at a level on a given day, which only the deterministic
 * offline bank can guarantee without a shared backend (see the API route).
 * Falls back to lib/mock/reading-generator.ts on any failure. Mirrors
 * lib/ai/listening-generator.ts's established pattern.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const optionSchema = z.object({ id: z.string(), text: z.string() });

const explanationSchema = z.object({
  whereInText: z.string(),
  keywords: z.string(),
  whyCorrect: z.string(),
  whyIncorrect: z.array(z.object({ optionId: z.string(), reason: z.string() })),
  vocabulary: z.array(z.object({ term: z.string(), translation: z.string() })),
  grammarPattern: z.string(),
  strategy: z.string(),
});

const questionSchema = z.object({
  id: z.string(),
  passageId: z.string(),
  questionNumber: z.number(),
  type: z.enum(["multiple-choice", "true-false", "multi-select", "matching", "heading-matching"]),
  prompt: z.string(),
  options: z.array(optionSchema).min(2).max(5),
  correctOptionIds: z.array(z.string()).min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  skillTag: z.enum(["mainIdea", "detail", "inference", "vocabulary", "grammar"]),
  evidenceQuote: z.string(),
  hint: z.string(),
  explanation: explanationSchema,
});

const passageSchema = z.object({
  id: z.string(),
  textType: z.string(),
  title: z.string(),
  body: z.string(),
  estimatedWordCount: z.number(),
});

const vocabularyItemSchema = z.object({
  term: z.string(),
  translation: z.string(),
  definition: z.string(),
  exampleSentence: z.string(),
});

const generatedSetSchema = z.object({
  passages: z.array(passageSchema).min(1),
  questions: z.array(questionSchema).min(1),
  vocabulary: z.array(vocabularyItemSchema).min(1),
}) satisfies z.ZodType<Pick<ReadingSet, "passages" | "questions" | "vocabulary">>;

export async function generateReadingSet(
  client: Anthropic,
  level: DelfLevel,
  mode: ReadingMode,
  language: FeedbackLanguage
): Promise<Pick<ReadingSet, "passages" | "questions" | "vocabulary">> {
  const config = DELF_READING_LEVELS[level];
  const passageCount = mode === "practice-by-text" ? 1 : config.passageCountMin;
  const textTypes = config.textTypes.en.join(", ");
  const topics = config.topics.en.join(", ");

  const system = `You are creating an ORIGINAL DELF ${level} "Compréhension des Écrits" (reading comprehension) practice exercise. Never copy or closely paraphrase a real official DELF text — invent entirely new, original passages that authentically match DELF ${level} difficulty, vocabulary, and structure. Never reuse the same scenario, names, or numbers across passages — each must feel genuinely fresh.

Generate exactly ${passageCount} passage(s). For each passage:
- "id": a unique kebab-case slug. "textType": one of these DELF ${level} text types: ${textTypes}. "title": a short label in ${FEEDBACK_LANGUAGE_NAMES[language]}.
- "body": natural written French at DELF ${level} difficulty, on a topic drawn from: ${topics}. Keep it under ${config.maxWordsPerPassage} words.
- "estimatedWordCount": your real word count for that body.

For each passage, write exactly 3 questions, mixing question types for real variety — don't make every question the same type:
- "multiple-choice": 4 options, "correctOptionIds" is a single-element array with one option's "id" (e.g. "opt-a"/"opt-b"/"opt-c"/"opt-d").
- "true-false": exactly 2 options (true/false, phrased in the target language), "correctOptionIds" is a single-element array.
- "multi-select" ("select all that apply"): 4-5 options where more than one can be correct, "correctOptionIds" lists every correct option's id.
- "matching"/"heading-matching": modeled with the same options/correctOptionIds shape as multiple-choice (e.g. matching a paragraph to its correct heading among several offered).
Vary "skillTag" (mainIdea/detail/inference/vocabulary/grammar) and "difficulty" (easy/medium/hard) across the set — don't repeat the same skillTag on every question, and include at least one "inference" and one "vocabulary" question per passage when it genuinely fits.

For every question:
- "evidenceQuote": an EXACT substring copied verbatim from that passage's "body" — the sentence(s) that contain the supporting evidence. This must be a real, direct quote, never paraphrased, since it will be highlighted directly inside the passage text.
- "hint": one sentence of strategy-only guidance (e.g. "Focus on the second paragraph", "Pay attention to the dates") that helps the student find the answer WITHOUT revealing or narrowing down to the correct option.

For every question's "explanation", write real, specific, educational content grounded in THAT passage's actual text — never generic filler, never interchangeable between questions:
- "whereInText": quote or closely reference the actual passage sentence(s) revealing the answer.
- "keywords": the specific French word(s)/expression(s) that signal the answer.
- "whyCorrect": 2-3 sentences on why the correct option(s) specifically match the passage.
- "whyIncorrect": for EVERY option that is NOT in "correctOptionIds", a specific reason grounded in what that option claims — never just "incorrect". Vary the trap type across options (wrong number, wrong person, opposite meaning, unmentioned detail, right-detail-wrong-question).
- "vocabulary": 2-3 real terms actually used in the passage, each with a translation.
- "grammarPattern": one real grammar observation tied to a structure actually in the passage.
- "strategy": a concrete reading-exam strategy specific to this question (what to look for next time).

Also generate a passage-level "vocabulary" array (across all passages combined) with 3-5 of the most useful French words/expressions actually used in the text(s), each with: "term" (French), "translation" (in ${FEEDBACK_LANGUAGE_NAMES[language]}), "definition" (a short explanation in ${FEEDBACK_LANGUAGE_NAMES[language]}), and "exampleSentence" (French, ideally the sentence from the passage itself or a similar natural one).

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "passages": [{ "id": string, "textType": string, "title": string, "body": string, "estimatedWordCount": number }], "questions": [{ "id": string, "passageId": string, "questionNumber": number, "type": "multiple-choice"|"true-false"|"multi-select"|"matching"|"heading-matching", "prompt": string, "options": [{ "id": string, "text": string }], "correctOptionIds": string[], "difficulty": "easy"|"medium"|"hard", "skillTag": "mainIdea"|"detail"|"inference"|"vocabulary"|"grammar", "evidenceQuote": string, "hint": string, "explanation": { "whereInText": string, "keywords": string, "whyCorrect": string, "whyIncorrect": [{ "optionId": string, "reason": string }], "vocabulary": [{ "term": string, "translation": string }], "grammarPattern": string, "strategy": string } }], "vocabulary": [{ "term": string, "translation": string, "definition": string, "exampleSentence": string }] }

body, evidenceQuote, keywords, vocabulary[].term, and vocabulary[].exampleSentence are French. Every other string value must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `Generate a fresh, original DELF ${level} reading ${mode === "practice-by-text" ? "practice item" : "exam"} now — a specific, concrete, invented text, not a generic textbook example.`;

  const maxTokens = 2200 + passageCount * 2200;
  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, maxTokens);
  return generatedSetSchema.parse(parsed);
}
