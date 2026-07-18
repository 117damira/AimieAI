export type ExamId = "delf" | "ielts" | "sat";

export type ExamSkillId = "vocabulary" | "speaking" | "writing" | "quiz";

export interface ExamConfig {
  id: ExamId;
  name: string;
  fullName: string;
  language: string;
  level: string;
  description: string;
  /** Only DELF is implemented for the MVP; others are reserved for future scaling. */
  isActive: boolean;
  supportedSkills: ExamSkillId[];
}
