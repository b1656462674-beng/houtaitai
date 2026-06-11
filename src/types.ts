export type Language = '英语' | '中文' | '日语' | '韩语' | '法语';

export type QuestionType = '单选' | '多选' | '填空';

export type Difficulty = '简单' | '中等' | '困难';

export type Dimension = '词汇' | '语法' | '阅读' | '听力';

export interface BlankAnswerConfig {
  id: string; // e.g., "填空1" or "blank1"
  label: string; // human-readable name, e.g., "填空 1"
  acceptableAnswers: string[]; // List of acceptable correct answers
  placeholder?: string; // Optional helper text for the user
}

export interface Question {
  id: string;
  language: Language;
  type: QuestionType;
  difficulty: Difficulty;
  dimension: Dimension;
  originalArticle: string; // 文章原文
  articleContent: string;  // 文章内容 (contains blanks like [填空1], [填空2] for fill-in-the-blank)
  originalQuestion: string; // 题目原文
  questionContent: string;  // 题目内容
  imageUrl?: string;
  options?: string[]; // For single/multi choice
  correctOption?: string | string[]; // Selected options for single/multi choice (e.g. "A" or ["A", "B"])
  blankAnswers?: BlankAnswerConfig[]; // For fill-in-the-blank question type
  enabled: boolean; // 状态 (启用/禁用)
  createdAt: string;
}

export interface PracticeRecord {
  id: string;
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  userAnswers: { [key: string]: string }; // For blanks: { "填空1": "third" } or choices: { "choice": "B" }
  isCorrect: boolean;
  score: number; // e.g., 100 for correct, 0 for incorrect, or partial score
  timeSpentSeconds: number;
  createdAt: string;
}
