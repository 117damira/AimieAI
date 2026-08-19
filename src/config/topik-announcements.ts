import type { TopikAnnouncement } from "@/types/topik-announcements";

/**
 * Official TOPIK announcements (registration windows, exam dates, results
 * dates, policy changes) — intentionally EMPTY. This app has no live
 * connection to NIIED (Korea's National Institute for International
 * Education, which administers TOPIK), so nothing may be hardcoded here as
 * if it were a current, verified announcement — a wrong or stale exam date
 * shown as fact would be actively harmful to a student relying on it.
 *
 * This array is the one place a real integration would populate data from
 * (an official API, a scraped/curated feed, or a backend job) — every
 * entry must carry a real `sourceUrl` pointing at the official source so
 * the student can verify it themselves. Until that's connected,
 * TopikAnnouncementsCard renders an honest empty state instead of fake
 * content.
 */
export const TOPIK_ANNOUNCEMENTS: TopikAnnouncement[] = [];

/** The official TOPIK website — safe to show even with no live feed
 * connected, since it's the stable, well-known official source itself
 * (not a specific date or policy this app would need to keep in sync). */
export const OFFICIAL_TOPIK_WEBSITE_URL = "https://www.topik.go.kr";
export const OFFICIAL_TOPIK_WEBSITE_LABEL = "topik.go.kr";
