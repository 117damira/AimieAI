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

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Links shown in the authenticated app sidebar. */
export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vocabulary", href: "/vocabulary", icon: BookOpenText },
  { label: "Speaking Practice", href: "/speaking", icon: Mic },
  { label: "Writing Practice", href: "/writing", icon: PenLine },
  { label: "Weekly Quiz", href: "/quiz", icon: ListChecks },
  { label: "Progress", href: "/progress", icon: TrendingUp },
];

export const SIDEBAR_FOOTER_NAV: NavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];
