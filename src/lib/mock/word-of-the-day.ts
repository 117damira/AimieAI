import type { WordOfTheDay, VocabularyEntry } from "@/types";

export const WORD_OF_THE_DAY: WordOfTheDay = {
  id: "wotd_1",
  word: "néanmoins",
  partOfSpeech: "adverb",
  pronunciation: "/ne.ɑ̃.mwɛ̃/",
  icon: "📖",
  definition: "Nevertheless; however — used to introduce a contrasting idea.",
  goodContexts: [
    "Formal writing and essays (DELF production écrite)",
    "Connecting two contrasting formal statements",
  ],
  badContexts: [
    "Casual spoken conversation with friends",
    "As a sentence starter without a prior contrasting idea",
  ],
  exampleSentences: [
    "Il pleuvait fort ; néanmoins, nous avons continué la randonnée.",
    "Le projet était risqué ; néanmoins, l'équipe a décidé de continuer.",
  ],
};

export const VOCABULARY_HISTORY: VocabularyEntry[] = [
  { id: "v1", word: "néanmoins", definition: "Nevertheless, however", learnedOn: "2026-07-18", mastery: "new" },
  { id: "v2", word: "davantage", definition: "More, further", learnedOn: "2026-07-17", mastery: "learning" },
  { id: "v3", word: "malgré", definition: "Despite, in spite of", learnedOn: "2026-07-16", mastery: "learning" },
  { id: "v4", word: "parvenir", definition: "To manage to, to reach", learnedOn: "2026-07-15", mastery: "mastered" },
  { id: "v5", word: "quotidien", definition: "Daily, everyday", learnedOn: "2026-07-14", mastery: "mastered" },
  { id: "v6", word: "souligner", definition: "To underline, to emphasize", learnedOn: "2026-07-13", mastery: "mastered" },
];
