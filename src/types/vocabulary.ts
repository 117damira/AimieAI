export interface WordOfTheDay {
  id: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  icon: string;
  goodContexts: string[];
  badContexts: string[];
  exampleSentences: string[];
}

export interface VocabularyEntry {
  id: string;
  word: string;
  definition: string;
  learnedOn: string;
  mastery: "new" | "learning" | "mastered";
}
