"use client";

import { BookText, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingVocabularyItem } from "@/types/reading";

/**
 * "New Vocabulary" section (Vocabulary Extraction feature) — every word
 * comes straight from the generated ReadingSet.vocabulary (extracted from
 * the actual passage(s), never invented independently). "Save to
 * Vocabulary" is deduped against the student's real vocabularyProgress by
 * UserProfileContext.addVocabularyWord, so the same word never appears
 * twice even if saved from multiple sessions.
 */
export function ReadingVocabularyCard({
  vocabulary,
  savedWords,
  onSave,
}: {
  vocabulary: ReadingVocabularyItem[];
  savedWords: Set<string>;
  onSave: (item: ReadingVocabularyItem) => void;
}) {
  const { t } = useLanguage();
  const v = t.reading.newVocabulary;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookText className="h-[18px] w-[18px] text-primary-600" />
          <CardTitle>{v.title}</CardTitle>
        </div>
        <CardDescription>{v.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {vocabulary.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-center text-sm text-muted">{v.emptyState}</div>
        ) : (
          vocabulary.map((item) => {
            const isSaved = savedWords.has(item.term.toLowerCase());
            return (
              <div key={item.term} className="flex flex-col gap-2 rounded-2xl bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-base font-semibold text-foreground">{item.term}</span>
                    <span className="text-sm text-muted">— {item.translation}</span>
                  </div>
                  {isSaved ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {v.savedBadge}
                    </Badge>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => onSave(item)}>
                      {v.saveButton}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{v.definitionLabel}: </span>
                  {item.definition}
                </p>
                <p className="text-xs italic text-muted">
                  <span className="not-italic font-medium text-foreground">{v.exampleLabel}: </span>
                  {item.exampleSentence}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
