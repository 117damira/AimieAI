import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { generateTopikBuddyReply } from "@/lib/ai/topik-buddy-chat";
import { generateMockTopikBuddyReply } from "@/lib/mock/topik-buddy-chat";
import type { TopikBuddyContext, TopikBuddyMessage } from "@/types/topik-buddy";
import type { FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * Aimie Buddy chat — a TOPIK-prep study mentor. Calls real Claude when
 * ANTHROPIC_API_KEY is configured; otherwise (or on failure) falls back to
 * the deterministic mock responder so the feature always works. The client
 * sends its own curated TopikBuddyContext (see lib/topik/buddy-context.ts)
 * with every request rather than this route reading a server-side user
 * store — this app has no backend database, so, like every other TOPIK AI
 * route, the caller supplies exactly the context needed and nothing more.
 */
const SIMULATED_REPLY_DELAY_MS = 600;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

interface BuddyChatRequest {
  context: TopikBuddyContext;
  messages: TopikBuddyMessage[];
  language: FeedbackLanguage;
}

export async function POST(req: NextRequest) {
  let body: BuddyChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { context, messages, language } = body;

  if (!context || typeof context !== "object") {
    return NextResponse.json({ error: "A student context is required" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Too many messages in this conversation" }, { status: 400 });
  }
  if (messages.some((m) => !m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim() || m.content.length > MAX_MESSAGE_LENGTH)) {
    return NextResponse.json({ error: "Invalid message in conversation" }, { status: 400 });
  }
  if (messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "The last message must be from the student" }, { status: 400 });
  }
  if (!language || !["en", "ru", "kz"].includes(language)) {
    return NextResponse.json({ error: "A valid feedback language (en, ru, kz) is required" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (client) {
    try {
      const reply = await generateTopikBuddyReply(client, context, messages, language);
      return NextResponse.json({ reply });
    } catch (err) {
      console.error("Claude Aimie Buddy reply failed, falling back to mock", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_REPLY_DELAY_MS));
  const reply = generateMockTopikBuddyReply(context, messages, language);
  return NextResponse.json({ reply });
}
