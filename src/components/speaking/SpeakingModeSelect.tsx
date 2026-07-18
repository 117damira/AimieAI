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
import type { DelfSpeakingLevelConfig } from "@/config/delf-speaking";

export function SpeakingModeSelect({
  levelConfig,
  onSelectMode,
}: {
  levelConfig: DelfSpeakingLevelConfig;
  onSelectMode: (mode: "live" | "written") => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{levelConfig.label} · DELF Production Orale</CardTitle>
          <CardDescription>{levelConfig.structureDescription}</CardDescription>
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
              <span className="text-xs text-muted">{part.instructions}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>AI Live Examiner</CardTitle>
            </div>
            <CardDescription>
              A full exam simulation: the AI asks each question in order,
              gives brief feedback, and moves on — just like the real thing.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => onSelectMode("live")}>
              Start exam simulation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>Written Speaking Practice</CardTitle>
            </div>
            <CardDescription>
              Go at your own pace: answer one question at a time and get full
              feedback immediately after each one.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="secondary" onClick={() => onSelectMode("written")}>
              Start practice
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
