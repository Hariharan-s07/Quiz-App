'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  History, Search, Filter, SortAsc, SortDesc,
  Trash2, RotateCcw, Trophy, Clock, BookOpen, ChevronRight, X,
} from 'lucide-react';
import { useHistoryStore } from '@/store/historyStore';
import { useQuizStore } from '@/store/quizStore';
import { formatDate, formatTime, getDifficultyBg, getScoreColor } from '@/lib/utils';

export default function QuizHistory() {
  const router = useRouter();
  const { getFilteredEntries, filters, setFilters, removeEntry, clearHistory } = useHistoryStore();
  const { startSession } = useQuizStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const entries = getFilteredEntries();

  const handleRetake = (entryId: string) => {
    const entry = useHistoryStore.getState().entries.find((e) => e.id === entryId);
    if (!entry) return;
    startSession(
      {
        topic: entry.topic,
        numQuestions: entry.numQuestions,
        difficulty: entry.difficulty,
        enableTimer: false,
        timeLimitSeconds: 30,
      },
      entry.questions
    );
    router.push('/quiz');
  };

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="w-full max-w-4xl px-4 sm:px-6 py-8 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Quiz History</h1>
            <p className="text-sm text-gray-500">{entries.length} attempt{entries.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {entries.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Are you sure?</span>
              <button
                id="confirm-clear-history"
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all"
              >
                Yes, clear all
              </button>
              <button
                id="cancel-clear-history"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 text-xs rounded-lg btn-ghost text-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              id="clear-history-btn"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl btn-ghost text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              id="history-search"
              type="text"
              placeholder="Search by topic..."
              value={filters.topic}
              onChange={(e) => setFilters({ topic: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            {filters.topic && (
              <button
                onClick={() => setFilters({ topic: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <select
              id="difficulty-filter"
              value={filters.difficulty}
              onChange={(e) => setFilters({ difficulty: e.target.value })}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer transition-all"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <button
              id="sort-order-toggle"
              onClick={() =>
                setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
              }
              className="p-2.5 rounded-xl btn-ghost text-gray-400"
              title="Toggle sort order"
            >
              {filters.sortOrder === 'desc' ? (
                <SortDesc className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
            </button>
            <select
              id="sort-field-select"
              value={filters.sortField}
              onChange={(e) =>
                setFilters({ sortField: e.target.value as 'completedAt' | 'percentage' | 'topic' })
              }
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer transition-all"
            >
              <option value="completedAt">Date</option>
              <option value="percentage">Score</option>
              <option value="topic">Topic</option>
            </select>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex items-center justify-center">
          <div className="glass-card rounded-2xl p-16 border border-white/[0.06] text-center max-w-md">
          <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No quizzes yet</h3>
          <p className="text-sm text-gray-600">
            Complete a quiz to see your history here.
          </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="glass-card rounded-2xl p-5 border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Score circle */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06]`}>
                  <span className={`text-lg font-black ${getScoreColor(entry.percentage)}`}>
                    {entry.percentage}
                  </span>
                  <span className="text-xs text-gray-600">%</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white truncate capitalize">{entry.topic}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyBg(entry.difficulty)}`}>
                      {entry.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      {entry.score}/{entry.numQuestions} correct
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(entry.totalTimeSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {entry.numQuestions} questions
                    </span>
                    <span>{formatDate(entry.completedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    id={`retake-${entry.id}`}
                    onClick={() => handleRetake(entry.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg btn-ghost text-indigo-400 hover:bg-indigo-500/10"
                    title="Retake this quiz"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake
                  </button>
                  <button
                    id={`delete-${entry.id}`}
                    onClick={() => removeEntry(entry.id)}
                    className="p-1.5 rounded-lg btn-ghost text-gray-600 hover:text-rose-400 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
