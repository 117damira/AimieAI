import type { FeedbackLanguage } from "@/types/writing-evaluation";
import type { TopikLevel, TopikTrack } from "@/types/topik";
import { TOPIK_LEVELS_BY_TRACK } from "@/types/topik";

/** Mirrors config/onboarding.ts's ONBOARDING_LEVEL_LABELS pattern: a
 * candidate picks which TEST to sit (TOPIK I or TOPIK II), not a level
 * directly — the level (1-6) is the outcome of that test. */
export const TOPIK_TRACK_ORDER: TopikTrack[] = ["I", "II"];

export const TOPIK_TRACK_LABELS: Record<
  TopikTrack,
  { label: string; sections: string; description: Record<FeedbackLanguage, string> }
> = {
  I: {
    label: "TOPIK I",
    sections: "Listening + Reading",
    description: {
      en: "Beginner Korean · Levels 1–2",
      ru: "Начальный корейский · Уровни 1–2",
      kz: "Бастауыш корей тілі · 1–2 деңгей",
    },
  },
  II: {
    label: "TOPIK II",
    sections: "Listening + Reading + Writing",
    description: {
      en: "Intermediate–Advanced Korean · Levels 3–6",
      ru: "Средний–продвинутый корейский · Уровни 3–6",
      kz: "Орта–жоғары деңгей корей тілі · 3–6 деңгей",
    },
  },
};

export const TOPIK_LEVEL_LABELS: Record<
  TopikLevel,
  { label: string; description: Record<FeedbackLanguage, string> }
> = {
  "1": {
    label: "Level 1",
    description: { en: "Beginner · basics", ru: "Начальный · основы", kz: "Бастауыш · негіздер" },
  },
  "2": {
    label: "Level 2",
    description: {
      en: "Beginner · everyday communication",
      ru: "Начальный · повседневное общение",
      kz: "Бастауыш · күнделікті қарым-қатынас",
    },
  },
  "3": {
    label: "Level 3",
    description: {
      en: "Intermediate · daily & social life",
      ru: "Средний · повседневная и общественная жизнь",
      kz: "Орта · күнделікті және қоғамдық өмір",
    },
  },
  "4": {
    label: "Level 4",
    description: {
      en: "Intermediate · public & workplace topics",
      ru: "Средний · общественные и рабочие темы",
      kz: "Орта · қоғамдық және жұмыс тақырыптары",
    },
  },
  "5": {
    label: "Level 5",
    description: {
      en: "Advanced · professional & abstract topics",
      ru: "Продвинутый · профессиональные и абстрактные темы",
      kz: "Жоғары · кәсіби және дерексіз тақырыптар",
    },
  },
  "6": {
    label: "Level 6",
    description: {
      en: "Advanced · near-native fluency",
      ru: "Продвинутый · уровень, близкий к носителю языка",
      kz: "Жоғары · ана тіліне жақын деңгей",
    },
  },
};

export function topikLevelsForTrack(track: TopikTrack): TopikLevel[] {
  return TOPIK_LEVELS_BY_TRACK[track];
}
