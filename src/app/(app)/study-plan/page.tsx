"use client";

import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { DelfStudyPlanPage } from "@/components/delf/DelfStudyPlanPage";
import { TopikStudyPlanPage } from "@/components/topik/TopikStudyPlanPage";

export default function StudyPlanPage() {
  const { profile } = useUserProfile();
  if (!profile) return null;
  return profile.examId === "topik" ? <TopikStudyPlanPage /> : <DelfStudyPlanPage />;
}
