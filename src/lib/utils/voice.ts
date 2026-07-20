/** Best-effort female voice names across common OS/browser voice packs —
 * there's no reliable cross-platform "gender" field, so this is a name
 * heuristic, not a guarantee. */
const FEMALE_NAME_PATTERN =
  /female|zira|jenny|aria|julie|hortense|denise|am[ée]lie|salli|joanna|kendra|ivy|samantha|victoria|karen|moira|tessa|fiona|susan|linda|milena|elena|katya|aigul|dariya/i;

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const handle = () => {
      synth.removeEventListener("voiceschanged", handle);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", handle);
    setTimeout(() => resolve(synth.getVoices()), 500);
  });
}

/** Filters available voices by BCP-47 locale prefix (e.g. "fr", "en", "kk")
 * and prefers a clear, natural-sounding one. Network/cloud voices
 * (`localService === false`, e.g. Chrome's "Google français") are
 * consistently clearer than default on-device voices, which can sound
 * muffled — so among locale matches we prefer a female-named network voice
 * first, then any network voice, then a female-named local voice, then
 * whatever else matches. Returns null if nothing matches the locale at
 * all — callers should degrade silently. */
async function pickVoice(localePrefix: string): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = await getVoicesAsync();
  const matches = voices.filter((v) => v.lang.toLowerCase().startsWith(localePrefix.toLowerCase()));
  if (matches.length === 0) return null;

  const networkMatches = matches.filter((v) => !v.localService);
  const femaleNetwork = networkMatches.find((v) => FEMALE_NAME_PATTERN.test(v.name));
  if (femaleNetwork) return femaleNetwork;
  if (networkMatches.length > 0) return networkMatches[0];

  const femaleLocal = matches.find((v) => FEMALE_NAME_PATTERN.test(v.name));
  return femaleLocal ?? matches[0];
}

/** Speaks `text` aloud using the best available voice for `localePrefix`.
 * Resolves once speech finishes (or immediately, doing nothing, if no
 * matching voice exists or synthesis fails) — callers never need to branch
 * on TTS availability, written feedback is always shown regardless. */
export function speak(text: string, localePrefix: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    pickVoice(localePrefix).then((voice) => {
      if (!voice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 1;
      utterance.pitch = 1.05;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  });
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** DELF exam prompts and spoken answers are always French, regardless of
 * the UI's feedback language. */
export const EXAM_SPEECH_LOCALE = "fr";

/** BCP-47 prefixes for the app's feedback languages — "kz" (app code) maps
 * to the "kk" (Kazakh) locale tag; a matching voice is rarely installed, in
 * which case `speak()` silently no-ops. */
export const FEEDBACK_SPEECH_LOCALES: Record<"en" | "ru" | "kz", string> = {
  en: "en",
  ru: "ru",
  kz: "kk",
};
