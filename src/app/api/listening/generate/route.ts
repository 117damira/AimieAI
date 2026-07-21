import { NextRequest, NextResponse } from "next/server";
import { DELF_LISTENING_LEVELS } from "@/config/delf-listening";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { generateListeningSet } from "@/lib/ai/listening-generator";
import { generateMockListeningSet } from "@/lib/mock/listening-generator";
import type { DelfLevel, FeedbackLanguage, ListeningMode, ListeningSet } from "@/types/listening";

/**
 * Generates a Listening set for a level/mode/language. Calls real Claude
 * generation for "practice-by-part"/"full-exam" when ANTHROPIC_API_KEY is
 * configured; otherwise (or on failure) falls back to the deterministic
 * offline content bank with rotation. "daily-challenge" ALWAYS uses the
 * offline bank — it must be identical for every student at a level on a
 * given day, which only a pure function of (level, date) can guarantee
 * without a shared backend; independent per-user Claude calls could not.
 */
const SIMULATED_GENERATION_DELAY_MS = 1200;

interface GenerateListeningRequest {
  level: DelfLevel;
  mode: ListeningMode;
  language: FeedbackLanguage;
  history?: string[];
}

export async function POST(req: NextRequest) {
  let body: GenerateListeningRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, mode, language, history } = body;

  if (!level || !(level in DELF_LISTENING_LEVELS)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!mode || !["full-exam", "practice-by-part", "daily-challenge"].includes(mode)) {
    return NextResponse.json({ error: "A valid mode is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  if (mode === "daily-challenge") {
    const set = generateMockListeningSet(level, mode, language, []);
    return NextResponse.json({ set });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const generated = await generateListeningSet(client, level, mode, language);
      const set: ListeningSet = {
        id: `${level}-${mode}-${Date.now()}`,
        level,
        mode,
        ...generated,
      };
      return NextResponse.json({ set });
    } catch (err) {
      console.error("Claude listening generation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_GENERATION_DELAY_MS));
  const set = generateMockListeningSet(level, mode, language, history ?? []);
  return NextResponse.json({ set });
}
