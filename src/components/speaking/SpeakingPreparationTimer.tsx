"use client";

import { Timer } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCountdown, formatMMSS } from "@/lib/hooks/useCountdown";

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function SpeakingPreparationTimer({
  totalMinutes,
  onSkip,
  onComplete,
}: {
  totalMinutes: number;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const { t } = useLanguage();
  const totalSeconds = totalMinutes * 60;
  const { remainingSeconds, elapsedSeconds } = useCountdown(totalSeconds, onComplete);
  const shouldReduceMotion = useReducedMotion();
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 10;
  const progress = totalSeconds > 0 ? Math.min(1, Math.max(0, elapsedSeconds / totalSeconds)) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{t.speaking.preparingTitle}</CardTitle>
        </div>
        <CardDescription>{t.speaking.preparingDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 py-10">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="8"
              className="stroke-primary-50"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={isUrgent ? "stroke-danger-500" : "stroke-primary-500"}
              style={{ strokeDasharray: RING_CIRCUMFERENCE }}
              initial={false}
              animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress) }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <span
            className={`absolute font-display text-4xl font-semibold tabular-nums ${
              isUrgent ? "text-danger-600" : "text-foreground"
            }`}
          >
            {formatMMSS(remainingSeconds)}
          </span>
        </div>
        <Button variant="secondary" onClick={onSkip}>
          {t.speaking.startSpeakingNow}
        </Button>
      </CardContent>
    </Card>
  );
}
