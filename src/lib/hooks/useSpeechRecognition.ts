"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type SpeechRecognitionErrorKind =
  | "not-supported"
  | "not-allowed"
  | "no-speech"
  | "network"
  | "aborted"
  | "unknown";

/** Feature support never changes over a page's lifetime, so no real
 * subscription is needed — this just gives useSyncExternalStore a
 * hydration-safe way to read a browser-only global without setState-in-effect. */
function subscribeNoop() {
  return () => {};
}
function getIsSupportedSnapshot() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}
function getIsSupportedServerSnapshot() {
  return false;
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number | null;
  error: SpeechRecognitionErrorKind | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/** Wraps the browser-native Web Speech API (Chrome/Edge only). `lang` is
 * fixed per call site — DELF questions/answers are always French
 * ("fr-FR"), independent of the UI's feedback language. */
export function useSpeechRecognition(lang: string): UseSpeechRecognitionResult {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isSupported = useSyncExternalStore(subscribeNoop, getIsSupportedSnapshot, getIsSupportedServerSnapshot);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<SpeechRecognitionErrorKind | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setError("not-supported");
      return;
    }
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setConfidence(null);

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      let lastConfidence: number | null = null;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alt = result[0];
        if (result.isFinal) {
          finalChunk += alt.transcript;
          lastConfidence = alt.confidence;
        } else {
          interimChunk += alt.transcript;
        }
      }
      if (finalChunk) {
        setTranscript((prev) => (prev ? `${prev} ${finalChunk}`.trim() : finalChunk.trim()));
      }
      setInterimTranscript(interimChunk);
      if (lastConfidence !== null) setConfidence(lastConfidence);
    };

    recognition.onerror = (event) => {
      const kind: SpeechRecognitionErrorKind =
        event.error === "not-allowed" || event.error === "permission-denied"
          ? "not-allowed"
          : event.error === "no-speech"
          ? "no-speech"
          : event.error === "network"
          ? "network"
          : event.error === "aborted"
          ? "aborted"
          : "unknown";
      setError(kind);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setConfidence(null);
    setError(null);
  }, []);

  return { isSupported, isListening, transcript, interimTranscript, confidence, error, start, stop, reset };
}
