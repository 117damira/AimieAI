import { NextRequest, NextResponse } from "next/server";
import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import { analyzeSession, localizeReport, type TurnSelection } from "@/lib/mock/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * DEMO MODE: mock full-session examiner report, mirroring
 * api/writing/evaluate/route.ts. Swapping in a real Claude call later is a
 * one-line change to analyzeSession/localizeReport with the same signature.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 2500;

interface ReportRequest {
  level: DelfLevel;
  language: FeedbackLanguage;
  turnSelections: TurnSelection[];
}

export async function POST(req: NextRequest) {
  let body: ReportRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, language, turnSelections } = body;

  if (!level || !(level in DELF_SPEAKING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }
  if (!Array.isArray(turnSelections) || turnSelections.length === 0) {
    return NextResponse.json({ error: "At least one answered turn is required" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const selection = analyzeSession(turnSelections, level);
    const report = localizeReport(selection, language);
    return NextResponse.json({ report, selection });
  } catch (err) {
    console.error("Mock speaking report generation failed", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
