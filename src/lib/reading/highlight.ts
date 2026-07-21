export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Splits a passage body around an exact evidence quote so a component can
 * wrap the match in <mark> — this is the "Highlight Evidence" feature: it
 * points at the real supporting sentence instead of revealing the answer.
 * Falls back to a normalized (whitespace-insensitive) search, then to "no
 * match" (the whole passage rendered unhighlighted) if the quote can't be
 * located verbatim — never throws, never fabricates a match.
 */
export function highlightEvidence(passageBody: string, evidenceQuote: string): HighlightSegment[] {
  const quote = evidenceQuote.trim();
  if (!quote) return [{ text: passageBody, isMatch: false }];

  let index = passageBody.indexOf(quote);
  let matchLength = quote.length;

  if (index === -1) {
    // Whitespace-insensitive fallback: build a regex from the quote that
    // tolerates differing whitespace/newlines between words, in case the
    // generated quote's spacing doesn't byte-match the passage exactly.
    const escaped = quote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = escaped.replace(/\s+/g, "\\s+");
    const match = new RegExp(pattern).exec(passageBody);
    if (match) {
      index = match.index;
      matchLength = match[0].length;
    }
  }

  if (index === -1) return [{ text: passageBody, isMatch: false }];

  const segments: HighlightSegment[] = [];
  if (index > 0) segments.push({ text: passageBody.slice(0, index), isMatch: false });
  segments.push({ text: passageBody.slice(index, index + matchLength), isMatch: true });
  if (index + matchLength < passageBody.length) {
    segments.push({ text: passageBody.slice(index + matchLength), isMatch: false });
  }
  return segments;
}
