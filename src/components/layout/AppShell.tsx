"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();
  const { profile, isHydrated } = useUserProfile();
  const { t } = useLanguage();

  useEffect(() => {
    if (isHydrated && !profile) router.replace("/onboarding");
  }, [isHydrated, profile, router]);

  if (!isHydrated || !profile) return null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative flex w-72 flex-col bg-surface px-4 py-6 shadow-xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label={t.common.closeMenu}
              className="absolute right-4 top-6 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-background"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
