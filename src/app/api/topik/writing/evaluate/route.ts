import { NextRequest, NextResponse } from "next/server";
import { TOPIK_WRITING_LEVELS } from "@/config/topik-writing";
import { analyzeResponse, localizeEvaluation } from "@/lib/mock/topik-writing-evaluation";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { evaluateTopikWritingWithClaude } from "@/lib/ai/topik-writing-evaluator";
import type { TopikWritingEvaluation, TopikWritingEvaluationRequest } from "@/types/topik-writing";

/**
 * Evaluates a TOPIK II written response. Calls real Claude analysis when
 * ANTHROPIC_API_KEY is configured; otherwise (or if Claude's response fails
 * schema validation) falls back to the deterministic mock evaluator so the
 * app keeps working with zero setup — matching the established pattern
 * already used by DELF Writing (api/writing/evaluate/route.ts). Entirely
 * separate endpoint/state from DELF's — never shares content or scoring.
 */
const SIMULATED_ANALYSIS_DELAY_MS = 2000;

const TASK_TYPES = ["short-answer", "data-description", "essay"] as const;

export async function POST(req: NextRequest) {
  let body: TopikWritingEvaluationRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { level, taskType, prompt, dataText, response, language } = body;

  if (!level || !(level in TOPIK_WRITING_LEVELS)) {
    return NextResponse.json({ error: "A valid TOPIK II Writing level (3, 4, 5, 6) is required" }, { status: 400 });
  }
  if (!taskType || !TASK_TYPES.includes(taskType)) {
    return NextResponse.json(
      { error: "A valid TOPIK Writing task type (short-answer, data-description, essay) is required" },
      { status: 400 }
    );
  }
  if (!response || !response.trim()) {
    return NextResponse.json({ error: "Response text is required" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  // minChars/maxChars come from server-side config (never trusted from the
  // client) — every prompt of a given level+taskType shares the same
  // target range in config/topik-writing.ts, so looking up the first match
  // is equivalent to looking up the exact prompt the client is using.
  const levelConfig = TOPIK_WRITING_LEVELS[level];
  const activePrompt = levelConfig.samplePrompts.find((p) => p.taskType === taskType) ?? levelConfig.samplePrompts[0];
  const minChars = activePrompt.minChars;
  const maxChars = activePrompt.maxChars;
  const charCount = response.trim().length;

  const client = getAnthropicClient();
  if (client) {
    try {
      const feedback = await evaluateTopikWritingWithClaude(client, {
        level,
        taskType,
        prompt: prompt ?? "",
        dataText: dataText ?? null,
        response,
        charCount,
        minChars,
        maxChars,
        language,
      });
      const evaluation: TopikWritingEvaluation = { level, taskType, charCount, ...feedback };
      return NextResponse.json({ evaluation });
    } catch (err) {
      console.error("Claude TOPIK writing evaluation failed, falling back to mock", err);
    }
  }

  // Simulate AI analysis latency so the loading state feels real.
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_ANALYSIS_DELAY_MS));

  try {
    const selection = analyzeResponse({
      taskType,
      prompt: prompt ?? "",
      dataText: dataText ?? null,
      response,
      minChars,
      maxChars,
    });
    const feedback = localizeEvaluation(selection, language);
    const evaluation: TopikWritingEvaluation = { level, taskType, charCount, ...feedback };
    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error("Mock TOPIK writing evaluation failed", err);
    return NextResponse.json({ error: "Evaluation request failed" }, { status: 500 });
  }
}
