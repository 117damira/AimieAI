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

/** Irregular conjugations (être/avoir/aller/faire/vouloir/pouvoir/devoir)
 * plus a few extremely common verbs (s'appeler) that A1/A2 essays lean on
 * heavily — stored accent-stripped since callers compare against
 * normalize()'d tokens. Not an exhaustive French verb list; used only as a
 * conservative "this sentence clearly has a verb" signal. */
const IRREGULAR_VERB_FORMS = new Set([
  "suis", "es", "est", "sommes", "etes", "sont", "etais", "etait", "etions", "etiez", "etaient",
  "ai", "as", "a", "avons", "avez", "ont", "avais", "avait", "avions", "aviez", "avaient",
  "vais", "vas", "va", "allons", "allez", "vont",
  "fais", "fait", "faisons", "faites", "font",
  "veux", "veut", "voulons", "voulez", "veulent",
  "peux", "peut", "pouvons", "pouvez", "peuvent",
  "dois", "doit", "devons", "devez", "doivent",
  "appelle", "appelles", "appelons", "appelez", "appellent",
]);

/** Stems of common regular -er verbs, combined with regular endings below
 * to recognize conjugated forms (present, imparfait, and participle) as a
 * verb signal without needing a full conjugation table. */
const REGULAR_VERB_STEMS = [
  "aim", "habit", "parl", "mang", "travaill", "jou", "regard", "ecout", "etudi", "chant",
  "dans", "visit", "arriv", "rest", "donn", "ador", "detest", "rentr", "pass", "aid",
  "cherch", "trouv", "achet", "prepar", "invit", "march", "cuisin", "nag", "skii",
];
const REGULAR_VERB_ENDINGS = ["e", "es", "ons", "ez", "ent", "e", "es", "ee", "ees", "ais", "ait", "aient", "iez", "ions"];

function buildRegularVerbFormSet(): Set<string> {
  const set = new Set<string>();
  for (const stem of REGULAR_VERB_STEMS) {
    for (const ending of REGULAR_VERB_ENDINGS) set.add(stem + ending);
  }
  return set;
}
const REGULAR_VERB_FORMS = buildRegularVerbFormSet();

export interface SentenceFragment {
  sentence: string;
}

/** Conventional letter/message sign-offs — genuinely not full sentences by
 * French writing convention (like "Sincerely, John" in English), so they
 * must never be flagged as a grammar mistake for lacking a verb. */
const CLOSING_SALUTATION_PATTERN =
  /^(cordialement|bien\s+[aà]\s+vous|[aà]\s+bient[oô]t|salutations|amicalement|bisous)\b/i;

/** Flags sentences that contain no recognizable French verb form at all —
 * e.g. "Je and ma famille." has a subject and an object but no verb. This
 * is a conservative, whitelist-based heuristic (real coverage, not a full
 * parser): it only fires when NONE of a sentence's tokens match a known
 * verb form, so it can miss real fragments using verbs outside the
 * whitelist, but it never invents a fragment where a recognized verb is
 * genuinely present. */
export function findSentenceFragments(text: string): SentenceFragment[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const fragments: SentenceFragment[] = [];
  for (const sentence of sentences) {
    if (CLOSING_SALUTATION_PATTERN.test(sentence.trim())) continue;
    const tokens = normalize(sentence)
      .replace(/[,;:"'’«»()]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length < 2) continue;
    const hasVerb = tokens.some((t) => IRREGULAR_VERB_FORMS.has(t) || REGULAR_VERB_FORMS.has(t));
    if (!hasVerb) fragments.push({ sentence });
  }
  return fragments;
}
