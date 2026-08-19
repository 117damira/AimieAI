import type { TopikReadingLevelConfig } from "@/types/topik-reading";
import type { TopikLevel } from "@/types/topik";

/**
 * Official TOPIK 읽기 (Reading) structure per numbered level — the numbers
 * the Reading Home dashboard displays and what content generation targets
 * (passage count, max length). Mirrors the shape of config/delf-reading.ts.
 *
 * `scoreOutOf` is always 100 — TOPIK Reading's official share of the
 * combined 200-point (TOPIK I: Listening 100 + Reading 100) or 300-point
 * (TOPIK II: Listening 100 + Writing 100 + Reading 100) test.
 *
 * `minPassingScore` here is ONLY this section's own practice proxy (we use
 * 50/100, i.e. half marks) — it is NOT one of the real published TOPIK
 * level cutoffs, which are combined-score thresholds spanning Listening +
 * Reading (TOPIK I) or Listening + Writing + Reading (TOPIK II) and cannot
 * be reconstructed from a single section in isolation:
 *   TOPIK I  (out of 200): Level 1 = 80–139,  Level 2 = 140–200
 *   TOPIK II (out of 300): Level 3 = 120–149, Level 4 = 150–189,
 *                          Level 5 = 190–229, Level 6 = 230–300
 * Those figures are shown to the student as context only (see
 * lib/topik/reading-feedback.ts), never used as this module's own pass/fail
 * line.
 */
export const TOPIK_READING_LEVELS: Record<TopikLevel, TopikReadingLevelConfig> = {
  "1": {
    level: "1",
    label: "1급 · Beginner I",
    durationMinutes: 20,
    passageCountLabel: "3–4",
    passageCountMin: 3,
    passageCountMax: 4,
    maxWordsPerPassage: 40,
    scoreOutOf: 100,
    minPassingScore: 50,
    textTypes: {
      en: ["Signs and notices", "Short personal notes", "Simple dialogues", "Everyday messages"],
      ru: ["Вывески и объявления", "Короткие личные записки", "Простые диалоги", "Повседневные сообщения"],
      kz: ["Маңдайшалар мен хабарландырулар", "Қысқа жеке жазбалар", "Қарапайым диалогтар", "Күнделікті хабарламалар"],
    },
    topics: {
      en: ["Greetings", "Family", "Daily routine", "Shopping", "Numbers and time"],
      ru: ["Приветствия", "Семья", "Распорядок дня", "Покупки", "Числа и время"],
      kz: ["Сәлемдесу", "Отбасы", "Күн тәртібі", "Сауда", "Сандар мен уақыт"],
    },
  },
  "2": {
    level: "2",
    label: "2급 · Beginner II",
    durationMinutes: 25,
    passageCountLabel: "4–5",
    passageCountMin: 4,
    passageCountMax: 5,
    maxWordsPerPassage: 70,
    scoreOutOf: 100,
    minPassingScore: 50,
    textTypes: {
      en: ["Diary entries", "Text messages", "Short notices", "Simple invitations"],
      ru: ["Дневниковые записи", "СМС-сообщения", "Короткие объявления", "Простые приглашения"],
      kz: ["Күнделік жазбалары", "СМС хабарламалар", "Қысқа хабарландырулар", "Қарапайым шақыртулар"],
    },
    topics: {
      en: ["Weekend plans", "Transportation", "Weather", "Hobbies", "Simple requests"],
      ru: ["Планы на выходные", "Транспорт", "Погода", "Хобби", "Простые просьбы"],
      kz: ["Демалыс жоспарлары", "Көлік", "Ауа райы", "Хоббилер", "Қарапайым сұраныстар"],
    },
  },
  "3": {
    level: "3",
    label: "3급 · Intermediate I",
    durationMinutes: 35,
    passageCountLabel: "3–4",
    passageCountMin: 3,
    passageCountMax: 4,
    maxWordsPerPassage: 150,
    scoreOutOf: 100,
    minPassingScore: 50,
    textTypes: {
      en: ["Blog posts", "Short news articles", "Personal letters", "Public announcements"],
      ru: ["Блог-посты", "Короткие новостные статьи", "Личные письма", "Общественные объявления"],
      kz: ["Блог жазбалары", "Қысқа жаңалық мақалалары", "Жеке хаттар", "Қоғамдық хабарландырулар"],
    },
    topics: {
      en: ["Travel experiences", "Local events", "Work and study", "Social relationships"],
      ru: ["Впечатления от путешествий", "Местные события", "Работа и учёба", "Социальные отношения"],
      kz: ["Саяхат әсерлері", "Жергілікті іс-шаралар", "Жұмыс пен оқу", "Әлеуметтік қарым-қатынас"],
    },
  },
  "4": {
    level: "4",
    label: "4급 · Intermediate II",
    durationMinutes: 45,
    passageCountLabel: "3",
    passageCountMin: 3,
    passageCountMax: 3,
    maxWordsPerPassage: 220,
    scoreOutOf: 100,
    minPassingScore: 50,
    textTypes: {
      en: ["Opinion articles", "Informational articles", "Workplace correspondence", "Formal notices"],
      ru: ["Статьи-мнения", "Информационные статьи", "Деловая переписка", "Официальные уведомления"],
      kz: ["Пікір мақалалары", "Ақпараттық мақалалар", "Жұмыс хат-хабары", "Ресми хабарландырулар"],
    },
    topics: {
      en: ["Work-life balance", "Environment", "Technology in daily life", "Social issues"],
      ru: ["Баланс между работой и личной жизнью", "Экология", "Технологии в быту", "Социальные вопросы"],
      kz: ["Жұмыс пен өмір теңгерімі", "Қоршаған орта", "Күнделікті өмірдегі технология", "Әлеуметтік мәселелер"],
    },
  },
  "5": {
    level: "5",
    label: "5급 · Advanced I",
    durationMinutes: 55,
    passageCountLabel: "2–3",
    passageCountMin: 2,
    passageCountMax: 3,
    maxWordsPerPassage: 300,
    scoreOutOf: 100,
    minPassingScore: 50,
    textTypes: {
      en: ["Newspaper editorials", "Academic-style essays", "Analytical reports"],
      ru: ["Редакционные статьи", "Эссе в академическом стиле", "Аналитические отчёты"],
      kz: ["Газет редакциялық мақалалары", "Академиялық стильдегі эссе", "Талдамалық есептер"],
    },
    topics: {
      en: ["Technology and society", "Education policy", "Economic trends", "Cultural change"],
      ru: ["Технологии и общество", "Образовательная политика", "Экономические тенденции", "Культурные изменения"],
      kz: ["Технология және қоғам", "Білім беру саясаты", "Экономикалық үрдістер", "Мәдени өзгерістер"],
    },
  },
  "6": {
    level: "6",
    label: "6급 · Advanced II",
    durationMinutes: 70,
    passageCountLabel: "2",
    passageCountMin: 2,
    passageCountMax: 2,
    maxWordsPerPassage: 340,
    scoreOutOf: 100,
    minPassingScore: 50,
    textTypes: {
      en: ["Critical essays", "Formal analytical reports", "Academic discourse"],
      ru: ["Критические эссе", "Официальные аналитические отчёты", "Академический дискурс"],
      kz: ["Сын эссе", "Ресми талдамалық есептер", "Академиялық дискурс"],
    },
    topics: {
      en: ["Tradition and modernity", "Economic and social policy", "Philosophy of science", "Abstract social critique"],
      ru: ["Традиция и современность", "Экономическая и социальная политика", "Философия науки", "Абстрактная социальная критика"],
      kz: ["Дәстүр мен заманауилық", "Экономикалық және әлеуметтік саясат", "Ғылым философиясы", "Абстрактілі әлеуметтік сын"],
    },
  },
};
