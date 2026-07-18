"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { ExamStep } from "@/components/onboarding/ExamStep";
import { LevelStep } from "@/components/onboarding/LevelStep";
import { ExamDateStep } from "@/components/onboarding/ExamDateStep";
import { DailyGoalStep } from "@/components/onboarding/DailyGoalStep";
import { ReviewStep } from "@/components/onboarding/ReviewStep";
import type { ExamId } from "@/types/exam";
import type { OnboardingLevel } from "@/types/user";

interface Draft {
  examId: ExamId | null;
  targetLevel: OnboardingLevel | null;
  examDate: string | null;
  dailyGoalMinutes: number;
}

const TOTAL_STEPS = 5;

const STEP_COPY = [
  {
    title: "Which exam are you preparing for?",
    description: "We'll tailor your dashboard and exercises to this exam.",
  },
  {
    title: "What's your current level?",
    description: "Be honest — you can always adjust this later in Settings.",
  },
  {
    title: "When is your exam?",
    description: "We'll use this to help pace your study plan.",
  },
  {
    title: "What's your daily study goal?",
    description: "A realistic daily target you can stick to.",
  },
  {
    title: "You're all set",
    description: "Review your answers before we build your dashboard.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useUserProfile();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>({
    examId: null,
    targetLevel: null,
    examDate: null,
    dailyGoalMinutes: 20,
  });

  const canAdvance =
    step === 1 ? draft.examId !== null : step === 2 ? draft.targetLevel !== null : true;

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    completeOnboarding({
      examId: draft.examId!,
      targetLevel: draft.targetLevel!,
      examDate: draft.examDate,
      dailyGoalMinutes: draft.dailyGoalMinutes,
    });
    router.push("/dashboard");
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  const copy = STEP_COPY[step - 1];

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <OnboardingStepper step={step} totalSteps={TOTAL_STEPS} />
        <CardTitle className="mt-2">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <ExamStep
            value={draft.examId}
            onChange={(examId) => setDraft((d) => ({ ...d, examId }))}
          />
        )}
        {step === 2 && (
          <LevelStep
            value={draft.targetLevel}
            onChange={(targetLevel) => setDraft((d) => ({ ...d, targetLevel }))}
          />
        )}
        {step === 3 && (
          <ExamDateStep
            value={draft.examDate}
            onChange={(examDate) => setDraft((d) => ({ ...d, examDate }))}
          />
        )}
        {step === 4 && (
          <DailyGoalStep
            value={draft.dailyGoalMinutes}
            onChange={(dailyGoalMinutes) => setDraft((d) => ({ ...d, dailyGoalMinutes }))}
          />
        )}
        {step === 5 && <ReviewStep draft={draft} />}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canAdvance}>
          {step === TOTAL_STEPS ? "Get started" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
