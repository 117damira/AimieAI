import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { evaluateTopikVocabularySentence } from "@/lib/ai/topik-vocabulary-evaluator";
import { analyzeTopikVocabularySentence } from "@/lib/mock/topik-vocabulary-evaluation";
import type { TopikLevel } from "@/types/topik";
import type { FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * TOPIK equivalent of /api/vocabulary/evaluate — evaluates a student's own
 * example sentence using a target Korean vocabulary word. Calls real Claude
 * analysis when ANTHROPIC_API_KEY is configured; otherwise (or if Claude's
 * response fails schema validation) falls back to the deterministic mock
 * evaluator so the button always works. Entirely separate route from the
 * DELF one — never touches DELF word banks or progress.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 1200;

const VALID_LEVELS: TopikLevel[] = ["1", "2", "3", "4", "5", "6"];

interface EvaluateTopikVocabularyRequest {
  word: string;
  definition: string;
  sentence: string;
  level: TopikLevel;
  language: FeedbackLanguage;
}

export async function POST(req: NextRequest) {
  let body: EvaluateTopikVocabularyRequest;
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
  if (!level || !VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: "A valid TOPIK level (1-6) is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const feedback = await evaluateTopikVocabularySentence(client, {
        word,
        definition: definition ?? "",
        sentence,
        level,
        language,
      });
      return NextResponse.json({ feedback });
    } catch (err) {
      console.error("Claude TOPIK vocabulary evaluation failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const feedback = analyzeTopikVocabularySentence(word, sentence, level, language);
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Mock TOPIK vocabulary evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
