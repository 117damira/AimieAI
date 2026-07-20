import type { User } from "@/types/user";

/**
 * Durable account directory — separate from the single "live session" stored
 * by UserProfileContext (aimieai.user.v2). This is what makes registration
 * permanent and login real: every account's credentials + full profile
 * snapshot live here, keyed by a stable user id, with a secondary email
 * index for lookup/duplicate-checking. There is no backend — this is a
 * client-only, localStorage-backed store with salted+hashed (PBKDF2 via the
 * browser's Web Crypto API) passwords. That's real hashing, but the trust
 * boundary is still "this browser's local storage," not a server.
 */

interface StoredAccount {
  id: string;
  passwordHash: string;
  salt: string;
  resetToken?: string;
  /** ISO timestamp; the token is rejected once past this. */
  resetTokenExpiresAt?: string;
  user: User;
}

type AccountDirectory = Record<string, StoredAccount>;
/** Lowercased, trimmed email -> user id. Rebuilt per-account on every write
 * so an email edit can never leave a stale/duplicate index entry behind. */
type EmailIndex = Record<string, string>;

const ACCOUNTS_KEY = "aimieai.accounts.v1";
const EMAIL_INDEX_KEY = "aimieai.email-index.v1";
const PBKDF2_ITERATIONS = 250_000;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readAccounts(): AccountDirectory {
  return readJson<AccountDirectory>(ACCOUNTS_KEY, {});
}

function writeAccounts(accounts: AccountDirectory): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readEmailIndex(): EmailIndex {
  return readJson<EmailIndex>(EMAIL_INDEX_KEY, {});
}

function writeEmailIndex(index: EmailIndex): void {
  localStorage.setItem(EMAIL_INDEX_KEY, JSON.stringify(index));
}

/** Removes any stale entries pointing at this account, then re-adds its
 * current email — safe against renames without tracking the old email. */
function reindexEmail(accounts: AccountDirectory, userId: string): void {
  const index = readEmailIndex();
  for (const key of Object.keys(index)) {
    if (index[key] === userId) delete index[key];
  }
  const account = accounts[userId];
  if (account) {
    index[normalizeEmail(account.user.email)] = userId;
  }
  writeEmailIndex(index);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function generateToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(salt) as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(derivedBits));
}

function findAccountByEmail(email: string): StoredAccount | null {
  const userId = readEmailIndex()[normalizeEmail(email)];
  if (!userId) return null;
  return readAccounts()[userId] ?? null;
}

export function emailExists(email: string, excludeUserId?: string): boolean {
  const userId = readEmailIndex()[normalizeEmail(email)];
  if (!userId) return false;
  if (excludeUserId && userId === excludeUserId) return false;
  return true;
}

export async function createAccount(params: {
  user: User;
  password: string;
}): Promise<void> {
  const { user, password } = params;
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const accounts = readAccounts();
  accounts[user.id] = { id: user.id, passwordHash, salt, user };
  writeAccounts(accounts);
  reindexEmail(accounts, user.id);
}

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: "not-found" | "wrong-password" };

export async function verifyLogin(
  email: string,
  password: string
): Promise<LoginResult> {
  const account = findAccountByEmail(email);
  if (!account) return { ok: false, reason: "not-found" };
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) return { ok: false, reason: "wrong-password" };
  return { ok: true, user: account.user };
}

/** Write-through sync — called whenever the live session profile changes so
 * the durable copy (name/email/avatar/stats/etc.) never falls out of date. */
export function updateAccountUser(user: User): void {
  const accounts = readAccounts();
  const existing = accounts[user.id];
  if (!existing) return;
  accounts[user.id] = { ...existing, user };
  writeAccounts(accounts);
  reindexEmail(accounts, user.id);
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "wrong-current-password" };

export async function updateAccountPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  const accounts = readAccounts();
  const account = accounts[userId];
  if (!account) return { ok: false, reason: "wrong-current-password" };
  const currentHash = await hashPassword(currentPassword, account.salt);
  if (currentHash !== account.passwordHash) {
    return { ok: false, reason: "wrong-current-password" };
  }
  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  accounts[userId] = { ...account, passwordHash, salt };
  writeAccounts(accounts);
  return { ok: true };
}

export function deleteAccount(userId: string): void {
  const accounts = readAccounts();
  delete accounts[userId];
  writeAccounts(accounts);
  const index = readEmailIndex();
  for (const key of Object.keys(index)) {
    if (index[key] === userId) delete index[key];
  }
  writeEmailIndex(index);
}

export type CreateResetTokenResult =
  | { ok: true; token: string }
  | { ok: false; reason: "not-found" };

/** No email service exists, so the token is handed back directly to the
 * caller to surface in the UI (a simulated "link") instead of being emailed. */
export function createResetToken(email: string): CreateResetTokenResult {
  const account = findAccountByEmail(email);
  if (!account) return { ok: false, reason: "not-found" };
  const token = generateToken();
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
  const accounts = readAccounts();
  accounts[account.id] = { ...account, resetToken: token, resetTokenExpiresAt };
  writeAccounts(accounts);
  return { ok: true, token };
}

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; reason: "invalid-token" | "expired-token" };

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  const accounts = readAccounts();
  const account = Object.values(accounts).find((a) => a.resetToken === token);
  if (!account) return { ok: false, reason: "invalid-token" };
  if (
    !account.resetTokenExpiresAt ||
    new Date(account.resetTokenExpiresAt).getTime() < Date.now()
  ) {
    return { ok: false, reason: "expired-token" };
  }
  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  accounts[account.id] = {
    ...account,
    passwordHash,
    salt,
    resetToken: undefined,
    resetTokenExpiresAt: undefined,
  };
  writeAccounts(accounts);
  return { ok: true };
}
