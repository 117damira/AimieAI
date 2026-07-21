"use client";

import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingPassage } from "@/types/reading";

export function ReadingPassageViewer({ passage }: { passage: ReadingPassage }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">
            <FileText className="h-3.5 w-3.5" />
            {passage.textType}
          </Badge>
          <Badge variant="neutral">{t.reading.session.wordCountLabel(passage.estimatedWordCount)}</Badge>
        </div>
        <CardTitle className="mt-1">{passage.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-sm leading-7 text-foreground">{passage.body}</p>
      </CardContent>
    </Card>
  );
}
