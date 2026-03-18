import type { QuizConfig, QuizQuestion } from '@/types';

export interface GenerateQuestionsResponse {
  questions: QuizQuestion[];
  error?: string;
}

export async function generateQuizQuestions(
  config: QuizConfig
): Promise<GenerateQuestionsResponse> {
  const response = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to generate quiz: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export async function sendChatMessage(
  message: string,
  context: {
    topic: string;
    currentQuestion?: string;
    correctAnswer?: string;
  }
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get AI response');
  }

  return response.json();
}
