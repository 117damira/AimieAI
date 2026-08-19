import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { VocabularySentenceFeedback } from "@/types/vocabulary";
import type { TopikLevel } from "@/types/topik";
import type { FeedbackLanguage } from "@/types/writing-evaluation";
import { callClaudeForJson } from "@/lib/evaluation/claude-json";
import { SPEAKING_EVAL_MODEL } from "./anthropic";

/**
 * Real Claude-based evaluation of a student's own example sentence using a
 * target Korean vocabulary word — used when ANTHROPIC_API_KEY is configured
 * (see anthropic.ts). Falls back to lib/mock/topik-vocabulary-evaluation.ts
 * otherwise. Mirrors vocabulary-evaluator.ts's rubric and JSON contract
 * exactly, adapted for Korean grammar (particles, honorifics, conjugation,
 * spacing) instead of French. Entirely independent of the DELF evaluator —
 * never shares word banks, prompts, or progress data.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const vocabularyMistakeSchema = z.object({
  original: z.string(),
  correction: z.string(),
  whyWrong: z.string(),
});

const vocabularyFeedbackSchema = z.object({
  status: z.enum(["correct", "not-used", "incorrect"]),
  correctedSentence: z.string().nullable(),
  mistakes: z.array(vocabularyMistakeSchema),
  naturalSuggestion: z.string().nullable(),
  explanation: z.string(),
  encouragement: z.string(),
}) satisfies z.ZodType<VocabularySentenceFeedback>;

export async function evaluateTopikVocabularySentence(
  client: Anthropic,
  params: {
    word: string;
    definition: string;
    sentence: string;
    level: TopikLevel;
    language: FeedbackLanguage;
  }
): Promise<VocabularySentenceFeedback> {
  const { word, definition, sentence, level, language } = params;

  const system = `You are a Korean language teacher and TOPIK Level ${level} examiner evaluating a student's own example sentence using the target vocabulary word "${word}" (meaning: "${definition}"). Base every judgment ONLY on the sentence provided. Never assume the sentence is correct by default, and never invent a mistake that isn't really there.

Work through these checks IN ORDER, and only decide the final "status" after ALL of them are done:

1. Is this actually a real sentence (not just a random list of unconnected words)? If it's just a word list, "status" is "incorrect" and explain that plainly.
2. Was the target word "${word}" actually used — present, in a correctly conjugated/inflected form if it's a verb or adjective, and with any expected particle attached correctly if it's a noun? If not, "status" is "not-used".
3. Was it used with the correct MEANING, in a way that fits the context — not just grammatically present? A sentence can be grammatically fine and still be nonsensical. If the word is used with the wrong meaning or in a nonsensical context, that's a real problem — explain exactly why.
4. Is the grammatical form correct — verb/adjective conjugation, particle choice (은/는/이/가/을/를/etc.), honorific level consistency, word order, spacing (띄어쓰기), missing words, tense, and punctuation? Find EVERY real mistake, don't stop at the first one (cap at a reasonable number if there are many). Never miss an obvious one, and never invent one that isn't there.
5. Does the overall sentence sound natural / fluent Korean?

Only after all five checks: set "status" to "correct" ONLY if the word was used, with the right meaning, with correct grammar, and the sentence reads naturally. Otherwise "status" is "incorrect" (word present but something is wrong) or "not-used" (word absent) as appropriate. Never default to "correct" — it must be earned by the sentence actually passing every check.

For EVERY mistake found (grammar OR meaning/context), add one entry to "mistakes": quote the exact wrong part in "original", give the fix in "correction", and in "whyWrong" explain what was wrong, why, which grammar rule applies (if it's a grammar issue), and why the fix is better. If there are no mistakes, "mistakes" is an empty array.

For "correctedSentence": rewrite ONLY the student's own sentence with every real mistake fixed — preserve their original meaning and wording as much as possible, don't invent a completely different sentence. If status is "correct" and nothing needed changing, set "correctedSentence" to null (the UI will show "No corrections needed."). If status is "not-used", set "correctedSentence" to a natural example sentence that does use the word correctly, since there's nothing of the student's own to correct.

In "naturalSuggestion", if a more natural/idiomatic phrasing would help beyond the corrections already made, offer ONE brief suggestion — otherwise null. In "explanation", summarize the overall assessment — why the sentence works, or why the corrected version is better. In "encouragement", one warm, specific, encouraging line genuinely tied to this attempt — never generic.

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "status": "correct" | "not-used" | "incorrect", "correctedSentence": string | null, "mistakes": [{ "original": string, "correction": string, "whyWrong": string }], "naturalSuggestion": string | null, "explanation": string, "encouragement": string }

"correctedSentence" and mistakes[].original/correction are Korean. All other string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `Target word: ${word}\nStudent's sentence: "${sentence}"`;

  const parsed = await callClaudeForJson(client, SPEAKING_EVAL_MODEL, system, userPrompt, 1000);
  return vocabularyFeedbackSchema.parse(parsed);
}
