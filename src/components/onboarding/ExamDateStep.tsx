"use client";

import { Input, Button } from "@/components/ui";

export function ExamDateStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (date: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        type="date"
        label="Exam date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => onChange(null)}
      >
        Not sure yet
      </Button>
    </div>
  );
}
