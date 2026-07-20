"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils/cn";

/** DELF answers are always spoken in French, regardless of feedback language. */
const RECOGNITION_LANG = "fr-FR";

export function SpeakingResponseInput({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (transcript: string, confidence: number | null) => void;
  isSubmitting: boolean;
}) {
  const { t } = useLanguage();
  const { isSupported, isListening, transcript, interimTranscript, confidence, error, start, stop, reset } =
    useSpeechRecognition(RECOGNITION_LANG);
  const wasListening = useRef(false);

  useEffect(() => {
    if (wasListening.current && !isListening && transcript.trim()) {
      onSubmit(transcript.trim(), confidence);
    }
    wasListening.current = isListening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  function handleMicClick() {
    if (isSubmitting) return;
    if (isListening) {
      stop();
    } else {
      reset();
      start();
    }
  }

  const errorMessage =
    error === "not-supported"
      ? t.speaking.micNotSupportedError
      : error === "not-allowed"
      ? t.speaking.micPermissionDeniedError
      : error === "no-speech"
      ? t.speaking.noSpeechDetectedError
      : error
      ? t.common.somethingWentWrong
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.speaking.yourAnswer}</CardTitle>
        <CardDescription>{t.speaking.speakYourAnswer}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isSubmitting || !isSupported}
            aria-label={isListening ? t.speaking.stopRecording : t.speaking.tapToSpeak}
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              isListening ? "bg-danger-600" : "bg-primary-600"
            )}
          >
            {isListening && (
              <motion.span
                className="absolute inset-0 rounded-full bg-danger-500"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isListening ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          <p className="text-sm font-medium text-foreground">
            {isSubmitting
              ? t.speaking.analyzing
              : isListening
              ? t.speaking.listening
              : t.speaking.tapToSpeak}
          </p>
        </div>

        {(transcript || interimTranscript) && (
          <p className="rounded-2xl bg-background px-4 py-3 text-sm leading-6 text-foreground">
            {transcript}
            {interimTranscript && <span className="text-muted"> {interimTranscript}</span>}
          </p>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-danger-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
