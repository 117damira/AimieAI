export type Language = "en" | "ru" | "kz";

export interface Dictionary {
  weekdaysShort: [string, string, string, string, string, string, string];
  topbar: {
    streak: (days: number) => string;
  };
  streakModal: {
    title: string;
    description: (days: number) => string;
    legendActive: string;
    legendInactive: string;
    currentStreak: string;
    longestStreak: string;
    thisWeek: string;
    thisMonth: string;
    consistency: string;
    consistencyDescription: (percent: number) => string;
    daysUnit: string;
    noHistory: string;
  };
  dashboard: {
    greeting: (firstName: string) => string;
    subtitle: (examName: string) => string;
    wordOfDay: {
      title: string;
      description: string;
      badge: string;
      cta: string;
    };
    dailyGoal: {
      title: string;
      minutesLabel: (done: number, goal: number) => string;
      streakLine: (days: number) => string;
    };
    speaking: {
      title: string;
      description: string;
      cta: string;
    };
    writing: {
      title: string;
      description: string;
      cta: string;
    };
    quiz: {
      title: string;
      description: string;
      cta: string;
    };
    progress: {
      title: string;
      viewDetails: string;
      wordsLearned: string;
      quizzesDone: string;
      speakingSessions: string;
      writingSessions: string;
    };
  };
}

export const TRANSLATIONS: Record<Language, Dictionary> = {
  en: {
    weekdaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    topbar: {
      streak: (days) => `${days}-day streak`,
    },
    streakModal: {
      title: "Your streak",
      description: (days) =>
        days === 0
          ? "Complete a practice session to start your streak."
          : `You've practiced ${days} day${days === 1 ? "" : "s"} in a row. Keep it going!`,
      legendActive: "Practiced",
      legendInactive: "No practice",
      currentStreak: "Current streak",
      longestStreak: "Longest streak",
      thisWeek: "This week",
      thisMonth: "This month",
      consistency: "Consistency",
      consistencyDescription: (percent) =>
        `Practiced ${percent}% of the last 30 days`,
      daysUnit: "days",
      noHistory: "No sessions yet — practice to fill in your calendar.",
    },
    dashboard: {
      greeting: (firstName) => `Welcome back, ${firstName}`,
      subtitle: (examName) => `Here's your ${examName} preparation for today.`,
      wordOfDay: {
        title: "Today's Word",
        description: "A fresh word picked for your level, just for today.",
        badge: "New",
        cta: "Practice this word",
      },
      dailyGoal: {
        title: "Daily Goal",
        minutesLabel: (done, goal) => `${done} / ${goal} min today`,
        streakLine: (days) => `${days}-day streak — keep it going!`,
      },
      speaking: {
        title: "Speaking Practice",
        description:
          "Answer an exam-style prompt and prepare for instant feedback.",
        cta: "Start speaking",
      },
      writing: {
        title: "Writing Practice",
        description:
          "Draft a response and get feedback structured like DELF scoring.",
        cta: "Start writing",
      },
      quiz: {
        title: "Weekly Quiz",
        description: "Review the vocabulary you've learned so far this week.",
        cta: "Take the quiz",
      },
      progress: {
        title: "Progress Summary",
        viewDetails: "View details",
        wordsLearned: "Words learned",
        quizzesDone: "Quizzes done",
        speakingSessions: "Speaking sessions",
        writingSessions: "Writing sessions",
      },
    },
  },
  ru: {
    weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    topbar: {
      streak: (days) => `Серия: ${days} дн.`,
    },
    streakModal: {
      title: "Ваша серия",
      description: (days) =>
        days === 0
          ? "Завершите занятие, чтобы начать серию."
          : `Вы занимаетесь уже ${days} дн. подряд. Не останавливайтесь!`,
      legendActive: "Занимались",
      legendInactive: "Нет занятий",
      currentStreak: "Текущая серия",
      longestStreak: "Лучшая серия",
      thisWeek: "На этой неделе",
      thisMonth: "В этом месяце",
      consistency: "Стабильность",
      consistencyDescription: (percent) =>
        `Занимались ${percent}% из последних 30 дней`,
      daysUnit: "дн.",
      noHistory: "Пока нет занятий — начните практиковаться, чтобы заполнить календарь.",
    },
    dashboard: {
      greeting: (firstName) => `С возвращением, ${firstName}`,
      subtitle: (examName) => `Ваша подготовка к ${examName} на сегодня.`,
      wordOfDay: {
        title: "Слово дня",
        description: "Новое слово, подобранное для вашего уровня.",
        badge: "Новое",
        cta: "Практиковать это слово",
      },
      dailyGoal: {
        title: "Дневная цель",
        minutesLabel: (done, goal) => `${done} / ${goal} мин сегодня`,
        streakLine: (days) => `Серия ${days} дн. — продолжайте!`,
      },
      speaking: {
        title: "Практика говорения",
        description:
          "Ответьте на экзаменационный вопрос и получите мгновенную обратную связь.",
        cta: "Начать говорение",
      },
      writing: {
        title: "Практика письма",
        description:
          "Напишите ответ и получите оценку в формате DELF.",
        cta: "Начать письмо",
      },
      quiz: {
        title: "Еженедельный тест",
        description: "Повторите слова, изученные на этой неделе.",
        cta: "Пройти тест",
      },
      progress: {
        title: "Сводка прогресса",
        viewDetails: "Подробнее",
        wordsLearned: "Слов изучено",
        quizzesDone: "Тестов пройдено",
        speakingSessions: "Сессий говорения",
        writingSessions: "Сессий письма",
      },
    },
  },
  kz: {
    weekdaysShort: ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сн"],
    topbar: {
      streak: (days) => `${days} күндік серия`,
    },
    streakModal: {
      title: "Сіздің серияңыз",
      description: (days) =>
        days === 0
          ? "Серияны бастау үшін жаттығуды аяқтаңыз."
          : `Сіз ${days} күн қатарынан жаттықтыңыз. Жалғастыра беріңіз!`,
      legendActive: "Жаттыққан",
      legendInactive: "Жаттықпаған",
      currentStreak: "Ағымдағы серия",
      longestStreak: "Ең ұзақ серия",
      thisWeek: "Осы апта",
      thisMonth: "Осы ай",
      consistency: "Тұрақтылық",
      consistencyDescription: (percent) =>
        `Соңғы 30 күннің ${percent}% жаттықтыңыз`,
      daysUnit: "күн",
      noHistory: "Әзірге жаттығу жоқ — күнтізбені толтыру үшін жаттығуды бастаңыз.",
    },
    dashboard: {
      greeting: (firstName) => `Қайта қош келдіңіз, ${firstName}`,
      subtitle: (examName) => `Бүгінге арналған ${examName} дайындығыңыз.`,
      wordOfDay: {
        title: "Күн сөзі",
        description: "Сіздің деңгейіңізге таңдалған жаңа сөз.",
        badge: "Жаңа",
        cta: "Осы сөзді жаттығу",
      },
      dailyGoal: {
        title: "Күндізгі мақсат",
        minutesLabel: (done, goal) => `Бүгін ${done} / ${goal} мин`,
        streakLine: (days) => `${days} күндік серия — жалғастырыңыз!`,
      },
      speaking: {
        title: "Сөйлеу жаттығуы",
        description:
          "Емтихан үлгісіндегі сұраққа жауап беріп, лездік кері байланыс алыңыз.",
        cta: "Сөйлеуді бастау",
      },
      writing: {
        title: "Жазу жаттығуы",
        description: "Жауап жазып, DELF бағалауы бойынша кері байланыс алыңыз.",
        cta: "Жазуды бастау",
      },
      quiz: {
        title: "Апталық тест",
        description: "Осы аптада үйренген сөздерді қайталаңыз.",
        cta: "Тестті бастау",
      },
      progress: {
        title: "Прогресс қорытындысы",
        viewDetails: "Толығырақ",
        wordsLearned: "Үйренген сөздер",
        quizzesDone: "Өткен тесттер",
        speakingSessions: "Сөйлеу сессиялары",
        writingSessions: "Жазу сессиялары",
      },
    },
  },
};
