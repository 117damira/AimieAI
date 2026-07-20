import type { ExamConfig, ExamId } from "@/types";

/**
 * Central exam registry. Every exam the platform supports (or will support)
 * is declared here. Pages and components should read exam metadata from
 * this registry rather than hardcoding "DELF" strings, so adding TOPIK or
 * HSK later means adding an entry here, not rewriting pages.
 */
export const EXAMS: Record<ExamId, ExamConfig> = {
  delf: {
    id: "delf",
    name: "DELF",
    fullName: "Diplôme d'Études en Langue Française",
    language: "French",
    level: "A1 – B2",
    description:
      "Official French language diploma. The MVP focuses entirely on DELF to deliver deep, high-quality feedback for one exam before expanding.",
    isActive: true,
    supportedSkills: ["vocabulary", "speaking", "writing", "quiz"],
  },
  topik: {
    id: "topik",
    name: "TOPIK",
    fullName: "Test of Proficiency in Korean",
    language: "Korean",
    level: "Level 1 – 6",
    description: "Planned for a future release.",
    isActive: false,
    supportedSkills: [],
  },
  hsk: {
    id: "hsk",
    name: "HSK",
    fullName: "Hanyu Shuiping Kaoshi (Chinese Proficiency Test)",
    language: "Chinese",
    level: "HSK 1 – 6",
    description: "Planned for a future release.",
    isActive: false,
    supportedSkills: [],
  },
};

/** The exam active in this MVP build. Every page currently targets this exam. */
export const ACTIVE_EXAM: ExamConfig = EXAMS.delf;
