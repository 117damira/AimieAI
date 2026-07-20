import { NextRequest, NextResponse } from "next/server";
import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import { analyzeTurn, localizeTurnFeedback } from "@/lib/mock/speaking-evaluation";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { evaluateTurnWithClaude } from "@/lib/ai/speaking-evaluator";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * Evaluates a single spoken (speech-to-text transcribed) DELF turn. Calls
 * real Claude analysis when ANTHROPIC_API_KEY is configured; otherwise (or
 * if Claude's response fails schema validation) falls back to the
 * deterministic mock evaluator so the app keeps working with zero setup.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 1500;

interface EvaluateTurnRequest {
  level: DelfLevel;
  partId: string;
  partLabel: string;
  questionId: string;
  prompt: string;
  transcript: string;
  recognitionConfidence: number | null;
  language: FeedbackLanguage;
}

export async function POST(req: NextRequest) {
  let body: EvaluateTurnRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, partId, partLabel, questionId, prompt, transcript, recognitionConfidence, language } = body;

  if (!level || !(level in DELF_SPEAKING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!partId || !questionId) {
    return NextResponse.json({ error: "partId and questionId are required" }, { status: 400 });
  }
  if (!transcript || !transcript.trim()) {
    return NextResponse.json({ error: "A spoken transcript is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  const client = getAnthropicClient();
  if (client) {
    try {
      const { feedback, followUpQuestion } = await evaluateTurnWithClaude(client, {
        level,
        partId,
        partLabel: partLabel ?? partId,
        prompt: prompt ?? "",
        transcript,
        wordCount,
        recognitionConfidence: recognitionConfidence ?? null,
        language,
      });
      return NextResponse.json({ feedback, followUpQuestion });
    } catch (err) {
      console.error("Claude speaking turn evaluation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const selection = analyzeTurn(level, partId, questionId, prompt ?? "", transcript, wordCount);
    const feedback = localizeTurnFeedback(selection, language);
    // The offline mock never generates reactive follow-ups — that's a
    // bounded, Claude-only enhancement.
    return NextResponse.json({ feedback, followUpQuestion: null });
  } catch (err) {
    console.error("Mock speaking turn evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
