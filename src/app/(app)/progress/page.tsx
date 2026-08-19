"use client";

import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { DelfProgressPage } from "@/components/delf/DelfProgressPage";
import { TopikProgressView } from "@/components/topik/TopikProgressView";

export default function ProgressPage() {
  const { profile } = useUserProfile();
  if (!profile) return null;
  return profile.examId === "topik" ? <TopikProgressView /> : <DelfProgressPage />;
}
