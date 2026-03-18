import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured.' },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemContext = `You are a helpful quiz assistant. The user is taking a quiz about "${context?.topic ?? 'general knowledge'}". 
${context?.currentQuestion ? `Current question: "${context.currentQuestion}"` : ''}
${context?.correctAnswer ? `The correct answer is: "${context.correctAnswer}"` : ''}

Be concise (max 3 paragraphs), educational, and friendly. If the user asks for a hint, give a subtle clue without revealing the answer directly.`;

    const result = await model.generateContent(
      `${systemContext}\n\nUser question: ${message}`
    );

    return NextResponse.json({ message: result.response.text() });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
