import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics — QuizAI',
  description: 'Analyze your quiz performance trends and category breakdowns.',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
