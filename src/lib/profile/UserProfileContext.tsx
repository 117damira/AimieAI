"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, UserStats } from "@/types/user";
import type { VocabularyEntry } from "@/types/vocabulary";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import type { ReadingSessionRecord } from "@/types/reading";
import * as accountStore from "@/lib/auth/accountStore";
import { recordWritingTopicHistory } from "@/lib/writing/topicRotation";
import { recordListeningHistory } from "@/lib/listening/rotation";
import { recordReadingHistory } from "@/lib/reading/rotation";
import { DEFAULT_STUDY_DAYS } from "@/config/onboarding";
import type { OnboardingAnswers } from "@/lib/onboarding/draftStore";

/** How many sessions of readingSessionHistory to retain — enough for
 * meaningful Personal Best / progress comparison without growing unbounded. */
const READING_SESSION_HISTORY_LIMIT = 30;

const STORAGE_KEY = "aimieai.user.v2";

interface IdentitySeed {
  firstName: string;
  lastName: string;
  email: string;
}

export type PracticeActivity = "writing" | "speaking" | "listening" | "reading";

export type RegisterResult =
  | { ok: true }
  | { ok: false; reason: "duplicate-email" };
export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "wrong-password" };

interface UserProfileContextValue {
  profile: User | null;
  isHydrated: boolean;
  /** Registration always happens after onboarding — `onboarding` is that
   * questionnaire's answers, folded into the new account at creation time.
   * Creating the account also immediately logs the user in (sets `profile`). */
  register: (
    identity: IdentitySeed,
    password: string,
    onboarding: OnboardingAnswers
  ) => Promise<RegisterResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  updateProfile: (partial: Partial<User>) => void;
  /** score is the session's exam-readiness estimate normalized to 0-100. */
  recordActivity: (activity: PracticeActivity, score: number) => void;
  /** Records one real AI-graded sentence attempt for a vocabulary word,
   * advancing its mastery: 1st correct practice -> "learning", 3rd
   * cumulative correct practice -> "mastered". Never called for anything
   * other than an actual submitted-and-graded sentence. */
  recordVocabularyPractice: (
    word: string,
    definition: Record<FeedbackLanguage, string>,
    wasCorrect: boolean
  ) => void;
  /** Records that a writing prompt was shown for a level, so the next
   * session's topic rotation (lib/writing/topicRotation.ts) knows what to
   * avoid repeating. */
  recordWritingTopic: (level: DelfLevel, promptId: string) => void;
  /** Increments quizzesCompleted after a real Weekly Quiz submission —
   * never called for anything other than an actual graded attempt. */
  recordQuizCompletion: () => void;
  /** Records that a Listening set was completed, so the next session's
   * content rotation (lib/listening/rotation.ts) knows what to avoid
   * repeating. */
  recordListeningCompletion: (level: DelfLevel, recordingIds: string[]) => void;
  /** Records that a Reading set was completed: appends to the passage-id
   * rotation history (lib/reading/rotation.ts) and to
   * stats.readingSessionHistory (used for Personal Best/Progress
   * Comparison, see lib/reading/stats.ts), and increments
   * stats.readingSessions. Never called for anything other than an actual
   * submitted-and-scored Reading session. */
  recordReadingCompletion: (level: DelfLevel, passageIds: string[], session: ReadingSessionRecord) => void;
  /** Saves a word extracted from a Reading passage straight into the
   * Vocabulary module (the "Save to Vocabulary" button) — deduped by word
   * (case-insensitive) against existing vocabularyProgress, starting at
   * mastery "new". Distinct from recordVocabularyPractice, which grades an
   * actual submitted sentence; this just adds the word to track. */
  addVocabularyWord: (word: string, definition: Record<FeedbackLanguage, string>) => void;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

/** A brand-new account must never show fake progress — every counter starts
 * at zero and the streak only begins once a session is actually completed. */
function createInitialStats(): UserStats {
  return {
    wordsLearned: 0,
    quizzesCompleted: 0,
    speakingSessions: 0,
    writingSessions: 0,
    listeningSessions: 0,
    readingSessions: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastPracticeDate: null,
    history: [],
    readingSessionHistory: [],
  };
}

/** Backfills fields that didn't exist when an account/profile was first
 * created (e.g. `vocabularyProgress`, added after this app already had
 * real users/local accounts) — called every time a `User` is loaded from
 * storage, so an old profile is migrated in place instead of crashing
 * downstream code that assumes the field exists. Never invents progress:
 * a missing field always defaults to empty, never preloaded data. */
function migrateUser(user: User): User {
  return {
    ...user,
    studyDays: user.studyDays && user.studyDays.length > 0 ? user.studyDays : DEFAULT_STUDY_DAYS,
    vocabularyProgress: user.vocabularyProgress ?? [],
    writingTopicHistory: user.writingTopicHistory ?? {},
    listeningHistory: user.listeningHistory ?? {},
    readingHistory: user.readingHistory ?? {},
    stats: {
      ...user.stats,
      listeningSessions: user.stats.listeningSessions ?? 0,
      readingSessions: user.stats.readingSessions ?? 0,
      readingSessionHistory: user.stats.readingSessionHistory ?? [],
    },
  };
}

/** yyyy-mm-dd in the user's local timezone (not UTC), so "today" matches
 * what the user sees on their own calendar. */
function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isYesterday(dateIso: string, today: string): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1
  ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  return dateIso === yesterdayIso;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // localStorage only exists on the client — this intentionally differs
    // between the server render and first client render (both start with
    // profile=null so hydration matches), so it can't be read during render.
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(migrateUser(JSON.parse(raw) as User));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      // Write-through: keeps the durable account directory (used by
      // login/logout-and-back-in) in sync with every profile change.
      accountStore.updateAccountUser(profile);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [profile, isHydrated]);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      profile,
      isHydrated,
      register: async (identity, password, onboarding) => {
        if (accountStore.emailExists(identity.email)) {
          return { ok: false, reason: "duplicate-email" };
        }
        const newUser: User = {
          id: `user_${Date.now()}`,
          firstName: identity.firstName,
          lastName: identity.lastName,
          email: identity.email,
          examId: onboarding.examId,
          targetLevel: onboarding.targetLevel,
          examDate: onboarding.examDate,
          dailyGoalMinutes: onboarding.dailyGoalMinutes,
          studyDays: onboarding.studyDays,
          avatarPhotoDataUrl: null,
          lastLoginAt: null,
          stats: createInitialStats(),
          vocabularyProgress: [],
          writingTopicHistory: {},
          listeningHistory: {},
          readingHistory: {},
        };
        await accountStore.createAccount({ user: newUser, password });
        setProfile(newUser);
        return { ok: true };
      },
      login: async (email, password) => {
        const result = await accountStore.verifyLogin(email, password);
        if (!result.ok) return result;
        setProfile(migrateUser(result.user));
        return { ok: true };
      },
      updateProfile: (partial) => {
        setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
      },
      recordActivity: (activity, score) => {
        setProfile((prev) => {
          if (!prev) return prev;
          const today = todayIso();
          const { stats } = prev;

          let currentStreakDays: number;
          if (stats.lastPracticeDate === today) {
            currentStreakDays = stats.currentStreakDays;
          } else if (
            stats.lastPracticeDate &&
            isYesterday(stats.lastPracticeDate, today)
          ) {
            currentStreakDays = stats.currentStreakDays + 1;
          } else {
            currentStreakDays = 1;
          }

          return {
            ...prev,
            stats: {
              ...stats,
              speakingSessions:
                stats.speakingSessions + (activity === "speaking" ? 1 : 0),
              writingSessions:
                stats.writingSessions + (activity === "writing" ? 1 : 0),
              listeningSessions:
                stats.listeningSessions + (activity === "listening" ? 1 : 0),
              readingSessions:
                stats.readingSessions + (activity === "reading" ? 1 : 0),
              currentStreakDays,
              longestStreakDays: Math.max(
                stats.longestStreakDays,
                currentStreakDays
              ),
              lastPracticeDate: today,
              history: [...stats.history, { date: today, activity, score }],
            },
          };
        });
      },
      recordVocabularyPractice: (word, definition, wasCorrect) => {
        setProfile((prev) => {
          if (!prev) return prev;
          const today = todayIso();
          // Defensive fallback even though load-time migration should
          // already guarantee this — never assume the field exists.
          const currentProgress = prev.vocabularyProgress ?? [];
          const existing = currentProgress.find(
            (entry) => entry.word.toLowerCase() === word.toLowerCase()
          );

          let nextEntry: VocabularyEntry;
          if (existing) {
            const timesPracticed = existing.timesPracticed + 1;
            const timesCorrect = existing.timesCorrect + (wasCorrect ? 1 : 0);
            const mastery: VocabularyEntry["mastery"] =
              timesCorrect >= 3 ? "mastered" : timesCorrect >= 1 ? "learning" : existing.mastery;
            nextEntry = { ...existing, timesPracticed, timesCorrect, mastery };
          } else {
            nextEntry = {
              id: `vocab_${Date.now()}`,
              word,
              definition,
              learnedOn: today,
              mastery: wasCorrect ? "learning" : "new",
              timesPracticed: 1,
              timesCorrect: wasCorrect ? 1 : 0,
            };
          }

          const vocabularyProgress = existing
            ? currentProgress.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry))
            : [nextEntry, ...currentProgress];

          const wordsLearned = vocabularyProgress.filter((entry) => entry.mastery === "mastered").length;

          return { ...prev, vocabularyProgress, stats: { ...prev.stats, wordsLearned } };
        });
      },
      recordWritingTopic: (level, promptId) => {
        setProfile((prev) => {
          if (!prev) return prev;
          const currentHistory = prev.writingTopicHistory ?? {};
          const nextForLevel = recordWritingTopicHistory(currentHistory[level] ?? [], promptId);
          return {
            ...prev,
            writingTopicHistory: { ...currentHistory, [level]: nextForLevel },
          };
        });
      },
      recordQuizCompletion: () => {
        setProfile((prev) => {
          if (!prev) return prev;
          return { ...prev, stats: { ...prev.stats, quizzesCompleted: prev.stats.quizzesCompleted + 1 } };
        });
      },
      recordListeningCompletion: (level, recordingIds) => {
        setProfile((prev) => {
          if (!prev) return prev;
          const currentHistory = prev.listeningHistory ?? {};
          const nextForLevel = recordListeningHistory(currentHistory[level] ?? [], recordingIds);
          return {
            ...prev,
            listeningHistory: { ...currentHistory, [level]: nextForLevel },
          };
        });
      },
      recordReadingCompletion: (level, passageIds, session) => {
        setProfile((prev) => {
          if (!prev) return prev;
          const currentHistory = prev.readingHistory ?? {};
          const nextForLevel = recordReadingHistory(currentHistory[level] ?? [], passageIds);
          const readingSessionHistory = [...(prev.stats.readingSessionHistory ?? []), session].slice(
            -READING_SESSION_HISTORY_LIMIT
          );
          return {
            ...prev,
            readingHistory: { ...currentHistory, [level]: nextForLevel },
            stats: { ...prev.stats, readingSessionHistory },
          };
        });
      },
      addVocabularyWord: (word, definition) => {
        setProfile((prev) => {
          if (!prev) return prev;
          const today = todayIso();
          const currentProgress = prev.vocabularyProgress ?? [];
          const alreadySaved = currentProgress.some(
            (entry) => entry.word.toLowerCase() === word.toLowerCase()
          );
          if (alreadySaved) return prev;

          const newEntry: VocabularyEntry = {
            id: `vocab_${Date.now()}`,
            word,
            definition,
            learnedOn: today,
            mastery: "new",
            timesPracticed: 0,
            timesCorrect: 0,
          };
          return { ...prev, vocabularyProgress: [newEntry, ...currentProgress] };
        });
      },
      clearProfile: () => setProfile(null),
    }),
    [profile, isHydrated]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
