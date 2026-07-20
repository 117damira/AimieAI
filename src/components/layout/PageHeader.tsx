import { type ReactNode } from "react";
import { BackButton } from "./BackButton";

export function PageHeader({
  title,
  description,
  action,
  onBack,
  backLabel,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {onBack && backLabel && <BackButton label={backLabel} onClick={onBack} />}
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
