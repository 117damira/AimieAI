import type Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Claude-JSON-calling pattern — previously duplicated near-
 * identically in speaking-evaluator.ts and vocabulary-evaluator.ts. Every
 * domain's real Claude path uses this to send its own rubric-specific
 * system prompt and get back parsed JSON; the domain-specific zod schema
 * validation still happens in each caller.
 */

export function extractJson(text: string): unknown {
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : text.trim());
}

export async function callClaudeForJson(
  client: Anthropic,
  model: string,
  system: string,
  userPrompt: string,
  maxTokens = 1200
): Promise<unknown> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!block) throw new Error("Claude response had no text content");
  return extractJson(block.text);
}
