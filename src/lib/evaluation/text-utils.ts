/**
 * Shared French-text analysis primitives used by every domain evaluator
 * (Speaking, Writing, Vocabulary) — previously duplicated (in slightly
 * different forms) in each domain's own mock file. Nothing here makes a
 * judgment call about correctness; these are just real, deterministic
 * measurements over the actual text handed to them.
 */

export const ACCENT_MAP: Record<string, string> = {
  à: "a", â: "a", ä: "a", é: "e", è: "e", ê: "e", ë: "e", î: "i", ï: "i",
  ô: "o", ö: "o", ù: "u", û: "u", ü: "u", ç: "c", œ: "oe", æ: "ae",
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => ACCENT_MAP[ch] ?? ch)
    .join("");
}

/** Words that carry no topical meaning — excluded when comparing real
 * content between two texts (e.g. a question and an answer), or when
 * measuring genuine vocabulary range. */
export const FRENCH_STOPWORDS = new Set([
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "le", "la", "les", "un", "une", "des", "de", "du",
  "et", "ou", "mais", "donc", "car", "que", "qui", "quoi", "dont", "dans", "sur", "avec", "pour", "par", "sans", "sous",
  "votre", "vos", "notre", "nos", "leur", "leurs", "cette", "cet", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "est", "es", "suis", "sont", "êtes", "sommes", "être", "avoir", "ai", "as", "avons", "avez", "ont",
  "me", "te", "se", "lui", "y", "en", "au", "aux", "ne", "pas", "plus", "très", "bien", "aussi", "comme", "autre", "autres",
  "pouvez", "voulez", "faire", "fait", "faites", "proposez", "expliquez", "présentez", "parlez", "dites", "pensez",
]);

export function extractContentWords(text: string): string[] {
  return text
    .replace(/[.,!?;:"'«»()]/g, " ")
    .split(/\s+/)
    .map(normalize)
    .filter((w) => w.length >= 4 && !FRENCH_STOPWORDS.has(w));
}

/** Unique content words ÷ total content words (type-token ratio) — a real,
 * bounded vocabulary-range signal. Returns 1 (no penalty) when there isn't
 * enough text for the ratio to mean anything. */
export function lexicalDiversity(text: string): number {
  const words = extractContentWords(text);
  if (words.length < 4) return 1;
  return new Set(words).size / words.length;
}

export const FILLER_WORDS = ["euh", "du coup", "genre", "en fait", "quoi", "voilà", "bah"];

export function countFillerWords(text: string): number {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((total, word) => {
    const matches = lower.match(new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "g"));
    return total + (matches?.length ?? 0);
  }, 0);
}

export function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

/** Word counts per sentence — used to measure real sentence-length
 * variation instead of guessing at "sentence variety". */
export function sentenceLengths(text: string): number[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(/\s+/).filter(Boolean).length);
}

/** The full sentence containing a match at `index` — split on sentence
 * punctuation, never mid-word, so a mistake can be shown highlighted in its
 * real context instead of as an isolated phrase. */
export function findContainingSentence(text: string, index: number, matchLength: number): string {
  const before = text.slice(0, index);
  const start = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?")) + 1;
  const afterStart = index + matchLength;
  const relativeEnd = text.slice(afterStart).search(/[.!?]/);
  const end = relativeEnd === -1 ? text.length : afterStart + relativeEnd + 1;
  return text.slice(start, end).trim();
}
