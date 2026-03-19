'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Loader2, AlertCircle, Settings, BookOpen, Timer, ChevronDown } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { generateQuizQuestions } from '@/lib/api';
import type { QuizConfig, Difficulty } from '@/types';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400', desc: 'Fundamental concepts' },
  { value: 'medium', label: 'Medium', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400', desc: 'Intermediate knowledge' },
  { value: 'hard', label: 'Hard', color: 'border-rose-500/50 bg-rose-500/10 text-rose-400', desc: 'Expert level' },
];

const TOPIC_SUGGESTIONS = [
  'JavaScript', 'World History', 'Science', 'Geography', 'Movies',
  'Mathematics', 'Biology', 'Space & Astronomy', 'Literature', 'Sports',
];

export default function QuizConfigForm() {
  const router = useRouter();
  const { startSession, resetSession } = useQuizStore();

  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    numQuestions: 10,
    difficulty: 'medium',
    enableTimer: false,
    timeLimitSeconds: 30,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!config.topic.trim()) {
      setError('Please enter a quiz topic.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    resetSession();

    try {
      const { questions } = await generateQuizQuestions(config);
      startSession(config, questions);
      router.push('/quiz');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.06] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Quiz Configuration</h2>
            <p className="text-sm text-gray-500">Customize your learning experience</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label htmlFor="quiz-topic" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Quiz Topic
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g., World War II, JavaScript, Astronomy..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.04] transition-all duration-200 text-sm mb-4"
              disabled={isGenerating}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mb-3">Popular Suggestions:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {TOPIC_SUGGESTIONS.map((topic) => (
                <button
                  key={topic}
                  id={`topic-suggestion-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setConfig({ ...config, topic })}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] transition-all duration-200 whitespace-nowrap"
                  disabled={isGenerating}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="num-questions" className="block text-sm font-semibold text-gray-300 mb-4">
              Number of Questions
            </label>
            <div className="space-y-5">
              <input
                id="num-questions"
                type="range"
                min={5}
                max={20}
                step={1}
                value={config.numQuestions}
                onChange={(e) => setConfig({ ...config, numQuestions: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((config.numQuestions - 5) / 15) * 100}%, rgba(255,255,255,0.1) ${((config.numQuestions - 5) / 15) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between">
                <div className="flex justify-between text-xs text-gray-600 flex-1">
                  <span>5 Questions</span>
                  <span>20 Questions</span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-lg font-bold text-indigo-400">{config.numQuestions}</span>
                  <span className="text-sm text-indigo-400 ml-1">Questions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-semibold text-gray-300 mb-4">Difficulty Level</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  id={`difficulty-${opt.value}`}
                  onClick={() => setConfig({ ...config, difficulty: opt.value })}
                  className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                    config.difficulty === opt.value
                      ? opt.color + ' scale-[1.02] shadow-lg'
                      : 'border-white/[0.06] bg-white/[0.02] text-gray-500 hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                  disabled={isGenerating}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-xs mt-1 opacity-75">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent my-2"></div>

          <button
            id="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-gray-300 font-medium">Enable Timer</span>
                  <span className="text-xs text-gray-600">(per question)</span>
                </div>
                <button
                  id="toggle-timer"
                  onClick={() => setConfig({ ...config, enableTimer: !config.enableTimer })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    config.enableTimer ? 'bg-indigo-500' : 'bg-white/[0.1]'
                  }`}
                  aria-checked={config.enableTimer}
                  role="switch"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                      config.enableTimer ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {config.enableTimer && (
                <div className="animate-fade-in-up">
                  <label htmlFor="time-limit" className="block text-sm text-gray-400 mb-2">
                    Time per question:{' '}
                    <span className="text-indigo-400 font-semibold">{config.timeLimitSeconds}s</span>
                  </label>
                  <input
                    id="time-limit"
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={config.timeLimitSeconds}
                    onChange={(e) =>
                      setConfig({ ...config, timeLimitSeconds: Number(e.target.value) })
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((config.timeLimitSeconds - 10) / 110) * 100}%, rgba(255,255,255,0.1) ${((config.timeLimitSeconds - 10) / 110) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <div className="pt-4">
          <button
            id="generate-quiz-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !config.topic.trim()}
            className="w-full relative flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-white btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Generate Quiz with AI
                </>
              )}
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
