import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import QuizHistory from '@/components/history/QuizHistory';

export const metadata: Metadata = {
  title: 'History — QuizAI',
  description: 'View your quiz history and retry past quizzes.',
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <QuizHistory />
      </main>
    </div>
  );
}
