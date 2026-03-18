import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import ResultsView from '@/components/results/ResultsView';
import AIChatAssistant from '@/components/chat/AIChatAssistant';

export const metadata: Metadata = {
  title: 'Results — QuizAI',
  description: 'See your quiz results and detailed breakdown.',
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ResultsView />
      </main>
      <AIChatAssistant />
    </div>
  );
}
