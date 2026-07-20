import { NextRequest, NextResponse } from "next/server";
import { DELF_WRITING_LEVELS } from "@/config/delf-writing";
import { analyzeResponse, localizeEvaluation } from "@/lib/mock/writing-evaluation";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { evaluateWritingWithClaude } from "@/lib/ai/writing-evaluator";
import type { WritingEvaluation, WritingEvaluationRequest } from "@/types/writing-evaluation";

/**
 * Evaluates a DELF written response. Calls real Claude analysis when
 * ANTHROPIC_API_KEY is configured; otherwise (or if Claude's response fails
 * schema validation) falls back to the deterministic mock evaluator so the
 * app keeps working with zero setup — matching the established pattern
 * already used by Speaking and Vocabulary.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 2000;

export async function POST(req: NextRequest) {
  let body: WritingEvaluationRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, prompt, response, language } = body;

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
  const config = DELF_WRITING_LEVELS[level];

  const client = getAnthropicClient();
  if (client) {
    try {
      const feedback = await evaluateWritingWithClaude(client, {
        level,
        prompt: prompt ?? "",
        response,
        wordCount,
        minWords: config.minWords,
        maxWords: config.maxWords,
        conclusionRequired: level === "B1" || level === "B2",
        language,
      });
      const evaluation: WritingEvaluation = { level, wordCount, ...feedback };
      return NextResponse.json({ evaluation });
    } catch (err) {
      console.error("Claude writing evaluation failed, falling back to mock", err);
    }
  }

  // Simulate AI analysis latency so the loading state feels real.
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const selection = analyzeResponse(level, prompt ?? "", response, wordCount);
    const feedback = localizeEvaluation(selection, language);
    const evaluation: WritingEvaluation = { level, wordCount, ...feedback };
    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error("Mock writing evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
