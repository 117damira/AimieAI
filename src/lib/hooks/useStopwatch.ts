"use client";

import { useEffect, useState } from "react";

/** Counts up in whole seconds while `isRunning` is true, resetting to 0
 * each time it (re)starts and holding its last value once stopped — used
 * to show live recording duration and "you spoke for X" afterward. */
export function useStopwatch(isRunning: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wasRunning, setWasRunning] = useState(isRunning);

  // Reset during render when a new run starts — React's endorsed pattern
  // for "adjust state when a prop changes" (see useCountdown.ts).
  if (isRunning !== wasRunning) {
    setWasRunning(isRunning);
    if (isRunning) setElapsedSeconds(0);
  }

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  return elapsedSeconds;
}
