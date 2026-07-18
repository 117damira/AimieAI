import { cn } from "@/lib/utils/cn";

export type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ initials, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display font-semibold text-white",
        SIZE_CLASSES[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
