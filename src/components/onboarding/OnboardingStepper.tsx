import { ProgressBar } from "@/components/ui";

export function OnboardingStepper({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  return (
    <ProgressBar
      value={step}
      max={totalSteps}
      label={`Step ${step} of ${totalSteps}`}
      colorClassName="bg-primary-500"
    />
  );
}
