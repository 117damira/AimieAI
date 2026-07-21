"use client";

import { Clock, Disc3, Timer, Award, Target, Layers } from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DelfListeningLevelConfig } from "@/types/listening";

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background p-4 transition-colors duration-200">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}

export function ListeningLevelDashboard({ config }: { config: DelfListeningLevelConfig }) {
  const { t } = useLanguage();
  const h = t.listening.home;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="primary">
            <Layers className="h-3.5 w-3.5" />
            {h.currentLevel}
          </Badge>
          <span className="font-display text-lg font-semibold text-foreground">{config.label}</span>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <Stat icon={Clock} label={h.duration} value={`${config.durationMinutes} ${h.minutesUnit}`} />
          <Stat icon={Disc3} label={h.recordings} value={`${config.recordingCountLabel} ${h.recordingsUnit}`} />
          <Stat icon={Timer} label={h.maxRecordingLength} value={`${config.maxRecordingMinutes} ${h.minutesUnit}`} />
          <Stat icon={Award} label={h.maxScore} value={`${config.scoreOutOf}`} />
          <Stat icon={Target} label={h.minPassingScore} value={`${config.minPassingScore} / ${config.scoreOutOf}`} />
        </div>
      </CardContent>
    </Card>
  );
}
