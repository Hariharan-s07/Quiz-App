'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Clock, Target, ChevronDown, ChevronUp,
  RotateCcw, Home, CheckCircle2, XCircle, Minus,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { formatTime, getScoreColor, getScoreGradient } from '@/lib/utils';
import { useState } from 'react';

export default function ResultsView() {
  const router = useRouter();
  const { session, resetSession, startSession } = useQuizStore();
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!session || session.status !== 'completed')) {
      router.replace('/');
    }
  }, [session, router, mounted]);

  const stats = useMemo(() => {
    if (!session) return null;
    const answers = Object.values(session.answers);
    const correct = answers.filter((a) => a.isCorrect).length;
    const incorrect = answers.filter((a) => !a.isCorrect && a.selectedOptionId !== null).length;
    const skipped = answers.filter((a) => a.selectedOptionId === null).length;
    const unanswered = session.questions.length - answers.length;
    const percentage = Math.round((correct / session.questions.length) * 100);
    return { correct, incorrect, skipped: skipped + unanswered, percentage };
  }, [session, mounted]);

  if (!mounted) return null;

  if (!session || !stats) return null;

  const handleRetake = () => {
    startSession(session.config, session.questions);
    router.push('/quiz');
  };

  const scoreColor = getScoreColor(stats.percentage);
  const scoreGrad = getScoreGradient(stats.percentage);

  const getMessage = () => {
    if (stats.percentage >= 90) return { text: 'Outstanding! 🏆', sub: 'You truly mastered this topic!' };
    if (stats.percentage >= 75) return { text: 'Great job! 🎉', sub: 'You have a solid understanding.' };
    if (stats.percentage >= 60) return { text: 'Good effort! 👍', sub: 'Keep practicing to improve.' };
    if (stats.percentage >= 40) return { text: 'Keep going! 📚', sub: "You're on the right track." };
    return { text: 'Keep learning! 💪', sub: 'Review the material and try again.' };
  };

  const message = getMessage();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="glass-card rounded-2xl p-8 border border-white/[0.06] text-center relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${scoreGrad} opacity-[0.04] pointer-events-none`} />

        <div className={`text-7xl font-black mb-2 ${scoreColor}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {stats.percentage}%
        </div>
        <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
          <div
            className={`h-full bg-gradient-to-r ${scoreGrad} rounded-full transition-all duration-1000`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">{message.text}</h2>
        <p className="text-gray-400">{message.sub}</p>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-gray-300 capitalize">{session.config.topic}</span>
          <span>·</span>
          <span className="capitalize">{session.config.difficulty}</span>
        </div>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Correct', value: stats.correct, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Incorrect', value: stats.incorrect, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
          { label: 'Skipped', value: stats.skipped, icon: Minus, color: 'text-gray-400', bg: 'bg-white/[0.04] border-white/[0.08]' },
          { label: 'Time Taken', value: formatTime(session.totalTimeSeconds), icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card rounded-xl p-4 border ${stat.bg} text-center`}>
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Question Breakdown</h3>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {session.questions.map((q, idx) => {
            const answer = session.answers[q.id];
            const isCorrect = answer?.isCorrect ?? false;
            const isSkipped = !answer || answer.selectedOptionId === null;
            const selectedOption = q.options.find((o) => o.id === answer?.selectedOptionId);
            const correctOption = q.options.find((o) => o.id === q.correctOptionId);
            const isExpanded = expandedQ === q.id;

            return (
              <div key={q.id} className="p-4">
                <button
                  id={`breakdown-q-${idx}`}
                  onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  <span className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isSkipped ? 'bg-gray-500/20 text-gray-400' : isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 line-clamp-2">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isSkipped ? (
                        <span className="text-xs text-gray-500">Skipped / Timed out</span>
                      ) : isCorrect ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Incorrect
                        </span>
                      )}
                      {answer && (
                        <span className="text-xs text-gray-600">
                          · {answer.timeTakenSeconds}s
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="flex-shrink-0 w-4 h-4 text-gray-500 mt-0.5" />
                  ) : (
                    <ChevronDown className="flex-shrink-0 w-4 h-4 text-gray-500 mt-0.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 pl-9 space-y-2 animate-fade-in-up">
                    {!isCorrect && selectedOption && (
                      <div className="text-xs p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <span className="text-rose-400 font-medium">Your answer: </span>
                        <span className="text-gray-300">{selectedOption.text}</span>
                      </div>
                    )}
                    <div className="text-xs p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-emerald-400 font-medium">Correct answer: </span>
                      <span className="text-gray-300">{correctOption?.text}</span>
                    </div>
                    {q.explanation && (
                      <div className="text-xs p-3 rounded-lg bg-indigo-500/[0.07] border border-indigo-500/20">
                        <span className="text-indigo-400 font-medium">Explanation: </span>
                        <span className="text-gray-400">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="retake-quiz-btn"
          onClick={handleRetake}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-ghost text-sm font-semibold text-gray-300"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </button>
        <Link
          href="/"
          id="new-quiz-btn"
          onClick={() => resetSession()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-primary text-sm font-semibold text-white"
        >
          <Home className="w-4 h-4" />
          New Quiz
        </Link>
      </div>
    </div>
  );
}
