"use client";

import { MessageSquareText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { GeneratedTopicChoice } from "@/types/speaking-evaluation";

export function SpeakingTopicChoice({
  topics,
  onSelect,
}: {
  topics: GeneratedTopicChoice[];
  onSelect: (topic: GeneratedTopicChoice) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-foreground">{t.speaking.chooseTopic}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {topics.map((topic, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle className="text-base">{topic.title}</CardTitle>
              </div>
              <CardDescription>{topic.translation}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => onSelect(topic)}>
                {t.speaking.selectTopic}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
