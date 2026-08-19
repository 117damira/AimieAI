import type { ComponentType } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "./Card";

/**
 * Honest, well-designed empty state for a feature that genuinely isn't
 * applicable yet (e.g. TOPIK I has no Writing section at all) — never
 * shows fake questions, fake results, or implies content is loading. Kept
 * generic/reusable rather than TOPIK-specific so any exam module can use
 * it for a real structural exclusion.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
          <Icon className="h-5 w-5 text-primary-500" />
        </span>
        <div className="flex max-w-md flex-col gap-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
