import type { TopikListeningLevelConfig } from "@/types/topik-listening";
import type { TopikLevel } from "@/types/topik";
import { trackForLevel } from "@/types/topik";

/**
 * TOPIK Listening (듣기) section structure per level — the numbers the
 * Listening Home dashboard displays and what content generation targets.
 * Mirrors the shape of config/delf-listening.ts.
 *
 * `scoreOutOf` is 100 for every level — the official TOPIK Listening
 * section is always scored out of 100 points, whether it's sat as part of
 * TOPIK I (Listening 100 + Reading 100 = 200 total) or TOPIK II (Listening
 * 100 + Reading 100 + Writing 100 = 300 total).
 *
 * `minPassingScore` here is a PRACTICE PROXY for this Listening-only module
 * (score >= 50 out of 100), NOT the real official combined-test level
 * cutoff — this module never claims to award an official TOPIK level from
 * Listening alone. For real context, the official combined-score cutoffs
 * are: TOPIK I (200 total) — Level 1: 80-139, Level 2: 140-200; TOPIK II
 * (300 total) — Level 3: 120-149, Level 4: 150-189, Level 5: 190-229,
 * Level 6: 230-300.
 *
 * Duration, recording count, and difficulty increase progressively from
 * Level 1 (short, simple, everyday announcements) to Level 6 (long,
 * abstract lectures/discussions/news at native-adjacent speed).
 */
const PRACTICE_MIN_PASSING_SCORE = 50;

function levelConfig(
  level: TopikLevel,
  label: string,
  durationMinutes: number,
  recordingCountLabel: string,
  recordingCountMin: number,
  recordingCountMax: number,
  maxRecordingMinutes: number,
  topics: Record<"en" | "ru" | "kz", string[]>
): TopikListeningLevelConfig {
  return {
    level,
    track: trackForLevel(level),
    label,
    durationMinutes,
    recordingCountLabel,
    recordingCountMin,
    recordingCountMax,
    maxRecordingMinutes,
    scoreOutOf: 100,
    minPassingScore: PRACTICE_MIN_PASSING_SCORE,
    topics,
  };
}

export const TOPIK_LISTENING_LEVELS: Record<TopikLevel, TopikListeningLevelConfig> = {
  "1": levelConfig(
    "1",
    "Level 1 · 초급",
    20,
    "3–4",
    3,
    4,
    1,
    {
      en: ["Greetings", "Numbers and counting", "Shopping", "Simple directions", "Daily routine", "Family"],
      ru: ["Приветствия", "Числа и счёт", "Покупки", "Простые указания", "Распорядок дня", "Семья"],
      kz: ["Сәлемдесу", "Сандар және санау", "Сауда", "Қарапайым бағыттар", "Күнделікті тәртіп", "Отбасы"],
    }
  ),
  "2": levelConfig(
    "2",
    "Level 2 · 초중급",
    25,
    "4",
    4,
    4,
    1.5,
    {
      en: ["Phone calls", "Ordering food", "Making plans", "Public transportation", "Weather", "Workplace basics"],
      ru: ["Телефонные звонки", "Заказ еды", "Планы", "Общественный транспорт", "Погода", "Основы работы"],
      kz: ["Телефон қоңыраулары", "Тамақ тапсырыс беру", "Жоспарлар", "Қоғамдық көлік", "Ауа райы", "Жұмыс негіздері"],
    }
  ),
  "3": levelConfig(
    "3",
    "Level 3 · 중급",
    30,
    "5–6",
    5,
    6,
    2,
    {
      en: ["Interviews", "Announcements", "Opinions and preferences", "Travel planning", "Health", "Campus life"],
      ru: ["Интервью", "Объявления", "Мнения и предпочтения", "Планирование поездок", "Здоровье", "Студенческая жизнь"],
      kz: ["Сұхбаттар", "Хабарландырулар", "Пікірлер мен таңдаулар", "Саяхатты жоспарлау", "Денсаулық", "Кампус өмірі"],
    }
  ),
  "4": levelConfig(
    "4",
    "Level 4 · 중고급",
    35,
    "6",
    6,
    6,
    2.5,
    {
      en: ["Workplace discussions", "News reports", "Debates", "Culture and society", "Environment", "Consumer issues"],
      ru: ["Рабочие обсуждения", "Новостные репортажи", "Дебаты", "Культура и общество", "Экология", "Потребительские вопросы"],
      kz: ["Жұмыс талқылаулары", "Жаңалықтар репортаждары", "Пікірталастар", "Мәдениет пен қоғам", "Қоршаған орта", "Тұтынушы мәселелері"],
    }
  ),
  "5": levelConfig(
    "5",
    "Level 5 · 고급",
    40,
    "7",
    7,
    8,
    3,
    {
      en: ["Academic lectures", "Panel discussions", "Documentaries", "Policy and economics", "Technology", "Social issues"],
      ru: ["Академические лекции", "Дискуссионные панели", "Документальные фильмы", "Политика и экономика", "Технологии", "Социальные вопросы"],
      kz: ["Академиялық дәрістер", "Пікірталас панельдері", "Деректі фильмдер", "Саясат пен экономика", "Технология", "Әлеуметтік мәселелер"],
    }
  ),
  "6": levelConfig(
    "6",
    "Level 6 · 최고급",
    45,
    "8",
    8,
    8,
    3.5,
    {
      en: ["Specialized lectures", "Formal debates", "Expert interviews", "Literature and criticism", "Legal and administrative topics", "Abstract argumentation"],
      ru: ["Специализированные лекции", "Официальные дебаты", "Интервью с экспертами", "Литература и критика", "Правовые и административные темы", "Абстрактная аргументация"],
      kz: ["Мамандандырылған дәрістер", "Ресми дебаттар", "Сарапшылармен сұхбаттар", "Әдебиет пен сын", "Құқықтық және әкімшілік тақырыптар", "Абстрактілі дәлелдеу"],
    }
  ),
};
