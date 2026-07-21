"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Rewind, FastForward, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { pickVoice } from "@/lib/utils/voice";
import { segmentTranscript, totalDuration, segmentIndexAtTime, formatTime } from "@/lib/utils/ttsPlayer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type PlayerStatus = "idle" | "playing" | "paused" | "ended" | "unsupported";

const SKIP_SECONDS = 10;

function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

/**
 * A real, working audio-player experience built on the Web Speech API —
 * there is no recorded audio file (no TTS/audio-generation API is
 * available in this environment), so the transcript is split into
 * sentence-level segments (see lib/utils/ttsPlayer.ts), each spoken as its
 * own utterance in sequence. Seeking/skipping jumps to whichever segment
 * covers the target time and starts speaking from there — sentence-level
 * granularity, not sample-accurate, but every control genuinely functions
 * and the audio is always real, audible synthesized French speech.
 *
 * Internal playback functions are plain (non-memoized) closures redefined
 * each render — they're only ever called from this component's own event
 * handlers, never passed to memoized children, so referential stability
 * isn't needed; this also sidesteps the self-recursion-through-useCallback
 * staleness trap entirely. Cross-render mutable state lives in refs and is
 * only ever read/written from effects or event handlers, never render.
 */
export function ListeningAudioPlayer({ transcript }: { transcript: string }) {
  const { t } = useLanguage();
  const segments = useMemo(() => segmentTranscript(transcript), [transcript]);
  const duration = useMemo(() => totalDuration(segments), [segments]);

  const [status, setStatus] = useState<PlayerStatus>(() => (speechSynthesisSupported() ? "idle" : "unsupported"));
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [voiceReady, setVoiceReady] = useState(false);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const segmentIndexRef = useRef(0);
  const accumulatedElapsedRef = useRef(0);
  const segmentStartWallClockRef = useRef(0);
  const hasPendingNativePauseRef = useRef(false);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<PlayerStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!speechSynthesisSupported()) return;
    let cancelled = false;
    pickVoice("fr").then((voice) => {
      if (cancelled) return;
      voiceRef.current = voice;
      setVoiceReady(true);
    });
    return () => {
      cancelled = true;
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current !== null) clearInterval(tickIntervalRef.current);
    };
  }, []);

  function computeCurrentTime(): number {
    const segment = segments[segmentIndexRef.current];
    if (!segment) return duration;
    const live = statusRef.current === "playing" ? (performance.now() - segmentStartWallClockRef.current) / 1000 : 0;
    return Math.min(duration, segment.startSeconds + accumulatedElapsedRef.current + live);
  }

  function stopTicking() {
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }

  function startTicking() {
    stopTicking();
    tickIntervalRef.current = setInterval(() => setCurrentTime(computeCurrentTime()), 200);
  }

  function speakFromCurrentSegment() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const segment = segments[segmentIndexRef.current];
    if (!segment) {
      setStatus("ended");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(segment.text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current.lang;
    } else {
      utterance.lang = "fr-FR";
    }
    utterance.volume = volume;
    utterance.rate = 1;
    segmentStartWallClockRef.current = performance.now();
    hasPendingNativePauseRef.current = false;
    utterance.onend = () => {
      if (statusRef.current !== "playing") return;
      const nextIndex = segmentIndexRef.current + 1;
      if (nextIndex >= segments.length) {
        setStatus("ended");
        setCurrentTime(duration);
        stopTicking();
        return;
      }
      segmentIndexRef.current = nextIndex;
      accumulatedElapsedRef.current = 0;
      speakFromCurrentSegment();
    };
    utterance.onerror = () => {
      setStatus("ended");
      stopTicking();
    };
    synth.speak(utterance);
    setStatus("playing");
    startTicking();
  }

  function play() {
    if (status === "unsupported") return;
    accumulatedElapsedRef.current = 0;
    speakFromCurrentSegment();
  }

  function pause() {
    if (status !== "playing") return;
    accumulatedElapsedRef.current += (performance.now() - segmentStartWallClockRef.current) / 1000;
    window.speechSynthesis.pause();
    hasPendingNativePauseRef.current = true;
    setStatus("paused");
    stopTicking();
    setCurrentTime(computeCurrentTime());
  }

  function resume() {
    if (status !== "paused") return;
    if (hasPendingNativePauseRef.current) {
      segmentStartWallClockRef.current = performance.now();
      window.speechSynthesis.resume();
      setStatus("playing");
      startTicking();
    } else {
      speakFromCurrentSegment();
    }
  }

  function seekTo(seconds: number) {
    const clamped = Math.max(0, Math.min(duration, seconds));
    const wasPlaying = statusRef.current === "playing";
    const wasEnded = statusRef.current === "ended";
    window.speechSynthesis.cancel();
    stopTicking();
    const index = segmentIndexAtTime(segments, clamped);
    segmentIndexRef.current = index;
    accumulatedElapsedRef.current = clamped - segments[index].startSeconds;
    hasPendingNativePauseRef.current = false;
    setCurrentTime(clamped);
    if (wasPlaying || wasEnded) {
      speakFromCurrentSegment();
    } else {
      setStatus("paused");
    }
  }

  function replay() {
    segmentIndexRef.current = 0;
    accumulatedElapsedRef.current = 0;
    play();
  }

  function skipBack() {
    seekTo(computeCurrentTime() - SKIP_SECONDS);
  }

  function skipForward() {
    seekTo(computeCurrentTime() + SKIP_SECONDS);
  }

  const isPlaying = status === "playing";
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {status === "unsupported" ? (
          <p className="text-sm text-danger-600">{t.listening.player.unsupported}</p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary-50 accent-primary-600"
                style={{
                  background: `linear-gradient(to right, var(--color-primary-500) ${progressPercent}%, var(--color-primary-50) ${progressPercent}%)`,
                }}
                aria-label={t.listening.player.seekLabel}
              />
              <div className="flex items-center justify-between text-xs text-muted tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={skipBack}
                disabled={!voiceReady}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
                aria-label={t.listening.player.skipBack}
                title={t.listening.player.skipBack}
              >
                <Rewind className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={isPlaying ? pause : status === "paused" ? resume : play}
                disabled={!voiceReady}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm shadow-primary-600/20 transition hover:bg-primary-700 disabled:opacity-40"
                aria-label={isPlaying ? t.listening.player.pause : t.listening.player.play}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={skipForward}
                disabled={!voiceReady}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
                aria-label={t.listening.player.skipForward}
                title={t.listening.player.skipForward}
              >
                <FastForward className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={replay}
                disabled={!voiceReady}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
                aria-label={t.listening.player.replay}
                title={t.listening.player.replay}
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 self-center">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-muted" />
              ) : (
                <Volume2 className="h-4 w-4 text-muted" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolumeState(Number(e.target.value))}
                className={cn("h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-primary-50 accent-primary-600")}
                aria-label={t.listening.player.volumeLabel}
              />
            </div>

            {!voiceReady && <p className="text-center text-xs text-muted">{t.listening.player.loadingVoice}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
