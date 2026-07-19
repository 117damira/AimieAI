"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SIDEBAR_NAV, SIDEBAR_FOOTER_NAV, type NavItem } from "@/config/navigation";
import { ACTIVE_EXAM } from "@/config/exams";
import { APP_NAME } from "@/config/app";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: NavItem["icon"];
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
          : "text-muted hover:bg-primary-50 hover:text-primary-700"
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <>
      <Link href="/dashboard" className="flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-semibold text-foreground">
            {APP_NAME}
          </span>
          <span className="text-xs text-muted">{t.sidebar.track(ACTIVE_EXAM.name)}</span>
        </div>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {SIDEBAR_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t.nav[item.key]}
            active={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        {SIDEBAR_FOOTER_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t.nav[item.key]}
            active={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
        <button
          type="button"
          onClick={() => setLogoutDialogOpen(true)}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger-50 hover:text-danger-600 cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {t.sidebar.logOut}
        </button>
      </div>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      />
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
      <SidebarContent />
    </aside>
  );
}
