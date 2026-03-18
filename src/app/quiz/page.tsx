import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import QuizInterface from '@/components/quiz/QuizInterface';
import AIChatAssistant from '@/components/chat/AIChatAssistant';

export const metadata: Metadata = {
  title: 'Quiz — QuizAI',
  description: 'Take your AI-generated quiz.',
};

export default function QuizPage() {
  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <QuizInterface />
      </main>
      <AIChatAssistant />
    </div>
  );
}
