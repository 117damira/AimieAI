import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/initials";

export type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export interface AvatarProps {
  firstName: string;
  lastName: string;
  /** Uploaded avatar photo (data URL or any image src). When set, this
   * replaces the computed initials entirely. */
  photoUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({
  firstName,
  lastName,
  photoUrl,
  size = "md",
  className,
}: AvatarProps) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URLs aren't compatible with next/image's optimizer
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`.trim()}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-surface",
          SIZE_CLASSES[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display font-semibold text-white ring-2 ring-surface",
        SIZE_CLASSES[size],
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
