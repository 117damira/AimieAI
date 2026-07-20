import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { VocabularySentenceFeedback } from "@/types/vocabulary";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import { SPEAKING_EVAL_MODEL } from "./anthropic";

/**
 * Real Claude-based evaluation of a student's own example sentence using a
 * target vocabulary word — used when ANTHROPIC_API_KEY is configured (see
 * anthropic.ts). Falls back to lib/mock/vocabulary-evaluation.ts otherwise.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

const vocabularyFeedbackSchema = z.object({
  usedCorrectly: z.boolean(),
  correctedSentence: z.string(),
  whyWrong: z.string().nullable(),
  naturalSuggestion: z.string().nullable(),
  explanation: z.string(),
  encouragement: z.string(),
}) satisfies z.ZodType<VocabularySentenceFeedback>;

function extractJson(text: string): unknown {
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : text.trim());
}

export async function evaluateVocabularySentence(
  client: Anthropic,
  params: {
    word: string;
    definition: string;
    sentence: string;
    level: DelfLevel;
    language: FeedbackLanguage;
  }
): Promise<VocabularySentenceFeedback> {
  const { word, definition, sentence, level, language } = params;

  const system = `You are a French teacher evaluating a DELF ${level} student's own example sentence using the target vocabulary word "${word}" (meaning: "${definition}"). Base every judgment ONLY on the sentence provided — never assume it's correct by default, and never invent a mistake that isn't really there.

First check whether the student's sentence genuinely uses "${word}" (in a correctly inflected form if it's a verb) doing real work in the sentence's meaning — not just present nearby. If the word isn't really used, set "usedCorrectly" to false, explain that in "whyWrong", and in "correctedSentence" give a natural example sentence that does use it correctly.

If the word IS used, check the sentence for real grammar mistakes. If you find one, correct it in "correctedSentence" (keep the rest of the sentence as close to the student's original wording as possible), and explain the mistake in "whyWrong". If the sentence has no mistakes, set "whyWrong" to null and "correctedSentence" to the student's own sentence (lightly cleaned up only if needed).

In "naturalSuggestion", if a more natural or idiomatic phrasing would help, offer ONE brief suggestion — otherwise null. In "explanation", briefly say why the correction/suggestion makes sense (or why the sentence works well). In "encouragement", give one warm, specific, encouraging line about vocabulary usage — genuinely tied to this attempt, not generic.

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "usedCorrectly": boolean, "correctedSentence": string, "whyWrong": string | null, "naturalSuggestion": string | null, "explanation": string, "encouragement": string }

"correctedSentence" is French. All other string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `Target word: ${word}\nStudent's sentence: "${sentence}"`;

  const response = await client.messages.create({
    model: SPEAKING_EVAL_MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!block) throw new Error("Claude response had no text content");
  const parsed = extractJson(block.text);
  return vocabularyFeedbackSchema.parse(parsed);
}
