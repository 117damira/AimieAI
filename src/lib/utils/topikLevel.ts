import type { TopikLevel, TopikTrack } from "@/types/topik";
import { TOPIK_LEVELS_BY_TRACK } from "@/types/topik";

/** Every real level that belongs to a track, in ascending order — the
 * single source of truth other TOPIK modules should use instead of an
 * inline cast, mirroring how DELF's lib/utils/level.ts centralizes its own
 * level narrowing. */
export function levelsForTrack(track: TopikTrack): TopikLevel[] {
  return TOPIK_LEVELS_BY_TRACK[track];
}

/** The entry-level starting point for a freshly chosen track — Level 1 for
 * TOPIK I, Level 3 for TOPIK II (the first level that track can award). */
export function defaultLevelForTrack(track: TopikTrack): TopikLevel {
  return track === "I" ? "1" : "3";
}
