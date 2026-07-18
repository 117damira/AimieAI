import { ProgressBar } from "@/components/ui";

export function SpeakingProgressStepper({
  currentIndex,
  total,
  partLabel,
}: {
  currentIndex: number;
  total: number;
  partLabel: string;
}) {
  return (
    <ProgressBar
      value={currentIndex + 1}
      max={total}
      label={`Question ${currentIndex + 1} of ${total} · ${partLabel}`}
      colorClassName="bg-primary-500"
    />
  );
}
