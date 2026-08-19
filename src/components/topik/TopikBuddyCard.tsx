"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, Modal } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { buildTopikBuddyContext } from "@/lib/topik/buddy-context";
import type { TopikBuddyMessage } from "@/types/topik-buddy";
import { cn } from "@/lib/utils/cn";

/**
 * Aimie Buddy — the TOPIK study mentor chat. A launcher card on the
 * Dashboard opens a Modal (same shared ui/Modal used elsewhere) containing
 * the actual conversation. Context is rebuilt fresh from the live profile
 * on every send (lib/topik/buddy-context.ts) — always the account's real,
 * current progress, never a stale snapshot. Conversation lives only in
 * this component's state (resets on close/reload), matching how every
 * other AI-feedback interaction in this app already works — nothing about
 * the chat itself is persisted to the profile.
 */
export function TopikBuddyCard() {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const b = t.topik.buddy;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TopikBuddyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  if (!profile) return null;

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending || !profile) return;
    const nextMessages: TopikBuddyMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);
    try {
      const res = await fetch("/api/topik/buddy/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: buildTopikBuddyContext(profile),
          messages: nextMessages,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || b.errorGeneric);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
    } catch {
      setError(b.errorGeneric);
    } finally {
      setIsSending(false);
    }
  }

  const suggestedPrompts = [b.suggestedPrompt1, b.suggestedPrompt2, b.suggestedPrompt3];

  return (
    <>
      <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white transition-transform duration-300 transition-smooth group-hover:scale-110">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div className="flex flex-col">
              <CardTitle>{b.cardTitle}</CardTitle>
              <span className="text-xs font-medium text-primary-600">{b.cardSubtitle}</span>
            </div>
          </div>
          <CardDescription>{b.cardDescription}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" onClick={() => setOpen(true)}>
            {b.launchCta}
          </Button>
        </CardFooter>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={b.modalTitle} className="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div ref={scrollRef} className="flex max-h-[50vh] min-h-[16rem] flex-col gap-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-background px-4 py-3 text-sm leading-6 text-foreground">
                  {b.greeting(profile.firstName)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line",
                    message.role === "user"
                      ? "self-end rounded-br-sm bg-primary-600 text-white"
                      : "self-start rounded-bl-sm bg-background text-foreground"
                  )}
                >
                  {message.content}
                </div>
              ))
            )}
            {isSending && (
              <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-background px-4 py-3 text-sm text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {b.thinking}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(draft);
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={b.inputPlaceholder}
              disabled={isSending}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted/70 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Button type="submit" disabled={!draft.trim() || isSending} className="shrink-0">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">{b.send}</span>
            </Button>
          </form>

          <p className="text-center text-[11px] leading-4 text-muted">{b.disclaimer}</p>
        </div>
      </Modal>
    </>
  );
}
