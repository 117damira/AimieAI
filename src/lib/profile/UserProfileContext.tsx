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
import * as accountStore from "@/lib/auth/accountStore";
import { recordWritingTopicHistory } from "@/lib/writing/topicRotation";
import { recordListeningHistory } from "@/lib/listening/rotation";
import { DEFAULT_STUDY_DAYS } from "@/config/onboarding";
import type { OnboardingAnswers } from "@/lib/onboarding/draftStore";

const STORAGE_KEY = "aimieai.user.v2";

interface IdentitySeed {
  firstName: string;
  lastName: string;
  /** Exactly one of email/phone is set, matching the chosen registration
   * method — see `register()` below. */
  email: string | null;
  phone: string | null;
}

export type PracticeActivity = "writing" | "speaking" | "listening";

export type RegisterResult =
  | { ok: true }
  | { ok: false; reason: "duplicate-email" | "duplicate-phone" };
export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "wrong-password" };

interface UserProfileContextValue {
  profile: User | null;
  isHydrated: boolean;
  /** Registration always happens after onboarding — `onboarding` is that
   * questionnaire's answers, folded into the new account at creation time. */
  register: (
    identity: IdentitySeed,
    password: string,
    onboarding: OnboardingAnswers
  ) => Promise<RegisterResult>;
  /** identifier is either an email address or a normalized KZ phone number
   * ("+7XXXXXXXXXX") — accountStore figures out which. */
  login: (identifier: string, password: string) => Promise<LoginResult>;
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
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastPracticeDate: null,
    history: [],
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
    phone: user.phone ?? null,
    registrationMethod: user.registrationMethod ?? "email",
    studyDays: user.studyDays && user.studyDays.length > 0 ? user.studyDays : DEFAULT_STUDY_DAYS,
    vocabularyProgress: user.vocabularyProgress ?? [],
    writingTopicHistory: user.writingTopicHistory ?? {},
    listeningHistory: user.listeningHistory ?? {},
    stats: {
      ...user.stats,
      listeningSessions: user.stats.listeningSessions ?? 0,
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
        if (identity.email && accountStore.emailExists(identity.email)) {
          return { ok: false, reason: "duplicate-email" };
        }
        if (identity.phone && accountStore.phoneExists(identity.phone)) {
          return { ok: false, reason: "duplicate-phone" };
        }
        const newUser: User = {
          id: `user_${Date.now()}`,
          firstName: identity.firstName,
          lastName: identity.lastName,
          email: identity.email ?? "",
          phone: identity.phone ?? null,
          registrationMethod: identity.phone ? "phone" : "email",
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
        };
        await accountStore.createAccount({ user: newUser, password });
        setProfile(newUser);
        return { ok: true };
      },
      login: async (identifier, password) => {
        const result = await accountStore.verifyLogin(identifier, password);
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
