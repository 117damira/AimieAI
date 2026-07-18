import { NextRequest, NextResponse } from "next/server";
import { DELF_WRITING_LEVELS } from "@/config/delf-writing";
import { analyzeResponse, localizeEvaluation } from "@/lib/mock/writing-evaluation";
import type { WritingEvaluation, WritingEvaluationRequest } from "@/types/writing-evaluation";

/**
 * DEMO MODE: this route returns realistic mock evaluations instead of
 * calling the Anthropic API, since no ANTHROPIC_API_KEY is configured for
 * this build. The response shape (WritingEvaluation) is exactly what a
 * live Claude call is expected to return, so swapping the evaluator is a
 * one-line change: replace analyzeResponse(...) + localizeEvaluation(...)
 * below with a real evaluator that has the same
 * (level, responseText, wordCount, language) => WritingEvaluation
 * signature — everything else (validation, word count, response shape,
 * the frontend) stays untouched.
 *
 * The `selection` field is demo-only: it's the language-neutral analysis
 * (which errors/strengths were picked, the score) the frontend keeps so it
 * can re-localize the evaluation into another language instantly, without
 * another request. A real evaluator wouldn't need this — the frontend
 * would just re-request in the new language.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 2000;

export async function POST(req: NextRequest) {
  let body: WritingEvaluationRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, response, language } = body;

  if (!level || !(level in DELF_WRITING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!response || !response.trim()) {
    return NextResponse.json({ error: "Response text is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  // Simulate AI analysis latency so the loading state feels real.
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const selection = analyzeResponse(level, response, wordCount);
    const feedback = localizeEvaluation(selection, language);
    const evaluation: WritingEvaluation = {
      level,
      wordCount,
      ...feedback,
    };
    return NextResponse.json({ evaluation, selection });
  } catch (err) {
    console.error("Mock writing evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
