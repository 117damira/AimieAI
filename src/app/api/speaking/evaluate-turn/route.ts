import { NextRequest, NextResponse } from "next/server";
import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import { analyzeTurn, localizeTurnFeedback } from "@/lib/mock/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * DEMO MODE: mock per-turn speaking evaluation, mirroring
 * api/writing/evaluate/route.ts. Swapping in a real Claude call later is a
 * one-line change to analyzeTurn/localizeTurnFeedback with the same
 * signature.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 1500;

interface EvaluateTurnRequest {
  level: DelfLevel;
  partId: string;
  questionId: string;
  responseText: string;
  language: FeedbackLanguage;
}

export async function POST(req: NextRequest) {
  let body: EvaluateTurnRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, partId, questionId, responseText, language } = body;

  if (!level || !(level in DELF_SPEAKING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!partId || !questionId) {
    return NextResponse.json({ error: "partId and questionId are required" }, { status: 400 });
  }
  if (!responseText || !responseText.trim()) {
    return NextResponse.json({ error: "Response text is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  const wordCount = responseText.trim().split(/\s+/).filter(Boolean).length;

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const selection = analyzeTurn(level, partId, questionId, responseText, wordCount);
    const feedback = localizeTurnFeedback(selection, language);
    return NextResponse.json({ feedback, selection });
  } catch (err) {
    console.error("Mock speaking turn evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
