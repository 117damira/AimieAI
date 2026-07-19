import { cn } from "@/lib/utils/cn";

export interface ToggleRowProps {
  title: string;
  description: string;
  enabled: boolean;
}

export function ToggleRow({ title, description, enabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted">{description}</span>
      </div>
      <span
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
          enabled ? "bg-primary-500" : "bg-border"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow transition-transform",
            enabled && "translate-x-5"
          )}
        />
      </span>
    </div>
  );
}
