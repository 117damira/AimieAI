"use client";

import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kz", label: "KZ" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.common.selectLanguage}
      className="flex items-center gap-0.5 rounded-xl bg-background p-1"
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code)}
          aria-pressed={language === option.code}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer",
            language === option.code
              ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
              : "text-muted hover:bg-primary-50 hover:text-primary-700"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
