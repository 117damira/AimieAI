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
    listening: string;
    speakingPractice: string;
    writingPractice: string;
    weeklyQuiz: string;
    progress: string;
    studyPlan: string;
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
    listening: {
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
      listeningSessions: string;
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
    aiFeedbackErrorGeneric: string;
    usedCorrectlyBadge: string;
    notUsedBadge: string;
    incorrectUsageBadge: string;
    noCorrectionsNeeded: string;
    mistakesLabel: string;
    correctedSentenceLabel: string;
    whyWrongLabel: string;
    naturalSuggestionLabel: string;
    explanationLabel: string;
    yourVocabulary: string;
    yourVocabularyDescription: string;
    yourVocabularyEmptyState: string;
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
    newTopic: string;
    taskCompletion: string;
    addressedPrompt: string;
    respectedFormat: string;
    missingElements: string;
    relevance: string;
    structure: string;
    introduction: string;
    mainIdeas: string;
    conclusion: string;
    conclusionNotRequired: string;
    coherence: string;
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
    improvedVersion: string;
    improvedVersionDescription: string;
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
    submitQuiz: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
    emptyStateCta: string;
    scoreSummary: (correct: number, total: number) => string;
    correctAnswerLabel: string;
    tryAgain: string;
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
      duplicateEmailNotice: string;
    };
    register: {
      title: string;
      description: string;
      // Step 1 — email
      emailStepDescription: string;
      continueButton: string;
      // Step 2 — verify
      verifyStepTitle: string;
      verifyStepDescription: (email: string) => string;
      codeLabel: string;
      codePlaceholder: string;
      verifyButton: string;
      resendCode: string;
      codeResent: string;
      devModeCodeNotice: (code: string) => string;
      invalidCodeError: string;
      // Step 3 — details
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      passwordRequirement: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      termsPrefix: string;
      termsAndConditions: string;
      termsMiddle: string;
      privacyPolicy: string;
      termsRequiredError: string;
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
      verifyStepTitle: string;
      verifyStepDescription: (email: string) => string;
      codeLabel: string;
      codePlaceholder: string;
      verifyButton: string;
      resendCode: string;
      codeResent: string;
      devModeCodeNotice: (code: string) => string;
      invalidCodeError: string;
      newPasswordStepTitle: string;
      newPasswordStepDescription: string;
      newPassword: string;
      newPasswordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      passwordRequirement: string;
      saveButton: string;
      successMessage: string;
      goToLogin: string;
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

  listening: {
    pageTitle: string;
    pageDescription: string;
    home: {
      currentLevel: string;
      duration: string;
      minutesUnit: string;
      recordings: string;
      recordingsUnit: string;
      maxRecordingLength: string;
      maxScore: string;
      minPassingScore: string;
    };
    modes: {
      fullExamTitle: string;
      fullExamDescription: string;
      startFullExam: string;
      practiceByPartTitle: string;
      practiceByPartDescription: string;
      startPractice: string;
      dailyChallengeTitle: string;
      dailyChallengeDescription: string;
      startDailyChallenge: string;
      completedTodayBadge: string;
    };
    player: {
      play: string;
      pause: string;
      replay: string;
      skipBack: string;
      skipForward: string;
      seekLabel: string;
      loadingVoice: string;
      unsupported: string;
    };
    session: {
      questionBadge: (n: number) => string;
      progressLabel: string;
      submit: string;
      backToModes: string;
      generating: string;
      previous: string;
      next: string;
      recordingLabel: (n: number, total: number) => string;
      selectAllThatApply: string;
    };
    results: {
      title: string;
      practiceScoreLabel: string;
      practiceGood: string;
      practiceNeedsWork: string;
      scoreLabel: string;
      percentageLabel: string;
      pass: string;
      needsImprovement: string;
      timeSpentLabel: string;
      accuracyLabel: string;
      viewFeedback: string;
      reviewAnswers: string;
      hideReview: string;
      newSession: string;
    };
    feedback: {
      title: string;
      overallPerformance: string;
      strongestSkills: string;
      weakestSkills: string;
      listeningAccuracy: string;
      understandingMainIdeas: string;
      understandingDetails: string;
      understandingNumbers: string;
      understandingNames: string;
      understandingDates: string;
      vocabularyComprehension: string;
      recommendations: string;
      estimatedDelfReadiness: string;
      noneNoted: string;
    };
    review: {
      title: string;
      yourAnswer: string;
      correctAnswer: string;
      whyCorrectQuestion: string;
      whereInRecording: string;
      keywords: string;
      whyCorrect: string;
      whyIncorrect: string;
      vocabulary: string;
      grammarPattern: string;
      strategy: string;
    };
    tips: {
      title: string;
      items: string[];
    };
  };

  studyPlan: {
    pageTitle: string;
    pageDescription: string;
    testDay: string;
    noExamDateTitle: string;
    noExamDateDescription: string;
    setExamDateLink: string;
    dailyPlanTitle: string;
    dailyPlanDescription: string;
    daysUntilExam: (n: number) => string;
    examTodayLabel: string;
    examPastLabel: string;
    moreTasksLabel: (n: number) => string;
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
      listening: "Listening",
      speakingPractice: "Speaking Practice",
      writingPractice: "Writing Practice",
      weeklyQuiz: "Weekly Quiz",
      progress: "Progress",
      studyPlan: "Study Plan",
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
      listening: {
        title: "Listening",
        description: "Practice DELF listening comprehension with original recordings.",
        cta: "Start listening",
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
        listeningSessions: "Listening sessions",
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
      aiFeedbackEmptyState: "Write a sentence and click \"Get AI Feedback\" to see how you did.",
      aiFeedbackErrorGeneric: "Couldn't evaluate your sentence right now — please try again.",
      usedCorrectlyBadge: "Correct usage",
      notUsedBadge: "Word not used",
      incorrectUsageBadge: "Incorrect usage",
      noCorrectionsNeeded: "No corrections needed.",
      mistakesLabel: "Mistakes",
      correctedSentenceLabel: "Corrected sentence",
      whyWrongLabel: "Why",
      naturalSuggestionLabel: "More natural",
      explanationLabel: "Explanation",
      yourVocabulary: "Your vocabulary",
      yourVocabularyDescription:
        "Words become Learning and Mastered as you actually practice them.",
      yourVocabularyEmptyState:
        "No words practiced yet — write a sentence above and get feedback to start tracking your progress.",
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
      newTopic: "New topic",
      taskCompletion: "Task Completion",
      addressedPrompt: "Addressed the prompt",
      respectedFormat: "Respected the format",
      missingElements: "What's missing",
      relevance: "Relevance",
      structure: "Structure",
      introduction: "Introduction",
      mainIdeas: "Main ideas",
      conclusion: "Conclusion",
      conclusionNotRequired: "Conclusion (not required)",
      coherence: "Coherence",
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
      improvedVersion: "Improved Version of Your Answer",
      improvedVersionDescription:
        "Your own ideas, with grammar corrected and missing structural parts filled in — nothing invented.",
      aiEvaluationTitle: "AI Evaluation",
      aiEvaluationDescription:
        "Submit your response to get feedback on task completion, relevance, structure, coherence, language accuracy, vocabulary, and estimated DELF score.",
    },

    quiz: {
      pageTitle: "Weekly Quiz",
      pageDescription: "Review the vocabulary you've learned this week and reinforce your memory.",
      wordsToReview: (n) => `${n} word${n === 1 ? "" : "s"} to review`,
      basedOnVocabulary: "Based on the vocabulary you've actually practiced",
      progressLabel: "Progress",
      questionBadge: (n) => `Question ${n}`,
      submitQuiz: "Submit Quiz",
      emptyStateTitle: "No vocabulary to review yet",
      emptyStateDescription: "Practice at least one word in Vocabulary to unlock your Weekly Quiz.",
      emptyStateCta: "Go to Vocabulary",
      scoreSummary: (correct, total) => `You got ${correct} out of ${total} correct.`,
      correctAnswerLabel: "Correct answer",
      tryAgain: "Try Again",
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
        duplicateEmailNotice: "That email is already registered — sign in below instead.",
      },
      register: {
        title: "Create your account",
        description: "Start your personalized DELF preparation in a minute.",
        emailStepDescription: "Enter your email to get started — we'll send a verification code.",
        continueButton: "Continue",
        verifyStepTitle: "Verify your email",
        verifyStepDescription: (email) => `Enter the 4-digit code we sent to ${email}.`,
        codeLabel: "Verification code",
        codePlaceholder: "0000",
        verifyButton: "Verify",
        resendCode: "Resend code",
        codeResent: "A new code was sent.",
        devModeCodeNotice: (code) =>
          `No email service is configured in this environment — here's your code for testing: ${code}`,
        invalidCodeError: "That code is incorrect or has expired.",
        firstName: "First name",
        firstNamePlaceholder: "",
        lastName: "Last name",
        lastNamePlaceholder: "",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Password",
        passwordPlaceholder: "••••••••",
        passwordRequirement: "Passwords must be 6–16 characters, containing at least 1 letter and 1 number.",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "••••••••",
        termsPrefix: "I agree to the",
        termsAndConditions: "Terms and Conditions",
        termsMiddle: "and",
        privacyPolicy: "Privacy Policy",
        termsRequiredError: "Please accept the Terms.",
        submit: "Create account",
        haveAccount: "Already have an account?",
        logIn: "Log in",
      },
      forgotPassword: {
        title: "Reset your password",
        description: "Enter your account email and we'll send you a verification code.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        submit: "Send code",
        backToLogin: "Back to log in",
        notFoundError: "No account found with that email.",
        verifyStepTitle: "Verify your email",
        verifyStepDescription: (email) => `Enter the 4-digit code we sent to ${email}.`,
        codeLabel: "Verification code",
        codePlaceholder: "0000",
        verifyButton: "Verify",
        resendCode: "Resend code",
        codeResent: "A new code was sent.",
        devModeCodeNotice: (code) =>
          `No email service is configured in this environment — here's your code for testing: ${code}`,
        invalidCodeError: "That code is incorrect or has expired.",
        newPasswordStepTitle: "Create a new password",
        newPasswordStepDescription: "Choose a new password for your account.",
        newPassword: "New password",
        newPasswordPlaceholder: "••••••••",
        confirmPassword: "Confirm new password",
        confirmPasswordPlaceholder: "••••••••",
        passwordRequirement: "Passwords must be 6–16 characters, containing at least 1 letter and 1 number.",
        saveButton: "Save new password",
        successMessage: "Password updated. You can now log in.",
        goToLogin: "Go to log in",
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
    listening: {
      pageTitle: "Listening",
      pageDescription: "Practice DELF Compréhension de l'Oral with original AI-generated recordings.",
      home: {
        currentLevel: "Current DELF Level",
        duration: "Listening duration",
        minutesUnit: "min",
        recordings: "Recordings",
        recordingsUnit: "recordings",
        maxRecordingLength: "Max recording length",
        maxScore: "Maximum score",
        minPassingScore: "Minimum passing score",
      },
      modes: {
        fullExamTitle: "Full DELF Listening Exam",
        fullExamDescription: "A complete simulation of the DELF listening section, timed and scored like the real exam.",
        startFullExam: "Start full exam",
        practiceByPartTitle: "Practice by Part",
        practiceByPartDescription: "Practice a single listening recording and its questions at your own pace.",
        startPractice: "Start practice",
        dailyChallengeTitle: "Daily Listening Challenge",
        dailyChallengeDescription: "A fresh challenge every day — every student at your level gets the same one today.",
        startDailyChallenge: "Start today's challenge",
        completedTodayBadge: "Completed today",
      },
      player: {
        play: "Play",
        pause: "Pause",
        replay: "Replay",
        skipBack: "Back 5 seconds",
        skipForward: "Forward 5 seconds",
        seekLabel: "Seek",
        loadingVoice: "Loading audio voice...",
        unsupported: "Audio playback isn't supported in this browser.",
      },
      session: {
        questionBadge: (n) => `Question ${n}`,
        progressLabel: "Progress",
        submit: "Submit",
        backToModes: "Back",
        generating: "Generating your listening exercise...",
        previous: "Previous",
        next: "Next",
        recordingLabel: (n, total) => `Recording ${n} of ${total}`,
        selectAllThatApply: "Select all that apply",
      },
      results: {
        title: "Results",
        practiceScoreLabel: "Practice score",
        practiceGood: "Good practice",
        practiceNeedsWork: "Keep practicing",
        scoreLabel: "Score",
        percentageLabel: "Percentage",
        pass: "Pass",
        needsImprovement: "Needs improvement",
        timeSpentLabel: "Time spent",
        accuracyLabel: "Accuracy",
        viewFeedback: "View feedback",
        reviewAnswers: "Review answers",
        hideReview: "Hide review",
        newSession: "New session",
      },
      feedback: {
        title: "AI Feedback",
        overallPerformance: "Overall performance",
        strongestSkills: "Strongest skills",
        weakestSkills: "Weakest skills",
        listeningAccuracy: "Listening accuracy",
        understandingMainIdeas: "Understanding main ideas",
        understandingDetails: "Understanding details",
        understandingNumbers: "Understanding numbers",
        understandingNames: "Understanding names",
        understandingDates: "Understanding dates",
        vocabularyComprehension: "Vocabulary comprehension",
        recommendations: "Recommendations",
        estimatedDelfReadiness: "Estimated DELF readiness",
        noneNoted: "None noted.",
      },
      review: {
        title: "Question Review",
        yourAnswer: "Your answer",
        correctAnswer: "Correct answer",
        whyCorrectQuestion: "Why is this answer correct?",
        whereInRecording: "Where in the recording",
        keywords: "Key words and expressions",
        whyCorrect: "Why this is correct",
        whyIncorrect: "Why the other options are wrong",
        vocabulary: "Important vocabulary",
        grammarPattern: "Grammar pattern",
        strategy: "Listening strategy",
      },
      tips: {
        title: "Listening Tips",
        items: [
          "Read the questions before listening.",
          "Never leave answers blank.",
          "Take notes while listening.",
          "Identify WHO, WHERE and WHAT.",
          "Listen carefully for numbers, dates and names.",
          "Practice listening to different French accents.",
          "Stay focused until the recording ends.",
          "Practice every day.",
        ],
      },
    },
    studyPlan: {
      pageTitle: "Study Plan",
      pageDescription: "Your exam countdown and a personalized day-by-day practice schedule.",
      testDay: "Test day",
      noExamDateTitle: "No exam date set yet",
      noExamDateDescription: "Set your exam date in your profile to see it highlighted on the calendar.",
      setExamDateLink: "Set exam date",
      dailyPlanTitle: "Your daily plan",
      dailyPlanDescription: "Adapts to your remaining days, level, and real practice history.",
      daysUntilExam: (n) => `${n} day${n === 1 ? "" : "s"} until your DELF exam`,
      examTodayLabel: "Your DELF exam is today",
      examPastLabel: "Your DELF exam date has passed",
      moreTasksLabel: (n) => `+${n} more`,
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
      listening: "Аудирование",
      speakingPractice: "Практика говорения",
      writingPractice: "Практика письма",
      weeklyQuiz: "Еженедельный тест",
      progress: "Прогресс",
      studyPlan: "План учёбы",
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
      listening: {
        title: "Аудирование",
        description: "Тренируйте понимание на слух DELF с оригинальными записями.",
        cta: "Начать аудирование",
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
        listeningSessions: "Сессий аудирования",
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
      aiFeedbackEmptyState: "Напишите предложение и нажмите «Получить отзыв ИИ», чтобы узнать результат.",
      aiFeedbackErrorGeneric: "Не удалось оценить предложение — попробуйте ещё раз.",
      usedCorrectlyBadge: "Правильное использование",
      notUsedBadge: "Слово не использовано",
      incorrectUsageBadge: "Неправильное использование",
      noCorrectionsNeeded: "Исправления не требуются.",
      mistakesLabel: "Ошибки",
      correctedSentenceLabel: "Исправленное предложение",
      whyWrongLabel: "Почему",
      naturalSuggestionLabel: "Более естественно",
      explanationLabel: "Объяснение",
      yourVocabulary: "Ваш словарь",
      yourVocabularyDescription:
        "Слова становятся «Изучается» и «Освоено» по мере реальной практики.",
      yourVocabularyEmptyState:
        "Пока нет практики — напишите предложение выше и получите отзыв, чтобы начать отслеживать прогресс.",
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
      newTopic: "Новая тема",
      taskCompletion: "Выполнение задания",
      addressedPrompt: "Раскрыта тема задания",
      respectedFormat: "Соблюдён формат",
      missingElements: "Чего не хватает",
      relevance: "Соответствие теме",
      structure: "Структура",
      introduction: "Введение",
      mainIdeas: "Основные идеи",
      conclusion: "Заключение",
      conclusionNotRequired: "Заключение (не обязательно)",
      coherence: "Связность",
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
      improvedVersion: "Улучшенная версия вашего ответа",
      improvedVersionDescription:
        "Ваши собственные мысли с исправленной грамматикой и добавленными недостающими структурными частями — ничего не придумано.",
      aiEvaluationTitle: "Оценка ИИ",
      aiEvaluationDescription:
        "Отправьте ответ, чтобы получить отзыв о выполнении задания, соответствии теме, структуре, связности, грамотности, словарном запасе и примерной оценке DELF.",
    },

    quiz: {
      pageTitle: "Еженедельный тест",
      pageDescription: "Повторите слова, изученные на этой неделе, и закрепите их в памяти.",
      wordsToReview: (n) => `${n} слов${n === 1 ? "о" : ""} на повторение`,
      basedOnVocabulary: "На основе слов, которые вы действительно практиковали",
      progressLabel: "Прогресс",
      questionBadge: (n) => `Вопрос ${n}`,
      submitQuiz: "Отправить тест",
      emptyStateTitle: "Пока нет слов для повторения",
      emptyStateDescription: "Потренируйте хотя бы одно слово в разделе «Словарь», чтобы открыть еженедельный тест.",
      emptyStateCta: "Перейти к словарю",
      scoreSummary: (correct, total) => `Правильных ответов: ${correct} из ${total}.`,
      correctAnswerLabel: "Правильный ответ",
      tryAgain: "Попробовать снова",
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
        duplicateEmailNotice: "Этот email уже зарегистрирован — войдите в систему ниже.",
      },
      register: {
        title: "Создайте аккаунт",
        description: "Начните персонализированную подготовку к DELF за минуту.",
        emailStepDescription: "Введите email, чтобы начать — мы отправим код подтверждения.",
        continueButton: "Продолжить",
        verifyStepTitle: "Подтвердите email",
        verifyStepDescription: (email) => `Введите 4-значный код, отправленный на ${email}.`,
        codeLabel: "Код подтверждения",
        codePlaceholder: "0000",
        verifyButton: "Подтвердить",
        resendCode: "Отправить код повторно",
        codeResent: "Новый код отправлен.",
        devModeCodeNotice: (code) =>
          `В этом окружении почтовый сервис не настроен — вот код для теста: ${code}`,
        invalidCodeError: "Код неверен или истёк.",
        firstName: "Имя",
        firstNamePlaceholder: "",
        lastName: "Фамилия",
        lastNamePlaceholder: "",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Пароль",
        passwordPlaceholder: "••••••••",
        passwordRequirement: "Пароль должен содержать 6–16 символов, включая минимум 1 букву и 1 цифру.",
        confirmPassword: "Подтвердите пароль",
        confirmPasswordPlaceholder: "••••••••",
        termsPrefix: "Я согласен(на) с",
        termsAndConditions: "Условиями использования",
        termsMiddle: "и",
        privacyPolicy: "Политикой конфиденциальности",
        termsRequiredError: "Пожалуйста, примите условия.",
        submit: "Создать аккаунт",
        haveAccount: "Уже есть аккаунт?",
        logIn: "Войти",
      },
      forgotPassword: {
        title: "Восстановление пароля",
        description: "Введите email вашего аккаунта, и мы отправим код подтверждения.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        submit: "Отправить код",
        backToLogin: "Назад ко входу",
        notFoundError: "Аккаунт с таким email не найден.",
        verifyStepTitle: "Подтвердите email",
        verifyStepDescription: (email) => `Введите 4-значный код, отправленный на ${email}.`,
        codeLabel: "Код подтверждения",
        codePlaceholder: "0000",
        verifyButton: "Подтвердить",
        resendCode: "Отправить код повторно",
        codeResent: "Новый код отправлен.",
        devModeCodeNotice: (code) =>
          `В этом окружении почтовый сервис не настроен — вот код для теста: ${code}`,
        invalidCodeError: "Код неверен или истёк.",
        newPasswordStepTitle: "Создайте новый пароль",
        newPasswordStepDescription: "Задайте новый пароль для вашего аккаунта.",
        newPassword: "Новый пароль",
        newPasswordPlaceholder: "••••••••",
        confirmPassword: "Подтвердите новый пароль",
        confirmPasswordPlaceholder: "••••••••",
        passwordRequirement: "Пароль должен содержать 6–16 символов, включая минимум 1 букву и 1 цифру.",
        saveButton: "Сохранить новый пароль",
        successMessage: "Пароль обновлён. Теперь вы можете войти.",
        goToLogin: "Перейти ко входу",
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
    listening: {
      pageTitle: "Аудирование",
      pageDescription: "Тренируйте DELF Compréhension de l'Oral с оригинальными записями, созданными ИИ.",
      home: {
        currentLevel: "Текущий уровень DELF",
        duration: "Продолжительность аудирования",
        minutesUnit: "мин",
        recordings: "Записи",
        recordingsUnit: "записей",
        maxRecordingLength: "Макс. длина записи",
        maxScore: "Максимальный балл",
        minPassingScore: "Минимальный проходной балл",
      },
      modes: {
        fullExamTitle: "Полный экзамен по аудированию DELF",
        fullExamDescription: "Полная симуляция раздела аудирования DELF, с таймером и оценкой, как на настоящем экзамене.",
        startFullExam: "Начать полный экзамен",
        practiceByPartTitle: "Практика по частям",
        practiceByPartDescription: "Потренируйтесь на одной записи и её вопросах в своём темпе.",
        startPractice: "Начать практику",
        dailyChallengeTitle: "Ежедневное задание по аудированию",
        dailyChallengeDescription: "Новое задание каждый день — все студенты вашего уровня сегодня получают одно и то же.",
        startDailyChallenge: "Начать сегодняшнее задание",
        completedTodayBadge: "Выполнено сегодня",
      },
      player: {
        play: "Воспроизвести",
        pause: "Пауза",
        replay: "Заново",
        skipBack: "Назад на 5 секунд",
        skipForward: "Вперёд на 5 секунд",
        seekLabel: "Перемотка",
        loadingVoice: "Загрузка голоса...",
        unsupported: "Воспроизведение аудио не поддерживается в этом браузере.",
      },
      session: {
        questionBadge: (n) => `Вопрос ${n}`,
        progressLabel: "Прогресс",
        submit: "Отправить",
        backToModes: "Назад",
        generating: "Создаём ваше упражнение на аудирование...",
        previous: "Назад",
        next: "Далее",
        recordingLabel: (n, total) => `Запись ${n} из ${total}`,
        selectAllThatApply: "Выберите все подходящие варианты",
      },
      results: {
        title: "Результаты",
        practiceScoreLabel: "Результат практики",
        practiceGood: "Хорошая практика",
        practiceNeedsWork: "Продолжайте практиковаться",
        scoreLabel: "Балл",
        percentageLabel: "Процент",
        pass: "Сдано",
        needsImprovement: "Нужно доработать",
        timeSpentLabel: "Затраченное время",
        accuracyLabel: "Точность",
        viewFeedback: "Посмотреть отзыв",
        reviewAnswers: "Разбор ответов",
        hideReview: "Скрыть разбор",
        newSession: "Новая сессия",
      },
      feedback: {
        title: "Отзыв ИИ",
        overallPerformance: "Общий результат",
        strongestSkills: "Сильные навыки",
        weakestSkills: "Слабые навыки",
        listeningAccuracy: "Точность аудирования",
        understandingMainIdeas: "Понимание основной мысли",
        understandingDetails: "Понимание деталей",
        understandingNumbers: "Понимание чисел",
        understandingNames: "Понимание имён",
        understandingDates: "Понимание дат",
        vocabularyComprehension: "Понимание лексики",
        recommendations: "Рекомендации",
        estimatedDelfReadiness: "Примерная готовность к DELF",
        noneNoted: "Не отмечено.",
      },
      review: {
        title: "Разбор вопросов",
        yourAnswer: "Ваш ответ",
        correctAnswer: "Правильный ответ",
        whyCorrectQuestion: "Почему этот ответ правильный?",
        whereInRecording: "Где в записи",
        keywords: "Ключевые слова и выражения",
        whyCorrect: "Почему это правильно",
        whyIncorrect: "Почему остальные варианты неверны",
        vocabulary: "Важная лексика",
        grammarPattern: "Грамматическая конструкция",
        strategy: "Стратегия аудирования",
      },
      tips: {
        title: "Советы по аудированию",
        items: [
          "Прочитайте вопросы перед прослушиванием.",
          "Никогда не оставляйте ответы пустыми.",
          "Делайте заметки во время прослушивания.",
          "Определяйте КТО, ГДЕ и ЧТО.",
          "Внимательно слушайте числа, даты и имена.",
          "Тренируйтесь понимать разные французские акценты.",
          "Сохраняйте концентрацию до конца записи.",
          "Занимайтесь каждый день.",
        ],
      },
    },
    studyPlan: {
      pageTitle: "План учёбы",
      pageDescription: "Обратный отсчёт до экзамена и персональный план занятий по дням.",
      testDay: "День экзамена",
      noExamDateTitle: "Дата экзамена не задана",
      noExamDateDescription: "Укажите дату экзамена в профиле, чтобы увидеть её на календаре.",
      setExamDateLink: "Указать дату экзамена",
      dailyPlanTitle: "Ваш план на день",
      dailyPlanDescription: "Подстраивается под оставшиеся дни, ваш уровень и реальную историю практики.",
      daysUntilExam: (n) => `${n} дн${n === 1 ? "ень" : n >= 2 && n <= 4 ? "я" : "ей"} до экзамена DELF`,
      examTodayLabel: "Ваш экзамен DELF сегодня",
      examPastLabel: "Дата вашего экзамена DELF уже прошла",
      moreTasksLabel: (n) => `+${n} ещё`,
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
      listening: "Тыңдалым",
      speakingPractice: "Сөйлеу жаттығуы",
      writingPractice: "Жазу жаттығуы",
      weeklyQuiz: "Апталық тест",
      progress: "Прогресс",
      studyPlan: "Оқу жоспары",
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
      listening: {
        title: "Тыңдалым",
        description: "Түпнұсқа жазбалармен DELF тыңдалым түсінігін жаттығыңыз.",
        cta: "Тыңдауды бастау",
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
        listeningSessions: "Тыңдалым сессиялары",
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
      aiFeedbackEmptyState: "Сөйлем жазып, нәтижені көру үшін «ЖИ пікірін алу» түймесін басыңыз.",
      aiFeedbackErrorGeneric: "Сөйлемді бағалау мүмкін болмады — қайталап көріңіз.",
      usedCorrectlyBadge: "Дұрыс қолданылды",
      notUsedBadge: "Сөз қолданылмады",
      incorrectUsageBadge: "Қате қолданылды",
      noCorrectionsNeeded: "Түзету қажет емес.",
      mistakesLabel: "Қателер",
      correctedSentenceLabel: "Түзетілген сөйлем",
      whyWrongLabel: "Неге",
      naturalSuggestionLabel: "Табиғырақ нұсқа",
      explanationLabel: "Түсіндірме",
      yourVocabulary: "Сіздің сөздігіңіз",
      yourVocabularyDescription:
        "Сөздер нақты жаттығу арқылы «Үйренуде» және «Меңгерілді» күйіне өтеді.",
      yourVocabularyEmptyState:
        "Әзірге жаттығу жоқ — жоғарыда сөйлем жазып, пікір алып, прогресіңізді бақылай бастаңыз.",
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
      newTopic: "Жаңа тақырып",
      taskCompletion: "Тапсырманы орындау",
      addressedPrompt: "Тапсырма тақырыбы ашылды",
      respectedFormat: "Формат сақталды",
      missingElements: "Не жетіспейді",
      relevance: "Тақырыпқа сәйкестік",
      structure: "Құрылым",
      introduction: "Кіріспе",
      mainIdeas: "Негізгі ойлар",
      conclusion: "Қорытынды",
      conclusionNotRequired: "Қорытынды (міндетті емес)",
      coherence: "Байланыстылық",
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
      improvedVersion: "Жауабыңыздың жақсартылған нұсқасы",
      improvedVersionDescription:
        "Сіздің өз ойларыңыз, грамматикасы түзетілген және жетіспейтін құрылымдық бөліктері толықтырылған — ештеңе ойдан шығарылмаған.",
      aiEvaluationTitle: "ЖИ бағалауы",
      aiEvaluationDescription:
        "Тапсырманы орындау, тақырыпқа сәйкестік, құрылым, байланыстылық, тіл дұрыстығы, сөздік қоры және болжамды DELF бағасы туралы пікір алу үшін жауабыңызды жіберіңіз.",
    },

    quiz: {
      pageTitle: "Апталық тест",
      pageDescription: "Осы аптада үйренген сөздерді қайталап, есте сақтауды бекітіңіз.",
      wordsToReview: (n) => `Қайталауға ${n} сөз`,
      basedOnVocabulary: "Сіз шынымен жаттыққан сөздік қор негізінде",
      progressLabel: "Прогресс",
      questionBadge: (n) => `${n}-сұрақ`,
      submitQuiz: "Тестті жіберу",
      emptyStateTitle: "Әзірге қайталайтын сөз жоқ",
      emptyStateDescription: "Апталық тестті ашу үшін «Сөздік» бөлімінде кемінде бір сөзді жаттығыңыз.",
      emptyStateCta: "Сөздікке өту",
      scoreSummary: (correct, total) => `Сіз ${total} сұрақтың ${correct}-іне дұрыс жауап бердіңіз.`,
      correctAnswerLabel: "Дұрыс жауап",
      tryAgain: "Қайта көру",
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
        duplicateEmailNotice: "Бұл email бұрын тіркелген — төменде жүйеге кіріңіз.",
      },
      register: {
        title: "Аккаунт жасаңыз",
        description: "Жеке DELF дайындығыңызды бір минутта бастаңыз.",
        emailStepDescription: "Бастау үшін email енгізіңіз — біз растау кодын жібереміз.",
        continueButton: "Жалғастыру",
        verifyStepTitle: "Email-ді растаңыз",
        verifyStepDescription: (email) => `${email} мекенжайына жіберілген 4 таңбалы кодты енгізіңіз.`,
        codeLabel: "Растау коды",
        codePlaceholder: "0000",
        verifyButton: "Растау",
        resendCode: "Кодты қайта жіберу",
        codeResent: "Жаңа код жіберілді.",
        devModeCodeNotice: (code) =>
          `Бұл ортада пошта қызметі бапталмаған — сынау үшін кодыңыз: ${code}`,
        invalidCodeError: "Код қате немесе мерзімі өтіп кеткен.",
        firstName: "Аты",
        firstNamePlaceholder: "",
        lastName: "Тегі",
        lastNamePlaceholder: "",
        email: "Email",
        emailPlaceholder: "you@example.com",
        password: "Құпия сөз",
        passwordPlaceholder: "••••••••",
        passwordRequirement: "Құпия сөз 6–16 таңбадан тұруы керек, кемінде 1 әріп және 1 сан қамтылуы керек.",
        confirmPassword: "Құпия сөзді растаңыз",
        confirmPasswordPlaceholder: "••••••••",
        termsPrefix: "Мен келісемін",
        termsAndConditions: "Пайдалану шарттарымен",
        termsMiddle: "және",
        privacyPolicy: "Құпиялылық саясатымен",
        termsRequiredError: "Шарттарды қабылдаңыз.",
        submit: "Аккаунт жасау",
        haveAccount: "Аккаунтыңыз бар ма?",
        logIn: "Кіру",
      },
      forgotPassword: {
        title: "Құпия сөзді қалпына келтіру",
        description: "Аккаунтыңыздың email мекенжайын енгізіңіз, біз растау коды жібереміз.",
        email: "Email",
        emailPlaceholder: "you@example.com",
        submit: "Кодты жіберу",
        backToLogin: "Кіруге оралу",
        notFoundError: "Бұл email-мен аккаунт табылмады.",
        verifyStepTitle: "Email-ді растаңыз",
        verifyStepDescription: (email) => `${email} мекенжайына жіберілген 4 таңбалы кодты енгізіңіз.`,
        codeLabel: "Растау коды",
        codePlaceholder: "0000",
        verifyButton: "Растау",
        resendCode: "Кодты қайта жіберу",
        codeResent: "Жаңа код жіберілді.",
        devModeCodeNotice: (code) =>
          `Бұл ортада пошта қызметі бапталмаған — сынау үшін кодыңыз: ${code}`,
        invalidCodeError: "Код қате немесе мерзімі өтіп кеткен.",
        newPasswordStepTitle: "Жаңа құпия сөз жасаңыз",
        newPasswordStepDescription: "Аккаунтыңыз үшін жаңа құпия сөз таңдаңыз.",
        newPassword: "Жаңа құпия сөз",
        newPasswordPlaceholder: "••••••••",
        confirmPassword: "Жаңа құпия сөзді растаңыз",
        confirmPasswordPlaceholder: "••••••••",
        passwordRequirement: "Құпия сөз 6–16 таңбадан тұруы керек, кемінде 1 әріп және 1 сан қамтылуы керек.",
        saveButton: "Жаңа құпия сөзді сақтау",
        successMessage: "Құпия сөз жаңартылды. Енді кіре аласыз.",
        goToLogin: "Кіруге өту",
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
    listening: {
      pageTitle: "Тыңдалым",
      pageDescription: "ЖИ жасаған түпнұсқа жазбалармен DELF Compréhension de l'Oral бөлімін жаттығыңыз.",
      home: {
        currentLevel: "Ағымдағы DELF деңгейі",
        duration: "Тыңдалым ұзақтығы",
        minutesUnit: "мин",
        recordings: "Жазбалар",
        recordingsUnit: "жазба",
        maxRecordingLength: "Ең үлкен жазба ұзақтығы",
        maxScore: "Ең жоғары балл",
        minPassingScore: "Ең төменгі өту балы",
      },
      modes: {
        fullExamTitle: "DELF тыңдалым бойынша толық емтихан",
        fullExamDescription: "DELF тыңдалым бөлімінің толық симуляциясы, нақты емтихандағыдай уақыты мен бағасы бар.",
        startFullExam: "Толық емтиханды бастау",
        practiceByPartTitle: "Бөлім бойынша жаттығу",
        practiceByPartDescription: "Бір жазба мен оның сұрақтарын өз қарқыныңызбен жаттығыңыз.",
        startPractice: "Жаттығуды бастау",
        dailyChallengeTitle: "Күндізгі тыңдалым тапсырмасы",
        dailyChallengeDescription: "Күн сайын жаңа тапсырма — сіздің деңгейіңіздегі барлық студенттер бүгін бірдей тапсырма алады.",
        startDailyChallenge: "Бүгінгі тапсырманы бастау",
        completedTodayBadge: "Бүгін орындалды",
      },
      player: {
        play: "Ойнату",
        pause: "Кідірту",
        replay: "Қайта ойнату",
        skipBack: "5 секунд артқа",
        skipForward: "5 секунд алға",
        seekLabel: "Айналдыру",
        loadingVoice: "Дауыс жүктелуде...",
        unsupported: "Бұл браузерде аудио ойнату қолдау көрсетілмейді.",
      },
      session: {
        questionBadge: (n) => `${n}-сұрақ`,
        progressLabel: "Прогресс",
        submit: "Жіберу",
        backToModes: "Артқа",
        generating: "Тыңдалым жаттығуыңыз жасалуда...",
        previous: "Артқа",
        next: "Келесі",
        recordingLabel: (n, total) => `${total}-ден ${n}-жазба`,
        selectAllThatApply: "Сәйкес келетіндердің барлығын таңдаңыз",
      },
      results: {
        title: "Нәтижелер",
        practiceScoreLabel: "Жаттығу нәтижесі",
        practiceGood: "Жақсы жаттығу",
        practiceNeedsWork: "Жаттығуды жалғастырыңыз",
        scoreLabel: "Балл",
        percentageLabel: "Пайыз",
        pass: "Өтті",
        needsImprovement: "Жетілдіру қажет",
        timeSpentLabel: "Жұмсалған уақыт",
        accuracyLabel: "Дәлдік",
        viewFeedback: "Пікірді қарау",
        reviewAnswers: "Жауаптарды шолу",
        hideReview: "Шолуды жасыру",
        newSession: "Жаңа сессия",
      },
      feedback: {
        title: "ЖИ пікірі",
        overallPerformance: "Жалпы нәтиже",
        strongestSkills: "Күшті дағдылар",
        weakestSkills: "Әлсіз дағдылар",
        listeningAccuracy: "Тыңдалым дәлдігі",
        understandingMainIdeas: "Негізгі ойды түсіну",
        understandingDetails: "Детальдерді түсіну",
        understandingNumbers: "Сандарды түсіну",
        understandingNames: "Есімдерді түсіну",
        understandingDates: "Даталарды түсіну",
        vocabularyComprehension: "Лексиканы түсіну",
        recommendations: "Ұсыныстар",
        estimatedDelfReadiness: "DELF-ке болжамды дайындық",
        noneNoted: "Ештеңе белгіленбеген.",
      },
      review: {
        title: "Сұрақтарды шолу",
        yourAnswer: "Сіздің жауабыңыз",
        correctAnswer: "Дұрыс жауап",
        whyCorrectQuestion: "Бұл жауап неге дұрыс?",
        whereInRecording: "Жазбаның қай жерінде",
        keywords: "Түйінді сөздер мен өрнектер",
        whyCorrect: "Неге бұл дұрыс",
        whyIncorrect: "Басқа нұсқалар неге қате",
        vocabulary: "Маңызды сөздік қор",
        grammarPattern: "Грамматикалық үлгі",
        strategy: "Тыңдалым стратегиясы",
      },
      tips: {
        title: "Тыңдалым кеңестері",
        items: [
          "Тыңдамас бұрын сұрақтарды оқыңыз.",
          "Жауаптарды бос қалдырмаңыз.",
          "Тыңдау кезінде жазба жасаңыз.",
          "КІМ, ҚАЙДА және НЕ екенін анықтаңыз.",
          "Сандарды, даталарды және есімдерді мұқият тыңдаңыз.",
          "Әртүрлі француз акценттерін тыңдауды жаттығыңыз.",
          "Жазба аяқталғанша назарыңызды сақтаңыз.",
          "Күн сайын жаттығыңыз.",
        ],
      },
    },
    studyPlan: {
      pageTitle: "Оқу жоспары",
      pageDescription: "Емтиханға дейінгі кері санақ және күн сайынғы жеке жаттығу жоспары.",
      testDay: "Емтихан күні",
      noExamDateTitle: "Емтихан күні әлі белгіленбеген",
      noExamDateDescription: "Оны күнтізбеде көру үшін профиліңізде емтихан күнін көрсетіңіз.",
      setExamDateLink: "Емтихан күнін көрсету",
      dailyPlanTitle: "Күндізгі жоспарыңыз",
      dailyPlanDescription: "Қалған күндерге, деңгейіңізге және нақты жаттығу тарихыңызға бейімделеді.",
      daysUntilExam: (n) => `DELF емтиханыңызға ${n} күн қалды`,
      examTodayLabel: "DELF емтиханыңыз бүгін",
      examPastLabel: "DELF емтихан күніңіз өтіп кетті",
      moreTasksLabel: (n) => `тағы +${n}`,
    },
  },
};
