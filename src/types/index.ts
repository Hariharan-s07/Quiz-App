// ─── Quiz Types ───────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple-choice' | 'true-false';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface QuizConfig {
  topic: string;
  numQuestions: number;
  difficulty: Difficulty;
  enableTimer: boolean;
  timeLimitSeconds: number; // per question
}

// ─── Quiz Session (active quiz) ───────────────────────────────────────────────

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeTakenSeconds: number;
}

export type QuizStatus = 'idle' | 'generating' | 'active' | 'paused' | 'completed';

export interface QuizSession {
  id: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  answers: Record<string, UserAnswer>; // questionId -> answer
  currentQuestionIndex: number;
  status: QuizStatus;
  startedAt: number; // timestamp
  completedAt?: number; // timestamp
  totalTimeSeconds: number;
}

// ─── Quiz History ─────────────────────────────────────────────────────────────

export interface QuizHistoryEntry {
  id: string;
  topic: string;
  difficulty: Difficulty;
  numQuestions: number;
  score: number;         // correct count
  percentage: number;
  totalTimeSeconds: number;
  completedAt: number;  // timestamp
  questions: QuizQuestion[];
  answers: Record<string, UserAnswer>;
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface CategoryPerformance {
  topic: string;
  attempts: number;
  avgScore: number;
  bestScore: number;
}

export interface PerformanceTrend {
  date: string;
  score: number;
  topic: string;
}
