"use client";

import { Mic, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";

export function SpeakingResponseInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Answer</CardTitle>
        <CardDescription>
          Type your response below (voice recording is coming soon).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <button
            type="button"
            disabled
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white opacity-60"
            aria-label="Voice recording (coming soon)"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <textarea
          rows={5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Écrivez votre réponse ici..."
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
        />
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!value.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Submit answer"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
