'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  TrendingUp, Award, Flame, Target, BookOpen, BarChart3,
} from 'lucide-react';
import { useHistoryStore } from '@/store/historyStore';
import {
  calculateCategoryPerformance,
  getPerformanceTrends,
  computeStreak,
  getScoreColor,
} from '@/lib/utils';

export default function AnalyticsDashboard() {
  const { entries } = useHistoryStore();

  const trends = useMemo(() => getPerformanceTrends(entries), [entries]);
  const categories = useMemo(
    () =>
      calculateCategoryPerformance(entries)
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 8),
    [entries]
  );
  const streak = useMemo(() => computeStreak(entries), [entries]);

  const avgScore = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round(entries.reduce((s, e) => s + e.percentage, 0) / entries.length);
  }, [entries]);

  const bestScore = useMemo(
    () => (entries.length ? Math.max(...entries.map((e) => e.percentage)) : 0),
    [entries]
  );

  const totalQuestions = useMemo(
    () => entries.reduce((s, e) => s + e.numQuestions, 0),
    [entries]
  );

  if (!entries.length) {
    return (
      <div className="w-full flex justify-center min-h-screen">
        <div className="w-full max-w-4xl px-4 sm:px-6 py-8 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-16 border border-white/[0.06] text-center max-w-md">
            <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No analytics yet</h3>
            <p className="text-sm text-gray-600">
              Complete some quizzes to see your performance analytics here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-xl px-3 py-2 border border-white/[0.08] text-xs">
          <p className="text-gray-400">{label}</p>
          <p className="text-indigo-400 font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="w-full max-w-4xl px-4 sm:px-6 py-8 space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-gray-500">{entries.length} total attempts</p>
          </div>
        </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Best Score', value: `${bestScore}%`, icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Day Streak', value: streak, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Questions', value: totalQuestions, icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card rounded-2xl p-5 border ${stat.bg}`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <div className={`text-3xl font-black ${stat.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Performance Trend */}
      {trends.length >= 2 && (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white">Performance Trend</h2>
            <span className="text-xs text-gray-600 ml-auto">Last {trends.length} quizzes</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#scoreGrad)"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                  activeDot={{ fill: '#a78bfa', r: 5 }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Performance */}
      {categories.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">Topic Performance</h2>
          </div>

          {categories.length >= 2 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="topic"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="glass-card rounded-xl px-3 py-2 border border-white/[0.08] text-xs">
                            <p className="text-white font-medium capitalize">{d.topic}</p>
                            <p className="text-indigo-400">Avg: {d.avgScore}%</p>
                            <p className="text-amber-400">Best: {d.bestScore}%</p>
                            <p className="text-gray-500">{d.attempts} attempt{d.attempts !== 1 ? 's' : ''}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                    {categories.map((_, index) => (
                      <Cell
                        key={index}
                        fill={`hsl(${240 + index * 20}, 70%, 60%)`}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.topic} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-400 capitalize truncate">{cat.topic}</span>
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${cat.avgScore}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${getScoreColor(cat.avgScore)}`}>
                    {cat.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Difficulty Breakdown */}
      <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
        <h2 className="font-semibold text-white mb-4">Difficulty Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {(['easy', 'medium', 'hard'] as const).map((diff) => {
            const diffEntries = entries.filter((e) => e.difficulty === diff);
            const avg = diffEntries.length
              ? Math.round(diffEntries.reduce((s, e) => s + e.percentage, 0) / diffEntries.length)
              : 0;
            const colors = {
              easy: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400',
              medium: 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400',
              hard: 'from-rose-500/20 to-red-500/20 border-rose-500/20 text-rose-400',
            };
            return (
              <div
                key={diff}
                className={`rounded-xl p-4 bg-gradient-to-br ${colors[diff]} border text-center`}
              >
                <div className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {diffEntries.length}
                </div>
                <div className="text-xs opacity-70 mt-0.5 capitalize">{diff}</div>
                {diffEntries.length > 0 && (
                  <div className="text-xs mt-1 opacity-80">avg {avg}%</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
