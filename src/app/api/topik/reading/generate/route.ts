import { NextRequest, NextResponse } from "next/server";
import { TOPIK_READING_LEVELS } from "@/config/topik-reading";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { generateTopikReadingSet } from "@/lib/ai/topik-reading-generator";
import { generateMockTopikReadingSet } from "@/lib/mock/topik-reading-generator";
import type { TopikLevel, FeedbackLanguage, TopikReadingMode, TopikReadingSet } from "@/types/topik-reading";

/**
 * Generates a TOPIK Reading set for a level/mode/language. Calls real
 * Claude generation for "practice-by-text"/"full-exam" when
 * ANTHROPIC_API_KEY is configured; otherwise (or on failure) falls back to
 * the deterministic offline content bank with rotation. "daily-challenge"
 * ALWAYS uses the offline bank — it must be identical for every student at
 * a level on a given day, which only a pure function of (level, date) can
 * guarantee without a shared backend; independent per-user Claude calls
 * could not. Mirrors api/reading/generate/route.ts.
 */
const SIMULATED_GENERATION_DELAY_MS = 1200;

interface GenerateTopikReadingRequest {
  level: TopikLevel;
  mode: TopikReadingMode;
  language: FeedbackLanguage;
  history?: string[];
}

export async function POST(req: NextRequest) {
  let body: GenerateTopikReadingRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, mode, language, history } = body;

  if (!level || !(level in TOPIK_READING_LEVELS)) {
    return NextResponse.json({ error: "A valid TOPIK level (1-6) is required" }, { status: 400 });
  }
  if (!mode || !["full-exam", "practice-by-text", "daily-challenge"].includes(mode)) {
    return NextResponse.json({ error: "A valid mode is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  if (mode === "daily-challenge") {
    const set = generateMockTopikReadingSet(level, mode, language, []);
    return NextResponse.json({ set });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const generated = await generateTopikReadingSet(client, level, mode, language);
      const set: TopikReadingSet = {
        id: `topik-${level}-${mode}-${Date.now()}`,
        level,
        mode,
        ...generated,
      };
      return NextResponse.json({ set });
    } catch (err) {
      console.error("Claude TOPIK reading generation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_GENERATION_DELAY_MS));
  const set = generateMockTopikReadingSet(level, mode, language, history ?? []);
  return NextResponse.json({ set });
}
