import type { DelfReadingLevelConfig, DelfLevel } from "@/types/reading";

/**
 * Official DELF Compréhension des Écrits structure per CEFR level — the
 * numbers the Reading Home dashboard displays and what content generation
 * targets. Mirrors the shape of config/delf-listening.ts.
 */
export const DELF_READING_LEVELS: Record<DelfLevel, DelfReadingLevelConfig> = {
  A1: {
    level: "A1",
    label: "A1 · Découverte",
    durationMinutes: 30,
    passageCountLabel: "4–5",
    passageCountMin: 4,
    passageCountMax: 5,
    maxWordsPerPassage: 60,
    scoreOutOf: 25,
    minPassingScore: 5,
    textTypes: {
      en: ["Announcements", "Schedules", "Menus", "Emails", "Postcards", "Invitations", "Advertisements", "Text messages", "Notices"],
      ru: ["Объявления", "Расписания", "Меню", "Письма", "Открытки", "Приглашения", "Реклама", "СМС-сообщения", "Уведомления"],
      kz: ["Хабарландырулар", "Кестелер", "Мәзірлер", "Хаттар", "Ашық хаттар", "Шақыртулар", "Жарнамалар", "Хабарламалар", "Ескертулер"],
    },
    topics: {
      en: ["Everyday situations", "School", "Family", "Shopping", "Travel basics"],
      ru: ["Повседневные ситуации", "Школа", "Семья", "Покупки", "Основы путешествий"],
      kz: ["Күнделікті жағдайлар", "Мектеп", "Отбасы", "Сауда", "Саяхаттың негіздері"],
    },
  },
  A2: {
    level: "A2",
    label: "A2 · Survie",
    durationMinutes: 30,
    passageCountLabel: "3–4",
    passageCountMin: 3,
    passageCountMax: 4,
    maxWordsPerPassage: 150,
    scoreOutOf: 25,
    minPassingScore: 5,
    textTypes: {
      en: ["Blog posts", "Emails", "Reviews", "Travel information", "Public information", "Short news", "Descriptions", "Advertisements"],
      ru: ["Блог-посты", "Письма", "Отзывы", "Туристическая информация", "Общественная информация", "Короткие новости", "Описания", "Реклама"],
      kz: ["Блог жазбалары", "Хаттар", "Пікірлер", "Саяхат ақпараты", "Қоғамдық ақпарат", "Қысқа жаңалықтар", "Сипаттамалар", "Жарнамалар"],
    },
    topics: {
      en: ["Everyday situations", "Travel", "Work", "Leisure", "Health"],
      ru: ["Повседневные ситуации", "Путешествия", "Работа", "Досуг", "Здоровье"],
      kz: ["Күнделікті жағдайлар", "Саяхат", "Жұмыс", "Демалыс", "Денсаулық"],
    },
  },
  B1: {
    level: "B1",
    label: "B1 · Seuil",
    durationMinutes: 35,
    passageCountLabel: "2",
    passageCountMin: 2,
    passageCountMax: 2,
    maxWordsPerPassage: 400,
    scoreOutOf: 25,
    minPassingScore: 5,
    textTypes: {
      en: ["Interviews", "Newspaper articles", "Travel articles", "Educational texts", "Workplace situations", "Cultural articles", "Opinion articles"],
      ru: ["Интервью", "Газетные статьи", "Статьи о путешествиях", "Образовательные тексты", "Ситуации на работе", "Статьи о культуре", "Статьи-мнения"],
      kz: ["Сұхбаттар", "Газет мақалалары", "Саяхат мақалалары", "Білім беру мәтіндері", "Жұмыс орнындағы жағдайлар", "Мәдениет мақалалары", "Пікір мақалалары"],
    },
    topics: {
      en: ["Information extraction", "Content analysis", "Education", "Work", "Culture", "Travel"],
      ru: ["Извлечение информации", "Анализ содержания", "Образование", "Работа", "Культура", "Путешествия"],
      kz: ["Ақпарат алу", "Мазмұнды талдау", "Білім", "Жұмыс", "Мәдениет", "Саяхат"],
    },
  },
  B2: {
    level: "B2",
    label: "B2 · Avancé",
    durationMinutes: 60,
    passageCountLabel: "2",
    passageCountMin: 2,
    passageCountMax: 2,
    maxWordsPerPassage: 1000,
    scoreOutOf: 25,
    minPassingScore: 5,
    textTypes: {
      en: ["Long newspaper articles", "Argumentative texts", "Magazine articles", "Reports"],
      ru: ["Длинные газетные статьи", "Аргументативные тексты", "Журнальные статьи", "Отчёты"],
      kz: ["Ұзақ газет мақалалары", "Дәйектеу мәтіндері", "Журнал мақалалары", "Есептер"],
    },
    topics: {
      en: ["Social issues", "Technology", "Environment", "Education", "Economy", "Culture"],
      ru: ["Социальные вопросы", "Технологии", "Экология", "Образование", "Экономика", "Культура"],
      kz: ["Әлеуметтік мәселелер", "Технология", "Қоршаған орта", "Білім", "Экономика", "Мәдениет"],
    },
  },
};
