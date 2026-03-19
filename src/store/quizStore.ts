import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  QuizSession,
  QuizConfig,
  QuizQuestion,
  UserAnswer,
  QuizStatus,
} from '@/types';

interface QuizState {
  session: QuizSession | null;
  startSession: (config: QuizConfig, questions: QuizQuestion[]) => void;
  resetSession: () => void;
  setStatus: (status: QuizStatus) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitAnswer: (answer: UserAnswer) => void;
  incrementTotalTime: (seconds: number) => void;
  completeQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      session: null,

      startSession: (config, questions) => {
        const session: QuizSession = {
          id: uuidv4(),
          config,
          questions,
          answers: {},
          currentQuestionIndex: 0,
          status: 'active',
          startedAt: Date.now(),
          totalTimeSeconds: 0,
        };
        set({ session });
      },

      resetSession: () => set({ session: null }),

      setStatus: (status) =>
        set((state) => {
          if (!state.session) return state;
          return { session: { ...state.session, status } };
        }),

      goToQuestion: (index) => {
        set((state) => {
          if (!state.session) return state;
          const bounded = Math.max(0, Math.min(index, state.session.questions.length - 1));
          return { session: { ...state.session, currentQuestionIndex: bounded } };
        });
      },

      nextQuestion: () => {
        const { session } = get();
        if (!session) return;
        const next = session.currentQuestionIndex + 1;
        if (next < session.questions.length) {
          set({ session: { ...session, currentQuestionIndex: next } });
        }
      },

      prevQuestion: () => {
        const { session } = get();
        if (!session) return;
        const prev = session.currentQuestionIndex - 1;
        if (prev >= 0) {
          set({ session: { ...session, currentQuestionIndex: prev } });
        }
      },

      submitAnswer: (answer) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              answers: {
                ...state.session.answers,
                [answer.questionId]: answer,
              },
            },
          };
        }),

      incrementTotalTime: (seconds) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              totalTimeSeconds: state.session.totalTimeSeconds + seconds,
            },
          };
        }),

      completeQuiz: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              status: 'completed',
              completedAt: Date.now(),
            },
          };
        }),
    }),
    {
      name: 'quiz-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
