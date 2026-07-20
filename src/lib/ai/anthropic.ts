import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
let attempted = false;

/** Returns a lazily-constructed Anthropic client, or null if no API key is
 * configured — callers branch on this to fall back to the deterministic
 * mock evaluator, so the app keeps working with zero setup. */
export function getAnthropicClient(): Anthropic | null {
  if (!attempted) {
    attempted = true;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      client = new Anthropic({ apiKey });
    }
  }
  return client;
}

export const SPEAKING_EVAL_MODEL = "claude-sonnet-5";
