"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { AnimatedNumber } from "./AnimatedNumber";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  colorClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  className,
  colorClassName = "bg-primary-500",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-muted">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="tabular-nums">
              <AnimatedNumber value={Math.round(percentage)} />%
            </span>
          )}
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-primary-50 shadow-inner shadow-black/[0.03]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={cn("h-full w-full origin-left rounded-full", colorClassName)}
          initial={false}
          animate={{ scaleX: percentage / 100 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
