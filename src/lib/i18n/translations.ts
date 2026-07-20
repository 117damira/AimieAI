export type Language = "en" | "ru" | "kz";

export interface Dictionary {
  weekdaysShort: [string, string, string, string, string, string, string];

  common: {
    cancel: string;
    save: string;
    back: string;
    continueButton: string;
    comingSoon: string;
    notSetYet: string;
    somethingWentWrong: string;
    selectLanguage: string;
    close: string;
    closeMenu: string;
    showPassword: string;
    hidePassword: string;
    duplicateEmailError: string;
    passwordTooShortError: string;
    passwordsDoNotMatchError: string;
    invalidCredentials: string;
  };

  topbar: {
    streak: (days: number) => string;
    ariaOpenMenu: string;
    ariaViewStreak: string;
    ariaOpenProfile: string;
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

  nav: {
    dashboard: string;
    vocabulary: string;
    speakingPractice: string;
    writingPractice: string;
    weeklyQuiz: string;
    progress: string;
    profile: string;
    settings: string;
  };

  sidebar: {
    track: (examName: string) => string;
    logOut: string;
  };

  notifications: {
    dailyReminder: { title: string; description: string };
    weeklySummary: { title: string; description: string };
    productUpdates: { title: string; description: string };
  };

  profileModal: {
    preferences: string;
    exam: string;
    currentLevel: string;
    studyGoal: string;
    minPerDay: (n: number) => string;
    account: string;
    profileLink: string;
    settingsLink: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    savePassword: string;
    wrongCurrentPasswordError: string;
    passwordUpdated: string;
    notificationsLink: string;
    dangerZone: string;
    logOut: string;
    deleteAccount: string;
  };

  logoutModal: {
    title: string;
    description: string;
    reasonLabel: string;
    reasonOptional: string;
    reasonPlaceholder: string;
    cancel: string;
    confirm: string;
  };

  deleteAccountModal: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };

  dashboard: {
    greeting: (firstName: string) => string;
    greetingFirstTime: (firstName: string) => string;
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

  vocabulary: {
    pageTitle: string;
    pageDescription: string;
    useItWhen: string;
    avoidItWhen: string;
    exampleSentences: string;
    yourTurn: string;
    yourTurnDescription: (word: string) => string;
    sentencePlaceholder: (word: string) => string;
    getAiFeedback: string;
    aiFeedback: string;
    aiFeedbackDescription: string;
    aiFeedbackEmptyState: string;
    yourVocabulary: string;
    yourVocabularyDescription: string;
    masteryLabels: { new: string; learning: string; mastered: string };
  };

  speaking: {
    pageTitle: string;
    pageDescription: string;
    reportGenerationFailed: string;
    evaluationFailed: string;
    nextQuestion: string;
    finishSeeReport: string;
    compilingReport: string;
    examinerReport: string;
    modeLive: string;
    modeWritten: string;
    practiceAgain: string;
    modeSelect: {
      aiLiveExaminerTitle: string;
      aiLiveExaminerDescription: string;
      startSimulation: string;
      writtenTitle: string;
      writtenDescription: string;
      startPractice: string;
    };
    questionProgress: (current: number, total: number, part: string) => string;
    minutesUnit: (n: number) => string;
    yourAnswer: string;
    speakYourAnswer: string;
    tapToSpeak: string;
    listening: string;
    stopRecording: string;
    micNotSupportedError: string;
    micPermissionDeniedError: string;
    noSpeechDetectedError: string;
    repeatQuestion: string;
    analyzing: string;
    examinerFeedback: string;
    answeredQuestion: string;
    needsMoreDevelopment: string;
    generatingQuestions: string;
    startExam: string;
    noPrepTime: string;
    exitExam: string;
    exitExamConfirmTitle: string;
    exitExamConfirmDescription: string;
    exitExamConfirmCancel: string;
    exitExamConfirmYes: string;
    youSpokeFor: (min: number, sec: number) => string;
    prepTimeLabel: string;
    estimatedDurationLabel: string;
    numberOfPartsLabel: string;
    preparingTitle: string;
    preparingDescription: string;
    startSpeakingNow: string;
    chooseTopic: string;
    selectTopic: string;
    showTranslation: string;
    hideTranslation: string;
    tips: {
      title: string;
      beSpontaneous: string;
      practiceMockExams: string;
      dontBeAfraid: string;
      practiceWithNatives: string;
      practiceConsistently: string;
    };
    feedback: {
      taskCompletionLabel: string;
      coherenceLabel: string;
      pronunciationLabel: string;
      fluencyLabel: string;
      vocabularyLabel: string;
      whyWrong: string;
      howToFix: string;
      betterExample: string;
      howToAvoid: string;
      sentenceVarietyLabel: string;
      naturalnessLabel: string;
      answerStructureLabel: string;
      mispronuncedWordsTitle: string;
      playPronunciation: string;
      strengthsTitle: string;
      areasForImprovementTitle: string;
      suggestionsTitle: string;
      improvedAnswerTitle: string;
      coachingTipTitle: string;
      noGrammarMistakes: string;
      sessionCompleteEncouragement: string;
    };
    report: {
      taskCompletion: string;
      grammar: string;
      noRecurringMistakes: string;
      vocabulary: string;
      range: string;
      notes: string;
      pronunciation: string;
      overall: string;
      fluency: string;
      pace: string;
      repeatedMistakes: string;
      noRepeatedMistakes: string;
      fillerWords: string;
      examReadiness: string;
      examReadinessDescription: string;
      strengths: string;
      weaknesses: string;
      suggestions: string;
      whyWrong: string;
      howToFix: string;
      betterExample: string;
      howToAvoid: string;
      noneNoted: string;
    };
  };

  writing: {
    pageTitle: string;
    pageDescription: string;
    expectedStructure: string;
    yourResponse: string;
    aiFeedbackLabel: string;
    responsePlaceholder: string;
    wordsUnit: string;
    evaluating: string;
    submitForEvaluation: string;
    evaluationFailed: string;
    taskCompletion: string;
    addressedPrompt: string;
    respectedFormat: string;
    structure: string;
    introduction: string;
    mainIdeas: string;
    conclusion: string;
    conclusionNotRequired: string;
    languageAccuracy: string;
    noGrammarMistakes: string;
    vocabularyTitle: string;
    wordChoice: string;
    variety: string;
    levelAppropriateness: string;
    examReadiness: string;
    examReadinessDescription: string;
    strengths: string;
    weaknesses: string;
    improvementTips: string;
    noneNoted: string;
    aiEvaluationTitle: string;
    aiEvaluationDescription: string;
  };

  quiz: {
    pageTitle: string;
    pageDescription: string;
    wordsToReview: (n: number) => string;
    basedOnVocabulary: string;
    progressLabel: string;
    questionBadge: (n: number) => string;
    comingSoonMessage: string;
    submitQuiz: string;
  };

  progress: {
    pageTitle: string;
    pageDescription: string;
    wordsLearned: string;
    quizzesCompleted: string;
    speakingSessions: string;
    writingSessions: string;
    currentStreak: string;
    currentStreakDescription: string;
    daysUnit: string;
    estimatedExamReadiness: string;
    estimatedExamReadinessDescription: string;
    readinessEmptyState: string;
    weeklyActivity: string;
    weeklyActivityDescription: string;
    skillBreakdown: string;
    skillBreakdownDescription: string;
    writingLabel: string;
    speakingLabel: string;
    sessionsCount: (n: number) => string;
    noWritingSessions: string;
    noSpeakingSessions: string;
    learningHistory: string;
    learningHistoryDescription: string;
    historyEmptyState: string;
    writingPracticeEntry: string;
    speakingPracticeEntry: string;
  };

  profile: {
    pageTitle: string;
    pageDescription: string;
    track: (examName: string) => string;
    targetLevel: (level: string) => string;
    personalInformation: string;
    personalInformationDescription: string;
    firstName: string;
    lastName: string;
    email: string;
    saveChanges: string;
    changesSaved: string;
    takePhoto: string;
    chooseFromLibrary: string;
  };

  settings: {
    pageTitle: string;
    pageDescription: string;
    account: string;
    accountDescription: (appName: string) => string;
    email: string;
    dailyGoal: string;
    dailyGoalDescription: string;
    minutesPerDay: string;
    saveGoal: string;
    exam: string;
    examDescription: string;
    selected: string;
    available: string;
    comingSoon: string;
    notifications: string;
    notificationsDescription: string;
    dangerZone: string;
    dangerZoneDescription: string;
    deleteAccount: string;
  };

  auth: {
    login: {
      title: string;
      description: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      submit: string;
      noAccount: string;
      createOne: string;
      forgotPasswordLink: string;
    };
    register: {
      title: string;
      description: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      submit: string;
      haveAccount: string;
      logIn: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      email: string;
      emailPlaceholder: string;
      submit: string;
      backToLogin: string;
      notFoundError: string;
      simulatedNoticeTitle: string;
      simulatedNoticeDescription: string;
      resetLinkLabel: string;
      continueButton: string;
    };
    resetPassword: {
      title: string;
      description: string;
      newPassword: string;
      newPasswordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      submit: string;
      invalidTokenError: string;
      expiredTokenError: string;
      success: string;
      goToLogin: string;
    };
  };

  onboarding: {
    stepLabel: (step: number, total: number) => string;
    steps: { title: string; description: string }[];
    back: string;
    continueButton: string;
    getStarted: string;
    comingSoon: string;
    examLanguageNames: Record<string, string>;
    examDateLabel: string;
    notSureYet: string;
    minPerDayUnit: string;
    customGoalLabel: string;
    reviewExam: string;
    reviewLevel: string;
    reviewExamDate: string;
    reviewDailyGoalLabel: string;
    reviewDailyGoal: (n: number) => string;
    notSetYet: string;
  };
}

export const TRANSLATIONS: Record<Language, Dictionary> = {
  en: {
    weekdaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],

    common: {
      cancel: "Cancel",
      save: "Save",
      back: "Back",
      continueButton: "Continue",
      comingSoon: "Coming soon",
      notSetYet: "Not set yet",
      somethingWentWrong: "Something went wrong",
      selectLanguage: "Select language",
      close: "Close",
      closeMenu: "Close menu",
      showPassword: "Show password",
      hidePassword: "Hide password",
      duplicateEmailError: "This email is already registered.",
      passwordTooShortError: "Password must be at least 8 characters.",
      passwordsDoNotMatchError: "Passwords do not match.",
      invalidCredentials: "Incorrect email or password.",
    },

    topbar: {
      streak: (days) => `${days}-day streak`,
      ariaOpenMenu: "Open menu",
      ariaViewStreak: "View streak calendar",
      ariaOpenProfile: "Open profile menu",
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

    nav: {
      dashboard: "Dashboard",
      vocabulary: "Vocabulary",
      speakingPractice: "Speaking Practice",
      writingPractice: "Writing Practice",
      weeklyQuiz: "Weekly Quiz",
      progress: "Progress",
      profile: "Profile",
      settings: "Settings",
    },

    sidebar: {
      track: (examName) => `${examName} track`,
      logOut: "Log out",
    },

    notifications: {
      dailyReminder: {
        title: "Daily reminder",
        description: "A nudge if you haven't practiced yet today.",
      },
      weeklySummary: {
        title: "Weekly summary email",
        description: "A recap of your progress every Monday.",
      },
      productUpdates: {
        title: "Product updates",
        description: "News about new features and exams.",
      },
    },

    profileModal: {
      preferences: "Preferences",
      exam: "Exam",
      currentLevel: "Current level",
      studyGoal: "Study goal",
      minPerDay: (n) => `${n} min/day`,
      account: "Account",
      profileLink: "Profile",
      settingsLink: "Settings",
      changePassword: "Change password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      savePassword: "Save password",
      wrongCurrentPasswordError: "Current password is incorrect.",
      passwordUpdated: "Password updated.",
      notificationsLink: "Notifications",
      dangerZone: "Danger zone",
      logOut: "Log out",
      deleteAccount: "Delete account",
    },

    logoutModal: {
      title: "Log out?",
      description: "You'll need to sign back in to access your dashboard.",
      reasonLabel: "What made you decide to leave today?",
      reasonOptional: "(optional)",
      reasonPlaceholder: "Share any feedback...",
      cancel: "Cancel",
      confirm: "Log out",
    },

    deleteAccountModal: {
      title: "Delete your account?",
      description:
        "This permanently removes your profile, progress, and history from this device. This can't be undone.",
      cancel: "Cancel",
      confirm: "Delete account",
    },

    dashboard: {
      greeting: (firstName) => `Welcome back, ${firstName}`,
      greetingFirstTime: (firstName) => `Welcome, ${firstName}`,
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

    vocabulary: {
      pageTitle: "Word of the Day",
      pageDescription:
        "A personalized vocabulary pick for your level — with context on how (and how not) to use it.",
      useItWhen: "Use it when",
      avoidItWhen: "Avoid it when",
      exampleSentences: "Example sentences",
      yourTurn: "Your turn",
      yourTurnDescription: (word) => `Write your own sentence using "${word}".`,
      sentencePlaceholder: (word) => `Write a sentence with "${word}"...`,
      getAiFeedback: "Get AI Feedback",
      aiFeedback: "AI Feedback",
      aiFeedbackDescription: "Examiner-style feedback on your sentence will appear here.",
      aiFeedbackEmptyState:
        "This is where personalized AI feedback will be shown once the feedback engine is connected.",
      yourVocabulary: "Your vocabulary",
      yourVocabularyDescription:
        "Words you've learned recently. Review them all in the Weekly Quiz.",
      masteryLabels: { new: "New", learning: "Learning", mastered: "Mastered" },
    },

    speaking: {
      pageTitle: "Speaking Practice",
      pageDescription:
        "Practice the official DELF speaking format for your level, with instant AI feedback.",
      reportGenerationFailed: "Report generation failed",
      evaluationFailed: "Evaluation failed",
      nextQuestion: "Next question",
      finishSeeReport: "Finish & see report",
      compilingReport: "Compiling your examiner report...",
      examinerReport: "Examiner Report",
      modeLive: "AI Live Examiner",
      modeWritten: "Written Speaking Practice",
      practiceAgain: "Practice again",
      modeSelect: {
        aiLiveExaminerTitle: "AI Live Examiner",
        aiLiveExaminerDescription:
          "A full exam simulation: the AI asks each question in order, gives brief feedback, and moves on — just like the real thing.",
        startSimulation: "Start exam simulation",
        writtenTitle: "Written Speaking Practice",
        writtenDescription:
          "Go at your own pace: answer one question at a time and get full feedback immediately after each one.",
        startPractice: "Start practice",
      },
      questionProgress: (current, total, part) => `Question ${current} of ${total} · ${part}`,
      minutesUnit: (n) => `~${n} min`,
      yourAnswer: "Your Answer",
      speakYourAnswer: "Answer using your voice — tap the microphone to start.",
      tapToSpeak: "Tap to speak",
      listening: "Listening...",
      stopRecording: "Stop recording",
      micNotSupportedError: "Voice input isn't supported in this browser. Please use Chrome or Edge.",
      micPermissionDeniedError: "Microphone access was denied. Please allow microphone access and try again.",
      noSpeechDetectedError: "No speech was detected. Please try again.",
      repeatQuestion: "Repeat question",
      analyzing: "Analyzing...",
      examinerFeedback: "Examiner feedback",
      answeredQuestion: "Answered the question",
      needsMoreDevelopment: "Needs more development",
      generatingQuestions: "Generating your questions...",
      startExam: "Start Exam",
      noPrepTime: "None",
      exitExam: "Exit Exam",
      exitExamConfirmTitle: "Are you sure you want to exit the exam?",
      exitExamConfirmDescription: "Your progress in this session won't be saved.",
      exitExamConfirmCancel: "Cancel",
      exitExamConfirmYes: "Yes, exit",
      youSpokeFor: (min, sec) =>
        min > 0 ? `You spoke for ${min} min ${sec} sec.` : `You spoke for ${sec} seconds.`,
      prepTimeLabel: "Preparation time",
      estimatedDurationLabel: "Estimated duration",
      numberOfPartsLabel: "Speaking parts",
      preparingTitle: "Preparation time",
      preparingDescription: "Use this time to think about what you'll say — the exam starts when the timer ends, or whenever you're ready.",
      startSpeakingNow: "I'm ready — start speaking now",
      chooseTopic: "Choose one of the two topics below to begin the discussion.",
      selectTopic: "Select this topic",
      showTranslation: "Show translation",
      hideTranslation: "Hide translation",
      tips: {
        title: "Speaking Tips",
        beSpontaneous: "Be spontaneous. Speak naturally.",
        practiceMockExams: "Practice mock exams under real exam conditions.",
        dontBeAfraid: "Don't be afraid to speak French.",
        practiceWithNatives: "Practice with native speakers whenever possible.",
        practiceConsistently: "Practice consistently.",
      },
      feedback: {
        taskCompletionLabel: "Task completion",
        coherenceLabel: "Coherence",
        pronunciationLabel: "Pronunciation",
        fluencyLabel: "Fluency",
        vocabularyLabel: "Vocabulary",
        whyWrong: "Why it's wrong",
        howToFix: "How to fix it",
        betterExample: "Better example",
        howToAvoid: "How to avoid this next time",
        sentenceVarietyLabel: "Sentence variety",
        naturalnessLabel: "Naturalness of expression",
        answerStructureLabel: "Answer structure",
        mispronuncedWordsTitle: "Watch your pronunciation on these words",
        playPronunciation: "Play correct pronunciation",
        strengthsTitle: "Strengths",
        areasForImprovementTitle: "Areas for Improvement",
        suggestionsTitle: "Suggested Improvements",
        improvedAnswerTitle: "Improved Version of Your Answer",
        coachingTipTitle: "Coaching Tip",
        noGrammarMistakes: "No grammar mistakes detected in this answer.",
        sessionCompleteEncouragement:
          "Excellent. You have completed all speaking tasks. Now let's review your overall performance and generate your final DELF report.",
      },
      report: {
        taskCompletion: "Task Completion",
        grammar: "Grammar",
        noRecurringMistakes: "No recurring grammar mistakes found.",
        vocabulary: "Vocabulary",
        range: "Range",
        notes: "Notes",
        pronunciation: "Pronunciation",
        overall: "Overall",
        fluency: "Fluency",
        pace: "Pace",
        repeatedMistakes: "Repeated Mistakes",
        noRepeatedMistakes: "No mistake appeared more than once — good consistency.",
        fillerWords: "Filler Words",
        examReadiness: "Exam Readiness",
        examReadinessDescription: "Estimated DELF Production Orale score for this session.",
        strengths: "Strengths",
        weaknesses: "Weaknesses",
        suggestions: "Suggestions",
        noneNoted: "None noted.",
        whyWrong: "Why it's wrong",
        howToFix: "How to fix it",
        betterExample: "Better example",
        howToAvoid: "How to avoid this",
      },
    },

    writing: {
      pageTitle: "Writing Practice",
      pageDescription:
        "Draft a response to an exam-style prompt for your level and get AI feedback structured like official DELF scoring.",
      expectedStructure: "Expected structure",
      yourResponse: "1. Your response",
      aiFeedbackLabel: "AI feedback:",
      responsePlaceholder: "Write your response here...",
      wordsUnit: "words",
      evaluating: "Evaluating...",
      submitForEvaluation: "Submit for Evaluation",
      evaluationFailed: "Evaluation failed",
      taskCompletion: "Task Completion",
      addressedPrompt: "Addressed the prompt",
      respectedFormat: "Respected the format",
      structure: "Structure",
      introduction: "Introduction",
      mainIdeas: "Main ideas",
      conclusion: "Conclusion",
      conclusionNotRequired: "Conclusion (not required)",
      languageAccuracy: "Language Accuracy",
      noGrammarMistakes: "No grammar mistakes found.",
      vocabularyTitle: "Vocabulary",
      wordChoice: "Word choice",
      variety: "Variety",
      levelAppropriateness: "Level appropriateness",
      examReadiness: "Exam Readiness",
      examReadinessDescription: "Estimated DELF Production Écrite score for this response.",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      improvementTips: "Improvement tips",
      noneNoted: "None noted.",
      aiEvaluationTitle: "AI Evaluation",
      aiEvaluationDescription:
        "Submit your response to get feedback on task completion, structure, language accuracy, vocabulary, and estimated DELF score.",
    },

    quiz: {
      pageTitle: "Weekly Quiz",
      pageDescription: "Review the vocabulary you've learned this week and reinforce your memory.",
      wordsToReview: (n) => `${n} words to review`,
      basedOnVocabulary: "Based on your vocabulary from this week",
      progressLabel: "Progress",
      questionBadge: (n) => `Question ${n}`,
      comingSoonMessage: "Quiz scoring and review will be enabled once the assessment engine is connected.",
      submitQuiz: "Submit Quiz",
    },

    progress: {
      pageTitle: "Progress",
      pageDescription: "Track how your DELF preparation is coming along.",
      wordsLearned: "Words learned",
      quizzesCompleted: "Quizzes completed",
      speakingSessions: "Speaking sessions",
      writingSessions: "Writing sessions",
      currentStreak: "Current streak",
      currentStreakDescription: "Consecutive days of practice — don't break the chain.",
      daysUnit: "days",
      estimatedExamReadiness: "Estimated exam readiness",
      estimatedExamReadinessDescription: "Average AI-evaluated score across your writing and speaking sessions.",
      readinessEmptyState: "Complete a Writing or Speaking session to see your readiness estimate.",
      weeklyActivity: "Weekly activity",
      weeklyActivityDescription: "Sessions completed over the last 7 days.",
      skillBreakdown: "Skill breakdown",
      skillBreakdownDescription: "Exam readiness by skill, based on your session history.",
      writingLabel: "Writing",
      speakingLabel: "Speaking",
      sessionsCount: (n) => `${n} session${n === 1 ? "" : "s"}`,
      noWritingSessions: "No writing sessions yet.",
      noSpeakingSessions: "No speaking sessions yet.",
      learningHistory: "Learning history",
      learningHistoryDescription: "Your most recent completed sessions.",
      historyEmptyState: "No sessions yet — your history will appear here.",
      writingPracticeEntry: "Writing practice",
      speakingPracticeEntry: "Speaking practice",
    },

    profile: {
      pageTitle: "Profile",
      pageDescription: "Manage your personal information and exam preferences.",
      track: (examName) => `${examName} track`,
      targetLevel: (level) => `Target level ${level}`,
      personalInformation: "Personal information",
      personalInformationDescription:
        "This information is used to personalize your dashboard and feedback.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      saveChanges: "Save changes",
      changesSaved: "Changes saved.",
      takePhoto: "Take Photo",
      chooseFromLibrary: "Choose from Library",
    },

    settings: {
      pageTitle: "Settings",
      pageDescription: "Manage your account, exam, and notification preferences.",
      account: "Account",
      accountDescription: (appName) => `Your login email for ${appName}.`,
      email: "Email",
      dailyGoal: "Daily goal",
      dailyGoalDescription: "How many minutes per day you want to practice.",
      minutesPerDay: "Minutes per day",
      saveGoal: "Save goal",
      exam: "Exam",
      examDescription: "Choose which exam you're preparing for.",
      selected: "Selected",
      available: "Available",
      comingSoon: "Coming soon",
      notifications: "Notifications",
      notificationsDescription: "Choose what you want to be notified about.",
      dangerZone: "Danger zone",
      dangerZoneDescription: "Permanently delete your account and all data.",
      deleteAccount: "Delete account",
    },

    auth: {
      login: {
        title: "Welcome back",
        description: "Log in to continue your DELF preparation.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Password",
        passwordPlaceholder: "••••••••",
        submit: "Log in",
        noAccount: "Don't have an account?",
        createOne: "Create one",
        forgotPasswordLink: "Forgot password?",
      },
      register: {
        title: "Create your account",
        description: "Start your personalized DELF preparation in a minute.",
        firstName: "First name",
        firstNamePlaceholder: "Amina",
        lastName: "Last name",
        lastNamePlaceholder: "Haddad",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Password",
        passwordPlaceholder: "••••••••",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "••••••••",
        submit: "Create account",
        haveAccount: "Already have an account?",
        logIn: "Log in",
      },
      forgotPassword: {
        title: "Reset your password",
        description: "Enter your account email and we'll help you set a new password.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        submit: "Send reset instructions",
        backToLogin: "Back to log in",
        notFoundError: "No account found with that email.",
        simulatedNoticeTitle: "Demo mode — no email service connected",
        simulatedNoticeDescription:
          "This app has no email service configured, so instead of emailing you a reset link, it's shown right here.",
        resetLinkLabel: "Your reset link",
        continueButton: "Continue to reset password",
      },
      resetPassword: {
        title: "Set a new password",
        description: "Choose a new password for your account.",
        newPassword: "New password",
        newPasswordPlaceholder: "••••••••",
        confirmPassword: "Confirm new password",
        confirmPasswordPlaceholder: "••••••••",
        submit: "Save new password",
        invalidTokenError: "This reset link is invalid.",
        expiredTokenError: "This reset link has expired. Request a new one.",
        success: "Password updated. You can now log in.",
        goToLogin: "Go to log in",
      },
    },

    onboarding: {
      stepLabel: (step, total) => `Step ${step} of ${total}`,
      steps: [
        {
          title: "Which exam are you preparing for?",
          description: "We'll tailor your dashboard and exercises to this exam.",
        },
        {
          title: "What's your current level?",
          description: "Be honest — you can always adjust this later in Settings.",
        },
        {
          title: "When is your exam?",
          description: "We'll use this to help pace your study plan.",
        },
        {
          title: "What's your daily study goal?",
          description: "A realistic daily target you can stick to.",
        },
        {
          title: "You're all set",
          description: "Review your answers before we build your dashboard.",
        },
      ],
      back: "Back",
      continueButton: "Continue",
      getStarted: "Get started",
      comingSoon: "Coming soon",
      examLanguageNames: { French: "French", English: "English", Korean: "Korean", Chinese: "Chinese" },
      examDateLabel: "Exam date",
      notSureYet: "Not sure yet",
      minPerDayUnit: "min/day",
      customGoalLabel: "Or enter a custom goal (minutes)",
      reviewExam: "Exam",
      reviewLevel: "Level",
      reviewExamDate: "Exam date",
      reviewDailyGoalLabel: "Daily goal",
      reviewDailyGoal: (n) => `${n} min / day`,
      notSetYet: "Not set yet",
    },
  },

  ru: {
    weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],

    common: {
      cancel: "Отмена",
      save: "Сохранить",
      back: "Назад",
      continueButton: "Продолжить",
      comingSoon: "Скоро",
      notSetYet: "Пока не задано",
      somethingWentWrong: "Что-то пошло не так",
      selectLanguage: "Выбрать язык",
      close: "Закрыть",
      closeMenu: "Закрыть меню",
      showPassword: "Показать пароль",
      hidePassword: "Скрыть пароль",
      duplicateEmailError: "Этот email уже зарегистрирован.",
      passwordTooShortError: "Пароль должен содержать не менее 8 символов.",
      passwordsDoNotMatchError: "Пароли не совпадают.",
      invalidCredentials: "Неверный email или пароль.",
    },

    topbar: {
      streak: (days) => `Серия: ${days} дн.`,
      ariaOpenMenu: "Открыть меню",
      ariaViewStreak: "Посмотреть календарь серии",
      ariaOpenProfile: "Открыть меню профиля",
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

    nav: {
      dashboard: "Главная",
      vocabulary: "Словарь",
      speakingPractice: "Практика говорения",
      writingPractice: "Практика письма",
      weeklyQuiz: "Еженедельный тест",
      progress: "Прогресс",
      profile: "Профиль",
      settings: "Настройки",
    },

    sidebar: {
      track: (examName) => `Курс ${examName}`,
      logOut: "Выйти",
    },

    notifications: {
      dailyReminder: {
        title: "Ежедневное напоминание",
        description: "Напомним, если вы ещё не позанимались сегодня.",
      },
      weeklySummary: {
        title: "Еженедельная сводка на почту",
        description: "Отчёт о вашем прогрессе каждый понедельник.",
      },
      productUpdates: {
        title: "Обновления продукта",
        description: "Новости о новых функциях и экзаменах.",
      },
    },

    profileModal: {
      preferences: "Настройки",
      exam: "Экзамен",
      currentLevel: "Текущий уровень",
      studyGoal: "Цель занятий",
      minPerDay: (n) => `${n} мин/день`,
      account: "Аккаунт",
      profileLink: "Профиль",
      settingsLink: "Настройки",
      changePassword: "Изменить пароль",
      currentPassword: "Текущий пароль",
      newPassword: "Новый пароль",
      confirmNewPassword: "Подтвердите новый пароль",
      savePassword: "Сохранить пароль",
      wrongCurrentPasswordError: "Текущий пароль неверен.",
      passwordUpdated: "Пароль обновлён.",
      notificationsLink: "Уведомления",
      dangerZone: "Опасная зона",
      logOut: "Выйти",
      deleteAccount: "Удалить аккаунт",
    },

    logoutModal: {
      title: "Выйти из аккаунта?",
      description: "Чтобы снова попасть на панель управления, нужно будет войти заново.",
      reasonLabel: "Что заставило вас уйти сегодня?",
      reasonOptional: "(необязательно)",
      reasonPlaceholder: "Поделитесь своим мнением...",
      cancel: "Отмена",
      confirm: "Выйти",
    },

    deleteAccountModal: {
      title: "Удалить аккаунт?",
      description:
        "Это навсегда удалит ваш профиль, прогресс и историю с этого устройства. Отменить это действие нельзя.",
      cancel: "Отмена",
      confirm: "Удалить аккаунт",
    },

    dashboard: {
      greeting: (firstName) => `С возвращением, ${firstName}`,
      greetingFirstTime: (firstName) => `Добро пожаловать, ${firstName}`,
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

    vocabulary: {
      pageTitle: "Слово дня",
      pageDescription:
        "Персональный выбор слова для вашего уровня — с контекстом, как его использовать (и как не стоит).",
      useItWhen: "Используйте, когда",
      avoidItWhen: "Не используйте, когда",
      exampleSentences: "Примеры предложений",
      yourTurn: "Ваша очередь",
      yourTurnDescription: (word) => `Составьте своё предложение со словом «${word}».`,
      sentencePlaceholder: (word) => `Напишите предложение со словом «${word}»...`,
      getAiFeedback: "Получить отзыв ИИ",
      aiFeedback: "Отзыв ИИ",
      aiFeedbackDescription: "Здесь появится отзыв на ваше предложение в стиле экзаменатора.",
      aiFeedbackEmptyState:
        "Здесь будет отображаться персонализированный отзыв ИИ, когда движок обратной связи будет подключён.",
      yourVocabulary: "Ваш словарь",
      yourVocabularyDescription:
        "Слова, которые вы недавно изучили. Повторите их все в еженедельном тесте.",
      masteryLabels: { new: "Новое", learning: "Изучается", mastered: "Освоено" },
    },

    speaking: {
      pageTitle: "Практика говорения",
      pageDescription:
        "Практикуйте официальный формат устной части DELF для вашего уровня с мгновенной обратной связью от ИИ.",
      reportGenerationFailed: "Не удалось сформировать отчёт",
      evaluationFailed: "Не удалось выполнить оценку",
      nextQuestion: "Следующий вопрос",
      finishSeeReport: "Завершить и посмотреть отчёт",
      compilingReport: "Формируем отчёт экзаменатора...",
      examinerReport: "Отчёт экзаменатора",
      modeLive: "ИИ-экзаменатор в реальном времени",
      modeWritten: "Письменная практика говорения",
      practiceAgain: "Практиковать снова",
      modeSelect: {
        aiLiveExaminerTitle: "ИИ-экзаменатор в реальном времени",
        aiLiveExaminerDescription:
          "Полная симуляция экзамена: ИИ задаёт вопросы по порядку, даёт краткий отзыв и переходит дальше — совсем как на настоящем экзамене.",
        startSimulation: "Начать симуляцию экзамена",
        writtenTitle: "Письменная практика говорения",
        writtenDescription:
          "Занимайтесь в своём темпе: отвечайте на один вопрос за раз и получайте полный отзыв сразу после каждого.",
        startPractice: "Начать практику",
      },
      questionProgress: (current, total, part) => `Вопрос ${current} из ${total} · ${part}`,
      minutesUnit: (n) => `~${n} мин`,
      yourAnswer: "Ваш ответ",
      speakYourAnswer: "Отвечайте голосом — нажмите на микрофон, чтобы начать.",
      tapToSpeak: "Нажмите, чтобы говорить",
      listening: "Слушаю...",
      stopRecording: "Остановить запись",
      micNotSupportedError: "Голосовой ввод не поддерживается в этом браузере. Используйте Chrome или Edge.",
      micPermissionDeniedError: "Доступ к микрофону отклонён. Разрешите доступ к микрофону и попробуйте снова.",
      noSpeechDetectedError: "Речь не обнаружена. Попробуйте ещё раз.",
      repeatQuestion: "Повторить вопрос",
      analyzing: "Анализируем...",
      examinerFeedback: "Отзыв экзаменатора",
      answeredQuestion: "Ответ по существу",
      needsMoreDevelopment: "Нужно развить ответ",
      generatingQuestions: "Генерируем ваши вопросы...",
      startExam: "Начать экзамен",
      noPrepTime: "Нет",
      exitExam: "Выйти из экзамена",
      exitExamConfirmTitle: "Вы уверены, что хотите выйти из экзамена?",
      exitExamConfirmDescription: "Прогресс в этой сессии не будет сохранён.",
      exitExamConfirmCancel: "Отмена",
      exitExamConfirmYes: "Да, выйти",
      youSpokeFor: (min, sec) =>
        min > 0 ? `Вы говорили ${min} мин ${sec} сек.` : `Вы говорили ${sec} сек.`,
      prepTimeLabel: "Время подготовки",
      estimatedDurationLabel: "Примерная длительность",
      numberOfPartsLabel: "Части экзамена",
      preparingTitle: "Время подготовки",
      preparingDescription: "Используйте это время, чтобы обдумать ответ — экзамен начнётся по окончании таймера или когда вы будете готовы.",
      startSpeakingNow: "Я готов(а) — начать говорить сейчас",
      chooseTopic: "Выберите одну из двух тем ниже, чтобы начать обсуждение.",
      selectTopic: "Выбрать эту тему",
      showTranslation: "Показать перевод",
      hideTranslation: "Скрыть перевод",
      tips: {
        title: "Советы по говорению",
        beSpontaneous: "Будьте спонтанны. Говорите естественно.",
        practiceMockExams: "Практикуйте пробные экзамены в условиях, приближенных к реальным.",
        dontBeAfraid: "Не бойтесь говорить по-французски.",
        practiceWithNatives: "Практикуйтесь с носителями языка, когда это возможно.",
        practiceConsistently: "Занимайтесь регулярно.",
      },
      feedback: {
        taskCompletionLabel: "Выполнение задания",
        coherenceLabel: "Связность",
        pronunciationLabel: "Произношение",
        fluencyLabel: "Беглость речи",
        vocabularyLabel: "Словарный запас",
        whyWrong: "Почему это ошибка",
        howToFix: "Как исправить",
        betterExample: "Лучший пример",
        howToAvoid: "Как избежать этого в следующий раз",
        sentenceVarietyLabel: "Разнообразие предложений",
        naturalnessLabel: "Естественность речи",
        answerStructureLabel: "Структура ответа",
        mispronuncedWordsTitle: "Обратите внимание на произношение этих слов",
        playPronunciation: "Воспроизвести правильное произношение",
        strengthsTitle: "Сильные стороны",
        areasForImprovementTitle: "Что нужно улучшить",
        suggestionsTitle: "Рекомендации",
        improvedAnswerTitle: "Улучшенная версия вашего ответа",
        coachingTipTitle: "Совет тренера",
        sessionCompleteEncouragement:
          "Отлично. Вы выполнили все задания устной части. Теперь давайте рассмотрим ваши результаты и сформируем итоговый отчёт DELF.",
        noGrammarMistakes: "В этом ответе грамматических ошибок не обнаружено.",
      },
      report: {
        taskCompletion: "Выполнение задания",
        grammar: "Грамматика",
        noRecurringMistakes: "Повторяющихся грамматических ошибок не найдено.",
        vocabulary: "Словарный запас",
        range: "Разнообразие",
        notes: "Заметки",
        pronunciation: "Произношение",
        overall: "В целом",
        fluency: "Беглость речи",
        pace: "Темп",
        repeatedMistakes: "Повторяющиеся ошибки",
        noRepeatedMistakes: "Ни одна ошибка не повторилась дважды — хорошая стабильность.",
        fillerWords: "Слова-паразиты",
        examReadiness: "Готовность к экзамену",
        examReadinessDescription: "Примерная оценка устной части DELF за эту сессию.",
        strengths: "Сильные стороны",
        weaknesses: "Слабые стороны",
        suggestions: "Рекомендации",
        noneNoted: "Не отмечено.",
        whyWrong: "Почему это ошибка",
        howToFix: "Как исправить",
        betterExample: "Лучший пример",
        howToAvoid: "Как этого избежать",
      },
    },

    writing: {
      pageTitle: "Практика письма",
      pageDescription:
        "Напишите ответ на экзаменационное задание для вашего уровня и получите отзыв ИИ в формате официального оценивания DELF.",
      expectedStructure: "Ожидаемая структура",
      yourResponse: "1. Ваш ответ",
      aiFeedbackLabel: "Отзыв ИИ:",
      responsePlaceholder: "Напишите ваш ответ здесь...",
      wordsUnit: "слов",
      evaluating: "Оцениваем...",
      submitForEvaluation: "Отправить на оценку",
      evaluationFailed: "Не удалось выполнить оценку",
      taskCompletion: "Выполнение задания",
      addressedPrompt: "Раскрыта тема задания",
      respectedFormat: "Соблюдён формат",
      structure: "Структура",
      introduction: "Введение",
      mainIdeas: "Основные идеи",
      conclusion: "Заключение",
      conclusionNotRequired: "Заключение (не обязательно)",
      languageAccuracy: "Грамотность",
      noGrammarMistakes: "Грамматических ошибок не найдено.",
      vocabularyTitle: "Словарный запас",
      wordChoice: "Выбор слов",
      variety: "Разнообразие",
      levelAppropriateness: "Соответствие уровню",
      examReadiness: "Готовность к экзамену",
      examReadinessDescription: "Примерная оценка письменной части DELF за этот ответ.",
      strengths: "Сильные стороны",
      weaknesses: "Слабые стороны",
      improvementTips: "Советы по улучшению",
      noneNoted: "Не отмечено.",
      aiEvaluationTitle: "Оценка ИИ",
      aiEvaluationDescription:
        "Отправьте ответ, чтобы получить отзыв о выполнении задания, структуре, грамотности, словарном запасе и примерной оценке DELF.",
    },

    quiz: {
      pageTitle: "Еженедельный тест",
      pageDescription: "Повторите слова, изученные на этой неделе, и закрепите их в памяти.",
      wordsToReview: (n) => `${n} слов на повторение`,
      basedOnVocabulary: "На основе вашего словаря за эту неделю",
      progressLabel: "Прогресс",
      questionBadge: (n) => `Вопрос ${n}`,
      comingSoonMessage: "Оценка и разбор теста будут доступны после подключения движка оценивания.",
      submitQuiz: "Отправить тест",
    },

    progress: {
      pageTitle: "Прогресс",
      pageDescription: "Отслеживайте, как продвигается ваша подготовка к DELF.",
      wordsLearned: "Слов изучено",
      quizzesCompleted: "Тестов пройдено",
      speakingSessions: "Сессий говорения",
      writingSessions: "Сессий письма",
      currentStreak: "Текущая серия",
      currentStreakDescription: "Дни занятий подряд — не разрывайте цепочку.",
      daysUnit: "дней",
      estimatedExamReadiness: "Готовность к экзамену",
      estimatedExamReadinessDescription: "Средняя оценка ИИ по вашим сессиям письма и говорения.",
      readinessEmptyState: "Завершите сессию письма или говорения, чтобы увидеть оценку готовности.",
      weeklyActivity: "Активность за неделю",
      weeklyActivityDescription: "Сессии, завершённые за последние 7 дней.",
      skillBreakdown: "По навыкам",
      skillBreakdownDescription: "Готовность к экзамену по навыкам, на основе истории занятий.",
      writingLabel: "Письмо",
      speakingLabel: "Говорение",
      sessionsCount: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return `${n} сессия`;
        if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${n} сессии`;
        return `${n} сессий`;
      },
      noWritingSessions: "Пока нет сессий письма.",
      noSpeakingSessions: "Пока нет сессий говорения.",
      learningHistory: "История занятий",
      learningHistoryDescription: "Ваши последние завершённые сессии.",
      historyEmptyState: "Пока нет сессий — здесь появится ваша история.",
      writingPracticeEntry: "Практика письма",
      speakingPracticeEntry: "Практика говорения",
    },

    profile: {
      pageTitle: "Профиль",
      pageDescription: "Управляйте личной информацией и настройками экзамена.",
      track: (examName) => `Курс ${examName}`,
      targetLevel: (level) => `Целевой уровень ${level}`,
      personalInformation: "Личная информация",
      personalInformationDescription:
        "Эта информация используется для персонализации панели управления и отзывов.",
      firstName: "Имя",
      lastName: "Фамилия",
      email: "Email",
      saveChanges: "Сохранить изменения",
      changesSaved: "Изменения сохранены.",
      takePhoto: "Сделать фото",
      chooseFromLibrary: "Выбрать из галереи",
    },

    settings: {
      pageTitle: "Настройки",
      pageDescription: "Управляйте аккаунтом, экзаменом и настройками уведомлений.",
      account: "Аккаунт",
      accountDescription: (appName) => `Ваш email для входа в ${appName}.`,
      email: "Email",
      dailyGoal: "Дневная цель",
      dailyGoalDescription: "Сколько минут в день вы хотите заниматься.",
      minutesPerDay: "Минут в день",
      saveGoal: "Сохранить цель",
      exam: "Экзамен",
      examDescription: "Выберите экзамен, к которому вы готовитесь.",
      selected: "Выбрано",
      available: "Доступно",
      comingSoon: "Скоро",
      notifications: "Уведомления",
      notificationsDescription: "Выберите, о чём вы хотите получать уведомления.",
      dangerZone: "Опасная зона",
      dangerZoneDescription: "Навсегда удалить ваш аккаунт и все данные.",
      deleteAccount: "Удалить аккаунт",
    },

    auth: {
      login: {
        title: "С возвращением",
        description: "Войдите, чтобы продолжить подготовку к DELF.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Пароль",
        passwordPlaceholder: "••••••••",
        submit: "Войти",
        noAccount: "Нет аккаунта?",
        createOne: "Создать",
        forgotPasswordLink: "Забыли пароль?",
      },
      register: {
        title: "Создайте аккаунт",
        description: "Начните персонализированную подготовку к DELF за минуту.",
        firstName: "Имя",
        firstNamePlaceholder: "Амина",
        lastName: "Фамилия",
        lastNamePlaceholder: "Хаддад",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Пароль",
        passwordPlaceholder: "••••••••",
        confirmPassword: "Подтвердите пароль",
        confirmPasswordPlaceholder: "••••••••",
        submit: "Создать аккаунт",
        haveAccount: "Уже есть аккаунт?",
        logIn: "Войти",
      },
      forgotPassword: {
        title: "Восстановление пароля",
        description: "Введите email вашего аккаунта, и мы поможем задать новый пароль.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        submit: "Отправить инструкции",
        backToLogin: "Назад ко входу",
        notFoundError: "Аккаунт с таким email не найден.",
        simulatedNoticeTitle: "Демо-режим — почтовый сервис не подключён",
        simulatedNoticeDescription:
          "В этом приложении не настроен почтовый сервис, поэтому вместо письма со ссылкой она показана прямо здесь.",
        resetLinkLabel: "Ваша ссылка для сброса пароля",
        continueButton: "Перейти к смене пароля",
      },
      resetPassword: {
        title: "Новый пароль",
        description: "Задайте новый пароль для вашего аккаунта.",
        newPassword: "Новый пароль",
        newPasswordPlaceholder: "••••••••",
        confirmPassword: "Подтвердите новый пароль",
        confirmPasswordPlaceholder: "••••••••",
        submit: "Сохранить новый пароль",
        invalidTokenError: "Эта ссылка недействительна.",
        expiredTokenError: "Срок действия ссылки истёк. Запросите новую.",
        success: "Пароль обновлён. Теперь вы можете войти.",
        goToLogin: "Перейти ко входу",
      },
    },

    onboarding: {
      stepLabel: (step, total) => `Шаг ${step} из ${total}`,
      steps: [
        {
          title: "К какому экзамену вы готовитесь?",
          description: "Мы настроим вашу панель управления и упражнения под этот экзамен.",
        },
        {
          title: "Какой у вас текущий уровень?",
          description: "Будьте честны — вы всегда сможете изменить это позже в Настройках.",
        },
        {
          title: "Когда у вас экзамен?",
          description: "Это поможет спланировать темп ваших занятий.",
        },
        {
          title: "Какова ваша дневная цель занятий?",
          description: "Реалистичная ежедневная цель, которой вы сможете придерживаться.",
        },
        {
          title: "Всё готово",
          description: "Проверьте свои ответы перед тем, как мы создадим вашу панель управления.",
        },
      ],
      back: "Назад",
      continueButton: "Продолжить",
      getStarted: "Начать",
      comingSoon: "Скоро",
      examLanguageNames: { French: "Французский", English: "Английский", Korean: "Корейский", Chinese: "Китайский" },
      examDateLabel: "Дата экзамена",
      notSureYet: "Пока не знаю",
      minPerDayUnit: "мин/день",
      customGoalLabel: "Или укажите свою цель (в минутах)",
      reviewExam: "Экзамен",
      reviewLevel: "Уровень",
      reviewExamDate: "Дата экзамена",
      reviewDailyGoalLabel: "Дневная цель",
      reviewDailyGoal: (n) => `${n} мин / день`,
      notSetYet: "Пока не задано",
    },
  },

  kz: {
    weekdaysShort: ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сн"],

    common: {
      cancel: "Бас тарту",
      save: "Сақтау",
      back: "Артқа",
      continueButton: "Жалғастыру",
      comingSoon: "Жақында",
      notSetYet: "Әлі белгіленбеген",
      somethingWentWrong: "Бірдеңе дұрыс болмады",
      selectLanguage: "Тілді таңдау",
      close: "Жабу",
      closeMenu: "Мәзірді жабу",
      showPassword: "Құпия сөзді көрсету",
      hidePassword: "Құпия сөзді жасыру",
      duplicateEmailError: "Бұл email бұрын тіркелген.",
      passwordTooShortError: "Құпия сөз кемінде 8 таңбадан тұруы керек.",
      passwordsDoNotMatchError: "Құпия сөздер сәйкес келмейді.",
      invalidCredentials: "Email немесе құпия сөз қате.",
    },

    topbar: {
      streak: (days) => `${days} күндік серия`,
      ariaOpenMenu: "Мәзірді ашу",
      ariaViewStreak: "Серия күнтізбесін көру",
      ariaOpenProfile: "Профиль мәзірін ашу",
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

    nav: {
      dashboard: "Басты бет",
      vocabulary: "Сөздік",
      speakingPractice: "Сөйлеу жаттығуы",
      writingPractice: "Жазу жаттығуы",
      weeklyQuiz: "Апталық тест",
      progress: "Прогресс",
      profile: "Профиль",
      settings: "Баптаулар",
    },

    sidebar: {
      track: (examName) => `${examName} бағыты`,
      logOut: "Шығу",
    },

    notifications: {
      dailyReminder: {
        title: "Күнделікті еске салу",
        description: "Бүгін әлі жаттықпасаңыз, еске саламыз.",
      },
      weeklySummary: {
        title: "Апталық қорытынды хат",
        description: "Әр дүйсенбі сайын прогресс қорытындысы.",
      },
      productUpdates: {
        title: "Өнім жаңалықтары",
        description: "Жаңа мүмкіндіктер мен емтихандар туралы жаңалықтар.",
      },
    },

    profileModal: {
      preferences: "Баптаулар",
      exam: "Емтихан",
      currentLevel: "Ағымдағы деңгей",
      studyGoal: "Жаттығу мақсаты",
      minPerDay: (n) => `${n} мин/күн`,
      account: "Аккаунт",
      profileLink: "Профиль",
      settingsLink: "Баптаулар",
      changePassword: "Құпия сөзді өзгерту",
      currentPassword: "Ағымдағы құпия сөз",
      newPassword: "Жаңа құпия сөз",
      confirmNewPassword: "Жаңа құпия сөзді растаңыз",
      savePassword: "Құпия сөзді сақтау",
      wrongCurrentPasswordError: "Ағымдағы құпия сөз қате.",
      passwordUpdated: "Құпия сөз жаңартылды.",
      notificationsLink: "Хабарландырулар",
      dangerZone: "Қауіпті аймақ",
      logOut: "Шығу",
      deleteAccount: "Аккаунтты жою",
    },

    logoutModal: {
      title: "Шығасыз ба?",
      description: "Бақылау тақтасына кіру үшін қайта кіруге тура келеді.",
      reasonLabel: "Бүгін кетуіңізге не себеп болды?",
      reasonOptional: "(міндетті емес)",
      reasonPlaceholder: "Пікіріңізбен бөлісіңіз...",
      cancel: "Бас тарту",
      confirm: "Шығу",
    },

    deleteAccountModal: {
      title: "Аккаунтыңызды жоясыз ба?",
      description:
        "Бұл әрекет профиліңізді, прогресіңізді және тарихыңызды осы құрылғыдан біржола өшіреді. Бұл әрекетті кері қайтару мүмкін емес.",
      cancel: "Бас тарту",
      confirm: "Аккаунтты жою",
    },

    dashboard: {
      greeting: (firstName) => `Қайта қош келдіңіз, ${firstName}`,
      greetingFirstTime: (firstName) => `Қош келдіңіз, ${firstName}`,
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

    vocabulary: {
      pageTitle: "Күн сөзі",
      pageDescription:
        "Сіздің деңгейіңізге таңдалған сөз — оны қалай қолдану керектігі (және қалай қолданбау керектігі) туралы контекстімен.",
      useItWhen: "Мына жағдайда қолданыңыз",
      avoidItWhen: "Мына жағдайда қолданбаңыз",
      exampleSentences: "Мысал сөйлемдер",
      yourTurn: "Сіздің кезегіңіз",
      yourTurnDescription: (word) => `«${word}» сөзін қолданып өз сөйлеміңізді құрастырыңыз.`,
      sentencePlaceholder: (word) => `«${word}» сөзімен сөйлем жазыңыз...`,
      getAiFeedback: "ЖИ пікірін алу",
      aiFeedback: "ЖИ пікірі",
      aiFeedbackDescription: "Сіздің сөйлеміңізге емтихан алушы стиліндегі пікір осында пайда болады.",
      aiFeedbackEmptyState:
        "Кері байланыс жүйесі қосылғаннан кейін осында жеке ЖИ пікірі көрсетіледі.",
      yourVocabulary: "Сіздің сөздігіңіз",
      yourVocabularyDescription:
        "Жақында үйренген сөздеріңіз. Барлығын апталық тестте қайталаңыз.",
      masteryLabels: { new: "Жаңа", learning: "Үйренуде", mastered: "Меңгерілді" },
    },

    speaking: {
      pageTitle: "Сөйлеу жаттығуы",
      pageDescription:
        "Деңгейіңізге сәйкес ресми DELF сөйлеу форматын лездік ЖИ кері байланысымен жаттығыңыз.",
      reportGenerationFailed: "Есеп жасалмады",
      evaluationFailed: "Бағалау сәтсіз аяқталды",
      nextQuestion: "Келесі сұрақ",
      finishSeeReport: "Аяқтап, есепті көру",
      compilingReport: "Емтихан алушының есебі дайындалуда...",
      examinerReport: "Емтихан алушының есебі",
      modeLive: "Тікелей ЖИ емтихан алушы",
      modeWritten: "Жазбаша сөйлеу жаттығуы",
      practiceAgain: "Қайта жаттығу",
      modeSelect: {
        aiLiveExaminerTitle: "Тікелей ЖИ емтихан алушы",
        aiLiveExaminerDescription:
          "Толық емтихан симуляциясы: ЖИ сұрақтарды кезекпен қояды, қысқа пікір беріп, келесіге өтеді — нақ шынайы емтихандай.",
        startSimulation: "Емтихан симуляциясын бастау",
        writtenTitle: "Жазбаша сөйлеу жаттығуы",
        writtenDescription:
          "Өз қарқыныңызбен жүріңіз: бір уақытта бір сұраққа жауап беріп, әр жауаптан кейін толық пікір алыңыз.",
        startPractice: "Жаттығуды бастау",
      },
      questionProgress: (current, total, part) => `${total} сұрақтың ${current}-і · ${part}`,
      minutesUnit: (n) => `~${n} мин`,
      yourAnswer: "Сіздің жауабыңыз",
      speakYourAnswer: "Дауысыңызбен жауап беріңіз — бастау үшін микрофонды басыңыз.",
      tapToSpeak: "Сөйлеу үшін басыңыз",
      listening: "Тыңдап тұрмын...",
      stopRecording: "Жазуды тоқтату",
      micNotSupportedError: "Бұл браузерде дауыстық енгізу қолдау таппайды. Chrome немесе Edge пайдаланыңыз.",
      micPermissionDeniedError: "Микрофонға қол жеткізу тыйым салынды. Микрофонға рұқсат беріп, қайта көріңіз.",
      noSpeechDetectedError: "Сөйлеу анықталмады. Қайта көріңіз.",
      repeatQuestion: "Сұрақты қайталау",
      analyzing: "Талдануда...",
      examinerFeedback: "Емтихан алушының пікірі",
      answeredQuestion: "Сұраққа мазмұнды жауап берілді",
      needsMoreDevelopment: "Жауапты толықтыру керек",
      generatingQuestions: "Сұрақтарыңыз дайындалуда...",
      startExam: "Емтиханды бастау",
      noPrepTime: "Жоқ",
      exitExam: "Емтиханнан шығу",
      exitExamConfirmTitle: "Емтиханнан шығғыңыз келетініне сенімдісіз бе?",
      exitExamConfirmDescription: "Осы сессиядағы прогресс сақталмайды.",
      exitExamConfirmCancel: "Бас тарту",
      exitExamConfirmYes: "Иә, шығу",
      youSpokeFor: (min, sec) =>
        min > 0 ? `Сіз ${min} мин ${sec} сек сөйледіңіз.` : `Сіз ${sec} сек сөйледіңіз.`,
      prepTimeLabel: "Дайындық уақыты",
      estimatedDurationLabel: "Болжамды ұзақтығы",
      numberOfPartsLabel: "Емтихан бөлімдері",
      preparingTitle: "Дайындық уақыты",
      preparingDescription: "Бұл уақытты не айтатыныңызды ойлауға пайдаланыңыз — таймер аяқталғанда немесе өзіңіз дайын болғанда емтихан басталады.",
      startSpeakingNow: "Мен дайынмын — қазір сөйлеуді бастау",
      chooseTopic: "Талқылауды бастау үшін төмендегі екі тақырыптың бірін таңдаңыз.",
      selectTopic: "Осы тақырыпты таңдау",
      showTranslation: "Аударманы көрсету",
      hideTranslation: "Аударманы жасыру",
      tips: {
        title: "Сөйлеу кеңестері",
        beSpontaneous: "Табиғи болыңыз. Еркін сөйлеңіз.",
        practiceMockExams: "Сынақ емтихандарын нақты емтихан жағдайында өткізіңіз.",
        dontBeAfraid: "Француз тілінде сөйлеуден қорықпаңыз.",
        practiceWithNatives: "Мүмкіндігінше ана тілінде сөйлейтіндермен жаттығыңыз.",
        practiceConsistently: "Тұрақты түрде жаттығыңыз.",
      },
      feedback: {
        taskCompletionLabel: "Тапсырманы орындау",
        coherenceLabel: "Байланыстылық",
        pronunciationLabel: "Айтылым",
        fluencyLabel: "Еркіндік",
        vocabularyLabel: "Сөздік қоры",
        whyWrong: "Неге бұл қате",
        howToFix: "Қалай түзетуге болады",
        betterExample: "Жақсырақ мысал",
        howToAvoid: "Келесі жолы бұдан қалай аулақ болу керек",
        sentenceVarietyLabel: "Сөйлем әртүрлілігі",
        naturalnessLabel: "Сөйлеудің табиғилығы",
        answerStructureLabel: "Жауап құрылымы",
        mispronuncedWordsTitle: "Осы сөздердің айтылымына назар аударыңыз",
        playPronunciation: "Дұрыс айтылымын ойнату",
        strengthsTitle: "Күшті жақтары",
        areasForImprovementTitle: "Жақсарту қажет тұстар",
        suggestionsTitle: "Ұсыныстар",
        improvedAnswerTitle: "Жауабыңыздың жақсартылған нұсқасы",
        coachingTipTitle: "Жаттықтырушы кеңесі",
        noGrammarMistakes: "Бұл жауапта грамматикалық қателер табылмады.",
        sessionCompleteEncouragement:
          "Керемет. Сіз барлық ауызша тапсырмаларды орындадыңыз. Енді жалпы нәтижеңізді қарап, түпкілікті DELF есебін жасайық.",
      },
      report: {
        taskCompletion: "Тапсырманы орындау",
        grammar: "Грамматика",
        noRecurringMistakes: "Қайталанатын грамматикалық қателер табылмады.",
        vocabulary: "Сөздік қоры",
        range: "Әртүрлілік",
        notes: "Ескертпелер",
        pronunciation: "Айтылым",
        overall: "Жалпы",
        fluency: "Еркіндік",
        pace: "Қарқын",
        repeatedMistakes: "Қайталанатын қателер",
        noRepeatedMistakes: "Ешбір қате екі рет қайталанбады — жақсы тұрақтылық.",
        fillerWords: "Қосымша сөздер",
        examReadiness: "Емтиханға дайындық",
        examReadinessDescription: "Осы сессия үшін DELF ауызша бөлімінің болжамды бағасы.",
        strengths: "Күшті жақтары",
        weaknesses: "Әлсіз жақтары",
        suggestions: "Ұсыныстар",
        noneNoted: "Ештеңе белгіленбеген.",
        whyWrong: "Неге бұл қате",
        howToFix: "Қалай түзетуге болады",
        betterExample: "Жақсырақ мысал",
        howToAvoid: "Мұны қалай болдырмауға болады",
      },
    },

    writing: {
      pageTitle: "Жазу жаттығуы",
      pageDescription:
        "Деңгейіңізге сәйкес емтихан үлгісіндегі тапсырмаға жауап жазып, ресми DELF бағалауы форматындағы ЖИ пікірін алыңыз.",
      expectedStructure: "Күтілетін құрылым",
      yourResponse: "1. Сіздің жауабыңыз",
      aiFeedbackLabel: "ЖИ пікірі:",
      responsePlaceholder: "Жауабыңызды осында жазыңыз...",
      wordsUnit: "сөз",
      evaluating: "Бағалануда...",
      submitForEvaluation: "Бағалауға жіберу",
      evaluationFailed: "Бағалау сәтсіз аяқталды",
      taskCompletion: "Тапсырманы орындау",
      addressedPrompt: "Тапсырма тақырыбы ашылды",
      respectedFormat: "Формат сақталды",
      structure: "Құрылым",
      introduction: "Кіріспе",
      mainIdeas: "Негізгі ойлар",
      conclusion: "Қорытынды",
      conclusionNotRequired: "Қорытынды (міндетті емес)",
      languageAccuracy: "Тіл дұрыстығы",
      noGrammarMistakes: "Грамматикалық қателер табылмады.",
      vocabularyTitle: "Сөздік қоры",
      wordChoice: "Сөз таңдау",
      variety: "Әртүрлілік",
      levelAppropriateness: "Деңгейге сәйкестік",
      examReadiness: "Емтиханға дайындық",
      examReadinessDescription: "Осы жауап үшін DELF жазбаша бөлімінің болжамды бағасы.",
      strengths: "Күшті жақтары",
      weaknesses: "Әлсіз жақтары",
      improvementTips: "Жақсарту кеңестері",
      noneNoted: "Ештеңе белгіленбеген.",
      aiEvaluationTitle: "ЖИ бағалауы",
      aiEvaluationDescription:
        "Тапсырманы орындау, құрылым, тіл дұрыстығы, сөздік қоры және болжамды DELF бағасы туралы пікір алу үшін жауабыңызды жіберіңіз.",
    },

    quiz: {
      pageTitle: "Апталық тест",
      pageDescription: "Осы аптада үйренген сөздерді қайталап, есте сақтауды бекітіңіз.",
      wordsToReview: (n) => `Қайталауға ${n} сөз`,
      basedOnVocabulary: "Осы аптадағы сөздік қорыңыз негізінде",
      progressLabel: "Прогресс",
      questionBadge: (n) => `${n}-сұрақ`,
      comingSoonMessage: "Тест бағалау және шолу бағалау жүйесі қосылғаннан кейін іске қосылады.",
      submitQuiz: "Тестті жіберу",
    },

    progress: {
      pageTitle: "Прогресс",
      pageDescription: "DELF дайындығыңыздың қалай өрлеп жатқанын қадағалаңыз.",
      wordsLearned: "Үйренген сөздер",
      quizzesCompleted: "Өткен тесттер",
      speakingSessions: "Сөйлеу сессиялары",
      writingSessions: "Жазу сессиялары",
      currentStreak: "Ағымдағы серия",
      currentStreakDescription: "Қатарынан жаттыққан күндер — тізбекті үзбеңіз.",
      daysUnit: "күн",
      estimatedExamReadiness: "Емтиханға дайындық деңгейі",
      estimatedExamReadinessDescription: "Жазу және сөйлеу сессияларыңыздың орташа ЖИ бағасы.",
      readinessEmptyState: "Дайындық деңгейін көру үшін жазу немесе сөйлеу сессиясын аяқтаңыз.",
      weeklyActivity: "Апталық белсенділік",
      weeklyActivityDescription: "Соңғы 7 күнде аяқталған сессиялар.",
      skillBreakdown: "Дағдылар бойынша",
      skillBreakdownDescription: "Жаттығу тарихыңыз негізінде дағдылар бойынша емтиханға дайындық.",
      writingLabel: "Жазу",
      speakingLabel: "Сөйлеу",
      sessionsCount: (n) => `${n} сессия`,
      noWritingSessions: "Әзірге жазу сессиялары жоқ.",
      noSpeakingSessions: "Әзірге сөйлеу сессиялары жоқ.",
      learningHistory: "Жаттығу тарихы",
      learningHistoryDescription: "Соңғы аяқталған сессияларыңыз.",
      historyEmptyState: "Әзірге сессиялар жоқ — тарихыңыз осында пайда болады.",
      writingPracticeEntry: "Жазу жаттығуы",
      speakingPracticeEntry: "Сөйлеу жаттығуы",
    },

    profile: {
      pageTitle: "Профиль",
      pageDescription: "Жеке ақпаратыңызды және емтихан баптауларын басқарыңыз.",
      track: (examName) => `${examName} бағыты`,
      targetLevel: (level) => `Мақсатты деңгей ${level}`,
      personalInformation: "Жеке ақпарат",
      personalInformationDescription:
        "Бұл ақпарат бақылау тақтаңыз бен кері байланысты жекелендіру үшін қолданылады.",
      firstName: "Аты",
      lastName: "Тегі",
      email: "Email",
      saveChanges: "Өзгерістерді сақтау",
      changesSaved: "Өзгерістер сақталды.",
      takePhoto: "Фотоға түсіру",
      chooseFromLibrary: "Кітапханадан таңдау",
    },

    settings: {
      pageTitle: "Баптаулар",
      pageDescription: "Аккаунтыңызды, емтиханды және хабарландыру баптауларын басқарыңыз.",
      account: "Аккаунт",
      accountDescription: (appName) => `${appName} жүйесіне кіру email-іңіз.`,
      email: "Email",
      dailyGoal: "Күндізгі мақсат",
      dailyGoalDescription: "Күніне қанша минут жаттығу керек екенін таңдаңыз.",
      minutesPerDay: "Күніне минут",
      saveGoal: "Мақсатты сақтау",
      exam: "Емтихан",
      examDescription: "Дайындалып жатқан емтиханыңызды таңдаңыз.",
      selected: "Таңдалды",
      available: "Қолжетімді",
      comingSoon: "Жақында",
      notifications: "Хабарландырулар",
      notificationsDescription: "Не туралы хабарландыру алғыңыз келетінін таңдаңыз.",
      dangerZone: "Қауіпті аймақ",
      dangerZoneDescription: "Аккаунтыңыз бен барлық деректерді біржола жою.",
      deleteAccount: "Аккаунтты жою",
    },

    auth: {
      login: {
        title: "Қайта қош келдіңіз",
        description: "DELF дайындығыңызды жалғастыру үшін кіріңіз.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Құпия сөз",
        passwordPlaceholder: "••••••••",
        submit: "Кіру",
        noAccount: "Аккаунтыңыз жоқ па?",
        createOne: "Жасау",
        forgotPasswordLink: "Құпия сөзді ұмыттыңыз ба?",
      },
      register: {
        title: "Аккаунт жасаңыз",
        description: "Жеке DELF дайындығыңызды бір минутта бастаңыз.",
        firstName: "Аты",
        firstNamePlaceholder: "Амина",
        lastName: "Тегі",
        lastNamePlaceholder: "Хаддад",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Құпия сөз",
        passwordPlaceholder: "••••••••",
        confirmPassword: "Құпия сөзді растаңыз",
        confirmPasswordPlaceholder: "••••••••",
        submit: "Аккаунт жасау",
        haveAccount: "Аккаунтыңыз бар ма?",
        logIn: "Кіру",
      },
      forgotPassword: {
        title: "Құпия сөзді қалпына келтіру",
        description: "Аккаунтыңыздың email мекенжайын енгізіңіз, біз жаңа құпия сөз орнатуға көмектесеміз.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        submit: "Нұсқауларды жіберу",
        backToLogin: "Кіруге оралу",
        notFoundError: "Бұл email-мен аккаунт табылмады.",
        simulatedNoticeTitle: "Демо режимі — пошта қызметі қосылмаған",
        simulatedNoticeDescription:
          "Бұл қосымшада пошта қызметі бапталмаған, сондықтан сілтемесі бар хат жіберудің орнына ол осында көрсетілген.",
        resetLinkLabel: "Құпия сөзді қалпына келтіру сілтемесі",
        continueButton: "Құпия сөзді өзгертуге өту",
      },
      resetPassword: {
        title: "Жаңа құпия сөз орнату",
        description: "Аккаунтыңыз үшін жаңа құпия сөз таңдаңыз.",
        newPassword: "Жаңа құпия сөз",
        newPasswordPlaceholder: "••••••••",
        confirmPassword: "Жаңа құпия сөзді растаңыз",
        confirmPasswordPlaceholder: "••••••••",
        submit: "Жаңа құпия сөзді сақтау",
        invalidTokenError: "Бұл сілтеме жарамсыз.",
        expiredTokenError: "Бұл сілтеменің мерзімі өтті. Жаңасын сұраңыз.",
        success: "Құпия сөз жаңартылды. Енді кіре аласыз.",
        goToLogin: "Кіруге өту",
      },
    },

    onboarding: {
      stepLabel: (step, total) => `${total} қадамның ${step}-і`,
      steps: [
        {
          title: "Қай емтиханға дайындалып жатырсыз?",
          description: "Бақылау тақтаңыз бен жаттығуларыңызды осы емтиханға бейімдейміз.",
        },
        {
          title: "Сіздің ағымдағы деңгейіңіз қандай?",
          description: "Шыншыл болыңыз — мұны кейін Баптауларда әрдайым өзгерте аласыз.",
        },
        {
          title: "Емтиханыңыз қашан?",
          description: "Бұл оқу жоспарыңыздың қарқынын жоспарлауға көмектеседі.",
        },
        {
          title: "Күндізгі жаттығу мақсатыңыз қандай?",
          description: "Ұстана алатын шынайы күндізгі мақсат.",
        },
        {
          title: "Бәрі дайын",
          description: "Бақылау тақтаңызды жасамас бұрын жауаптарыңызды тексеріңіз.",
        },
      ],
      back: "Артқа",
      continueButton: "Жалғастыру",
      getStarted: "Бастау",
      comingSoon: "Жақында",
      examLanguageNames: { French: "Французша", English: "Ағылшынша", Korean: "Корейше", Chinese: "Қытайша" },
      examDateLabel: "Емтихан күні",
      notSureYet: "Әлі білмеймін",
      minPerDayUnit: "мин/күн",
      customGoalLabel: "Немесе өз мақсатыңызды енгізіңіз (минутпен)",
      reviewExam: "Емтихан",
      reviewLevel: "Деңгей",
      reviewExamDate: "Емтихан күні",
      reviewDailyGoalLabel: "Күндізгі мақсат",
      reviewDailyGoal: (n) => `${n} мин / күн`,
      notSetYet: "Әлі белгіленбеген",
    },
  },
};
