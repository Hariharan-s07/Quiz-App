import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import type { QuizConfig, QuizQuestion, QuizOption, Difficulty } from '@/types';

const cache = new Map<string, { questions: QuizQuestion[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCacheKey(config: QuizConfig): string {
  return `${config.topic.toLowerCase()}-${config.numQuestions}-${config.difficulty}`;
}

function buildPrompt(config: QuizConfig): string {
  const difficultyInstructions: Record<Difficulty, string> = {
    easy: 'Use simple, well-known facts. Beginner level.',
    medium: 'Use moderately complex knowledge. Intermediate level.',
    hard: 'Use advanced, nuanced, or specific knowledge. Expert level.',
  };

  return `You are a quiz generator. Generate exactly ${config.numQuestions} multiple-choice quiz questions about the topic: "${config.topic}".

Difficulty: ${config.difficulty.toUpperCase()} - ${difficultyInstructions[config.difficulty]}

REQUIREMENTS:
- Each question must have exactly 4 answer options labeled A, B, C, D
- Only one option is correct
- Provide a clear explanation for the correct answer
- Questions must be unique and not repetitive
- Make the distractors (wrong answers) plausible and educational

RESPOND WITH VALID JSON ONLY. No markdown, no extra text, just JSON in this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"}
      ],
      "correctOptionId": "a",
      "explanation": "Explanation of why the correct answer is correct."
    }
  ]
}`;
}

interface RawQuestion {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

function parseAndValidate(raw: string, config: QuizConfig): QuizQuestion[] {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No valid JSON found in the response');
  }
  const cleaned = match[0].trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response structure: missing questions array');
  }

  const questions: QuizQuestion[] = parsed.questions
    .slice(0, config.numQuestions)
    .map((q: RawQuestion): QuizQuestion => {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error('Invalid question structure');
      }

      const options: QuizOption[] = q.options.map((opt) => ({
        id: opt.id ?? uuidv4(),
        text: String(opt.text),
      }));

      const correctOptionId = q.correctOptionId ?? options[0].id;

      return {
        id: uuidv4(),
        question: String(q.question),
        type: options.length === 2 ? 'true-false' : 'multiple-choice',
        options,
        correctOptionId,
        explanation: String(q.explanation ?? ''),
      };
    });

  if (questions.length === 0) {
    throw new Error('No valid questions parsed from response');
  }

  return questions;
}

export async function POST(req: NextRequest) {
  try {
    const config: QuizConfig = await req.json();

    if (!config.topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }
    if (config.numQuestions < 1 || config.numQuestions > 20) {
      return NextResponse.json(
        { error: 'Number of questions must be between 1 and 20' },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(config);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ questions: cached.questions, fromCache: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const prompt = buildPrompt(config);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const questions = parseAndValidate(text, config);

        cache.set(cacheKey, { questions, timestamp: Date.now() });
        return NextResponse.json({ questions });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.error('Quiz generation failed:', lastError);
    return NextResponse.json(
      {
        error:
          lastError?.message ?? 'Failed to generate quiz questions. Please try again.',
      },
      { status: 500 }
    );
  } catch (err) {
    console.error('Unexpected error in generate-quiz route:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
