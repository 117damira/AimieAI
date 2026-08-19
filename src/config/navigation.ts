import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpenText,
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  ListChecks,
  TrendingUp,
  CalendarDays,
  User,
  Settings,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/translations";
import type { ExamId } from "@/types/exam";
import type { TopikTrack } from "@/types/topik";

export interface NavItem {
  key: keyof Dictionary["nav"];
  href: string;
  icon: LucideIcon;
}

/** Links shown in the authenticated app sidebar. Display labels come from
 * `t.nav[item.key]` at render time — see Sidebar.tsx. */
export const SIDEBAR_NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "vocabulary", href: "/vocabulary", icon: BookOpenText },
  { key: "reading", href: "/reading", icon: BookOpen },
  { key: "listening", href: "/listening", icon: Headphones },
  { key: "speakingPractice", href: "/speaking", icon: Mic },
  { key: "writingPractice", href: "/writing", icon: PenLine },
  { key: "weeklyQuiz", href: "/quiz", icon: ListChecks },
  { key: "progress", href: "/progress", icon: TrendingUp },
  { key: "studyPlan", href: "/study-plan", icon: CalendarDays },
];

/** TOPIK has no Speaking section; Writing only exists for TOPIK II. Built
 * from the same NavItem list as SIDEBAR_NAV (filtered), so icons/hrefs never
 * drift out of sync between the two exams. */
const TOPIK_SIDEBAR_NAV: NavItem[] = SIDEBAR_NAV.filter((item) => item.key !== "speakingPractice");

/** DELF accounts always get the untouched SIDEBAR_NAV array (zero behavior
 * change). TOPIK accounts get Speaking removed entirely, and Writing removed
 * unless they're on TOPIK II. */
export function getSidebarNav(examId: ExamId, topikTrack: TopikTrack | null): NavItem[] {
  if (examId !== "topik") return SIDEBAR_NAV;
  if (topikTrack === "II") return TOPIK_SIDEBAR_NAV;
  return TOPIK_SIDEBAR_NAV.filter((item) => item.key !== "writingPractice");
}

export const SIDEBAR_FOOTER_NAV: NavItem[] = [
  { key: "profile", href: "/profile", icon: User },
  { key: "settings", href: "/settings", icon: Settings },
];
