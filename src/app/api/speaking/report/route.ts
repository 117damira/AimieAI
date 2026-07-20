import { NextRequest, NextResponse } from "next/server";
import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import { synthesizeReportFromTurns } from "@/lib/mock/speaking-evaluation";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { synthesizeReportWithClaude } from "@/lib/ai/speaking-evaluator";
import type { CompletedTurn } from "@/types/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * Synthesizes the final DELF speaking examiner report from every completed
 * turn in the session. Calls real Claude analysis when ANTHROPIC_API_KEY is
 * configured; otherwise (or on a malformed Claude response) falls back to
 * the deterministic mock, which now aggregates the same real accumulated
 * turn data rather than re-rolling its own report independently.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 2500;

interface ReportRequest {
  level: DelfLevel;
  language: FeedbackLanguage;
  completedTurns: CompletedTurn[];
}

export async function POST(req: NextRequest) {
  let body: ReportRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, language, completedTurns } = body;

  if (!level || !(level in DELF_SPEAKING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }
  if (!Array.isArray(completedTurns) || completedTurns.length === 0) {
    return NextResponse.json({ error: "At least one answered turn is required" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const report = await synthesizeReportWithClaude(client, { level, language, completedTurns });
      return NextResponse.json({ report });
    } catch (err) {
      console.error("Claude speaking report generation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const report = synthesizeReportFromTurns(completedTurns, level, language);
    return NextResponse.json({ report });
  } catch (err) {
    console.error("Mock speaking report generation failed", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
