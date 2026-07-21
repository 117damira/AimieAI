/**
 * Timing helpers for the Listening audio player. The Web Speech API has no
 * native concept of a seek position or a known-in-advance duration for an
 * utterance, so we approximate a real audio-player experience by:
 *  1. Splitting the transcript into sentence-level segments.
 *  2. Estimating each segment's spoken duration from its word count at a
 *     realistic French speaking pace.
 *  3. Speaking segments as a queue of separate utterances, so "seeking"
 *     means jumping to whichever segment covers the target time and
 *     starting speech from there — coarse-grained (sentence-level), but a
 *     real, working approximation rather than a fake progress bar.
 */

export interface TranscriptSegment {
  text: string;
  startSeconds: number;
  durationSeconds: number;
}

/** Average spoken French pace at normal TTS rate — used only to estimate
 * segment durations for the seek bar/timer, not for anything scored. */
const WORDS_PER_SECOND = 2.3;
const MIN_SEGMENT_SECONDS = 1;

function splitIntoSentences(transcript: string): string[] {
  return transcript
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function estimateSegmentSeconds(sentence: string): number {
  const wordCount = sentence.split(/\s+/).filter(Boolean).length;
  return Math.max(MIN_SEGMENT_SECONDS, wordCount / WORDS_PER_SECOND);
}

export function segmentTranscript(transcript: string): TranscriptSegment[] {
  const sentences = splitIntoSentences(transcript);
  let cursor = 0;
  return sentences.map((text) => {
    const durationSeconds = estimateSegmentSeconds(text);
    const segment: TranscriptSegment = { text, startSeconds: cursor, durationSeconds };
    cursor += durationSeconds;
    return segment;
  });
}

export function totalDuration(segments: TranscriptSegment[]): number {
  const last = segments[segments.length - 1];
  return last ? last.startSeconds + last.durationSeconds : 0;
}

/** Finds which segment covers a given elapsed time, for seeking. */
export function segmentIndexAtTime(segments: TranscriptSegment[], seconds: number): number {
  if (segments.length === 0) return 0;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (seconds >= segments[i].startSeconds) return i;
  }
  return 0;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(s / 60);
  const secs = s % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
