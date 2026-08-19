import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { SPEAKING_EVAL_MODEL } from "./anthropic";
import { TOPIK_READING_LEVELS } from "@/config/topik-reading";
import type { TopikLevel, FeedbackLanguage, TopikReadingMode, TopikReadingSet } from "@/types/topik-reading";

/**
 * Real Claude-based TOPIK Reading (읽기) generation — used for
 * "practice-by-text" and "full-exam" when ANTHROPIC_API_KEY is configured.
 * This is what actually delivers unlimited, never-repeating content — the
 * Daily Challenge intentionally never calls this: it must be byte-identical
 * for every student at a level on a given day, which only the deterministic
 * offline bank can guarantee without a shared backend (see the API route).
 * Falls back to lib/mock/topik-reading-generator.ts on any failure. Mirrors
 * lib/ai/reading-generator.ts's established pattern exactly, adapted to
 * TOPIK's ten reading skill tags and Korean passage content.
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
  type: z.enum(["multiple-choice", "true-false", "multi-select", "matching", "ordering"]),
  prompt: z.string(),
  options: z.array(optionSchema).min(2).max(5),
  correctOptionIds: z.array(z.string()).min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  skillTag: z.enum([
    "vocabGrammar",
    "sentenceCompletion",
    "correctSentence",
    "mainIdea",
    "detail",
    "ordering",
    "appropriateResponse",
    "inference",
    "authorIntention",
    "correctStatement",
  ]),
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
}) satisfies z.ZodType<Pick<TopikReadingSet, "passages" | "questions" | "vocabulary">>;

export async function generateTopikReadingSet(
  client: Anthropic,
  level: TopikLevel,
  mode: TopikReadingMode,
  language: FeedbackLanguage
): Promise<Pick<TopikReadingSet, "passages" | "questions" | "vocabulary">> {
  const config = TOPIK_READING_LEVELS[level];
  const passageCount = mode === "practice-by-text" ? 1 : config.passageCountMin;
  const textTypes = config.textTypes.en.join(", ");
  const topics = config.topics.en.join(", ");

  const system = `You are creating an ORIGINAL TOPIK ${level}급 (Test of Proficiency in Korean, level ${level}) Reading practice exercise. Never copy or closely paraphrase a real official TOPIK text — invent entirely new, original passages that authentically match TOPIK ${level}급 difficulty, vocabulary, and structure. Never reuse the same scenario, names, or numbers across passages — each must feel genuinely fresh.

Generate exactly ${passageCount} passage(s). For each passage:
- "id": a unique kebab-case slug. "textType": one of these TOPIK ${level}급 text types: ${textTypes}. "title": a short label in ${FEEDBACK_LANGUAGE_NAMES[language]}.
- "body": natural written Korean (한국어) at TOPIK ${level}급 difficulty, on a topic drawn from: ${topics}. Keep it under ${config.maxWordsPerPassage} 어절 (space-separated word-units).
- "estimatedWordCount": your real 어절 count for that body.

For each passage, write exactly 3 questions, mixing question types for real variety — don't make every question the same type:
- "multiple-choice": 4 options, "correctOptionIds" is a single-element array with one option's "id" (e.g. "opt-a"/"opt-b"/"opt-c"/"opt-d").
- "true-false": exactly 2 options (true/false, phrased in the target language), "correctOptionIds" is a single-element array.
- "multi-select" ("select all that apply"): 4-5 options where more than one can be correct, "correctOptionIds" lists every correct option's id.
- "matching"/"ordering": modeled with the same options/correctOptionIds shape as multiple-choice (e.g. matching a paragraph to its correct heading, or choosing the correct sentence order among several offered orderings).
Vary "skillTag" across the set using ONLY these ten values — don't repeat the same skillTag on every question: vocabGrammar (choosing the right word/grammar for a blank), sentenceCompletion (choosing the sentence/phrase that completes the text), correctSentence (choosing the grammatically/contextually correct sentence), mainIdea, detail, ordering (arranging jumbled sentences), appropriateResponse (choosing a fitting reply in a dialogue), inference, authorIntention (why the writer included something), correctStatement (which statement matches the passage). Vary "difficulty" (easy/medium/hard) across the set too, and include at least one "inference" or "authorIntention" question per passage when it genuinely fits the level.

For every question:
- "evidenceQuote": an EXACT substring copied verbatim from that passage's Korean "body" — the sentence(s) that contain the supporting evidence. This must be a real, direct quote, never paraphrased, since it will be highlighted directly inside the passage text.
- "hint": one sentence of strategy-only guidance (e.g. "Focus on the second sentence", "Pay attention to the connective word") that helps the student find the answer WITHOUT revealing or narrowing down to the correct option.

For every question's "explanation", write real, specific, educational content grounded in THAT passage's actual text — never generic filler, never interchangeable between questions:
- "whereInText": quote or closely reference the actual passage sentence(s) revealing the answer.
- "keywords": the specific Korean word(s)/expression(s) that signal the answer.
- "whyCorrect": 2-3 sentences on why the correct option(s) specifically match the passage.
- "whyIncorrect": for EVERY option that is NOT in "correctOptionIds", a specific reason grounded in what that option claims — never just "incorrect". Vary the trap type across options (wrong number, wrong person, opposite meaning, unmentioned detail, right-detail-wrong-question).
- "vocabulary": 2-3 real terms actually used in the passage, each with a translation.
- "grammarPattern": one real Korean grammar observation tied to a structure actually in the passage (e.g. a specific -아서/어서, -는데, -ㄹ 수 있다 pattern actually present).
- "strategy": a concrete reading-exam strategy specific to this question (what to look for next time).

Also generate a passage-level "vocabulary" array (across all passages combined) with 3-5 of the most useful Korean words/expressions actually used in the text(s), each with: "term" (Korean), "translation" (in ${FEEDBACK_LANGUAGE_NAMES[language]}), "definition" (a short explanation in ${FEEDBACK_LANGUAGE_NAMES[language]}), and "exampleSentence" (Korean, ideally the sentence from the passage itself or a similar natural one).

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "passages": [{ "id": string, "textType": string, "title": string, "body": string, "estimatedWordCount": number }], "questions": [{ "id": string, "passageId": string, "questionNumber": number, "type": "multiple-choice"|"true-false"|"multi-select"|"matching"|"ordering", "prompt": string, "options": [{ "id": string, "text": string }], "correctOptionIds": string[], "difficulty": "easy"|"medium"|"hard", "skillTag": "vocabGrammar"|"sentenceCompletion"|"correctSentence"|"mainIdea"|"detail"|"ordering"|"appropriateResponse"|"inference"|"authorIntention"|"correctStatement", "evidenceQuote": string, "hint": string, "explanation": { "whereInText": string, "keywords": string, "whyCorrect": string, "whyIncorrect": [{ "optionId": string, "reason": string }], "vocabulary": [{ "term": string, "translation": string }], "grammarPattern": string, "strategy": string } }], "vocabulary": [{ "term": string, "translation": string, "definition": string, "exampleSentence": string }] }

body, evidenceQuote, keywords, vocabulary[].term, and vocabulary[].exampleSentence are Korean. Every other string value must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}. Never mention DELF or any other exam — this is TOPIK only.`;

  const userPrompt = `Generate a fresh, original TOPIK ${level}급 reading ${mode === "practice-by-text" ? "practice item" : "exam"} now — a specific, concrete, invented Korean text, not a generic textbook example.`;

  const maxTokens = 2200 + passageCount * 2200;
  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, maxTokens);
  return generatedSetSchema.parse(parsed);
}
