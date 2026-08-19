"use client";

import {
  TOPIK_TRACK_ORDER,
  TOPIK_TRACK_LABELS,
  TOPIK_LEVEL_LABELS,
  topikLevelsForTrack,
} from "@/config/topik-onboarding";
import { defaultLevelForTrack } from "@/lib/utils/topikLevel";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TopikLevel, TopikTrack } from "@/types/topik";

/** TOPIK's step-2 onboarding replacement for LevelStep: pick which test to
 * sit (TOPIK I or TOPIK II — this drives which sections exist at all), then
 * a starting level within that track. Mirrors LevelStep's visual language
 * exactly (same card/chip styling) so it feels like the same product. */
export function TopikTrackLevelStep({
  track,
  level,
  onChangeTrack,
  onChangeLevel,
}: {
  track: TopikTrack | null;
  level: TopikLevel | null;
  onChangeTrack: (track: TopikTrack) => void;
  onChangeLevel: (level: TopikLevel) => void;
}) {
  const { t, language } = useLanguage();

  function handleTrackChange(nextTrack: TopikTrack) {
    onChangeTrack(nextTrack);
    onChangeLevel(defaultLevelForTrack(nextTrack));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOPIK_TRACK_ORDER.map((trackOption) => {
          const meta = TOPIK_TRACK_LABELS[trackOption];
          const selected = trackOption === track;
          return (
            <button
              key={trackOption}
              type="button"
              onClick={() => handleTrackChange(trackOption)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-start gap-1 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 transition-smooth",
                selected
                  ? "border-primary-400 bg-primary-50 shadow-card-hover"
                  : "border-border bg-background hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
              )}
            >
              <span className="font-display text-base font-semibold text-foreground">
                {meta.label}
              </span>
              <span className="text-xs text-muted">{meta.description[language]}</span>
              <span className="text-xs text-muted">{meta.sections}</span>
            </button>
          );
        })}
      </div>

      {track && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">{t.onboarding.reviewLevel}</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topikLevelsForTrack(track).map((levelOption) => {
              const meta = TOPIK_LEVEL_LABELS[levelOption];
              const selected = levelOption === level;
              return (
                <button
                  key={levelOption}
                  type="button"
                  onClick={() => onChangeLevel(levelOption)}
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-all duration-300 transition-smooth",
                    selected
                      ? "border-primary-400 bg-primary-50 shadow-card-hover"
                      : "border-border bg-background hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
                  )}
                >
                  <span className="font-display text-base font-semibold text-foreground">
                    {meta.label}
                  </span>
                  <span className="text-xs text-muted">{meta.description[language]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
