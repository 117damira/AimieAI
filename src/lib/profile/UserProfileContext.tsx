"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExamId } from "@/types/exam";
import type { OnboardingLevel, User, UserStats } from "@/types/user";

const STORAGE_KEY = "aimieai.user.v2";

interface IdentitySeed {
  firstName: string;
  lastName: string;
  email: string;
}

interface OnboardingAnswers {
  examId: ExamId;
  targetLevel: OnboardingLevel;
  examDate: string | null;
  dailyGoalMinutes: number;
}

export type PracticeActivity = "writing" | "speaking";

interface UserProfileContextValue {
  profile: User | null;
  isHydrated: boolean;
  seedIdentity: (identity: IdentitySeed) => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  updateProfile: (partial: Partial<User>) => void;
  /** score is the session's exam-readiness estimate normalized to 0-100. */
  recordActivity: (activity: PracticeActivity, score: number) => void;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

function initialsFrom(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** A brand-new account must never show fake progress — every counter starts
 * at zero and the streak only begins once a session is actually completed. */
function createInitialStats(): UserStats {
  return {
    wordsLearned: 0,
    quizzesCompleted: 0,
    speakingSessions: 0,
    writingSessions: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastPracticeDate: null,
    history: [],
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
        setProfile(JSON.parse(raw) as User);
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
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [profile, isHydrated]);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      profile,
      isHydrated,
      seedIdentity: (identity) => {
        setProfile((prev) => ({
          id: prev?.id ?? `user_${Date.now()}`,
          firstName: identity.firstName,
          lastName: identity.lastName,
          email: identity.email,
          examId: prev?.examId ?? "delf",
          targetLevel: prev?.targetLevel ?? "A1",
          examDate: prev?.examDate ?? null,
          dailyGoalMinutes: prev?.dailyGoalMinutes ?? 20,
          avatarInitials: initialsFrom(identity.firstName, identity.lastName),
          stats: prev?.stats ?? createInitialStats(),
        }));
      },
      completeOnboarding: (answers) => {
        setProfile((prev) => ({
          id: prev?.id ?? `user_${Date.now()}`,
          firstName: prev?.firstName ?? "",
          lastName: prev?.lastName ?? "",
          email: prev?.email ?? "",
          avatarInitials: prev?.avatarInitials ?? "?",
          stats: prev?.stats ?? createInitialStats(),
          ...answers,
        }));
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
