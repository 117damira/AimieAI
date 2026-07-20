import { Resend } from "resend";

let client: Resend | null = null;
let attempted = false;

/** Returns a lazily-constructed Resend client, or null if no API key is
 * configured — callers branch on this to fall back to a dev-mode banner
 * (the verification code returned directly in the API response) instead of
 * actually emailing it. Mirrors lib/ai/anthropic.ts's getAnthropicClient(). */
export function getEmailClient(): Resend | null {
  if (!attempted) {
    attempted = true;
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      client = new Resend(apiKey);
    }
  }
  return client;
}

/** The "from" address used for verification emails — Resend's shared test
 * domain works with no domain verification needed while developing. */
export const VERIFICATION_EMAIL_FROM = process.env.VERIFICATION_EMAIL_FROM || "AimieAI <onboarding@resend.dev>";
