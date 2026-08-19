export type ExamId = "delf" | "topik" | "hsk" | "ielts" | "jlpt" | "toefl";

export type ExamSkillId = "vocabulary" | "speaking" | "writing" | "reading" | "listening" | "quiz";

export interface ExamConfig {
  id: ExamId;
  name: string;
  fullName: string;
  language: string;
  level: string;
  description: string;
  /** Whether this exam is selectable in onboarding; inactive exams are reserved for future scaling. */
  isActive: boolean;
  supportedSkills: ExamSkillId[];
}
