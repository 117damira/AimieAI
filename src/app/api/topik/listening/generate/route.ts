import { NextRequest, NextResponse } from "next/server";
import { TOPIK_LISTENING_LEVELS } from "@/config/topik-listening";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { generateTopikListeningSet } from "@/lib/ai/topik-listening-generator";
import { generateMockTopikListeningSet } from "@/lib/mock/topik-listening-generator";
import type { FeedbackLanguage, TopikLevel, TopikListeningMode, TopikListeningSet } from "@/types/topik-listening";

/**
 * Generates a TOPIK Listening set for a level/mode/language. Calls real
 * Claude generation for "practice-by-part"/"full-exam" when
 * ANTHROPIC_API_KEY is configured; otherwise (or on failure, including a
 * zod validation failure) falls back to the deterministic offline content
 * bank with rotation. "daily-challenge" ALWAYS uses the offline bank — it
 * must be identical for every student at a level on a given day, which
 * only a pure function of (level, date) can guarantee without a shared
 * backend; independent per-user Claude calls could not. Mirrors
 * app/api/listening/generate/route.ts's pattern exactly.
 */
const SIMULATED_GENERATION_DELAY_MS = 1200;

interface GenerateTopikListeningRequest {
  level: TopikLevel;
  mode: TopikListeningMode;
  language: FeedbackLanguage;
  history?: string[];
}

export async function POST(req: NextRequest) {
  let body: GenerateTopikListeningRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, mode, language, history } = body;

  if (!level || !(level in TOPIK_LISTENING_LEVELS)) {
    return NextResponse.json({ error: "A valid TOPIK level (1-6) is required" }, { status: 400 });
  }
  if (!mode || !["full-exam", "practice-by-part", "daily-challenge"].includes(mode)) {
    return NextResponse.json({ error: "A valid mode is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  if (mode === "daily-challenge") {
    const set = generateMockTopikListeningSet(level, mode, language, []);
    return NextResponse.json({ set });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const generated = await generateTopikListeningSet(client, level, mode, language);
      const set: TopikListeningSet = {
        id: `${level}-${mode}-${Date.now()}`,
        level,
        mode,
        ...generated,
      };
      return NextResponse.json({ set });
    } catch (err) {
      console.error("Claude TOPIK listening generation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_GENERATION_DELAY_MS));
  const set = generateMockTopikListeningSet(level, mode, language, history ?? []);
  return NextResponse.json({ set });
}
