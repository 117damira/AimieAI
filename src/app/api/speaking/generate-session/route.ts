import { NextRequest, NextResponse } from "next/server";
import { DELF_SPEAKING_LEVELS, flattenSpeakingParts } from "@/config/delf-speaking";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { generateB2Topics, generateSpeakingSession } from "@/lib/ai/speaking-evaluator";
import type { GeneratedSpeakingQuestion, GeneratedTopicChoice } from "@/types/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * Generates a fresh set of original DELF-style questions (or, for B2, two
 * candidate discussion topics) for a live-examiner session. Calls real
 * Claude generation when ANTHROPIC_API_KEY is configured; otherwise (or on
 * any Claude/schema failure) falls back to the static question bank in
 * delf-speaking.ts, translated into the requested feedback language.
 */
const SIMULATED_GENERATION_DELAY_MS = 1200;

interface GenerateSessionRequest {
  type: "questions" | "topics";
  level: DelfLevel;
  language: FeedbackLanguage;
  topic?: string;
}

function staticFallbackQuestions(level: DelfLevel, language: FeedbackLanguage): GeneratedSpeakingQuestion[] {
  return flattenSpeakingParts(DELF_SPEAKING_LEVELS[level]).map((q) => ({
    partId: q.partId,
    partLabel: q.partLabel,
    prompt: q.prompt,
    translation: q.translation[language],
    suggestedDurationSeconds: q.suggestedDurationSeconds,
    modelAnswer: q.modelAnswer,
  }));
}

function staticFallbackTopics(language: FeedbackLanguage): GeneratedTopicChoice[] {
  const topics = DELF_SPEAKING_LEVELS.B2.topicChoices ?? [];
  return topics.map((t) => ({ title: t.title, translation: t.translation[language] }));
}

export async function POST(req: NextRequest) {
  let body: GenerateSessionRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, level, language, topic } = body;

  if (!level || !(level in DELF_SPEAKING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }
  if (type !== "questions" && type !== "topics") {
    return NextResponse.json({ error: "type must be \"questions\" or \"topics\"" }, { status: 400 });
  }

  const client = getAnthropicClient();

  if (type === "topics") {
    if (client) {
      try {
        const topics = await generateB2Topics(client, language);
        return NextResponse.json({ topics });
      } catch (err) {
        console.error("Claude B2 topic generation failed, falling back to static topics", err);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_GENERATION_DELAY_MS));
    return NextResponse.json({ topics: staticFallbackTopics(language) });
  }

  if (client) {
    try {
      const questions = await generateSpeakingSession(client, level, language, topic);
      return NextResponse.json({ questions });
    } catch (err) {
      console.error("Claude speaking session generation failed, falling back to static questions", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_GENERATION_DELAY_MS));
  return NextResponse.json({ questions: staticFallbackQuestions(level, language) });
}
