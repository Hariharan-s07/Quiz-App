import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import QuizConfigForm from '@/components/quiz/QuizConfigForm';
import { Brain, Zap, Target, History } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'QuizAI — Generate AI-Powered Quizzes Instantly',
  description: 'Create personalized quizzes on any topic using Google Gemini AI. Choose difficulty, question count, and start learning.',
};

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Powered by Google Gemini to generate intelligent, contextual questions on any topic.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Get unique quiz questions in seconds. No pre-made question banks, fully dynamic.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Adaptive Difficulty',
    description: 'Easy, Medium, or Hard — tailored to your knowledge level for optimal learning.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: History,
    title: 'Track Progress',
    description: 'Full history and analytics to monitor your growth over time.',
    color: 'from-rose-500 to-pink-500',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative z-10">
      <Navbar />

      <main className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center">
          <div className="text-center mb-14 w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 animate-float">
              <Zap className="w-4 h-4" />
              Powered by Google Gemini AI
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Master Any Topic with{' '}
              <span className="gradient-text">AI-Powered</span>
              <br />Quizzes
            </h1>
            <p className="text-lg text-gray-400 mx-auto mb-8 text-center leading-relaxed">
              Generate personalized multiple-choice quizzes on any subject instantly.
              Track your progress, analyze performance, and learn faster.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              {['✓ Free to use', '✓ No sign-up required', '✓ Instant generation', '✓ Detailed analytics'].map((item) => (
                <span key={item} className="text-gray-500">{item}</span>
              ))}
            </div>
          </div>

        <QuizConfigForm />

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group text-center"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-center">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed text-center">{feat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-10 flex items-center justify-center gap-4 text-sm text-gray-600">
          <Link href="/history" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            <History className="w-4 h-4" />
            View History
          </Link>
          <span>·</span>
          <Link href="/analytics" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            View Analytics
          </Link>
        </div>
        </div>
      </main>
    </div>
  );
}
