import type { FeedbackLanguage } from "./writing-evaluation";

/**
 * TOPIK is administered by Korea's National Institute for International
 * Education (NIIED) — real registration/exam/results dates change every
 * cycle and this app has no live feed into NIIED's schedule, so nothing
 * here may ever be hardcoded as if it were a current, verified date. This
 * type only exists so a real official source (an API, scraped feed, or
 * manually-curated backend) can be plugged in later — see
 * config/topik-announcements.ts, which intentionally starts empty.
 */
export type TopikAnnouncementCategory =
  | "registration"
  | "examDate"
  | "results"
  | "announcement"
  | "change";

export interface TopikAnnouncement {
  id: string;
  category: TopikAnnouncementCategory;
  title: Record<FeedbackLanguage, string>;
  description: Record<FeedbackLanguage, string>;
  /** ISO yyyy-mm-dd the announcement itself refers to (a registration
   * window, exam day, results date) — not when it was posted. Null for
   * announcements that aren't date-specific (e.g. a policy change). */
  date: string | null;
  /** Official source name (e.g. "NIIED TOPIK") and URL, shown so the
   * student can verify against the real source rather than trusting this
   * app's copy blindly. */
  sourceLabel: string;
  sourceUrl: string;
}
