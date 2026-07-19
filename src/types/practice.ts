export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  minWords: number;
  delfExercise: string;
}

export interface QuizQuestion {
  id: string;
  word: string;
  question: string;
  options: string[];
}
