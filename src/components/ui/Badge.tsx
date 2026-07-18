import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  info: "bg-info-50 text-info-600",
  danger: "bg-danger-50 text-danger-600",
  neutral: "bg-background text-muted border border-border",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
