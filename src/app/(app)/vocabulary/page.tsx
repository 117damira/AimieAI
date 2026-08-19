"use client";

import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { DelfVocabularyPage } from "@/components/delf/DelfVocabularyPage";
import { TopikVocabularyPage } from "@/components/topik/TopikVocabularyPage";

export default function VocabularyPage() {
  const { profile } = useUserProfile();
  if (!profile) return null;
  return profile.examId === "topik" ? <TopikVocabularyPage /> : <DelfVocabularyPage />;
}
