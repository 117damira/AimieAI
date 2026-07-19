import type { WordOfTheDay, VocabularyEntry } from "@/types";

export const WORD_OF_THE_DAY: WordOfTheDay = {
  id: "wotd_1",
  word: "néanmoins",
  partOfSpeech: "adverb",
  pronunciation: "/ne.ɑ̃.mwɛ̃/",
  icon: "📖",
  definition: {
    en: "Nevertheless; however — used to introduce a contrasting idea.",
    ru: "Тем не менее; однако — используется для введения противоположной идеи.",
    kz: "Соған қарамастан; дегенмен — қарама-қайшы ойды енгізу үшін қолданылады.",
  },
  goodContexts: {
    en: [
      "Formal writing and essays (DELF production écrite)",
      "Connecting two contrasting formal statements",
    ],
    ru: [
      "Формальное письмо и эссе (письменная часть DELF)",
      "Связывание двух противоположных формальных утверждений",
    ],
    kz: [
      "Ресми жазу және эссе (DELF жазбаша бөлімі)",
      "Екі қарама-қайшы ресми пікірді байланыстыру",
    ],
  },
  badContexts: {
    en: [
      "Casual spoken conversation with friends",
      "As a sentence starter without a prior contrasting idea",
    ],
    ru: [
      "Непринуждённая устная беседа с друзьями",
      "Как начало предложения без предшествующей противоположной идеи",
    ],
    kz: [
      "Достармен еркін ауызша сөйлесу",
      "Алдыңғы қарама-қайшы ой жоқ кезде сөйлемді бастау үшін",
    ],
  },
  exampleSentences: [
    "Il pleuvait fort ; néanmoins, nous avons continué la randonnée.",
    "Le projet était risqué ; néanmoins, l'équipe a décidé de continuer.",
  ],
};

export const VOCABULARY_HISTORY: VocabularyEntry[] = [
  {
    id: "v1",
    word: "néanmoins",
    definition: { en: "Nevertheless, however", ru: "Тем не менее, однако", kz: "Соған қарамастан, дегенмен" },
    learnedOn: "2026-07-18",
    mastery: "new",
  },
  {
    id: "v2",
    word: "davantage",
    definition: { en: "More, further", ru: "Больше, более", kz: "Көбірек, одан әрі" },
    learnedOn: "2026-07-17",
    mastery: "learning",
  },
  {
    id: "v3",
    word: "malgré",
    definition: { en: "Despite, in spite of", ru: "Несмотря на", kz: "Қарамастан" },
    learnedOn: "2026-07-16",
    mastery: "learning",
  },
  {
    id: "v4",
    word: "parvenir",
    definition: { en: "To manage to, to reach", ru: "Суметь, достичь", kz: "Қол жеткізу, жету" },
    learnedOn: "2026-07-15",
    mastery: "mastered",
  },
  {
    id: "v5",
    word: "quotidien",
    definition: { en: "Daily, everyday", ru: "Ежедневный, повседневный", kz: "Күнделікті" },
    learnedOn: "2026-07-14",
    mastery: "mastered",
  },
  {
    id: "v6",
    word: "souligner",
    definition: { en: "To underline, to emphasize", ru: "Подчеркнуть, выделить", kz: "Асты сызу, атап көрсету" },
    learnedOn: "2026-07-13",
    mastery: "mastered",
  },
];
