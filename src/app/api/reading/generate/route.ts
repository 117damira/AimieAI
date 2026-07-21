import { NextRequest, NextResponse } from "next/server";
import { DELF_READING_LEVELS } from "@/config/delf-reading";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { generateReadingSet } from "@/lib/ai/reading-generator";
import { generateMockReadingSet } from "@/lib/mock/reading-generator";
import type { DelfLevel, FeedbackLanguage, ReadingMode, ReadingSet } from "@/types/reading";

/**
 * Generates a Reading set for a level/mode/language. Calls real Claude
 * generation for "practice-by-text"/"full-exam" when ANTHROPIC_API_KEY is
 * configured; otherwise (or on failure) falls back to the deterministic
 * offline content bank with rotation. "daily-challenge" ALWAYS uses the
 * offline bank — it must be identical for every student at a level on a
 * given day, which only a pure function of (level, date) can guarantee
 * without a shared backend; independent per-user Claude calls could not.
 * Mirrors api/listening/generate/route.ts.
 */
const SIMULATED_GENERATION_DELAY_MS = 1200;

interface GenerateReadingRequest {
  level: DelfLevel;
  mode: ReadingMode;
  language: FeedbackLanguage;
  history?: string[];
}

export async function POST(req: NextRequest) {
  let body: GenerateReadingRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, mode, language, history } = body;

  if (!level || !(level in DELF_READING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!mode || !["full-exam", "practice-by-text", "daily-challenge"].includes(mode)) {
    return NextResponse.json({ error: "A valid mode is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  if (mode === "daily-challenge") {
    const set = generateMockReadingSet(level, mode, language, []);
    return NextResponse.json({ set });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const generated = await generateReadingSet(client, level, mode, language);
      const set: ReadingSet = {
        id: `${level}-${mode}-${Date.now()}`,
        level,
        mode,
        ...generated,
      };
      return NextResponse.json({ set });
    } catch (err) {
      console.error("Claude reading generation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_GENERATION_DELAY_MS));
  const set = generateMockReadingSet(level, mode, language, history ?? []);
  return NextResponse.json({ set });
}
