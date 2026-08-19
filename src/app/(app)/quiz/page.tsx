"use client";

import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { DelfQuizPage } from "@/components/delf/DelfQuizPage";
import { TopikQuizPage } from "@/components/topik/TopikQuizPage";

export default function WeeklyQuizPage() {
  const { profile } = useUserProfile();
  if (!profile) return null;
  return profile.examId === "topik" ? <TopikQuizPage /> : <DelfQuizPage />;
}
