"use client";

import { useEffect } from "react";
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from "framer-motion";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

/**
 * Renders a number that eases toward `value` whenever it changes, driven by
 * a Framer Motion value bound directly to the DOM text node — no React
 * re-render per frame, so it stays cheap even with several on screen.
 */
export function AnimatedNumber({
  value,
  duration = 0.6,
  className,
  formatter,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const display = useTransform(motionValue, (latest) => {
    const rounded = Math.round(latest);
    return formatter ? formatter(rounded) : rounded.toString();
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, motionValue, shouldReduceMotion]);

  return (
    <motion.span className={className}>{display}</motion.span>
  );
}
