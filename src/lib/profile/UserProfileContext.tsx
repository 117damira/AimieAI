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
import type { OnboardingLevel, User } from "@/types/user";

const STORAGE_KEY = "examly.user.v1";

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

interface UserProfileContextValue {
  profile: User | null;
  isHydrated: boolean;
  seedIdentity: (identity: IdentitySeed) => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  updateProfile: (partial: Partial<User>) => void;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

function initialsFrom(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
        }));
      },
      completeOnboarding: (answers) => {
        setProfile((prev) => ({
          id: prev?.id ?? `user_${Date.now()}`,
          firstName: prev?.firstName ?? "",
          lastName: prev?.lastName ?? "",
          email: prev?.email ?? "",
          avatarInitials: prev?.avatarInitials ?? "?",
          ...answers,
        }));
      },
      updateProfile: (partial) => {
        setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
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
