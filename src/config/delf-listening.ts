import type { DelfListeningLevelConfig, DelfLevel } from "@/types/listening";

/**
 * Official DELF Compréhension de l'Oral structure per CEFR level — the
 * numbers the Listening Home dashboard displays and what content
 * generation targets. Mirrors the shape of config/delf-writing.ts and
 * config/delf-speaking.ts.
 */
export const DELF_LISTENING_LEVELS: Record<DelfLevel, DelfListeningLevelConfig> = {
  A1: {
    level: "A1",
    label: "A1 · Découverte",
    durationMinutes: 20,
    recordingCountLabel: "3–4",
    recordingCountMin: 3,
    recordingCountMax: 4,
    maxRecordingMinutes: 3,
    scoreOutOf: 25,
    minPassingScore: 5,
    topics: {
      en: ["Public announcements", "Train stations", "Cafés", "Shopping", "School", "Family"],
      ru: ["Публичные объявления", "Вокзалы", "Кафе", "Покупки", "Школа", "Семья"],
      kz: ["Жария хабарландырулар", "Теміржол вокзалдары", "Кафелер", "Сауда", "Мектеп", "Отбасы"],
    },
  },
  A2: {
    level: "A2",
    label: "A2 · Survie",
    durationMinutes: 25,
    recordingCountLabel: "3–4",
    recordingCountMin: 3,
    recordingCountMax: 4,
    maxRecordingMinutes: 5,
    scoreOutOf: 25,
    minPassingScore: 5,
    topics: {
      en: ["Travel", "Phone calls", "Work", "Restaurants", "Appointments", "Everyday situations"],
      ru: ["Путешествия", "Телефонные звонки", "Работа", "Рестораны", "Встречи", "Повседневные ситуации"],
      kz: ["Саяхат", "Телефон қоңыраулары", "Жұмыс", "Мейрамханалар", "Кездесулер", "Күнделікті жағдайлар"],
    },
  },
  B1: {
    level: "B1",
    label: "B1 · Seuil",
    durationMinutes: 25,
    recordingCountLabel: "3",
    recordingCountMin: 3,
    recordingCountMax: 3,
    maxRecordingMinutes: 6,
    scoreOutOf: 25,
    minPassingScore: 5,
    topics: {
      en: ["Interviews", "Discussions", "News", "Education", "Travel", "Social situations"],
      ru: ["Интервью", "Дискуссии", "Новости", "Образование", "Путешествия", "Социальные ситуации"],
      kz: ["Сұхбаттар", "Талқылаулар", "Жаңалықтар", "Білім", "Саяхат", "Әлеуметтік жағдайлар"],
    },
  },
  B2: {
    level: "B2",
    label: "B2 · Avancé",
    durationMinutes: 30,
    recordingCountLabel: "3",
    recordingCountMin: 3,
    recordingCountMax: 3,
    maxRecordingMinutes: 8,
    scoreOutOf: 25,
    minPassingScore: 5,
    topics: {
      en: ["Documentaries", "TV programmes", "Debates", "Radio", "Interviews", "Social issues"],
      ru: ["Документальные фильмы", "Телепередачи", "Дебаты", "Радио", "Интервью", "Социальные вопросы"],
      kz: ["Деректі фильмдер", "Теледидар бағдарламалары", "Пікірталастар", "Радио", "Сұхбаттар", "Әлеуметтік мәселелер"],
    },
  },
};
