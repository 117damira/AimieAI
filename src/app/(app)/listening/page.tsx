"use client";

import { DelfListeningPage } from "@/components/delf/DelfListeningPage";
import { TopikListeningPage } from "@/components/topik/TopikListeningPage";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

/**
 * Listening entry point — routes to the right exam's implementation.
 * Listening exists for both TOPIK I and TOPIK II (unlike Writing, which is
 * TOPIK II only), so every TOPIK account gets TopikListeningPage — no
 * ComingSoon branch needed here. Every other exam (including DELF) keeps
 * its existing behavior, byte-identical to before this file became a
 * wrapper (see components/delf/DelfListeningPage.tsx, which holds the
 * original page content unchanged). Mirrors app/(app)/writing/page.tsx's
 * routing pattern.
 */
export default function ListeningPage() {
  const { profile } = useUserProfile();

  if (profile?.examId === "topik") {
    return <TopikListeningPage />;
  }

  return <DelfListeningPage />;
}
