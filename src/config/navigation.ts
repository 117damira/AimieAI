import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpenText,
  Mic,
  PenLine,
  ListChecks,
  TrendingUp,
  User,
  Settings,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/translations";

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
  { key: "speakingPractice", href: "/speaking", icon: Mic },
  { key: "writingPractice", href: "/writing", icon: PenLine },
  { key: "weeklyQuiz", href: "/quiz", icon: ListChecks },
  { key: "progress", href: "/progress", icon: TrendingUp },
];

export const SIDEBAR_FOOTER_NAV: NavItem[] = [
  { key: "profile", href: "/profile", icon: User },
  { key: "settings", href: "/settings", icon: Settings },
];
