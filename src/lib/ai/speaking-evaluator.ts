import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import type {
  CompletedTurn,
  FollowUpQuestion,
  GeneratedSpeakingQuestion,
  GeneratedTopicChoice,
  SpeakingExaminerReport,
  TurnFeedback,
} from "@/types/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import { SPEAKING_EVAL_MODEL } from "./anthropic";

/**
 * Real Claude-based DELF speaking evaluation and question generation — used
 * when ANTHROPIC_API_KEY is configured (see anthropic.ts). Every score/note
 * comes from Claude reading the candidate's actual transcript, never
 * randomized. Responses are validated against these zod schemas; a
 * malformed response throws, and the calling API route falls back to the
 * deterministic mock (or the static question bank) rather than surface
 * broken data.
 */

const FEEDBACK_LANGUAGE_NAMES: Record<FeedbackLanguage, string> = {
  en: "English",
  ru: "Russian",
  kz: "Kazakh",
};

/** Topics/scenario types the spec requires per level — fed into the
 * question-generation prompt, never shown to the user directly. */
const LEVEL_TOPIC_HINTS: Record<DelfLevel, string> = {
  A1: "daily routine, family, home, hobbies, school, food",
  A2: "personal life, hobbies, studies, work, travel, weekend activities",
  B1: "solving a real-life situation, convincing someone, expressing an opinion, discussing a social topic",
  B2: "a discussion built around the chosen topic, defended with structured arguments",
};

const grammarMistakeSchema = z.object({
  original: z.string(),
  correction: z.string(),
  category: z.enum(["verb", "agreement", "sentence-structure", "other"]),
  whyWrong: z.string(),
  howToFix: z.string(),
  betterExample: z.string(),
  howToAvoid: z.string(),
});

const followUpQuestionSchema = z
  .object({ prompt: z.string(), translation: z.string() })
  .nullable();

const mispronuncedWordSchema = z.object({
  word: z.string(),
  note: z.string(),
});

const turnFeedbackSchema = z.object({
  relevance: z.boolean(),
  taskCompletionNote: z.string(),
  coherenceNote: z.string(),
  grammarErrors: z.array(grammarMistakeSchema),
  vocabularyNote: z.string(),
  sentenceVarietyNote: z.string(),
  fluencyNote: z.string(),
  pronunciationNote: z.string(),
  mispronuncedWords: z.array(mispronuncedWordSchema),
  naturalnessNote: z.string(),
  structureNote: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  suggestions: z.array(z.string()),
  betterExampleAnswer: z.string().nullable(),
  encouragement: z.string(),
  turnScore: z.number().min(0).max(25),
}) satisfies z.ZodType<TurnFeedback>;

const evaluateTurnResponseSchema = z.object({
  feedback: turnFeedbackSchema,
  followUpQuestion: followUpQuestionSchema,
});

const reportSchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2"]),
  totalQuestions: z.number(),
  grammar: z.object({ summary: z.string(), commonErrors: z.array(grammarMistakeSchema) }),
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

const sessionQuestionsSchema = z.object({
  parts: z.array(
    z.object({
      partId: z.string(),
      questions: z.array(z.object({ prompt: z.string(), translation: z.string() })),
    })
  ),
});

const topicChoicesSchema = z.object({
  topics: z.array(z.object({ title: z.string(), translation: z.string() })).length(2),
});

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
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!block) throw new Error("Claude response had no text content");
  return extractJson(block.text);
}

/** True for parts where a natural reactive follow-up makes sense — A2's
 * guided interview/monologue, B1's guided interview and interactive
 * negotiation. Never B2 (formal, single extended defense) or A1 (too
 * elementary for reactive follow-ups). */
function isConversationalPart(level: DelfLevel, partId: string): boolean {
  if (level === "A2") return partId !== "a2-dialogue-simule";
  if (level === "B1") return partId === "b1-entretien-dirige" || partId === "b1-exercice-interaction";
  return false;
}

export async function evaluateTurnWithClaude(
  client: Anthropic,
  params: {
    level: DelfLevel;
    partId: string;
    partLabel: string;
    prompt: string;
    transcript: string;
    wordCount: number;
    recognitionConfidence: number | null;
    language: FeedbackLanguage;
  }
): Promise<{ feedback: TurnFeedback; followUpQuestion: FollowUpQuestion | null }> {
  const { level, partId, partLabel, prompt, transcript, wordCount, recognitionConfidence, language } = params;
  const allowFollowUp = isConversationalPart(level, partId);

  const system = `You are an experienced official DELF French oral examiner evaluating a candidate's spoken answer, transcribed by speech recognition. Grade strictly against the real DELF ${level} "Production Orale" rubric for the "${partLabel}" exercise. Base every judgment ONLY on the transcript provided — never invent details the candidate didn't say, and never give generic or templated feedback — everything must be specific to what this candidate actually said. Never assume an answer is correct or on-topic by default — actively compare what was asked against what was actually said before judging anything else.

First, determine "relevance": does the transcript actually address the question asked? If it does not, "taskCompletionNote" must explicitly say what the candidate did instead of answering the question (e.g. "You introduced yourself instead of answering what you did last weekend" — never a vague "task completed" when the task wasn't completed). Only after establishing relevance should you evaluate grammar and the rest of the rubric — the transcript is still graded for real grammar mistakes either way, but the relevance judgment always comes first and is never skipped or assumed.

Evaluate the full examiner rubric: task achievement and relevance to the prompt (relevance, taskCompletionNote), coherence and organization of ideas (coherenceNote), grammar accuracy, vocabulary range (vocabularyNote), sentence variety — does the candidate vary sentence structure or repeat the same pattern (sentenceVarietyNote), fluency (fluencyNote), pronunciation (proxy only — see below), naturalness of expression — does it sound idiomatic or stilted/translated (naturalnessNote), and answer structure (structureNote): does the response include an introduction where appropriate, a direct answer, supporting detail, an example where appropriate, and a conclusion where appropriate — name exactly what's missing and how a stronger candidate would organize the answer.

For EVERY grammar mistake, teach, don't just flag: explain what is wrong and why (whyWrong), how to correct it (howToFix), give a fresh correct French example sentence demonstrating the rule (betterExample), and how to avoid repeating this mistake (howToAvoid). Only ever quote a mistake that is genuinely present in the transcript — never invent one. If the transcript is genuinely free of grammar mistakes, return an empty "grammarErrors" array rather than manufacturing one.

The transcript comes from browser speech recognition, not audio, so you cannot hear pronunciation directly. For "pronunciationNote", give an overall proxy assessment based on disfluencies, hesitations, and the provided recognition confidence score, and say so plainly rather than claiming certainty you don't have. Additionally, in "mispronuncedWords", pick up to 3 real words from the transcript that are commonly mispronounced by ${level}-level French learners for a genuine phonetic reason (nasal vowels, silent endings, liaison, etc.) — each with the exact word and a brief note on the correct pronunciation. Only include words that actually appear in the transcript; return an empty array if none are notably tricky.

Then provide, specific to this exact answer: 2-4 "strengths" (what the candidate did well), 2-4 "areasForImprovement" (specific weaknesses), and 2-4 "suggestions" (concrete, actionable advice). Always write "betterExampleAnswer": a model response in French at the ${level} level answering the same question, demonstrating strong DELF structure (this is shown to the learner as a study aid, so it must always be present and genuinely useful — never omit it and never mention API keys, configuration, or anything about how the answer was generated).

${
  allowFollowUp
    ? `This is a conversational exercise. If (and only if) the candidate's answer naturally invites a reactive follow-up question (the way a real examiner would react to something specific they said), include one original French follow-up question in "followUpQuestion". Otherwise set "followUpQuestion" to null. Never force one.`
    : `This exercise does not use reactive follow-ups — always set "followUpQuestion" to null.`
}

Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{ "feedback": { "relevance": boolean, "taskCompletionNote": string, "coherenceNote": string, "grammarErrors": [{ "original": string, "correction": string, "category": "verb" | "agreement" | "sentence-structure" | "other", "whyWrong": string, "howToFix": string, "betterExample": string, "howToAvoid": string }], "vocabularyNote": string, "sentenceVarietyNote": string, "fluencyNote": string, "pronunciationNote": string, "mispronuncedWords": [{ "word": string, "note": string }], "naturalnessNote": string, "structureNote": string, "strengths": string[], "areasForImprovement": string[], "suggestions": string[], "betterExampleAnswer": string, "encouragement": string, "turnScore": number (0-25) }, "followUpQuestion": { "prompt": string, "translation": string } | null }

All string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}, except grammarErrors[].original/correction/betterExample, mispronuncedWords[].word, followUpQuestion.prompt, and betterExampleAnswer, which are French.`;

  const userPrompt = `DELF level: ${level}
Exercise part: ${partLabel}
Question (French): ${prompt}
Candidate's transcribed spoken answer (French): "${transcript}"
Word count: ${wordCount}
Speech recognition confidence: ${recognitionConfidence !== null ? recognitionConfidence.toFixed(2) : "unavailable"}`;

  const parsed = await callClaudeForJson(client, system, userPrompt);
  return evaluateTurnResponseSchema.parse(parsed);
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

  const system = `You are an official DELF French oral examiner writing a final "Production Orale" report after a full practice session at level ${level}. Base every judgment ONLY on the transcripts and per-turn feedback provided below — synthesize genuine patterns across turns (e.g. a grammar mistake that recurred more than once, a structural gap like missing supporting detail or examples that showed up in several answers, or noticeably repetitive vocabulary), never invent new ones. This report must summarize only this candidate's own actual performance in this session, not generic level-appropriate text. Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape: { "level": "${level}", "totalQuestions": number, "grammar": { "summary": string, "commonErrors": [{ "original": string, "correction": string, "category": "verb" | "agreement" | "sentence-structure" | "other", "whyWrong": string, "howToFix": string, "betterExample": string, "howToAvoid": string }] }, "vocabulary": { "summary": string, "rangeNote": string }, "pronunciation": { "summary": string, "note": string }, "fluency": { "summary": string, "pace": string }, "taskCompletion": { "summary": string, "partsCompleted": string[] }, "repeatedMistakes": string[], "fillerWords": { "count": number, "examples": string[] }, "strengths": string[], "weaknesses": string[], "suggestions": string[], "estimatedScore": number, "scoreOutOf": 25, "scoreExplanation": string }. All string values must be written in ${FEEDBACK_LANGUAGE_NAMES[language]}, except quoted French inside grammar.commonErrors. Explain WHY points were lost in scoreExplanation, and make every suggestion concrete and actionable.`;

  const userPrompt = completedTurns
    .map(
      (turn, i) =>
        `Turn ${i + 1} (part: ${turn.partId}): transcript="${turn.transcript}", turnScore=${turn.feedback.turnScore}/25, relevant=${turn.feedback.relevance}, taskCompletionNote="${turn.feedback.taskCompletionNote}", coherenceNote="${turn.feedback.coherenceNote}", grammarErrors=${JSON.stringify(turn.feedback.grammarErrors)}, vocabularyNote="${turn.feedback.vocabularyNote}", fluencyNote="${turn.feedback.fluencyNote}", pronunciationNote="${turn.feedback.pronunciationNote}", structureNote="${turn.feedback.structureNote}"`
    )
    .join("\n");

  const parsed = await callClaudeForJson(client, system, userPrompt);
  return reportSchema.parse(parsed);
}

/** Generates a fresh set of original DELF-style questions for the given
 * level, mapped onto the same part structure (ids, labels, timing) as the
 * static fallback bank in delf-speaking.ts — Claude only supplies original
 * content, never invents new part structure or reproduces real DELF prompts. */
export async function generateSpeakingSession(
  client: Anthropic,
  level: DelfLevel,
  language: FeedbackLanguage,
  topic?: string
): Promise<GeneratedSpeakingQuestion[]> {
  const levelConfig = DELF_SPEAKING_LEVELS[level];

  const partsSpec = levelConfig.parts
    .map(
      (part) =>
        `- partId "${part.id}" ("${part.partLabel}"): generate exactly ${part.questions.length} original question(s).`
    )
    .join("\n");

  const system = `You are creating original DELF ${level} "Production Orale" oral exam questions, following the real exam's structure and difficulty, but you must NEVER reproduce real official DELF exam questions verbatim — every question must be an original creation in a similar style. Cover these topics/scenario types across the questions: ${LEVEL_TOPIC_HINTS[level]}.${
    topic ? ` The discussion must be built specifically around this chosen topic: "${topic}".` : ""
  } Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape: { "parts": [{ "partId": string, "questions": [{ "prompt": string, "translation": string }] }] } — one entry per part listed below, in the same order, with exactly the requested number of questions per part. "prompt" is French; "translation" is the same question in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const userPrompt = `Parts to generate:\n${partsSpec}`;

  const parsed = await callClaudeForJson(client, system, userPrompt);
  const result = sessionQuestionsSchema.parse(parsed);

  return levelConfig.parts.flatMap((part) => {
    const generatedPart = result.parts.find((p) => p.partId === part.id);
    if (!generatedPart || generatedPart.questions.length !== part.questions.length) {
      throw new Error(`Generated session is missing questions for part "${part.id}"`);
    }
    return part.questions.map((question, i) => ({
      partId: part.id,
      partLabel: part.partLabel,
      prompt: generatedPart.questions[i].prompt,
      translation: generatedPart.questions[i].translation,
      suggestedDurationSeconds: question.suggestedDurationSeconds,
    }));
  });
}

/** B2 only — generates two original candidate discussion topics for the
 * learner to choose between before the exam begins. */
export async function generateB2Topics(
  client: Anthropic,
  language: FeedbackLanguage
): Promise<GeneratedTopicChoice[]> {
  const system = `Generate exactly two original DELF B2-style discussion topics, resembling themes such as society, education, environment, technology, culture, and philosophy. Never reproduce real official DELF exam prompts — every topic must be an original creation. Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape: { "topics": [{ "title": string, "translation": string }, { "title": string, "translation": string }] }. "title" is French; "translation" is the same topic in ${FEEDBACK_LANGUAGE_NAMES[language]}.`;

  const parsed = await callClaudeForJson(client, system, "Generate the two topics now.");
  return topicChoicesSchema.parse(parsed).topics;
}
