/**
 * Server-side, in-memory store for email verification codes (registration
 * and forgot-password both use it). This app has no database, so — like
 * everything else here — this is an honest, bounded trade-off: codes live
 * only in this server process's memory and are lost on restart. That's
 * acceptable for a short-lived (10 minute) verification code; it would not
 * be acceptable for anything meant to persist.
 */

interface VerificationRecord {
  code: string;
  expiresAt: number;
}

const CODE_TTL_MS = 10 * 60 * 1000;
const codes = new Map<string, VerificationRecord>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function storeCode(email: string, code: string): void {
  codes.set(normalizeEmail(email), { code, expiresAt: Date.now() + CODE_TTL_MS });
}

export function verifyCode(email: string, code: string): boolean {
  const record = codes.get(normalizeEmail(email));
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    codes.delete(normalizeEmail(email));
    return false;
  }
  const isValid = record.code === code.trim();
  if (isValid) codes.delete(normalizeEmail(email));
  return isValid;
}
