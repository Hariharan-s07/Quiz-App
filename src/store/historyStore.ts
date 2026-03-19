import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuizHistoryEntry } from '@/types';

type SortField = 'completedAt' | 'percentage' | 'topic';
type SortOrder = 'asc' | 'desc';

interface HistoryFilters {
  difficulty: string;
  topic: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

interface HistoryState {
  entries: QuizHistoryEntry[];
  filters: HistoryFilters;
  addEntry: (entry: QuizHistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  setFilters: (filters: Partial<HistoryFilters>) => void;
  getFilteredEntries: () => QuizHistoryEntry[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      filters: {
        difficulty: 'all',
        topic: '',
        sortField: 'completedAt',
        sortOrder: 'desc',
      },

      addEntry: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries],
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      clearHistory: () => set({ entries: [] }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      getFilteredEntries: () => {
        const { entries, filters } = get();
        let filtered = [...entries];

        if (filters.difficulty !== 'all') {
          filtered = filtered.filter((e) => e.difficulty === filters.difficulty);
        }

        if (filters.topic.trim()) {
          const topicLower = filters.topic.toLowerCase();
          filtered = filtered.filter((e) =>
            e.topic.toLowerCase().includes(topicLower)
          );
        }

        filtered.sort((a, b) => {
          let comparison = 0;
          if (filters.sortField === 'completedAt') {
            comparison = a.completedAt - b.completedAt;
          } else if (filters.sortField === 'percentage') {
            comparison = a.percentage - b.percentage;
          } else if (filters.sortField === 'topic') {
            comparison = a.topic.localeCompare(b.topic);
          }
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
      },
    }),
    {
      name: 'quiz-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
