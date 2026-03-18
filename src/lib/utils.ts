import type { QuizHistoryEntry, CategoryPerformance, PerformanceTrend } from '@/types';
import { format } from 'date-fns';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'hard': return 'text-rose-400';
    default: return 'text-gray-400';
  }
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'hard': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-emerald-400';
  if (percentage >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

export function getScoreGradient(percentage: number): string {
  if (percentage >= 80) return 'from-emerald-500 to-teal-500';
  if (percentage >= 60) return 'from-amber-500 to-orange-500';
  return 'from-rose-500 to-red-500';
}

export function calculateCategoryPerformance(
  entries: QuizHistoryEntry[]
): CategoryPerformance[] {
  const map = new Map<string, { total: number; count: number; best: number }>();

  for (const entry of entries) {
    const key = entry.topic.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.total += entry.percentage;
      existing.count += 1;
      existing.best = Math.max(existing.best, entry.percentage);
    } else {
      map.set(key, {
        total: entry.percentage,
        count: 1,
        best: entry.percentage,
      });
    }
  }

  return Array.from(map.entries()).map(([topic, data]) => ({
    topic,
    attempts: data.count,
    avgScore: Math.round(data.total / data.count),
    bestScore: data.best,
  }));
}

export function getPerformanceTrends(
  entries: QuizHistoryEntry[]
): PerformanceTrend[] {
  return [...entries]
    .sort((a, b) => a.completedAt - b.completedAt)
    .slice(-20) // last 20 attempts
    .map((entry) => ({
      date: format(new Date(entry.completedAt), 'MM/dd'),
      score: entry.percentage,
      topic: entry.topic,
    }));
}

export function computeStreak(entries: QuizHistoryEntry[]): number {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a, b) => b.completedAt - a.completedAt);
  let streak = 0;
  let lastDate = new Date();
  lastDate.setHours(0, 0, 0, 0);

  for (const entry of sorted) {
    const entryDate = new Date(entry.completedAt);
    entryDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 1) {
      streak++;
      lastDate = entryDate;
    } else {
      break;
    }
  }
  return streak;
}
