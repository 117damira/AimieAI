import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { evaluateVocabularySentence } from "@/lib/ai/vocabulary-evaluator";
import { analyzeVocabularySentence } from "@/lib/mock/vocabulary-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * Evaluates a student's own example sentence using a target vocabulary
 * word. Calls real Claude analysis when ANTHROPIC_API_KEY is configured;
 * otherwise (or if Claude's response fails schema validation) falls back to
 * the deterministic mock evaluator so the button always works.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 1200;

interface EvaluateVocabularyRequest {
  word: string;
  definition: string;
  sentence: string;
  level: DelfLevel;
  language: FeedbackLanguage;
}

export async function POST(req: NextRequest) {
  let body: EvaluateVocabularyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { word, definition, sentence, level, language } = body;

  if (!word || !word.trim()) {
    return NextResponse.json({ error: "A target word is required" }, { status: 400 });
  }
  if (!sentence || !sentence.trim()) {
    return NextResponse.json({ error: "A sentence is required" }, { status: 400 });
  }
  if (!level || !["A1", "A2", "B1", "B2"].includes(level)) {
    return NextResponse.json({ error: "A valid DELF level (A1, A2, B1, B2) is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const feedback = await evaluateVocabularySentence(client, {
        word,
        definition: definition ?? "",
        sentence,
        level,
        language,
      });
      return NextResponse.json({ feedback });
    } catch (err) {
      console.error("Claude vocabulary evaluation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const feedback = analyzeVocabularySentence(word, sentence, level, language);
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Mock vocabulary evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
