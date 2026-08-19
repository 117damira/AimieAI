"use client";

import { ComingSoon } from "@/components/ui";
import { DelfWritingPage } from "@/components/delf/DelfWritingPage";
import { TopikWritingPage } from "@/components/topik/TopikWritingPage";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Writing entry point — routes to the right exam's implementation. TOPIK
 * Writing only exists for TOPIK II (Levels 3-6); TOPIK I has no Writing
 * section at all, so TOPIK I accounts see an honest ComingSoon state
 * instead (the nav item is already hidden for them, but this page can
 * still be reached directly). Every other exam (including DELF) keeps its
 * existing behavior, byte-identical to before this file became a wrapper.
 */
export default function WritingPage() {
  const { profile } = useUserProfile();
  const { t } = useLanguage();

  if (profile?.examId === "topik") {
    if (profile.topikTrack === "II") return <TopikWritingPage />;
    return (
      <ComingSoon
        title={t.topik.writing.comingSoonTitle}
        description={t.topik.writing.comingSoonDescription}
      />
    );
  }

  return <DelfWritingPage />;
}
