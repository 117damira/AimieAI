"use client";

import DelfReadingPage from "@/components/delf/DelfReadingPage";
import { TopikReadingPage } from "@/components/topik/TopikReadingPage";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

/**
 * Reading entry point — routes to the right exam's implementation. DELF
 * keeps its existing behavior, byte-identical to before this file became a
 * wrapper (see components/delf/DelfReadingPage.tsx, moved here verbatim).
 * TOPIK gets its own fully separate implementation (components/topik/
 * TopikReadingPage.tsx) — never reusing DELF's prompts, content, or
 * scoring. Mirrors app/(app)/writing/page.tsx's routing pattern.
 */
export default function ReadingPage() {
  const { profile } = useUserProfile();

  if (profile?.examId === "topik") {
    return <TopikReadingPage />;
  }

  return <DelfReadingPage />;
}
