"use client";

import { Sparkles, PenLine, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DelfSpeakingLevelConfig } from "@/config/delf-speaking";
import { SpeakingTipsCard } from "./SpeakingTipsCard";

export function SpeakingModeSelect({
  levelConfig,
  onSelectMode,
}: {
  levelConfig: DelfSpeakingLevelConfig;
  onSelectMode: (mode: "live" | "written") => void;
}) {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{levelConfig.label} · DELF Production Orale</CardTitle>
          <CardDescription>{levelConfig.structureDescription[language]}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {levelConfig.parts.map((part, i) => (
            <div
              key={part.id}
              className="flex flex-col gap-1 rounded-2xl bg-background p-4"
            >
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{i + 1}</Badge>
                <span className="font-display text-sm font-semibold text-foreground">
                  {part.partLabel}
                </span>
              </div>
              <span className="text-xs text-muted">{part.instructions[language]}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="flex h-full flex-col justify-between transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>{t.speaking.modeSelect.aiLiveExaminerTitle}</CardTitle>
            </div>
            <CardDescription>
              {t.speaking.modeSelect.aiLiveExaminerDescription}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => onSelectMode("live")}>
              {t.speaking.modeSelect.startSimulation}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex h-full flex-col justify-between transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>{t.speaking.modeSelect.writtenTitle}</CardTitle>
            </div>
            <CardDescription>
              {t.speaking.modeSelect.writtenDescription}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="secondary" onClick={() => onSelectMode("written")}>
              {t.speaking.modeSelect.startPractice}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <SpeakingTipsCard />
    </div>
  );
}
