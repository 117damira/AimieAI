/** TOPIK (Test of Proficiency in Korean) awards one of six numbered levels,
 * split across two separate tests a candidate sits: TOPIK I awards Levels
 * 1-2 (beginner), TOPIK II awards Levels 3-6 (intermediate-advanced). A
 * candidate chooses which TEST to sit (the track), not which level — the
 * level is the outcome. Entirely separate from DelfLevel; never mixed with
 * DELF content, scoring, or progress. */
export type TopikTrack = "I" | "II";

export type TopikLevel = "1" | "2" | "3" | "4" | "5" | "6";

export const TOPIK_LEVELS_BY_TRACK: Record<TopikTrack, TopikLevel[]> = {
  I: ["1", "2"],
  II: ["3", "4", "5", "6"],
};

export function trackForLevel(level: TopikLevel): TopikTrack {
  return TOPIK_LEVELS_BY_TRACK.I.includes(level) ? "I" : "II";
}
