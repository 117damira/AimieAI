import type { FeedbackLanguage } from "@/types/writing-evaluation";
import { findContainingSentence } from "./text-utils";

/**
 * One shared, transcript/text-grounded French grammar-mistake rule engine —
 * used by Speaking, Writing, and Vocabulary alike. Every rule only fires
 * when its pattern genuinely appears in the real text; `original` is always
 * the actual matched substring (never a canned phrase), and `correction` is
 * computed FROM that substring. A gender-agreement mistake is a
 * gender-agreement mistake regardless of which feature is grading it — this
 * is the concrete shared core across all three domains.
 */

type TranslatedText = Record<FeedbackLanguage, string>;

export interface GrammarRule {
  id: string;
  category: "verb" | "agreement" | "sentence-structure" | "other";
  regex: RegExp;
  correction: (matched: string) => string;
  explanation: TranslatedText;
  betterExample: string;
}

const JE_CONJUGATION_MAP: Record<string, string> = {
  aimer: "j'aime",
  vouloir: "je veux",
  pouvoir: "je peux",
  aller: "je vais",
  faire: "je fais",
  habiter: "j'habite",
  parler: "je parle",
  manger: "je mange",
  travailler: "je travaille",
  étudier: "j'étudie",
  avoir: "j'ai",
  être: "je suis",
  jouer: "je joue",
  regarder: "je regarde",
  écouter: "j'écoute",
};

const SUBJONCTIF_JE_MAP: Record<string, string> = { vais: "aille", peux: "puisse", veux: "veuille", fais: "fasse" };
const SUBJONCTIF_IL_MAP: Record<string, string> = { est: "soit", a: "ait", peut: "puisse", doit: "doive", va: "aille" };

const ETRE_VERB_PARTICIPLE_PATTERN = /^(allé|arrivé|parti|venu|entré|sorti|monté|descendu|resté|tombé|né)/i;
const AVOIR_CONJ_BY_PRONOUN: Record<string, string> = {
  tu: "as", il: "a", elle: "a", nous: "avons", vous: "avez", ils: "ont", elles: "ont",
};
const ETRE_CONJ_BY_PRONOUN: Record<string, string> = {
  tu: "es", il: "est", elle: "est", nous: "sommes", vous: "êtes", ils: "sont", elles: "sont",
};
const FEMININE_ADJECTIVE_MAP: Record<string, string> = {
  blanc: "blanche", grand: "grande", petit: "petite", beau: "belle", nouveau: "nouvelle", vieux: "vieille", bon: "bonne",
};
const FEMININE_NOUNS = [
  "maison", "voiture", "ville", "chose", "idée", "université", "semaine", "année", "table", "chambre", "cuisine",
];
const PLURAL_NOUNS = ["voiture", "maison", "table", "chaise", "idée", "ville", "livre", "ami", "amie"];

// English connector words that sometimes slip into a French sentence
// (e.g. a direct word-for-word translation). Kept to unambiguous cases
// with no legitimate French reading, so this never false-positives on a
// genuine French word.
const ENGLISH_CONNECTOR_TO_FRENCH: Record<string, string> = {
  and: "et",
  but: "mais",
  because: "parce que",
  with: "avec",
};

// Common beginner mistake: after avoir in the passé composé, a bare noun/stem
// is written instead of the actual past participle (e.g. "j'ai travail"
// instead of "j'ai travaillé" — "travail" is itself a real word, the noun
// "work", so this can't be derived by simply appending "é" to a verb stem).
const AVOIR_BARE_FORM_TO_PARTICIPLE: Record<string, string> = {
  travail: "travaillé",
  mange: "mangé",
  parle: "parlé",
  joue: "joué",
  regarde: "regardé",
  ecoute: "écouté",
  aime: "aimé",
  habite: "habité",
  etudie: "étudié",
  chante: "chanté",
  danse: "dansé",
  visite: "visité",
};

export const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "etre-age",
    category: "verb",
    regex: /\bje\s+suis\s+([a-zà-ÿ0-9-]+)\s+ans?\b/i,
    correction: (m) => m.replace(/\bje\s+suis\b/i, "j'ai"),
    explanation: {
      en: "Age is expressed with \"avoir\" (avoir + age), not \"être\".",
      ru: "Возраст выражается с помощью глагола «avoir» (avoir + возраст), а не «être».",
      kz: "Жас мөлшері «avoir» етістігімен беріледі (avoir + жас), «être» емес.",
    },
    betterExample: "J'ai vingt ans et mon frère a dix-huit ans.",
  },
  {
    id: "gender-article",
    category: "agreement",
    regex: new RegExp(`\\bun\\s+(${FEMININE_NOUNS.join("|")})(?![a-zà-ÿ])`, "i"),
    correction: (m) => m.replace(/\bun\b/i, "une"),
    explanation: {
      en: "This noun is feminine, so it takes \"une\", not \"un\".",
      ru: "Это существительное женского рода, поэтому употребляется с «une», а не «un».",
      kz: "Бұл зат есім әйел тегінде, сондықтан «une» қолданылады, «un» емес.",
    },
    betterExample: "J'habite dans une maison avec un grand jardin.",
  },
  {
    id: "plural-missing-s",
    category: "agreement",
    regex: new RegExp(`\\b(les|des)\\s+(${PLURAL_NOUNS.join("|")})(?![a-zà-ÿs])`, "i"),
    correction: (m) => m.replace(/(\S+)$/, "$1s"),
    explanation: {
      en: "After \"les\"/\"des\" the noun must be plural — add the missing \"s\".",
      ru: "После «les»/«des» существительное должно стоять во множественном числе — добавьте пропущенное «s».",
      kz: "«Les»/«des»-тен кейін зат есім көпше түрде болуы керек — жетіспейтін «s»-ті қосыңыз.",
    },
    betterExample: "J'ai vu les voitures rouges dans la rue.",
  },
  {
    id: "infinitive-not-conjugated",
    category: "sentence-structure",
    regex: new RegExp(`\\bje\\s+(${Object.keys(JE_CONJUGATION_MAP).join("|")})\\b`, "i"),
    correction: (m) => {
      const verb = m.trim().split(/\s+/)[1]?.toLowerCase() ?? "";
      return JE_CONJUGATION_MAP[verb] ?? m;
    },
    explanation: {
      en: "The verb must be conjugated, not left in the infinitive.",
      ru: "Глагол нужно спрягать, а не оставлять в инфинитиве.",
      kz: "Етістік тұйық түрде қалмай, жіктелуі керек.",
    },
    betterExample: "J'aime le sport et je joue au football le week-end.",
  },
  {
    id: "passe-compose-aux",
    category: "verb",
    // Trailing lookahead (not `\b`) because `\b` never matches right after an
    // accented vowel like "é" in JS regex (it isn't a `\w` character) — with
    // `\b` here, masculine singular forms ("j'ai allé") would silently fail
    // to match while "e"/"s"-suffixed forms happened to still work.
    regex: /\bj['’]ai\s+(allée?s?|arrivée?s?|partie?s?|venue?s?|entrée?s?|sortie?s?|montée?s?|descendue?s?|restée?s?|tombée?s?|née?s?)(?![a-zà-ÿ])/i,
    correction: (m) => m.replace(/j['’]ai/i, "je suis"),
    explanation: {
      en: "This verb takes \"être\" as its auxiliary in the passé composé, not \"avoir\".",
      ru: "Этот глагол в passé composé спрягается с «être», а не с «avoir».",
      kz: "Бұл етістік passé composé-де «être» көмекші етістігімен тіркеседі, «avoir» емес.",
    },
    betterExample: "Hier, je suis allé(e) au cinéma avec des amis.",
  },
  {
    id: "preposition-penser-de",
    category: "other",
    regex: /\bje\s+pense\s+de\s+\w+/i,
    correction: (m) => m.replace(/\spense\s+de\s+/i, " pense "),
    explanation: {
      en: "\"Penser\" + infinitive doesn't take \"de\" when expressing an intention.",
      ru: "«Penser» + инфинитив не требует предлога «de» при выражении намерения.",
      kz: "Ниетті білдіргенде «penser» + тұйық етістік «de» септеулігін қажет етпейді.",
    },
    betterExample: "Je pense sortir ce soir avec ma sœur.",
  },
  {
    id: "agreement-participle-elle",
    category: "agreement",
    // `(?![a-zà-ÿ])` instead of `\b(?!e)` — see the passe-compose-aux rule's
    // comment above; this also doubles as the "not already agreed" check,
    // since a following "e" (as in "allée") already fails the lookahead.
    regex: /\belle\s+est\s+(allé|arrivé|parti|venu|entré|sorti|monté|descendu|resté|tombé|né)(?![a-zà-ÿ])/i,
    correction: (m) => `${m}e`,
    explanation: {
      en: "With \"être\", the past participle agrees with the subject: it needs an \"e\" for a feminine subject.",
      ru: "С «être» причастие прошедшего времени согласуется с подлежащим: для женского рода нужна «e».",
      kz: "«Être»-мен есімше бастауышпен келіседі: әйелдік тек үшін «e» қажет.",
    },
    betterExample: "Elle est allée au marché ce matin.",
  },
  {
    id: "subjonctif-il-faut-que",
    category: "verb",
    regex: /\bil\s+faut\s+que\s+je\s+(vais|peux|veux|fais)\b/i,
    correction: (m) => {
      const match = m.match(/(vais|peux|veux|fais)$/i);
      const verb = match ? match[1].toLowerCase() : "";
      const subj = SUBJONCTIF_JE_MAP[verb] ?? verb;
      const jePart = /^[aeiouhâêîôûéèë]/i.test(subj) ? "j'" : "je ";
      return m.replace(/je\s+(vais|peux|veux|fais)$/i, `${jePart}${subj}`);
    },
    explanation: {
      en: "\"Il faut que\" requires the subjunctive, not the indicative.",
      ru: "«Il faut que» требует сослагательного наклонения, а не изъявительного.",
      kz: "«Il faut que» бағыныңқы райды талап етеді, ашық рай емес.",
    },
    betterExample: "Il faut que j'aille au rendez-vous avant midi.",
  },
  {
    id: "double-comparative",
    category: "sentence-structure",
    regex: /\bplus\s+meilleur\b/i,
    correction: (m) => m.replace(/plus\s+meilleur/i, "meilleur"),
    explanation: {
      en: "\"Meilleur\" is already the comparative of \"bon\" — adding \"plus\" doubles the comparison.",
      ru: "«Meilleur» уже является сравнительной формой «bon» — добавление «plus» создаёт двойное сравнение.",
      kz: "«Meilleur» «bon» сөзінің салыстырмалы түрі — «plus» қосу қосарланған салыстыру жасайды.",
    },
    betterExample: "Ce restaurant est meilleur que l'autre.",
  },
  {
    id: "anglicism-definitivement",
    category: "other",
    regex: /\bdéfinitivement\b/i,
    correction: (m) => m.replace(/définitivement/i, "tout à fait"),
    explanation: {
      en: "\"Définitivement\" is an anglicism here; \"tout à fait\" is the natural French equivalent.",
      ru: "«Définitivement» здесь — англицизм; естественный французский эквивалент — «tout à fait».",
      kz: "Бұл жерде «définitivement» — ағылшыншылдық; табиғи француз баламасы — «tout à fait».",
    },
    betterExample: "Je suis tout à fait d'accord avec cette proposition.",
  },
  {
    id: "subjonctif-bien-que",
    category: "verb",
    regex: /\bbien\s+(qu['’]il|qu['’]elle)\s+(est|a|peut|doit|va)\b/i,
    correction: (m) => {
      const match = m.match(/(est|a|peut|doit|va)$/i);
      const verb = match ? match[1].toLowerCase() : "";
      const subj = SUBJONCTIF_IL_MAP[verb] ?? verb;
      return m.replace(new RegExp(`${verb}$`, "i"), subj);
    },
    explanation: {
      en: "\"Bien que\" always triggers the subjunctive, not the indicative.",
      ru: "«Bien que» всегда требует сослагательного наклонения, а не изъявительного.",
      kz: "«Bien que» әрқашан бағыныңқы райды талап етеді, ашық рай емес.",
    },
    betterExample: "Bien qu'il soit difficile de changer ses habitudes, il faut essayer.",
  },
  {
    id: "nuance-absolu",
    category: "other",
    regex: /\b(totalement|complètement)\s+faux\b/i,
    correction: (m) => m.replace(/(totalement|complètement)\s+faux/i, "en grande partie inexact"),
    explanation: {
      en: "At higher levels, absolute statements benefit from more nuanced hedging language.",
      ru: "На продвинутом уровне категоричные утверждения лучше смягчать более нюансированными формулировками.",
      kz: "Жоғары деңгейде категориялық тұжырымдарды нәзігірек тілмен жеткізген жөн.",
    },
    betterExample: "Cela me semble en grande partie inexact, à mon avis.",
  },
  {
    id: "stacked-connectors",
    category: "sentence-structure",
    regex: /\bcependant,?\s+néanmoins\b/i,
    correction: (m) => m.replace(/,?\s+néanmoins/i, ""),
    explanation: {
      en: "Avoid stacking two contrastive connectors in a row — pick one to keep the argument clear.",
      ru: "Избегайте нагромождения двух противительных союзов подряд — выберите один для ясности аргумента.",
      kz: "Екі қарсы мәнді жалғаулықты қатар қоймаңыз — дәлелдің анықтығы үшін біреуін таңдаңыз.",
    },
    betterExample: "Cependant, il faut reconnaître que la situation est complexe.",
  },
  {
    id: "etre-infinitive-passe-compose",
    category: "verb",
    regex: /\b(nous|vous|tu|il|elle|ils|elles)\s+être\s+([a-zà-ÿ]+)(?![a-zà-ÿ])/i,
    correction: (m) => {
      const match = m.match(/^(nous|vous|tu|il|elle|ils|elles)\s+être\s+([a-zà-ÿ]+)$/i);
      if (!match) return m;
      const [, pronounRaw, participle] = match;
      const pronoun = pronounRaw.toLowerCase();
      const conjMap = ETRE_VERB_PARTICIPLE_PATTERN.test(participle) ? ETRE_CONJ_BY_PRONOUN : AVOIR_CONJ_BY_PRONOUN;
      const aux = conjMap[pronoun] ?? participle;
      return `${pronounRaw} ${aux} ${participle}`;
    },
    explanation: {
      en: "\"Être\" was left as the infinitive instead of being conjugated for the passé composé. The correct auxiliary — \"avoir\" for most verbs, or a conjugated form of \"être\" for a small set of motion/state verbs — depends on the specific verb.",
      ru: "«Être» осталось в инфинитиве вместо того, чтобы быть спрягаемым для passé composé. Правильный вспомогательный глагол — «avoir» для большинства глаголов или спрягаемая форма «être» для небольшой группы глаголов движения/состояния — зависит от конкретного глагола.",
      kz: "Passé composé үшін «être» жіктелудің орнына тұйық түрде қалып қойды. Дұрыс көмекші етістік — көптеген етістіктер үшін «avoir», ал қозғалыс/күй етістіктерінің шағын тобы үшін жіктелген «être» — нақты етістікке байланысты.",
    },
    betterExample: "Nous avons joué au football hier avec mes amis.",
  },
  {
    id: "adjective-gender-agreement",
    category: "agreement",
    regex: new RegExp(`\\b(${FEMININE_NOUNS.join("|")})\\s+(blanc|grand|petit|beau|nouveau|vieux|bon)\\b`, "i"),
    correction: (m) => {
      const match = m.match(/^(\S+)\s+(\S+)$/);
      if (!match) return m;
      const [, noun, adj] = match;
      const feminine = FEMININE_ADJECTIVE_MAP[adj.toLowerCase()] ?? adj;
      return `${noun} ${feminine}`;
    },
    explanation: {
      en: "This noun is feminine, so the adjective describing it must also take its feminine form.",
      ru: "Это существительное женского рода, поэтому описывающее его прилагательное тоже должно быть в женском роде.",
      kz: "Бұл зат есім әйел тегінде, сондықтан оны сипаттайтын сын есім де әйелдік түрде болуы керек.",
    },
    betterExample: "J'habite dans une grande maison blanche avec un joli jardin.",
  },
  {
    id: "avoir-bare-form-not-participle",
    category: "verb",
    regex: new RegExp(
      `\\b(ai|as|a|avons|avez|ont)\\s+(${Object.keys(AVOIR_BARE_FORM_TO_PARTICIPLE).join("|")})(?![a-zà-ÿ])`,
      "i"
    ),
    correction: (m) => {
      const match = m.match(/^(\S+)\s+(\S+)$/);
      if (!match) return m;
      const [, aux, form] = match;
      const participle = AVOIR_BARE_FORM_TO_PARTICIPLE[form.toLowerCase()] ?? form;
      return `${aux} ${participle}`;
    },
    explanation: {
      en: "After \"avoir\" in the passé composé, the verb must be the past participle, not this bare/uninflected form.",
      ru: "После «avoir» в passé composé глагол должен стоять в форме причастия прошедшего времени, а не в этой неспрягаемой форме.",
      kz: "Passé composé-де «avoir»-дан кейін етістік өткен шақ есімшесі түрінде болуы керек, бұл жіктелмеген түрде емес.",
    },
    betterExample: "Nous avons travaillé beaucoup ce week-end.",
  },
  {
    id: "english-word-in-french-sentence",
    category: "other",
    regex: new RegExp(`\\b(${Object.keys(ENGLISH_CONNECTOR_TO_FRENCH).join("|")})\\b`, "i"),
    correction: (m) => ENGLISH_CONNECTOR_TO_FRENCH[m.toLowerCase()] ?? m,
    explanation: {
      en: "This is an English word — French text should use the French equivalent instead.",
      ru: "Это английское слово — во французском тексте нужно использовать французский эквивалент.",
      kz: "Бұл ағылшын сөзі — француз мәтінінде оның француз баламасын қолдану керек.",
    },
    betterExample: "Je suis fatigué mais content d'être avec ma famille.",
  },
];

export interface GrammarMatch {
  ruleId: string;
  original: string;
  correction: string;
  sentence: string;
}

/** Scans the actual text against every rule and returns only genuine
 * matches — never invents a mistake that wasn't there. Capped (default 6,
 * not a tighter number) so text with several real mistakes doesn't have
 * genuine ones silently dropped. */
export function findGrammarMistakes(text: string, cap = 6): GrammarMatch[] {
  const results: GrammarMatch[] = [];
  for (const rule of GRAMMAR_RULES) {
    const match = text.match(rule.regex);
    if (match && match.index !== undefined) {
      results.push({
        ruleId: rule.id,
        original: match[0],
        correction: rule.correction(match[0]),
        sentence: findContainingSentence(text, match.index, match[0].length),
      });
      if (results.length >= cap) break;
    }
  }
  return results;
}

export function getGrammarRule(ruleId: string): GrammarRule | undefined {
  return GRAMMAR_RULES.find((r) => r.id === ruleId);
}
