"use client";

import { Megaphone, ExternalLink, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TOPIK_ANNOUNCEMENTS, OFFICIAL_TOPIK_WEBSITE_URL, OFFICIAL_TOPIK_WEBSITE_LABEL } from "@/config/topik-announcements";
import type { TopikAnnouncementCategory } from "@/types/topik-announcements";

const CATEGORY_VARIANT: Record<TopikAnnouncementCategory, "primary" | "success" | "warning" | "neutral" | "danger"> = {
  registration: "primary",
  examDate: "warning",
  results: "success",
  announcement: "neutral",
  change: "danger",
};

/**
 * TOPIK is administered by NIIED, an external organization AimieAI has no
 * live data feed into — see config/topik-announcements.ts for why this
 * starts empty rather than showing any hardcoded date/policy as fact. This
 * component IS the architecture for a future real feed: once
 * TOPIK_ANNOUNCEMENTS is populated (an API, a scraped/curated backend), it
 * renders each entry with its category, date, and official source link
 * with zero further changes needed here.
 */
export function TopikAnnouncementsCard() {
  const { t, language } = useLanguage();
  const a = t.topik.announcements;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
            <Megaphone className="h-[18px] w-[18px]" />
          </span>
          <CardTitle>{a.title}</CardTitle>
        </div>
        <CardDescription>{a.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {TOPIK_ANNOUNCEMENTS.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center">
            <Info className="h-5 w-5 text-muted" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">{a.emptyTitle}</span>
              <span className="text-xs leading-5 text-muted">{a.emptyDescription}</span>
            </div>
            <a
              href={OFFICIAL_TOPIK_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline"
            >
              {a.officialSiteCta} ({OFFICIAL_TOPIK_WEBSITE_LABEL})
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {TOPIK_ANNOUNCEMENTS.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5 rounded-2xl bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={CATEGORY_VARIANT[item.category]}>{a.categories[item.category]}</Badge>
                  {item.date && <span className="text-xs text-muted">{item.date}</span>}
                </div>
                <span className="text-sm font-medium text-foreground">{item.title[language]}</span>
                <p className="text-xs leading-5 text-muted">{item.description[language]}</p>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                >
                  {a.sourceLinkLabel}: {item.sourceLabel}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
