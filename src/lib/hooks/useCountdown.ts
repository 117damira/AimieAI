"use client";

import { useEffect, useRef, useState } from "react";

/** Ticks down from `totalSeconds` to 0, calling `onComplete` once when it
 * reaches zero. Resets whenever `totalSeconds` changes. */
export function useCountdown(totalSeconds: number, onComplete?: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [trackedTotal, setTrackedTotal] = useState(totalSeconds);

  // Reset during render (React's endorsed pattern for "adjust state when a
  // prop changes") rather than via a setState-in-effect.
  if (totalSeconds !== trackedTotal) {
    setTrackedTotal(totalSeconds);
    setRemainingSeconds(totalSeconds);
  }

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onCompleteRef.current?.();
      return;
    }
    const timer = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingSeconds]);

  return { remainingSeconds, elapsedSeconds: totalSeconds - remainingSeconds };
}

export function formatMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
